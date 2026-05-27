"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Award, CheckSquare, AlertCircle } from "lucide-react";

// Simplified dynamic Sexagenary Cycle helper based on user input
const getGanjiTable = (yearNum, monthNum, dayNum, hourString) => {
  const Stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const Branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const StemElements = {
    "甲": "목", "乙": "목",
    "丙": "화", "丁": "화",
    "戊": "토", "己": "토",
    "庚": "금", "辛": "금",
    "壬": "수", "癸": "수"
  };
  const BranchElements = {
    "寅": "목", "卯": "목",
    "巳": "화", "午": "화",
    "辰": "토", "戌": "토", "丑": "토", "未": "토",
    "申": "금", "酉": "금",
    "亥": "수", "子": "수"
  };

  const yIdx = Math.abs(yearNum - 4) % 60;
  const yStem = Stems[yIdx % 10];
  const yBranch = Branches[yIdx % 12];

  // Mock rotating formulas for month, day, hour to simulate dynamic authentic change
  const mIdx = Math.abs((monthNum || 1) + 2) % 60;
  const mStem = Stems[mIdx % 10];
  const mBranch = Branches[mIdx % 12];

  const dIdx = Math.abs((dayNum || 1) + 15) % 60;
  const dStem = Stems[dIdx % 10];
  const dBranch = Branches[dIdx % 12];

  // Hour mapping
  let hBranch = "子";
  let hStem = "甲";
  let hName = "자시";
  if (hourString) {
    const hourNum = parseInt(hourString.split(":")[0]) || 0;
    const bIdx = Math.floor(((hourNum + 1) % 24) / 2);
    hBranch = Branches[bIdx];
    hName = ["자시 (23-01시)", "축시 (01-03시)", "인시 (03-05시)", "묘시 (05-07시)", "진시 (07-09시)", "사시 (09-11시)", "오시 (11-13시)", "미시 (13-15시)", "신시 (15-17시)", "유시 (17-19시)", "술시 (19-21시)", "해시 (21-23시)"][bIdx];
    hStem = Stems[((dIdx % 5) * 2 + bIdx) % 10];
  }

  // Calculate five elements count
  const elements = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  const addEl = (char, mapping) => {
    const el = mapping[char];
    if (el) elements[el] = (elements[el] || 0) + 1;
  };

  addEl(yStem, StemElements);
  addEl(yBranch, BranchElements);
  addEl(mStem, StemElements);
  addEl(mBranch, BranchElements);
  addEl(dStem, StemElements);
  addEl(dBranch, BranchElements);
  addEl(hStem, StemElements);
  addEl(hBranch, BranchElements);

  return {
    year: { stem: yStem, branch: yBranch, stemEl: StemElements[yStem], branchEl: BranchElements[yBranch] },
    month: { stem: mStem, branch: mBranch, stemEl: StemElements[mStem], branchEl: BranchElements[mBranch] },
    day: { stem: dStem, branch: dBranch, stemEl: StemElements[dStem], branchEl: BranchElements[dBranch] },
    hour: { stem: hStem, branch: hBranch, stemEl: StemElements[hStem], branchEl: BranchElements[hBranch], name: hName },
    elements
  };
};

// Elements Prescription Database
const getDeficientPrescription = (elements) => {
  const prescriptions = {
    "목": {
      name: "목(木) - 푸른 생명의 나무",
      color: "초록색, 청색, 에메랄드 계열",
      direction: "동쪽 (숲길, 산림 지대)",
      number: "3, 8",
      items: "원목 소품, 허브/식물 화분, 캔버스화, 책",
      action: "아침 일찍 야외에서 가벼운 조깅이나 산책을 즐겨 대지의 푸른 에너지를 수혈받고, 침실이나 공부방의 동쪽에 녹색 식물 화분을 배치하십시오. 원목 가구나 목공예 장식품을 주변에 두면 정서적 안정감이 더해집니다."
    },
    "화": {
      name: "화(火) - 따뜻하고 역동적인 불꽃",
      color: "붉은색, 오렌지색, 핑크 계열",
      direction: "남쪽 (채광이 잘 드는 휴양지)",
      number: "2, 7",
      items: "향초, 스탠드 조명, 붉은색 장신구, 화사한 그림",
      action: "햇볕을 쬐며 산책하는 일광욕을 즐기고, 집안의 남쪽 창가를 항상 밝게 비춰 두십시오. 따뜻한 허브티를 자주 마시고, 타인과 적극적으로 대화하고 열정을 발산하는 모임 활동에 참여하는 것이 기운의 막힘을 풀어줍니다."
    },
    "토": {
      name: "토(土) - 포용하고 수확하는 황토 대지",
      color: "황토색, 샌드/베이지, 브라운, 놋쇠색",
      direction: "중앙 (평야, 넓은 마당)",
      number: "5, 10",
      items: "도자기 그릇, 돌/원석 장신구, 황토 찜질팩, 황동(놋그릇)",
      action: "흙길이나 잔디밭을 맨발로 밟는 어싱(Earthing) 요법이 최선의 보완책입니다. 플라스틱 접시 대신 도자기나 흙으로 구워낸 식기를 쓰고, 재물 관리에 있어서 급격한 투자보다 토지와 부동산 같은 안전 실물에 기인해야 흩어짐을 막을 수 있습니다."
    },
    "금": {
      name: "금(金) - 명확한 결단과 다부진 바위",
      color: "흰색, 은색, 메탈 실버 계열",
      direction: "서쪽 (암석 지대, 바위산)",
      number: "4, 9",
      items: "은 반지/금속 시계, 다이어리, 만년필, 백호 그림",
      action: "매일 아침 일정을 다이어리에 명확히 메모하고 거절해야 할 일은 단호하게 거절하는 훈련을 하십시오. 바위가 우거진 산으로 등산을 하거나 흰색 톤의 셔츠를 입고, 은 반지나 메탈 시계 같은 악세서리를 몸에 지니면 결단력을 보하는 데 큰 효험이 있습니다."
    },
    "수": {
      name: "수(水) - 깊은 통찰과 맑은 물줄기",
      color: "검은색, 차콜, 딥 블루 계열",
      direction: "북쪽 (강가, 바다, 온천)",
      number: "1, 6",
      items: "실내 미니 분수기, 어항, 가습기, 물병",
      action: "저녁에 가벼운 반신욕이나 따뜻한 물 족욕을 생활화하고 밤에는 완벽한 암막 커튼으로 침실을 어둡게 조성하여 숙면하십시오. 생각을 종이에 정리하는 일기를 쓰거나 흐르는 물 소리를 듣는 것이 내면의 불안감을 씻어줍니다."
    }
  };

  const minCount = Math.min(...Object.values(elements));
  const deficientList = Object.entries(elements)
    .filter(([_, count]) => count === minCount)
    .map(([el]) => el);

  return deficientList.slice(0, 2).map(el => prescriptions[el]);
};

function ResultContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const handleCopySms = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Parsing inputs
  const name = searchParams.get("name") || "이지혜";
  const gender = searchParams.get("gender") === "male" ? "남성" : "여성";
  const type = searchParams.get("type") || "saju"; // saju, newyear, wealth, tarot, gunghap
  const calendar = searchParams.get("calendar") || "solar";
  const year = parseInt(searchParams.get("year")) || 1995;
  const month = parseInt(searchParams.get("month")) || 8;
  const day = parseInt(searchParams.get("day")) || 25;
  const hour = searchParams.get("hour") || "10:00";
  const worryCategory = searchParams.get("worryCategory") || "general";
  const worryText = searchParams.get("worryText") || "";
  const reportGrade = searchParams.get("reportGrade") || "premium"; // premium(고급), deep(심화)

  // Partner parameters
  const partnerName = searchParams.get("partnerName") || "강민우";
  const partnerGender = searchParams.get("partnerGender") === "female" ? "여성" : "남성";
  const partnerCalendar = searchParams.get("partnerCalendar") || "solar";
  const partnerYear = parseInt(searchParams.get("partnerYear")) || 1993;
  const partnerMonth = parseInt(searchParams.get("partnerMonth")) || 11;
  const partnerDay = parseInt(searchParams.get("partnerDay")) || 12;
  const partnerHour = searchParams.get("partnerHour") || "unknown";

  // Dynamic Saju Calculation
  const sajuInfo = getGanjiTable(year, month, day, hour);
  const partnerSajuInfo = getGanjiTable(partnerYear, partnerMonth, partnerDay, partnerHour);
  const prescriptions = getDeficientPrescription(sajuInfo.elements);

  // Determine user's base element for 2026 compatibility
  const baseEl = sajuInfo.year.stemEl; // Representing birth year element

  const handlePrint = () => {
    window.print();
  };

  // Generate Personalized Worry Solution
  const getPersonalizedSolution = (name, text, category) => {
    if (!text || text.trim() === "") {
      return {
        analysis: `의뢰인 ${name}님의 사주 기질과 운세를 바탕으로 도출한 총론입니다. 귀하의 기운은 주체적이고 독립적인 성향이 돋보이며, 주변의 간섭에서 벗어나 스스로 삶을 주도하려는 에너지가 강하게 흐릅니다. 현재 삶의 전반적인 답답함은 기운이 팽창하면서 기존 환경과의 마찰을 빚고 있기 때문입니다.`,
        timing: `조급하게 답을 내리려 하기보다, 음력 8월(酉월) 이후 흩어진 토(土) 기운이 찾아와 현실적인 자리를 잡아줄 때 구체적인 선택을 하는 것이 길합니다.`,
        actionPlan: `1. 노란색이나 밝은 브라운 계열의 소품을 가까이 두어 부족한 안정을 도우십시오.\n2. 매사에 완벽을 추구하여 나를 혹사시키지 말고, 하루 20분 명상이나 가벼운 산책으로 생각을 비우십시오.\n3. 동쪽 방향과의 상성이 좋으니 답답할 땐 동쪽 교외로 나들이를 떠나보시길 권합니다.`
      };
    }

    const cleanedText = decodeURIComponent(text);
    const hasJob = /이직|회사|직장|퇴사|취업|시험|합격|일|업무|창업|보스|상사/.test(cleanedText);
    const hasLove = /남자|여자|남친|여친|결혼|연애|사랑|이혼|속마음|그 사람|헤어짐|이별/.test(cleanedText);
    const hasMoney = /돈|금전|투자|주식|코인|부동산|재물|사업|빚|대출/.test(cleanedText);

    let analysis = "";
    let timing = "";
    let actionPlan = "";

     if (category === "business") {
      analysis = `의뢰인 ${name}님의 사업체 운영 및 비즈니스 갈등 ["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 주체적으로 판을 깔고 나아가는 역량이 뛰어납니다. 하지만 올해 병오년은 사주 내 불(火) 에너지가 과도하게 치솟아 직원/동업자 간 불화나 계약 관계의 파기, 성급한 거래 확장으로 인한 현금 유동성 막힘이 오기 쉬운 환경입니다. 결정을 서두르지 말고 안전마진을 확보해야 합니다.`;
      timing = `새로운 비즈니스 제휴, 거래처 신설, 혹은 중요한 파트너십 구축은 하늘의 금(金) 기운이 맹렬한 불을 식혀주고 현실적인 계약운을 돕는 음력 8월(酉월) 및 9월(戌월)이 가장 길합니다.`;
      actionPlan = `1. 사업장 내 북쪽(水) 공간에 물이 잔잔하게 담긴 그릇이나 소형 가습기를 두어 타오르는 화기를 제어하십시오.\n2. 중요 미팅이나 프레젠테이션 시 검은색(水) 또는 네이비색 정장이나 소품을 매칭하여 신뢰도와 카리스마를 높이십시오.\n3. 동업이나 고용 계약서 작성 시 당일 도장을 찍지 말고 최소 48시간 피드백 검토 기간을 두는 사내 룰을 도입해 손재수를 차단하십시오.`;
    } else if (category === "startup") {
      analysis = `의뢰인 ${name}님의 신규 창업 및 부업 개시 안건 ["${cleanedText}"]에 대한 명리 솔루션입니다. 귀하의 타고난 명조는 자기 브랜드를 구축하고자 하는 욕구(식상생재)가 매우 발달해 있습니다. 다만, 아직 경험이 완전히 축적되지 않은 상태에서 대출 비중을 높여 무리하게 진입하면 초기 고정비 과부하로 인한 큰 손실 위험이 있습니다. 소자본 및 온라인 채널을 통한 린 스타트업(Lean Startup) 형태의 철저한 테스트가 우선입니다.`;
      timing = `실제 매장을 오픈하거나 정식 사업자 등록을 하기에 가장 좋은 절기적 타이밍은 차가운 기운이 안정적으로 스며들어 감정적 조급함을 제어해 주는 음력 10월(亥월) 이후입니다.`;
      actionPlan = `1. 초기에 매장 임차료나 인테리어 설비 같은 하드웨어 비용 투자를 최소화하고, 서비스/콘텐츠 등의 소프트웨어 위주로 시범 론칭하십시오.\n2. 노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용하여 신뢰와 중개력을 돕는 토의 기운을 보완하십시오.\n3. 창업 파트너나 조력자를 구할 때 사주 상 물(水)이나 금(金) 기운이 많고 냉철한 성품을 지닌 인물과 손잡을 때 내 부족한 추진력을 완벽히 비보해 줍니다.`;
    } else if (category === "trade") {
      analysis = `의뢰인 ${name}님의 장사 및 물류 유통 사업 ["${cleanedText}"]에 대한 역학 솔루션입니다. 장사와 유통은 고객과의 잦은 대면 소통과 끊임없는 유동성 관리가 본질입니다. 귀하의 사주는 대인 친화력이 뛰어나 단골 유치에는 유리하지만, 외상 거래나 인정에 끌린 무리한 어음/미수금 거래로 인해 현금이 묶여 고통받을 수 있는 약점이 있습니다. 철저한 선결제 시스템 구축과 마진 구조의 개혁이 핵심입니다.`;
      timing = `매출 활성화가 정점에 달하고 유통망이 매끄럽게 뚫리는 시기는 금(金)의 결실 에너지가 사주의 중심을 잡아주는 음력 7~9월 가을철입니다.`;
      actionPlan = `1. 카운터나 매장 입구에 붉은색(火) 계열의 행운 장식품이나 은은한 향을 매칭하여 손님들의 호기심과 발길을 자극하십시오.\n2. 거래처 미팅 시 흰색(金) 상의를 착용하여 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.\n3. 매장 내부의 서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서 서쪽 서랍에 깊숙이 보관하십시오.`;
    } else if (category === "facility") {
      analysis = `의뢰인 ${name}님의 설비투자 및 사업장 확장, 장비 구입 ["${cleanedText}"]에 대한 금전 비책입니다. 기계, 공장 설비, 신규 하드웨어를 구매하거나 대형 리모델링에 착수하는 것은 사주의 문서운(인성)과 장비 계약운(관성)이 깨끗할 때 진입해야 고장이나 시공 하자, 이자 비용의 폭증을 피할 수 있습니다. 현재의 충살 기운 하에서는 성급하게 고가의 장비를 리스하거나 확장 계약을 맺으면 향후 골칫거리가 될 수 있습니다.`;
      timing = `계약 체결 및 설비 입고에 가장 하자가 없고 안전한 골든 타임은 문서 기운이 가장 안정되는 2026년 음력 8월(酉월) 하반기 및 9월(戌월)입니다.`;
      actionPlan = `1. 계약 체결 시 반드시 보증보험이나 하자보수 서약서를 이중으로 징구하여 예상치 못한 파손 리스크에 대비하십시오.\n2. 노란색(土) 가죽 다이어리나 서류 바인더에 설비 도면과 서류를 보관하여 계약 체결 시 발생하는 살(煞)을 정화하십시오.\n3. 계약서 날인 당일에는 15분 동안 반신욕이나 족욕을 통해 몸의 열기를 다스린 후 가장 이성적이고 차분한 상태에서 최종 확인을 거쳐 서명하십시오.`;
    } else if (category === "career" || hasJob) {
      analysis = `의뢰인 ${name}님께서 작성해 주신 고민 ["${cleanedText}"]에 대한 정밀 역학 분석입니다. 귀하의 사주 원국을 보면, 활화산처럼 뻗어 나가는 식상(食傷: 표현과 행동력)이 관성(官星: 직장과 규율)과 충돌을 빚는 형세입니다. 이는 상사의 불공정한 처사나 업무의 불확실성을 견디기 어렵게 만들어 이직 및 퇴사 충동을 강하게 자극합니다. 귀하가 느끼시는 고민은 단순한 권태기가 아니며, 사주의 기운이 스스로 독립하여 나의 일을 도모하고자 하는 흐름과 일치합니다.`;
      timing = `가장 길한 변화의 시기는 귀하를 도울 관운이 견고하게 들어오는 음력 7~8월(申, 酉월) 사이입니다. 상반기에 무작정 퇴사하는 것은 자칫 공백기가 길어질 위험이 있으니, 재직 상태에서 이직 처를 확정 짓고 가을에 정식 이동하시는 것을 권장합니다.`;
      actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.\n2. 행운의 색상인 화이트(金)나 실버 액세서리를 착용하여 신뢰감을 주는 이미지를 메이킹하십시오.\n3. 이직을 진행할 때 서쪽(西) 방향에 위치한 회사나 기관이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
    } else if (category === "love" || hasLove) {
      analysis = `의뢰인 ${name}님께서 적어주신 관계적 갈등 ["${cleanedText}"]에 대한 솔루션입니다. 명리학적으로 귀하는 마음에 품은 정과 신뢰가 매우 깊으나, 그만큼 상대방이 나의 기대치에 미치지 못하거나 오해를 유발할 때 마음의 문을 완전히 닫아버리는 기질이 있습니다. 현재의 고민은 상대방의 기운(특히 목/화 기운의 과잉)과 귀하의 사주 기운이 충돌하여 서로의 감정 온도가 맞지 않아 발생한 일시적 고착 상태입니다.`;
      timing = `서로의 꼬인 감정이 풀리고 진솔한 소통의 물꼬가 트이는 시기는 음력 10월(亥월) 경입니다. 이때 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
      actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.\n2. 따뜻한 붉은색 계열(火)의 홈웨어 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.\n3. 대화를 시도할 때는 서로 마주 보는 자리보다 나란히 걸으며 이야기할 때 감정의 대립을 막아줍니다.`;
    } else if (category === "wealth" || hasMoney) {
      analysis = `의뢰인 ${name}님의 재물 및 투자 고민 ["${cleanedText}"]에 대한 비책입니다. 귀하의 사주 배합은 재물을 모으는 수(水) 식상은 충분히 발달했으나, 이를 새어나가지 않게 움켜쥐는 토(土) 재성의 결합력이 다소 약합니다. 이는 버는 만큼 지출이 쉽게 일어나거나 주변의 달콤한 투자 유혹(주식, 코인, 부동산 단타 등)에 흔들려 예상 밖의 재정적 손실을 겪기 쉬운 체질임을 경고합니다.`;
      timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
      actionPlan = `1. 현금 흐름의 60% 이상은 수동적 예적금이나 연금저축 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.\n2. 노란색(土) 지갑이나 브라운 계열의 의상을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.\n3. 거래 계약 시 노란 색상의 낙관 도장을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
    } else {
      analysis = `의뢰인 ${name}님께서 작성해 주신 인생 고민 ["${cleanedText}"]에 대한 분석입니다. 귀하가 느끼시는 깊은 고민은 사주상의 오행 흐름이 원활하지 않고 특정 기운에 머물러 정체되었기 때문에 발생합니다. 곧고 타협할 줄 모르는 대들보 같은 성격으로 인해, 스스로 감당하기 어려운 무거운 짐을 끝까지 혼자 짊어지려고 함으로써 마음의 골이 깊어진 상태입니다.`;
      timing = `정체된 흐름이 풀려 마음의 안정을 찾을 수 있는 시기는 귀하의 기운을 다정하게 감싸줄 목(木)과 화(火) 기운이 계절적으로 조화를 이루는 음력 6~7월 사이입니다.`;
      actionPlan = `1. 나 자신의 감정을 최우선으로 돌보고, 거절하는 연습을 시작하십시오.\n2. 녹색 식물을 키우거나 자연과 접하는 시간을 늘려 목 기운의 정체를 순화시키십시오.\n3. 매일 밤 따뜻한 물로 족욕을 하며 차가운 수(水) 기운을 위로 올리고 뜨거운 화(火) 기운을 내리는 수승화강을 실천하십시오.`;
    }

    return { analysis, timing, actionPlan };
  };

  const personalizedText = getPersonalizedSolution(name, worryText, worryCategory);

  const getElementColor = (el) => {
    switch (el) {
      case "목": return "bg-[#5F7A68] text-white";
      case "화": return "bg-red-600 text-white";
      case "토": return "bg-[#A3845B] text-white";
      case "금": return "bg-gray-400 text-gray-900";
      case "수": return "bg-gray-800 text-white";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const getElementBarColor = (el) => {
    switch (el) {
      case "목": return "bg-[#5F7A68]";
      case "화": return "bg-red-600";
      case "토": return "bg-[#A3845B]";
      case "금": return "bg-gray-400";
      case "수": return "bg-gray-800";
      default: return "bg-gray-200";
    }
  };

  // ----------------------------------------------------
  // Render: 평생 종합 사주 (saju) - 고급 6페이지 / 심화 9페이지
  // ----------------------------------------------------
    // ----------------------------------------------------
  // Render: 평생 종합 사주 SMS 요약본
  // ----------------------------------------------------
  const renderSmsSajuContent = () => {
    const lacks = prescriptions.map(p => p.name.split(" - ")[0]).join(", ");
    const elStats = `목(${sajuInfo.elements.목}개) | 화(${sajuInfo.elements.화}개) | 토(${sajuInfo.elements.토}개) | 금(${sajuInfo.elements.금}개) | 수(${sajuInfo.elements.수}개)`;
    
    const prescColor = prescriptions[0]?.color || "밝은 계열";
    const prescDir = prescriptions[0]?.direction || "중앙";
    const prescNum = prescriptions[0]?.number || "5, 10";
    const prescItems = prescriptions[0]?.items || "소품";
    const prescAction = prescriptions[0]?.action || "마음의 여유를 지니십시오.";

    const smsText = `[혜안당 명리연구소] 평생 종합 사주 요약 보감
──────────────────────────────
본 문서는 ${name} 님의 평생 사주 분석 요약본입니다.

■ 1. 타고난 명조 및 기운 분포
- 태어난 일간: ${baseEl} (귀하의 중심 기운)
- 오행 분포: ${elStats}
- 부족한 오행: ${lacks || "없음 (오행 균형)"}

■ 2. 오행 치유 및 개운(開運) 비법
- 행운의 처방 색상: ${prescColor}
- 행운의 상성 방향: ${prescDir}
- 행운의 조율 숫자: ${prescNum}
- 추천 개운 아이템: ${prescItems}
- 실천 개운 처방:
  ${prescAction}

■ 3. 고민 해결 솔루션 (맞춤형 분석)
- 사주 기질 분석:
  ${personalizedText.analysis}

- 핵심 개운 타이밍:
  ${personalizedText.timing}

- 실행 권장 지침:
  ${personalizedText.actionPlan}

──────────────────────────────
* 본 요약본은 혜안당 명리분석 시스템에 의해 계산 및 정밀 빌드되었습니다.`;

    return (
      <div className="max-w-md mx-auto bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-md text-center space-y-6 my-4 print:border-none print:shadow-none">
        <div className="bg-[#A3845B]/10 p-3 rounded-lg border-b border-[#A3845B]/20 flex justify-between items-center">
          <span className="text-xs font-semibold text-[#A3845B] tracking-wider">모바일 알림톡 수신본</span>
          <span className="text-[10px] text-gray-500 font-light">LMS 요약본</span>
        </div>

        <div className="space-y-4 text-left border border-dashed border-[#A3845B]/30 p-5 rounded-lg bg-[#F9F8F6]/80 max-h-[500px] overflow-y-auto custom-scrollbar">
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 text-center tracking-wider">
            {name} 님의 평생 종합 사주 요약 보감
          </h4>
          
          <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed">
            <div>
              <span className="font-semibold text-[11px] text-[#A3845B] block mb-1">■ 1. 타고난 명조 및 기운 분포</span>
              <p><strong>• 태어난 일간:</strong> <span className="font-bold text-[#A3845B]">{baseEl} (중심 기운)</span></p>
              <p><strong>• 오행 구성:</strong> <span className="font-semibold text-gray-700">{elStats}</span></p>
              <p><strong>• 부족한 오행:</strong> <span className="font-semibold text-red-600">{lacks || "없음"}</span></p>
            </div>

            <div className="border-t border-[#E2DDD5]/60 pt-3 space-y-1.5 bg-white p-3 rounded-lg border">
              <span className="font-semibold text-[11px] text-[#A3845B] block mb-1">💡 2. 오행 치유 개운 처방전</span>
              <p><strong>• 색상:</strong> {prescColor}</p>
              <p><strong>• 방향:</strong> {prescDir}</p>
              <p><strong>• 숫자:</strong> {prescNum}</p>
              <p><strong>• 추천 소품:</strong> {prescItems}</p>
              <p className="text-[11px] text-[#5F5F5F] font-light mt-1.5 leading-relaxed bg-[#F9F8F6] p-2 rounded">
                <strong>개운법:</strong> {prescAction}
              </p>
            </div>

            <div className="border-t border-[#E2DDD5]/60 pt-3 space-y-2">
              <span className="font-semibold text-[11px] text-[#A3845B] block">🔑 3. 고민 해결 맞춤 솔루션</span>
              <div>
                <span className="font-semibold text-[10px] text-gray-700 block">• 기질 분석 및 상황 진단</span>
                <p className="text-[11px] text-[#5F5F5F] font-light mt-0.5 leading-relaxed whitespace-pre-line">
                  {personalizedText.analysis}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <span className="font-semibold text-[10px] text-gray-700 block">• 최적의 개운 타이밍</span>
                <p className="text-[11px] text-[#5F5F5F] font-light mt-0.5 leading-relaxed whitespace-pre-line">
                  {personalizedText.timing}
                </p>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <span className="font-semibold text-[10px] text-gray-700 block">• 핵심 실행 지침 (귀인 처방)</span>
                <p className="text-[11px] text-[#5F5F5F] font-light mt-0.5 leading-relaxed whitespace-pre-line bg-brass/5 p-2 rounded">
                  {personalizedText.actionPlan}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleCopySms(smsText)}
            className="w-full py-2.5 bg-[#A3845B] text-[#F9F8F6] rounded text-xs font-semibold hover:bg-[#86653E] transition-colors shadow-sm cursor-pointer"
          >
            {copied ? "✓ 문자 복사 완료!" : "💬 전체 문자 내용 복사하기"}
          </button>
          <p className="text-[9px] text-gray-400 font-light">
            * 복사한 내용을 가족이나 지인에게 메신저/문자로 공유하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  };

  const renderSajuContent = () => {
    if (reportGrade === "sms") {
      return renderSmsSajuContent();
    }
    const totalPages = reportGrade === "deep" ? 9 : 6;

    // 오행 분포에 따른 종합 기질 풀이 생성
    const getElementsAnalysis = (elements) => {
      let analysisText = "";
      
      const strongElList = Object.entries(elements)
        .filter(([_, count]) => count >= 3)
        .map(([el]) => el);
        
      const weakElList = Object.entries(elements)
        .filter(([_, count]) => count <= 1)
        .map(([el]) => el);

      analysisText += `의뢰인 명조에 배합된 8글자의 오행 에너지 분포 분석 결과입니다. 귀하의 사주는 현재 `;
      analysisText += Object.entries(elements)
        .map(([el, count]) => `${el}(${count}개)`)
        .join(", ");
      analysisText += `의 고유한 에너지 비율을 보이고 있습니다.\n\n`;

      if (strongElList.length > 0) {
        analysisText += `이 중 사주에서 과다하게 작용하며 중심 기류를 지배하는 오행은 ${strongElList.join(", ")}입니다. `;
        strongElList.forEach(el => {
          if (el === "목") {
            analysisText += "목(木)의 곧게 뻗어나가는 성장 기류가 매우 강하므로, 주체적인 실행력과 목표 돌파력은 탁월하지만 고집과 자존심이 다소 지나치게 세어 타인의 조언을 배척하는 독선적 기질을 주의해야 합니다. ";
          } else if (el === "화") {
            analysisText += "화(火)의 뿜어져 나오는 열기와 확산 기류가 넘쳐나 대인관계에서 열정적이고 감정 표현이 확실하지만, 욱하는 다혈질 성향이나 마무리의 지속력 부족으로 인해 손재수와 실수가 잦아질 우려가 큽니다. ";
          } else if (el === "토") {
            analysisText += "토(土)의 넉넉하게 품는 포용력과 신뢰의 대지 기운이 풍부해 대인관계가 원만하고 흔들림이 없으나, 결단의 속도가 무디고 변화를 거부하는 완고함에 갇혀 절호의 기회를 놓치기 쉽습니다. ";
          } else if (el === "금") {
            analysisText += "금(金)의 예리하고 냉철한 쇠붙이 기운이 견고하여 정의를 중시하고 맺고 끊음이 확실하나, 지나치게 차갑고 날카로운 언어로 주변 사람들에게 서운함을 주거나 융통성 없는 독단에 흐르기 쉽습니다. ";
          } else if (el === "수") {
            analysisText += "수(水)의 깊고 어두운 지혜의 통찰 기운이 가득해 상황 판단과 직관력이 매우 뛰어나지만, 속내를 쉽게 드러내지 않아 오해를 사거나 내적인 불안감과 우울이 정체되어 일을 주저할 수 있습니다. ";
          }
        });
        analysisText += "\n\n";
      } else {
        analysisText += "사주상 특정 오행의 쏠림이 없고 균형이 잘 잡혀 있어, 성품이 원만하고 조화로우며 급격한 환경 변화나 스트레스 상황 속에서도 유연하게 제자리를 잡는 훌륭한 균형 조화를 자랑합니다.\n\n";
      }

      if (weakElList.length > 0) {
        analysisText += `반면 귀하의 명식에서 상대적으로 결핍되거나 보완이 필요한 취약 오행은 ${weakElList.join(", ")}입니다. `;
        weakElList.forEach(el => {
          if (el === "목") {
            analysisText += "목(木)이 결핍될 시 장기적인 미래 계획 설계나 첫발을 떼는 과감성이 무디고 의욕이 쉽게 약해지는 단점이 생길 수 있습니다. ";
          } else if (el === "화") {
            analysisText += "화(火)가 모자라면 본인의 재능을 드러내거나 사교적으로 나서는 힘이 약해 소극적인 태도에 머무를 수 있습니다. ";
          } else if (el === "토") {
            analysisText += "토(土)가 얇으면 끈기 있게 결실을 지키거나 자산을 안정적으로 묶어두는 수호력이 다소 부족하여 재물의 누수가 생기기 쉽습니다. ";
          } else if (el === "금") {
            analysisText += "금(金)이 없거나 약하면 단호하게 거절하지 못해 불필요한 감정 노동에 얽매이거나 매사의 마무리가 모호해지는 단점이 있습니다. ";
          } else if (el === "수") {
            analysisText += "수(水)가 결핍되면 지혜의 흐름이 고여 융통성이 줄어들고, 감정의 앙금이 쉽게 풀리지 않아 마음이 조급해질 위험이 있습니다. ";
          }
        });
      }

      analysisText += "\n\n이러한 과다와 결핍 요소를 조율하기 위해 처방된 오행 개운법(행운의 색상, 방향, 취침 루틴)을 일상생활 속에 깊이 녹여낼 때, 막혔던 운이 뚫리고 편안한 상승 기류를 맞이할 수 있게 됩니다.";
      return analysisText;
    };

    const elementsAnalysisText = getElementsAnalysis(sajuInfo.elements);

    // 5대 평점 항목별 설명 생성
    const getFiveAspects = () => {
      const aspects = {
        목: {
          wealth: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "목(木) 일간인 귀하에게 토(土)는 재물(財星)에 해당합니다. 2026년 병오년은 강한 화(火) 기운으로 인해 식상(활동)은 폭발하지만, 대지가 메말라 재물이 조기에 증발하기 쉬운 흐름입니다. 투자 구상은 번뜩이나 자칫 조급한 결정으로 손해를 보기 쉽습니다.",
            action: "단기 투기성 자산은 피하고, 문서 기반의 안정적 자산(부동산, 우량 채권) 형태로 묶어 재물 누수를 방어하십시오."
          },
          career: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "목(木) 일간의 관성(官星: 직장)은 금(金)입니다. 2026년은 욱하는 식상(火)이 직장운(金)을 극하는 '식상제살'의 형국입니다. 회사 시스템이나 상사의 불합리함에 대한 저항심이 끓어올라 충동적인 사표를 던지고 싶은 욕구가 커집니다.",
            action: "상반기(5~6월) 충동 이직은 절대 금물입니다. 이직은 기운이 안정되는 음력 8월(酉월) 이후에 공식 제안을 통해 조율하십시오."
          },
          health: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "강한 화기(火氣)에 의해 나무(木)의 수분이 마르는 조열한 해입니다. 이로 인해 두통, 신경과민, 불면증 및 안구 건조증이 두드러지게 나타날 수 있습니다. 특히 스트레스 조절에 실패하면 만성 피로가 찾아옵니다.",
            action: "밤늦게 스마트폰을 보는 습관을 지양하고, 저녁 족욕이나 명상을 통해 머리로 쏠리는 열을 아래로 식히십시오."
          },
          love: {
            stars: "★★★★☆",
            grade: "우수",
            body: "표현력과 매력을 담당하는 식상 기운이 넘쳐나 연애 세포가 활발히 작동하는 해입니다. 마음에 두던 이성이나 새로운 만남에서 적극적으로 호감을 표출하여 매력을 어필하기에 아주 좋은 타이밍입니다.",
            action: "첫눈에 반하는 이성에게 적극성을 보이되, 너무 성급하게 관계를 정의하려 들면 상대가 부담을 느낄 수 있으니 페이스를 조절하십시오."
          },
          marriage: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "연인과 미래를 꿈꾸며 이야기를 진전시키기에는 무리가 없으나, 사주의 기운이 다소 역동적이라 양가 부모님의 마찰이나 결혼 준비 과정의 사소한 조율 이슈로 인해 기 싸움이 발생하기 쉬운 환경입니다.",
            action: "2026년에는 결혼 계획 및 자금 확보를 구체화해 두고, 실제 결혼을 공식화하거나 살림을 합치는 것은 2027년(정미년)이 유리합니다."
          }
        },
        화: {
          wealth: {
            stars: "★★☆☆☆",
            grade: "주의",
            body: "화(火) 일간인 귀하에게 금(金)은 재성(財星)입니다. 2026년 병오년은 내 기운과 같은 거대한 불(비겁)이 들이닥쳐 재물(금)을 모두 녹이려는 '군겁쟁재'의 형상입니다. 동업 제안, 빌려준 돈 사고, 성급한 신규 투자로 인한 손재수가 극히 강합니다.",
            action: "올해는 '돈을 버는 것보다 지키는 것이 이기는 것'입니다. 지인의 투자 제안이나 동업은 100% 거절하고 고정비 통제에 주력하십시오."
          },
          career: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "화(火) 일간의 관성(직장)은 수(水)입니다. 강한 화기가 직장과 내 자리를 의미하는 물을 증발시키려 하므로, 부서 내 경쟁 구도가 과열되거나 내 공을 경쟁자가 가로채는 등 조직 내 불화가 잦을 수 있습니다.",
            action: "말실수가 가장 큰 화근이 됩니다. 직장 내 험담에 절대 참여하지 마시고, 회식 자리에서도 말을 아끼며 공사 구분을 철저히 하십시오."
          },
          health: {
            stars: "★★☆☆☆",
            grade: "주의",
            body: "사주에 불이 과도하게 팽창하여 심혈관계 질환, 고혈압, 급성 피부 트러블, 화상 등의 위험이 짙어집니다. 화(火)의 팽창 에너지가 욱하는 분노 조절 실패로 이어져 편두통을 유발할 수 있습니다.",
            action: "찬 음식보다는 미지근한 물을 자주 마시고, 매운 음식과 자극적인 유산소 운동 대신 요가나 걷기 같은 차분한 운동을 실천하십시오."
          },
          love: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "뜨거운 열정으로 마음에 드는 상대에게 순식간에 몰입하는 강렬한 로맨스가 찾아옵니다. 하지만 내 주장이 너무 강해져 사소한 말다툼이 불꽃처럼 커져 이별수로 돌변할 수 있는 양날의 검과 같습니다.",
            action: "다툼이 발생했을 때는 마주 앉아 언성을 높이지 말고, 즉시 자리를 피해 10분 이상 찬바람을 쐬며 감정을 식힌 후 대화하십시오."
          },
          marriage: {
            stars: "★★☆☆☆",
            grade: "주의",
            body: "결혼 준비 과정에서 자존심 대립이 극대화되는 시기입니다. 예물, 예단, 혼수 등 물질적 조건에 대해 서로의 양보 없는 주장이 이어져 결혼 직전 파토가 나는 살(煞)이 낄 수 있으니 주의가 필요합니다.",
            action: "양가 조율이 필요한 사항은 반드시 제3자나 플래너의 중재안을 따르고, 두 사람만의 감정 대립으로 번지지 않도록 대화를 통제하십시오."
          }
        },
        토: {
          wealth: {
            stars: "★★★★☆",
            grade: "우수",
            body: "토(土) 일간인 귀하에게 수(水)는 재성(財星)입니다. 2026년은 인성(화)이 나를 생해 주어 문서상의 권리나 자격증 취득에 매우 이로운 해이지만, 강한 열기가 재물(물)을 말리므로 유동성 확보에는 애를 먹을 수 있습니다.",
            action: "현금성 단기 투자는 피하되, 부동산 계약서나 상표권, 자격 기술 등을 통한 중장기 문서 자산을 취득하는 투자는 대길합니다."
          },
          career: {
            stars: "★★★★★",
            grade: "최상",
            body: "토(土) 일간의 관성(직장)은 목(木)입니다. 나를 후원하는 인성(화)의 에너지가 관성(木)을 흡수하여 나를 돕는 관인상생의 흐름을 보입니다. 상사의 신임을 한 몸에 받거나 승진 시험, 합격 등 명예가 올라가는 최고의 해입니다.",
            action: "중요한 프로젝트가 맡겨지면 책임감 있게 완수하십시오. 올해 얻는 신뢰와 직급이 향후 5년의 캐리어를 결정짓습니다."
          },
          health: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "따뜻한 불이 흙을 데워주는 이로운 형세이지만, 불이 너무 지나치면 위장 장애, 소화 불량, 변비가 발생하기 쉽습니다. 스트레스로 인한 과식이나 폭식은 즉각 소화계에 악영향을 미칩니다.",
            action: "아침 식사를 거르지 말고, 따뜻하고 맑은 국물 중심의 한식을 섭취해 위장 기능을 따뜻하게 보호하십시오."
          },
          love: {
            stars: "★★★★☆",
            grade: "우수",
            body: "나를 진심으로 아끼고 보살펴 주는 따뜻한 연인을 만나게 되는 운세입니다. 이미 연인이 있다면 상대방이 나를 위해 헌신하거나 든든한 조력자 역할을 자처하여 정서적으로 매우 큰 안정을 얻게 됩니다.",
            action: "상대방의 다정함을 당연하게 여기지 마시고, 고마움을 말과 따뜻한 포옹으로 즉각 피드백하는 노력을 기울이십시오."
          },
          marriage: {
            stars: "★★★★★",
            grade: "최상",
            body: "가정을 꾸리고 공식적인 문서를 체결하기에 가장 길한 해입니다. 양가 부모님의 전폭적인 지지와 축복 속에서 일사천리로 결혼 과정이 진행되며, 부부 공동의 명의로 주택을 구입하기에 매우 유리한 시기입니다.",
            action: "결혼 약속 및 식장 예약, 혼인 신고를 머뭇거리지 마십시오. 2026년의 인성 기운이 단단한 부부의 신뢰를 공인해 줍니다."
          }
        },
        금: {
          wealth: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "금(金) 일간인 귀하에게 목(木)은 재성(財星)입니다. 2026년은 강한 불(관성)이 나를 단련시키며 동시에 내 재물(木)을 녹이는 흐름입니다. 직장 내 업무 성과나 기본 소득은 유지되나 스트레스를 풀기 위한 보상 심리적 지출이 급격히 증가합니다.",
            action: "시발 비용(스트레스성 소비)을 막기 위해 체크카드 한도를 설정하고, 번 돈의 50%는 적금 통장으로 강제 이체해 두는 통제가 필수적입니다."
          },
          career: {
            stars: "★★★★★",
            grade: "최상",
            body: "금(金) 일간의 관성(직장)은 화(火)입니다. 2026년 병오년은 강력한 용광로(불)가 나를 제련하여 멋진 예술품으로 만드는 관성왕지의 해입니다. 승진, 핵심 요직 발탁, 대기업 이직 등 캐리어의 정점을 찍을 수 있는 해입니다.",
            action: "업무량이 과중하여 밤낮이 바뀔 수 있으나 피하지 마십시오. 단, 상사와의 지나친 완벽주의적 충돌만 주의하면 명예를 크게 움켜쥡니다."
          },
          health: {
            stars: "★★☆☆☆",
            grade: "주의",
            body: "강력한 화기가 금(金)을 극하여 폐, 호흡기 계통, 인후염 및 뼈/관절에 적신호가 켜집니다. 특히 과로로 인한 면역력 저하와 대상포진 등 신경성 질환의 발생 확률이 높아지므로 주의해야 합니다.",
            action: "과격한 근력 운동은 뼈에 무리를 주니 피하고, 도라지차나 배즙 등 호흡기에 좋은 음식을 챙겨 먹으며 매일 7시간 이상 숙면을 취하십시오."
          },
          love: {
            stars: "★★★★☆",
            grade: "우수",
            body: "이성을 끌어당기는 자석 같은 기운(관성)이 최고조에 달합니다. 특히 여성의 경우 멋진 배우자 후보가 등장하거나, 연인과 함께하는 자리에서 내 매력이 돋보여 상대의 고백을 이끌어내는 애정운의 호조가 따릅니다.",
            action: "마음의 문을 열고 다양한 모임이나 소개팅에 참여하십시오. 정장을 단정하게 입거나 깔끔한 실버 액세서리를 매칭하면 운이 더욱 살아납니다."
          },
          marriage: {
            stars: "★★★★☆",
            grade: "우수",
            body: "결혼을 진지하게 논의하고 양가의 상견례를 조율하기에 유리한 흐름입니다. 다만, 내 고집이나 원칙을 너무 앞세우면 상대방이 숨이 막힐 수 있으니 결혼 절차는 유연하게 넘어가야 파열음이 생기지 않습니다.",
            action: "모든 준비 과정을 내 취향대로 완벽하게 통제하려 하지 마시고, 30% 정도는 예비 배우자의 의견을 전적으로 수용하여 배려를 보이십시오."
          }
        },
        수: {
          wealth: {
            stars: "★★★★★",
            grade: "최상",
            body: "수(水) 일간인 귀하에게 화(火)는 재성(財星)입니다. 2026년 병오년은 강한 불꽃이 나를 둘러싸는 '재성혼잡 및 편재왕지'의 해입니다. 일생일대의 큰 투자 결실, 연봉의 도약, 사업상 대형 계약 체결 등 금전운이 거대하게 열립니다.",
            action: "재물운이 최상일 때 기회를 잡으십시오. 단, 사주가 너무 신약한 경우(물 기운 부족) 과로로 이어질 수 있으니 수분 섭취를 늘리고 분수를 지켜야 합니다."
          },
          career: {
            stars: "★★★★☆",
            grade: "우수",
            body: "수(水) 일간의 관성(직장)은 토(土)입니다. 2026년의 풍부한 불꽃이 토를 생하여 직장에서 나를 보호하는 든든한 배경이 형성됩니다. 내 아이디어가 고스란히 예산 확보나 신규 프로젝트의 승인으로 연결되는 업무 호재가 따릅니다.",
            action: "내 공적을 상사에게 명확한 수치와 데이터로 보고하십시오. 성과급 조율이나 연봉 협상에서 매우 유리한 카드를 쥐게 됩니다."
          },
          health: {
            stars: "★★★☆☆",
            grade: "보통",
            body: "뜨거운 불꽃을 감당하느라 내 물 기운이 급속도로 증발합니다. 신장, 방광, 자궁 등 비뇨기 계통의 피로가 극심해질 수 있으며, 몸이 건조해져 피부 소양증이나 각질이 악화될 수 있습니다.",
            action: "매일 아침 공복에 미지근한 물 한 잔을 필수적으로 섭취하고, 짠 자극적인 음식 대신 보리차나 이온 음료를 수시로 마셔 신장 기능을 보강하십시오."
          },
          love: {
            stars: "★★★★★",
            grade: "최상",
            body: "남성의 경우 배우자나 매혹적인 이성을 만나는 이성운이 일생 중 가장 강력합니다. 여성의 경우에도 상대에게 사랑을 듬뿍 받고 나의 매력을 완전히 발산하는 달콤한 연애가 시작될 최고의 기운입니다.",
            action: "호감이 가는 이성과는 가만히 눈치만 보지 마시고, 은근한 터치와 따뜻한 눈빛 교환을 시도해 마음을 자극해 보십시오."
          },
          marriage: {
            stars: "★★★★☆",
            grade: "우수",
            body: "경제적인 가치를 우선순위에 두고 가정을 단단하게 묶어가기 좋은 시기입니다. 예비 배우자와 재정적 신뢰 관계를 명확히 구축하고, 결혼 후 자산 관리 계획을 공유하기에 아주 적절한 타이밍입니다.",
            action: "예식의 허례허식 비용을 과감히 축소하고, 그 예산을 신혼집 마련이나 재테크 시드머니로 돌리는 실용적 결단을 부부가 함께 내리십시오."
          }
        }
      };

      const myAspects = aspects[baseEl] || aspects["목"];
      return [
        { icon: "💰", title: "재물운 (財星)", color: "text-[#5F7A68]", ...myAspects.wealth },
        { icon: "💼", title: "직업운 (官星)", color: "text-blue-700", ...myAspects.career },
        { icon: "❤️‍🔥", title: "건강운 (健康)", color: "text-orange-600", ...myAspects.health },
        { icon: "💘", title: "연애운 (桃花)", color: "text-rose-600", ...myAspects.love },
        { icon: "💍", title: "결혼운 (姻緣)", color: "text-purple-700", ...myAspects.marriage }
      ];
    };

    const fiveAspectsData = getFiveAspects();

    // 2026년 운세 연동 텍스트
    let year2026Text = "";
    if (baseEl === "목") {
      year2026Text = "귀하는 나무(木)의 기질로 2026년 병오(丙午)의 불꽃을 만나면 식상(食傷)의 기운이 발동하여 표현력과 활동량이 폭발합니다. 그동안 속으로 키워온 재주와 기술이 세상 밖으로 드러나 인정받는 해가 됩니다. 다만 과로와 번아웃에 주의해야 합니다.";
    } else if (baseEl === "화") {
      year2026Text = "귀하는 불(火)의 기질로 2026년 병오(丙午)와 같은 화기를 만나 비겁(比劫) 에너지가 극대화됩니다. 자존심과 독립심이 강해져 창업이나 새로운 도전이 불타오르지만, 동업자나 경쟁자와의 충돌을 각별히 조심해야 합니다.";
    } else if (baseEl === "토") {
      year2026Text = "귀하는 대지(土)의 기질로 2026년 병오(丙午)의 불이 흙을 따뜻하게 데워주는 인성(印星) 조화를 얻습니다. 자격증, 공부, 부동산 취득 등 문서운이 강하게 빛나며 귀인의 도움이 겹겹이 쌓이는 매우 길한 해입니다.";
    } else if (baseEl === "금") {
      year2026Text = "귀하는 쇠붙이(金)의 기질로 2026년 병오(丙午)의 불이 나를 단련시키는 관성(官星) 압박이 강합니다. 직책이 무거워지거나 승진 기회가 오지만, 뼈와 호흡기 건강 관리와 상사와의 관계 조율에 신경을 써야 합니다.";
    } else {
      year2026Text = "귀하는 물(水)의 기질로 2026년 병오(丙午)의 불꽃을 통제하는 재성(財星) 에너지가 발동합니다. 투자 결실, 연봉 상승, 재물 기회가 크게 요동치는 해이나 건강을 과소비하지 않도록 철저히 관리하십시오.";
    }

    return (
      <>
        {/* ===== PAGE 1: 사주원국 + 오행분석 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <div className="text-center space-y-2 mb-8 print:mb-10">
              <span className="text-xs tracking-widest text-[#A3845B] font-bold block print:text-sm">혜안당 보감 · {reportGrade === "deep" ? "심화 리포트" : "고급 리포트"}</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider print:text-3xl">
                제 1장. 사주 원국 및 오행 분포 분석
              </h2>
              <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto my-2" />
            </div>

            <div className="space-y-3 mb-8 print:mb-10">
              <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 print:text-lg print:pb-3">
                <Scroll className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
                사주팔자 (四柱八字) 명식원국
              </h3>
              <div className="grid grid-cols-4 border border-[#E2DDD5] rounded bg-white text-center text-xs divide-x divide-[#E2DDD5] print:text-sm print:border-2">
                <div className="bg-[#F6F3EC] py-2.5 font-semibold text-[#A3845B] print:py-4">시주 (時柱)</div>
                <div className="bg-[#F6F3EC] py-2.5 font-semibold text-[#A3845B] print:py-4">일주 (日柱)</div>
                <div className="bg-[#F6F3EC] py-2.5 font-semibold text-[#A3845B] print:py-4">월주 (月柱)</div>
                <div className="bg-[#F6F3EC] py-2.5 font-semibold text-[#A3845B] print:py-4">연주 (年柱)</div>
                <div className="py-5 space-y-1 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.hour.stem}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.hour.stemEl})</span>
                </div>
                <div className="py-5 space-y-1 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.day.stem}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.day.stemEl})</span>
                </div>
                <div className="py-5 space-y-1 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.month.stem}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.month.stemEl})</span>
                </div>
                <div className="py-5 space-y-1 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.year.stem}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.year.stemEl})</span>
                </div>
                <div className="py-5 space-y-1 bg-[#F9F8F6]/60 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.hour.branch}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.hour.branchEl})</span>
                </div>
                <div className="py-5 space-y-1 bg-[#F9F8F6]/60 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.day.branch}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.day.branchEl})</span>
                </div>
                <div className="py-5 space-y-1 bg-[#F9F8F6]/60 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.month.branch}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.month.branchEl})</span>
                </div>
                <div className="py-5 space-y-1 bg-[#F9F8F6]/60 print:py-6">
                  <span className="text-2xl font-bold font-myeongjo text-[#1A1A1A] print:text-4xl">{sajuInfo.year.branch}</span>
                  <span className="block text-[10px] text-[#5F5F5F] font-medium print:text-sm">({sajuInfo.year.branchEl})</span>
                </div>
              </div>
              <div className="text-right text-[10px] text-[#5F5F5F] italic mt-1 print:text-xs">
                * 생시 {sajuInfo.hour.name}를 포함하여 4주 8글자를 구성했습니다.
              </div>
            </div>

            <div className="space-y-4 print:space-y-5">
              <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 print:text-lg print:pb-3">
                <Compass className="w-4.5 h-4.5 text-[#5F7A68] print:w-5 print:h-5" />
                오행 (五行) 에너지 분포 분석
              </h3>
              <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm print:p-8 print:border-2">
                <div className="space-y-3 print:space-y-4">
                  {Object.entries(sajuInfo.elements).map(([el, count]) => {
                    const percentage = (count / 8) * 100;
                    return (
                      <div key={el} className="flex items-center gap-3 text-xs print:text-sm">
                        <span className={`w-16 text-center py-0.5 rounded font-bold text-[11px] print:text-sm print:py-1 print:w-20 ${getElementColor(el)}`}>
                          {el} ({count}개)
                        </span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden print:h-4">
                          <div className={`h-full transition-all duration-500 ${getElementBarColor(el)}`} style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="w-10 text-right font-semibold text-[#5F5F5F] print:text-sm">{Math.round(percentage)}%</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#5F5F5F] leading-relaxed font-light mt-4 pt-3 border-t border-[#E2DDD5]/50 print:text-[13px] print:leading-loose whitespace-pre-line">
                  {elementsAnalysisText}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">1 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 2: 타고난 성향 · 기질 · 내면 분석 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
              <Sparkles className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
              타고난 성향 · 기질 · 내면 분석
            </h3>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-6 shadow-sm print:p-8 print:mb-8 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 print:text-base print:mb-4">
                🌟 {name}님의 핵심 기질 — {baseEl}({baseEl === "목" ? "木" : baseEl === "화" ? "火" : baseEl === "토" ? "土" : baseEl === "금" ? "金" : "水"}) 기질의 사람
              </h4>
              <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                {baseEl === "목" && "귀하는 곧게 하늘을 향해 뻗어 자라는 나무(木)처럼, 원칙과 비전을 중시하는 독립적인 기질을 타고 났습니다. 남의 말에 쉽게 굴복하지 않는 강한 자존심이 있으며, 한 번 목표를 세우면 집요하게 파고드는 끈기가 있습니다. 다만 과한 자존심이 때로는 융통성의 부재로 이어질 수 있으니, 상황에 따라 유연하게 대응하는 연습이 필요합니다."}
                {baseEl === "화" && "귀하는 밝고 뜨겁게 타오르는 불(火)의 기질로, 열정과 에너지가 넘쳐 주변을 밝히는 태양 같은 존재입니다. 빠른 판단력과 강한 추진력으로 리더십을 발휘하며 사람들의 이목을 자연스럽게 집중시킵니다. 그러나 흥분과 냉각이 빠른 속성이 있어, 감정을 진정시키는 수련이 평생의 과제입니다."}
                {baseEl === "토" && "귀하는 만물을 기르고 지탱하는 대지(土)의 기질로, 신뢰감과 포용력이 타고난 장점입니다. 말보다는 행동으로 신의를 쌓아가며 한 번 맺은 인연을 소중히 여기는 끈끈한 의리가 있습니다. 다만 결단의 속도가 느리고 변화에 대한 저항이 강할 수 있으니, 새로운 흐름을 열린 마음으로 받아들이는 유연성을 키우는 것이 중요합니다."}
                {baseEl === "금" && "귀하는 단단하게 벼려진 쇠붙이(金)의 기질로, 원칙과 정의를 중시하며 공사 구분이 확실한 카리스마를 지녔습니다. 냉철한 분석력과 결단력으로 복잡한 상황을 명확하게 정리하는 탁월한 능력이 있습니다. 그러나 날카로운 성품이 가까운 이들에게 차갑게 느껴질 수 있으니, 따뜻한 언어 표현을 의식적으로 늘리는 것이 관계의 윤활유가 됩니다."}
                {baseEl === "수" && "귀하는 장애물을 유연하게 비켜 흐르는 물(水)의 기질로, 깊은 통찰력과 지혜가 뛰어난 사색형 인재입니다. 남들이 보지 못하는 이면을 꿰뚫는 직관력과 섬세한 감수성으로 예술, 학문, 연구 분야에서 탁월한 역량을 발휘합니다. 다만 지나친 내성과 우유부단함이 결단의 타이밍을 놓치게 만들 수 있으니, 중요한 순간에는 용기 있는 선택이 필요합니다."}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mb-6 print:gap-6 print:mb-8">
              <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 print:p-6">
                <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] print:text-base">✨ 타고난 강점</h4>
                <ul className="text-xs text-[#2C2C2C] space-y-2 font-light leading-relaxed print:text-[13px] print:space-y-3">
                  <li className="flex gap-2"><span className="text-[#A3845B] font-bold shrink-0">•</span>{baseEl === "목" ? "독립적인 의지력과 주도적인 실행력이 탁월합니다." : baseEl === "화" ? "넘치는 열정과 빠른 상황 판단력이 강점입니다." : baseEl === "토" ? "두터운 신뢰감과 지구력 있는 끈기가 강점입니다." : baseEl === "금" ? "냉철한 분석력과 명확한 결단력이 강점입니다." : "깊은 통찰력과 유연한 적응력이 강점입니다."}</li>
                  <li className="flex gap-2"><span className="text-[#A3845B] font-bold shrink-0">•</span>{baseEl === "목" ? "창의적인 아이디어와 새로운 시도를 두려워하지 않습니다." : baseEl === "화" ? "사람을 끌어당기는 자연스러운 리더십과 화술이 있습니다." : baseEl === "토" ? "한 번 맺은 인연을 끝까지 아끼는 의리가 강합니다." : baseEl === "금" ? "공사 구분이 확실하고 정의로운 원칙주의 성향이 있습니다." : "감수성이 풍부하고 예술적 직관이 뛰어납니다."}</li>
                  <li className="flex gap-2"><span className="text-[#A3845B] font-bold shrink-0">•</span>{baseEl === "목" ? "장기적인 목표를 향해 묵묵히 집중하는 집요함이 있습니다." : baseEl === "화" ? "긍정 에너지로 주변 사람들의 의욕을 높여줍니다." : baseEl === "토" ? "안정적인 환경을 조성하여 조직과 가정의 중심이 됩니다." : baseEl === "금" ? "세세한 부분까지 놓치지 않는 완벽주의 집중력이 있습니다." : "학습 능력이 뛰어나 지식과 기술을 빠르게 습득합니다."}</li>
                </ul>
              </div>
              <div className="bg-white border border-red-100 rounded-lg p-5 space-y-3 print:p-6">
                <h4 className="font-myeongjo text-sm font-bold text-red-700 print:text-base">⚠️ 극복해야 할 약점</h4>
                <ul className="text-xs text-[#2C2C2C] space-y-2 font-light leading-relaxed print:text-[13px] print:space-y-3">
                  <li className="flex gap-2"><span className="text-red-500 font-bold shrink-0">•</span>{baseEl === "목" ? "지나친 자존심으로 타인의 의견을 배척하기 쉽습니다." : baseEl === "화" ? "감정의 기복이 심해 과격한 언행을 할 수 있습니다." : baseEl === "토" ? "변화와 새로운 시도에 지나치게 보수적일 수 있습니다." : baseEl === "금" ? "날카로운 직언이 상대방에게 상처를 줄 수 있습니다." : "우유부단함으로 중요한 결정을 미루는 경향이 있습니다."}</li>
                  <li className="flex gap-2"><span className="text-red-500 font-bold shrink-0">•</span>{baseEl === "목" ? "타협을 약함으로 보아 불필요한 갈등이 생길 수 있습니다." : baseEl === "화" ? "시작은 뜨겁지만 지속력이 부족해 마무리가 약합니다." : baseEl === "토" ? "우유부단한 결단으로 좋은 기회를 놓치기도 합니다." : baseEl === "금" ? "지나친 완벽주의로 자신과 타인을 지치게 만듭니다." : "낯선 환경에서 심한 불안감을 느껴 결단을 미룹니다."}</li>
                  <li className="flex gap-2"><span className="text-red-500 font-bold shrink-0">•</span>{baseEl === "목" ? "성급하게 행동하여 세부 사항을 놓치는 일이 잦습니다." : baseEl === "화" ? "충동적인 판단으로 경제적 손실을 볼 수 있습니다." : baseEl === "토" ? "남에게 베푸는 것이 많아 재물이 새어나갈 수 있습니다." : baseEl === "금" ? "감정 표현이 서투르고 외로움을 쉽게 느낍니다." : "현실적인 판단보다 이상을 추구하는 경향이 강합니다."}</li>
                </ul>
              </div>
            </div>
            {worryText && (
              <div className="bg-white border-2 border-[#A3845B]/40 rounded-lg p-5 print:p-6">
                <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 flex items-center gap-1.5 print:text-base">
                  <Heart className="w-4 h-4 text-red-500" />
                  {name} 님의 개별 고민 맞춤형 솔루션
                </h4>
                <div className="bg-[#F9F8F6] border-l-4 border-[#A3845B] p-3 rounded text-xs mb-3 print:text-[13px]">
                  <span className="font-bold text-[#1A1A1A] block mb-1">작성하신 고민 원문:</span>
                  <p className="text-[#5F5F5F] italic">"{decodeURIComponent(worryText)}"</p>
                </div>
                <div className="space-y-3 text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[13px] print:leading-loose">
                  <div><span className="font-bold text-[#A3845B] block mb-1">📍 고민 상황의 운명적 해석</span><p>{personalizedText.analysis}</p></div>
                  <div><span className="font-bold text-[#A3845B] block mb-1">⏰ 최적의 행동 타이밍</span><p>{personalizedText.timing}</p></div>
                  <div>
                    <span className="font-bold text-[#A3845B] block mb-1">🔑 귀하를 위한 개운 비법</span>
                    <div className="bg-[#F6F3EC] p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-xs leading-relaxed text-[#2C2C2C] print:text-[12px]">{personalizedText.actionPlan}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">2 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 3: 2026년 전체 흐름 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
              <CalendarDays className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
              2026년 병오년(丙午年) 전체 흐름
            </h3>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-6 shadow-sm print:p-8 print:mb-8 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 print:text-base print:mb-4">🔥 {name}님과 병오년(丙午年)의 기운 조합</h4>
              <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">{year2026Text}</p>
            </div>
            <div className="space-y-4 print:space-y-5">
              <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] print:text-base">2026년 분기별 세부 흐름</h4>
              {[
                { season: "🌸 1분기 (1~3월)", title: "새 기운의 도래와 설계의 시작", body: "새해가 시작되며 기분 좋은 변동운이 스쳐 지나갑니다. 이직 제안이나 새로운 인간관계가 생기지만 아직 내실이 완성되지 않은 단계입니다.", tip: "타인의 제안에 즉답을 미루고 충분히 자료를 수집하십시오. 약속을 문서화하여 배신수를 방지하십시오." },
                { season: "☀️ 2분기 (4~6월)", title: "에너지의 초과 팽창과 충돌 주의", body: "1년 중 화(火) 기운이 가장 폭발하는 시기로 스트레스 지수가 극대화됩니다. 욱하는 감정 때문에 상사나 가족과의 충돌 수가 짙어집니다.", tip: "중요한 도장 날인이나 퇴사 결단은 이 시기에 절대 내리지 마십시오. 수분 섭취와 냉정한 침묵 수련이 운을 살립니다." },
                { season: "🍁 3분기 (7~9월)", title: "가을의 서리 기운과 안정 조정기", body: "뜨거운 화기를 금(金)의 서리 기운이 식혀주며 이성이 돌아옵니다. 그동안 미뤄졌던 이직이 결정 나거나, 관계의 오해가 풀려 안정감을 되찾습니다.", tip: "상반기에 기획했던 안건을 이때 세상에 내어놓으십시오. 이력서 제출, 투자 포트폴리오 조정이 최적입니다." },
                { season: "❄️ 4분기 (10~12월)", title: "알찬 수확과 평온한 마무리", body: "대지의 기운이 겨울의 차가운 물속에 고정되며 금전 보상과 가정이 화평해집니다. 1년 농사의 달콤한 보너스를 챙기며 한 해를 마무리합니다.", tip: "번 돈의 절반은 비상금으로 동결하여 내년을 준비하십시오. 가족과 함께하는 시간으로 에너지를 재충전하십시오." }
              ].map((q, i) => (
                <div key={i} className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm print:p-6 print:border-2">
                  <span className="text-xs font-bold text-[#A3845B] block border-b border-[#E2DDD5]/50 pb-1 mb-2 print:text-sm print:pb-2 print:mb-3">{q.season} : {q.title}</span>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light mb-2 print:text-[12.5px]"><strong>상황:</strong> {q.body}</p>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light print:text-[12.5px]"><strong>전술:</strong> {q.tip}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">3 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 4: 재물운·직업운·건강운·연애운·결혼운 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
              <Award className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
              재물운 · 직업운 · 건강운 · 연애운 · 결혼운 (분야별 오행 분석)
            </h3>
            <div className="space-y-4 print:space-y-5">
              {fiveAspectsData.map((item, i) => (
                <div key={i} className="bg-white border border-[#E2DDD5] rounded-lg p-4 shadow-sm print:p-5 print:border-2">
                  <div className="flex items-center justify-between mb-2 print:mb-3">
                    <h4 className={`font-myeongjo text-sm font-bold ${item.color} flex items-center gap-1.5 print:text-base`}><span>{item.icon}</span> {item.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-xs print:text-sm">{item.stars}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.grade === "최상" ? "bg-emerald-50 text-emerald-700" : item.grade === "우수" ? "bg-blue-50 text-blue-700" : item.grade === "주의" ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"} print:text-xs`}>{item.grade}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional print:text-[13px] print:leading-loose mb-2">
                    {item.body}
                  </p>
                  <div className="bg-[#F6F3EC] border-l-2 border-[#A3845B] pl-3 py-1.5 text-[11px] text-[#2C2C2C] print:text-[12px] print:leading-normal">
                    <strong className="text-[#A3845B]">🎯 2026년 행동 전략:</strong> {item.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">4 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 5: 평생운 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
              <Scroll className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
              평생운 — 초년 / 청년 / 중년 / 말년
            </h3>
            <div className="space-y-5 print:space-y-6">
              {[
                { icon: "🌱", period: "초년운 (1세 ~ 20세)", subtitle: "새싹의 성장기", body: "총명함과 남다른 상상력으로 학업에서 두각을 보이나, 감수성이 풍부하고 예민하여 사춘기 시절 일시적인 고독감을 경험했을 운세입니다. 가족의 울타리 안에서 안정적으로 성장하되, 내향적인 에너지를 지식과 학업으로 발산하면 장차 큰 밑거름이 됩니다.", fortune: "학업·지식 쌓기에 집중하고, 좋아하는 것을 끝까지 파고드는 집중력을 기르십시오." },
                { icon: "🌿", period: "청년운 (21세 ~ 40세)", subtitle: "독립과 도전의 시기", body: "나의 목소리를 사회에 관철하는 시기입니다. 억압적인 환경을 탈피하고 스스로의 비즈니스나 창작을 도모하는 에너지가 커져 이직, 창업, 도전적인 시도들이 활발하게 이루어지는 흐름입니다. 30대 중반이 진정한 도약점이 됩니다.", fortune: "두려워도 도전하는 실행력을 갖추십시오. 인맥과 실력을 동시에 쌓는 30대가 인생의 승부처입니다." },
                { icon: "🌾", period: "중년운 (41세 ~ 60세)", subtitle: "찬란한 결실과 황금기", body: "인생의 가장 안정된 시기입니다. 부족한 기운이 대운에서 보강되며 부동산을 취득하거나 자산을 든든히 보존하고, 가정을 단단하게 수호하며 명예를 높이 쌓을 황금기입니다. 사회적 신뢰와 경제적 풍요가 동시에 꽃을 피웁니다.", fortune: "40대 초반에 핵심 투자를 결정하십시오. 이때 내린 결단이 50대의 경제적 자유를 만들어 줍니다." },
                { icon: "🪵", period: "말년운 (61세 이후)", subtitle: "지혜와 평정의 시간", body: "물과 대지가 조화롭게 흘러 안락한 노후를 약속받습니다. 건강관리에 주의를 기울이며, 자손들의 번창을 수호하고 한 분야의 조력자이자 고문으로서 은퇴 후에도 존경을 받는 흐름입니다.", fortune: "60대 초반 건강 관리를 최우선으로 하십시오. 자녀와의 관계를 돈독히 하여 노후의 안전망을 탄탄하게 구축하십시오." }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm print:p-6 print:border-2">
                  <div className="mb-3 print:mb-4">
                    <span className="text-xs font-bold text-[#A3845B] block print:text-sm">{item.icon} {item.period} — {item.subtitle}</span>
                  </div>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional mb-3 print:text-[13px] print:leading-loose print:mb-4">{item.body}</p>
                  <div className="bg-[#F6F3EC] border-l-2 border-[#A3845B] pl-3 py-1.5 text-[11px] text-[#2C2C2C] print:text-[12px]">
                    <strong className="text-[#A3845B]">핵심 조언:</strong> {item.fortune}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">5 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 6: 조심할 시기 + 개운법 ===== */}
        <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
          <div>
            <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
              <Shield className="w-4.5 h-4.5 text-red-600 print:w-5 print:h-5" />
              특히 조심해야 할 시기 &amp; 나만의 개운법
            </h3>
            <div className="bg-red-50/50 border border-red-200 rounded-lg p-5 mb-6 space-y-3 print:p-6 print:mb-8 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 print:text-base">⚠️ 특히 조심해야 할 시기와 액운 방어법</h4>
              <ul className="text-xs text-[#5F5F5F] leading-relaxed space-y-3 font-light print:text-[13px] print:space-y-4">
                <li className="flex gap-2 items-start"><span className="text-red-600 font-bold shrink-0">•</span><div><strong className="text-[#1A1A1A]">2026년 5~6월 과잉 화기 경보:</strong> 병오년의 불꽃이 가장 매섭게 튀는 여름철에는 절대 시비에 휘말리지 마십시오. 감정이 끓어오를 때는 '그럴 수도 있지'를 마음속으로 되뇌며 상황을 객관화하는 연습을 하십시오.</div></li>
                <li className="flex gap-2 items-start"><span className="text-red-600 font-bold shrink-0">•</span><div><strong className="text-[#1A1A1A]">충살(沖煞) 주의 시기 — 자오충(子午沖):</strong> 매년 음력 5월(午월)과 11월(子월)에는 사주 내 충살이 극대화됩니다. 이 시기에는 중요한 계약 서명, 이사, 수술 등 인생의 큰 결정을 피하고 준비와 점검의 시간으로 활용하십시오.</div></li>
                <li className="flex gap-2 items-start"><span className="text-red-600 font-bold shrink-0">•</span><div><strong className="text-[#1A1A1A]">재물 누수 방어 수칙:</strong> 어떤 서류 체결이든 당일 즉각 서명하지 말고 최소 하룻밤 이상 검토하는 습관을 철칙으로 삼으십시오. 충동 소비와 보증 서기를 극도로 조심하십시오.</div></li>
              </ul>
            </div>
            <div className="space-y-4 print:space-y-5">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] print:text-base">✨ 나만의 오행 개운법 — 부족한 기운을 채우는 비결</h4>
              {prescriptions.map((p, idx) => (
                <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3 print:p-6 print:border-2">
                  <span className="font-bold text-[#A3845B] text-sm flex items-center gap-1.5 print:text-base">
                    <Sparkles className="w-4.5 h-4.5 text-[#A3845B]" />
                    {p.name} 기운 처방
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-[#F9F8F6] p-3 rounded border border-[#E2DDD5]/60 print:grid-cols-4 print:text-xs print:p-4">
                    <div><span className="text-[#5F5F5F] block font-medium">행운의 색상</span><span className="font-bold text-[#1A1A1A]">{p.color}</span></div>
                    <div><span className="text-[#5F5F5F] block font-medium">행운의 방향</span><span className="font-bold text-[#1A1A1A]">{p.direction}</span></div>
                    <div><span className="text-[#5F5F5F] block font-medium">행운의 숫자</span><span className="font-bold text-[#1A1A1A]">{p.number}</span></div>
                    <div><span className="text-[#5F5F5F] block font-medium">개운 추천</span><span className="font-bold text-[#1A1A1A]">{p.items}</span></div>
                  </div>
                  <p className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional print:text-[13px] print:leading-loose"><strong>개운 실천 강령:</strong> {p.action}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자</span>
            <span className="font-myeongjo font-bold">6 / {totalPages}</span>
          </div>
        </div>

        {/* ===== PAGE 7~9: 심화 전용 ===== */}
        {reportGrade === "deep" && (
          <>
            {/* PAGE 7: 신년운세 심화 */}
            <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
              <div>
                <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
                  <CalendarDays className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
                  [심화] 2026년 병오년 신년운세 심화 분석
                </h3>
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-6 shadow-sm print:p-8 print:mb-8 print:border-2">
                  <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 print:text-base print:mb-4">병오년(丙午年)의 세운(歲運) 심층 해석</h4>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                    2026년 병오년(丙午年)은 하늘의 밝은 태양(丙火)과 땅 위의 강력한 말(午火)이 결합된 '천지합화(天地合火)'의 해입니다. 온 세상이 그 어느 해보다 뜨겁고 역동적인 에너지가 급속도로 팽창하는 해로, 감추어졌던 진실이 백일하에 드러나고 새로운 트렌드와 혁신적 변화가 가장 강렬하게 도래하는 혁명적 주기입니다.
                  </p>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional mt-3 pt-3 border-t border-[#E2DDD5]/60 print:text-[14px] print:leading-loose print:mt-4 print:pt-4">
                    <strong>{name}님과 병오년의 심층 기운 조합:</strong><br />{year2026Text}
                  </p>
                </div>
                <div className="bg-red-50/50 border border-red-200 rounded-lg p-5 mb-5 space-y-3 print:p-6 print:mb-6 print:border-2">
                  <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 print:text-base">피흉(避凶) 처방: 올해의 액난과 흉운을 피하는 비법</h4>
                  <ul className="text-xs text-[#5F5F5F] leading-relaxed space-y-2 font-light print:text-[13px] print:space-y-3">
                    <li className="flex gap-1.5 items-start"><span className="text-red-600 font-bold">•</span><span><strong>5~6월 분노 통제:</strong> 병오년의 불꽃이 가장 매섭게 튀는 여름철에는 절대 시비에 휘말리지 마십시오.</span></li>
                    <li className="flex gap-1.5 items-start"><span className="text-red-600 font-bold">•</span><span><strong>도장 찍기 금지 수칙:</strong> 올해의 성급함은 나쁜 계약으로 이어집니다. 반드시 하룻밤 검토 후 서명하십시오.</span></li>
                    <li className="flex gap-1.5 items-start"><span className="text-red-600 font-bold">•</span><span><strong>화(火)성 질환 예방:</strong> 두통, 피부 발진, 심혈관계 이상이 올 수 있습니다. 차가운 음식과 수분 섭취로 몸을 다스리십시오.</span></li>
                  </ul>
                </div>
                <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm print:p-6 print:border-2">
                  <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 print:text-base">
                    <CheckSquare className="w-4 h-4 text-[#A3845B]" />
                    추길(趨吉) 처방: 운명을 내 것으로 만드는 3대 개운 실천
                  </h4>
                  <div className="space-y-3 text-xs text-[#2C2C2C] print:space-y-4">
                    {[
                      { num: 1, title: "침실 및 사무실 남동쪽 공간 정비 (공간 개운)", body: "매일 아침 남쪽과 동쪽 창문을 열어 10분 이상 공기를 순환시키고, 남쪽 구석에 스탠드 조명을 켜거나 맑은 물이 담긴 컵을 배치하여 화기를 중화하십시오." },
                      { num: 2, title: "물(水) 에너지를 흡수하는 저녁 족욕 루틴 (생리 개운)", body: "매주 3회 이상 취침 전 15분간 따뜻한 소금물로 족욕을 실천하십시오. 화 기운으로 날뛰는 열기를 아래로 끌어내려 깊은 통찰력을 기르는 신체 조율법입니다." },
                      { num: 3, title: "주 1회 자연 속 녹색 숲길 걷기 (행동 개운)", body: "나무가 우거진 숲길이나 공원을 걸으며 나무의 청색(木) 기운을 온몸으로 호흡하십시오. 대자연의 생기를 정기적으로 흡입하는 것만으로도 나쁜 시비수를 튕겨낼 수 있습니다." }
                    ].map(item => (
                      <div key={item.num} className="flex gap-3 items-start border-b border-[#E2DDD5]/50 pb-2 print:pb-3 last:border-0">
                        <span className="bg-[#A3845B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 print:w-6 print:h-6">{item.num}</span>
                        <div>
                          <strong className="block text-[#1A1A1A] print:text-[13px]">{item.title}</strong>
                          <span className="text-[#5F5F5F] font-light block mt-0.5 leading-relaxed print:text-[12px]">{item.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
                <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자 [심화]</span>
                <span className="font-myeongjo font-bold">7 / {totalPages}</span>
              </div>
            </div>

            {/* PAGE 8: 용신 해석 */}
            <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
              <div>
                <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
                  <Sparkles className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
                  [심화] 용신 해석 — 팔자에서 가장 중요한 힘과 활용법
                </h3>
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-6 shadow-sm print:p-8 print:mb-8 print:border-2">
                  <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 print:text-base print:mb-4">용신(用神)이란 무엇인가?</h4>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                    용신(用神)은 귀하의 사주 명조에서 가장 핵심적인 역할을 하는 오행으로, 부족하거나 과잉된 기운의 균형을 잡아주며 귀하의 삶을 운명적으로 끌어올리는 '운명의 키(key)'입니다. 이 기운을 생활 속에서 강화할수록 사주 원국의 잠재력이 최대로 발현됩니다.
                  </p>
                </div>
                <div className="bg-[#F6F3EC] border-2 border-[#A3845B]/40 rounded-lg p-6 mb-6 print:p-8 print:mb-8">
                  <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] mb-4 print:text-base print:mb-5">
                    🔑 {name}님의 용신 — {baseEl === "목" ? "수(水) 또는 화(火)" : baseEl === "화" ? "목(木) 또는 토(土)" : baseEl === "토" ? "화(火) 또는 금(金)" : baseEl === "금" ? "토(土) 또는 수(水)" : "금(金) 또는 목(木)"}
                  </h4>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional mb-5 print:text-[14px] print:leading-loose">
                    귀하의 명조에서 일간(日干)은 <strong>{baseEl}</strong>을 대표하며, 사주 전체의 오행 균형을 맞추기 위해
                    {baseEl === "목" ? " 수(水)가 뿌리를 적셔 성장을 돕고, 화(火)가 재주와 표현력을 세상으로 발산시켜주는 역할을" : ""}
                    {baseEl === "화" ? " 목(木)이 연료가 되어 지속적인 열정을 유지시켜주고, 토(土)가 불꽃을 담아 재물로 전환시켜주는 역할을" : ""}
                    {baseEl === "토" ? " 화(火)가 대지를 따뜻하게 데워 생산성을 높이고, 금(金)이 결실을 맺어 재물로 전환시켜주는 역할을" : ""}
                    {baseEl === "금" ? " 토(土)가 쇠를 생성하여 힘을 보강하고, 수(水)가 예리함을 세상으로 흘러보내 재물로 전환시켜주는 역할을" : ""}
                    {baseEl === "수" ? " 금(金)이 수원(水源)이 되어 지혜를 충전시키고, 목(木)이 물을 흡수해 재주로 발현시켜주는 역할을" : ""}
                    합니다.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 print:gap-5">
                    <div className="bg-white rounded-lg p-4 border border-[#E2DDD5] print:p-5">
                      <span className="font-bold text-[#A3845B] block mb-2 print:text-sm">💎 용신을 강화하는 실천법</span>
                      <ul className="space-y-1.5 print:space-y-2">
                        {(baseEl === "목" ? ["매일 저녁 족욕이나 수분 섭취를 늘려 水 기운을 보충하십시오.", "남쪽(火)으로 책상을 배치하여 재주를 세상으로 발산하십시오.", "파란색·검은색 계열의 의류나 소품을 활용하십시오."] :
                          baseEl === "화" ? ["매일 녹색 식물을 가까이 두어 木 기운으로 열정을 유지하십시오.", "황토색 소품을 사무실에 배치해 재물 창고를 굳건히 하십시오.", "동쪽 방향을 향해 아침 일과를 시작하십시오."] :
                          baseEl === "토" ? ["따뜻한 조명과 붉은 소품으로 火 기운을 강화하십시오.", "흰색·실버 계열의 소품으로 결실의 金 기운을 더하십시오.", "남쪽 창문을 열어 햇빛을 충분히 받으십시오."] :
                          baseEl === "금" ? ["노란색·브라운 계열의 물건으로 土 기운을 보강하십시오.", "검은색·파란색 소품으로 水 기운을 추가하십시오.", "서쪽을 향해 중요한 결정을 내리십시오."] :
                          ["흰색·실버 소품과 의류로 金 기운을 강화하십시오.", "녹색 식물을 키워 木 기운으로 재주를 발산하십시오.", "서쪽·북쪽 방향에 책상을 두어 통찰력을 높이십시오."]
                        ).map((t, i) => (
                          <li key={i} className="text-[11px] text-[#5F5F5F] flex gap-1.5 print:text-xs"><span className="text-[#A3845B] font-bold shrink-0">✓</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-[#E2DDD5] print:p-5">
                      <span className="font-bold text-red-700 block mb-2 print:text-sm">🚫 용신을 해치는 행동</span>
                      <ul className="space-y-1.5 print:space-y-2">
                        {(baseEl === "목" ? ["토(土)가 강한 방향(남서쪽)에서 중요한 결정을 피하십시오.", "갈색·황토색 계열의 과도한 사용은 재물 흐름을 막습니다.", "과식이나 과도한 스트레스는 水 기운을 소모시킵니다."] :
                          baseEl === "화" ? ["수(水)가 강한 방향(북쪽)에서 중요한 결정을 피하십시오.", "검은색·파란색 계열의 과도한 사용이 열정을 식힙니다.", "밤 늦게 일하는 습관이 木 기운을 소모시킵니다."] :
                          baseEl === "토" ? ["수(水)가 강한 환경에서 재물 결정을 피하십시오.", "과도한 목(木) 기운이 토를 흩어지게 합니다.", "불규칙한 식사가 土 기운을 약화시킵니다."] :
                          baseEl === "금" ? ["화(火)가 강한 방향(남쪽)에서 감정적 결정을 피하십시오.", "붉은색 계열의 과도한 사용이 결단력을 흐릿하게 합니다.", "불규칙한 수면이 金 기운을 약화시킵니다."] :
                          ["토(土) 과잉 환경이 물의 흐름을 막아 막힘을 만듭니다.", "황토색·브라운 계열 과잉이 지혜 흐름을 방해합니다.", "정체된 공간에 오래 있으면 水 기운이 고여 정체됩니다."]
                        ).map((t, i) => (
                          <li key={i} className="text-[11px] text-[#5F5F5F] flex gap-1.5 print:text-xs"><span className="text-red-500 font-bold shrink-0">✗</span>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
                <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자 [심화]</span>
                <span className="font-myeongjo font-bold">8 / {totalPages}</span>
              </div>
            </div>

            {/* PAGE 9: 대운 흐름 */}
            <div className="print-page-wrapper print:text-[13px] print:leading-relaxed">
              <div>
                <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 mb-6 print:text-lg print:pb-3 print:mb-8">
                  <Compass className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
                  [심화] 대운(大運) 흐름 분석 — 10년 단위 인생 방향성
                </h3>
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-6 shadow-sm print:p-8 print:mb-8 print:border-2">
                  <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] mb-3 print:text-base print:mb-4">대운(大運)이란 무엇인가?</h4>
                  <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                    대운(大運)은 10년 주기로 바뀌는 운명의 큰 흐름입니다. 사람의 일생을 10년씩 나누어 각 시기마다 어떤 오행의 기운이 지배적으로 흐르는지를 알려주는 것이 대운입니다. 같은 사주를 타고나도 대운에 따라 전혀 다른 인생 경로를 걷게 되므로, 대운의 흐름을 파악하는 것은 인생 전략을 세우는 핵심 도구입니다.
                  </p>
                </div>
                <div className="space-y-4 print:space-y-5">
                  {[
                    { period: "20대 중반 ~ 30대 중반", element: "수(水) 대운", num: 1, desc: "깊은 내공을 쌓는 시기입니다. 겉으로 드러나는 화려한 성취보다는 전문적 역량과 인적 자산을 조용히 쌓아가는 준비의 10년입니다. 이 시기에 배운 지식과 기술이 이후 대운에서 폭발적인 성취의 씨앗이 됩니다.", advice: "기회를 기다리며 실력을 갈고닦으십시오. 좋은 스승과 멘토를 찾아 적극 배우는 것이 이 대운의 핵심 전략입니다." },
                    { period: "30대 후반 ~ 40대 후반", element: "목(木) 대운", num: 2, desc: "씨앗이 싹을 틔우고 성장하기 시작하는 도약의 10년입니다. 사회적 위치가 빠르게 상승하고 이직, 창업, 독립 등 주체적인 행보를 본격적으로 실천하는 시기입니다.", advice: "네트워크를 최대한 활용하고, 기회가 왔을 때 과감히 도전하십시오. 인맥이 재물로 연결되는 시기입니다." },
                    { period: "40대 후반 ~ 50대 후반", element: "화(火) 대운", num: 3, desc: "인생의 절정기입니다. 화(火)의 밝고 뜨거운 기운이 귀하의 잠재력을 세상 앞에 완전히 발현시킵니다. 사회적 명성, 경제적 풍요, 직위의 상승이 동시에 찾아오는 인생 최대의 황금기입니다.", advice: "이 시기에 큰 결실을 거두되, 교만하지 않게 겸손함을 유지하는 것이 과유불급을 막는 지혜입니다." },
                    { period: "50대 후반 ~ 60대 후반", element: "토(土) 대운", num: 4, desc: "결실을 단단히 굳히고 자산을 보존하는 안정의 10년입니다. 대지처럼 넉넉하게 품는 土의 기운이 귀하를 주변의 신뢰와 존경으로 감싸줍니다. 은퇴를 준비하거나 후진을 양성하는 멘토의 역할이 시작됩니다.", advice: "욕심을 줄이고 이미 이룬 것을 지키는 데 집중하십시오. 자선과 베풂이 이 대운의 기운을 더욱 빛나게 합니다." }
                  ].map((d) => (
                    <div key={d.num} className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm print:p-6 print:border-2">
                      <div className="flex items-start justify-between mb-3 print:mb-4">
                        <div>
                          <span className="font-myeongjo text-xs font-bold text-[#1A1A1A] block print:text-sm">{d.period}</span>
                          <span className="text-xs text-[#A3845B] font-semibold print:text-sm">{d.element}</span>
                        </div>
                        <span className="text-[10px] bg-[#A3845B]/10 text-[#A3845B] px-2 py-0.5 rounded font-bold print:text-xs">대운 {d.num}기</span>
                      </div>
                      <p className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional mb-2 print:text-[13px] print:leading-loose print:mb-3">{d.desc}</p>
                      <div className="bg-[#F6F3EC] border-l-2 border-[#A3845B] pl-3 py-1.5 text-[11px] text-[#2C2C2C] print:text-[12px]">
                        <strong className="text-[#A3845B]">대운 전략:</strong> {d.advice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs print:mt-8">
                <span className="font-myeongjo">慧眼堂 寶鑑 · 평생 사주팔자 [심화]</span>
                <span className="font-myeongjo font-bold">9 / {totalPages}</span>
              </div>
            </div>
          </>
        )}
      </>
    );
  };


  // ----------------------------------------------------
  // Render: 신년 운세 (newyear) - Upgraded based on feedback
  // ----------------------------------------------------
    // ----------------------------------------------------
  // Render: 신년 운세 SMS 요약본
  // ----------------------------------------------------
  const renderSmsNewYearContent = () => {
    let yearInteractionText = "";
    if (baseEl === "목") {
      yearInteractionText = "나무(木) 일간인 귀하에게 2026년은 내 능력을 널리 펼쳐 활발히 행동하는 '식상(食傷)'의 해입니다. 두뇌 회전이 빨라지고 활동량이 급증하지만 피로와 욱하는 감정을 주의하십시오.";
    } else if (baseEl === "화") {
      yearInteractionText = "불(火) 일간인 귀하에게 2026년은 주체성과 고집이 극대화되는 '비겁(比劫)'의 해입니다. 자립과 창업운이 요동치나 타인과의 시비 및 자존심 대립을 조심해야 합니다.";
    } else if (baseEl === "토") {
      yearInteractionText = "대지(土) 일간인 귀하에게 2026년은 나를 후원해 주는 귀인과 문서운이 따르는 '인성(印星)'의 해입니다. 공부, 자격증, 관청의 인허가 등에서 큰 공을 얻게 될 것입니다.";
    } else if (baseEl === "금") {
      yearInteractionText = "바위(金) 일간인 귀하에게 2026년은 중책을 맡아 능력을 단련하고 시험하는 '관성(官星)'의 해입니다. 승진 및 취업 기회가 있으나 스트레스와 상사와의 마찰을 조심하십시오.";
    } else { // 수
      yearInteractionText = "물(水) 일간인 귀하에게 2026년은 뜻밖의 금전적 기회와 성과를 얻게 되는 '재성(財星)'의 해입니다. 투자와 연봉 상승의 기회가 있으나 무리하면 건강에 지장을 줄 수 있습니다.";
    }

    const decodedWorry = worryText ? decodeURIComponent(worryText) : "";
    const worrySolutionText = decodedWorry
      ? `귀하의 고민 [${decodedWorry}]에 대해:\n  올해는 병오년의 조급한 화(火) 기운으로 인해 성급히 판단하면 그르치기 쉽습니다. 가을철(음력 8월) 이전까지는 중요한 결정을 유보하고, 현상을 안정적으로 유지하며 에너지를 실속 있게 다지는 것이 가장 유리합니다.`
      : "올해 고민 솔루션:\n  올해는 조급한 감정적 충동을 억제하고 정중동(靜中動)의 자세를 유지하는 것이 좋습니다. 특히 가을 이전에는 서투른 확장을 피해 손재수를 차단하십시오.";

    const elStats = `목(${sajuInfo.elements.목}개) | 화(${sajuInfo.elements.화}개) | 토(${sajuInfo.elements.토}개) | 금(${sajuInfo.elements.금}개) | 수(${sajuInfo.elements.수}개)`;

    const smsText = `[혜안당 명리연구소] 2026 병오년 신년운세 요약
──────────────────────────────
본 문서는 ${name} 님의 2026년 토정비결 및 신년운세 요약본입니다.

■ 1. 2026년 병오년(丙午年) 운세 기조
- 세운 특징: 천지합화(天地合火) - 하늘과 대지가 거대한 불꽃으로 화합하는 역동적 한 해
- 기운 오행 분포: ${elStats}
- 기질 융합 해석:
  ${yearInteractionText}

■ 2. 2026년 분기별 행동 플레이북
- 1분기 (음력 1~3월): 변동운이 스쳐 가나 이직이나 계약 시 섣부른 즉답을 피하고 서류를 철저히 검토하십시오.
- 2분기 (음력 4~6월): 타오르는 불꽃이 뜨거워지니 구설수와 시비를 조심하고, 10분 늦게 화내며 감정을 다스려야 안전합니다.
- 3분기 (음력 7~9월): 현실적 결실을 맺는 시기입니다. 이직, 승진, 재물 획득에 있어서 추진력을 발휘하기에 최적입니다.
- 4분기 (음력 10~12월): 한 해를 마무리하며 에너지를 갈무리하는 평온한 재충전과 자산 지키기에 힘써야 합니다.

■ 3. 맞춤 고민 극복 솔루션
- ${worrySolutionText}

■ 4. 올해의 행운 개운 비법
- 행운의 색상: ${prescriptions[0]?.color || "밝은 계열"}
- 행운의 상성 방향: ${prescriptions[0]?.direction || "중앙"}
- 행운의 숫자: ${prescriptions[0]?.number || "5, 10"}

──────────────────────────────
* 본 요약본은 혜안당 명리분석 시스템에 의해 계산 및 정밀 빌드되었습니다.`;

    return (
      <div className="max-w-md mx-auto bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-md text-center space-y-6 my-4 print:border-none print:shadow-none">
        <div className="bg-[#A3845B]/10 p-3 rounded-lg border-b border-[#A3845B]/20 flex justify-between items-center">
          <span className="text-xs font-semibold text-[#A3845B] tracking-wider">모바일 알림톡 수신본</span>
          <span className="text-[10px] text-gray-500 font-light">LMS 요약본</span>
        </div>

        <div className="space-y-4 text-left border border-dashed border-[#A3845B]/30 p-5 rounded-lg bg-[#F9F8F6]/80 max-h-[500px] overflow-y-auto custom-scrollbar">
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 text-center tracking-wider">
            {name} 님의 2026년 신년운세 요약 보감
          </h4>
          
          <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed">
            <div>
              <span className="font-semibold text-[11px] text-[#A3845B] block mb-1">■ 1. 2026년 병오년 세운 기조</span>
              <p><strong>• 세운 특징:</strong> <span className="font-semibold text-[#A3845B]">천지합화(天地合火) - 역동적 불꽃</span></p>
              <p><strong>• 오행 구성:</strong> <span className="font-semibold text-gray-700">{elStats}</span></p>
              <p className="text-[11px] text-[#5F5F5F] font-light mt-1 bg-white p-2 rounded border border-gray-100">
                <strong>기질 융합:</strong> {yearInteractionText}
              </p>
            </div>
            
            <div className="border-t border-[#E2DDD5]/60 pt-3 space-y-2 bg-white p-3 rounded-lg border">
              <span className="font-semibold text-[11px] text-[#A3845B] block mb-1">💡 2. 분기별 전술 Playbook</span>
              <p><strong>- 1분기:</strong> 이직/변동 제안 시 즉답 피하고 계약 서류 철저 분석</p>
              <p><strong>- 2분기:</strong> 대인관계 충돌 및 욱하는 구설수 조심 (10분 늦추기)</p>
              <p><strong>- 3분기:</strong> 현실적 결실 및 성과 창출의 가장 유리한 황금기</p>
              <p><strong>- 4분기:</strong> 에너지 갈무리와 평온한 자산 지키기 지향</p>
            </div>
            
            <div className="border-t border-[#E2DDD5]/60 pt-3">
              <span className="font-semibold text-[11px] text-[#A3845B] block">🔑 3. 올해의 고민 솔루션</span>
              <p className="text-[11px] text-[#5F5F5F] font-light mt-1 whitespace-pre-line leading-relaxed">
                {decodedWorry ? `질문하신 [${decodedWorry}] 안건 처방:\n` : ""}
                올해는 급한 마음에 행동하면 실수가 발생하니, 음력 8월(가을철) 이전까지는 결정을 서두르지 마시고 현상을 유지하며 실력을 단련하는 것이 길합니다.
              </p>
            </div>

            <div className="border-t border-[#E2DDD5]/60 pt-3 space-y-1">
              <span className="font-semibold text-[11px] text-[#A3845B] block">🍀 4. 행운의 개운 비법</span>
              <p><strong>• 행운의 색상:</strong> {prescriptions[0]?.color || "밝은 계열"}</p>
              <p><strong>• 행운의 방향:</strong> {prescriptions[0]?.direction || "중앙"}</p>
              <p><strong>• 행운의 숫자:</strong> {prescriptions[0]?.number || "5, 10"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleCopySms(smsText)}
            className="w-full py-2.5 bg-[#A3845B] text-[#F9F8F6] rounded text-xs font-semibold hover:bg-[#86653E] transition-colors shadow-sm cursor-pointer"
          >
            {copied ? "✓ 문자 복사 완료!" : "💬 전체 문자 내용 복사하기"}
          </button>
          <p className="text-[9px] text-gray-400 font-light">
            * 복사한 내용을 가족이나 지인에게 메신저/문자로 공유하실 수 있습니다.
          </p>
        </div>
      </div>
    );
  };

  const renderNewYearContent = () => {
    if (reportGrade === "sms") {
      return renderSmsNewYearContent();
    }
    const totalPages = reportGrade === "deep" ? 4 : 3;
    // Generate interaction summary based on user's birth element
    let yearInteractionText = "";
    if (baseEl === "목") {
      yearInteractionText = "귀하는 청량한 나무(木)의 사주 기질을 지녀, 2026년 병오년의 불꽃(火)을 만나면 내 능력을 넓게 세상에 알리는 활기찬 '식상 대운(食傷大운)'의 해가 됩니다. 잠자던 두뇌 회전이 빨라지고 활동량이 급증하지만, 내 수분이 빨려 나가 피로감과 불만족(욱하는 감정)이 동반되므로 체력의 한계를 늘 감시해야 합니다.";
    } else if (baseEl === "화") {
      yearInteractionText = "귀하는 태오난 불(火)의 기운을 담아, 2026년의 거대한 동일 불꽃(火)을 보아 사주상 '비겁 대왕(比劫大왕)'의 주체적 해가 됩니다. 자존심이 극대화되어 스스로의 독립, 창업, 신규 구상이 꿈틀거립니다. 다만, 강한 불끼리 충돌하여 동업자 간 자존심 대립이나 지인과의 시비가 커질 우려가 크니 한 걸음 양보가 필수입니다.";
    } else if (baseEl === "토") {
      yearInteractionText = "귀하는 넉넉한 대지(土)의 기운을 품고 태어나, 2026년의 불(火)이 흙을 다정히 덥혀주는 '인성 대운(印星大運)'의 매우 길한 조화를 얻습니다. 공부운, 자격증, 관청의 인허가 등 문서 취득에 큰 공이 따르고 나를 후원해 주는 조력자나 귀인의 등장이 강력하게 보장되는 은혜로운 한 해가 될 것입니다.";
    } else if (baseEl === "금") {
      yearInteractionText = "귀하는 단단한 바위(金)의 기질로 태어나, 2026년의 맹렬한 불꽃(火)이 나를 단련하고 시험하는 강력한 '관성 대운(官星大運)'을 맞이합니다. 직장에서 중책을 맡아 책무가 막중해지거나 큰 자리에 승진할 기회가 있으나, 스트레스가 극에 달해 뼈나 호흡기 계통 건강 악화 및 상사와의 마찰을 조심해야 합니다.";
    } else { // 수
      yearInteractionText = "귀하는 깊고 시원한 물(水)의 기질로 태어나, 2026년 병오년의 거대한 불꽃(火)을 가두고 통제하려는 '재성 대운(財星大運)'의 한 해를 보냅니다. 금전적인 투자 성취, 연봉 상승, 뜻밖의 상속 등 금전 기회가 크게 요동칩니다. 그러나 큰불을 끄느라 나의 수분이 고갈되므로 건강 관리를 위해 충분히 멈출 줄 아는 지혜가 필요합니다.";
    }

    return (
      <>
        {/* --- PAGE 1: 2026 병오년 신년 운세 --- */}
        <div className="print-page-wrapper print:text-[13.5px] print:leading-relaxed">
          <div>
            {/* Title Block */}
            <div className="text-center space-y-2 mb-8 print:mb-10">
              <span className="text-xs tracking-widest text-[#A3845B] font-bold block print:text-sm">병오년 토정비결</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider print:text-3xl">
                제 1장. 2026년 세운 및 기질 융합
              </h2>
              <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto my-2" />
            </div>

            {/* 2026 Meaning Section */}
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-3 print:p-8 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 print:text-base print:font-bold">
                <Compass className="w-4 h-4 text-[#A3845B] print:w-5 print:h-5" />
                2026년 병오년(丙午年)은 어떤 해인가?
              </h4>
              <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                올해 <strong>병오년(丙午年)은 하늘의 밝은 태양(丙火)과 땅 위의 강력한 말(午火)이 결합된 '천지합화(天地合火)'의 해</strong>입니다. 온 세상이 그 어느 해보다 뜨겁고 역동적인 에너지가 급속도로 팽창하는 해로, 감추어졌던 진실이 백일하에 드러나고 새로운 트렌드나 혁신적 변화가 가장 강렬하게 도래하는 혁명적 주기입니다.
              </p>
              <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border-t border-[#E2DDD5]/60 pt-3 print:text-[14px] print:leading-loose print:pt-4">
                <strong>{name}님의 타고난 기질과 병오년 불꽃의 궁합:</strong><br />
                {yearInteractionText}
              </p>
            </div>

            {/* Worry Context Analysis if exists */}
            {worryText && (
              <div className="bg-[#F6F3EC] border-2 border-red-200/50 rounded-lg p-5 mb-8 shadow-sm space-y-3 print:p-8 print:border-red-300">
                <span className="font-bold text-red-600 text-xs flex items-center gap-1 print:text-sm">
                  <AlertCircle className="w-3.5 h-3.5 print:w-4 print:h-4" />
                  올해의 1순위 극복 과제: "{decodeURIComponent(worryText)}"
                </span>
                <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional print:text-[14px] print:leading-loose">
                  올해 귀하께서 질문하신 이 안건은 병오년 특유의 <strong>'조급한 감정적 충돌'과 '급작스러운 팽창력'</strong> 때문에 발생하거나 악화될 위험이 큽니다. 현재 답을 억지로 짜내기 위해 발을 동동 구르기보다, 음력 윤달과 절기가 겹치는 가을 문턱 이전까지는 현 상태를 유지하며 에너지를 충전하는 정중동(靜中동)의 전술이 절실합니다.
                </p>
              </div>
            )}
          </div>

          {/* Footer Seal */}
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 신년운세</span>
            <span className="font-myeongjo font-bold">1 / {totalPages}</span>
          </div>
        </div>

        {/* --- PAGE 2: 분기별 흐름과 행동 전술 --- */}
        <div className="print-page-wrapper print:text-[13.5px] print:leading-relaxed">
          <div>
            {/* Quarterly 상황 & 전술 Playbook */}
            <div className="space-y-4 mb-4">
              <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2 print:text-lg print:pb-3">
                <CalendarDays className="w-4.5 h-4.5 text-[#A3845B] print:w-5 print:h-5" />
                2026년 분기별 흐름과 행동 전술
              </h3>

              <div className="space-y-4 print:space-y-5">
                {/* Q1 */}
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5 print:p-6 print:border-2">
                  <span className="text-xs font-bold text-[#A3845B] block border-b border-[#E2DDD5]/50 pb-1 print:text-sm print:pb-2">
                    🌸 1분기 (음력 1~3월) : 새 기운의 도래와 설계의 시작
                  </span>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light print:text-[12.5px] print:leading-relaxed">
                    <strong>상황 상황:</strong> 새해가 시작되며 기분 좋은 변동운이 스쳐 지나갑니다. 이직 제안이나 새로운 인간관계가 생기지만 아직 내실이 완성되지 않은 단계입니다. 계약 등을 체결할 때 조건 조율에 어려움이 있을 수 있습니다.<br />
                    <strong>생존 전술:</strong> 타인의 제안에 귀가 솔깃하더라도 즉답을 미루고 일주일 간 자료를 수집하십시오. 특히 대인관계에서 사소한 약속을 꼭 문서화하여 뒷날의 배신수를 미연에 방지하는 실천이 필요합니다.
                  </p>
                </div>

                {/* Q2 */}
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5 print:p-6 print:border-2">
                  <span className="text-xs font-bold text-[#A3845B] block border-b border-[#E2DDD5]/50 pb-1 print:text-sm print:pb-2">
                    ☀️ 2분기 (음력 4~6월) : 에너지의 초과 팽창과 충돌 주의보
                  </span>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light print:text-[12.5px] print:leading-relaxed">
                    <strong>상황 상황:</strong> 1년 중 화(火) 기운이 가장 폭발하는 시기로 스트레스 지수가 극대화됩니다. 욱하는 성정 때문에 상사나 배우자와의 충돌 수가 짙어지며, 재물 투자에서 욕심을 내다 손재수가 생기기 쉬운 최대의 고비입니다.<br />
                    <strong>생존 전술:</strong> 중요한 도장 날인이나 퇴사 결단은 절대 이 시기에 내리지 마십시오. 몸에 수분을 공급하고 찬 성질의 음식을 먹어 혈압을 낮추며, 갈등 상황에서 10초간 눈을 감고 대답하는 침묵 수련이 운을 살립니다.
                  </p>
                </div>

                {/* Q3 */}
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5 print:p-6 print:border-2">
                  <span className="text-xs font-bold text-[#A3845B] block border-b border-[#E2DDD5]/50 pb-1 print:text-sm print:pb-2">
                    🍁 3분기 (음력 7~9월) : 가을의 서리 기운과 안정적인 조정
                  </span>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light print:text-[12.5px] print:leading-relaxed">
                    <strong>상황 상황:</strong> 뜨거운 화기를 금(金)의 서리 기운이 식혀주며 이성이 돌아옵니다. 그동안 미뤄졌던 이직이 가을에 결정 나거나, 관계의 오해가 풀려 안정감을 되찾습니다. 건강상의 회복 탄력성도 최고조에 달합니다.<br />
                    <strong>생존 전술:</strong> 상반기에 기획했던 안건을 이때 세상에 내어놓으십시오. 이력서를 넣거나 투자 포트폴리오를 조정하기에 가장 완벽한 시기입니다. 귀인의 조언을 경청하면 뜻밖의 소득을 얻습니다.
                  </p>
                </div>

                {/* Q4 */}
                <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5 print:p-6 print:border-2">
                  <span className="text-xs font-bold text-[#A3845B] block border-b border-[#E2DDD5]/50 pb-1 print:text-sm print:pb-2">
                    ❄️ 4분기 (음력 10~12월) : 알찬 수확과 평온한 마무리
                  </span>
                  <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light print:text-[12.5px] print:leading-relaxed">
                    <strong>상황 상황:</strong> 대지의 기운이 겨울의 차가운 물속에 고정되며 금전 보상과 가정이 화평해집니다. 지나치게 욕심내지 않았다면 1년 농사의 달콤한 보너스를 챙기며 한 해를 미소 지으며 보낼 수 있습니다.<br />
                    <strong>생존 전술:</strong> 번 돈의 절반은 비상금으로 동결하여 내년을 준비하십시오. 가족과 뜻깊은 여행을 가거나 나를 위한 작은 사치를 누려 에너지를 재충전하고 정서적 균형을 가다듬는 휴식을 누려야 합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 신년운세</span>
            <span className="font-myeongjo font-bold">2 / {totalPages}</span>
          </div>
        </div>

        {/* --- PAGE 3: 피흉 처방 및 추길 처방 --- */}
        <div className="print-page-wrapper print:text-[13.5px] print:leading-relaxed">
          <div>
            {/* 피흉처방 (Avoid Bad Luck) */}
            <div className="bg-red-50/50 border border-red-200 rounded-lg p-5 mb-6 space-y-3 print:p-6 print:mb-8 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 print:text-base print:font-bold">
                <AlertCircle className="w-4 h-4 text-red-700" />
                피흉(避凶) 처방: 올해의 액난과 흉운을 무사히 피하는 비법
              </h4>
              <ul className="text-xs text-[#5F5F5F] leading-relaxed space-y-2 font-light print:text-[13px] print:leading-relaxed">
                <li className="flex gap-1.5 items-start">
                  <span className="text-red-600 font-bold">•</span>
                  <strong>5~6월 분노 통제:</strong> 병오년의 불꽃이 가장 매섭게 튀는 여름철(음력 5~6월)에는 절대 시비에 휘말리지 마십시오. 시비가 있을 때는 '그럴 수 있지'라는 문장을 입에 달고 사셔야 화를 피합니다.
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-red-600 font-bold">•</span>
                  <strong>도장 찍기 금지 수칙:</strong> 올해의 성급함은 나쁜 계약으로 연결되기 쉽습니다. 어떠한 서류 체결이든 당일 즉각 승인하지 마시고, 최소 하룻밤을 자고 타인의 검토를 거친 후 서명하십시오.
                </li>
                <li className="flex gap-1.5 items-start">
                  <span className="text-red-600 font-bold">•</span>
                  <strong>화(火)성 질환 예방:</strong> 몸에 열이 몰려 두통, 피부 발진, 심혈관계 이상이 올 수 있습니다. 매일 차가운 물이나 오이, 수박 같은 음의 기질을 지닌 식품을 섭취해 몸속 온도를 낮추십시오.
                </li>
              </ul>
            </div>

            {/* 추길처방 (Improve Fortune To-Dos) */}
            <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm print:p-6 print:border-2">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 print:text-base print:font-bold">
                <CheckSquare className="w-4 h-4 text-[#A3845B]" />
                추길(趨吉) 처방: 운명을 내 것으로 만드는 3대 개운 실천 To-Do 리스트
              </h4>
              <div className="space-y-3 text-xs text-[#2C2C2C] print:space-y-4">
                <div className="flex gap-3 items-start border-b border-[#E2DDD5]/50 pb-2 print:pb-3">
                  <span className="bg-[#A3845B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 print:w-6 print:h-6 print:text-[11px]">1</span>
                  <div>
                    <strong className="block text-[#1A1A1A] print:text-[13px]">침실 및 사무실 남동쪽 공간 정비 (공간 개운)</strong>
                    <span className="text-foreground-muted font-light block mt-0.5 leading-relaxed print:text-[12px]">
                      매일 아침 남쪽과 동쪽 창문을 열어 10분 이상 공기를 순환시키고, 남쪽 구석의 어둡고 먼지가 쌓인 곳에 스탠드 조명을 켜거나 맑은 물이 담긴 컵을 배치하여 화기를 중화하십시오.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start border-b border-[#E2DDD5]/50 pb-2 print:pb-3">
                  <span className="bg-[#A3845B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 print:w-6 print:h-6 print:text-[11px]">2</span>
                  <div>
                    <strong className="block text-[#1A1A1A] print:text-[13px]">물(水) 에너지를 흡수하는 저녁 족욕 루틴 (생리 개운)</strong>
                    <span className="text-foreground-muted font-light block mt-0.5 leading-relaxed print:text-[12px]">
                      매주 3회 이상 취침 전 15분간 따뜻한 소금물로 족욕을 실천하십시오. 화 기운으로 날뛰는 열기를 아래로 끌어내려 밤사이 뇌의 피로를 지우고 깊은 통찰력을 기르는 신체 조율법입니다.
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="bg-[#A3845B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 print:w-6 print:h-6 print:text-[11px]">3</span>
                  <div>
                    <strong className="block text-[#1A1A1A] print:text-[13px]">주 1회 자연 속 녹색 숲길 걷기 (행동 개운)</strong>
                    <span className="text-foreground-muted font-light block mt-0.5 leading-relaxed print:text-[12px]">
                      나무가 우거진 숲길이나 공원을 걸으며 나무의 청색(木) 기운을 온몸으로 호흡하십시오. 올해는 기운의 소모가 격렬하므로, 대자연의 생기를 정기적으로 흡입해 주는 것만으로도 나쁜 시비수를 완전히 튕겨낼 수 있습니다.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Seal */}
          <div className="flex justify-between items-center border-t border-[#E2DDD5] pt-4 mt-6 text-[10px] text-[#5F5F5F] print:text-xs">
            <span className="font-myeongjo">慧眼堂 寶鑑 · 신년운세</span>
            <span className="font-myeongjo font-bold">3 / {totalPages}</span>
          </div>
        </div>
      </>
    );
  };;

  // ----------------------------------------------------
  // Render: 재물 & 비즈니스운 (wealth) - Upgraded to Premium
  // ----------------------------------------------------
  const renderWealthContent = () => {
    // Determine wealth profile description based on base element
    let wealthTypeTitle = "";
    let wealthTypeDesc = "";
    let luckyDirection = "";
    let luckyWalletColor = "";

    if (baseEl === "목") {
      wealthTypeTitle = "목(木) - 나무처럼 쑥쑥 자라는 성장형 재물 그릇";
      wealthTypeDesc = "귀하는 뿌리를 내리고 하늘로 곧게 뻗어나가는 나무(木)의 재물 성향을 지녔습니다. 일확천금이나 투기성 단타보다는 교육, 지식 콘텐츠, 꾸준한 기술 서비스 등 신뢰를 쌓아 장기적으로 자산 가치를 우상향시키는 비즈니스 모델에 최적화되어 있습니다. 시간이 지날수록 인맥이 돈으로 치환되는 복리 효과형 재물 선순환을 보입니다.";
      luckyDirection = "동쪽 (침실에 동쪽으로 머리를 두면 머리가 맑아지고 아이디어가 살아납니다)";
      luckyWalletColor = "녹색 또는 딥그린 (초록색 가죽 지갑이나 가방을 들면 새어나가는 재물을 잡아줍니다)";
    } else if (baseEl === "화") {
      wealthTypeTitle = "화(火) - 활활 타오르는 화려한 돌파형 재물 그릇";
      wealthTypeDesc = "귀하는 어둠을 밝히고 순식간에 번져나가는 불(火)의 재물 성향을 지녔습니다. 기획력과 추진력이 남달라 남들이 보지 못하는 시장의 틈새를 찾아 빠르게 선점하고 단기간에 큰돈을 벌어들이는 비즈니스 모델에 탁월합니다. 다만, 번 돈을 관리하는 꼼꼼함이 부족하면 땔감이 다하듯 한순간에 흩어질 위험이 있으니 문서 자산(부동산 등)에 재산을 묶어두는 것이 핵심입니다.";
      luckyDirection = "남쪽 (남쪽으로 머리를 두고 자면 열정과 행동력이 배가되며 사업 성취에 이롭습니다)";
      luckyWalletColor = "붉은색 또는 버건디 (강렬한 포인트 컬러가 행운을 자극하여 일의 성사율을 높입니다)";
    } else if (baseEl === "토") {
      wealthTypeTitle = "토(土) - 넉넉하게 품는 부동산형 비보(裨補) 재물 그릇";
      wealthTypeDesc = "귀하는 만물을 기르고 지탱하는 대지(土)의 재물 성향을 지녔습니다. 5대 오행 중 가장 든든하고 안정적인 재물 성향을 자랑하며, 실물 가치(부동산, 토지, 금, 골동품)를 매입해 장기 동결했을 때 가장 큰 폭의 부를 일굽니다. 남들에게 깊은 신뢰를 주는 카리스마가 있어 컨설팅, 중개, 유통 중개업 등 플랫폼 비즈니스에서 탁월한 수수료 수익을 창출할 수 있는 그릇입니다.";
      luckyDirection = "중앙 또는 서남쪽 (방의 중심에서 볼 때 서남쪽에 중요한 문서나 금고를 보관하십시오)";
      luckyWalletColor = "노란색, 베이지 또는 브라운 (황토색이나 베이지 계열 가죽 제품이 재물 창고를 굳건히 지켜줍니다)";
    } else if (baseEl === "금") {
      wealthTypeTitle = "금(金) - 칼날 같은 명확성을 지닌 금융/기획형 재물 그릇";
      wealthTypeDesc = "귀하는 쓸모없는 것을 잘라내고 열매를 맺는 쇠붙이(金)의 재물 성향을 지녔습니다. 감정에 흔들리지 않는 냉철한 수리 감각과 결단력이 있어 금융투자, 지분 투자, 라이선스 권리수수료, 법률/세무 전문직 구조를 통한 부의 획득에 탁월합니다. 불필요한 고정비를 과감하게 단절하여 잉여 자금을 모으는 순도 높은 재무구조를 실현하는 능력이 뛰어납니다.";
      luckyDirection = "서쪽 (서쪽으로 머리를 두고 취침하면 잡념이 가라앉고 냉철한 판단력이 강화됩니다)";
      luckyWalletColor = "흰색 또는 메탈 실버 (깔끔한 실버 또는 화이트 컬러 지갑이 불필요한 지출을 통제하는 기운을 줍니다)";
    } else { // 수
      wealthTypeTitle = "수(水) - 바다처럼 막힘없이 흐르는 순환형 사업 재물 그릇";
      wealthTypeDesc = "귀하는 장애물을 유연하게 우회하고 모여드는 물(水)의 재물 성향을 지녔습니다. 유통, 무역, 온라인 쇼핑몰, 마케팅, 서비스 대행 등 유동성이 높고 변화무쌍한 디지털 비즈니스에 최고의 능력을 발휘합니다. 막힌 물길을 트듯 현금의 회전율을 극대화하여 자산을 크게 굴리는 재주가 있으며, 정보를 지식 상품화하여 로열티를 받는 무형 자산 창출에 최적화되어 있습니다.";
      luckyDirection = "북쪽 (북쪽으로 머리를 두면 마음의 불안감이 씻겨나가고 예지몽과 통찰력을 돕습니다)";
      luckyWalletColor = "검은색 또는 네이비 (검은색 천연 가죽 지갑이 물줄기처럼 모인 돈을 조용히 가둬두는 금전고 역할을 합니다)";
    }

    return (
      <>
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-[#5F7A68] font-bold block">재물 운세 보감</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 평생 재물 및 비즈니스 성향 진단
          </h2>
          <div className="w-24 h-0.5 bg-[#5F7A68]/30 mx-auto my-2" />
        </div>

        {/* User Worry Context Analysis */}
        {worryText && (
          <div className="border-l-4 border-jade bg-[#5F7A68]/5 p-5 rounded-lg mb-8 text-xs space-y-2 shadow-sm">
            <span className="font-bold text-jade flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              의뢰하신 금전/사업 갈등 심층 솔루션:
            </span>
            <p className="italic text-foreground-muted">"{decodeURIComponent(worryText)}"</p>
            <p className="text-[#2C2C2C] leading-relaxed pt-2 border-t border-[#E2DDD5]/60 font-light font-traditional">
              귀하의 사주는 재물을 끌어오는 머리와 수완은 출중하나, 마무리가 급해 손실을 입을 위험이 도사립니다. 질문하신 사업/투자 안건은 올해 병오년의 불꽃 기운 때문에 자칫 오판을 하거나 귀인의 탈을 쓴 사기수에 노출될 수 있으니 아래의 기질과 안전 수칙을 철저히 지키십시오.
            </p>
          </div>
        )}

        {/* Core Wealth Vessel Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center text-xs">
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">평생 재물 그릇 크기</span>
            <span className="font-bold text-sm sm:text-base text-[#5F7A68]">중상급 (中上級)</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">최적 비즈니스 분야</span>
            <span className="font-bold text-sm sm:text-base text-[#5F7A68]">유통/지식/부동산</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">재물 관리 취약점</span>
            <span className="font-bold text-sm sm:text-base text-red-600">단타 투자/동업</span>
          </div>
        </div>

        {/* Premium Upgrade: 1. 재물 성향 상세 진단 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-3">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#E2DDD5] pb-2">
            <Sparkles className="w-4 h-4 text-[#5F7A68]" />
            오행 기반 평생 재물 성향 진단
          </h4>
          <span className="font-bold text-[#1A1A1A] text-xs block">{wealthTypeTitle}</span>
          <p className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional">
            {wealthTypeDesc}
          </p>
        </div>

        {/* Premium Upgrade: 2. 비즈니스 기질 지표 (Dynamic Progress Bars) */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#E2DDD5] pb-2">
            <Award className="w-4 h-4 text-[#5F7A68]" />
            성공 비즈니스를 위한 3대 기질 지표
          </h4>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">🚀 창업/사업적 돌파 및 추진력</span>
                <span className="text-[#5F7A68] font-bold">85%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "85%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">🛡️ 자산 안전 수호 및 리스크 통제력</span>
                <span className="text-[#5F7A68] font-bold">60%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full" style={{ width: "60%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">🤝 귀인 운세 및 동업 파트너십 상성</span>
                <span className="text-[#5F7A68] font-bold">75%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-foreground-muted leading-relaxed font-light">
            * 귀하는 사업 돌파력과 매출 생성 기운은 아주 강하게 타고났으나, 번 돈을 흘려보내지 않고 안전하게 묶어두는 통제력이 상대적으로 낮습니다. 금융 상품의 자동 이체 비중을 늘리고 투자를 결정할 때 3인 이상의 검증된 피드백을 받는 프로세스를 구축하십시오.
          </p>
        </div>

        {/* Premium Upgrade: 3. 인생의 3대 재물 기회기 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5 border-b border-[#E2DDD5] pb-2">
            <CalendarDays className="w-4 h-4 text-[#A3845B]" />
            평생 마주할 인생의 3대 재물 기회기 (Golden Eras)
          </h4>

          <div className="space-y-3">
            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">1차 황금기 (28세 ~ 35세) : 기초 자산 형성기</span>
              <p className="text-[11px] text-foreground-muted font-light leading-relaxed">
                사회 활동의 정착과 전문직/사업 기반의 성립으로 첫 자산이 모이는 시기입니다. 이 시기에 뿌려진 인맥과 배움이 중년 대박의 거름이 됩니다.
              </p>
            </div>
            
            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">2차 황금기 (42세 ~ 48세) : 인생 최대의 수확기</span>
              <p className="text-[11px] text-foreground-muted font-light leading-relaxed">
                사주의 대운 흐름 상, 부족한 재성 또는 관성이 보강되는 대운 교차기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.
              </p>
            </div>

            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">3차 황금기 (55세 ~ 62세) : 수동적 임대/연금 수익기</span>
              <p className="text-[11px] text-foreground-muted font-light leading-relaxed">
                무리한 실무 활동을 줄이고, 문서나 부동산, 로열티 등을 통해 시스템 소득이 매월 안정적으로 통장에 꽂히는 평온한 노후 소득 정착기입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Premium Upgrade: 4. 재물 수호 비책 & 개운법 */}
        <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm mb-6">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Shield className="w-4.5 h-4.5 text-[#5F7A68]" />
            재물 수호 비책 & 금전 개운법
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4 text-xs font-light">
            <div className="space-y-1">
              <span className="font-bold text-[#1A1A1A] block">🛌 재물운을 부르는 침실 취침 방향</span>
              <p className="text-[#5F5F5F] leading-relaxed text-[11px]">
                {luckyDirection}
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="font-bold text-[#1A1A1A] block">👜 재물 창고를 수호하는 행운의 색상</span>
              <p className="text-[#5F5F5F] leading-relaxed text-[11px]">
                {luckyWalletColor}
              </p>
            </div>
          </div>

          <div className="border-t border-[#E2DDD5]/60 pt-3 text-[11px] text-[#5F5F5F] leading-relaxed space-y-1">
            <strong>⚠️ 재물 누수를 막는 금전 십계명:</strong>
            <p>1. 지갑 내 영수증이나 청구서는 즉시 비워 금전적 스트레스가 얽히는 현상을 정화하십시오.</p>
            <p>2. 통장 도장을 황토색 주머니에 보관하면 불필요한 충동 계약으로 돈이 새나가는 액운을 막아줍니다.</p>
          </div>
        </div>
      </>
    );
  };


  // ----------------------------------------------------
  // Render: 타로 결과 (tarot) - Dynamic and Interactive
  // ----------------------------------------------------
  const renderTarotContent = () => {
    const cardsParam = searchParams.get("cards") || "lovers,hermit,wheel";
    const selectedKeys = cardsParam.split(",").filter(Boolean);

    const tarotDb = {
      magician: {
        name: "1. 마법사 (The Magician)",
        roman: "I",
        eng: "THE MAGICIAN",
        tag: "매력 발산, 소통 리드, 새로운 호기심",
        desc: "상대방은 현재 귀하에게 본인의 매력을 드러내고 강한 호기심을 끌고 싶어 하는 마음이 앞서 있습니다. 대화를 위트 있게 리드하고 주도권을 쥐려 하나, 진지한 미래 약속보다 우선은 호감의 크기를 테스트하려는 에너지가 돋보입니다."
      },
      empress: {
        name: "3. 여황제 (The Empress)",
        roman: "III",
        eng: "THE EMPRESS",
        tag: "질투와 소유욕, 안락함, 보살핌",
        desc: "상대방은 귀하와 함께할 때 깊은 정서적 안식과 풍요로움을 만끽합니다. 그러나 귀하를 자신의 영역 안에 온전히 두고 싶어 하는 독점욕과 소유욕이 발현되어, 집착하거나 서운함을 뾰족하게 표현할 기미가 흐릅니다."
      },
      lovers: {
        name: "6. 연인 (The Lovers)",
        roman: "VI",
        eng: "THE LOVERS",
        tag: "순수한 끌림, 강한 교감, 결합",
        desc: "두 사람 사이에 순수하고 전기적인 끌림과 다정한 소통 감각이 충만하게 교차했음을 뜻합니다. 대화 장벽만 걷어낸다면 즉시 서로의 품으로 돌아갈 수 있는 가장 끈끈하고도 맑은 애정의 연결고리가 보존되어 있습니다."
      },
      hermit: {
        name: "9. 은둔자 (The Hermit)",
        roman: "IX",
        eng: "THE HERMIT",
        tag: "생각 정리, 자발적 단절, 성찰",
        desc: "상대방은 현실적인 고민(경제적 여건, 일의 과부하)으로 인해 머리가 아파 자발적으로 자신만의 조용한 동굴에 들어갔습니다. 애정 문제 외에 본인 삶의 무게 때문에 연락할 에너지가 바닥나 있으므로 재촉은 금물입니다."
      },
      wheel: {
        name: "10. 운명의 수레바퀴 (Wheel of Fortune)",
        roman: "X",
        eng: "THE WHEEL",
        tag: "피할 수 없는 변화, 관계의 타이밍, 재회 기회",
        desc: "정체되어 굳어 있던 두 사람의 운명적 주기가 새로운 궤도로 굴러가기 시작합니다. 예상치 못한 사건이나 공통의 인맥, 돌발적 타이밍을 통해 끊어졌던 연락이 닿거나 서로를 의식하게 되는 극적인 반전을 유도합니다."
      },
      death: {
        name: "13. 죽음 (Death)",
        roman: "XIII",
        eng: "DEATH",
        tag: "관계의 종결, 리셋 후 재탄생, 냉정한 단절",
        desc: "어중간하고 애매했던 과거의 관계 패턴을 완전히 청산해야 함을 강력히 경고합니다. 아픔이 수반되더라도 기존의 오해 가득한 룰을 폐기하고, 아예 처음부터 백지상태로 새로운 규칙을 세우고 만나거나 관계를 환골탈태시켜야 합니다."
      },
      tower: {
        name: "16. 탑 (The Tower)",
        roman: "XVI",
        eng: "THE TOWER",
        tag: "돌발 마찰, 오해 폭발, 기존 관계 붕괴",
        desc: "누적되었던 사소한 불만이 화(火)의 벼락처럼 터지며 신뢰 구도가 부서졌던 위기를 드러냅니다. 그러나 숨겨진 고름이 밖으로 완전히 분출된 격이므로, 이 파괴의 고비를 이성적으로 직시하면 더 진솔하고 단단한 애정으로의 비약이 열립니다."
      },
      fool: {
        name: "0. 광대 (The Fool)",
        roman: "0",
        eng: "THE FOOL",
        tag: "자유 추구, 구속 회피, 가벼운 시작",
        desc: "상대방은 미래에 대한 무거운 책임과 의무에서 한 발짝 벗어나, 귀하와 가벼운 농담을 나누거나 무구한 소통을 즐기고 싶어 합니다. 섣부른 진지함으로 상대를 정의하려 들지 말고 물 흐르듯 가볍게 분위기를 조성해 보십시오."
      }
    };

    // Ensure we have exactly 3 fallback cards if query is invalid or empty
    const activeKeys = selectedKeys.length >= 3 ? selectedKeys.slice(0, 3) : ["lovers", "hermit", "wheel"];
    const timelineLabels = ["과거의 기류 (Past)", "현재의 상황 (Present)", "미래의 조언 (Future)"];

    return (
      <>
        {/* Header Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-red-600 font-bold block">혜안당 비밀 타로</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 상대방 속마음 비밀 타로 레코드
          </h2>
          <div className="w-24 h-0.5 bg-red-600/30 mx-auto my-2" />
        </div>

        {/* Process Guide Box */}
        <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-lg p-5 mb-8 text-xs space-y-2 shadow-sm">
          <span className="font-bold text-[#A3845B] block">🔮 타로 리딩 진행 방식 안내:</span>
          <p className="text-[#5F5F5F] leading-relaxed font-light font-traditional">
            본 보고서는 <strong>의뢰인이 입력 폼 단계에서 온 정신을 집중해 직접 뽑은 3장의 비화(秘話) 카드 배열</strong>을 바탕으로 분석되었습니다. 타로는 점치는 순간의 손끝 주파수를 통해 시시각각 변하는 상대의 무의식을 읽어내는 최고의 거울입니다. 과거의 뿌리, 현재의 원인, 미래의 전술을 연계하여 독해했습니다.
          </p>
        </div>

        {/* Worry Text Context */}
        {worryText && (
          <div className="border-l-4 border-red-500 bg-red-500/5 p-4 rounded-lg mb-8 text-xs space-y-2">
            <span className="font-bold text-red-600">의뢰하신 속마음 고민 내용:</span>
            <p className="italic text-foreground-muted">"{decodeURIComponent(worryText)}"</p>
            <p className="text-[#2C2C2C] leading-relaxed pt-2 border-t border-[#E2DDD5]/60 font-light font-traditional">
              질문하신 고민 ["{decodeURIComponent(worryText)}"]은 아래 배열된 세 장의 타로 카드가 지닌 상호 작용 속에서 답을 찾을 수 있습니다. 아래의 스프레드 상세 흐름을 정독해 보십시오.
            </p>
          </div>
        )}

        {/* Tarot Card Spread Display */}
        <div className="space-y-6 mb-10">
          <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            선택된 쓰리 카드 배열법 (Three-Card Spread Flow)
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {activeKeys.map((cardKey, idx) => {
              const card = tarotDb[cardKey] || tarotDb.lovers;
              const label = timelineLabels[idx];
              const isPresent = idx === 1;
              const isFuture = idx === 2;

              return (
                <div 
                  key={idx} 
                  className={`border-2 rounded-lg p-5 flex flex-col items-center justify-between text-center relative overflow-hidden bg-white shadow-sm transition-all ${
                    isPresent 
                      ? "border-red-600/50 shadow-md scale-[1.02]" 
                      : isFuture 
                        ? "border-[#5F7A68]/50" 
                        : "border-[#A3845B]/50"
                  }`}
                >
                  <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold mb-3 ${
                    isPresent 
                      ? "bg-red-100 text-red-700" 
                      : isFuture 
                        ? "bg-[#5F7A68]/15 text-[#5F7A68]" 
                        : "bg-[#A3845B]/10 text-[#A3845B]"
                  }`}>
                    {label}
                  </span>

                  {/* Visual Card representation */}
                  <div 
                    className="w-32 h-48 border border-[#A3845B]/40 rounded-md my-3 relative overflow-hidden shadow-md bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url('/tarot/${cardKey}.png')` }}
                  >
                    <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-1.5 left-0 right-0 bg-black/65 text-white text-[9px] py-0.5 text-center font-myeongjo tracking-wider">
                      {card.eng}
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <h5 className="text-xs font-bold text-[#1A1A1A]">{card.name}</h5>
                    <span className="text-[10px] text-[#A3845B] font-semibold block bg-[#F6F3EC] py-0.5 rounded">
                      키워드: {card.tag}
                    </span>
                    <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light text-left pt-2 border-t border-[#E2DDD5]/40 font-traditional">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Synthesis Relationship Advice */}
        <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm">
          <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Heart className="w-4 h-4 text-red-600" />
            💖 두 사람의 관계 개선을 위한 최종 오행/타로 전술 처방
          </h4>
          <ul className="text-xs text-[#5F5F5F] leading-relaxed space-y-2 font-light">
            <li className="flex gap-1.5 items-start">
              <span className="text-red-600 font-bold">•</span>
              <strong>감정적 서두름 조율:</strong> 미래 카드의 흐름 상, 서둘러 흑백을 가리려 하거나 끝장 대화를 요구하는 것은 상대방의 회피 에너지를 더 증폭시킵니다. 먼저 한 템포 호흡을 고르고 가볍고 일상적인 안부로 다가가십시오.
            </li>
            <li className="flex gap-1.5 items-start">
              <span className="text-red-600 font-bold">•</span>
              <strong>관계 해운의 비방:</strong> 상대방과의 대화 시 차갑고 어두운 장소보다는 채광이 밝고 물 소리가 잔잔히 흐르는 교외의 카페나 숲이 우거진 공원에서 만나 대화를 나눌 때 마음속 오해가 빠르게 정화됩니다.
            </li>
          </ul>
        </div>
      </>
    );
  };


  // ----------------------------------------------------
  // Render: 연인 궁합 (gunghap)
  // ----------------------------------------------------
  const renderGunghapContent = () => {
    // Determine dynamic scores based on their elemental combinations
    const myEl = sajuInfo.elements;
    const partnerEl = partnerSajuInfo.elements;

    // Calculate dynamic compatibility score
    let elementHarmonyScore = 75;
    let complementReason = "두 사람의 오행 분포가 무난하게 균형을 이루고 있습니다.";

    // Check complementation
    const myLacking = Object.entries(myEl).filter(([_, val]) => val === 0).map(([key]) => key);
    const partnerStrong = Object.entries(partnerEl).filter(([_, val]) => val >= 2).map(([key]) => key);

    const complementaryElements = myLacking.filter(el => partnerStrong.includes(el));

    if (complementaryElements.length > 0) {
      elementHarmonyScore = 85 + complementaryElements.length * 5;
      if (elementHarmonyScore > 98) elementHarmonyScore = 98;
      complementReason = `의뢰인 ${name}님에게 부족한 '${complementaryElements.join(", ")}'의 기운을 상대방 ${partnerName}님이 풍부하게 보유하여, 서로의 부족한 기운을 자연스럽게 채워주는 아주 훌륭한 상생(相生)의 오행 구조를 가지고 있습니다.`;
    } else {
      elementHarmonyScore = 82;
      complementReason = `두 사람의 사주는 서로 극(剋)하는 흐름보다 나란히 흐르는 동반 기류가 강해, 장기적으로 가치관의 대립이 적고 안정적으로 서로를 신뢰할 수 있는 편안한 관계입니다.`;
    }

    // Determine marriage suitability
    let lifeCompanionIndex = 88;
    if (sajuInfo.day.branch === "子" || sajuInfo.day.branch === "亥" || partnerSajuInfo.day.branch === "子" || partnerSajuInfo.day.branch === "亥") {
      lifeCompanionIndex = 94;
    }

    return (
      <>
        {/* Title Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-red-700 font-bold block">백년해로 인연궁합</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 연인 궁합 상성 분석
          </h2>
          <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto my-2" />
        </div>

        {/* Score Board Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">오행 조화도</span>
            <div className="text-2xl font-bold text-red-600 font-myeongjo">{elementHarmonyScore}%</div>
            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">상생 균형 우수</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">기질적 상성</span>
            <div className="text-2xl font-bold text-amber-600 font-myeongjo">90%</div>
            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">성격/대인 관계 조화</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">백년해로 지수</span>
            <div className="text-2xl font-bold text-rose-600 font-myeongjo">{lifeCompanionIndex}%</div>
            <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mt-1 inline-block">결혼/장기 안정성 최상</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">속궁합 & 정서</span>
            <div className="text-2xl font-bold text-purple-600 font-myeongjo">88%</div>
            <span className="text-[9px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">정서적 밀착도 높음</span>
          </div>
        </div>

        {/* 1. 오행 분포 분석 비교표 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Sparkles className="w-4 h-4 text-[#A3845B]" />
            ☯️ 두 사람의 오행(五行) 에너지 조화
          </h4>

          <div className="space-y-4 pt-2">
            {/* Visual Balance Bar Chart */}
            <div className="space-y-3">
              {/* Row: Wood */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                  <span>목 (木 - 나무)</span>
                  <span>{name}: {myEl.목}개 | {partnerName}: {partnerEl.목}개</span>
                </div>
                <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                  <div className="bg-emerald-600" style={{ width: `${(myEl.목 / 8) * 100}%` }} />
                  <div className="bg-emerald-400 border-l border-white" style={{ width: `${(partnerEl.목 / 8) * 100}%` }} />
                </div>
              </div>

              {/* Row: Fire */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                  <span>화 (火 - 불꽃)</span>
                  <span>{name}: {myEl.화}개 | {partnerName}: {partnerEl.화}개</span>
                </div>
                <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                  <div className="bg-red-600" style={{ width: `${(myEl.화 / 8) * 100}%` }} />
                  <div className="bg-red-400 border-l border-white" style={{ width: `${(partnerEl.화 / 8) * 100}%` }} />
                </div>
              </div>

              {/* Row: Earth */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                  <span>토 (土 - 흙)</span>
                  <span>{name}: {myEl.토}개 | {partnerName}: {partnerEl.토}개</span>
                </div>
                <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                  <div className="bg-amber-600" style={{ width: `${(myEl.토 / 8) * 100}%` }} />
                  <div className="bg-amber-400 border-l border-white" style={{ width: `${(partnerEl.토 / 8) * 100}%` }} />
                </div>
              </div>

              {/* Row: Metal */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                  <span>금 (金 - 바위)</span>
                  <span>{name}: {myEl.금}개 | {partnerName}: {partnerEl.금}개</span>
                </div>
                <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                  <div className="bg-slate-500" style={{ width: `${(myEl.금 / 8) * 100}%` }} />
                  <div className="bg-slate-400 border-l border-white" style={{ width: `${(partnerEl.금 / 8) * 100}%` }} />
                </div>
              </div>

              {/* Row: Water */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                  <span>수 (水 - 맑은 물)</span>
                  <span>{name}: {myEl.수}개 | {partnerName}: {partnerEl.수}개</span>
                </div>
                <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                  <div className="bg-blue-600" style={{ width: `${(myEl.수 / 8) * 100}%` }} />
                  <div className="bg-blue-400 border-l border-white" style={{ width: `${(partnerEl.수 / 8) * 100}%` }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border-t border-[#E2DDD5]/60 pt-3 italic">
              <strong>오행 분석 총평:</strong> {complementReason}
            </p>
          </div>
        </div>

        {/* 2. 명리적 일지 상성 해석 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Compass className="w-4 h-4 text-[#A3845B]" />
            💘 두 사람의 사주 궁합 명조 풀이
          </h4>

          <div className="space-y-3 font-traditional text-xs text-[#2C2C2C] font-light leading-relaxed">
            <p>
              <strong>배우자궁 일지(日支)의 상성:</strong><br />
              의뢰인 {name}님의 배우자 자리를 나타내는 일지 글자는 <strong>{sajuInfo.day.branch}</strong>이며, 상대방 {partnerName}님의 일지 글자는 <strong>{partnerSajuInfo.day.branch}</strong>입니다. 두 사람의 일지는 서로 조화를 이루며 정서적 밀착력과 동질감을 생성하는 우호적인 합(合)의 작용이 우선합니다. 서로 말하지 않아도 기분을 알아채는 섬세한 영혼의 소통 주파수를 가졌으며, 어려운 고비가 닥치더라도 서로에 대한 연민과 신뢰가 돈독해 갈등을 쉽게 해소하는 저력이 있습니다.
            </p>
            <p className="border-t border-[#E2DDD5]/60 pt-3">
              <strong>기질적인 매칭과 사회적 지향성:</strong><br />
              의뢰인님의 일간(日干) 기질과 상대방님의 일간(日干) 기질은 각자의 성격을 구성하는 뼈대입니다. {name}님은 단정하고 깊은 생각이 두드러지며 한 번 맺은 인연을 소중히 하는 신의의 소유자인 반면, {partnerName}님은 역동적이고 씩씩한 리더십으로 관계의 활력을 불어넣는 행동파입니다. 이는 음양의 역할 분담이 확실히 드러나는 궁합으로, 한 사람이 지탱하면 한 사람이 앞에서 끌어주는 다정한 톱니바퀴와 같이 맞물립니다.
            </p>
          </div>
        </div>

        {/* 3. 인연의 황금 결혼 타이밍 & 갈등 극복 대책 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <CalendarDays className="w-4.5 h-4.5 text-[#A3845B]" />
            🗓️ 성공적인 백년해로를 위한 황금 타이밍과 예방 전술
          </h4>

          <div className="space-y-4">
            <div className="border-l-2 border-red-600 pl-3">
              <span className="text-xs font-bold text-red-700 block">✨ 백년가약을 맺기 가장 좋은 황금의 시기</span>
              <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light mt-1 font-traditional">
                두 사람의 사주에 공통으로 인성(합의 약속)과 관성(공식적인 자격)이 아름답게 교차하는 <strong>2027년(정미년) 하반기</strong> 및 <strong>2028년(무신년) 봄</strong>이 결혼식을 올리거나 가정을 합치기에 최적의 기운을 담고 있습니다. 이 타이밍에 결실을 맺을 시 가정의 풍파가 감쇄되고 두 사람 모두 직장 및 자산 영역에서 동반 상승하는 조력 시너지를 낼 수 있습니다.
              </p>
            </div>

            <div className="border-l-2 border-[#A3845B] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">⚠️ 주의해야 할 갈등 시기와 대처 방안</span>
              <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light mt-1 font-traditional">
                말(午)과 쥐(子) 등 서로 부딪히는 자오충(子午冲)의 충살 기운이 스쳐 지나가는 <strong>매년 음력 5월과 11월</strong>에는 사소한 대화의 말투나 오해로 인해 급작스러운 냉전 기류가 형성될 수 있습니다. 이 시기에는 자존심 싸움으로 끝장을 보려 하지 말고, 서로에게 <strong>"24시간 냉각기"</strong>를 가지는 부부만의 룰을 미리 합의해 두면 위기를 우아하게 비껴갈 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 4. 의뢰 고민 커스텀 솔루션 */}
        {worryText && (
          <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm">
            <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
              <Heart className="w-4 h-4 text-red-600" />
              💌 두 사람의 인연 고민 맞춤형 솔루션 처방
            </h4>
            <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
              의뢰인 {name}님께서 남겨주신 고민인 <strong>"{decodeURIComponent(worryText)}"</strong>에 관하여, 두 사람의 궁합 명조를 해독한 맞춤 처방입니다.
            </p>
            <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border-t border-[#E2DDD5]/40 pt-2">
              현재의 불안감이나 고민 지점은 두 분 사주의 일시적인 대운 충돌로 인한 것입니다. 연애나 결혼 준비 과정에서 발생하는 마찰은 서로가 싫어졌다기보다는 에너지가 부딪히며 서로의 다름을 알아가는 진통입니다. {name}님의 깊고 다정다감한 성품과 {partnerName}님의 당당함이 조화를 이룬다면 충분히 지혜롭게 해결할 수 있으니 안심하셔도 좋습니다. 특히 서로에게 "늘 내 편이 되어 줘서 고맙다"는 감사의 칭찬을 하루 한 번 소리 내어 표현할 때 두 사람을 둘러싼 불안한 액운이 눈 녹듯 사라집니다.
            </p>
          </div>
        )}
      </>
    );
  };

  // ----------------------------------------------------
  // Render: 꿈해몽 & 사주 조율 (dream)
  // ----------------------------------------------------
  const renderDreamContent = () => {
    const dreamText = worryText ? decodeURIComponent(worryText) : "";
    const cat = worryCategory;

    // 꿈 주제별 오행 매핑
    const dreamElementMap = {
      animal_plant: "목",
      nature_weather: "목",
      people_family: "화",
      death_blood: "수",
      nature_weather2: "수",
      wealth_jewel: "금",
      general: baseEl,
    };
    const dreamEl = dreamElementMap[cat] || baseEl;

    // 꿈 주제별 한자/이모지 및 기본 해몽
    const dreamThemeData = {
      animal_plant: {
        icon: "🌿", hanja: "草木夢",
        base: "동물 또는 식물이 등장하는 꿈은 사주 내 목(木) 기운과 강하게 공명합니다. 살아 숨쉬는 생명체의 꿈은 귀하의 내면에 잠재된 성장 욕구와 자아 확장의 신호탄입니다.",
        lucky: "뱀·용·독수리 등 강인한 동물, 크고 무성한 나무, 꽃이 만개한 장면",
        unlucky: "죽어있거나 시들어 가는 식물, 상처 입은 동물, 벌레 떼의 습격",
      },
      people_family: {
        icon: "👨‍👩‍👧", hanja: "人緣夢",
        base: "인물이나 가족이 등장하는 꿈은 사주 내 화(火)·관성(官星) 기운과 연동됩니다. 현실의 인간관계에서 해결되지 않은 감정적 응어리나 그리움이 꿈으로 발현된 상태입니다.",
        lucky: "밝게 웃는 인물, 포옹하는 장면, 오랜 지인과의 재회, 환하게 빛나는 가족의 모습",
        unlucky: "다투거나 울고 있는 가족, 낯선 검은 인물의 등장, 등을 돌린 채 떠나가는 사람",
      },
      death_blood: {
        icon: "🌊", hanja: "血水夢",
        base: "죽음이나 피가 등장하는 꿈은 역설적으로 사주 내 수(水)·재성(財星)의 정화 신호입니다. 전통 해몽에서 피를 보는 꿈은 재물이 들어오는 길조로 해석되며, 죽음의 꿈은 낡은 것의 소멸과 새로운 시작의 예고입니다.",
        lucky: "선명하고 밝은 붉은 피, 깨끗하게 죽고 소생하는 장면, 물이 차오르는 꿈",
        unlucky: "썩고 검은 피, 내가 살해당하는 장면, 물에 빠져 헤어나오지 못하는 상황",
      },
      nature_weather: {
        icon: "🌤", hanja: "天氣夢",
        base: "자연과 날씨가 등장하는 꿈은 천간(天干)의 기운과 직접 연결됩니다. 맑고 밝은 하늘은 관운(官運)의 상승을, 폭풍우나 먹구름은 일시적 시련과 변화 의 기운을 암시합니다.",
        lucky: "맑고 푸른 하늘, 화창한 햇살, 쌍무지개, 첫눈이 내리는 장면",
        unlucky: "벼락이 치는 폭풍, 짙은 안개 속에서 길을 잃는 상황, 태풍에 쓸려가는 장면",
      },
      wealth_jewel: {
        icon: "💎", hanja: "財寶夢",
        base: "재물이나 보석이 등장하는 꿈은 사주 내 금(金)·재성(財星)의 활성화 신호입니다. 전통 명리에서 보석을 얻는 꿈은 귀중한 인연이나 기회의 도래를 의미하며, 금전적 좋은 소식과 밀접하게 연결됩니다.",
        lucky: "금·은·보석을 줍거나 받는 장면, 넘치는 곡식·쌀·돈더미, 금빛으로 빛나는 물건",
        unlucky: "돈이나 보석을 잃어버리는 꿈, 도둑에게 빼앗기는 장면, 가짜 보석임을 아는 꿈",
      },
      general: {
        icon: "🌙", hanja: "夢兆",
        base: "다양한 상황이 혼재된 꿈은 귀하의 사주 기질이 현재 삶에서 겪는 내적 갈등이나 잠재적 소망을 복합적으로 투영한 것입니다. 꿈의 전반적인 감정 톤(기쁨/두려움/평온함)이 길흉의 핵심 단서입니다.",
        lucky: "꿈 전체의 기분이 따뜻하고 밝았던 경우, 해결되는 느낌의 결말",
        unlucky: "꿈속에서 내내 쫓기거나 억눌린 느낌, 깨어난 뒤에도 불안감이 지속되는 경우",
      },
    };
    const theme = dreamThemeData[cat] || dreamThemeData.general;

    // 사주 오행과 꿈 오행의 동조 분석
    const isSameEl = dreamEl === baseEl;
    const syncAnalysis = isSameEl
      ? `귀하의 타고난 일간 오행(${baseEl})과 이번 꿈의 핵심 오행(${dreamEl})이 동일합니다. 이는 귀하의 무의식이 현재 가장 강렬하게 활성화된 내면의 에너지를 거울처럼 반영하고 있는 상태로, 해당 기운에 관련된 현실 이슈(${baseEl === "목" ? "성장·도전·독립" : baseEl === "화" ? "인간관계·명예·열정" : baseEl === "토" ? "안정·신뢰·부동산" : baseEl === "금" ? "결단·금전·직업" : "지혜·흐름·건강"}가 머지않아 중요한 갈림길에 서게 될 것을 예고합니다.`
      : `귀하의 일간 오행(${baseEl})과 꿈의 오행(${dreamEl})이 서로 다릅니다. 이는 내면의 무의식이 현재 사주에서 부족한 ${dreamEl} 기운을 보충하려는 신체 자율 조율 현상입니다. 귀하의 삶에 ${dreamEl} 기운이 강화되어야 할 분야가 있음을 경고하는 중요한 신호이므로 주의 깊게 살피십시오.`;

    // 길흉 지수 계산 (꿈 내용 키워드 기반)
    const luckyKeywords = /하늘|해|달|별|빛|금|보석|쌀|곡식|꽃|나비|웃음|포옹|승진|합격|결혼|아이|용|봉황|흰|맑|상승/;
    const unluckyKeywords = /죽음|피|불|홍수|추락|사고|도둑|쫓기|어둠|폭풍|폐허|파산|이별|울음|검은|뱀|쥐/;
    const luckyScore = luckyKeywords.test(dreamText) ? 72 : 55;
    const unluckyScore = unluckyKeywords.test(dreamText) ? 65 : 30;
    const finalLucky = Math.min(95, Math.max(15, luckyScore - Math.floor(unluckyScore / 3)));

    return (
      <>
        {/* 타이틀 */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-[#6B5B8B] font-bold block">몽조 보감 · 명리해몽</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 꿈해몽 및 사주 동조 분석
          </h2>
          <div className="w-24 h-0.5 bg-[#6B5B8B]/30 mx-auto my-2" />
        </div>

        {/* 꿈 내용 원문 */}
        {dreamText && (
          <div className="bg-[#6B5B8B]/5 border border-[#6B5B8B]/30 rounded-lg p-5 mb-8 shadow-sm space-y-2">
            <span className="text-xs font-bold text-[#6B5B8B] flex items-center gap-1.5">
              🌙 의뢰하신 꿈 내용 원문
            </span>
            <p className="text-xs text-[#2C2C2C] italic leading-relaxed font-traditional">"{dreamText}"</p>
          </div>
        )}

        {/* 꿈 주제 분류 & 오행 배정 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
            <span className="text-xl">{theme.icon}</span>
            {theme.hanja} — 꿈의 분류 및 오행 배정
          </h3>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            {theme.base}
          </p>
          {/* 개인화: 꿈에서 감지된 기운 분석 */}
          {(() => {
            // 꿈 텍스트에서 감지된 긍정/부정 키워드 추출
            const posKw = ["하늘","해","달","별","빛","금","보석","쌀","곡식","꽃","나비","웃음","포옹","승진","합격","결혼","아이","용","봉황","흰","맑","상승","밝","따뜻","행복","기쁨","날","올라"];
            const negKw = ["죽음","피","불","홍수","추락","사고","도둑","쫓기","어둠","폭풍","폐허","파산","이별","울음","검은","뱀","쥐","두려","무서","불안","차갑","어둡"];
            const detectedPos = dreamText ? posKw.filter(k => dreamText.includes(k)) : [];
            const detectedNeg = dreamText ? negKw.filter(k => dreamText.includes(k)) : [];
            const hasAny = detectedPos.length > 0 || detectedNeg.length > 0;

            // 감지된 키워드 기반 명리 해석 문장
            const posInterpret = detectedPos.length > 0
              ? `꿈속에서 감지된 '${detectedPos.slice(0,3).join("·")}' 등의 이미지는 ${dreamEl}(${dreamEl==="목"?"木":dreamEl==="화"?"火":dreamEl==="토"?"土":dreamEl==="금"?"金":"水"}) 기운의 활성화를 상징합니다. 이는 귀하의 내면이 현실에서 이 기운이 발현되기를 강하게 열망하고 있다는 신호입니다.`
              : `꿈 내용에서 뚜렷한 길한 이미지가 감지되지 않았습니다. 꿈의 전반적인 감정 톤이 따뜻했다면 길조로 볼 수 있습니다.`;
            const negInterpret = detectedNeg.length > 0
              ? `반면 '${detectedNeg.slice(0,3).join("·")}' 등의 이미지도 포착되었습니다. 이는 현재 귀하의 현실 삶에서 해소되지 않은 긴장이나 두려움이 꿈으로 분출된 것이며, 해당 감정을 일상에서 적극적으로 해소하는 것이 중요합니다.`
              : `꿈 내용에서 흉한 이미지는 감지되지 않았습니다. 꿈을 꾼 뒤 마음이 평온했다면 이는 안정적인 기운의 흐름을 의미합니다.`;

            return (
              <div className="pt-3 border-t border-[#E2DDD5]/60 space-y-3">
                <span className="text-[10px] font-bold text-[#6B5B8B] block tracking-wider">
                  🔍 귀하의 꿈에서 감지된 기운
                </span>
                {hasAny ? (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {detectedPos.slice(0,5).map(k => (
                      <span key={k} className="bg-[#5F7A68]/10 text-[#5F7A68] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#5F7A68]/20">
                        ✨ {k}
                      </span>
                    ))}
                    {detectedNeg.slice(0,5).map(k => (
                      <span key={k} className="bg-red-50 text-red-500 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-200">
                        ⚠ {k}
                      </span>
                    ))}
                    {!hasAny && (
                      <span className="text-[11px] text-[#5F5F5F] font-light">꿈의 내용이 입력되지 않아 감지된 키워드가 없습니다.</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#5F5F5F] font-light">꿈 내용을 입력하시면 실제 키워드를 분석하여 더 정밀한 해몽을 제공합니다.</p>
                )}
                <p className="text-[11px] text-[#2C2C2C] leading-relaxed font-light font-traditional">{posInterpret}</p>
                {detectedNeg.length > 0 && (
                  <p className="text-[11px] text-[#2C2C2C] leading-relaxed font-light font-traditional">{negInterpret}</p>
                )}
              </div>
            );
          })()}
        </div>

        {/* 길흉 지수 게이지 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📊 이번 꿈의 길흉(吉凶) 지수
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#5F7A68]">길운(吉運) 지수</span>
                <span className="font-bold text-[#5F7A68]">{finalLucky}점</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5F7A68] transition-all duration-700" style={{ width: `${finalLucky}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-red-500">화운(禍運) 지수</span>
                <span className="font-bold text-red-500">{100 - finalLucky}점</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 transition-all duration-700" style={{ width: `${100 - finalLucky}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light border-t border-[#E2DDD5]/60 pt-3">
            {finalLucky >= 65
              ? `🟢 이번 꿈은 전반적으로 길한 기운이 우세합니다. 꿈속의 긍정적 이미지들이 귀하의 앞날에 좋은 에너지가 도래함을 암시하고 있으니, 자신감을 갖고 계획한 일을 추진하십시오.`
              : finalLucky >= 45
              ? `🟡 이번 꿈은 길과 흉이 교차하는 중립적 기운을 띱니다. 중요한 결정은 3일 정도 유보하고 주변 상황을 면밀히 살핀 뒤 행동하는 것이 안전합니다.`
              : `🔴 이번 꿈은 주의가 필요한 흉한 기운이 감지됩니다. 액막이 행동(족욕·소금물 세안·환기)을 통해 꿈의 탁한 기운을 정화하고 무리한 투자나 분쟁을 잠시 피하십시오.`}
          </p>
        </div>

        {/* 사주-꿈 동조 분석 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-3">
          <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ☯️ 귀하의 사주({baseEl}) ↔ 꿈 오행({dreamEl}) 동조 분석
          </h3>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            {syncAnalysis}
          </p>
        </div>

        {/* 현실 관계 해석 */}
        <div className="bg-[#F6F3EC] border-2 border-[#6B5B8B]/30 rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h3 className="font-myeongjo text-base font-bold text-[#6B5B8B] flex items-center gap-2">
            🔮 꿈과 현실의 관계 — 앞으로 7~30일 이내의 예고
          </h3>
          <div className="space-y-3 text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            <p>
              꿈은 단순한 뇌의 잔상이 아닙니다. 사주 명리학은 꿈을 <strong>무의식이 파악한 기운의 흐름이 의식 세계로 올라오는 통로</strong>로 봅니다.
              현재 귀하의 사주에서 {dreamEl} 기운이 {isSameEl ? "활발하게 활성화된" : "부족하여 보충을 원하는"} 시기이므로,
              이 꿈은 {dreamEl === "목" ? "새로운 기회·이직·학업 도전" : dreamEl === "화" ? "대인관계·명예·감정적 변화" : dreamEl === "토" ? "안정적 정착·부동산·신뢰 구축" : dreamEl === "금" ? "금전·계약·직업적 결단" : "건강·정보·이동·여행"} 분야에서 가까운 시일 내에 중요한 신호가 도래할 것을 예고합니다.
            </p>
            <p className="border-t border-[#E2DDD5]/60 pt-3">
              특히 꿈을 꾼 날로부터 <strong>7일 이내</strong>에 {dreamEl === "목" ? "서류·계약서·SNS 메시지" : dreamEl === "화" ? "지인의 연락 또는 모임 제안" : dreamEl === "토" ? "부동산·토지·금융 관련 소식" : dreamEl === "금" ? "돈이나 직업 관련 제안" : "건강 이상 신호 또는 여행 소식"}을(를)
              접하게 될 가능성이 높습니다. 이를 억지로 만들려 하지 말고, 자연스럽게 찾아오는 흐름에 올라타는 것이 최선입니다.
            </p>
          </div>
        </div>

        {/* 개운 처방 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🌿 꿈의 기운 정화 & 강화 개운 처방
          </h3>
          <div className="space-y-4">
            {finalLucky < 65 && (
              <div className="flex gap-3 items-start">
                <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">정</span>
                <div>
                  <strong className="block text-[#1A1A1A] text-xs">흉몽 정화법 (액막이 처방)</strong>
                  <span className="text-[11px] text-[#5F5F5F] font-light block mt-0.5 leading-relaxed">
                    꿈을 꾼 당일 아침, 굵은 소금 한 줌을 따뜻한 물에 풀어 손발을 씻으십시오. 창문을 활짝 열어 탁한 꿈의 기운이 밖으로 빠져나가도록 공기를 환기한 뒤, 향초나 쑥 향을 피워 실내를 정화하는 것이 효과적입니다.
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-3 items-start">
              <span className="bg-[#6B5B8B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div>
                <strong className="block text-[#1A1A1A] text-xs">꿈의 내용 즉시 기록 (몽상일기)</strong>
                <span className="text-[11px] text-[#5F5F5F] font-light block mt-0.5 leading-relaxed">
                  꿈을 꾼 직후 머릿속에 남은 이미지와 감정을 노란색(土) 노트에 빠르게 적어두십시오. 기록 행위 자체가 길한 꿈의 기운을 현실로 끌어당기고, 흉한 꿈의 에너지를 종이 위에 가두어 현실에 미치는 영향을 차단합니다.
                </span>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#6B5B8B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div>
                <strong className="block text-[#1A1A1A] text-xs">{dreamEl} 기운 보충 색상 착용</strong>
                <span className="text-[11px] text-[#5F5F5F] font-light block mt-0.5 leading-relaxed">
                  꿈의 오행({dreamEl})과 연동된 색상인{" "}
                  {dreamEl === "목" ? "녹색·청색 계열" : dreamEl === "화" ? "붉은색·오렌지 계열" : dreamEl === "토" ? "노란색·베이지 계열" : dreamEl === "금" ? "흰색·실버 계열" : "검은색·네이비 계열"}
                  의 의상이나 소품을 일주일간 착용하면 꿈속의 기운을 현실로 자연스럽게 이행시키는 개운 효과가 있습니다.
                </span>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="bg-[#6B5B8B] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div>
                <strong className="block text-[#1A1A1A] text-xs">꿈 방향 개운 — 취침 시 머리 방향 조정</strong>
                <span className="text-[11px] text-[#5F5F5F] font-light block mt-0.5 leading-relaxed">
                  {dreamEl === "목" ? "동쪽으로 머리를 두고 취침하면 목 기운이 안정화되어 길한 꿈이 반복될 가능성을 높입니다." : dreamEl === "화" ? "남쪽으로 머리를 두고 자면 화 기운이 원활히 흘러 창의력과 열정이 꿈을 통해 강화됩니다." : dreamEl === "토" ? "방의 중앙에 가까운 위치에서 취침하고, 베개 아래에 황토색 천을 두어 토 기운을 보강하십시오." : dreamEl === "금" ? "서쪽으로 머리를 두면 금 기운이 정돈되어 결단력 있는 꿈의 흐름이 강화됩니다." : "북쪽으로 머리를 두고 자면 수 기운이 조용히 흘러 숙면과 통찰력 있는 꿈을 돕습니다."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ----------------------------------------------------
  // Render: 나만의 오늘의 운세 (today - 5,000원)
  // ----------------------------------------------------
  const renderTodayContent = () => {
    const dayStem = sajuInfo.day.stem;
    const dayBranch = sajuInfo.day.branch;
    const dayStemEl = sajuInfo.day.stemEl; // 목, 화, 토, 금, 수

    // 오늘 날짜 구하기
    const today = new Date();
    const formattedDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    // 일간별 오늘의 총평 데이터 구성
    const stemAnalysis = {
      "甲": {
        summary: "우뚝 솟은 큰 나무의 기운이 솟구치는 하루입니다. 기존의 정체된 흐름을 깨고 새로운 돌파구를 찾게 되며, 주도권을 쥐고 강한 추진력을 발휘할 수 있는 절호의 기회입니다. 자신감을 가지세요.",
        wealth: { score: 90, desc: "투자나 기획에서 긍정적인 신호가 오며 동료들의 조력으로 예상 밖의 결실을 맺습니다." },
        love: { score: 85, desc: "연인 사이에 리더십을 발휘하여 리드할 때 호감도가 크게 증가합니다." },
        social: { score: 95, desc: "새로운 네트워크나 귀인을 만나 중요한 조언을 얻게 되는 형국입니다." },
        advice: "자존심을 세우기보다 남들의 의견을 가볍게 경청하고 수용하는 것이 대인 관계에 큰 득이 됩니다."
      },
      "乙": {
        summary: "바람을 타는 넝쿨 식물처럼 유연하고 생명력 넘치는 기운이 가득합니다. 강하게 부딪치기보다는 부드러운 화법과 타협으로 난관을 극복할 때 비로소 더 큰 명예와 이득이 귀하를 찾아올 것입니다.",
        wealth: { score: 85, desc: "갑작스러운 지출을 방어하고, 소소한 재테크 기회나 정보가 찾아옵니다." },
        love: { score: 95, desc: "상대방의 마음을 섬세하게 살필 수 있어 다정한 정서적 교감이 극대화됩니다." },
        social: { score: 90, desc: "중재자 역할을 맡아 주변의 갈등을 유연하게 풀어주고 신임을 얻습니다." },
        advice: "스스로 결단을 내릴 때 우유부단하게 미루지 말고, 직관을 믿고 명확하게 선을 그어야 합니다."
      },
      "丙": {
        summary: "대지를 환히 비추는 태양처럼 정열과 매력이 폭발하는 하루입니다. 감추어 두었던 귀하의 역량이나 노력이 주변에 빛을 발해 공적인 인정을 받게 되며, 적극적으로 활동할수록 좋은 날입니다.",
        wealth: { score: 95, desc: "막혀 있던 자금의 흐름이 뚫리거나 상여금, 성과 등 긍정적 금전 소식이 도래합니다." },
        love: { score: 90, desc: "빛나는 존재감으로 주변의 이목을 끕니다. 솔로는 우연한 만남이 성사될 기류입니다." },
        social: { score: 85, desc: "말실수로 인한 시비가 따를 수 있으니 감정이 앞설 때는 한 템포 쉬어가십시오." },
        advice: "과한 열정은 주변을 태울 수 있으니 한 걸음 물러서서 평정심을 유지하는 미덕이 필요합니다."
      },
      "丁": {
        summary: "어둠 속의 등대나 따뜻한 모닥불처럼 사려 깊고 통찰력 있는 기운이 우세합니다. 겉으로 드러나는 요란함보다 내실을 다지고 핵심적인 업무나 관계에 집중할 때 기대 이상의 귀중한 수확을 거두게 됩니다.",
        wealth: { score: 90, desc: "신중하게 가치를 따져보고 문서나 계약 관련 운이 안정적으로 작동합니다." },
        love: { score: 95, desc: "말하지 않아도 눈빛만으로 깊은 신뢰를 나누게 되는 아늑한 연애 흐름입니다." },
        social: { score: 90, desc: "고민을 들어주는 상담자 역할을 훌륭히 해내어 주변 사람들의 정신적 지주가 됩니다." },
        advice: "혼자만의 충전 시간이 절실한 날입니다. 퇴근 후 조용히 반신욕이나 일기 쓰기를 권장합니다."
      },
      "戊": {
        summary: "묵직하고 거대한 황토 대산처럼 든든하고 신뢰감 넘치는 하루입니다. 흔들리지 않는 신념으로 본인의 위치를 지키면 주변 사람들이 귀하를 의지하며 모여듭니다. 장기적인 계획을 설계하기 좋습니다.",
        wealth: { score: 85, desc: "급진적인 투자보다는 정기 예적금이나 부동산 등 안정자산 위주로 자금 상황이 보강됩니다." },
        love: { score: 80, desc: "상대에게 다소 융통성 없고 고집스러운 인상을 주기 쉬우니 따뜻한 유머를 섞으십시오." },
        social: { score: 95, desc: "중요한 공적인 책임을 맡게 되어 귀하의 듬직한 리더십이 만방에 입증됩니다." },
        advice: "몸이 찌뿌둥할 수 있으니 가벼운 등산이나 야외 어싱 요법을 통해 신체 기운을 순환시키십시오."
      },
      "己": {
        summary: "비옥하고 윤택한 텃밭의 흙처럼 포용력과 결실의 조화가 두드러지는 하루입니다. 그동안 차근차근 뿌려둔 신뢰의 씨앗들이 오늘 드디어 조용한 결실로 나타나거나 마음을 기쁘게 하는 귀중한 소식이 도래합니다.",
        wealth: { score: 95, desc: "지갑이 두둑해지는 횡재수가 있으며 기대하던 거래 성사나 합격 통보가 옵니다." },
        love: { score: 90, desc: "아기자기하고 다정한 데이트 코스나 선물을 주고받으며 행복을 나누게 됩니다." },
        social: { score: 90, desc: "누구에게나 편안함을 주는 조화로운 대화 감각으로 친밀한 커뮤니케이션이 완성됩니다." },
        advice: "남들을 챙기느라 자신의 자원이 과소모되지 않게 자신만의 속도를 지켜 일상을 조율하십시오."
      },
      "庚": {
        summary: "명확하게 결단하는 날카로운 칼이나 듬직한 원광석 같은 날카로운 운세입니다. 어중간한 관계나 해묵은 고민을 날카로운 가위처럼 단호하게 정리하고 새출발의 발판을 다지기에 가장 적합한 개운의 일진입니다.",
        wealth: { score: 90, desc: "수익 회수가 원활해지고 합리적인 가격 비교를 통해 큰 지출을 절약합니다." },
        love: { score: 80, desc: "상대방의 약점을 지적하여 상처를 주기 쉽습니다. 비판적인 어조는 자제하십시오." },
        social: { score: 85, desc: "맺고 끊음이 확실해 주변 사람들에게 시원한 해결책을 제시해 줍니다." },
        advice: "차가운 금속의 기운이 강하니, 외출 시 붉은색 계열 옷이나 악세서리를 통해 온기를 더하십시오."
      },
      "辛": {
        summary: "정교하게 빚어낸 보석처럼 예리하면서도 세련된 아우라가 흐르는 날입니다. 남들이 포착하지 못한 문제점의 핵심을 직관적으로 꿰뚫어 볼 수 있어 기획이나 창의적 작업을 처리하는 데 최상의 기량입니다.",
        wealth: { score: 95, desc: "세밀한 수치 계산 능력이 발휘되어 금전적 실수를 완벽 방어하고 뜻밖의 제안이 들어옵니다." },
        love: { score: 90, desc: "특유의 매력과 정갈한 분위기로 이성에게 고급스러운 설렘을 자아내는 시기입니다." },
        social: { score: 80, desc: "예민해지기 쉬운 날이니 주변의 사소한 간섭에 너무 뾰족하게 반응하지 마십시오." },
        advice: "반짝이는 아이디어를 묵혀두지 말고 즉시 노란색 수첩에 적어 현실적인 기획안으로 연동하세요."
      },
      "壬": {
        summary: "모든 것을 품어 흐르는 넓은 바다와 같이 무한한 통찰력과 포용력의 기운입니다. 깊은 지혜가 머릿속에서 용솟음쳐 그간 엉켜 있던 장기적인 난제들의 핵심 실마리를 조용히 찾아낼 수 있는 뜻깊은 일진입니다.",
        wealth: { score: 90, desc: "흐름을 읽는 통찰력이 뛰어난 날로, 흐트러진 재무 흐름을 정상화하는 데 이롭습니다." },
        love: { score: 85, desc: "연인과의 감정이 잔잔한 바다처럼 안정되지만, 자칫 정체될 수 있으니 가벼운 여행을 추천합니다." },
        social: { score: 95, desc: "눈에 띄지 않으면서도 전체의 판을 현명하게 이끌어가는 막후 지략가 역할을 해냅니다." },
        advice: "생각이 너무 많아져 불면을 겪기 쉬우니 밤에는 조명을 어둡게 하고 깊은 수면을 취하십시오."
      },
      "癸": {
        summary: "대지를 촉촉하게 적시는 이슬비나 잔잔한 시냇물처럼 영리하고 유려한 기운입니다. 임기응변 능력이 최상으로 작동하여 난처한 돌발 상황을 우아하게 넘기고 타인과의 정서적 공감대를 자연스럽게 확립합니다.",
        wealth: { score: 85, desc: "예산 내에서 합리적으로 자금을 굴리며, 소소한 일상 속의 캐시백이나 혜택이 따릅니다." },
        love: { score: 95, desc: "촉촉한 수분의 에너지 덕에 연인과의 다정다감하고 섬세한 속삭임이 물 흐르듯 이어집니다." },
        social: { score: 90, desc: "누구에게나 호감을 주는 친화력으로 얽힌 대인관계를 부드럽게 윤화시킵니다." },
        advice: "자신의 진짜 고민을 숨기지 말고 가장 신뢰하는 사람 한 명에게 가볍게 공유하여 환기하십시오."
      }
    };

    const analysis = stemAnalysis[dayStem] || stemAnalysis["甲"];

    // 부족한 오행을 찾아서 처방 제공
    const elementPrescriptions = {
      "목": { color: "초록색 (Olive, Emerald)", number: "3, 8", direction: "동쪽 (숲길, 공원)", advice: "원목 소품이나 식물 화분을 눈에 보이는 곳에 두면 기운이 원활해집니다." },
      "화": { color: "붉은색 (Coral, Scarlet)", number: "2, 7", direction: "남쪽 (채광이 잘 드는 곳)", advice: "스탠드 조명을 켜거나 가벼운 족욕을 통해 몸에 따뜻한 활력을 순환시키십시오." },
      "토": { color: "노란색 (Sand, Beige)", number: "5, 10", direction: "중앙 (평야, 거실)", advice: "흙길을 맨발로 걷거나 도자기 그릇을 사용하는 습관이 기운의 중심을 잡아줍니다." },
      "금": { color: "흰색 (Silver, Grey)", number: "4, 9", direction: "서쪽 (바위산, 서재)", advice: "은 반지나 메탈 시계를 착용하고 일일 목표를 명확히 다이어리에 기록하십시오." },
      "수": { color: "검은색 (Charcoal, Indigo)", number: "1, 6", direction: "북쪽 (물가, 강변)", advice: "가습기를 틀거나 가벼운 반신욕을 하고 침실을 완전 차단하여 숙면하십시오." }
    };

    const myPresc = elementPrescriptions[dayStemEl] || elementPrescriptions["목"];

    // SMS 복사용 텍스트 구성
    const smsText = `[혜안당 명리연구소] ${name} 님 오늘의 수호 보감\n오늘의 일진: ${formattedDate} (${dayStem}${dayBranch}일 - ${dayStemEl}의 기운)\n성명: ${name} 님 (${gender === "female" ? "여" : "남"})\n총운: ${analysis.summary}\n금전운: ${analysis.wealth.score}% (${analysis.wealth.desc})\n연애운: ${analysis.love.score}% (${analysis.love.desc})\n대인관계: ${analysis.social.score}% (${analysis.social.desc})\n행운의 개운 비법:\n- 수호 색상: ${myPresc.color}\n- 수호 숫자: ${myPresc.number}\n- 수호 방향: ${myPresc.direction}\n- 조언: ${analysis.advice}`;

    return (
      <>
        {/* Header Block */}
        <div className="text-center space-y-2 mb-8 animate-fadeIn">
          <span className="text-xs tracking-widest text-[#A3845B] font-bold block">나만의 맞춤 일진</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 오늘의 맞춤 수호 보감 리포트
          </h2>
          <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto my-2" />
        </div>

        {/* SMS Copy Section for Quick Action */}
        <div className="bg-[#F6F3EC] border-2 border-brass/50 rounded-lg p-5 mb-8 space-y-3 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-brass text-background text-[9px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
            SMS 문자 전송 최적화
          </div>
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5 pb-1">
            💬 오늘의 운세 문자 전송/복사
          </h4>
          <p className="text-xs text-foreground-muted font-light font-traditional leading-relaxed">
            아래 복사 버튼을 누르면 요약본이 클립보드에 복사되어 휴대폰 문자나 카카오톡으로 즉시 친구나 본인에게 전송할 수 있습니다.
          </p>
          <div className="flex gap-2 pt-1.5">
            <button
              onClick={() => handleCopySms(smsText)}
              className="flex-1 py-3 bg-brass text-background rounded font-semibold text-xs hover:bg-brass-dark transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              {copied ? "클립보드 복사 완료!" : "오늘의 운세 문자 복사하기"}
            </button>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">금전/사업운</span>
            <div className="text-2xl font-bold text-amber-600 font-myeongjo">{analysis.wealth.score}%</div>
            <span className="text-[11px] text-foreground-muted font-light block mt-1.5 leading-relaxed font-traditional text-left">
              {analysis.wealth.desc}
            </span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">애정/연애운</span>
            <div className="text-2xl font-bold text-rose-600 font-myeongjo">{analysis.love.score}%</div>
            <span className="text-[11px] text-foreground-muted font-light block mt-1.5 leading-relaxed font-traditional text-left">
              {analysis.love.desc}
            </span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">대인관계/귀인</span>
            <div className="text-2xl font-bold text-emerald-600 font-myeongjo">{analysis.social.score}%</div>
            <span className="text-[11px] text-foreground-muted font-light block mt-1.5 leading-relaxed font-traditional text-left">
              {analysis.social.desc}
            </span>
          </div>
        </div>

        {/* 1. 오늘의 총체적 명리 분석 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Sparkles className="w-4 h-4 text-[#A3845B]" />
            ☯️ 오늘의 오행 에너지 기류 및 총평
          </h4>
          <div className="font-traditional text-xs text-[#2C2C2C] font-light leading-relaxed space-y-3">
            <p>
              의뢰인 <strong>{name}</strong>님은 타고난 일주 사주명식에서 일간(日干)이 <strong>{dayStem} ({dayStemEl})</strong>에 해당합니다.
              오늘 하루는 {analysis.summary}
            </p>
            <p className="border-t border-[#E2DDD5]/60 pt-3 italic text-foreground-muted">
              <strong>명리 수호 조언:</strong> {analysis.advice}
            </p>
          </div>
        </div>

        {/* 2. 오늘의 수호 오행 비방 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 mb-8 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Compass className="w-4 h-4 text-[#A3845B]" />
            🍀 오늘의 행운 수호 비방 (Amulet Guide)
          </h4>
          <div className="grid sm:grid-cols-3 gap-4 font-traditional text-xs">
            <div className="bg-[#F9F8F6] p-3.5 rounded border border-[#E2DDD5]/60">
              <span className="font-bold text-[#A3845B] block mb-1">🎨 수호 색상</span>
              <p className="text-[#5F5F5F] font-light">{myPresc.color}</p>
            </div>
            <div className="bg-[#F9F8F6] p-3.5 rounded border border-[#E2DDD5]/60">
              <span className="font-bold text-[#A3845B] block mb-1">🔢 행운의 숫자</span>
              <p className="text-[#5F5F5F] font-light">{myPresc.number}</p>
            </div>
            <div className="bg-[#F9F8F6] p-3.5 rounded border border-[#E2DDD5]/60">
              <span className="font-bold text-[#A3845B] block mb-1">🧭 개운의 방향</span>
              <p className="text-[#5F5F5F] font-light">{myPresc.direction}</p>
            </div>
          </div>
          <p className="text-xs font-traditional text-[#2C2C2C] font-light leading-relaxed border-t border-[#E2DDD5]/60 pt-3">
            <strong>행운의 액션 처방:</strong> {myPresc.advice}
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#2C2C2C] py-10 px-4 md:py-16 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto bg-[#F6F3EC] border-4 border-[#A3845B] rounded-lg p-6 md:p-12 shadow-md relative print:shadow-none print:border-none print:bg-white">
        
        {/* Decorative corner motifs */}
        <div className="absolute top-4 left-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute top-4 right-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute bottom-4 left-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute bottom-4 right-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>

        {/* Back and Print Actions */}
        <div className="flex justify-between items-center mb-8 border-b border-[#E2DDD5] pb-4 print:hidden">
          <Link
            href="/input"
            className="inline-flex items-center gap-1.5 text-xs text-[#5F5F5F] hover:text-[#A3845B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            다시 입력하기
          </Link>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-[#A3845B] text-[#F9F8F6] px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#86653E] transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            PDF로 저장 / 인쇄하기
          </button>
        </div>

        {/* Cover Page (표지) - 인쇄 시 단독 1페이지 차지 */}
        <div className="print:break-after-page min-h-[calc(100vh-120px)] print:min-h-screen flex flex-col justify-between py-16 px-6 border-b-2 border-dashed border-[#A3845B]/40 print:border-none relative">
          
          {/* Top Branding */}
          <div className="text-center space-y-2 mt-4">
            <span className="text-sm tracking-[0.25em] text-[#A3845B] font-bold block font-myeongjo">
              혜안당 보감
            </span>
            <div className="w-16 h-0.5 bg-[#A3845B]/40 mx-auto" />
          </div>

          {/* Main Title */}
          <div className="text-center my-auto py-12 space-y-6">
            <h1 className="font-myeongjo text-4xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-widest leading-tight print:text-5xl">
              {type === "saju" && "평생 종합 사주팔자 보고서"}
              {type === "newyear" && "신년 운세 - 토정비결 보고서"}
              {type === "wealth" && "재물 및 비즈니스 운세 보고서"}
              {type === "tarot" && "속마음 타로 심리 분석 보고서"}
              {type === "gunghap" && "연인 궁합 정밀 분석 보고서"}
              {type === "dream" && "꿈 해몽 및 개운 처방 보고서"}
              {type === "today" && "나만의 맞춤 오늘의 운세 보고서"}
            </h1>
            <p className="text-sm text-[#5F5F5F] tracking-wide font-light">
              명리학적 천간 지지의 상생상극을 조율한 개운 보감
            </p>
          </div>

          {/* User Information Block */}
          <div className="border border-[#E2DDD5] bg-[#F9F8F6]/90 rounded-lg p-6 max-w-xl mx-auto w-full space-y-4 shadow-sm print:bg-white print:border-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">의뢰인 성명</span>
                <span className="font-myeongjo text-base font-bold text-[#1A1A1A]">{name} 님 ({gender})</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">의뢰인 출생 정보</span>
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  {year}년 {month}월 {day}일 {hour} ({calendar === "solar" ? "양력" : "음력"})
                </span>
              </div>
            </div>

            {type === "gunghap" && (
              <div className="border-t border-[#E2DDD5]/70 pt-3 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-red-700 font-semibold block">상대방 성명</span>
                  <span className="font-myeongjo text-base font-bold text-[#1A1A1A]">{partnerName} 님 ({partnerGender})</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-[#A3845B] font-semibold block">상대방 출생 정보</span>
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    {partnerYear}년 {partnerMonth}월 {partnerDay}일 {partnerHour === "unknown" ? "시간 모름" : partnerHour + "시"} ({partnerCalendar === "solar" ? "양력" : "음력"})
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-[#E2DDD5]/70 pt-3 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">의뢰 구분 및 등급</span>
                <span className="text-xs font-bold text-[#A3845B]">
                  {type === "saju" && `평생 종합 사주 (${reportGrade === "deep" ? "심화" : "고급"})`}
                  {type === "newyear" && "신년 운세 / 토정비결"}
                  {type === "wealth" && "재물 & 비즈니스운"}
                  {type === "tarot" && "속마음 퀵 타로"}
                  {type === "gunghap" && "연인 궁합 정밀 분석"}
                  {type === "dream" && "꿈 해몽 & 개운 처방"}
                  {type === "today" && "나만의 오늘의 운세 (SMS)"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">분석 기관</span>
                <span className="text-xs font-semibold text-[#5F7A68]">혜안당 명리연구소</span>
              </div>
            </div>
          </div>

          {/* Cover Bottom Seal */}
          <div className="text-center mt-12 mb-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 100 100" className="text-[#A3845B]">
                <rect x="15" y="15" width="70" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="12" />
                <path d="M35 35 L65 35 M35 50 L65 50 M35 65 L65 65" stroke="currentColor" strokeWidth="8" />
              </svg>
              <span className="font-myeongjo text-base font-bold tracking-widest text-[#1A1A1A]">혜안당 보인</span>
            </div>
            <p className="text-[9px] text-[#5F5F5F] font-light">
              본 문서의 지적 재산권은 혜안당에 있으며, 무단 배포 및 도용을 금지합니다.
            </p>
          </div>
        </div>

        {/* Dynamic Content Renders based on 'type' */}
        {type === "saju" && renderSajuContent()}
        {type === "newyear" && renderNewYearContent()}
        {type === "wealth" && renderWealthContent()}
        {type === "tarot" && renderTarotContent()}
        {type === "gunghap" && renderGunghapContent()}
        {type === "dream" && renderDreamContent()}
        {type === "today" && renderTodayContent()}

        {/* Footer Seal */}
        <div className="border-t border-[#E2DDD5] pt-8 mt-12 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-[#A3845B]">
              <rect x="15" y="15" width="70" height="70" rx="4" fill="none" stroke="currentColor" strokeWidth="10" />
              <path d="M35 35 L65 35 M35 50 L65 50 M35 65 L65 65" stroke="currentColor" strokeWidth="6" />
            </svg>
            <span className="font-myeongjo text-lg font-bold tracking-widest text-[#1A1A1A]">慧眼堂 寶印</span>
          </div>
          <p className="text-[10px] text-[#5F5F5F] font-light text-center">
            본 문서의 지적 재산권은 혜안당에 있으며, 무단 배포 및 도용을 금지합니다.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <div className="font-myeongjo text-lg text-[#A3845B] animate-pulse">혜안당 보감 렌더링 중...</div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
