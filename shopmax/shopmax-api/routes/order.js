const express = require('express')
const router = express.Router()
const { sequelize } = require('../models')
const { Order, Item, User, OrderItem, Img } = require('../models')
const { isLoggedIn, verifyToken } = require('./middlewares')
const { Op } = require('sequelize')

// 주문 localhost:8000/order
router.post('/', verifyToken, isLoggedIn, async (req, res) => {
   /* ★트랜잭션 처리: 주문 처리 중 에러 발생시 차감된 재고를 복구하지 않으면 데이터가 
     불일치 상태가 되므로 트랜잭션 처리 
 
      <아래 3가지가 쪼갤 수 없는 업무 단위인 트랜잭션으로 묶임, 3가지 중 하나에서 문제 발생시 3가지 모두 취소됨>
      -Order 테이블에 주문내역 insert
      -Item 테이블에서 재고 차감
      -OrdertItem 테이블에 주문상품 insert
     */
   const transaction = await sequelize.transaction() // 하나의 트랜잭션

   try {
      // 주문 상품 목록 데이터
      // req.body = { items: [{itemId: 1, count: 2 }, {itemId: 2, count: 1 }] }
      const { items } = req.body

      // 회원 확인(주문은 회원만 가능)
      const user = await User.findByPk(req.user.id)
      if (!user) {
         throw new Error('회원이 존재하지 않습니다.')
      }

      // Order 테이블에 주문내역 insert
      const order = await Order.create(
         {
            userId: user.id,
            orderDate: new Date(),
            orderStatus: 'ORDER',
         },
         { transaction } // 하나의 트랜잭션으로 묶을 작업에만 { transaction } 작성
      )

      // Item 테이블에서 재고 차감

      let totalOrderPrice = 0 // 총 주문 상품 가격

      /*
       Promise.all(...): 비동기 작업들을 병렬실행(여러작업을 동시 실행)을 통해 성능을 최적화 한다.
       
       각 비동기 작업 async (item) => { .. } 을 병렬로 실행한다.
       아래와 같이 for문을 이용해 처리하는 것은 성능상 효율적이지 X
       다만, 단순하게 findByPk만 한다면 아래와 같이 처리해도 괜찮음
       하지만 상품확인, 재고차감, 재고 update 와 같은 여러가지 일을 처리할 경우
       비동기 + 병렬 처리 방식을 추천

       for(const item of items) {
           const product = await Item.findByPk(item.itemId, { transaction })
           ...
           ...
       }
      */
      const orderItemsData = await Promise.all(
         // items: [{itemId: 1, count: 2 }, {itemId: 2, count: 1 }]
         items.map(async (item) => {
            //1. 주문한 상품이 있는지 확인
            const product = await Item.findByPk(item.itemId, { transaction })

            if (!product) {
               throw new Error(`상품 id ${item.itemId}에 해당하는 상품이 존재하지 않습니다.`)
            }

            // 주문한 상품의 재고가 있는지 확인
            if (product.stockNumber < item.count) {
               throw new Error(`상품 id ${item.itemId}에 해당하는 상품의 재고가 부족합니다.`)
            }

            //2. 재고 차감
            product.stockNumber -= item.count

            //3. 재고 차감 후 item 테이블에 update
            await product.save({ transaction })

            // 총 주문 상품 가격 누적 합산
            const orderItemPrice = product.price * item.count
            totalOrderPrice += orderItemPrice

            //orderItems 테이블에 insert 해줄 값을 return
            return {
               orderId: order.id,
               itemId: product.id,
               orderPrice: orderItemPrice,
               count: item.count,
            }
         })
      )

      // OrdertItem 테이블에 주문상품 insert
      await OrderItem.bulkCreate(orderItemsData, { transaction })

      // 트랜잭션 커밋
      await transaction.commit()

      res.status(201).json({
         success: true,
         message: '주문이 성공적으로 생성되었습니다.',
         orderId: order.id, // 주문 id
         totalPrice: totalOrderPrice, //총 주문 상품 금액
      })
   } catch (error) {
      await transaction.rollback() // 트랜잭션 롤백

      console.error(error)
      res.status(500).json({ success: false, message: '주문 중 오류가 발생했습니다.', error })
   }
})

// 주문 목록(페이징)
// localhost:8000/order/list?page=1&limit=5&startDate=2025-01-01&endDate=2025-01-16
router.get('/list', verifyToken, isLoggedIn, async (req, res) => {
   try {
      const page = parseInt(req.query.page, 10) || 1
      const limit = parseInt(req.query.limit, 10) || 5
      const offset = (page - 1) * limit
      const startDate = req.query.startDate // YYYY-MM-DD 00:00:00
      const endDate = req.query.endDate
      const endDateTime = `${endDate} 23:59:59` // 년월일만 받을시 시분초는 00:00:00으로 인식하므로 시간 변경(endDate 날짜에 주문한 내용도 검색되도록)

      const count = await Order.count({
         where: {
            userId: req.user.id, //주문자 id
            ...(startDate && endDate ? { orderDate: { [Op.between]: [startDate, endDateTime] } } : {}), // 날짜 검색
         },
      })

      const orders = await Order.findAll({
         where: {
            userId: req.user.id, //주문자 id
            ...(startDate && endDate ? { orderDate: { [Op.between]: [startDate, endDateTime] } } : {}), // 날짜 검색
         },
         limit: parseInt(limit),
         offset: parseInt(offset),
         include: [
            {
               model: Item,
               attributes: ['id', 'itemNm', 'price'],
               // 교차테이블 데이터(OrderItem 테이블 에서 필요한 컬럼 선택)
               through: {
                  attributes: ['count', 'orderPrice'],
               },
               include: [
                  {
                     model: Img,
                     attributes: ['imgUrl'],
                     where: { repImgYn: 'Y' }, // 대표이미지만 가져온다
                  },
               ],
            },
         ],
         order: [['orderDate', 'DESC']], // 최근 주문내역이 먼저 오도록
      })

      res.json({
         success: true,
         message: '주문 목록 조회 성공',
         orders,
         pagination: {
            totalOrders: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit,
         },
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '주문 내역 조회 중 오류가 발생했습니다.', error })
   }
})

// 주문 취소 localhost:8000/order/cancel/:id
router.post('/cancel/:id', verifyToken, isLoggedIn, async (req, res) => {
   const transaction = await sequelize.transaction()

   try {
      const { id } = req.params

      const order = await Order.findByPk(id, {
         include: [
            {
               model: OrderItem,
               include: [{ model: Item }],
            },
         ],
         transaction, //트랜잭션 사용
      })

      // 주문내역이 없다면
      if (!order) {
         return res.status(404).json({
            success: false,
            message: '주문 내역이 존재하지 않습니다.',
         })
      }

      // 이미 취소된 주문이라면
      if (order.orderStatus === 'CANCEL') {
         return res.status(400).json({
            success: false,
            message: '이미 취소된 주문입니다.',
         })
      }

      // 재고복구
      for (const orderItem of order.OrderItems) {
         const product = orderItem.Item
         product.stockNumber += orderItem.count // 주문한 갯수 만큼 다시 재고에 더해줌
         await product.save({ transaction }) //트랜잭션 사용
      }

      //주문 상태 변경
      order.orderStatus = 'CANCEL'
      await order.save({ transaction }) //트랜잭션 사용

      await transaction.commit() //트랜잭션 커밋

      res.json({
         success: true,
         message: '주문이 성공적으로 취소되었습니다.',
      })
   } catch (error) {
      await transaction.rollback() //트랜잭션 롤백
      console.error(error)
      res.status(500).json({ success: false, message: '주문 취소 중 오류가 발생했습니다.', error })
   }
})

// 주문 삭제 localhost:8000/order/delete/:id
router.delete('/delete/:id', verifyToken, isLoggedIn, async (req, res) => {
   try {
      const { id } = req.params

      const order = await Order.findByPk(id)

      if (!order) {
         return res.status(404).json({
            success: false,
            message: '주문 내역이 존재하지 않습니다.',
         })
      }

      // 주문삭제(연관된 OrderItem도 삭제됨 - CASCADE 설정)
      await Order.destroy({ where: { id: order.id } })

      res.json({
         success: true,
         message: '주문 내역이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '주문 삭제 중 오류가 발생했습니다.', error })
   }
})

module.exports = router
