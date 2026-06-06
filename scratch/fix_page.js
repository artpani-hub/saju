const fs = require('fs');

const filePath = 'd:/인터그리비티/saju/src/app/result/page.js';
const buffer = fs.readFileSync(filePath);

// 타겟 바이트 시퀀스 찾기: '{/* 중장년 대' + 0xec + '  '
// Hex: 7b 2f 2a 20 ec a4 91 ec 9e a5 eb 85 84 20 eb 8c 80 ec 20 20
const targetHex = '7b2f2a20eca491ec9ea5eb858420eb8c80ec2020';
const targetBuf = Buffer.from(targetHex, 'hex');

const index = buffer.indexOf(targetBuf);
if (index === -1) {
  console.error("Target byte sequence not found!");
  process.exit(1);
}

console.log(`Found target sequence at index ${index}`);

// 해당 부분을 공백들로 채우거나 (크기 유지), 또는 삭제하기
// 여기서는 크기가 20바이트이므로, 20개의 공백(0x20)으로 채운다.
// 이렇게 하면 파일 인덱스가 꼬이지 않고 안전하게 주석이 제거됨.
const newBuffer = Buffer.from(buffer);
for (let i = 0; i < targetBuf.length; i++) {
  newBuffer[index + i] = 0x20; // 공백 문자
}

fs.writeFileSync(filePath, newBuffer);
console.log("Successfully fixed the invalid bytes in page.js");
