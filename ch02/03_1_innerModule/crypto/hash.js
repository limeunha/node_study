//단방향 암호화 : 복호화 할수 x
const cryto = require('cryto')

console.log(crypto.createHash('sha512').update('비밀번호').digest('base64'))
console.log(crypto.createHash('sha512').update('비밀번호').digest('hex'))
console.log(crypto.createHash('sha512').update('다른 비밀번호').digest('base64'))
