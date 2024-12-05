const fs = require('fs')

fs.writeFile('./writeme.txt', '글이 입력됩니다', (err) => {
   if (err) {
      throw err
   }
   console.log('파일 쓰기 완료')

   fs.readFile('./writeme.txt', (err, data) => {
      if (err) {
         throw err
      }
   })
})
