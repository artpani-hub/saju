const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '../src/app/result/page.js');
let code = fs.readFileSync(targetFilePath, 'utf8');

// 개행 문자 일치화 (\r\n -> \n)
code = code.replace(/\r\n/g, '\n');

// 1. getNewYearPagesConfiguration 함수 목차 동적화
const oldConfigStart = `  const getNewYearPagesConfiguration = (name, partnerName) => {
    return [
      { page: 1, type: "ny_cover", title: "2026년 병오년(丙午年) 혜안당 정통 신수비결 표지" },`;

const newConfigStart = `  const getNewYearPagesConfiguration = (name, partnerName) => {
    const isTojeong = typeParam === "tojeong";
    const suffix = isTojeong ? "토정비결" : "신수비결";
    return [
      { page: 1, type: "ny_cover", title: \`2026년 병오년(丙午年) 혜안당 정통 \${suffix} 표지\` },`;

if (code.includes(oldConfigStart)) {
  code = code.replace(oldConfigStart, newConfigStart);
} else {
  console.log('Warning: oldConfigStart match not found');
}

// 1-2. 음력 월별 신수비결 -> 상세 토정비결/신수비결 치환 (1월 ~ 12월)
for (let i = 1; i <= 12; i++) {
  const oldTitle = `title: "음력 ${i}월 상세 신수비결"`;
  const newTitle = `title: \`음력 ${i}월 상세 \${suffix}\``;
  if (code.includes(oldTitle)) {
    code = code.replace(oldTitle, newTitle);
  }
}

// 2. ny_cover 표지 타이틀 분기 처리
const oldCoverTitle = `              <h1 className="font-myeongjo text-3xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-widest leading-normal">
                2026 丙午年<br />
                정통 신수비결 (新年運勢)
              </h1>
              <p className="text-sm text-[#5F5F5F] font-light tracking-wide font-traditional">
                천지합화(天地合火)의 기운을 다스리는 인생 지침 보감
              </p>`;

const newCoverTitle = `              <h1 className="font-myeongjo text-3xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-widest leading-normal">
                2026 丙午年<br />
                {typeParam === "tojeong" ? "정통 토정비결 (土亭秘訣)" : "정통 신수비결 (新年運勢)"}
              </h1>
              <p className="text-sm text-[#5F5F5F] font-light tracking-wide font-traditional">
                {typeParam === "tojeong" ? "조선 정통 이지함의 비결로 풀어보는 한 해의 지침" : "천지합화(天地合火)의 기운을 다스리는 인생 지침 보감"}
              </p>`;

if (code.includes(oldCoverTitle)) {
  code = code.replace(oldCoverTitle, newCoverTitle);
} else {
  console.log('Warning: oldCoverTitle match not found');
}

// 3. ny_preface 명리 서막 내 상품명 분기 처리
const oldPrefaceText = `본 혜안당 정통 신수비결은 2026년 병오년(丙午年)에`;
const newPrefaceText = `본 혜안당 정통 {typeParam === "tojeong" ? "토정비결" : "신수비결"}은 2026년 병오년(丙午年)에`;
if (code.includes(oldPrefaceText)) {
  code = code.replace(oldPrefaceText, newPrefaceText);
}

// 4. 하단 푸터 텍스트 분기 처리
const oldFooterText = `              <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 신수비결</span>`;
const newFooterText = `              <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 {typeParam === "tojeong" ? "토정비결" : "신수비결"}</span>`;
if (code.includes(oldFooterText)) {
  code = code.replace(oldFooterText, newFooterText);
}

// 5. 유료 잠금 결제 배너 텍스트 분기 처리
const oldBannerTitle = `              <h4 className="font-myeongjo text-xl font-bold text-white mb-6">
                {name}님 신수비결엔 <span className="text-[#A3845B]">8가지 심화 분석</span>이 잠겨 있습니다.
              </h4>`;

const newBannerTitle = `              <h4 className="font-myeongjo text-xl font-bold text-white mb-6">
                {name}님 {typeParam === "tojeong" ? "토정비결" : "신수비결"}엔 <span className="text-[#A3845B]">8가지 심화 분석</span>이 잠겨 있습니다.
              </h4>`;

if (code.includes(oldBannerTitle)) {
  code = code.replace(oldBannerTitle, newBannerTitle);
} else {
  console.log('Warning: oldBannerTitle match not found');
}

// OS 환경에 맞춘 개운한 저장 (Windows는 CRLF 선호할 수 있으므로 되돌려도 되지만, Git이 자동 변환하거나 Next.js 빌드에는 LF/CRLF 관계 없음)
// 여기서는 다시 CRLF로 복원해서 쓰거나 그냥 LF로 써도 무방
fs.writeFileSync(targetFilePath, code, 'utf8');
console.log('Successfully updated tojeong/newyear labels in page.js!');
