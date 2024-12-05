const { copyFileSync } = require('fs')
const path = require('path')

const string = __filename //파일의 경로와 이름
console.log(string)

console.log('경로 정보 정리------------------------------------------')
console.log(path.sep) //경로의 구분자를 알려줌

console.log('경로 분석-----------------------------------------------')
console.log(path.dirname(string)) //폴더 경로
console.log(path.extname(string)) //파일의 확장자
console.log(path.basename(string)) //파일의 이름표시
console.log(path.basename(string, '.js')) //파일의 이름에서 확장자 제거

console.log('경로 조작------------------------------------------------')
console.log(path.parse(string)) //파일 경로 분리
console.log(
   path.format({
      //parse한 경로를 다시 합친다
   })
)
//슬래시나 역슬래시를 실수로 사용하거나 여러번 사용했을때 정상적인 결과를 줌
console.log(path.normalize('C://'))

console.log('경로 성격 확인--------------------------------------------')
//절대경로인지 상대경로인지 알려줌
console.log(path.isAbsolute('C:\\'))
console.log(path.isAbsolute('./home'))

console.log('경로 계산-------------------------------------------------')
console.log(path.relative('C:\\users\\zerocho\\path.js', 'C:\\')) //경로 두개 중 첫번째 경로에서 두번째 경로로 가는 법을 알려줌
console.log(path.join('C:project/node', '/users', '/ezen'))
