//dep2에서는 dep1를 require한다

const dep1 = require('./dept1')
console.log('require dep1:', dep1)

function insideDept2() {
   console.log('require dep1:', dep1)
}

module.exports = insideDept2
