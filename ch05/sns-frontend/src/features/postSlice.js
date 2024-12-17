import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createPost, updatePost, deletePost, getPostById } from '../api/snsApi'

//게시물 등록 Thunk
export const createPostThunk = createAsyncThunk('posts/createPost', async (postData, { rejectedWithValue }) => {
   try {
      const response = await createPost(postData)
      return response.data.post
   } catch (error) {
      return rejectedWithValue(error.response?.data?.message || '게시물 등록 실패')
   }
})

//게시물 수정
export const updatePostThunk = createAsyncThunk('posts/updatePost', async (data, { rejectedWithValue }) => {})

//게시물 삭제
export const deletePostThunk = createAsyncThunk('posts/deletePost', async (id, { rejectedWithValue }) => {})

//특정 게시물 가져오기
export const fetchPostByIdThunk = createAsyncThunk('posts/fetchPostById', async (id, { rejectedWithValue }) => {})

const postSlice = createSlice({
   name: 'posts',
   initialState: {
      posts: [],
      post: null,
      Pagination: null,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      //게시물 등록
      builder
         .addCase(createPostThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createPostThunk.fulfilled, (state, action) => {
            state.loading = false
         })
         .addCase(createPostThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default postSlice.reducer
