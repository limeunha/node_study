import './styles/common.css'
import { Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkAuthStatusThunk } from './features/authSlice'
import { useEffect } from 'react'

import Navbar from './components/shared/Navbar'
import Footer from './components/shared/Footer'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import Home from './pages/Home'

import RedirectLoginRoute from './components/auth/RedirectLoginRoute'

function App() {
   const dispatch = useDispatch()
   const { isAuthenticated, user } = useSelector((state) => state.auth) //로그인 상태, 로그인 한 사용자 정보

   //새로고침시 redux state가 초기화 되거나 프로그램 실행 중 문제 발생 가능성이 있으므로 지속적인 로그인 상태 확인을 위해 사용
   useEffect(() => {
      dispatch(checkAuthStatusThunk())
   }, [dispatch])

   return (
      <>
         <Navbar isAuthenticated={isAuthenticated} user={user} />
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
               path="/login"
               element={
                  // 로그인 상태일때는 home으로 리다이렉트
                  <RedirectLoginRoute>
                     <LoginPage />
                  </RedirectLoginRoute>
               }
            />
         </Routes>
         <Footer />
      </>
   )
}

export default App
