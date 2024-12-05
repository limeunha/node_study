// const timeout = setTimeout(() => {
//    console.log('1.5초후 실행')
// }, 1500)

// const interval = setInterval(() => {
//    console.log('1초 마다 실행')
// }, 1000)

// setTimeout(() => {
//    clearTimeout(timeout) //7초 뒤 중지
//    clearInterval(interval) //7초뒤 setInterval 중지
// }, 7000)

//setTimeout(함수, 0)보다 setImmediate이 먼저 실행되기는 하지만 항상 그렇지는 않으므로 두개를 같이 사용하기 권장하지 X
const immediate = setImmdiate(() => {
   console.log('즉시 실행')
})

const immediate2 = setImmdiate(() => {
   console.log('실행되지 않습니다')
})

clearImmediate(immediate2)
