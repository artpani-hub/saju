const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialProducts = [
  // 1. 평생 종합사주
  {
    key: "saju_sms",
    name: "평생 종합사주 - 문자메시지 요약",
    category: "사주팔자",
    badge: "37페이지 이상 PDF",
    tag: "기본",
    reportType: "sms",
    price: 14900,
    originalPrice: 35000,
    description: "타고난 오행 분포, 대운의 흐름 핵심 요약 제공",
    parentKey: "saju",
    displayOrder: 1,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "saju_premium",
    name: "평생 종합사주 - 고급 리포트",
    category: "사주팔자",
    badge: "37페이지 이상 PDF",
    tag: "추천",
    reportType: "premium",
    price: 34900,
    originalPrice: 55000,
    description: "타고난 오행 분포, 10년 주기 대운, 솔루션 포함 종합 보고서",
    parentKey: "saju",
    displayOrder: 2,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "saju_deep",
    name: "평생 종합사주 - 심화 리포트",
    category: "사주팔자",
    badge: "37페이지 이상 PDF",
    tag: "인기",
    reportType: "deep",
    price: 49900,
    originalPrice: 70000,
    description: "종합사주 분석 + 2026 신년운세 상세 + 개인 질문 3가지 심화 답변",
    parentKey: "saju",
    displayOrder: 3,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 2. 신년운세
  {
    key: "newyear_sms",
    name: "신년운세 - 문자메시지 요약",
    category: "신년운세",
    badge: "51페이지 이상 PDF",
    tag: "기본",
    reportType: "sms",
    price: 14900,
    originalPrice: 40000,
    description: "한 해의 전체적인 기운과 방향성 문자 요약",
    parentKey: "newyear",
    displayOrder: 4,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "newyear_premium",
    name: "신년운세 - 고급 리포트",
    category: "신년운세",
    badge: "51페이지 이상 PDF",
    tag: "추천",
    reportType: "premium",
    price: 34900,
    originalPrice: 55000,
    description: "새해 한 해의 총체적인 흐름 및 월별 상세 운세 분석",
    parentKey: "newyear",
    displayOrder: 5,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "newyear_deep",
    name: "신년운세 - 심화 리포트",
    category: "신년운세",
    badge: "51페이지 이상 PDF",
    tag: "인기",
    reportType: "deep",
    price: 49900,
    originalPrice: 70000,
    description: "신년운세 풀버전 + 토정비결 결합 + 질문 3가지 명쾌 솔루션",
    parentKey: "newyear",
    displayOrder: 6,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 3. 토정비결
  {
    key: "tojeong_sms",
    name: "토정비결 - 문자메시지 요약",
    category: "토정비결",
    badge: "30페이지 이상 PDF",
    tag: "기본",
    reportType: "sms",
    price: 14900,
    originalPrice: 25000,
    description: "조선 정통 토정 이지함의 신수비결 핵심 요약",
    parentKey: "tojeong",
    displayOrder: 7,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "tojeong_premium",
    name: "토정비결 - 고급 리포트",
    category: "토정비결",
    badge: "30페이지 이상 PDF",
    tag: "추천",
    reportType: "premium",
    price: 34900,
    originalPrice: 36000,
    description: "토정 이지함 원본 해석에 따른 1년 신수비결과 생존 전략",
    parentKey: "tojeong",
    displayOrder: 8,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 4. 연인 궁합
  {
    key: "gunghap_basic",
    name: "연인 궁합 - 기본 궁합",
    category: "연인 궁합",
    badge: "인기 상승",
    tag: "기본",
    reportType: "basic",
    price: 26900,
    originalPrice: 45000,
    description: "두 사람의 오행 분포 및 기본 관계 조화도",
    parentKey: "gunghap",
    displayOrder: 9,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "gunghap_deep",
    name: "연인 궁합 - 밀착 궁합",
    category: "연인 궁합",
    badge: "인기 상승",
    tag: "인기",
    reportType: "deep",
    price: 26900,
    originalPrice: 55000,
    description: "정서적/밀착 궁합, 백년해로 타이밍 및 관계 유지 솔루션",
    parentKey: "gunghap",
    displayOrder: 10,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },
  {
    key: "gunghap_reunion",
    name: "연인 궁합 - 재회운",
    category: "연인 궁합",
    badge: "인기 상승",
    tag: "재회",
    reportType: "reunion",
    price: 19900,
    originalPrice: 30000,
    description: "헤어진 연인과의 재회 가능성 및 최적의 연락 시기 분석",
    parentKey: "gunghap",
    displayOrder: 11,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 5. 재물 & 비즈니스운
  {
    key: "wealth",
    name: "재물 & 비즈니스운",
    category: "비즈니스",
    badge: "비즈니스",
    tag: "34% 할인",
    reportType: "standard",
    price: 19900,
    originalPrice: 30000,
    description: "평생 재물 성향, 재물이 들어오는 시기 및 커리어/투자 제언",
    parentKey: "wealth",
    displayOrder: 12,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 6. 1:1 맞춤 타로 상담사
  {
    key: "tarot",
    name: "1:1 맞춤 타로 상담사",
    category: "타로 상담",
    badge: "타로 상담",
    tag: "특별가",
    reportType: "standard",
    price: 9900,
    originalPrice: 30000,
    description: "선택하신 고민 분야를 중점으로 타로 카드가 제시하는 미래와 조언",
    parentKey: "tarot",
    displayOrder: 13,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 7. 꿈해몽 & 사주 조율
  {
    key: "dream",
    name: "꿈해몽 & 사주 조율",
    category: "꿈해몽",
    badge: "신규",
    tag: "67% 할인",
    reportType: "standard",
    price: 9900,
    originalPrice: 30000,
    description: "꿈의 길흉 해몽과 사주 오행의 동조 현상 분석",
    parentKey: "dream",
    displayOrder: 14,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 8. 나만의 맞춤 운세 / 오늘의 운세
  {
    key: "today",
    name: "나만의 맞춤 운세",
    category: "오늘의 운세",
    badge: "맞춤 운세",
    tag: "인기",
    reportType: "standard",
    price: 3900,
    originalPrice: 5000,
    description: "개인 인적사항을 정밀 분석하여 오늘의 운세 핵심을 문자로 즉시 발송",
    parentKey: "today",
    displayOrder: 15,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  },

  // 9. 체험판 이벤트 상품
  {
    key: "free_sample",
    name: "사주 체험판 리포트",
    category: "체험판",
    badge: "체험 혜택",
    tag: "인기 체험",
    reportType: "free",
    price: 1000,
    originalPrice: 15000,
    description: "혜안당 사주 오행 핵심 분석 및 진단 체험판 리포트",
    parentKey: "free",
    displayOrder: 16,
    toc: "{}",
    requiredInputs: "{}",
    estimatedTime: "즉시 생성"
  }
];

async function seedProducts() {
  console.log("Seeding products into Database...");
  for (const item of initialProducts) {
    const existing = await prisma.product.findFirst({
      where: { key: item.key }
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          category: item.category,
          badge: item.badge,
          tag: item.tag,
          reportType: item.reportType,
          price: item.price,
          originalPrice: item.originalPrice,
          description: item.description,
          parentKey: item.parentKey,
          displayOrder: item.displayOrder,
        }
      });
    } else {
      await prisma.product.create({
        data: item
      });
    }
  }
  console.log("Successfully seeded", initialProducts.length, "products.");
}

seedProducts()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
