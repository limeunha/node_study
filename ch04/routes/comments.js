const express = require('express')
const { Comment } = require('../models')

const router = express.Router()
//localhost:8000/comments/:id
// 새로운 댓글 생성
router.post('/', async (req, res, next) => {
   try {
      const comment = await Comment.create({
         commenter: req.body.id, // 댓글 작성자 ID
         comment: req.body.comment, // 댓글 내용
      })
      console.log(comment)
      res.status(201).json(comment)
   } catch (err) {
      console.error(err)
      next(err)
   }
})

// localhost:8000/comments/1
// 댓글수정
router
   .route('/:id')

   .patch(async (req, res, next) => {
      try {
         const result = await Comment.update(
            {
               comment: req.body.comment, // 수정할 댓글 내용
            },
            {
               where: { id: req.params.id }, // 수정할 댓글의 ID
            }
         )
         if (result[0] === 0) {
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' })
         }
         res.json({ message: '댓글이 수정되었습니다.', result })
      } catch (err) {
         console.error(err)
         next(err)
      }
   })
   // localhost:8000/comments/1
   // 댓글 삭제
   .delete(async (req, res, next) => {
      try {
         const result = await Comment.destroy({
            where: { id: req.params.id },
         })
         if (result === 0) {
            // 삭제된 데이터가 없을 경우
            return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' })
         }
         res.json({ message: '댓글이 삭제되었습니다.', result })
      } catch (err) {
         console.error(err) //
         next(err)
      }
   })

module.exports = router
