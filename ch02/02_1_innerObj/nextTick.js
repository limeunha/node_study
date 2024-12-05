setImmediate(() => {
   console.log('immediate')
})

Process.nextTick(() => {
   console.log('nextTick')
})

setTimeout(() => {
   console.log('timeout')
}, 0)

Promise.resolve().then(() => console.log('promise'))

//process.nextTick은 setTimeout이나 setImmediate나 보다 먼저 실행된다
//Promise 객체는 비동기이고 setTimeout이나 setImmediate 보다 먼저 실행된다
