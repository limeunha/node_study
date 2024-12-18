import { useParams } from 'react-router-dom'
import PostForm from '../components/post/PostForm'
import { Container } from '@mui/material'
import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPostByIdThunk } from '../features/postSlice'

const PostEditPage = () => {
   const { id } = useParams() //post의 id
   const dispatch = useDispatch()
   const { post, loading, error } = useSelector((state) => state.posts)

   // 게시물 데이터 불러오기
   useEffect(() => {
      dispatch(fetchPostByIdThunk(id))
   }, [dispatch, id])

   const handleSubmit = useCallback(() => {}, [])

   if (loading) return <p>로딩 중...</p>
   if (error) return <p>에러발생: {error}</p>

   return (
      <Container maxWidth="md">
         <h1>게시물 수정</h1>
         {post && <PostForm onSubmit={handleSubmit} initialValues={post} />}
      </Container>
   )
}

export default PostEditPage
