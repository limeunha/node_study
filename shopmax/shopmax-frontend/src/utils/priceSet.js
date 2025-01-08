// 가격 콤마 추가
export const formatWithComma = (value) => {
   if (!value) return '' // 빈 값이면 빈 문자열 리턴

   // 콤마 제거 후 다시 콤마 추가
   //입력받은 숫자는 문자형이므로 반드시 숫자형으로 변경후 콤마 적용
   return Number(value.replace(/,/g, '')).toLocaleString('ko-KR') //10,000
}

// 가격 콤마 제거
export const stripComma = (value) => {
   return value.replace(/,/g, '') // 콤마 제거
}
