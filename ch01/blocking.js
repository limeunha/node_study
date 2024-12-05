// 블로킹 방식으로 작성한 코드
// 이전 작업이 끝나야 다음 작업을 수행

function longRunningTask() {
   //오래걸리는 작업...

   console.log('작업끝')
}

console.log('시작')
longRunningTask()
console.log('다음작업')
