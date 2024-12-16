const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Post, Hashtag, User } = require('../models')
const { isLoggedIn } = require('./middlewares')
const { where } = require('sequelize')
const router = express.Router()

//uploads 폴더가 없을 경우 새로 생성
try {
   fs.readdirSync('uploads') //해당 폴더가 있는지 확인
} catch (error) {
   console.log('uploads 폴더를 생성합니다.')
   fs.mkdirSync('uploads') //폴더 생성
}

//이미지 업로드를 위한 multer설정
const upload = multer({
   storage: multer.diskStorage({
      destination(req, file, cb) {
         cb(null, 'uploads/') //uploads폴더에 저장
      },

      filename(req, file, cb) {
         const ext = path.extname(file.originalname) //파일 확장자 추출

         //파일명 설정: 기존이름 + 업로드 날짜시간 + 확장자
         //dog.jpg
         //ex)dog + 123456789 +jpg
         cb(null, path.basename(file.originalname, ext) + Date.now() + ext)
      },
   }),
   //파일 크기 제한
   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB로 제한
})

//게시물 등록 localhost:8000/post
// <input type: "file" name:img>
router.post('/', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      console.log('파일정보:', req.file)
      if (!req.file) {
         //업로드된 파일이 없거나 무언가 이상이 생겨서 파일 정보가 넘어오지 않는 경우
         return res.status(400).json({ success: false, message: '파일 업로드에 실패했습니다.' })
      }

      //게시물 생성
      const post = await Post.create({
         content: req.body.content, //게시물 내용
         img: `/${req.file.filename}`, //이미지 url (파일명) => /dog123465464.jpg
         UserId: req.user.id, //작성자 id
      })

      //게시물 내용에서 해시태그 추출
      /*
       req.body.hashtags = '즐거운 #여행 #맛집'
       hastag:['즐거운 #여행 #맛집']
       */
      const hashtag = req.body.hashtags.match(/#[^\s#]*/g) //#을 기준으로 해시태그 추출

      //추출된 해시태그가 있으면
      if (hashtags) {
         //Promise.all : 여러개의 비동기 작업을 병렬로 처리. 모든 해시태그가 데이터 베이스에서 생성되거나 찾아질때까지 기다림
         //병렬 처리 : 동시에 여러개의 작업을 실행
         /*
            Hashtag.findOrCreate({ where: { title: '맛집' }})
            Hashtag.findOrCreate({ where: { title: '여행' }})


            findOrCreate : 비동기, Promise.all : 병렬처리
            두 작업이 비동기적으로  동시에 실행됨 -> 장점 : 속도가 빨라짐 
         */
         //findOrCreate : where 절에서 찾는 값이 존재하는지 확인하고 없으면 create
         const result = await Promise.all(
            hashtags.map((tag) =>
               Hashtag.findOrCreate({
                  where: { title: tag.slice(1) }, //#을 제외한 문자만
               })
            )
         )

         //posthashtag 관계 테이블에 연결 데이터 추가
         /*

         HashTagInstance1 = {
         id: 1,
         title : 여행,
         createAt: '2024-12-16T10:10:10',
         updateAt: '2024-12-16T10:10:10',
         }

         result = [
        [HashTagInstance1, true] :#여행 해시태그가 새로 생성됨(false 라면 이미 존재하는 해시태그)
        [HashTagInstance2, true] :#맛집 해시태기가 새로 생성됨
         ]
         
         r[0] =HashTagInstance1
         r[0] =HashTagInstance2
         */

         //addHashtags(): HashTagInstance를 통해 post와의 관계를 설정하고 이과정에서 posthashtag테이블의 postId와 hashtagId 컬럼에 값이 추가됨
         await post.addHashtags(result.map((r) => r[0]))
      }
      res.json({
         success: true,
         post: {
            id: post.id,
            content: post.content,
            img: post.img,
            UserId: post.UserId,
         },
         message: '게시물이 성공적으로 등록되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 등록 중 오류가 발생했습니다.', error })
   }
})

//게시물 수정 localhost:8000/post/:id
router.put('/:id', isLoggedIn, upload.single('img'), async (req, res) => {
   try {
      //게시물 존재 여부 확인
      //select * from posts where id = ? and UserId = ?
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.user.id } })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      //게시물 수정
      await post.update({
         content: req.body.content,
         img: req.file ? `/${req.file.filename}` : post.img, //수정된 이미지 파일이 있으면 교체 없으면 기존 값 유지
      })

      //게시물에서 해시태그를 추출해서 존재하는 해시태그는 유지하고 새로운 해시태그를 넣어준다
      const hashtag = req.body.hashtags.match(/#[^\s#]*/g) //#을 기준으로 해시태그 추출
      if (hashtags) {
         const result = await Promise.all(
            hashtags.map((tag) =>
               Hashtag.findOrCreate({
                  where: { title: tag.slice(1) }, //#을 제외한 문자만
               })
            )
         )
         await post.addHashtags(result.map((r) => r[0])) //기존 해시태그를 새 해시태그로 교체
      }
      //업데이트 된 게시물 다시 조회
      const updatedPost = await Post.findOne({
         where: { id: req.params.id },
         //user와 hashtags 테이블의 컬럼 값을 포함해서 가져옴
         include: [
            {
               model: User,
               attributes: ['id', 'nick'], //user테이블의 id, nick 컬럼 값만 가져옴
            },
            {
               model: Hashtag,
               attributes: ['title'], //hashtags 테이블의 title 컬럼 값만 가져옴
            },
         ],
      })

      res.json({
         success: true,
         post: updatedPost,
         message: '게시물이 성공적으로 수정되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 등록 중 오류가 발생했습니다.', error })
   }
})

//게시물 삭제 localhost:8000/post/:id
router.delete('/:id', isLoggedIn, async (req, res) => {
   try {
      //삭제할 게시물 존재 여부 확인
      const post = await Post.findOne({ where: { id: req.params.id, UserId: req.user.id } })
      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      //게시물 삭제
      await post.destroy()

      res.json({
         success: true,
         message: '게시물이 성공적으로 삭제되었습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물 삭제 중 오류가 발생했습니다.', error })
   }
})

//특정게시물 불러오기(id로 게시물 조회) localhost:8000/post/:id
router.get('/:id', async (req, res) => {
   try {
      const post = await Post.findOne({
         where: { id: req.params.id },
         include: [
            {
               model: User,
               attributes: ['id', 'nick'],
            },
            {
               model: Hashtag,
               attributes: ['title'],
            },
         ],
      })

      if (!post) {
         return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' })
      }

      res.json({
         success: true,
         post,
         message: '게시물을 성공적으로 불러왔습니다.',
      })
   } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: '게시물을 불러오는 중 오류가 발생했습니다.', error })
   }
})

//전체 게시물 불러오가(페이징 기능)  localhost:8000/post
router.get('/', async (req, res) => {})

module.exports = router
