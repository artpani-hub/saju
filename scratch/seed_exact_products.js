const { Client } = require('ssh2');
const fs = require('fs');

async function seedExactProducts() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Seeding exact products into remote DB Product table...');

  const script = `
    NODE_PATH=/home/www/saju-artpani/frontend/node_modules node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const items = [
        {
          name: '사주 체험판 리포트',
          reportType: 'free',
          price: 1000,
          discountPrice: 1000,
          description: '혜안당 사주 오행 핵심 분석 및 진단 체험판 리포트',
          pageCount: 7,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 1,
          isSale: true
        },
        {
          name: '평생 종합사주 - 문자메시지 요약',
          reportType: 'sms',
          price: 14900,
          discountPrice: 14900,
          description: '타고난 오행 분포, 대운의 흐름 핵심 요약 제공',
          pageCount: 37,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 2,
          isSale: true
        },
        {
          name: '평생 종합사주 - 고급 리포트',
          reportType: 'premium',
          price: 34900,
          discountPrice: 34900,
          description: '타고난 오행 분포, 10년 주기 대운, 솔루션 포함 종합 보고서',
          pageCount: 37,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 3,
          isSale: true
        },
        {
          name: '평생 종합사주 - 심화 리포트',
          reportType: 'deep',
          price: 49900,
          discountPrice: 49900,
          description: '종합사주 분석 + 2026 신년운세 상세 + 개인 질문 3가지 심화 답변',
          pageCount: 50,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 4,
          isSale: true
        },
        {
          name: '신년운세 - 문자메시지 요약',
          reportType: 'newyear_sms',
          price: 14900,
          discountPrice: 14900,
          description: '한 해의 전체적인 기운과 방향성 문자 요약',
          pageCount: 51,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 5,
          isSale: true
        },
        {
          name: '신년운세 - 고급 리포트',
          reportType: 'newyear_premium',
          price: 34900,
          discountPrice: 34900,
          description: '새해 한 해의 총체적인 흐름 및 월별 상세 운세 분석',
          pageCount: 51,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 6,
          isSale: true
        },
        {
          name: '신년운세 - 심화 리포트',
          reportType: 'newyear_deep',
          price: 49900,
          discountPrice: 49900,
          description: '신년운세 풀버전 + 토정비결 결합 + 질문 3가지 명쾌 솔루션',
          pageCount: 65,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 7,
          isSale: true
        },
        {
          name: '토정비결 - 고급 리포트',
          reportType: 'tojeong_premium',
          price: 34900,
          discountPrice: 34900,
          description: '토정 이지함 원본 해석에 따른 1년 신수비결과 생존 전략',
          pageCount: 30,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 8,
          isSale: true
        },
        {
          name: '연인 궁합 - 밀착 궁합',
          reportType: 'gunghap_deep',
          price: 26900,
          discountPrice: 26900,
          description: '정서적/밀착 궁합, 백년해로 타이밍 및 관계 유지 솔루션',
          pageCount: 35,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 9,
          isSale: true
        },
        {
          name: '재물 & 비즈니스운',
          reportType: 'wealth',
          price: 19900,
          discountPrice: 19900,
          description: '평생 재물 성향, 재물이 들어오는 시기 및 커리어/투자 제언',
          pageCount: 25,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 10,
          isSale: true
        },
        {
          name: '1:1 맞춤 타로 상담사',
          reportType: 'tarot',
          price: 9900,
          discountPrice: 9900,
          description: '선택하신 고민 분야를 중점으로 타로 카드가 제시하는 미래와 조언',
          pageCount: 15,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 11,
          isSale: true
        },
        {
          name: '오늘의 운세',
          reportType: 'today',
          price: 3900,
          discountPrice: 3900,
          description: '개인 인적사항을 정밀 분석하여 오늘의 운세 핵심 제공',
          pageCount: 5,
          toc: '{}',
          requiredInputs: '{}',
          estimatedTime: '즉시 생성',
          displayOrder: 12,
          isSale: true
        }
      ];

      async function seed() {
        for (const item of items) {
          const existing = await prisma.product.findFirst({
            where: { reportType: item.reportType }
          });
          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: item
            });
            console.log('Updated:', item.name);
          } else {
            await prisma.product.create({
              data: item
            });
            console.log('Created:', item.name);
          }
        }
        const finalCount = await prisma.product.count();
        console.log('FINAL SEEDED COUNT:', finalCount);
      }

      seed().finally(() => prisma.\\$disconnect());
    "
  `;

  const out = await execCmd(conn, script);
  console.log('SEED EXACT OUTPUT:\n', out);

  conn.end();
}

function execCmd(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', () => resolve(stdout + '\n' + stderr));
      stream.on('data', data => stdout += data.toString());
      stream.stderr.on('data', data => stderr += data.toString());
    });
  });
}

seedExactProducts().catch(err => console.error('ERROR:', err));
