//dep1에서는 dep2를 require한다
const dep2 = require('./dept2')
console.log('require dep2:', dep2)

function insideDept1() {
   console.log('require dep2:', dep2)
}

module.exports = insideDept1
