import { odd, even } from './ment.mjs'

//짝수홀수 판단
function checkOddOrEven(num) {
   if (num % 2 === 0) {
      return even
   } else {
      return odd
   }
}

//함수를 모듈로 내보냄
export default checkOddOrEven
