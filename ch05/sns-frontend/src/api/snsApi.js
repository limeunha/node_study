import axios from 'axios'

const BASE_URL = process.env.REACT_APP_API_URL

//axios 인스턴스 생성
const snsApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true, // 세션 쿠키를 요청에 포함
})

//회원가입
export const registerUser = async (userData) => {
   try {
      // userData : 회원가입 창에서 입력한 데이터
      const response = await snsApi.post('/auth/join', userData)
      return response
   } catch (error) {
      console.error(`API Request 오류 : ${error.message}`)
      throw error //request 할때 오류 발생시 에러를 registerUser()함수를 실행한 곳으로 던짐
   }
}
