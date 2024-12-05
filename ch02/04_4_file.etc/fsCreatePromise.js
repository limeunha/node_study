const fs = require('fs').promises
const constants = require('fs').constants //constants:상수, 파일 시스템 관련 상수를 가져온다

//./folder에 대한 접근 권한 확인
//F_OK : 파일존재여부
//W_OK : 쓰기 권한 여부
//R_OK : 읽기 권한 여부
//권한이 없다면 에러 발생
fs.access('./folder', constants.F_OK | constants.W_OK | constants.R_OK)
   .then(() => {
      //폴더가 이미 있는 경우 에러 처리
      return promise.reject('이미 폴더 있음')
   })

   .catch((err) => {
      //폴더가 없는 경우
      if (err.code === 'ENOENT') {
         //폴더 생성
         console.log('폴더 없음')
         return fs.mkdir('./folder')
      }
      //다른 에러는 그대로 전달
      return promise.reject(err)
   })

   .then(() => {
      //폴더 생성이 성공했을때
      console.log('폴더 만들기 성공')
      //file.js 파일 생성
      //두번째 인수 => w:쓰기모드, r:읽기모드, a:기존 파일에 추가
      return fs.open('./folder/file.js', 'w')
   })
   .then(() => {
      //파일 생성이 성공했을때
      console.log('빈 파일 만들기 성공', fd)
      //생성한 파일의 이름을 file.js -> newFile.js로 변경
      return fs.rename('./folder/file.js', './folder/newFile.js')
   })
   .then(() => {
      //파일 이름 바꾸기 성공했을떄
      console.log('이름 바꾸기 성공')
   })
   .catch((err) => {
      //모든 단계에서 발생한 에러처리
      console.error(err)
   })
