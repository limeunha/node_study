const express = require('express')
const path = require('path')
require('dotenv').config() // env파일을 사용하기 위한 라이브러리

const app = express()
app.set('port', process.env.PORT || 3000)

//4. body-paraser 미들웨어
// request 데이터를 json객체로 받아올 수 있게 해줌
app.use(express.json())
//form태그에서 입력한 데이터를 'name=하서&age=50'이런 형태로 인코딩해서 전송되게 해준다
app.use(express.urlencoded({ extended: true })) //URL-encoded 요청 처리

app.get('/', (req, res) => {
   //submit.html 페이지 response
   //D:\project\node_class\node_study\ch03\02_Middleware\submit.html
   res.sendFile(path.join(__dirname, '/submit.html'))
})

app.post('/submit', (req, res) => {
   //reques, response 할때는 header + body 형태로 데이터가 전송된다
   //header영역 : request, response 정보가 들어있음
   //body영역 : 데이터가 들어있음
   console.log(req.body) // form 태그에서 입력한 데이터가 들어있음
   res.send('데이터 수신 완료!')
})

app.listen(app.get('port'), () => {
   console.log('서버가 작동 중 입니다.')
})
