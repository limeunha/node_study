const express = require('express')
const path = require('path') // 경로 처리 유틸리티
const cookieParser = require('cookie-parser') // 쿠키 처리 미들웨어
const morgan = require('morgan') // HTTP 요청 로깅 미들웨어
const session = require('express-session') // 세션 관리 미들웨어
const passport = require('passport') // 인증 미들웨어
require('dotenv').config() // 환경 변수 관리
const cors = require('cors') // cors 미들웨어 -> ★api 서버는 반드시 설정해줘야 한다

// 라우터 및 기타 모듈 불러오기
const indexRouter = require('./routes')
const authRouter = require('./routes/auth')
const { sequelize } = require('./models')
const passportConfig = require('./passport') // passport 폴더에 index.js

const app = express()
passportConfig() //passport 실행
app.set('port', process.env.PORT || 8002)

// 시퀄라이즈를 사용한 DB연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log('데이터베이스 연결 성공') //연결 성공시
   })
   .catch((err) => {
      console.error(err) //연결 실패시 오류 출력
   })

//미들웨어 설정
app.use(
   cors({
      origin: 'http://localhost:3000', // 특정 주소만 request 허용
      credentials: true, // 쿠키, 세션 등 인증 정보 허용
   })
)
app.use(morgan('dev')) // HTTP 요청 로깅 (dev 모드)
app.use(express.static(path.join(__dirname, 'uploads'))) // 정적 파일 제공
app.use(express.json()) // JSON 데이터 파싱
app.use(express.urlencoded({ extended: false })) // URL-encoded 데이터 파싱
app.use(cookieParser(process.env.COOKIE_SECRET)) //쿠키 설정
//세션 설정
app.use(
   session({
      resave: false, //세션 데이터가 변경사항이 없어도 재저장 할지 여부 -> 변경사항이 있어야 재저장
      saveUninitialized: true, //초기화 되지 않은 세션 저장 여부 -> 초기화 되지 않은 빈 세션도 저장
      secret: process.env.COOKIE_SECRET, //세션 암호화 키
      cookie: {
         httpOnly: true, //javascript로 쿠키에 접근가능한지 여부 -> true 일경우 접근 X
         secure: false, //https를 사용할때만 쿠키 전송 여부 -> http, https 둘다 사용가능
      },
   })
)

//Passport 초기화, 세션 연동
app.use(passport.initialize()) //초기화
app.use(passport.session()) //Passport와 생성해둔 세션 연결

//라우터 등록
app.use('/', indexRouter)
app.use('/auth', authRouter)

//잘못된 라우터 경로 처리
app.use((req, res, next) => {
   const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`) //에러객체 생성
   error.status = 404 // 404 상태코드 설정
   next(error) //에러 미들웨어로 전달
})

//에러 미들웨어(미들웨어 실행 중 발생하는 에러를 처리함)
app.use((err, req, res, next) => {
   const statusCode = err.status || 500 // err.status가 있으면 err.status 저장 없으면 500
   const errorMessage = err.message || '서버 내부 오류'

   res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: err,
   })
})

app.options('*', cors()) // 모든 경로에 대한 options 요청을 허용
app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기중')
})