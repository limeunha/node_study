const fs = require('fs')

//파일에 데이터를 쓰기 위한 쓰기 스트림 생성
const writeStream = fs.createWriteStream('./writeme2.txt')

//'finish'이벤트 : 쓰기 스트림이 종료되었을때 콜백함수 실행
writeStream.on('finish', () => {
   console.log('파일 쓰기 완료')
})

writeStream.write('이 글을 씁니다.\n')
writeStream.write('한 번 더 씁니다.')

//스트림 종료(더 이상 쓸 데이터가 없음을 알림)
writeStream.end()
