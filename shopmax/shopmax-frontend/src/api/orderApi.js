import shopmaxApi from './axiosApi'

// 주문하기
export const createOrder = async (orderData) => {
   try {
      // orderData: 주문 상품 목록 데이터
      // orderData = { items: [{itemId: 1, count: 2 }, {itemId: 2, count: 1 }] }
      const response = await shopmaxApi.post('/order', orderData)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}

//주문목록
export const getOrders = async (data) => {
   try {
      const { page, limit, startDate, endDate } = data

      const response = await shopmaxApi.get(`/order/list?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error.message}`)
      throw error
   }
}
