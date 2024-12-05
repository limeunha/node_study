const express = require('express')
require('dotenv').config() // env파일을 사용하기위한 라이브러리 로드 (npm install env)

const app = express()
app.set('port', process.env.PORT || 3000) // 서버에 포트 지정(env파일에 PORT값이 없으면 3000번 포트 실행)

/* 
app.get()-> read 요청
app.post() -> create요청
app.delete()-> 삭제요청
app.put() -> 전체 수정 요청
app.patch() -> 일부 수정 요청
*/

// 클라이언트는 서버에게 읽을 데이터를 좀 줘
// localhost:8000으로 request가 온 경우 실행
app.get('/', (req, res) => {
   res.send('안녕! node!') // 클라이언트에게 응답을 보낸다
})

//localhost:8000/test 로 request가 온 경우 실행
app.get('/test', (req, res) => {
   res.send('안녕! test!') //클라이언트에게 응답을 보낸다
})

//서버를 동작시킴
app.listen(app.get('port'), () => {
   console.log(`서버가 작동 중 입니다. http://localhost:${app.get('port')}`)
})
