const express = require('express')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
app.set('port', process.env.PORT || 3000)

//2. 로깅 미들웨어 : 요청과 응답에 대한 로그(정보)를 기록
//순서 [HTTP 메서드] [주소] [HTTP상태코드] [응답속도] [응답 바이트]
app.use(morgan('dev'))

app.get('/', (req, res) => {
   res.send('홈페이지')
})

app.get('/about', (req, res) => {
   res.send('소개 페이지')
})

app.listen(app.get('port'), () => {
   console.log('서버가 작동 중 입니다.')
})