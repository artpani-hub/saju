"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
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

// 일간을 기준으로 사주 7개 글자의 십신 및 출현 개수를 계산하는 헬퍼 함수
const getSipsinList = (sajuInfo) => {
  if (!sajuInfo) return { sipsins: [], counts: {} };

  const StemsInfo = {
    "甲": { el: "목", polarity: "+" },
    "乙": { el: "목", polarity: "-" },
    "丙": { el: "화", polarity: "+" },
    "丁": { el: "화", polarity: "-" },
    "戊": { el: "토", polarity: "+" },
    "己": { el: "토", polarity: "-" },
    "庚": { el: "금", polarity: "+" },
    "辛": { el: "금", polarity: "-" },
    "壬": { el: "수", polarity: "+" },
    "癸": { el: "수", polarity: "-" }
  };
  const BranchesInfo = {
    "寅": { el: "목", polarity: "+" },
    "卯": { el: "목", polarity: "-" },
    "巳": { el: "화", polarity: "+" }, // 체음용양
    "午": { el: "화", polarity: "-" }, // 체양용음
    "辰": { el: "토", polarity: "+" },
    "戌": { el: "토", polarity: "+" },
    "丑": { el: "토", polarity: "-" },
    "未": { el: "토", polarity: "-" },
    "申": { el: "금", polarity: "+" },
    "酉": { el: "금", polarity: "-" },
    "亥": { el: "수", polarity: "+" }, // 체음용양
    "子": { el: "수", polarity: "-" }  // 체양용음
  };

  const dayStem = sajuInfo.day.stem;
  
  const getSingleSipsin = (targetChar, isBranch) => {
    const dayInfo = StemsInfo[dayStem];
    const targetInfo = isBranch ? BranchesInfo[targetChar] : StemsInfo[targetChar];
    if (!dayInfo || !targetInfo) return "";

    const meEl = dayInfo.el;
    const youEl = targetInfo.el;
    const samePolarity = dayInfo.polarity === targetInfo.polarity;

    // 비겁 (동일 오행)
    if (meEl === youEl) {
      return samePolarity ? "비견" : "겁재";
    }

    // 식상 (내가 생함)
    const isGenerating = (me, you) => {
      return (
        (me === "목" && you === "화") ||
        (me === "화" && you === "토") ||
        (me === "토" && you === "금") ||
        (me === "금" && you === "수") ||
        (me === "수" && you === "목")
      );
    };
    if (isGenerating(meEl, youEl)) {
      return samePolarity ? "식신" : "상관";
    }

    // 재성 (내가 극함)
    const isControlling = (me, you) => {
      return (
        (me === "목" && you === "토") ||
        (me === "화" && you === "금") ||
        (me === "토" && you === "수") ||
        (me === "금" && you === "목") ||
        (me === "수" && you === "화")
      );
    };
    if (isControlling(meEl, youEl)) {
      return samePolarity ? "편재" : "정재";
    }

    // 관성 (나를 극함)
    if (isControlling(youEl, meEl)) {
      return samePolarity ? "편관" : "정관";
    }

    // 인성 (나를 생함)
    if (isGenerating(youEl, meEl)) {
      return samePolarity ? "편인" : "정인";
    }

    return "";
  };

  const sipsins = [
    { pos: "연간", name: getSingleSipsin(sajuInfo.year.stem, false) },
    { pos: "연지", name: getSingleSipsin(sajuInfo.year.branch, true) },
    { pos: "월간", name: getSingleSipsin(sajuInfo.month.stem, false) },
    { pos: "월지", name: getSingleSipsin(sajuInfo.month.branch, true) },
    { pos: "일지", name: getSingleSipsin(sajuInfo.day.branch, true) },
    { pos: "시간", name: getSingleSipsin(sajuInfo.hour.stem, false) },
    { pos: "시지", name: getSingleSipsin(sajuInfo.hour.branch, true) }
  ];

  const counts = {
    "비견": 0, "겁재": 0, "식신": 0, "상관": 0,
    "편재": 0, "정재": 0, "편관": 0, "정관": 0,
    "편인": 0, "정인": 0
  };

  sipsins.forEach(s => {
    if (s.name) counts[s.name]++;
  });

  return { sipsins, counts };
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


// 사주 8대 성향 점수 및 타고난 천명 유형 분석
const getCharacterMetrics = (sajuInfo) => {
  const { elements, year, month, day, hour } = sajuInfo;
  
  // 오행 개수
  const mok = elements["목"] || 0;
  const hwa = elements["화"] || 0;
  const to = elements["토"] || 0;
  const geum = elements["금"] || 0;
  const su = elements["수"] || 0;

  // 8대 성향 기본 연산 (50점 ~ 98점 범위)
  const independence = Math.min(98, Math.max(50, 60 + mok * 8 - su * 3));
  const competitiveness = Math.min(98, Math.max(50, 55 + hwa * 9 - to * 2));
  const opportunity = Math.min(98, Math.max(50, 58 + geum * 8 - mok * 2));
  const business = Math.min(98, Math.max(50, 50 + to * 10 - hwa * 2));
  const insight = Math.min(98, Math.max(50, 65 + su * 8 - geum * 2));
  const drive = Math.min(98, Math.max(50, 57 + hwa * 7 + mok * 5 - to * 3));
  const patience = Math.min(98, Math.max(50, 62 + to * 8 + geum * 4 - hwa * 4));
  const negotiation = Math.min(98, Math.max(50, 59 + su * 6 + hwa * 5 - mok * 3));

  // 천명 유형 및 희귀도 설정 (일간 기준)
  const dayStem = day.stem;
  const dayBranch = day.branch;
  const dayStemEl = day.stemEl;

  let nickname = "보이지 않는 길을 걷는 개척자형";
  let rarity = "3.2%";
  let description = "스스로 힘을 기르고 시기를 기다려 세상을 놀라게 할 사주입니다.";

  if (dayStem === "甲" || dayStem === "乙") {
    nickname = "광야를 지키는 푸른 거목형";
    rarity = "2.4%";
    description = "어떤 모진 비바람에도 흔들리지 않고 스스로의 뿌리를 깊게 내려 **주체적 독립과 성장**을 이루어 내는 명조입니다.";
  } else if (dayStem === "丙" || dayStem === "丁") {
    nickname = "어둠을 밝히는 태양의 불꽃형";
    rarity = "2.1%";
    description = "어둡고 얼어붙은 대지를 녹이고 타인에게 따뜻한 열정과 용기를 나누어주며 **세상을 주도하는 등불**과 같은 귀한 사주입니다.";
  } else if (dayStem === "戊" || dayStem === "己") {
    nickname = "만물을 품는 황금빛 대지형";
    rarity = "2.8%";
    description = "세상의 모든 생명을 품어주고 끈기 있게 결실을 지켜내며 **사람들의 신뢰와 재물**을 거두어들이는 넉넉한 황토의 품을 가진 격입니다.";
  } else if (dayStem === "庚" || dayStem === "辛") {
    nickname = "안개 속을 꿰뚫는 은빛 검사형";
    rarity = "1.9%";
    description = "불필요한 미련을 과감히 잘라내고 매사에 칼날 같은 결단력을 발휘하여 **인생의 결정적 기회를 쟁취**해 내는 의리 있는 사주입니다.";
  } else if (dayStem === "壬" || dayStem === "癸") {
    nickname = "심연을 흐르는 지혜의 물결형";
    rarity = "1.5%";
    description = "겉은 잔잔해 보이나 그 속에 한없는 깊이의 지혜와 통찰을 품고 있어, **세상의 본질을 꿰뚫고 판을 흔드는 전략가**의 명조입니다.";
  }

  return {
    scores: {
      independence,
      competitiveness,
      opportunity,
      business,
      insight,
      drive,
      patience,
      negotiation
    },
    nickname,
    rarity,
    description
  };
};

// 일주(일주)의 비밀 분석 헬퍼
const getIljuSecret = (dayStem, dayBranch) => {
  const ilju = `${dayStem}${dayBranch}`;
  
  const iljuDatabase = {
    "甲子": "갑자(甲子)일주는 푸른 나무 밑의 맑은 쥐의 형상으로, **지혜가 총명하고 학문적 재능**이 돋보입니다. 인성(水)이 식상(木)을 생하니 배우는 것을 좋아하나 현실적 실천이 다소 늦을 수 있으니 실천력을 강화해야 합니다.",
    "甲寅": "갑인(甲寅)일주는 우뚝 솟은 거목의 형상으로, **강한 독립심과 굽히지 않는 기상**이 특징입니다. 간여지동 사주로 자존심과 고집이 극에 달하니 타인과의 융통성 있는 타협이 평생 재물운을 지키는 연쇠입니다.",
    "乙卯": "을묘(乙卯)일주는 초봄의 들판에 피어난 푸른 풀과 꽃의 형상으로, **강인한 생명력과 사교성**이 뛰어납니다. 겉은 부드러우나 속은 단단하여 끈기가 있으나, 인정을 베풀다 손해를 보는 배신수를 조심해야 합니다.",
    "丙午": "병오(丙午)일주는 한낮의 타오르는 불꽃의 형상으로, **폭발적인 추진력과 솔직담백함**이 매력입니다. 매사에 열정적이나 불같이 화를 내는 다혈질 기질과 끈기 부족을 보완해야 대업을 이룹니다.",
    "丁酉": "정유(丁酉)일주는 밤하늘을 밝히는 은은한 촛불과 보석의 형상으로, **섬세한 예술적 감각과 천을귀인**의 복을 가집니다. 재물 복이 기본적으로 따르는 사주이나 신경과민과 집착을 다스려야 평화롭습니다.",
    "戊辰": "무진(戊辰)일주는 거대한 황토 산의 형상으로, **두터운 신용과 묵직한 포용력**이 돋보입니다. 백호살의 강한 에너지를 품고 있어 한번 마음먹은 일은 기필코 해내지만 배우자 방의 갈등을 주의해야 합니다.",
    "己丑": "기축(己丑)일주는 겨울의 얼어붙은 논밭의 형상으로, **보이지 않는 끈기와 성실함**이 무기입니다. 묵묵히 제 갈 길을 가며 자산을 차곡차곡 모으는 능력이 뛰어나나 소극적인 성향을 극복해야 문이 넓어집니다.",
    "庚申": "경신(庚申)일주는 단단한 강철 바위산의 형상으로, **의리가 깊고 칼날 같은 결단력**이 특징입니다. 남에게 지기 싫어하는 승부욕이 강해 자수성가할 운명이지만, 뻣뻣한 태도가 구설을 부를 수 있습니다.",
    "辛酉": "신유(辛酉)일주는 날카로운 명검과 보석의 형상으로, **깔끔하고 예리한 판단력과 순수성**을 가집니다. 완벽주의 성향이 강해 일처리가 빈틈없으나 스스로를 옥죄고 주변인을 피곤하게 할 수 있으니 여유가 필요합니다.",
    "壬子": "임자(壬子)일주는 거대한 밤의 바다 형상으로, **한없는 깊이의 지혜와 큰 배포**를 지녔습니다. 양인살의 우두머리 기질로 세상을 쥐고 흔들 파급력이 있으나 극단적인 감정 기복을 조율해야 성공이 굳건해집니다.",
    "癸巳": "계사(癸巳)일주는 봄비 속에 피어난 꽃밭의 뱀 형상으로, **수완이 좋고 재물운과 천을귀인**이 깃들었습니다. 두뇌 회전이 빠르고 현실 감각이 탁월하여 실리를 잘 챙기지만 잔머리로 인해 신뢰를 잃지 않도록 조심해야 합니다."
  };

  const defaultDesc = `${dayStem}${dayBranch} 일주는 하늘의 기운 ${dayStem}과 땅의 기운 ${dayBranch}이 만나 독창적인 삶의 방향을 제시합니다. **${dayStem}의 특성인 정신적 지향성**과 **${dayBranch}의 현실적 행동력**이 조화를 이루어, 본인의 고유 영역에서 강한 영향력을 행사하는 귀한 명조입니다.`;

  return iljuDatabase[ilju] || defaultDesc;
};

// 35페이지 구성안 메타데이터 생성기
const getPagesConfiguration = (name, partnerName) => {
  return [
    { page: 1, type: "cover", title: "혜안당 정통 명리 보감 표지" },
    { page: 2, type: "character", title: "나의 타고난 천명 성향 유형 분석" },
    { page: 3, type: "manseryeo", title: "기본 사주 팔자 명조 분석" },
    { page: 4, type: "elements", title: "오행(五행) 에너지 분포 분석" },
    { page: 5, type: "metrics_chart", title: "사주 8대 성향 수치표" },
    { page: 6, type: "metrics_detail_1", title: "8대 성향 수치 심층 풀이 (독립성/승부욕)" },
    { page: 7, type: "metrics_detail_2", title: "8대 성향 수치 심층 풀이 (기회포착/사업감각)" },
    { page: 8, type: "metrics_detail_3", title: "8대 성향 수치 심층 풀이 (추진력/인내력)" },
    { page: 9, type: "metrics_detail_4", title: "8대 성향 수치 심층 풀이 (통찰력/대인협상)" },
    { page: 10, type: "stem_detail", title: "나의 일간(日干) 심층 분석" },
    { page: 11, type: "ilju_secret", title: "나의 일주(日柱)의 비밀 분석" },
    { page: 12, type: "destiny_harmony", title: "여덟 글자의 운명 조화 및 마음가짐 처방" },
    { page: 13, type: "inner_disposition", title: "타고난 기질 분석 및 3대 행동 강령" },
    { page: 14, type: "lifestyle_strategy", title: "살아가는 방식 및 행운물 풍수 공간 처방" },
    { page: 15, type: "deficiency", title: "사주 속 결핍의 비밀 및 생존 본능 분석" },
    { page: 16, type: "strength", title: "타고난 성향과 기질 총평" },
    { page: 17, type: "weakness", title: "극복해야 할 치명적인 약점 분석" },
    { page: 18, type: "worry_solution", title: "의뢰인 개별 고민 정밀 조율 솔루션" },
    { page: 19, type: "sipsin_1", title: "사주 원국의 십신(十神) 분석 - 비견·겁재" },
    { page: 20, type: "sipsin_2", title: "사주 원국의 십신(十神) 분석 - 식신·상관" },
    { page: 21, type: "sipsin_3", title: "사주 원국의 십신(十神) 분석 - 편재·정재" },
    { page: 22, type: "sipsin_4", title: "사주 원국의 십신(十神) 분석 - 편관·정관" },
    { page: 23, type: "sipsin_5", title: "사주 원국의 십신(十神) 분석 - 편인·정인" },
    { page: 24, type: "sinsal", title: "사주 속 길흉 신살(神殺) 분석" },
    { page: 25, type: "gwiin", title: "내 인생의 귀인(貴인) 분석" },
    { page: 26, type: "job_aptitude", title: "평생 직업 적성 처방" },
    { page: 27, type: "wealth_wave", title: "재물 창고(財庫)와 시기별 재산 흐름 파동 그래프" },
    { page: 28, type: "seoun_2026", title: "2026년 병오년(丙午年) 전체 세운 흐름" },
    { page: 29, type: "seoun_quarterly", title: "2026년 분기별 상세 흐름 및 월별 대응 전술" },
    { page: 30, type: "seoun_aspects", title: "2026년 분야별 상세 등급 및 행동 강령" },
    { page: 31, type: "daeun_orbit", title: "평생 대운(大運) 흐름 총평 및 10년 대운 궤도 다이어그램" },
    { page: 32, type: "daeun_roadmap_1", title: "대운 1기~2기 상세 로드맵" },
    { page: 33, type: "daeun_roadmap_2", title: "대운 3기~4기 상세 로드맵" },
    { page: 34, type: "warning_period", title: "평생 조심해야 할 흉한 시기 & 액운 소멸 방어 비책" },
    { page: 35, type: "gaewoon_presc", title: "부족한 기운을 채우는 나만의 오행 개운법" },
    { page: 36, type: "ten_year_seoun", title: "향후 10개년(2026~2035) 연도별 족집게 세운 운세" },
    { page: 37, type: "fengshui_bless", title: "공간 풍수 인테리어 처방 및 지혜의 마지막 축원" }
  ];
};

// 32페이지 개별 렌더러 함수
const renderPageContent = (page, ctx) => {
  const {
    name,
    gender,
    year,
    month,
    day,
    hour,
    calendar,
    sajuInfo,
    prescriptions,
    personalizedText,
    metrics,
    iljuSecret,
    worryText,
    partnerName,
    partnerSajuInfo,
    partnerGender,
    partnerYear,
    partnerMonth,
    partnerDay,
    partnerHour,
    partnerCalendar,
    baseEl,
    getElementColor,
    getElementBarColor,
    handlePortonePayment,
    isFree
  } = ctx;

  const blurClass = isFree ? "blur-[5px] select-none pointer-events-none" : "";

  const sipsinData = getSipsinList(sajuInfo);
  const { counts: sipsinCounts, sipsins: sipsinItems } = sipsinData;

  const bigeobCount = (sipsinCounts["비견"] || 0) + (sipsinCounts["겁재"] || 0);
  const sibsangCount = (sipsinCounts["식신"] || 0) + (sipsinCounts["상관"] || 0);
  const jaeseongCount = (sipsinCounts["편재"] || 0) + (sipsinCounts["정재"] || 0);
  const gwanseongCount = (sipsinCounts["편관"] || 0) + (sipsinCounts["정관"] || 0);
  const inseongCount = (sipsinCounts["편인"] || 0) + (sipsinCounts["정인"] || 0);

  const groupCounts = {
    "비겁(비견·겁재)": bigeobCount,
    "식상(식신·상관)": sibsangCount,
    "재성(편재·정재)": jaeseongCount,
    "관성(편관·정관)": gwanseongCount,
    "인성(편인·정인)": inseongCount
  };

  let dominantGroup = "비겁(비견·겁재)";
  let maxCount = -1;
  Object.entries(groupCounts).forEach(([group, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantGroup = group;
    }
  });

  const dominantDescriptions = {
    "비겁(비견·겁재)": "귀하의 사주 원국에서 가장 강하게 작용하는 기운은 **비겁(비견·겁재)**입니다. 이는 강한 주체성과 독립심, 타협하지 않는 뚝심을 삶의 기본 바탕으로 삼는 성향을 나타냅니다. 1인 창업이나 전문 독립직무에서 가장 큰 성공을 거두는 반면, 고집이 지나쳐 인간관계나 금전 배분에서 생길 수 있는 불필요한 마찰을 조심해야 합니다.",
    "식상(식신·상관)": "귀하의 사주 원국에서 가장 강하게 작용하는 기운은 **식상(식신·상관)**입니다. 이는 뛰어난 창의성, 풍부한 감수성, 자신의 재능을 아낌없이 세상에 표현해내는 에너지를 뜻합니다. 자신만의 아이디어나 전문 장인 기질을 무기로 지식재산권을 형성할 때 평생 수입의 질이 높아집니다. 단, 직장에서의 권위적인 갈등을 조율하고 성급한 말 실수를 의식적으로 제어할 필요가 있습니다.",
    "재성(편재·정재)": "귀하의 사주 원국에서 가장 강하게 작용하는 기운은 **재성(편재·정재)**입니다. 이는 매우 뛰어난 현실 감각과 기회 포착력, 결과 중심의 행동 지향성을 뜻합니다. 끊임없이 자산을 설계하고 성과를 수치로 관리하는 지혜가 뛰어나며, 투자를 하든 직장 생활을 하든 철저히 실리를 확실하게 챙깁니다. 다만, 사소한 단기 득실에 과하게 얽매여 큰 인맥이나 장기적 평판을 잃지 않도록 해야 합니다.",
    "관성(편관·정관)": "귀하의 사주 원국에서 가장 강하게 작용하는 기운은 **관성(편관·정관)**입니다. 이는 조직과 규율 속에서 자신의 가치와 신용을 증명하려는 책임감과 명예 지향 에너지를 뜻합니다. 타인의 신뢰를 얻어 직위가 자연스레 올라가며, 공신력 있는 라이선스나 공익적 시스템을 결합할 때 자산 안정성이 극대화됩니다. 다만, 완벽주의로 인한 과도한 스트레스와 강박증을 관리해야 합니다.",
    "인성(편인·정인)": "귀하의 사주 원국에서 가장 강하게 작용하는 기운은 **인성(편인·정인)**입니다. 이는 지식을 습득하고 학문적 역량을 연마하며, 타인의 조력과 계약서·문서의 길함을 받아들이는 수용 에너지입니다. 남다른 직관력과 무형 지식 자산을 가공하는 능력이 탁월하지만, 행동으로 실천하지 않고 생각에만 갇혀버리는 '생각의 감옥'과 안일함에 빠지는 함정을 극도 경계해야 합니다."
  };

  const dominantDesc = dominantDescriptions[dominantGroup];

  // 신살(도화, 역마, 화개) 계산
  const branches = [
    sajuInfo.year.branch,
    sajuInfo.month.branch,
    sajuInfo.day.branch,
    sajuInfo.hour.branch
  ];
  const dowhaCount = branches.filter(b => ["子", "午", "卯", "酉"].includes(b)).length;
  const yeokmaCount = branches.filter(b => ["寅", "申", "巳", "亥"].includes(b)).length;
  const hwagaeCount = branches.filter(b => ["辰", "戌", "丑", "未"].includes(b)).length;

  switch (page.type) {
    case "cover":
      return (
        <div className="flex flex-col justify-between py-16 px-6 h-full min-h-[700px] text-center">
          <div className="space-y-2 mt-4">
            <span className="text-sm tracking-[0.25em] text-[#A3845B] font-bold block font-myeongjo">慧眼堂 寶鑑</span>
            <div className="w-16 h-0.5 bg-[#A3845B]/40 mx-auto" />
          </div>
          <div className="my-auto py-12 space-y-6">
            <h1 className="font-myeongjo text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-wider leading-tight break-keep">
              평생 종합 사주팔자 보고서
            </h1>
            <p className="text-sm text-[#5F5F5F] tracking-wide font-light">
              명리학적 천간 지지의 상생상극을 조율한 고품격 평생 개운 비책
            </p>
          </div>
          <div className="border border-[#E2DDD5] bg-[#F9F8F6]/90 rounded-lg p-6 max-w-xl mx-auto w-full space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4 text-left">
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
            <div className="border-t border-[#E2DDD5]/70 pt-3 grid grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">의뢰 구분 및 등급</span>
                <span className="text-xs font-bold text-[#A3845B]">평생 종합 사주 (초프리미엄 32페이지 보감)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">분석 기관</span>
                <span className="text-xs font-semibold text-[#5F7A68]">혜안당 명리연구소</span>
              </div>
            </div>
          </div>
          <div className="mt-12 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-myeongjo text-base font-bold tracking-widest text-[#1A1A1A]">慧眼堂 寶印</span>
            </div>
            <p className="text-[9px] text-[#5F5F5F] font-light">
              본 문서의 지적 재산권은 혜안당에 있으며, 무단 배포 및 도용을 금지합니다.
            </p>
          </div>
        </div>
      );

    case "manseryeo":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ☯️ 기본 사주 팔자 명조 (만세력)
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            만세력이란 내가 태어난 날의 우주 에너지를 동양 정통 명리학의 부호(천간과 지지)로 나타낸 표입니다. 쉽게 말해 <strong>'나만의 인생 바코드'</strong>와 같습니다. 총 4개의 기둥(연, 월, 일, 시) 중 귀하의 타고난 내면의 본질과 진짜 성격을 결정하는 가장 핵심적인 기둥은 두 번째에 있는 <strong>'일주(日柱)의 일간'</strong>입니다.
          </p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-[#A3845B]/10 py-2 font-bold text-[#A3845B]">시주 (時柱)</div>
            <div className="bg-[#A3845B]/10 py-2 font-bold text-[#A3845B]">일주 (日柱)</div>
            <div className="bg-[#A3845B]/10 py-2 font-bold text-[#A3845B]">월주 (月柱)</div>
            <div className="bg-[#A3845B]/10 py-2 font-bold text-[#A3845B]">연주 (年柱)</div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.hour.stemEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.hour.stem}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.hour.stemEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.day.stemEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.day.stem}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.day.stemEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.month.stemEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.month.stem}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.month.stemEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.year.stemEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.year.stem}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.year.stemEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.hour.branchEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.hour.branch}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.hour.branchEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.day.branchEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.day.branch}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.day.branchEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.month.branchEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.month.branch}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.month.branchEl})</span>
            </div>
            <div className={`py-6 rounded-lg font-bold text-lg ${getElementColor(sajuInfo.year.branchEl)}`}>
              <span className="block text-2xl font-myeongjo">{sajuInfo.year.branch}</span>
              <span className="text-[10px] opacity-80">({sajuInfo.year.branchEl})</span>
            </div>
          </div>
          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2">
            <h4 className="font-bold text-[#A3845B]">💡 만세력 구조 분석 핵심 조언</h4>
            <p className="leading-relaxed text-[#5F5F5F] font-light">
              태어난 시간(시지: <strong>{sajuInfo.hour.branch}</strong>)부터 태어난 해(연간: <strong>{sajuInfo.year.stem}</strong>)까지의 상생 기운을 분석하면, 귀하의 사주는 스스로의 뿌리를 굳건히 지탱하려는 주체성이 매우 강합니다. 남의 지시에 쉽게 흔들리기보다는, 스스로 목표를 정하고 <strong>자기 주도적인 리더십</strong>으로 삶을 이끌어갈 때 가장 큰 잠재력이 발현되는 훌륭한 구성입니다.
            </p>
          </div>
          <div className="border border-[#E2DDD5]/60 rounded-lg p-4 bg-white text-xs space-y-3 shadow-sm">
            <h4 className="font-bold text-[#1A1A1A] font-myeongjo">🔍 사주(四柱) 네 기둥이 상징하는 평생의 운명 주기</h4>
            <div className="grid grid-cols-2 gap-3 text-[#5F5F5F]">
              <div className="space-y-1">
                <span className="font-bold text-[#A3845B] block">• 연주 (조상 &amp; 유년기운: 0~20세)</span>
                <p className="font-light leading-relaxed">내가 태어난 집안의 내력과 조상의 기운을 뜻하며, 유년기 성장 환경의 바탕이 되는 뼈대입니다.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#A3845B] block">• 월주 (부모 &amp; 청년기운: 20~40세)</span>
                <p className="font-light leading-relaxed">부모와 형제의 영향력, 그리고 사회에 나가서 구축하게 되는 대외적 직업 환경과 사회적 성취의 토대입니다.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#A3845B] block">• 일주 (나 자신 &amp; 장년기운: 40~60세)</span>
                <p className="font-light leading-relaxed">나의 진짜 영혼과 본질적 성정, 그리고 평생을 동반할 배우자와의 궁합 자리를 의미하는 핵심 축입니다.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#A3845B] block">• 시주 (자녀 &amp; 말년기운: 60세 이후)</span>
                <p className="font-light leading-relaxed">자녀와의 인연, 노후의 경제적 건강성과 정신적 안락함, 세상에 남길 유산을 상징하는 열매입니다.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "elements":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📊 오행(五行) 에너지 분포 분석
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주는 목(나무), 화(불), 토(흙), 금(쇠), 수(물) 5가지 자연 에너지를 상징하는 <strong>'오행'</strong>의 비율로 해석됩니다. 오행의 균형은 삶의 크고 작은 굴곡을 조절하는 뼈대가 되며, 내 사주에 부족하거나 너무 과한 에너지를 파악하여 일상(색상, 숫자, 환경 등)에서 의식적으로 보완해 나갈 때 극적인 운의 개화와 자산 형성이 찾아옵니다.
          </p>
          <div className="space-y-3 bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm">
            {Object.entries(sajuInfo.elements).map(([el, count]) => {
              const percentage = (count / 8) * 100;
              return (
                <div key={el} className="flex items-center gap-3 text-xs">
                  <span className={`w-16 text-center py-1 rounded font-bold text-[11px] ${getElementColor(el)}`}>
                    {el} ({count}개)
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getElementBarColor(el)}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-10 text-right font-semibold text-[#5F5F5F]">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>
          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2 leading-relaxed">
            <h4 className="font-bold text-[#A3845B]">💡 오행 에너지 종합 총평</h4>
            <p className="text-[#2C2C2C] font-light whitespace-pre-line font-traditional">
              {personalizedText.analysis}
            </p>
          </div>
          <div className="border border-[#E2DDD5]/60 rounded-lg p-4 bg-white text-xs space-y-3 shadow-sm">
            <h4 className="font-bold text-[#1A1A1A] font-myeongjo">🧭 오행(五행) 과다 및 결핍에 따른 인생 처방전</h4>
            <div className="space-y-2 text-[#5F5F5F]">
              <p className="font-light leading-relaxed">
                • <strong>목(木 - 나무) 기운 조율:</strong> 부족하면 새로운 일을 시작하는 돌파력이 부족해지며, 과다하면 고집이 너무 강해 부러지기 쉽습니다. 초록색 계열의 옷이나 화분을 곁에 두는 것이 길합니다.
              </p>
              <p className="font-light leading-relaxed">
                • <strong>화(火 - 불) 기운 조율:</strong> 부족하면 열정과 자기를 표현하는 자신감이 줄어들며, 과다하면 성격이 지나치게 급해져 감정 과열을 부릅니다. 붉은 톤의 소품이나 따뜻한 음식이 보약입니다.
              </p>
              <p className="font-light leading-relaxed">
                • <strong>토(土 - 대지) 기운 조율:</strong> 부족하면 한곳에 머무르거나 저축하는 신뢰가 결여되기 쉽고, 과다하면 우물쭈물 기회를 놓치기 일쑤입니다. 황토색이나 실물 자산을 가까이하십시오.
              </p>
              <p className="font-light leading-relaxed">
                • <strong>금(金 - 쇠) 기운 조율:</strong> 부족하면 남을 모질게 거절하지 못해 질질 끌려다니며, 과다하면 타인에게 너무 냉정한 상처를 주기 쉽습니다. 흰색 계열이나 금속 소품이 도움이 됩니다.
              </p>
              <p className="font-light leading-relaxed">
                • <strong>수(水 - 물) 기운 조율:</strong> 부족하면 인생의 융통성과 깊은 생각이 결여되기 쉽고, 과다하면 내면의 외로움과 잡생각에 갇힙니다. 어두운 계열의 색상이나 반신욕이 추천됩니다.
              </p>
            </div>
          </div>
        </div>
      );

    case "character":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ✨ 나의 타고난 천명 성향 유형 분석
          </h3>
          <div className="bg-gradient-to-br from-[#2D3A30] to-[#1E2620] border-4 border-[#A3845B] rounded-xl p-8 text-center text-[#FAF7F0] space-y-4 shadow-xl relative overflow-hidden">
            <span className="text-[10px] tracking-[0.3em] text-[#A3845B] font-bold block">MY DESTINY TYPE</span>
            <h4 className="font-myeongjo text-2xl md:text-3xl font-extrabold text-[#A3845B] tracking-wider animate-pulse">
              "{metrics.nickname}"
            </h4>
            <div className="inline-block bg-[#8B221E] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-white shadow-md">
              유형 희귀도: 상위 {metrics.rarity} 극희귀 사주 🌟
            </div>
            <p className="text-xs md:text-sm leading-relaxed font-light font-traditional pt-4 border-t border-[#A3845B]/30 max-w-md mx-auto" dangerouslySetInnerHTML={{ __html: metrics.description }} />
          </div>
          <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 text-xs space-y-3 leading-relaxed text-[#5F5F5F]">
            <h4 className="font-bold text-[#A3845B] font-myeongjo">💡 타고난 천명 성향이 시사하는 운명의 방향성</h4>
            <p className="font-light">
              여기서 설명해 드리는 <strong>천명 성향(명조 유형)과 희귀도</strong>는 예로부터 전해 내려오는 전통 명리학의 심오한 간지 분석을 현대적인 관점에서 직관적으로 이해하실 수 있도록 재구성한 것입니다. 귀하의 사주가 보여주는 궁극적인 삶의 방향성은 단순히 다수가 걷는 보편적이고 평범한 길을 맹목적으로 따르는 것이 결코 아닙니다.
            </p>
            <p className="font-light">
              오히려 귀하의 명조는 <strong>본인만이 지닌 고유한 전문 지식, 국가 공인 자격(라이선스), 혹은 아무나 흉내 낼 수 없는 특수한 기술적 역량</strong>을 갈고닦아 자신만의 단단하고 독립적인 영역을 선점해야 합니다. 조직에 종속되더라도 단순 대직자 역할에 머무르기보다는, 핵심적인 열쇠를 쥔 독보적인 전문가로 활동할 때 인생의 막힌 운이 비로소 시원하게 뚫리게 됩니다.
            </p>
            <p className="font-light">
              남들의 속도에 휩쓸려 조급해하기보다 본인이 가장 잘할 수 있는 전문 분야를 묵묵히 개발하고 축적해 나가십시오. 이처럼 스스로가 하나의 브랜드가 되어 독립적인 영역을 개척하는 전략을 취할 때, 귀하의 사주가 품고 있는 재물과 명예의 그릇이 막힘없이 넓어지며 인생 후반기로 갈수록 더 크고 단단한 성공 가도에 안착하게 될 것입니다.
            </p>
          </div>
          <div className="border border-[#E2DDD5]/60 rounded-lg p-4 bg-white text-xs space-y-3 shadow-sm">
            <h4 className="font-bold text-[#1A1A1A] font-myeongjo">🏆 나와 같은 천명 성향의 역사적 성공 패턴</h4>
            <div className="text-[#5F5F5F] leading-relaxed font-light space-y-1.5">
              <p>
                • <strong>나무(木) 계열:</strong> 정주영 회장처럼 척박한 무에서 유를 일궈내는 불도저형 독립가 기질로, 남이 가지 않은 신규 시장의 선두주자로 설 때 극적인 성장을 보장받습니다.
              </p>
              <p>
                • <strong>불(火) 계열:</strong> 스티브 잡스 같은 혁신가형 선동가 기질로, 대중 앞에 자신을 드러내고 세상을 디자인하는 화려한 트렌드 리더로 설 때 성공이 빠릅니다.
              </p>
              <p>
                • <strong>대지(土) 계열:</strong> 워런 버핏 같은 묵묵하고 듬직한 투자자 기질로, 한 번 맺은 신뢰와 안정적인 자산을 끝까지 지켜내 큰 자산가 반열에 오릅니다.
              </p>
              <p>
                • <strong>바위(金) 계열:</strong> 이순신 장군 같은 원칙과 칼날 같은 결단력의 군인 기질로, 복잡한 이해관계를 명확히 쳐내고 흔들림 없는 조직의 수장으로 섭니다.
              </p>
              <p>
                • <strong>맑은 물(水) 계열:</strong> 세종대왕 같은 깊은 학문적 직관과 조용한 전략가 기질로, 판세를 뒤흔드는 거대한 기획이나 시스템을 설계하여 명성을 날립니다.
              </p>
            </div>
          </div>
        </div>
      );

    case "metrics_chart":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📈 사주 8대 성향 수치표
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주에 담긴 잠재력을 현대 사회에서 가장 직관적으로 이해할 수 있는 <strong>8가지 성향 지표(능력치)</strong>로 수치화한 것입니다. 내가 직장이나 사업, 대인관계에서 발휘하는 숨은 지능지수(IQ) 및 감성지수(EQ)의 강도를 뜻합니다.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "독립성 (Independence)", val: metrics.scores.independence, color: "bg-emerald-600" },
              { label: "승부욕 (Competitiveness)", val: metrics.scores.competitiveness, color: "bg-red-600" },
              { label: "기회포착 (Opportunity)", val: metrics.scores.opportunity, color: "bg-blue-600" },
              { label: "사업감각 (Business Sense)", val: metrics.scores.business, color: "bg-amber-600" },
              { label: "통찰력 (Insight)", val: metrics.scores.insight, color: "bg-purple-600" },
              { label: "추진력 (Drive)", val: metrics.scores.drive, color: "bg-indigo-600" },
              { label: "인내력 (Patience)", val: metrics.scores.patience, color: "bg-teal-600" },
              { label: "대인협상 (Negotiation)", val: metrics.scores.negotiation, color: "bg-pink-600" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#1A1A1A]">
                  <span>{item.label}</span>
                  <span className="text-[#8B221E] font-bold">{item.val}점</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "metrics_detail_1":
      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (독립성 / 승부욕)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              나를 상징하는 8가지 성향 중 자아의 핵심이 되는 독립성과 목표 달성의 불꽃인 승부욕을 명리론과 현대 행동 심리학 관점에서 종합적으로 분석한 심층 진단 보고서입니다.
            </p>
            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-[#5F7A68]">
                    • 독립성 지표 ({metrics.scores.independence}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-[#5F7A68] bg-[#5F7A68]/10 px-2.5 py-0.5 rounded-full">주체적 개척</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 독립성 점수는 **{metrics.scores.independence}점**으로, 이는 타인의 원조에 기대지 않고 자신의 운명을 주도적으로 개척해 가려는 강인한 자립심과 자아 강도를 의미합니다. 사주 원국 내에 독립성을 관장하는 기운이 잘 조율되어 있어, 집단이나 조직의 획일화된 규칙에 무조건 순응하기보다는 본인이 직접 의사결정의 주체가 되어 주도적으로 판을 이끌어갈 때 지치지 않고 최고의 퍼포먼스를 발휘하게 됩니다. 역경 속에서도 흔들리지 않는 자수성가형 인물의 표본이라 할 수 있습니다. 다만, 자존심이 다소 강해 타인의 이성적이고 진심 어린 조언마저 귀찮은 간섭이나 침해로 오해하여 밀어내는 고집(독선)으로 발현될 수 있으니, 유연한 경청의 태도를 의식적으로 기르는 것이 개운의 핵심입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>독립성 극대화 가이드라인:</strong> 의존적인 협업 구도보다는 나만의 고유 권한이 확보된 R&D, 독자 프로젝트, 혹은 1인 전담 업무처럼 책임 소재가 명확한 포지션에서 업무 생산성이 수 배 이상 폭발합니다. 중대한 결정 시에는 신뢰할 수 있는 멘토들의 조언을 최소 2개 이상 비교 검증하는 프로세스를 거치십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-red-700">
                    • 승부욕 지표 ({metrics.scores.competitiveness}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">성과 창출</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 승부욕 지표는 **{metrics.scores.competitiveness}점**으로 매우 뜨겁고 활기찬 목표 지향적 본능을 보여줍니다. 단순히 남을 이기려는 심리적 지배욕을 넘어, 장애물을 만나거나 남들이 포기하는 한계 상황일 때 승부욕이 자극되어 오히려 성취 속도와 에너지가 강력하게 활성화됩니다. 불리한 조건 속에서도 상황을 반전시켜 기필코 목표를 쟁취해 내는 돌파력이 우수합니다. 하지만 이 뜨거운 에너지는 감정의 조급증이나 작은 패배에도 크게 흔들리는 급격한 감정 냉각을 야기할 수 있습니다. 겉으로는 과열된 승부 본능을 유지하되, 내적으로는 냉철한 페이스 조절을 통해 장기 레이스에서 방전되지 않도록 제어 장치를 심어야 합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>승부욕 극대화 가이드라인:</strong> 정량화된 실적 평가 시스템이 존재하거나 경쟁적 자극이 주어지는 환경에 자신을 배치하면 잠재능력이 120% 각성됩니다. 다만, 과열된 날카로움이 주변인과의 불필요한 마찰로 번지지 않도록 하루 일과 후 호흡을 가다듬는 휴식을 꼭 습관화하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "metrics_detail_2":
      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (기회포착 / 사업감각)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              내 운명의 재물적 흐름을 관장하는 기회포착 능력과 시장의 부가가치를 창출해내는 사업적 본능을 다각도로 분석하여 실제 자산 축적에 적용 가능한 전략적 해설을 담았습니다.
            </p>
            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-blue-700">
                    • 기회포착 지표 ({metrics.scores.opportunity}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">직관적 안목</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 기회포착 지표는 **{metrics.scores.opportunity}점**입니다. 이는 외부 시장의 트렌드 변화나 흐름 속에서 유무형의 가치와 기회를 남들보다 빠르게 인지해 내는 직관력과 안목의 강도를 의미합니다. 이 기운이 발달한 사람은 계약 구조상의 빈틈, 유망한 투자처, 혹은 사업적 제휴 관계에서 본인에게 유리한 결정적인 타이밍을 기막히게 맞추는 동물적 본능을 소유하고 있습니다. 위기를 기회로 치환하는 센스가 대단히 뛰어난 사주입니다. 다만, 단기적인 타이밍 싸움에만 몰두하면 거시적인 큰 판의 흐름을 놓칠 수 있으므로 성급한 진입보다는 관망과 검증을 병행하는 호흡의 정돈이 요구됩니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>기회포착 극대화 가이드라인:</strong> 시장 동향을 선점해야 하는 신규 기획, 트렌드 분석가, 투자 파트너십 조율 직무에서 활약할 때 이익을 최대화합니다. 결정을 내리기 직전, 단순한 본인의 촉에만 의존하기보다는 객관적 통계 데이터 검증 과정을 거쳐 기회포착의 정밀도를 200% 보강하십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-amber-700">
                    • 사업감각 지표 ({metrics.scores.business}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">시스템 설계</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 사업감각 지표는 **{metrics.scores.business}점**을 기록하고 있습니다. 이는 정해진 월급 체계의 안정적 울타리에 안주하기보다는, 유동적인 자본의 흐름을 설계하고 자원과 인력을 구조화하여 새로운 수익을 창출하려는 시스템 구축 본능입니다. 플랫폼 비즈니스나 중간 유통, 기술의 상용화 등 시장의 부가가치 구조를 머릿속으로 시뮬레이션하는 능력이 남다릅니다. 설령 지금 직장생활을 하고 계시더라도 마음 깊은 곳에서는 언제든 자신의 브랜드를 내걸고 독자적인 사업체를 경영하고 싶어 하는 불씨가 항상 불타고 있습니다. 다만 세밀한 재무 설계와 내실 관리 없이 확장성만 쫓아가면 유동성 위기를 맞이할 수 있으니 튼튼한 기초 체력이 우선입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>사업감각 극대화 가이드라인:</strong> 나의 직접적인 육체적 노동력 투입을 배제하더라도 수익이 순환하도록 만드는 무형 자산(지적 재산권, 자동화 중개 시스템, 대리인 체제 등) 구축에 흥미를 가지고 체계적인 비즈니스 구조를 중점 설계해 나가야 합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "metrics_detail_3":
      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (추진력 / 인내력)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              행동의 속도를 조절하는 돌파구인 추진력과 난관을 견뎌내어 마침내 결실을 얻어내는 우직한 인내력의 조화를 상세 진단합니다.
            </p>
            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-indigo-700">
                    • 추진력 지표 ({metrics.scores.drive}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">과감한 실행</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 추진력 지표는 **{metrics.scores.drive}점**으로, 계획한 바를 즉각적이고 과감한 행동력으로 변환하는 리더십의 세기와 관계가 깊습니다. 머뭇거리는 모호함을 싫어하며 일단 부딪쳐 가며 문제점을 실시간으로 교정해 나가는 과감함이 특징입니다. 침체된 조직의 분위기를 쇄신하거나 완전히 새로운 영역의 프로젝트를 선두 지휘할 때 빛을 발하는 개척의 아이콘이 됩니다. 다만, 정밀한 사전 검토가 생략된 지나친 과속은 불필요한 비용 낭비나 예기치 않은 위험을 초래할 수 있으니 속도 조율이 필요합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>추진력 극대화 가이드라인:</strong> 초기 스타트업 단계나, 시장이 급변하여 빠른 판단력과 과감한 실행이 생명인 기동 타격대 성격의 환경에서 가치가 무한히 확장됩니다. 결정을 내린 직후 최종 실행 개시 전에 리스크를 방어할 수 있는 신중한 기획자나 장치를 곁에 두십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-teal-700">
                    • 인내력 지표 ({metrics.scores.patience}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">대기만성</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 인내력 지표는 **{metrics.scores.patience}점**으로, 이는 거센 시련과 방해 요소 속에서도 목표를 포기하지 않고 우직하게 밀고 나가는 지속성과 뚝심의 크기입니다. 세상의 빠른 유행 변화에 일희일비하여 방향을 바꾸지 않으며, 시간이 지날수록 본인의 진가를 더해가는 전형적인 대기만성형 자산 형성 사주의 버팀목입니다. 주변인들에게 신뢰감을 심어주는 뿌리 깊은 나무와 같습니다. 그러나 흐름이 다하여 정리해야 할 타이밍에도 단순한 자존심이나 집착으로 일을 무작정 붙잡고 있는 아집을 반드시 경계해야 실속을 챙깁니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>인내력 극대화 가이드라인:</strong> 중장기 연구 개발, 정교한 라이선스 취득을 필요로 하는 전문 자격 영역, 혹은 부동산 및 주식 장기 가치 투자가 필요한 구조에서 결국 압도적인 결실을 거두게 됩니다. 사업이나 투자 전 최악의 한계선(손절 라인)을 설정해 고집으로 인한 낭비를 예방하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "metrics_detail_4":
      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (통찰력 / 대인협상)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              본질을 읽어 흐름의 맹점을 간파하는 지혜인 통찰력과, 인간관계의 흐름을 조율해 최고의 파트너십을 유도하는 협상력을 진단합니다.
            </p>
            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-purple-700">
                    • 통찰력 지표 ({metrics.scores.insight}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">본질 직시</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 통찰력 지표는 **{metrics.scores.insight}점**을 나타냅니다. 이는 어지럽게 나열된 데이터와 현상의 겉모습에 속지 않고, 그 이면의 핵심 구조와 미래적 방향성을 꿰뚫는 분석적 지혜입니다. 학문, 문화/기획, 컨설팅, 고급 설계 영역에서 진가를 발휘하며, 복잡한 인과관계를 일목요연하게 풀어내는 지적 탁월성을 부여합니다. 상황 변화의 징후를 먼저 인지해 사전 경고하는 훌륭한 나침반 기질을 가지고 있습니다. 다만 생각이 꼬리를 물고 지나치게 깊어질 시 결정 장애에 빠져 현실적 기회를 실기할 수 있으니 주의하십시오.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>통찰력 극대화 가이드라인:</strong> 전략 기획부서, 리스크 분석 관리자, 미래 기술 트렌드 큐레이터 등 본질을 입체적으로 규정해내야 하는 특수 핵심 분야에서 핵심 책사 역할을 합니다. 본인의 머릿속 복잡한 통찰을 대중의 쉽고 실천적인 비즈니스 언어로 단순화해 전달하는 소통 연습을 해두면 성장이 배가됩니다.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-pink-700">
                    • 대인협상 지표 ({metrics.scores.negotiation}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full">공생의 지혜</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 대인협상 점수는 **{metrics.scores.negotiation}점**입니다. 협상력은 대인관계 속에서 상대의 필요조건(Needs)과 성격 특성을 재빨리 캐치하여 피차 이로운 공생(Win-Win)의 결론을 도출해내는 탁월한 외교력과 감성 지능의 결정체입니다. 첨예하게 대립하는 갈등 상황에서 완충 작용과 매끄러운 중재를 담당하며, 상대를 내 편으로 만드는 언어적 소통 미학을 지니고 있습니다. 그러나 타인을 만족시키려는 과도한 배려심으로 인해, 정작 내가 가져와야 할 핵심 실익이나 보상을 은연중에 양보하는 성향이 있으므로 계약서 작성 시에는 칼같이 실리를 챙기는 단호함을 연마하십시오.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>대인협상 극대화 가이드라인:</strong> 핵심 영업 제휴, 분쟁 조정, 고객 관리 총괄, 대외 브랜드 파트너십 구축 직책에서 최고 가치 자원이 됩니다. 비즈니스 협상을 치르기 전 양보할 수 없는 협상 범위를 문서로 미리 확실히 고정해 둠으로써 인간적인 감정에 휘둘려 실속을 잃지 않도록 보완책을 세우십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "stem_detail":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🌟 나의 일간(日干) 심층 분석
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light">
              일간(日干)은 사주팔자 중에서 '나 자신'을 상징하는 가장 핵심적인 기운입니다. 하늘이 내려준 태생적 자아의 색깔이자 기질이며, 평생 인생을 이끄는 에너지의 근원입니다.
            </p>

            {/* 일간 메인 진단 카드 */}
            <div className="bg-gradient-to-br from-[#F6F3EC] to-[#EDE8DE] border-2 border-[#A3845B]/50 rounded-xl p-6 mb-5 shadow-md">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">
                  👑 {name}님의 태어난 날의 하늘 기운 — {baseEl} 일간
                </h4>
                <span className="text-[10px] bg-[#A3845B] text-white px-2 py-0.5 rounded-full font-bold shrink-0 ml-2">하늘 기운</span>
              </div>
              <p className={`text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional text-justify ${blurClass}`} dangerouslySetInnerHTML={{
                __html: baseEl === "목" ? "귀하는 우뚝 솟아오르는 푸른 나무(木)의 일간을 가졌습니다. 어떤 환경에서도 <strong>타인의 지시나 강요를 거부하는 강한 독립성</strong>을 지녔으며, 끊임없이 위로 자라나려는 성장 본능이 탁월합니다. 봄의 새싹처럼 역경에도 굴하지 않고 반드시 위로 뻗어올라가는 불굴의 의지를 타고났으며, 창의적인 발상과 새로운 시작을 도모하는 도전 정신이 유달리 강합니다. 다만, 단단하지만 부러지기 쉬운 나무의 성질처럼, 지나친 자존심과 완고함이 때로는 스스로의 기회를 꺾어버릴 수 있으니 융통성을 키우는 것이 귀하의 운명을 열어주는 개운의 시작입니다." :
                       baseEl === "화" ? "귀하는 온 세상을 밝게 비추는 불꽃(火)의 일간을 가졌습니다. 타오르는 기세처럼 <strong>화끈하고 직설적이며 거짓 없는 솔직함</strong>이 매력이며, 어두운 곳을 밝혀주는 태양처럼 주변인들에게 열정과 희망을 공급해주는 등불 같은 존재입니다. 사교적 끼와 리더십이 뛰어나 자연스럽게 무리의 중심으로 부상하지만 감정의 기복이 잦고 마무리의 인내심이 부족할 우려가 있으니 차분하게 안정을 도모해야 합니다. 불이 다 타고 나면 재만 남듯, 에너지 과잉 소진을 경계하십시오." :
                       baseEl === "토" ? "귀하는 만물을 포용하는 황색 대지(土)의 일간을 가졌습니다. 무엇이든 품어주고 기르는 포용력과 신뢰를 가져 대인관계가 원만하고 흔들림이 없습니다. 대지가 만물을 자라게 하듯, 타인의 부탁과 의견을 경청하고 수용하는 능력이 탁월하여 많은 사람들의 사랑을 받습니다. 단점은 결단력이 무디고 환경 변화에 너무 둔감하여 결정적 기회를 놓칠 수 있으니 신속한 결단력을 의식적으로 보강하십시오. 주변 상황에 지나치게 의존하는 경향도 주의가 필요합니다." :
                       baseEl === "금" ? "귀하는 서리 맞은 예리한 칼날과 바위(金)의 일간을 가졌습니다. 시비를 명확히 가리고 공사 구분이 뚜렷한 냉철함을 지녔습니다. 강인한 금속의 성질처럼 한 번 뜻을 정하면 어떤 어려움에도 흔들리지 않는 굳은 신념과 원칙이 귀하의 가장 큰 강점입니다. 일처리가 완벽하고 강직하지만 차가운 칼날 같은 언어 표출이 타인에게 원치 않는 상처를 줄 수 있으니, 의식적으로 따뜻하게 감싸 안는 훈련을 통해 냉정함에 온기를 더해야 합니다." :
                       "귀하는 잔잔하게 흐르며 바다를 향하는 맑은 물(水)의 일간을 가졌습니다. 한없는 지혜와 통찰을 가졌으며, 어떤 장애물을 만나도 우회하는 유연성이 독보적인 장점입니다. 물이 만물을 적시고 생명을 키우듯, 지식과 지혜를 탐구하며 깊은 내면의 세계를 가진 학자 기질이 두드러집니다. 겉은 평온하지만 속내를 전혀 알 수 없어 오해를 사거나 내적인 불안과 우울에 갇히기 쉬우니 감정을 밝게 표현하는 연습과 적극적인 소통이 필요합니다."
              }} />
            </div>

            {/* 일간별 강점 약점 분석 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 shadow-sm">
                <h5 className="font-myeongjo text-xs font-bold text-emerald-700 mb-2">💪 {baseEl} 일간의 핵심 강점</h5>
                <ul className={`text-[11px] text-[#2C2C2C] font-light space-y-1 leading-relaxed ${blurClass}`}>
                  {baseEl === "목" && <><li>• 강한 독립심과 도전 의식</li><li>• 창의적이고 참신한 아이디어</li><li>• 어떤 역경도 버텨내는 생명력</li><li>• 새로운 분야 개척 능력</li></>}
                  {baseEl === "화" && <><li>• 타오르는 열정과 카리스마</li><li>• 탁월한 표현력과 사교성</li><li>• 주변을 밝히는 리더십</li><li>• 직관적이고 빠른 판단력</li></>}
                  {baseEl === "토" && <><li>• 뛰어난 포용력과 중재 능력</li><li>• 두텁고 믿음직한 신뢰감</li><li>• 착실하고 성실한 자산 관리</li><li>• 균형 있는 인간관계 유지</li></>}
                  {baseEl === "금" && <><li>• 불굴의 원칙과 강인한 의지</li><li>• 완벽하고 빈틈없는 일처리</li><li>• 날카로운 판단력과 결단력</li><li>• 의리 있고 듬직한 신뢰</li></>}
                  {baseEl === "수" && <><li>• 깊고 통찰력 있는 지혜</li><li>• 유연하고 현명한 문제 해결</li><li>• 탁월한 학습 능력과 전략적 사고</li><li>• 조용하지만 강력한 영향력</li></>}
                </ul>
              </div>
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 shadow-sm">
                <h5 className="font-myeongjo text-xs font-bold text-red-700 mb-2">⚠️ {baseEl} 일간의 극복 과제</h5>
                <ul className={`text-[11px] text-[#2C2C2C] font-light space-y-1 leading-relaxed ${blurClass}`}>
                  {baseEl === "목" && <><li>• 고집과 독선으로 인한 갈등</li><li>• 타협을 거부하는 완고함</li><li>• 유연성 및 융통성 부족</li><li>• 지나친 자존심으로 인한 고립</li></>}
                  {baseEl === "화" && <><li>• 급한 성격과 감정의 기복</li><li>• 시작은 화끈하나 마무리 약함</li><li>• 에너지 소진 후 급격한 침체</li><li>• 충동적인 결정으로 인한 후회</li></>}
                  {baseEl === "토" && <><li>• 우유부단하고 느린 결단력</li><li>• 변화에 대한 둔감함과 저항</li><li>• 지나친 고집과 집착</li><li>• 수동적이고 소극적인 태도</li></>}
                  {baseEl === "금" && <><li>• 냉정한 언어로 인한 상처</li><li>• 완벽주의로 인한 스트레스</li><li>• 타인의 감정에 대한 무감각</li><li>• 고집스럽고 융통성 부족</li></>}
                  {baseEl === "수" && <><li>• 속내를 숨겨 생기는 오해</li><li>• 과도한 사색으로 인한 결단 지연</li><li>• 내적 불안과 고립감</li><li>• 소통 부재로 인한 관계 어려움</li></>}
                </ul>
              </div>
            </div>

            {/* 귀인 조언 */}
            <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-white shadow-sm">
              <h4 className="font-bold text-xs text-[#1A1A1A] font-myeongjo mb-2">💡 {baseEl} 일간을 돕는 귀인(貴人) 인연 및 대인관계 핵심 조언</h4>
              <p className={`text-[11px] font-light leading-relaxed text-[#2C2C2C] text-justify ${blurClass}`}>
                귀하의 {baseEl} 성정은 나를 진심으로 인정하고 수용해주는 조력자와의 만남에서 최고의 에너지를 발산합니다.
                {baseEl === "목" && " 나를 포용해주는 수(水) 기운의 선배나 멘토, 함께 성장을 도모하는 화(火) 기운의 동료와 어울릴 때 시너지가 극대화됩니다. 상대의 의견을 '나에 대한 간섭'이 아닌 '또 다른 관점의 선물'로 받아들이는 열린 마음을 훈련하십시오."}
                {baseEl === "화" && " 나에게 차분함과 안정을 주는 수(水) 기운의 파트너, 든든한 기반을 제공하는 토(土) 기운의 조력자가 귀합니다. 열정을 잃지 않되, '마무리의 기술'을 기르는 것이 귀하의 인생 성취를 결정짓는 핵심입니다."}
                {baseEl === "토" && " 나의 결단을 촉진해주는 목(木) 기운의 활동적 동반자, 새로운 시각을 열어주는 화(火) 기운의 파트너와의 관계에서 잠든 잠재력이 깨어납니다. 편안함에 안주하지 않고 변화를 받아들이는 용기가 귀하의 삶을 풍요롭게 합니다."}
                {baseEl === "금" && " 나의 차가움을 녹여주는 화(火) 기운의 따뜻한 동료, 나를 부드럽게 다듬어주는 수(水) 기운의 지혜로운 멘토가 귀합니다. 완벽을 추구하되, '충분히 좋은 것'을 인정하는 너그러움이 인간관계의 온도를 높입니다."}
                {baseEl === "수" && " 나의 내면을 밝혀주는 목(木) 기운의 창의적 동료, 따뜻한 활력을 불어넣는 화(火) 기운의 파트너와의 관계에서 진가를 발휘합니다. 속마음을 솔직하게 표현하는 용기를 기르고, 고립보다는 적극적인 소통을 선택하십시오."}
              </p>
            </div>
          </div>
        </div>
      );

    case "ilju_secret":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔑 나의 일주(日柱)의 비밀 분석
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light">
              일주(日柱)는 태어난 날의 하늘 기운(천간)과 땅 기운(지지)이 결합된 운명의 본질입니다. 명리학에서 '나 자신'을 정의할 때 가장 신뢰도 높고 구체적인 핵심 분석 영역으로, 귀하의 인생 전반에 걸쳐 성격·재물·건강·배우자 운을 관장합니다.
            </p>

            {/* 일주 숙명 메인 카드 */}
            <div className="bg-white border-2 border-[#A3845B]/50 rounded-xl p-6 mb-5 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">
                  📍 {sajuInfo.day.stem}{sajuInfo.day.branch} ({sajuInfo.day.stemEl}/{sajuInfo.day.branchEl}) 일주의 숙명
                </h4>
                <div className="flex gap-1">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-myeongjo shadow ${getElementBarColor(sajuInfo.day.stemEl)}`}>{sajuInfo.day.stem}</span>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-myeongjo shadow ${getElementBarColor(sajuInfo.day.branchEl)}`}>{sajuInfo.day.branch}</span>
                </div>
              </div>
              <p className={`text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional text-justify whitespace-pre-line ${blurClass}`} dangerouslySetInnerHTML={{ __html: iljuSecret }} />
            </div>

            {/* 일주 4대 영역 분석 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-xl p-4 space-y-2">
                <h5 className="font-myeongjo text-xs font-bold text-[#A3845B] border-b border-[#E2DDD5]/60 pb-1">💰 재물 운 성향</h5>
                <p className={`text-[11px] text-[#2C2C2C] font-light leading-relaxed ${blurClass}`}>
                  일지(日支)의 지장간 중 재성(財星)이 숨어있는지에 따라 재물과의 관계가 결정됩니다. 귀하의 일주는 꾸준한 노력과 전문성 축적을 통해 재물이 차곡차곡 쌓이는 <strong>누적형 자산 형성</strong>의 패턴을 가집니다. 한탕주의나 투기성 투자보다는, 검증된 방식의 장기적 자산 관리가 귀하의 재물운을 극대화합니다.
                </p>
              </div>
              <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-xl p-4 space-y-2">
                <h5 className="font-myeongjo text-xs font-bold text-[#5F7A68] border-b border-[#E2DDD5]/60 pb-1">💍 배우자·가정 운</h5>
                <p className={`text-[11px] text-[#2C2C2C] font-light leading-relaxed ${blurClass}`}>
                  일지(日支)는 배우자의 자리입니다. 귀하의 일지는 <strong>나를 무조건적으로 후원하고 품어주는 헌신적 동반자</strong>와의 인연이 깊습니다. 서로 이끌고 밀어주는 관계에서 가정이 안정되며, 배우자와의 칭찬과 인정의 언어 교환이 가정 화목의 핵심 열쇠입니다.
                </p>
              </div>
              <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-xl p-4 space-y-2">
                <h5 className="font-myeongjo text-xs font-bold text-red-700 border-b border-[#E2DDD5]/60 pb-1">⚕️ 건강 관리 포인트</h5>
                <p className={`text-[11px] text-[#2C2C2C] font-light leading-relaxed ${blurClass}`}>
                  일주의 오행 조합이 신체의 특정 장부와 연결됩니다. {sajuInfo.day.stemEl === "목" ? "목(木) 계열은 간·담낭과 눈·신경계를 관장하니 과로와 스트레스 관리, 규칙적인 수면 습관이 최우선 건강 과제입니다." : sajuInfo.day.stemEl === "화" ? "화(火) 계열은 심장·소장과 혈액순환계를 관장하니, 급격한 감정 흥분과 과도한 음주·커피를 절제하고 마음의 평온을 유지하는 것이 건강의 핵심입니다." : sajuInfo.day.stemEl === "토" ? "토(土) 계열은 비장·위와 소화기계를 관장하니, 규칙적인 식사와 담백한 식단 유지, 위장 건강 관리에 세심한 주의가 필요합니다." : sajuInfo.day.stemEl === "금" ? "금(金) 계열은 폐·대장과 호흡기계를 관장하니, 공기 질 관리와 금연·금주, 규칙적인 호흡 운동(요가, 명상)이 건강의 기본입니다." : "수(水) 계열은 신장·방광과 생식비뇨기계를 관장하니, 충분한 수분 섭취와 냉기 차단, 규칙적인 운동으로 신진대사를 활성화하는 것이 건강의 핵심입니다."}
                </p>
              </div>
              <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-xl p-4 space-y-2">
                <h5 className="font-myeongjo text-xs font-bold text-indigo-700 border-b border-[#E2DDD5]/60 pb-1">🏆 최적 직업 방향</h5>
                <p className={`text-[11px] text-[#2C2C2C] font-light leading-relaxed ${blurClass}`}>
                  일주의 천간지지 조합은 타고난 직업 적성의 방향을 시사합니다. {sajuInfo.day.stemEl === "목" ? "목(木) 일간은 교육·출판·기획·의료·법조·환경 분야에서 탁월한 능력을 발휘합니다." : sajuInfo.day.stemEl === "화" ? "화(火) 일간은 언론·방송·예술·외교·마케팅·IT 분야에서 뛰어난 활약이 기대됩니다." : sajuInfo.day.stemEl === "토" ? "토(土) 일간은 금융·부동산·농업·건설·유통·관리 분야에서 안정적 성취를 이룹니다." : sajuInfo.day.stemEl === "금" ? "금(金) 일간은 군경·법조·금융·제조·정밀기계·의료 분야에서 빛을 발합니다." : "수(水) 일간은 학문·연구·전략·외교·해양·IT·철학 분야에서 두각을 나타냅니다."} 귀하의 핵심 역량을 가장 잘 살릴 수 있는 분야를 중심으로 전문성을 집중 개발하십시오.
                </p>
              </div>
            </div>

            {/* 일주 행운 조언 */}
            <div className="border border-[#A3845B]/30 rounded-xl p-4 bg-gradient-to-r from-[#FAF7F0] to-[#F6F3EC] shadow-sm">
              <h4 className="font-bold text-xs text-[#A3845B] font-myeongjo mb-2">✨ {sajuInfo.day.stem}{sajuInfo.day.branch} 일주를 위한 개운 행동 강령</h4>
              <div className={`text-[11px] text-[#2C2C2C] font-light leading-relaxed space-y-1 ${blurClass}`}>
                <p>① 매일 아침 감사 일기 3줄 쓰기 — 긍정의 주파수가 재물운을 부릅니다.</p>
                <p>② 행운 방위인 <strong>{sajuInfo.day.stemEl === "목" || sajuInfo.day.stemEl === "화" ? "동쪽·남쪽" : sajuInfo.day.stemEl === "토" ? "중앙·남서쪽" : sajuInfo.day.stemEl === "금" ? "서쪽·북서쪽" : "북쪽·서쪽"}</strong>을 향해 중요 업무나 공부를 하면 집중력이 배가됩니다.</p>
                <p>③ 행운 색상 <strong>{sajuInfo.day.stemEl === "목" ? "초록·청색" : sajuInfo.day.stemEl === "화" ? "붉은색·주황색" : sajuInfo.day.stemEl === "토" ? "황토색·베이지" : sajuInfo.day.stemEl === "금" ? "흰색·금색·회색" : "검정·짙은 남색"}</strong>을 활용해 에너지를 보강하십시오.</p>
                <p>④ 중요한 결정은 <strong>봄·여름에 시작</strong>하고, 가을·겨울에 결실을 맺는 계절의 리듬에 맞추십시오.</p>
              </div>
            </div>
          </div>
        </div>
      );

    case "destiny_harmony": {
      const harmonyData = getDestinyHarmonyData(sajuInfo);
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2DDD5] pb-3">
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <span>☯️</span> 여덟 글자의 운명 조화 및 마음가짐 처방
            </h3>
            <span className="text-[10px] bg-[#A3845B]/10 text-[#A3845B] px-2.5 py-1 rounded font-bold">
              조화도 지수: {harmonyData.rarity}
            </span>
          </div>

          <p className="text-xs text-[#5F5F5F] leading-relaxed font-light">
            {harmonyData.intro}
          </p>

          <div className="bg-[#F9F8F6] p-5 rounded-lg border border-[#E2DDD5] space-y-3 shadow-sm">
            <h4 className="font-bold text-xs text-[#A3845B] tracking-wide uppercase">
              💡 오행 과다 및 결핍 기류 진단
            </h4>
            <p className="text-xs leading-relaxed text-[#1A1A1A] font-medium">
              {harmonyData.harmonyAnalysis}
            </p>
          </div>

          {/* 마음가짐 리셋 처방 박스 */}
          <div className="border-2 border-double border-[#A3845B]/40 bg-white rounded-lg p-6 relative overflow-hidden shadow-md">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#A3845B]/5 rounded-bl-full flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#A3845B]/40 rotate-45 select-none">慧眼</span>
            </div>
            
            <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-2 mb-3">
              <span>✨</span> 나의 운명을 극복하는 [마음가짐 리셋 처방]
            </h4>
            
            <div className="bg-[#F9F8F6]/75 border-l-4 border-[#A3845B] p-4 rounded-r">
              <p className="font-myeongjo text-xs leading-relaxed text-[#3A3A3A] italic font-semibold">
                &ldquo;{harmonyData.mindsetPrescription}&rdquo;
              </p>
            </div>
            
            <p className="text-[10px] text-[#7F7F7F] mt-3 font-light leading-relaxed">
              * 명리 보감 팁: 생각의 궤도가 바뀔 때, 타고난 사주의 흐름도 순행하기 시작합니다. 부정적인 충동이 몰려올 때마다 이 선언을 마음에 새기십시오.
            </p>
          </div>

          {/* 일간 뱃지 및 주변 오행 기류 */}
          <div className="border border-[#E2DDD5]/70 rounded-lg p-5 bg-white shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-[#1A1A1A] font-myeongjo">
              🔍 나의 일간(日干)을 둘러싼 오행 조화도
            </h4>
            <div className="flex flex-col md:flex-row items-center justify-around gap-4 py-2">
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-inner font-bold text-white text-lg ${getElementBarColor(harmonyData.dayStemEl)}`}>
                  <span className="text-xl font-myeongjo">{harmonyData.dayStem}</span>
                  <span className="text-[9px] opacity-90">{harmonyData.dayStemEl}</span>
                </div>
                <span className="text-[10px] text-[#A3845B] font-bold mt-2">나의 본질(일간)</span>
              </div>
              
              <div className="flex-1 w-full text-xs space-y-2 text-[#5F5F5F]">
                <div className="flex justify-between items-center border-b border-[#F2EDE5] pb-1">
                  <span>목(木) 에너지 흐름</span>
                  <span className="font-bold text-[#1A1A1A]">{sajuInfo?.elements?.목 || 0}개</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F2EDE5] pb-1">
                  <span>화(火) 에너지 흐름</span>
                  <span className="font-bold text-[#1A1A1A]">{sajuInfo?.elements?.화 || 0}개</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F2EDE5] pb-1">
                  <span>토(土) 에너지 흐름</span>
                  <span className="font-bold text-[#1A1A1A]">{sajuInfo?.elements?.토 || 0}개</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#F2EDE5] pb-1">
                  <span>금(金) 에너지 흐름</span>
                  <span className="font-bold text-[#1A1A1A]">{sajuInfo?.elements?.금 || 0}개</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span>수(水) 에너지 흐름</span>
                  <span className="font-bold text-[#1A1A1A]">{sajuInfo?.elements?.수 || 0}개</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "inner_disposition": {
      const dispositionData = getInnerDispositionData(sajuInfo);
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ☯️ 타고난 기질 분석 및 3대 행동 강령
          </h3>

          {/* 6칸 만세력 기둥 블록 요약 카드 */}
          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] shadow-inner space-y-2">
            <span className="text-[10px] text-[#A3845B] font-bold block text-center">나의 삼주(三柱) 6칸 인생 에너지 코드</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-[#A3845B]/15 py-1.5 font-bold text-[#A3845B] rounded-t-md">일주 (日柱)</div>
              <div className="bg-[#A3845B]/15 py-1.5 font-bold text-[#A3845B] rounded-t-md">월주 (月柱)</div>
              <div className="bg-[#A3845B]/15 py-1.5 font-bold text-[#A3845B] rounded-t-md">연주 (年柱)</div>
              
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.day?.stemEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.day?.stem}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.day?.stemEl}</span>
              </div>
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.month?.stemEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.month?.stem}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.month?.stemEl}</span>
              </div>
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.year?.stemEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.year?.stem}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.year?.stemEl}</span>
              </div>
              
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.day?.branchEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.day?.branch}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.day?.branchEl}</span>
              </div>
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.month?.branchEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.month?.branch}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.month?.branchEl}</span>
              </div>
              <div className={`py-4 rounded-lg font-bold text-base ${getElementColor(sajuInfo?.year?.branchEl)}`}>
                <span className="block text-xl font-myeongjo">{sajuInfo?.year?.branch}</span>
                <span className="text-[9px] opacity-75">{sajuInfo?.year?.branchEl}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-[#5F5F5F] leading-relaxed font-light mt-4">
            {dispositionData.dispositionSummary}
          </p>

          {/* 3대 행동 강령 */}
          <div className="space-y-3 mt-4">
            <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] border-b border-[#E2DDD5]/60 pb-1.5">
              📋 [운의 궤도를 바꾸는 3대 행동 강령]
            </h4>
            <div className="grid gap-3">
              {dispositionData.actionGuidelines.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-white p-4 rounded-lg border border-[#E2DDD5]/70 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-[#A3845B]/10 text-[#A3845B] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    0{idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-[#1A1A1A]">{item.title}</h5>
                    <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 비기 해설 (무료버전 잠금) */}
          <div className="mt-4 border border-[#E2DDD5]/60 rounded-lg p-4 bg-[#FDFDFD] relative overflow-hidden">
            <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] mb-2 flex items-center gap-1.5">
              🔒 혜안당 명리 비기 (일주의 심층 결합 비밀)
            </h4>
            
            <div className={`${isFree ? "blur-[5px] select-none pointer-events-none" : ""} text-[11px] text-[#5F5F5F] leading-relaxed`}>
              {dispositionData.secretKeys}
            </div>
            
            {isFree && (
              <div className="absolute inset-0 bg-[#F9F8F6]/60 flex flex-col items-center justify-center p-4 text-center">
                <svg className="w-5 h-5 text-[#A3845B] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-[10px] font-bold text-[#A3845B]">프리미엄 결제 후 비기 해설 전문 확인</span>
                <button 
                  onClick={handlePortonePayment} 
                  className="mt-2 text-[9px] bg-[#A3845B] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#8F724F] transition-colors"
                >
                  프리미엄 전환하기
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "lifestyle_strategy": {
      const strategyData = getLifeStyleStrategyData(sajuInfo);
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-[#E2DDD5] pb-2">
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <span>☯️</span> 살아가는 방식 및 행운물 풍수 공간 처방
            </h3>
            <span className="text-[10px] text-[#5F7A68] bg-[#5F7A68]/10 px-2.5 py-1 rounded font-bold">
              {strategyData.wealthType}
            </span>
          </div>

          <p className="text-xs text-[#5F5F5F] leading-relaxed font-light">
            {strategyData.lifestyleIntro}
          </p>

          {/* 행운물 & 공간 풍수 배치 처방 카드 */}
          <div className="border border-[#A3845B]/30 rounded-lg p-5 bg-[#F9F8F6] space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#A3845B]/5 rounded-bl-full flex items-center justify-end pr-4 pb-4 pointer-events-none">
              <span className="text-[9px] font-bold text-[#A3845B]/30 tracking-widest uppercase rotate-45 select-none">FENGSHUI</span>
            </div>
            
            <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] border-b border-[#E2DDD5] pb-2 flex items-center gap-1.5">
              <span>🏡</span> [재물운 극대화 행운의 물건 &amp; 공간 오행/풍수 배치 처방]
            </h4>

            <div className="grid gap-3">
              {Object.entries(strategyData.fengshui).map(([key, value]) => {
                return (
                  <div key={key} className="bg-white p-4 rounded border border-[#E2DDD5]/70 flex flex-col md:flex-row justify-between gap-3 relative">
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] bg-[#A3845B]/10 text-[#A3845B] px-2 py-0.5 rounded font-bold">
                        {value.space}
                      </span>
                      <div className="pt-1.5 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#1A1A1A]">추천 소품:</span>
                        <span className={`text-[12px] font-extrabold text-[#A3845B] border-b border-[#A3845B]/30 pb-0.5 ${isFree ? "blur-[6px] select-none pointer-events-none" : ""}`}>
                          {value.item}
                        </span>
                      </div>
                      <p className={`text-[11px] text-[#5F5F5F] leading-relaxed font-light pt-1 ${isFree ? "blur-[5px] select-none pointer-events-none" : ""}`}>
                        {value.desc}
                      </p>
                    </div>

                    {isFree && (
                      <div className="absolute inset-0 bg-[#F9F8F6]/40 flex items-center justify-center backdrop-blur-[0.5px]">
                        <div className="bg-white/95 px-3 py-1.5 rounded border border-[#E2DDD5] shadow-md flex items-center gap-1.5 pointer-events-auto">
                          <svg className="w-3.5 h-3.5 text-[#A3845B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-[9px] font-bold text-[#A3845B]">결제 후 행운의 물품 및 풍수 비책 확인</span>
                          <button 
                            onClick={handlePortonePayment} 
                            className="text-[8px] bg-[#A3845B] text-white px-1.5 py-0.5 rounded font-semibold hover:bg-[#8F724F] transition-colors"
                          >
                            잠금 해제
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 대운 전략 (무료버전 잠금) */}
          <div className="border border-[#E2DDD5]/60 rounded-lg p-4 bg-white shadow-sm relative overflow-hidden">
            <h4 className="font-myeongjo text-xs font-bold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
              🗝️ 대운 진입 장기 자산 전략 처방
            </h4>
            <p className={`text-[11px] text-[#5F5F5F] leading-relaxed font-light ${isFree ? "blur-[5px] select-none pointer-events-none" : ""}`}>
              {strategyData.daeunStrategy}
            </p>
            
            {isFree && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center p-3 text-center">
                <span className="text-[10px] font-bold text-[#A3845B] flex items-center gap-1">
                  🔒 프리미엄 대운 로드맵 전략 비공개 상태
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "deficiency":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ⚠️ 사주 속 결핍(무인성/무재성 등)의 비밀 및 생존 본능
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주 명식에 특정 오행이 0개이거나 현저하게 약할 때, 그 결핍은 오히려 삶에 강력한 갈증으로 작용하여 그 기운을 남들보다 필사적으로 채우고 이뤄내려는 <strong>'결핍의 생존 본능'</strong>과 무서운 성장력을 자극합니다.
          </p>
          <div className="bg-red-50/50 border border-red-200 rounded-lg p-6 space-y-4">
            <h4 className="font-myeongjo text-sm font-bold text-red-700">
              💡 귀하의 명조에서 발견되는 결핍 분석
            </h4>
            <div className={`text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional space-y-3 ${blurClass}`}>
              {Object.entries(sajuInfo.elements).filter(([_, count]) => count === 0).length > 0 ? (
                Object.entries(sajuInfo.elements).filter(([_, count]) => count === 0).map(([el]) => (
                  <p key={el} className="border-b border-red-200/50 pb-2 last:border-0 text-[#2C2C2C]">
                    • 귀하의 사주에는 **{el}({el === "목" ? "木" : el === "화" ? "火" : el === "토" ? "土" : el === "금" ? "金" : "수"}) 기운이 0개**로 완전히 결핍되어 있습니다. 
                    {el === "목" && " 시작하는 추진력과 과감성이 부족하여, 머릿속으로 수없이 완벽한 시나리오를 구상하고도 실제 행동으로 첫발을 내딛지 못해 기회를 놓치는 족쇄를 찰 수 있습니다."}
                    {el === "화" && " 본인을 화사하게 드러내고 표현하는 화(火) 기운이 없으므로, 과묵하고 낯을 많이 가려 본인의 진짜 가치보다 과소평가받기 십상입니다."}
                    {el === "토" && " 재물 창고인 토(土) 기운이 결핍되었기에 벌기는 많이 벌어도 지출 통제가 안 되어 자산이 고이지 못하고 모래성처럼 흩어지는 위험이 짙습니다."}
                    {el === "금" && " 결단과 차단력을 지닌 금(金) 기운이 부족하므로, 타인의 부탁을 모질게 거절하지 못하고 질질 끌려다니며 막대한 감정 노동과 손해를 겪기 쉽습니다."}
                    {el === "수" && " 지혜와 흐름을 관장하는 수(水) 기운이 없으니, 생각이 유연하지 못하고 고집에 갇혀 한 가지 오해나 앙금이 생기면 평생 가슴에 쌓고 사는 조급한 악순환에 노출됩니다."}
                  </p>
                ))
              ) : (
                <p className="font-light">
                  귀하의 사주에는 0개인 결핍 오행이 없이 비교적 골고루 에너지가 순환하고 있습니다. 이는 격동의 풍파가 몰아쳐도 내적으로 유연하게 회복하는 힘을 타고났음을 뜻하는 복된 명조입니다.
                </p>
              )}
            </div>
          </div>
          <div className="border border-red-200/80 rounded-lg p-4 bg-red-50/20 text-xs space-y-2 text-[#5F5F5F]">
            <h4 className="font-bold text-red-700 font-myeongjo">🚨 결핍을 극복하고 성장의 무기로 삼는 액션 플랜</h4>
            <p className={`font-light leading-relaxed ${blurClass}`}>
              사주에 없는 오행은 억지로 내 성격을 뜯어고쳐 채우려 하면 오히려 부작용이 생깁니다. 행동의 규칙으로 보완하는 방식이 안전합니다. 추진력(목)이 없다면 알람과 강제 스케줄러를 활용하고, 표현력(화)이 없다면 글로 생각을 미리 정리한 뒤 발언하며, 저축력(토)이 부족하면 강제 적금을 세팅해 월급의 50%를 원천 차단하십시오. 결단력(금)이 부족할 때는 부탁을 거절할 시간을 단 3분이라도 늦게 지연시켜 거절 답변 양식을 미리 정형화해 복사 붙여넣기 하십시오. 지혜(수)가 결핍됐다면 매일 밤 따뜻한 물로 샤워하며 생각을 15분간 비워내는 훈련이 극단의 운을 바꾸는 길잡이가 됩니다.
            </p>
          </div>
        </div>
      );

    case "strength":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🌱 타고난 성향과 기질 총평 (내면의 강점)
          </h3>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
            <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68]">
              🌟 귀하를 살리는 하늘의 선물, 3대 강점
            </h4>
            <div className="space-y-3 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="border-l-2 border-[#5F7A68] pl-3">
                <strong className="text-[#1A1A1A] block">1. 끈질긴 자생력과 회복 탄력성</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  어떤 시련을 만나도 바닥을 치고 올라오는 생명력이 대단합니다. 겉은 유연해보여도 절대 꺾이지 않는 내면의 뼈대를 가졌습니다.
                </p>
              </div>
              <div className="border-l-2 border-[#5F7A68] pl-3">
                <strong className="text-[#1A1A1A] block">2. 남다른 집중력과 전문 직관</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  내가 흥미를 가지는 한 분야에는 무서운 속도로 지식을 수용하고 끝을 파고드는 천재성을 발휘합니다.
                </p>
              </div>
              <div className="border-l-2 border-[#5F7A68] pl-3">
                <strong className="text-[#1A1A1A] block">3. 묵묵히 신뢰를 지켜내는 의리</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  가벼운 말다툼은 있을지언정, 한 번 진실된 관계를 맺은 사람에게는 끝까지 도리를 다해 대인관계의 평판이 길합니다.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-[#E2DDD5]/60 rounded-lg p-4 bg-white text-xs space-y-2 text-[#5F5F5F] shadow-sm">
            <h4 className="font-bold text-[#1A1A1A]">💡 이 강점을 비즈니스 성과로 끌어올리는 전술</h4>
            <p className={`font-light leading-relaxed ${blurClass}`}>
              귀하의 3대 강점은 '시간의 힘'과 결합할 때 시너지가 200% 증가합니다. 끈질긴 자생력이 있으므로 실패 비용이 저렴한 기획 단계의 도전들을 두려워하지 마시고 빠르게 론칭해보십시오. 한 우물을 깊게 파는 집중력은 자격증 취득이나 전문 학위, 독점 영업권 등 타인이 쉽게 복제할 수 없는 <strong>'진입 장벽이 높은 자산'</strong>을 만들 때 엄청난 부의 독점권을 가져다줄 것입니다.
            </p>
          </div>
        </div>
      );

    case "weakness":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            ⚠️ 극복해야 할 치명적인 약점 (팩트 폭격)
          </h3>
          <div className="bg-red-50/50 border border-red-200 rounded-lg p-6 space-y-4">
            <h4 className="font-myeongjo text-sm font-bold text-red-700">
              🚨 인생의 발목을 잡는 치명적인 구멍 3가지
            </h4>
            <div className="space-y-3 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="border-l-2 border-red-500 pl-3">
                <strong className="text-[#1A1A1A] block">1. 자존심이 앞서 기회를 차버리는 독선</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  자존심에 흠집이 생기면 현실적인 득실 계산을 완전히 마비시켜, 스스로 다리를 부러뜨리거나 판을 깨뜨리는 조급함을 범할 우려가 큽니다.
                </p>
              </div>
              <div className="border-l-2 border-red-500 pl-3">
                <strong className="text-[#1A1A1A] block">2. 매사에 완벽을 추구해 나를 갉아먹는 고집</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  적당히 넘어가도 될 일에 완벽을 들이대 스스로의 피로를 폭증시키고 주변 사람들마저 질식하게 하는 약점을 주의해야 합니다.
                </p>
              </div>
              <div className="border-l-2 border-red-500 pl-3">
                <strong className="text-[#1A1A1A] block">3. 오해를 가슴에 묵혀 속병을 만드는 기질</strong>
                <p className="text-[#5F5F5F] font-light mt-0.5">
                  싫은 소리를 제때 세련되게 풀지 못하고 가슴 한구석에 원망으로 쌓아 두어 돌발적으로 인연을 끊는 냉정함을 극복해야 평화롭습니다.
                </p>
              </div>
            </div>
          </div>
          <div className="border border-red-200/80 rounded-lg p-4 bg-red-50/20 text-xs space-y-2 text-[#5F5F5F]">
            <h4 className="font-bold text-red-700">💡 약점을 다스리는 일상 리스크 통제 수칙</h4>
            <p className={`font-light leading-relaxed ${blurClass}`}>
              기분 나쁜 메일을 받거나 의견 충돌이 있을 때는 <strong>'답장 전 3시간 대기 법칙'</strong>을 필히 실천하여 즉흥적 자존심 대응을 통제하십시오. 또한, 전체 프로젝트 중 단 70% 수준의 완성도에서 1차 피드백을 수용하는 훈련을 반복하고, 마음을 불편하게 하는 상대와는 감정을 묵히지 말고 '공적인 룰'에 기반하여 팩트 위주로만 심플하게 서류 소통하는 태도가 평생의 구설 살을 예방합니다.
            </p>
          </div>
        </div>
      );

    case "worry_solution":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            💌 의뢰인 개별 고민 정밀 조율 솔루션
          </h3>
          <div className="bg-white border-2 border-[#A3845B]/40 rounded-lg p-6 space-y-4 shadow-md">
            <div className="bg-[#F9F8F6] border-l-4 border-[#A3845B] p-4 rounded text-xs">
              <span className="font-bold text-[#1A1A1A] block mb-1">작성하신 고민 안건:</span>
              <p className="text-[#5F5F5F] italic">"{worryText ? decodeURIComponent(worryText) : "인생 전반의 총체적 갈등 해소 및 개운"}"</p>
            </div>
            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div>
                <span className="font-bold text-[#A3845B] block mb-1">📍 고민 안건의 명리학적 해석</span>
                <p className={`font-light ${blurClass}`}>{personalizedText.analysis}</p>
              </div>
              <div>
                <span className="font-bold text-[#A3845B] block mb-1">⏰ 하늘이 돕는 개운 타이밍</span>
                <p className={`font-light ${blurClass}`}>{personalizedText.timing}</p>
              </div>
              <div>
                <span className="font-bold text-[#A3845B] block mb-1">🔑 혜안당 정밀 개운 비책</span>
                <div className={`bg-[#F6F3EC] p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-xs font-light ${blurClass}`} dangerouslySetInnerHTML={{ __html: personalizedText.actionPlan }} />
              </div>
            </div>
          </div>
        </div>
      );

    case "sipsin_1":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              ☯️ 사주 원국의 십신(十神) 분석 — 비견·겁재
            </h3>

            {/* 십신 분석 전체 안내 (19페이지에만 표시) */}
            <div className="bg-gradient-to-br from-[#1C1613] to-[#2C2420] border border-[#A3845B]/50 rounded-xl p-5 mb-5 text-[#FAF7F0]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">☯️</span>
                <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">십신(十神) 분석이란 무엇인가?</h4>
              </div>
              <p className="text-[11px] leading-relaxed font-light mb-3 text-[#F0EAE0]">
                십신(十神)이란 나의 일간(日干, 태어난 날의 천간)을 기준으로, 사주 여덟 글자에 나타나는 다른 7개 글자들이 나와 어떤 관계를 맺는지를 분류한 10가지 운명 에너지입니다. 마치 내가 주인공이고 나머지 등장인물들이 나와 어떤 역할 관계에 있는지를 분석하는 것과 같습니다.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                <div className="bg-[#FAF7F0]/10 rounded-lg p-2.5">
                  <p className="font-bold text-[#A3845B] mb-1">📌 왜 십신 분석을 하는가?</p>
                  <p className="text-[#E8E0D0] font-light leading-relaxed">십신은 내 성격의 본질, 직업 적성, 재물 운, 인간관계 패턴, 건강의 위험 신호를 동시에 보여주는 사주 해석의 핵심 도구입니다. 단순한 성격 분석을 넘어, 언제 조심해야 하고 언제 적극적으로 나서야 하는지 구체적인 행동 지침을 제공합니다.</p>
                </div>
                <div className="bg-[#FAF7F0]/10 rounded-lg p-2.5">
                  <p className="font-bold text-[#A3845B] mb-1">🔍 무엇을 집중해서 봐야 하는가?</p>
                  <p className="text-[#E8E0D0] font-light leading-relaxed">각 십신의 ①강점(내 삶에 미치는 긍정 에너지) ②약점(잘못 발현될 때의 위험 신호) ③재물 시너지(어떤 방향으로 돈을 만드는가)를 중심으로 읽으시면 됩니다. 내 사주에 어떤 십신이 강하게 작용하는지 확인하십시오.</p>
                </div>
              </div>
              <div className="bg-[#8B221E]/20 border border-[#8B221E]/40 rounded-lg p-3 text-[10px]">
                <p className="font-bold text-[#F4A0A0] mb-1">⚠️ 이것만은 반드시 조심하십시오</p>
                <p className="text-[#F0EAE0] font-light leading-relaxed">각 십신이 '과잉' 상태이거나 '충극(衝剋)'을 받을 때 문제가 발생합니다. 예를 들어 겁재 과다 → 동업 사기 위험, 상관 과다 → 직장 상사 갈등, 편관 과다 → 건강 악화 등입니다. 아래 각 페이지의 <strong className="text-[#F4A0A0]">'주의해야 할 행동 강령'</strong>을 반드시 확인하고 실생활에 적용하십시오.</p>
              </div>
            </div>

            {/* 나의 주도 기운 분석 및 처방 */}
            <div className="bg-[#FAF8F5] border-2 border-[#A3845B] rounded-xl p-5 mb-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#E2DDD5] pb-2">
                <span className="text-xl">🌟</span>
                <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">
                  {name}님의 사주 주도 기운: <span className="text-[#A3845B]">{dominantGroup}</span>
                </h4>
              </div>
              <p className={`text-xs text-[#2C2C2C] leading-relaxed font-light ${blurClass}`} dangerouslySetInnerHTML={{ __html: dominantDesc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              <div className="bg-[#F3EFE6] rounded-lg p-3 text-[10px] text-[#5F5F5F]">
                <strong className="text-[#1A1A1A] block mb-1">📊 나의 5대 십신 에너지 분포:</strong>
                <div className="flex gap-4 flex-wrap mt-1">
                  <span>비겁 (비견·겁재): <strong className="text-[#A3845B]">{bigeobCount}개</strong></span>
                  <span>식상 (식신·상관): <strong className="text-[#A3845B]">{sibsangCount}개</strong></span>
                  <span>재성 (편재·정재): <strong className="text-[#A3845B]">{jaeseongCount}개</strong></span>
                  <span>관성 (편관·정관): <strong className="text-[#A3845B]">{gwanseongCount}개</strong></span>
                  <span>인성 (편인·정인): <strong className="text-[#A3845B]">{inseongCount}개</strong></span>
                </div>
              </div>
            </div>

            {/* 십신 10개 개요 미니맵 겸 보유 현황판 */}
            <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-xl p-4 mb-5">
              <p className="text-[10px] font-bold text-[#A3845B] mb-3 text-center tracking-wider">
                [ 혜안당 분석: {name}님의 사주 속 십신(十神) 보유 현황 ]
              </p>
              <div className="grid grid-cols-5 gap-1.5 text-[9px] text-center font-semibold">
                {[
                  { name: "비견", color: "bg-emerald-100 text-emerald-800", page: "19p", count: sipsinCounts["비견"] || 0 },
                  { name: "겁재", color: "bg-red-100 text-red-800", page: "19p", count: sipsinCounts["겁재"] || 0 },
                  { name: "식신", color: "bg-green-100 text-green-800", page: "20p", count: sipsinCounts["식신"] || 0 },
                  { name: "상관", color: "bg-amber-100 text-amber-800", page: "20p", count: sipsinCounts["상관"] || 0 },
                  { name: "편재", color: "bg-yellow-100 text-yellow-800", page: "21p", count: sipsinCounts["편재"] || 0 },
                  { name: "정재", color: "bg-teal-100 text-teal-800", page: "21p", count: sipsinCounts["정재"] || 0 },
                  { name: "편관", color: "bg-rose-100 text-rose-800", page: "22p", count: sipsinCounts["편관"] || 0 },
                  { name: "정관", color: "bg-blue-100 text-blue-800", page: "22p", count: sipsinCounts["정관"] || 0 },
                  { name: "편인", color: "bg-purple-100 text-purple-800", page: "23p", count: sipsinCounts["편인"] || 0 },
                  { name: "정인", color: "bg-orange-100 text-orange-800", page: "23p", count: sipsinCounts["정인"] || 0 },
                ].map((s, i) => (
                  <div key={i} className={`${s.color} rounded-lg py-1.5 px-1 relative ${s.count > 0 ? 'ring-2 ring-[#A3845B]/60 font-black scale-[1.03] transition-all' : 'opacity-40'}`}>
                    <p className="font-myeongjo">{s.name}</p>
                    <p className="text-[10px] text-[#1A1A1A] mt-0.5 font-bold">{s.count}개</p>
                    <p className="opacity-60 text-[8px] mt-0.5">{s.page}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 비견·겁재 본문 */}
            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-[#5F7A68] text-[13px] font-myeongjo">• 비견(比肩) — 내 안의 줏대와 독립적 주체성</strong>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">자아 독립</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["비견"] > 0 ? (
                    <span>
                      사주 원국에 <strong>비견이 {sipsinCounts["비견"]}개</strong> 존재합니다. 타인에게 의지하지 않고 본인만의 소신과 자립심으로 삶을 개척해 나가는 능력이 강하게 작용하고 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>비견이 없습니다.</strong> 남의 의견에 귀가 얇아지거나 주체적으로 소신을 밀어붙이는 힘이 다소 아쉬울 수 있으니 자립심을 의식적으로 기르는 것이 좋습니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  비견(比肩)은 나와 오행이 같고 음양이 같은 에너지로, 사주에서 '나의 분신'과 같은 역할을 합니다. 쉽게 말해 내 안의 단단한 줏대와 주체성을 의미합니다. 비견이 적당하게 있으면 남의 눈치에 흔들리지 않고 자기 소신대로 결단을 내리며, 자수성가와 독립 창업에서 빛을 발합니다. 그러나 비견이 과도하면 자존심과 고집이 지나쳐 협력 관계가 무너지거나 주변 사람들과의 충돌이 잦아집니다. 형제나 동생뻘의 경쟁자에게 재물이 분산될 위험도 있습니다.
                </p>
                <div className="bg-[#F0F7F2] border border-emerald-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-emerald-700">💪 강점 활용:</strong> 독자 브랜드 창업, 1인 기업, 독립 프리랜서 형태로 일할 때 비견의 에너지가 긍정적으로 폭발합니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 동업 계약과 지인 금전 거래는 원칙적으로 금지하십시오. 내 돈은 반드시 내 명의로만 관리해야 합니다.</p>
                  <p><strong className="text-emerald-700">💰 재물 시너지:</strong> 독립적인 능력으로 스스로 파이프라인을 구축하여 중간 수수료나 분배 없이 순수 본인만의 지분으로 자산을 형성할 때 시너지가 극대화됩니다.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-red-700 text-[13px] font-myeongjo">• 겁재(劫財) — 재물을 빼앗는 경쟁자이자 강력한 돌파력</strong>
                  <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">승부 본능</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["겁재"] > 0 ? (
                    <span>
                      사주 원국에 <strong>겁재가 {sipsinCounts["겁재"]}개</strong> 존재합니다. 경쟁 상황에서 지기 싫어하는 강인한 승부 본능과 남다른 기회 돌파력이 내재되어 있어 경쟁 사회에서 추진력을 발휘합니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>겁재가 없습니다.</strong> 불필요한 재물 쟁탈 리스크가 낮고 안정적인 환경을 선호하지만, 경쟁을 뚫고 지나가야 하는 난관에서 승부욕을 조금 더 발휘할 필요가 있습니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  겁재(劫財)는 나와 오행이 같지만 음양이 다른 에너지로, '재물을 겁탈한다'는 의미를 내포합니다. 경쟁과 도전에서 맹렬하게 이기려는 야망의 기운입니다. 이 에너지가 긍정적으로 발현되면 스포츠, 치열한 비즈니스 경쟁, 영업 전선에서 압도적인 돌파력을 발휘합니다. 그러나 겁재가 지나치게 강할 때는 가장 신뢰하는 가까운 지인이나 형제에게 금전 사기를 당하거나 동업에서 배신을 맞이하는 '겁재의 흉함'이 발동될 수 있습니다.
                </p>
                <div className="bg-[#FFF5F5] border border-red-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-red-700">💪 강점 활용:</strong> 경쟁이 치열한 영업, 스포츠 관련 직군, 입찰 경쟁에서 겁재의 승부 본능이 타인과의 차별적인 돌파구를 만들어냅니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 아는 사람과의 투자 합자, 금전 보증, 사업 동업은 절대적으로 금지합니다. 계약 자금은 반드시 본인 명의로만 독립 통제하십시오.</p>
                  <p><strong className="text-red-700">💰 재물 시너지:</strong> 치열한 입찰전이나 권리 분석 등 남들이 쉽게 진입하지 못하는 경쟁 시장에 베팅하여 단숨에 시장 지분과 고수익권을 탈환하는 투자 방식으로 자산을 증식합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "sipsin_2":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              ☯️ 사주 원국의 십신(十神) 분석 — 식신·상관
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]">
              📖 <strong>식신·상관</strong>은 내가 세상에 에너지를 내뿜는 방식입니다. 내 재능이 세상 밖으로 흘러 나가 어떻게 돈과 명예로 환원되는지를 보여주는 <strong>'나의 표현력과 생산성'</strong>의 십신입니다. 재물을 만들어내는 원천 에너지이므로, 이 두 기운을 어떻게 활용하느냐가 평생 수입의 질과 양을 결정합니다.
            </p>

            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-[#5F7A68] text-[13px] font-myeongjo">• 식신(食神) — 평생 따르는 의식주 복과 전문 장인 기질</strong>
                  <span className="text-[9px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">재능·복록</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["식신"] > 0 ? (
                    <span>
                      사주 원국에 <strong>식신이 {sipsinCounts["식신"]}개</strong> 존재합니다. 깊은 탐구정신과 한 분야에 전문성을 길러내는 장인 기질이 안정적으로 발현되어 묵묵히 본인의 복록을 쌓아갑니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>식신이 없습니다.</strong> 한 가지 분야에 오랜 끈기로 전문성을 키우거나 스스로의 루틴을 세우는 데 노력이 필요합니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  식신(食神)은 '먹을 복'이라 불릴 만큼 평생 의식주가 풍족하게 따르는 복덩이 기운입니다. 한 분야를 깊게 파고드는 장인 기질이 탁월하며, 자신이 좋아하는 것을 꾸준히 갈고닦아 전문가가 되는 길에서 가장 큰 재물 복이 발동합니다. 식신이 강한 사람은 재치 있는 유머 감각과 넉넉한 여유가 있어 주변 사람들에게 편안함을 주며, 음식·요리·예술·연구·교육 분야에서 두각을 나타냅니다. 다만 지나치게 느긋해 추진력이 부족해질 수 있으니 자기 페이스를 지키되 마감 의식을 키우십시오.
                </p>
                <div className="bg-[#F0F7F2] border border-green-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-green-700">💪 강점 활용:</strong> 특수 자격증, 전문 기술 라이선스, 독창적 콘텐츠 창작 등 '시간이 갈수록 숙련되는 전문성'이 평생 마르지 않는 연금형 수입을 만들어냅니다.</p>
                  <p><strong className="text-amber-700">⚠️ 조심할 행동:</strong> 게으름과 안일함에 빠지지 않도록 구체적인 목표 일정을 세우고, 과식·비만으로 인한 건강 악화를 주의하십시오.</p>
                  <p><strong className="text-green-700">💰 재물 시너지:</strong> 자신의 고유한 기술이나 지적 재산을 활용하여 장기적인 특허, 상표권, 저작권료 등 안정적인 무형 자산 파이프라인을 설계하면 큰 재물적 시너지를 발휘합니다.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-amber-700 text-[13px] font-myeongjo">• 상관(傷官) — 권위를 뒤집는 창의적 표현력과 날카로운 언변</strong>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">혁신·언변</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["상관"] > 0 ? (
                    <span>
                      사주 원국에 <strong>상관이 {sipsinCounts["상관"]}개</strong> 존재합니다. 임기응변과 언변이 수려하며, 타인과 구별되는 독창적인 아이디어와 개성으로 대중의 시선을 사로잡는 에너지가 돋보입니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>상관이 없습니다.</strong> 톡톡 튀는 변칙적 아이디어 표출이나 임기응변, 타인 앞에서의 적극적인 매력 발산보다는 얌전하고 규범적인 소통을 주로 사용하는 성향입니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  상관(傷官)은 '관(官, 권위와 직위)'을 상하게 한다는 뜻으로, 기존의 규범과 권위에 의문을 제기하며 새로운 패러다임을 제시하는 혁신적 에너지입니다. 이 기운이 강하면 탁월한 언변과 비판적 사고력으로 남들이 보지 못하는 창의적 아이디어를 쏟아냅니다. 그러나 조직 내에서 상사나 윗사람과의 충돌을 자주 일으켜 직장 생활에 어려움을 겪을 수 있으며, 특히 남성의 경우 관운(직장운)을 해치고, 여성의 경우 배우자 운과 마찰이 생길 수 있으니 각별한 주의가 필요합니다.
                </p>
                <div className="bg-[#FFFBF0] border border-amber-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-amber-700">💪 강점 활용:</strong> 마케팅·홍보·스피치·언론·IT혁신·예술·강연 등 나의 '말과 혁신 기획력'을 무기로 하는 분야에서 압도적인 단기 고수익을 창출합니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 직장에서 상사에 대한 직접적인 비판과 반박을 자제하고, 중요한 자리에서의 감정적 언행을 조율하십시오. 말 한마디가 운명을 바꿉니다.</p>
                  <p><strong className="text-amber-700">💰 재물 시너지:</strong> 트렌디한 시장 변화에 가장 먼저 편승하여 단기 프로젝트나 아이디어 기획, 마케팅 수수료, 트래픽 유입 기반 비즈니스를 통해 폭발적인 자산 레버리지를 누릴 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "sipsin_3":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              ☯️ 사주 원국의 십신(十神) 분석 — 편재·정재
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]">
              📖 <strong>편재·정재</strong>는 사주에서 가장 직접적인 <strong>'돈과의 관계'</strong>를 보여주는 십신입니다. 어떤 방식으로 재물을 모으고 굴리는지, 재물로 인해 어떤 위험을 맞이하는지를 구체적으로 알려줍니다. 내 사주에 편재와 정재 중 무엇이 강한지를 확인하여 나만의 최적 재물 전략을 수립하십시오.
            </p>

            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-[#A3845B] text-[13px] font-myeongjo">• 편재(偏財) — 판을 키우는 대담한 모험적 재물 기운</strong>
                  <span className="text-[9px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">사업·투자</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["편재"] > 0 ? (
                    <span>
                      사주 원국에 <strong>편재가 {sipsinCounts["편재"]}개</strong> 존재합니다. 시장 판세를 읽는 투자 직관이 뛰어나며 일확천금이나 큰 단위의 현금 흐름을 다루는 사업가적 기질이 내재되어 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>편재가 없습니다.</strong> 투기성 투자나 공격적인 사업 확장보다는 리스크가 적고 안정적인 고정 수익을 관리하는 데 집중하는 명조입니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  편재(偏財)는 정해진 틀 밖에서 크게 돈을 굴리려는 모험심 넘치는 재물 에너지입니다. 무역, 사업 확장, 주식, 부동산 투자 등 유동성이 강한 큰 단위의 현금 흐름을 다루는 능력이 뛰어나 대업을 이룰 수 있습니다. 편재가 강한 사람은 사교성이 풍부하고 스케일이 크며, 아버지와의 인연이 깊은 편입니다. 그러나 편재 과다 또는 충극 시에는 무리한 투기로 일시에 재산을 탕진하거나, 이성 관계로 인한 재물 손실이 발생하니 각별한 조심이 필요합니다.
                </p>
                <div className="bg-[#FFFDF0] border border-yellow-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-yellow-700">💪 강점 활용:</strong> 중간 유통·사업 권리 계약·대형 프로젝트 입찰 등 '스케일이 큰 현금 흐름'을 설계하는 전략에서 대운의 흐름과 맞물려 거대한 자산을 형성합니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 레버리지 투기, 근거 없는 고수익 투자 광고, 이성 관계로 인한 금전 지출에 극도로 주의하십시오. 손절 라인을 반드시 사전에 설정하십시오.</p>
                  <p><strong className="text-yellow-700">💰 재물 시너지:</strong> 부동산 갭투자, 지분 투자, 인수합병(M&A) 등 큰 자본의 순환 구조를 활용하거나 시장의 저평가된 틈새 자산을 찾아 재판매(시세차익)하는 방식으로 극적인 재물 성장 이룹니다.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-[#5F7A68] text-[13px] font-myeongjo">• 정재(正財) — 꼬박꼬박 쌓이는 안정적이고 성실한 수입</strong>
                  <span className="text-[9px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">안정·저축</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["정재"] > 0 ? (
                    <span>
                      사주 원국에 <strong>정재가 {sipsinCounts["정재"]}개</strong> 존재합니다. 수입과 지출의 균형을 치밀하게 조율하는 자산 관리 능력이 돋보이며 성실하게 종잣돈을 불려나가는 안정형 재물 기운이 내재되어 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>정재가 없습니다.</strong> 꼼꼼한 저축이나 정기적이고 일정한 흐름의 자산 통제보다는 다소 즉흥적인 지출이나 스케일이 큰 거래에 이끌리기 쉬우니 주의해야 합니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  정재(正財)는 매월 안정적으로 입금되는 급여 형태의 수입이자 정밀한 자산 관리력을 의미합니다. 꼼꼼하게 장부를 기록하고 종잣돈을 모으는 안전지향형 재물 기운으로, 배우자와의 금전적 안정을 중시하며 착실하게 자산을 불려나갑니다. 부동산 청약, 적금, 연금 등 예측 가능한 안전 자산에 가치를 두며, 무리한 투기를 거부하는 성향이 강합니다. 다만 지나치게 보수적이면 성장 기회를 놓칠 수 있으니 작은 범위에서 투자 경험을 축적해 나가는 것이 좋습니다.
                </p>
                <div className="bg-[#F0FBF9] border border-teal-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-teal-700">💪 강점 활용:</strong> 급여의 50% 이상을 부동산 청약·연금·우량 채권 등 '환금성이 느린 안전 자산'에 꾸준히 투입할 때 평생의 재정 기반이 흔들리지 않습니다.</p>
                  <p><strong className="text-amber-700">⚠️ 조심할 행동:</strong> 지나친 절약과 인색함으로 주변 관계가 나빠지지 않도록 주의하십시오. 적정 수준의 사교 투자는 더 큰 재물을 부르는 씨앗입니다.</p>
                  <p><strong className="text-teal-700">💰 재물 시너지:</strong> 근면하게 모은 시드머니를 공복 없이 월세가 들어오는 우량 상가나 채권 배당 등 다달이 확정적인 현금흐름이 나오는 시스템에 락업(Lock-up)할 때 최고의 자산 시너지를 냅니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "sipsin_4":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              ☯️ 사주 원국의 십신(十神) 분석 — 편관·정관
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]">
              📖 <strong>편관·정관</strong>은 사주에서 <strong>'명예·권위·직업 운'</strong>을 관장하는 십신입니다. 어떤 방식으로 사회적 지위를 얻고, 어떤 조직에서 두각을 나타내며, 어떤 명예 위기를 조심해야 하는지를 명확하게 보여줍니다. 직장·사업·대인관계에서 나의 권위가 어떻게 발현되는지를 확인하십시오.
            </p>

            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-red-700 text-[13px] font-myeongjo">• 편관(偏官) — 강박적 책임감이 만들어내는 카리스마와 명예</strong>
                  <span className="text-[9px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">권위·카리스마</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["편관"] > 0 ? (
                    <span>
                      사주 원국에 <strong>편관이 {sipsinCounts["편관"]}개</strong> 존재합니다. 극한의 극복 의지와 리더십이 뛰어나 어려운 환경에서 위기를 관리하는 카리스마 능력이 내재되어 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>편관이 없습니다.</strong> 무거운 압박감이나 강박적인 스트레스를 이고 살아가기보다는 비교적 규칙적이고 유연하며 스트레스가 적은 환경을 추구하는 사주입니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  편관(偏官)은 '칠살(七殺)'이라고도 불리며, 극단적인 책임감과 강인한 의지로 극한의 난관을 뚫고 일어서는 카리스마 에너지입니다. 군인·경찰·검사·소방관 등 특수 조직이나 혹독한 경쟁 환경에서 탁월한 성과를 발휘합니다. 남성의 경우 자녀와의 인연이 깊고, 여성의 경우 배우자 또는 남자 친구의 영향력을 강하게 받습니다. 편관이 과하면 과로와 스트레스로 인한 건강 문제, 구설과 관재(官災)를 조심해야 합니다.
                </p>
                <div className="bg-[#FFF5F5] border border-rose-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-rose-700">💪 강점 활용:</strong> 특임 부서 팀장, 위기 관리 책임자, 특수 라이선스 사업자 등 '리더십과 강한 신뢰'를 담보로 하는 포지션에서 최고의 성과를 냅니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 지나친 과로와 야근을 줄이고, 구설과 법적 분쟁의 소지를 원천 차단하십시오. 강경한 태도보다는 유연한 협력을 의식적으로 연습하십시오.</p>
                  <p><strong className="text-rose-700">💰 재물 시너지:</strong> 정부 주도 사업 참여나 대기업 1차 협력업체 등록 등 높은 진입장벽을 가진 특권 라이선스나 공신력 있는 기관의 보장을 통해 리스크 없이 큰 자산권을 유지하는 형태로 재물을 불립니다.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-blue-700 text-[13px] font-myeongjo">• 정관(正官) — 공익적 신뢰와 안정적인 직위 권한</strong>
                  <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">명예·승진</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["정관"] > 0 ? (
                    <span>
                      사주 원국에 <strong>정관이 {sipsinCounts["정관"]}개</strong> 존재합니다. 조직 내에서 모범적이고 합리적인 규칙을 잘 준수하여 주변인들의 두터운 신용과 명예를 얻는 기운이 활발히 작동하고 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>정관이 없습니다.</strong> 정해진 조직의 획일적인 틀에 구애받기보다 자유롭고 창의적인 주체성을 가진 행동을 더욱 선호하는 경향이 있습니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  정관(正官)은 공무원·대기업·공공기관 등에서 가장 안전하고 예측 가능한 승진 운과 질서 순응 본능을 나타내는 정정당당한 명예 에너지입니다. 주위에서 "저 사람은 믿을 수 있다"는 신뢰와 인정을 받으며 자연스럽게 지위가 올라갑니다. 여성의 경우 정관이 배우자의 자리를 뜻하며, 온화하고 사회적으로 안정적인 파트너를 만날 인연이 있습니다. 다만 너무 원칙만을 고집하면 변화에 적응하지 못하고 뒤처지는 위험이 있으니 시대 변화에 맞는 유연성도 함께 갖추십시오.
                </p>
                <div className="bg-[#F0F5FF] border border-blue-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-blue-700">💪 강점 활용:</strong> 국가 조달 계약, 공인 면허 취득, 규범적 성실도 평가를 통한 급여 상승 등 '신용 중심 합법 거래'를 적극 결합할 때 자산 안정성이 극대화됩니다.</p>
                  <p><strong className="text-amber-700">⚠️ 조심할 행동:</strong> 원칙과 규율에 지나치게 얽매여 창의적 기회를 놓치지 않도록 하십시오. 변화하는 환경에 유연하게 적응하는 연습이 필요합니다.</p>
                  <p><strong className="text-blue-700">💰 재물 시너지:</strong> 대기업 사내 연봉 극대화, 정기적 이자 및 배당 소득, 혹은 공공기관 연계 프로젝트 등 법적 보호와 시스템 안전성이 100% 확보된 루트를 통해서만 자산을 관리할 때 손실 없이 복리로 우상향합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "sipsin_5":
      return (
        <div className="space-y-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              ☯️ 사주 원국의 십신(十神) 분석 — 편인·정인
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-5 font-light bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]">
              📖 <strong>편인·정인</strong>은 사주에서 <strong>'나를 키워주는 힘'</strong>을 나타내는 십신입니다. 학문적 역량, 부모·멘토·후원자의 도움, 문서 계약의 길흉을 관장합니다. 내가 어떤 방식으로 지식과 지혜를 습득하며, 어떤 후원을 받아 성장하고, 문서와 계약에서 어떤 행운 또는 위험이 따르는지를 알 수 있습니다.
            </p>

            <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-purple-700 text-[13px] font-myeongjo">• 편인(偏印) — 독창적인 예술 직관과 남다른 전문 기획력</strong>
                  <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-bold">독창·영감</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["편인"] > 0 ? (
                    <span>
                      사주 원국에 <strong>편인이 {sipsinCounts["편인"]}개</strong> 존재합니다. 정형화되지 않은 독창적인 영감과 비주류 전문성에 재능이 있어 뛰어난 기획과 설계를 보입니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>편인이 없습니다.</strong> 매니아적이거나 파격적인 예술적 영감 추구보다는 상식적이고 예측 가능하며 정통 학문적 접근에 더 익숙한 편입니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  편인(偏印)은 정통 학문보다는 특수 기술·비주류 학문·예술·철학·종교·심리학 등 독자적인 분야에서 깊은 통찰을 발휘하는 에너지입니다. 타의 추종을 불허하는 독창적인 아이디어와 예술적 감수성이 있으며, 호기심과 탐구 정신이 남다릅니다. 그러나 변덕스럽고 집중력이 쉽게 분산되는 단점이 있으며, 식신의 에너지를 억제하는 특성상 '밥을 빼앗긴다'는 상징처럼 수입의 단절이나 직업 변동이 잦을 수 있습니다. 특히 의식주를 생산하는 음식·요식업을 피하는 것이 좋습니다.
                </p>
                <div className="bg-[#F9F5FF] border border-purple-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-purple-700">💪 강점 활용:</strong> 특허 기술 등록, 심리·철학 상담, 마이너 감성 예술 기획 등 '독창적인 무형 지식 재산권'을 다각도로 유통할 때 시스템 수동 소득이 창출됩니다.</p>
                  <p><strong className="text-red-700">⚠️ 조심할 행동:</strong> 한 가지 일을 끝까지 완결짓지 않고 중간에 포기하는 습관을 반드시 고치십시오. 음식업·요식업 창업은 특히 주의하십시오.</p>
                  <p><strong className="text-purple-700">💰 재물 시너지:</strong> 대중적이지 않지만 매니아층이 견고한 틈새 시장의 정보 독점, 무형 자산의 판권(라이선스) 계약, 종교·학술적 특허 등 고유 정보 가치를 판매하여 희소성 높은 재물을 벌어들입니다.</p>
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <strong className="text-[#A3845B] text-[13px] font-myeongjo">• 정인(正印) — 후원자의 조력과 문서·계약에서의 길함</strong>
                  <span className="text-[9px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">후원·문서</span>
                </div>
                {/* 내 사주에서의 작용 현황 */}
                <div className="bg-[#F6F5F2] rounded-lg p-2.5 text-[10px] text-[#5F5F5F]">
                  🎯 <strong>내 사주 작용 현황:</strong>{" "}
                  {sipsinCounts["정인"] > 0 ? (
                    <span>
                      사주 원국에 <strong>정인이 {sipsinCounts["정인"]}개</strong> 존재합니다. 부모의 따뜻한 조력이나 문서 및 계약상의 길함이 따르며, 착실하게 배우고 지혜를 확장해 나가는 성품이 내재되어 있습니다.
                    </span>
                  ) : (
                    <span>
                      사주 원국에 <strong>정인이 없습니다.</strong> 타인의 지극히 자상한 후원이나 유산 등의 조건 없는 조력을 기대하기보다, 순수하게 본인의 피땀 어린 노력과 능력으로 일어설 필요가 있습니다.
                    </span>
                  )}
                </div>
                <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                  정인(正印)은 부모님의 따뜻한 후원, 스승과 멘토의 가르침, 문서 계약의 길함을 상징합니다. 이 기운이 강한 사람은 학문적 재능이 뛰어나고 꾸준한 자기 계발로 전문성을 쌓으며, 계약서와 문서에서 항상 유리한 결과를 얻는 행운이 따릅니다. 인성(人性)이 착하고 배려가 넘쳐 주변의 도움을 자연스럽게 받습니다. 그러나 과도한 정인은 지나치게 의존적이거나 게으름을 초래할 수 있으니, 스스로 주도적으로 움직이는 습관이 필요합니다. 여성의 경우 자녀 출산 후 일시적인 직업 공백이 생길 수 있습니다.
                </p>
                <div className="bg-[#FFF8F0] border border-orange-200/60 rounded-lg p-3 text-[11px] space-y-1">
                  <p><strong className="text-orange-700">💪 강점 활용:</strong> 정부 지원금·보조금 신청, 유산 상속 계약, 부동산 분양 계약 등 '합법적이고 정당한 권리 계약'을 적극적으로 활용하면 자산이 탄탄하게 문서화됩니다.</p>
                  <p><strong className="text-amber-700">⚠️ 조심할 행동:</strong> 의존성에서 벗어나 스스로 결정하고 실행하는 능동적 습관을 기르십시오. 과도한 공부에만 집착하고 실행을 미루는 함정을 피하십시오.</p>
                  <p><strong className="text-orange-700">💰 재물 시너지:</strong> 멘토나 부모의 상속 재원, 공신력 있는 문서화된 권리(부동산 등기, 건물 계약, 학위 기반 라이선스)를 통해 내 손실 리스크가 없는 우량 자산을 영구 등재하여 지키고 불립니다.</p>
                </div>
              </div>

              {/* 십신 분석 마무리 메시지 */}
              <div className="bg-gradient-to-r from-[#F6F3EC] to-[#EDE8DE] border border-[#A3845B]/30 rounded-xl p-4 text-center">
                <p className="font-myeongjo text-xs font-bold text-[#A3845B] mb-1">🌟 십신 분석 종합 활용법</p>
                <p className="text-[11px] text-[#5F5F5F] font-light leading-relaxed">
                  위 10가지 십신은 고정된 운명이 아닙니다. <strong>각 기운의 강점을 극대화하고 약점을 의식적으로 보완하는 사람</strong>이 결국 운명의 주인이 됩니다. 19~23페이지의 분석을 통해 내 사주의 에너지 지도를 완성하고, 실생활에서 주의해야 할 행동 하나씩을 오늘부터 바꿔나가십시오.
                </p>
              </div>
            </div>
          </div>
        </div>
      );

    case "sinsal":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            💀 사주 속 길흉 신살(神殺) 분석
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            신살(神殺)이란 사주 여덟 글자의 지지(땅의 기운) 조합에 따라 내 삶에 강력하게 발동하는 특별한 재능이자 운명적 기류입니다. 긍정적인 쓰임새를 뜻하는 '신(神)'과 살아가며 주의해야 할 흉한 기운인 '살(殺)'이 동시에 내재되어 있어, 나의 분포와 대처 요령을 정확하게 아는 것이 개운의 핵심입니다.
          </p>

          <div className="space-y-5 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
            {/* 도화살 카드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                <strong className="text-red-700 text-[13px] font-myeongjo">🌸 도화살 (桃花煞) — 대중을 사로잡는 강력한 매력</strong>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${dowhaCount > 0 ? 'bg-red-100 text-red-800 ring-1 ring-red-200' : 'bg-gray-100 text-gray-400'}`}>
                  보유 {dowhaCount}개
                </span>
              </div>
              <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                도화살(桃花煞)은 복숭아꽃 향기에 이끌리듯 사람들을 내 주변으로 끌어당기는 치명적 매력의 에너지입니다. 이 살이 긍정적으로 작용하면 남다른 스타성과 탁월한 미적 감각으로 엔터테인먼트, 브랜딩, 영업, 마케팅, 정치 등 타인의 주목을 받아야 하는 모든 비즈니스에서 독보적인 무기가 됩니다. 다만, 음주나 이성 관계에서의 구설수를 부를 수 있어 공사 구분을 철저히 지키는 자제력이 요구됩니다.
              </p>
              
              {/* 내 사주에서의 작용 현황 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-3 space-y-2">
                <div>
                  <span className="font-bold text-[#A3845B] block mb-1">🎯 내 사주 작용 현황:</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {dowhaCount > 0 ? (
                      `의뢰인님의 사주 지지에는 도화살에 해당하는 글자(자/오/묘/유)가 ${dowhaCount}개 존재합니다. 남들의 시선을 자연스럽게 이끄는 훌륭한 매력과 대중 친화적인 기운이 강력하게 작동하고 있으므로 남들 앞에 자신을 드러낼 때 귀인의 도움을 얻거나 재물 기회를 포착하는 속도가 매우 빠릅니다.`
                    ) : (
                      "의뢰인님의 사주 지지에는 도화살에 해당하는 글자(자/오/묘/유)가 없습니다. 억지로 대중 앞에 나서 튀려고 하기보다, 탄탄한 전문성이나 정직함 및 진정성을 먼저 구축하여 사람들의 신뢰를 얻어가는 것이 훨씬 유리합니다."
                    )}
                  </p>
                </div>
                <div className="border-t border-[#E2DDD5]/70 pt-1.5">
                  <span className="font-bold text-[#A3845B] block mb-1">🔑 무엇을 해야 하는가? (행동 처방):</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {dowhaCount > 0 ? (
                      "개인 SNS나 블로그 등 본인만의 개성 넘치는 브랜딩 채널을 하나 이상 개설하여 포트폴리오와 가치를 적극 공유하십시오. 또한 면접이나 미팅 등 중요한 비즈니스 계약 자리에서는 무채색보다는 나를 돋보이게 하는 포인트 있는 복장이나 연출로 첫인상 시선을 완전히 장악하는 전략이 유용합니다."
                    ) : (
                      "겉포장이나 일시적인 이미지 메이킹에 힘쓰기보다, 객관적으로 증명할 수 있는 전문 자격이나 실적 포트폴리오를 서류화하여 명확히 제시하십시오. 대신, 대외적 커뮤니케이션을 보완하기 위해 항상 밝은 얼굴빛과 깔끔하고 호감도 높은 단정한 비즈니스 웨어 스타일링을 신경 쓰셔야 합니다."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 역마살 카드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                <strong className="text-amber-700 text-[13px] font-myeongjo">🐎 역마살 (驛馬煞) — 활동 반경을 넓히는 에너지</strong>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${yeokmaCount > 0 ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200' : 'bg-gray-100 text-gray-400'}`}>
                  보유 {yeokmaCount}개
                </span>
              </div>
              <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                역마살(驛馬煞)은 한곳에 머무르지 않고 부지런히 움직이며 새로운 지평을 개척해 나가는 역동적인 기운입니다. 해외 유학, 글로벌 무역, 출장이 잦은 전문 직종, 혹은 이사나 부서 이동을 자극하는 변동의 기틀이 됩니다. 정체되어 있거나 한자리에 고여 있으면 재물과 정신이 동시에 답답해지며, 밖으로 나가 활발히 세상을 돌아다니고 다양한 인프라를 만날 때 막혔던 대운이 시원하게 순환합니다.
              </p>
              
              {/* 내 사주에서의 작용 현황 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-3 space-y-2">
                <div>
                  <span className="font-bold text-[#A3845B] block mb-1">🎯 내 사주 작용 현황:</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {yeokmaCount > 0 ? (
                      `의뢰인님의 사주 지지에는 역마살에 해당하는 글자(인/신/사/해)가 ${yeokmaCount}개 존재합니다. 활동 반경이 국내외로 매우 넓고, 스스로 개척하여 판도를 바꾸는 강력한 실행력과 임기응변 능력을 갖추고 있어 정적인 일보다는 끊임없이 환경에 변화를 주는 구조에서 운이 가장 발복합니다.`
                    ) : (
                      "의뢰인님의 사주 지지에는 역마살에 해당하는 글자(인/신/사/해)가 없습니다. 잦은 이동이나 급격한 거주/직무 변화는 오히려 심신을 피로하게 하므로, 한 지역이나 안정된 고정 근무지에서 오랜 기간 뿌리를 내리고 숙련도를 키워가는 것이 재정 안정에 훨씬 적합합니다."
                    )}
                  </p>
                </div>
                <div className="border-t border-[#E2DDD5]/70 pt-1.5">
                  <span className="font-bold text-[#A3845B] block mb-1">🔑 무엇을 해야 하는가? (행동 처방):</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {yeokmaCount > 0 ? (
                      "업무나 사업을 구상할 때 재택이나 고정 내근보다는 외부 파트너 미팅, 지역 출장, 해외 세미나 참석 등 내가 능동적으로 이동할 수 있는 환경을 설계하십시오. 재정이나 사업 흐름이 정체되었을 때는 사무실 책상 구조를 전면 재배치하거나 주거 공간 인테리어를 과감히 바꿔 에너지를 이동시켜 개운해야 합니다."
                    ) : (
                      "안정적인 일과 루틴을 보장해주는 확실한 주거 및 작업실 공간을 평화롭게 세팅하십시오. 무리하게 타지로 이동하여 기회를 엿보기보다는, 온라인망을 통한 비대면 네트워킹을 활용하고 내 거점을 중심으로 자산을 수성하는 전략이 리스크를 피하는 지름길입니다."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 화개살 카드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                <strong className="text-purple-700 text-[13px] font-myeongjo">📿 화개살 (華蓋煞) — 사색과 학예의 예술 기운</strong>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold ${hwagaeCount > 0 ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-200' : 'bg-gray-100 text-gray-400'}`}>
                  보유 {hwagaeCount}개
                </span>
              </div>
              <p className={`font-light text-justify leading-relaxed ${blurClass}`}>
                화개살(華蓋煞)은 '빛나는 지혜와 학예를 덮어 보관한다'는 뜻으로 종교, 철학, 심리학, 그리고 깊은 내면의 사색과 예술 분야에 압도적인 정신적 천재성을 불어넣는 격조 높은 기운입니다. 고요히 침잠하며 홀로 생각에 몰두할 때 세상의 이치와 지혜를 관통해 내며, 타인의 마음에 깊이 공감하는 정신적 멘토나 상담가 자질을 부여합니다. 다만 고독감이 짙어져 방 안에 갇히는 침체기를 경계해야 합니다.
              </p>
              
              {/* 내 사주에서의 작용 현황 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-3 space-y-2">
                <div>
                  <span className="font-bold text-[#A3845B] block mb-1">🎯 내 사주 작용 현황:</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {hwagaeCount > 0 ? (
                      `의뢰인님의 사주 지지에는 화개살에 해당하는 글자(진/술/축/미)가 ${hwagaeCount}개 존재합니다. 복잡하고 눈에 보이는 현실 너머의 본질을 꿰뚫는 사색적 능력과 창작·문화예술에 깊은 안목이 있습니다. 타인의 지식이나 노하우를 그대로 답습하기보다 스스로 연구하여 독자적인 통찰을 끌어낼 때 재물이 화개 창고에 쌓이게 됩니다.`
                    ) : (
                      "의뢰인님의 사주 지지에는 화개살에 해당하는 글자(진/술/축/미)가 없습니다. 생각에만 갇혀 우울감이나 고독에 허우적대는 일이 거의 없고, 현실적이며 행동주의적 사고를 좋아하지만 고유한 정신적 깊이나 영감을 얻는 인문학 독서 등에는 의식적인 할애가 보완되어야 합니다."
                    )}
                  </p>
                </div>
                <div className="border-t border-[#E2DDD5]/70 pt-1.5">
                  <span className="font-bold text-[#A3845B] block mb-1">🔑 무엇을 해야 하는가? (행동 처방):</span>
                  <p className={`text-[11px] text-[#5F5F5F] font-light ${blurClass}`}>
                    {hwagaeCount > 0 ? (
                      "소란스럽고 바쁜 일과 중에도 매일 최소 30분은 온전히 혼자 서재나 조용한 공간에서 독서, 글쓰기, 명상을 하는 '고독 리추얼'을 구축하십시오. 그리고 머릿속에 떠오른 복잡한 통찰과 영감을 그냥 휘발시키지 말고 반드시 에세이, 책, 예술적 콘텐츠, 지적 기획서 등 무형의 문서 자산으로 승화시켜 남겨두는 훈련이 필수적입니다."
                    ) : (
                      "생각의 지평을 넓히고 리스크를 사전에 예견하기 위해 동양 철학, 심리학, 역사와 같은 인문 교양 서적을 한 달에 한 권 이상 읽는 습관을 들이십시오. 또한 스스로 방안에 앉아 생각만 깊이 하기보다, 실제 미술 전시회, 음악회, 철학 강연 등에 수시로 참여해 풍부한 예술 영감을 외부로부터 의식적으로 수혈하는 것이 성공을 앞당깁니다."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "gwiin": {
      const gwiinMap = {
        "甲": {
          animals: ["소띠(丑)", "양띠(未)"],
          directions: ["중앙·남서쪽", "중앙·북동쪽"],
          places: ["부동산, 금융 분야, 안정적인 비즈니스 협상 테이블, 세미나장"],
          years: ["2027(정미)", "2033(계축)"],
          months: ["양력 1월(소의 달)", "양력 7월(양의 달)"],
          description: "당신의 생각을 현실로 구현해주고 든든한 토대를 만들어 줄 묵직한 조력자입니다."
        },
        "戊": {
          animals: ["소띠(丑)", "양띠(未)"],
          directions: ["중앙·남서쪽", "중앙·북동쪽"],
          places: ["부동산, 공공기관, 대형 학술 세미나, 중개 비즈니스 현장"],
          years: ["2027(정미)", "2033(계축)"],
          months: ["양력 1월(소의 달)", "양력 7월(양의 달)"],
          description: "당신의 폭넓은 아이디어를 다듬어 가시적인 성과와 문서 자산으로 안착시켜줄 실무자형 조력자입니다."
        },
        "庚": {
          animals: ["소띠(丑)", "양띠(未)"],
          directions: ["중앙·남서쪽", "중앙·북동쪽"],
          places: ["금융 설계 세션, 공공 인프라 사업, 오래된 단골 거래처, 학계 전문가 모임"],
          years: ["2027(정미)", "2033(계축)"],
          months: ["양력 1월(소의 달)", "양력 7월(양의 달)"],
          description: "당신의 날카로운 추진력을 너그럽게 품어주고, 불필요한 마찰을 줄여줄 멘토형 조력자입니다."
        },
        "乙": {
          animals: ["쥐띠(子)", "원숭이띠(申)"],
          directions: ["북쪽", "서쪽·북서쪽"],
          places: ["학문 연구실, 도서관, IT 및 기술 개발 세미나, 단호한 의사결정이 이루어지는 비즈니스 현장"],
          years: ["2028(무신)", "2032(임자)"],
          months: ["양력 8월(원숭이의 달)", "양력 12월(쥐의 달)"],
          description: "당신의 부드러운 상상력과 유연함에 명확한 뼈대와 실리적인 지식을 더해 줄 스마트한 파트너입니다."
        },
        "己": {
          animals: ["쥐띠(子)", "원숭이띠(申)"],
          directions: ["북쪽", "서쪽·북서쪽"],
          places: ["지식 콘텐츠 창작 공간, 밤 시간대의 네트워킹 모임, 전문 자격증 취득 교육 기관, 법률/세무 상담소"],
          years: ["2028(무신)", "2032(임자)"],
          months: ["양력 8월(원숭이의 달)", "양력 12월(쥐의 달)"],
          description: "당신의 꼼꼼함과 신뢰를 자산화하도록 돕고, 큰 무대의 기회를 연계해 줄 지혜로운 조력자입니다."
        },
        "丙": {
          animals: ["돼지띠(亥)", "닭띠(酉)"],
          directions: ["북쪽", "서쪽"],
          places: ["공공 세미나, 해외 비즈니스 포럼, 물가나 항만 근처의 컨퍼런스, 정밀 분석 및 자산 유통 마켓"],
          years: ["2029(기유)", "2031(신해)"],
          months: ["양력 9월(닭의 달)", "양력 11월(돼지의 달)"],
          description: "당신의 뜨거운 열정과 비전이 흩어지지 않도록 냉철한 시스템과 정교한 분석을 제공해 줄 핵심 브레인입니다."
        },
        "丁": {
          animals: ["돼지띠(亥)", "닭띠(酉)"],
          directions: ["북쪽", "서쪽"],
          places: ["전문 지식 보관소, 야간 스터디 모임, 금융 자산 운용사, 해외 무역 및 유통 박람회"],
          years: ["2029(기유)", "2031(신해)"],
          months: ["양력 9월(닭의 달)", "양력 11월(돼지의 달)"],
          description: "당신의 섬세한 감수성과 아이디어가 재물이나 공적인 명예로 인정받도록 돕는 수호자형 조력자입니다."
        },
        "辛": {
          animals: ["호랑이띠(寅)", "말띠(午)"],
          directions: ["동쪽", "남쪽"],
          places: ["신규 프로젝트 기획 단상, 교육 기관, 스타트업 네트워킹, 미디어 및 디자인 쇼룸, 트렌디한 도심 카페"],
          years: ["2026(병오 - 올해!)", "2034(갑인)"],
          months: ["양력 2월(호랑이의 달)", "양력 6월(말의 달)"],
          description: "당신의 차갑고 정교한 능력을 널리 홍보하고 세상에 꺼내줄 열정적이고 에너제틱한 마케팅형 조력자입니다."
        },
        "壬": {
          animals: ["뱀띠(巳)", "토끼띠(卯)"],
          directions: ["남쪽", "동쪽"],
          places: ["IT/방송 미디어 스튜디오, 문화 예술 전시회, 기획 및 아이디어 브레인스토밍 룸, 디자인 교육 아카데미"],
          years: ["2035(을묘)", "2037(정사)"],
          months: ["양력 3월(토끼의 달)", "양력 5월(뱀의 달)"],
          description: "당신의 깊은 생각과 지혜가 실천적인 흐름과 돈이 되는 아이디어로 표현되도록 돕는 생동감 넘치는 파트너입니다."
        },
        "癸": {
          animals: ["뱀띠(巳)", "토끼띠(卯)"],
          directions: ["남쪽", "동쪽"],
          places: ["화려한 번화가의 컨퍼런스, 마케팅 협업 미팅, 스타트업 아이디어 발표회, 출판 및 교육 센터"],
          years: ["2035(을묘)", "2037(정사)"],
          months: ["양력 3월(토끼의 달)", "양력 5월(뱀의 달)"],
          description: "당신의 조용하고 예리한 영감을 대중에게 친근하게 전달하고, 넓은 시장을 연결해 줄 실천가형 파트너입니다."
        }
      };

      const ilgan = sajuInfo?.day?.stem || "甲";
      const gwiinInfo = gwiinMap[ilgan] || gwiinMap["甲"];

      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            👼 내 인생의 귀인(貴인) 분석
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            인생의 가장 위험한 순간에 뜻밖의 인맥이나 기적 같은 기회로 위기를 모면하게 돕는 귀한 신성의 축복입니다.
          </p>
          <div className="space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2">
              <strong className="text-[#A3845B] block">• 천을귀인 (天乙貴인) - 가장 존귀한 절대 수호자</strong>
              <p className={`font-light ${blurClass}`}>
                사고나 배신의 극단적 낭떠러지 앞에서도 귀신같이 손을 내밀어주는 인물이 나타나 삶을 구원합니다. 이 기운이 있으면 매사에 품격을 유지하게 되며, 타인에게 베푼 작은 선행이 훗날 몇 배로 커진 귀인의 은혜로 부메랑이 되어 돌아옵니다.
              </p>
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2">
              <strong className="text-[#5F7A68] block">• 태극귀인 (太極貴인) - 중말년 자산 축적의 축복</strong>
              <p className={`font-light ${blurClass}`}>
                초년에 크고 작은 방황이나 풍파가 있더라도, 중년 이후부터 자산 기반을 착실히 마련할 수 있도록 대운에서 수호해 주는 복입니다. 무리한 단타만 피하면 중말년은 반드시 부유하고 부러울 것 없는 명의를 소유하게 될 흐름입니다.
              </p>
            </div>

            {/* 내 사주 맞춤 귀인 매칭 & 찾아오는 시기와 장소 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-4">
              <div>
                <span className="font-bold text-[#A3845B] block mb-1.5 flex items-center gap-1.5 text-xs">
                  👤 내 사주에 맞는 귀인은 누구인가?
                </span>
                <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                  의뢰인님의 일간은 <strong>{sajuInfo?.day?.stem} ({sajuInfo?.day?.stemEl}의 기운)</strong>입니다. 
                  사주학적으로 귀하의 인생을 돕는 최고의 절대 귀인인 천을귀인은 <strong>{gwiinInfo.animals.join(" 및 ")}</strong>입니다.
                  <br />
                  <span className="text-[#8B221E] font-medium block mt-1">{gwiinInfo.description}</span>
                </p>
              </div>
              <div className="border-t border-[#E2DDD5]/70 pt-3">
                <span className="font-bold text-[#5F7A68] block mb-1.5 flex items-center gap-1.5 text-xs">
                  📍 귀인이 찾아오는 장소와 환경 (어디서?)
                </span>
                <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                  귀인의 기운은 주로 <strong>{gwiinInfo.directions.join(" 및 ")}</strong> 방위에서 활성화됩니다.
                  특히 <strong>{gwiinInfo.places.join(", ")}</strong>와 같은 환경에서 당신의 가치를 알아보고 손을 내밀어줄 인연과 연결될 가능성이 매우 높습니다.
                </p>
              </div>
              <div className="border-t border-[#E2DDD5]/70 pt-3">
                <span className="font-bold text-[#A3845B] block mb-1.5 flex items-center gap-1.5 text-xs">
                  📅 귀인 운이 발동하는 시기 (언제쯤?)
                </span>
                <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                  세운(해의 운세) 기준으로는 가장 가까운 귀인의 해인 <strong>{gwiinInfo.years.join("년 또는 ")}년</strong>에 일생일대의 중요한 협력이나 기회를 제안받기 쉽습니다. 
                  또한 월별 운세로는 매년 <strong>{gwiinInfo.months.join("월 및 ")}월</strong> 즈음에 인맥을 통한 귀인의 도움이 강하게 작용하니, 이 시기에는 열린 마음으로 다양한 네트워킹에 참여해 보시기 바랍니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }case "job_aptitude":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            💼 평생 직업 적성 처방 (조직 직장 vs 개인 사업)
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            의뢰인 사주의 주체적 기질과 십신의 배치를 볼 때, 귀하에게 가장 적합한 최적의 직업 형태와 경영 방식은 다음과 같습니다.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
              <strong className="text-[#5F7A68] block">🏢 대기업 &amp; 조직 직장생활 상성</strong>
              <p className={`font-light text-[#5F5F5F] leading-relaxed ${blurClass}`}>
                귀하는 기본적인 지적 직관이 좋아 조직에서 핵심 브레인 역할을 맡기 쉽습니다. 단점은 관성(직장의 룰)이 상해서 상사의 불합리함이나 비효율적 관행을 도저히 참아내지 못한다는 점입니다. 이직 충동이 매년 오기 쉬우니 부서 이동 등으로 환기해 줘야 버팁니다.
              </p>
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
              <strong className="text-[#A3845B] block">🚀 1인 창업 &amp; 개인 비즈니스 상성</strong>
              <p className={`font-light text-[#5F5F5F] leading-relaxed ${blurClass}`}>
                자유로운 시간 조율과 본인의 기획안을 즉각 세상에 펼칠 때 최고의 만족도를 얻습니다. 지식 상품 유통, 소형 린 스타트업 창업이 길합니다. 단, 동업이나 자금을 전적으로 빌려서 하는 무리한 대형 설비 투자는 초반 3년간 고전할 우려가 극히 큽니다.
              </p>
            </div>
          </div>
        </div>
      );

    case "wealth_wave":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📈 사주 속 재물 창고(財庫)와 시기별 재산 흐름 파동
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            귀하가 평생 살아가며 맞이할 **재산 형성 및 금전 팽창의 흐름을 수려한 파동 곡선**으로 예측했습니다. 파동의 최고점에서 과감한 자산 문서화를 실현할 때 돈이 도망가지 못하고 묶이게 됩니다.
          </p>
          <div className="py-2">
            {renderWealthWaveSvg(baseEl)}
          </div>
          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2 text-[#5F5F5F] leading-relaxed">
            <h4 className="font-bold text-[#8B221E]">⚠️ 재물 대폭발 골든 타임 활용법</h4>
            <p className={`font-light ${blurClass}`}>
              귀하의 재물 흐름 파동을 보면 **40대 초반에서 50대 중반 사이**에 평생 모은 자산을 뛰어넘는 거대한 문서화 기회(대운의 용신 유입)가 노출됩니다. 이때 단기 주식이나 코인에 돈을 묻지 말고 부동산이나 굳건한 땅, 우량 실물자산에 묻어야 노후의 평화로운 연금 소득을 완성할 수 있습니다.
            </p>
          </div>
          {isFree && (
            <div className="border border-[#E2DDD5] bg-[#2C241E] text-white rounded-lg p-5 mt-4 space-y-3 relative shadow-lg">
              <span className="absolute top-2 right-3 text-lg">🔒</span>
              <h4 className="font-bold text-[#A3845B] text-xs flex items-center gap-1.5 font-myeongjo">
                ➕ {metrics.nickname} 전용 풀이
              </h4>
              <div className="text-[10px] space-y-1 text-gray-300 font-light">
                <p>✓ 30년 동안 이룰 최대 자산 규모</p>
                <p>✓ 자산을 두 배로 불려주는 분배 전략</p>
                <p>✓ 손 잡으면 파산할 수 있는 악연</p>
                <p>✓ 돈이 따라오는 투자 성공 시기</p>
              </div>
            </div>
          )}
        </div>
      );

    case "seoun_2026":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📅 2026년 병오년(丙午年) 전체 세운 흐름
          </h3>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            2026년 병오년(丙午年)은 천간의 맹렬한 태양(丙火)과 지지의 폭발적인 말(午火)이 결합된 '천지합화'의 조열한 해입니다. 온 세상이 급속도로 뜨겁게 가열되며 감추어졌던 비리와 진실이 세상 밖으로 활활 드러나는 혁명적인 해입니다.
          </p>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-[#A3845B] text-xs">• {name}님과 병오년 기운의 조화도</h4>
            <p className={`text-xs text-[#5F5F5F] leading-relaxed font-light ${blurClass}`}>
              귀하의 {baseEl} 일간에게 병오년의 타오르는 불꽃은 **재능의 표현(식상) 혹은 치열한 경쟁(비겁)**의 과열을 의미합니다. 기획력이 극대화되고 의욕이 하늘을 찌르나, 감정이 지나치게 가열되어 충동적 퇴사나 대인 다툼의 구설이 생기기 쉬우니 반드시 **'이성적 감속'**이 평생의 화를 피하는 처방이 됩니다.
            </p>
          </div>
        </div>
      );

    case "seoun_quarterly":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📅 2026년 분기별 상세 흐름 및 월별 대응 전술
          </h3>
          <div className={`space-y-4 text-xs ${blurClass}`}>
            {[
              { season: "🌸 1분기 (1~3월) : 설계와 싹 틔우기", body: "변화의 기운이 꿈틀거리나 아직 구체적인 씨앗이 굳건하지 않습니다. 이직이나 확장을 성급히 진입하지 마십시오." },
              { season: "☀️ 2분기 (4~6월) : 최대 과열 및 충돌 살(煞) 주의", body: "사주에 불이 가장 강력하게 타오르는 계절입니다. 욱하는 스트레스성 뇌과부하, 지인과의 돈거래 사고를 극도로 조심하십시오." },
              { season: "🍁 3분기 (7~9월) : 서리 기운의 하강과 조율", body: "뜨거운 화기를 금(金)이 진정시켜 이성이 돌아옵니다. 상반기에 뿌렸던 이력서가 수락되거나 오해가 풀리는 가장 길한 시기입니다." },
              { season: "❄️ 4분기 (10~12월) : 알찬 금전 수확 및 평온", body: "자산 수입이 계좌에 안착하며 가정이 평화로워집니다. 욕심을 내려놓고 번 돈의 일부를 묶어 다음 해를 설계하십시오." }
            ].map((q, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-4 shadow-sm">
                <span className="font-bold text-[#A3845B] block mb-1">{q.season}</span>
                <p className="text-[#5F5F5F] font-light leading-relaxed">{q.body}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "seoun_aspects":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📅 2026년 분야별 상세 등급 및 행동 강령
          </h3>
          <div className={`space-y-4 ${blurClass}`}>
            {[
              { title: "💰 재물운 지수", stars: "★★★☆☆", desc: "식상이 가열되어 번뜩이는 재테크 구상은 많으나 성급한 단타는 100% 손재수를 부릅니다. 지갑을 굳건히 지키십시오.", action: "가을(음력 8월 이후)에 문서 자산 중심 안정 결정을 유도하십시오." },
              { title: "🏢 직장/사업운 지수", stars: "★★★★☆", desc: "창작 능력이 폭발해 신규 프로젝트 제안이 쏟아집니다. 다만 상사와의 말다툼이나 융통성 없는 일처리는 승진의 방해가 됩니다.", action: "공적인 지시에는 감정을 섞지 말고 즉각적인 피드백으로 신뢰를 쌓으십시오." },
              { title: "💑 연애/애정운 지수", stars: "★★★★☆", desc: "이성에게 강렬한 설렘을 전달하는 해입니다. 마음에 품어오던 인연에게 본인의 진솔하고 부드러운 매력을 전하기 좋은 골든 시기입니다.", action: "상대의 속도에 맞추어 기다려 줄 때 비로소 진솔한 인연이 체결됩니다." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-4 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[#1A1A1A]">
                  <span>{item.title}</span>
                  <span className="text-yellow-500">{item.stars}</span>
                </div>
                <p className="text-[#5F5F5F] font-light leading-relaxed">{item.desc}</p>
                <div className="bg-[#F6F3EC] p-2 rounded border-l-2 border-[#A3845B] text-[11px]">
                  <strong>전술:</strong> {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "daeun_orbit":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🛤️ 평생 대운(大運) 흐름 총평 및 10년 대운 궤도 다이어그램
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            대운(大運)은 '큰 행운'이라는 뜻이 아니라, 10년 단위로 내 인생의 계절과 기후가 바뀌는 것을 의미합니다. 10년 동안 머무는 기후가 따뜻한 봄인지, 추운 겨울인지에 따라 농사법(행동 전략)을 바꾸어야 성공합니다. 귀하의 평생 계절 변화 로드맵을 알려드립니다.
          </p>
          <div className="py-2">
            {renderDaeunOrbitSvg(baseEl)}
          </div>
          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2 text-[#5F5F5F] leading-relaxed">
            <h4 className="font-bold text-[#A3845B]">💡 10년 주기 대운의 메커니즘</h4>
            <p className={`font-light ${blurClass}`}>
              귀하의 대운 흐름을 분석해보면 **30대 중반부터 50대 말**까지 인생의 용신(용신)인 따뜻하고 단단한 기운이 견고하게 들어와 받쳐주고 있습니다. 방황하던 에너지가 굳건히 고정되며, 귀하의 지혜와 수련이 거대한 현금 자산으로 치환되는 기적의 30년 황금기를 보장받은 격입니다.
            </p>
          </div>
          {isFree && (
            <div className="border border-[#E2DDD5] bg-[#2C241E] text-white rounded-lg p-5 mt-4 space-y-3 relative shadow-lg">
              <span className="absolute top-2 right-3 text-lg">🔒</span>
              <h4 className="font-bold text-[#A3845B] text-xs flex items-center gap-1.5 font-myeongjo">
                ➕ {metrics.nickname} 전용 풀이
              </h4>
              <div className="text-[10px] space-y-1 text-gray-300 font-light">
                <p>✓ 취업운이 들어오는 절호의 타이밍</p>
                <p>✓ 난 언제쯤 결혼하기 좋을까?</p>
                <p>✓ 뭘 해도 빵빵 터지는 행운의 시기</p>
                <p>✓ 크게 다칠 수 있는 사고 시기</p>
              </div>
            </div>
          )}
        </div>
      );

    case "daeun_roadmap_1":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🛤️ [대운 로드맵] 대운 1기 ~ 2기 상세 분석
          </h3>
          <div className={`space-y-4 text-xs ${blurClass}`}>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5">
              <strong className="text-[#A3845B] block">• 제 1기 대운 (15세 ~ 24세) : 방황과 자아의 싹 틔우기</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                감수성이 풍부하고 예민한 시기로 잦은 학업 스트레스나 진로 방황이 노출되었던 시기입니다. 겉돌던 에너지를 공부와 기술 축적으로 묶어두는 수련의 터널을 통과했습니다.
              </p>
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5">
              <strong className="text-[#5F7A68] block">• 제 2기 대운 (25세 ~ 34세) : 직업의 안착과 현실적 독립</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                사회인으로서의 지위를 다지고 스스로의 밥그릇을 형성하는 도전의 시기입니다. 무자비한 경쟁이 얽히나 귀하 특유의 인내심과 집중력으로 마침내 독립적인 명의를 쟁취하기 시작합니다.
              </p>
            </div>
          </div>
        </div>
      );

    case "daeun_roadmap_2":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🛤️ [대운 로드맵] 대운 3기 ~ 4기 상세 분석
          </h3>
          <div className={`space-y-4 text-xs ${blurClass}`}>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5">
              <strong className="text-[#8B221E] block">• 제 3기 대운 (35세 ~ 44세) : 인생 최대의 재물 폭발기 (용신 유입)</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                그동안 축적했던 기획력과 실력이 하나의 커다란 플랫폼/사업체/부동산으로 폭발하여 고도의 자산 가치 형성을 보장받습니다. 이때 적극적인 자산 이동을 지향해야 합니다.
              </p>
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-2.5">
              <strong className="text-[#A3845B] block">• 제 4기 대운 (45세 ~ 54세) : 안락한 자산 보존과 명예 완성</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                무리한 실무에서 한 발짝 물러서서 조력자, 고문, 수동적 임대/시스템 소득을 정비하고 가정을 따뜻하게 보살펴 평화로운 귀인의 삶을 향유하게 되는 안정적인 종착지입니다.
              </p>
            </div>
          </div>
        </div>
      );

    case "warning_period":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🛡️ 평생 조심해야 할 흉한 시기 &amp; 액운 소멸 방어 비책
          </h3>
          <div className={`bg-red-50/50 border border-red-200 rounded-lg p-5 space-y-3 text-xs leading-relaxed text-[#5F5F5F] ${blurClass}`}>
            <h4 className="font-bold text-red-700">🚨 조심해야 할 3대 충살(沖煞) 시기</h4>
            <p className="font-light">
              1. **자오충(子午沖)의 시기 (음력 5월/11월):** 매년 이 두 계절에는 사주 내 충돌 에너지가 극에 달합니다. 무리한 장거리 여행이나 신규 계약 서명을 피하고 족욕을 하며 몸을 사려야 합니다.
            </p>
            <p className="font-light">
              2. **인신충(寅申沖)의 변동 시기:** 예상치 못한 부서 이동이나 거주지 이동의 풍파가 오기 쉽습니다. 이때 억지로 맞서 싸우려 하지 말고 순리대로 받아들이는 개운법이 좋습니다.
            </p>
            <p className="font-light">
              3. **금전 누수 주의 시기:** 주식/코인의 대박 유혹이 끓는 음력 2월 및 6월은 동업 파기나 서류 사기의 구설이 강하니, 지갑의 열쇠를 완전히 닫아두어야 재산을 보존합니다.
            </p>
          </div>
        </div>
      );

    case "gaewoon_presc":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🌿 부족한 기운을 채우는 나만의 오행 개운법
          </h3>
          <div className="space-y-4 text-xs">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
                <span className="font-bold text-[#A3845B] text-sm flex items-center gap-1.5 font-myeongjo">
                  ✨ {p.name} 개운 비책
                </span>
                <div className="grid grid-cols-4 gap-2 text-[10px] bg-[#F9F8F6] p-3 rounded border border-[#E2DDD5]/60 text-center font-semibold">
                  <div><span className="text-[#5F5F5F] block font-light">행운 색상</span><span>{p.color}</span></div>
                  <div><span className="text-[#5F5F5F] block font-light">행운 방향</span><span>{p.direction}</span></div>
                  <div><span className="text-[#5F5F5F] block font-light">행운 숫자</span><span>{p.number}</span></div>
                  <div><span className="text-[#5F5F5F] block font-light">행운 추천</span><span>{p.items}</span></div>
                </div>
                <p className="text-[#5F5F5F] font-light leading-relaxed font-traditional">
                  <strong>실천 행동 강령:</strong> {p.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case "ten_year_seoun":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🔮 향후 10개년 (2026~2035) 연도별 족집게 세운 운세
          </h3>
          <div className={`space-y-3 text-xs leading-relaxed max-h-[500px] overflow-y-auto pr-1 ${blurClass}`}>
            {[
              { year: "2026년 (丙午)", fortune: "식상이 가열되어 의욕이 폭발하는 해입니다. 감정적 욱함을 제어하고 가을에 문서 이동을 성사시키십시오. [길흉지수: 70%]" },
              { year: "2027년 (丁未)", fortune: "주변의 신뢰를 얻어 조직 내 승진이나 중요한 파트너십이 체결되는 안정기입니다. [길흉지수: 80%]" },
              { year: "2028년 (戊申)", fortune: "금전이 바위처럼 단단하게 뭉쳐지는 부동산/종잣돈 형성의 훌륭한 재성 해입니다. [길흉지수: 90%]" },
              { year: "2029년 (己酉)", fortune: "문서와 면허 취득, 자격증 시험 합격 등 명예를 공고히 다지는 시기입니다. [길흉지수: 85%]" },
              { year: "2030년 (庚戌)", fortune: "조직 내의 갈등이나 배우자와의 소소한 마찰을 조율해야 하는 성찰의 주기입니다. [길흉지수: 60%]" },
              { year: "2031년 (辛亥)", fortune: "물의 에너지가 원활히 순환하여 이사, 해외 진출 등 기분 좋은 변동이 겹칩니다. [길흉지수: 75%]" },
              { year: "2032년 (壬子)", fortune: "사주 내 충살이 활성화되니 무리한 신규 투자나 대출 비중 확대를 극도로 주의하십시오. [길흉지수: 50%]" },
              { year: "2033년 (癸丑)", fortune: "겨울의 끈기로 준비해 온 장기 기획이 세상에 드러나 소소한 보상을 거둡니다. [길흉지수: 70%]" },
              { year: "2034년 (甲寅)", fortune: "나무의 곧은 기운이 가득해 1인 창업이나 독립 선언을 하기에 가장 최적입니다. [길흉지수: 95%]" },
              { year: "2035년 (乙卯)", fortune: "사교성과 소통 능력이 최고조에 달해 넓은 인맥을 자산화시키는 금전적 황금기입니다. [길흉지수: 88%]" }
            ].map((y, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-3 shadow-sm flex gap-3">
                <span className="font-bold text-[#A3845B] shrink-0 w-24 border-r border-[#E2DDD5] pr-2">{y.year}</span>
                <p className="text-[#5F5F5F] font-light">{y.fortune}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "fengshui_bless":
      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            🏡 공간 풍수 인테리어 처방 및 마지막 축원
          </h3>
          <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-6 space-y-4 text-xs text-[#2C2C2C] leading-relaxed font-traditional">
            <h4 className="font-bold text-[#A3845B] font-myeongjo">🛌 행운을 부르는 공간 풍수 전략</h4>
            <p className="font-light">
              1. **거실 동남쪽 공간:** 잎이 넓은 녹색 식물 화분을 눈높이 아래에 배치하여 집안으로 유입되는 대지의 생기를 증폭하십시오.
            </p>
            <p className="font-light">
              2. **침실 암막 커튼:** 취침 공간은 가능한 완벽하게 어둡게 조성하여 수(수)의 신성한 지혜 에너지가 밤사이 뇌를 정화하게 유도하십시오.
            </p>
            <p className="font-light">
              3. **현금 금고 보관:** 거실 서쪽 서랍 깊숙한 곳에 노란 비단천에 통장과 도장을 모아 보관하면 재물이 흩어지는 흉을 원천 방어합니다.
            </p>
          </div>
          <div className="bg-gradient-to-r from-[#2D3A30] to-[#1E2620] border-2 border-[#A3845B] rounded-lg p-6 text-center text-[#FAF7F0] space-y-3 shadow-lg">
            <h4 className="font-myeongjo text-base font-bold text-[#A3845B] tracking-widest">慧眼堂 마지막 축원 (祝願)</h4>
            <p className="text-xs leading-relaxed font-light font-traditional italic max-w-md mx-auto">
              "태어난 8글자의 운명은 단단한 돌에 새겨진 비석이 아니며, 스스로 물을 주고 가꾸는 대지의 기름진 흙과 같습니다. 혜안당 보감이 제시하는 개운 실천법을 일상에 새겨, 다가올 풍파를 비껴가고 인생의 찬란한 황금기를 활짝 개화하시기를 온 마음으로 축원합니다."
            </p>
          </div>
        </div>
      );

    default:
      return <div className="text-xs font-light text-center py-10">페이지를 렌더링하는 중 오류가 발생했습니다.</div>;
  }
};

const renderWealthWaveSvg = (baseEl) => {
  let dPath = "M 10 150 Q 80 80, 150 180 T 290 60 T 430 200 T 570 40 T 700 120";
  if (baseEl === "목") dPath = "M 10 170 Q 90 60, 180 190 T 320 80 T 460 220 T 600 50 T 700 140";
  else if (baseEl === "화") dPath = "M 10 140 Q 70 50, 140 210 T 280 90 T 420 180 T 560 30 T 700 100";
  else if (baseEl === "토") dPath = "M 10 180 Q 100 90, 200 170 T 340 70 T 480 200 T 620 60 T 700 130";
  else if (baseEl === "금") dPath = "M 10 160 Q 80 70, 160 200 T 300 100 T 440 190 T 580 40 T 700 110";

  return (
    <svg viewBox="0 0 700 250" className="w-full h-auto bg-[#F9F8F6] border border-[#E2DDD5] rounded-lg p-4 shadow-inner">
      <line x1="0" y1="50" x2="700" y2="50" stroke="#E2DDD5" strokeDasharray="4 4" strokeWidth="0.5" />
      <line x1="0" y1="125" x2="700" y2="125" stroke="#E2DDD5" strokeDasharray="4 4" strokeWidth="0.5" />
      <line x1="0" y1="200" x2="700" y2="200" stroke="#E2DDD5" strokeDasharray="4 4" strokeWidth="0.5" />
      <text x="15" y="45" fill="#A3845B" className="text-[10px] font-sans font-bold">재산 폭발기 (최고조)</text>
      <text x="15" y="120" fill="#999" className="text-[10px] font-sans">안정 유지기</text>
      <text x="15" y="195" fill="#999" className="text-[10px] font-sans">기반 형성기</text>
      <text x="70" y="230" fill="#5F5F5F" className="text-[10px] font-sans font-semibold">20대 후반</text>
      <text x="210" y="230" fill="#5F5F5F" className="text-[10px] font-sans font-semibold">30대 중반</text>
      <text x="350" y="230" fill="#5F5F5F" className="text-[10px] font-sans font-semibold">40대 초반</text>
      <text x="490" y="230" fill="#5F5F5F" className="text-[10px] font-sans font-semibold">50대 중반</text>
      <text x="630" y="230" fill="#5F5F5F" className="text-[10px] font-sans font-semibold">60대 이후</text>
      <path d={dPath} fill="none" stroke="#8B221E" strokeWidth="3" />
      <circle cx="210" cy="90" r="5" fill="#A3845B" />
      <circle cx="490" cy="50" r="5" fill="#8B221E" />
      <text x="220" y="85" fill="#A3845B" className="text-[10px] font-bold">1차 상승</text>
      <text x="500" y="45" fill="#8B221E" className="text-[10px] font-bold">인생 최대 재물 폭발기 💥</text>
    </svg>
  );
};

const renderDaeunOrbitSvg = (baseEl) => {
  return (
    <svg viewBox="0 0 700 130" className="w-full h-auto bg-[#F9F8F6] border border-[#E2DDD5] rounded-lg p-4 shadow-inner">
      <line x1="50" y1="60" x2="650" y2="60" stroke="#A3845B" strokeWidth="2" strokeDasharray="5 5" />
      {[
        { age: "10대~20대", title: "준비 대운", desc: "학업과 탐색", x: 100, active: false, color: "#999" },
        { age: "30대~40대", title: "도약 대운", desc: "사회적 독립", x: 260, active: true, color: "#5F7A68" },
        { age: "50대~60대", title: "절정 대운", desc: "재물 대박", x: 440, active: true, color: "#8B221E" },
        { age: "70대 이후", title: "수성 대운", desc: "노후 안락", x: 600, active: false, color: "#A3845B" }
      ].map((node, i) => (
        <g key={i}>
          <circle cx={node.x} cy="60" r="18" fill="white" stroke={node.color} strokeWidth={node.active ? "4" : "2"} />
          {node.active && <circle cx={node.x} cy="60" r="8" fill={node.color} />}
          <text x={node.x} y="30" textAnchor="middle" fill="#1A1A1A" className="text-[10px] font-bold font-sans">{node.age}</text>
          <text x={node.x} y="95" textAnchor="middle" fill={node.color} className="text-[10px] font-bold font-myeongjo">{node.title}</text>
          <text x={node.x} y="110" textAnchor="middle" fill="#666" className="text-[9px] font-light">{node.desc}</text>
        </g>
      ))}
    </svg>
  );
};

function ResultContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const debugUnlock = searchParams.get("unlock") === "true" || searchParams.get("debug") === "true";

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



  // Check payment status on mount
  const [hasCheckedPayment, setHasCheckedPayment] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      // reportGrade가 free가 아니거나 debugUnlock이 활성화되어 있으면 즉시 잠금 해제
      if (debugUnlock || reportGrade !== "free") {
        setIsPaid(true);
        return;
      }
      try {
        const existingStr = localStorage.getItem("hyeandang_orders");
        if (existingStr) {
          const orders = JSON.parse(existingStr);
          const matched = orders.find(o => 
            o.name === name && 
            o.status === "paid" &&
            o.year === String(year) &&
            o.month === String(month) &&
            o.day === String(day)
          );
          if (matched) {
            setIsPaid(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
      setHasCheckedPayment(true);
    }
  }, [reportGrade, name, year, month, day, debugUnlock]);

  const updateLocalStorageOrderToPaid = () => {
    try {
      const existingStr = localStorage.getItem("hyeandang_orders");
      if (existingStr) {
        const orders = JSON.parse(existingStr);
        const matchedIdx = orders.findIndex(o => 
          o.name === name && 
          o.year === String(year) &&
          o.month === String(month) &&
          o.day === String(day)
        );
        if (matchedIdx > -1) {
          orders[matchedIdx].status = "paid";
          localStorage.setItem("hyeandang_orders", JSON.stringify(orders));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePortonePayment = () => {
    if (typeof window === "undefined") return;
    
    if (!window.IMP) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 인터넷 연결을 확인하시거나, 브라우저의 광고 차단 확장 프로그램(AdBlock 등)이 활성화되어 있다면 해제한 후 새로고침(F5)을 해주세요.");
      return;
    }

    try {
      const IMP = window.IMP;
      const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE || "imp00000000";
      const pgCode = process.env.NEXT_PUBLIC_PORTONE_PG || "html5_inicis";

      if (impCode === "imp00000000") {
        alert("[개발자 테스트 안내] 테스트 가맹점 코드(imp00000000)가 감지되어 모의 결제 성공 시뮬레이션을 즉시 실행합니다.\n\n확인을 누르시면 로컬 스토리지에 결제완료(paid) 정보가 반영되고 34페이지 상세 보고서 잠금이 풀리게 됩니다.");
        setIsProcessing(true);
        setProgress(0);
        
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 10;
          if (currentProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setIsProcessing(false);
              setIsPaid(true);
              updateLocalStorageOrderToPaid();
            }, 300);
          } else {
            setProgress(currentProgress);
          }
        }, 150);
        return;
      }
      
      IMP.init(impCode);

      IMP.request_pay({
        pg: pgCode,
        pay_method: "card",
        merchant_uid: `merchant_${new Date().getTime()}`,
        name: `${name}님 정통 사주 풀이 보고서`,
        amount: 34900,
        buyer_name: name,
      }, function (rsp) {
        if (rsp.success) {
          // 결제 성공 시 1.8초 동안 만세력 정밀 보조 빌드 애니메이션 시작
          setIsProcessing(true);
          setProgress(0);
          
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsProcessing(false);
                setIsPaid(true);
                updateLocalStorageOrderToPaid();
              }, 300);
            } else {
              setProgress(currentProgress);
            }
          }, 150);
        } else {
          alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg} (가맹점코드: ${impCode}, PG: ${pgCode})`);
        }
      });
    } catch (err) {
      alert(`결제 모듈 실행 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const renderLockOverlay = (sectionTitle) => {
    return (
      <div className="absolute inset-0 bg-[#F9F8F6]/85 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center select-none print:hidden">
        <div className="border-2 border-[#A3845B] bg-[#F9F8F6] rounded-xl p-8 max-w-sm shadow-xl space-y-4 relative">
          <div className="absolute top-2 left-2 text-[#A3845B]/20 text-[10px]">卍</div>
          <div className="absolute top-2 right-2 text-[#A3845B]/20 text-[10px]">卍</div>
          <div className="absolute bottom-2 left-2 text-[#A3845B]/20 text-[10px]">卍</div>
          <div className="absolute bottom-2 right-2 text-[#A3845B]/20 text-[10px]">卍</div>
          
          <div className="w-12 h-12 bg-[#A3845B]/10 text-[#A3845B] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">
            {sectionTitle || "정밀 운세 분석"} 잠금 해제
          </h4>
          <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light font-traditional">
            이 영역은 <strong>정통 사주 풀이 보고서 (유료)</strong> 결제 시 제공되는 고품격 정밀 분석서입니다. 결제 즉시 잠금이 해제되며 전체 리포트 열람 및 출력이 가능해집니다.
          </p>
          <button
            type="button"
            onClick={handlePortonePayment}
            className="w-full py-2.5 bg-[#8B221E] hover:bg-[#6D1B18] text-white rounded text-xs font-semibold shadow-md transition-all font-traditional"
          >
            정통 사주 풀이로 잠금 해제 (34,900원)
          </button>
          <button
            type="button"
            onClick={() => setIsPaid(true)}
            className="w-full py-1.5 bg-[#5F7A68] hover:bg-[#38493D] text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all mt-1"
          >
            ⚙️ [개발자 테스트] 즉시 잠금해제 확인하기
          </button>
        </div>
      </div>
    );
  };

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

    const pages = getPagesConfiguration(name, partnerName);
    const metrics = getCharacterMetrics(sajuInfo);
    const iljuSecret = getIljuSecret(sajuInfo.day.stem, sajuInfo.day.branch);

    const isFree = reportGrade === "free" && !isPaid;
    
    // 카운트다운 타이머 상태 관리
    const [timeLeft, setTimeLeft] = useState("02:26:49");
    useEffect(() => {
      let totalSeconds = 8809; // 2시간 26분 49초
      const timer = setInterval(() => {
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return;
        }
        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const format = (num) => String(num).padStart(2, '0');
        setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    // 무료 버전일지라도 32페이지 전체 윤곽 스크롤 노출
    const activePages = pages;

    return (
      <div className="space-y-12 print:space-y-0">
        {activePages.map((page) => (
          <div
            key={page.page}
            className="print-page-wrapper print:text-[13px] print:leading-relaxed relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-8 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-screen"
          >
            <div>
              {/* Decorative Corner Seals (Inside page) */}
              <div className="absolute top-2 left-2 text-[#A3845B]/15 text-[8px] print:hidden">卍</div>
              <div className="absolute top-2 right-2 text-[#A3845B]/15 text-[8px] print:hidden">卍</div>

              {/* Page Header */}
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 평생 사주</span>
                <span className="text-[9px] text-gray-400 font-light font-traditional">{page.title}</span>
              </div>

              {/* Dynamic Content */}
              <div className="flex-1">
                {renderPageContent(page, {
                  name,
                  gender,
                  year,
                  month,
                  day,
                  hour,
                  calendar,
                  sajuInfo,
                  prescriptions,
                  personalizedText,
                  metrics,
                  iljuSecret,
                  worryText,
                  partnerName,
                  partnerSajuInfo,
                  partnerGender,
                  partnerYear,
                  partnerMonth,
                  partnerDay,
                  partnerHour,
                  partnerCalendar,
                  baseEl,
                  getElementColor,
                  getElementBarColor,
                  handlePortonePayment,
                  isFree
                })}
              </div>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between items-center border-t border-[#E2DDD5]/50 pt-3 mt-6 text-[9px] text-[#5F5F5F] print:text-xs">
              <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 평생 사주팔자</span>
              <span className="font-myeongjo font-bold">{page.page} / {pages.length}</span>
            </div>
          </div>
        ))}

        {isFree && (
          <div className="relative mt-8">
            {/* 정교한 유료 잠금 오버레이 배너 (이현의 마지막 제안 테마) */}
            <div className="bg-[#1C1613] text-[#FAF7F0] border-4 border-double border-[#A3845B] rounded-xl p-8 shadow-2xl text-center font-traditional relative overflow-hidden print:hidden">
              <div className="text-[10px] tracking-widest text-[#A3845B] mb-2">— 이현의 마지막 제안 —</div>
              
              <h4 className="font-myeongjo text-xl font-bold text-white mb-6">
                {name}님 사주엔 <span className="text-[#A3845B]">4가지 비밀</span>이 잠겨 있습니다.
              </h4>

              {/* 4대 비밀 칩 버튼 그리드 */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6 text-xs font-semibold">
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2420] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  {sajuInfo.day.stem}{sajuInfo.day.branch} 일주의 의미 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2420] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  {baseEl}({sajuInfo.day.stemEl}) 오행의 작용 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2420] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  3대 신살의 발현 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2420] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  정재 십성의 흐름 🔓
                </button>
              </div>

              <p className="text-[11px] text-gray-300 font-light mb-6">
                이 4가지로 총 34개 이야기.<br />
                <strong>2개 이야기의 일부를 읽으셨습니다.</strong>
              </p>

              {/* 카운트다운 타이머 및 가격 */}
              <div className="flex items-center justify-center gap-3 text-xs mb-6 bg-black/40 py-2.5 px-4 rounded-lg max-w-xs mx-auto">
                <span className="text-red-500 font-bold">⏰ {timeLeft} · 단 1회 한정</span>
                <span className="text-gray-400 line-through">54,600원</span>
                <span className="text-white font-bold text-sm">34,900원</span>
                <span className="text-[#A3845B] font-bold">36%↓</span>
              </div>

              {/* 행동 유도 결제 버튼 */}
              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handlePortonePayment}
                  className="w-full py-4 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] rounded font-bold text-sm shadow-xl transition-all tracking-widest cursor-pointer"
                >
                  {name}님 정통 사주 풀이 ({metrics.nickname}) →
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className="w-full py-2 bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/20 text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all"
                >
                  ⚙️ [개발자 테스트] 결제 없이 즉시 잠금해제 확인하기
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 font-sans">
                <p>✓ 지금 14명이 본인의 정통 사주를 함께 펼쳐보고 있어요</p>
                <p>✓ 누적 12,795명이 본인의 진짜 모습을 확인했습니다</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
    <div className="min-h-screen hyeandang-traditional-bg text-[#2C2C2C] py-10 px-4 md:py-16 print:bg-white print:py-0 print:px-0">
      <Script 
        src="https://cdn.iamport.kr/v1/iamport.js" 
        strategy="afterInteractive"
      />
      {/* 결제 후 데이터 생성 중 로딩 애니메이션 오버레이 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center select-none print:hidden">
          <div className="border-2 border-[#A3845B] bg-[#F9F8F6] rounded-xl p-8 max-w-sm shadow-2xl space-y-6 relative">
            <div className="absolute top-2 left-2 text-[#A3845B]/20 text-[10px]">卍</div>
            <div className="absolute top-2 right-2 text-[#A3845B]/20 text-[10px]">卍</div>
            <div className="absolute bottom-2 left-2 text-[#A3845B]/20 text-[10px]">卍</div>
            <div className="absolute bottom-2 right-2 text-[#A3845B]/20 text-[10px]">卍</div>
            
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#A3845B] border-t-transparent mx-auto"></div>
            <div className="space-y-2">
              <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">
                만세력 정밀 보조 데이터 빌드 중...
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-[#8B221E] h-2 rounded-full transition-all duration-150" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-500 font-light">
                {progress}% 완료
              </p>
            </div>
            <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-traditional">
              결제가 정상 승인되었습니다. 혜안당 명리 분석 시스템에서 귀하의 평생 사주 정밀 분석서를 작성하고 있습니다. 잠시만 기다려 주십시오.
            </p>
          </div>
        </div>
      )}

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
            <h1 className="font-myeongjo text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-wider leading-tight print:text-4xl break-keep">
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
      <div className="min-h-screen hyeandang-traditional-bg flex items-center justify-center">
        <div className="font-myeongjo text-lg text-[#A3845B] animate-pulse">혜안당 보감 렌더링 중...</div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}

// ==========================================
// [신설 헬퍼 함수] 10페이지: 여덟 글자의 운명 조화 및 마음가짐 처방 데이터 생성
// ==========================================
const getDestinyHarmonyData = (sajuInfo) => {
  const dayStem = sajuInfo?.day?.stem || "甲";
  const dayStemEl = sajuInfo?.day?.stemEl || "목";
  const elements = sajuInfo?.elements || { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  
  // 과다/결핍 오행 분석
  let maxEl = "목";
  let maxCount = -1;
  let minEl = "수";
  let minCount = 999;
  
  Object.entries(elements).forEach(([el, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxEl = el;
    }
    if (count < minCount) {
      minCount = count;
      minEl = el;
    }
  });

  const elNames = {
    목: "목(木 - 나무)",
    화: "화(火 - 불)",
    토: "토(土 - 흙)",
    금: "금(金 - 쇠)",
    수: "수(水 - 물)"
  };

  const elProperties = {
    목: {
      excess: "추진력과 의욕이 넘치지만 자칫 시작만 하고 마무리가 약해질 수 있으며, 지나친 고집으로 타인과의 마찰을 빚기 쉽습니다.",
      deficient: "새로운 시작에 대한 두려움이 생기기 쉽고, 자신감이 위축되거나 추진력이 부족하여 기회를 망설이다 놓칠 수 있습니다.",
      mindset: "천천히 호흡하며 타인의 의견을 수용하고, 뿌리가 흔들리지 않는 거목처럼 차분하고 듬직하게 기다리는 여유를 갖추어야 합니다."
    },
    화: {
      excess: "표현력과 열정이 넘쳐 화려하지만, 감정 기복이 심해지기 쉽고 성급한 결정으로 불꽃처럼 타올랐다 빠르게 식어버릴 수 있습니다.",
      deficient: "스스로를 밖으로 드러내는 열정과 표현력이 다소 부족해 보일 수 있으며, 의욕이 쉽게 침체되거나 우울감에 빠질 수 있습니다.",
      mindset: "조급한 불길을 잠재우고 내면의 냉철한 이성을 채워 넣어야 합니다. 순간의 감정 폭발을 억제하고 에너지를 한곳에 모으는 명상이 필요합니다."
    },
    토: {
      excess: "포용력과 고집이 대단하여 굳건하지만, 고집이 지나쳐 변화를 거부하고 생각의 틀에 갇혀 고립되거나 게을러지기 쉽습니다.",
      deficient: "기반이 흔들리는 불안감을 자주 느낄 수 있으며, 주거지나 직장이 자주 변동되는 등 삶의 안정성이 약해지기 쉽습니다.",
      mindset: "어떠한 거센 풍파가 와도 흔들리지 않는 거대한 대지처럼 묵직하게 스스로의 자존감을 지켜내며, 열린 마음으로 변화를 받아들여야 합니다."
    },
    금: {
      excess: "결단력과 맺고 끊음이 칼날 같으나, 지나치게 냉정하거나 비판적인 태도로 인해 주변 사람들에게 상처를 주고 고독해질 수 있습니다.",
      deficient: "공과 사를 구분하고 결정을 내리는 결단력이 약해질 수 있으며, 맺고 끊지 못하는 유유부단함으로 인해 불필요한 고생을 자초할 수 있습니다.",
      mindset: "날카로운 칼날 끝을 둥글게 갈아내는 유연한 자비심이 필요합니다. 완벽주의라는 굴레에서 벗어나 스스로에게 칭찬을 건네는 습관을 들여야 합니다."
    },
    수: {
      excess: "생각과 지혜가 깊어 직관력이 매우 뛰어나지만, 생각이 지나치게 많아 우울감이나 불안감에 휩싸이기 쉽고 비밀이 많아질 수 있습니다. 조용히 정체되기 쉽습니다.",
      deficient: "생각의 깊이와 침착함이 아쉬울 수 있고, 마음이 늘 분주하며 눈앞의 자극에 쉽게 휩쓸려 내적인 평정심을 잃기 쉽습니다.",
      mindset: "끝없이 흘러내리는 맑은 샘물처럼, 멈추지 않는 지혜의 흐름을 믿고 어떤 고난도 유연하게 비껴가는 유수(流水)의 지혜를 내면화해야 합니다."
    }
  };

  const excessDesc = elProperties[maxEl]?.excess || "";
  const deficientDesc = elProperties[minEl]?.deficient || "";
  const mindsetDesc = elProperties[dayStemEl]?.mindset || "균형 있는 마음가짐을 가져야 합니다.";

  // 오행 순환 구조에 따른 희귀도 가상 매핑
  let rarityScore = "98.7%";
  if (maxCount >= 4) rarityScore = "99.4% (극희귀 쏠림형 구조)";
  else if (minCount > 0) rarityScore = "97.5% (오행 구족 안정형 구조)";

  return {
    title: "여덟 글자의 운명 조화 및 마음가짐 처방",
    intro: `귀하의 사주는 ${dayStem}일간을 중심으로 구성된 팔자이며, 전체 오행 분포 중 가장 강한 기운은 ${elNames[maxEl]}이고 가장 보완이 필요한 기운은 ${elNames[minEl]}입니다.`,
    harmonyAnalysis: `강한 ${maxEl}의 기운으로 인해 ${excessDesc} 한편, ${minEl}의 기운이 상대적으로 약화되어 ${deficientDesc} 따라서 인생의 균형을 찾기 위해서는 이 치우쳐진 우주 에너지를 조화롭게 제어하는 내면의 태도가 필수적입니다.`,
    mindsetPrescription: mindsetDesc,
    rarity: rarityScore,
    dayStem,
    dayStemEl
  };
};

// ==========================================
// [신설 헬퍼 함수] 11페이지: 타고난 기질 분석 및 3대 행동 강령 데이터 생성
// ==========================================
const getInnerDispositionData = (sajuInfo) => {
  const dayStem = sajuInfo?.day?.stem || "甲";
  const dayStemEl = sajuInfo?.day?.stemEl || "목";

  const guidelines = {
    목: [
      {
        title: "신속한 시작보다는 마무리의 마일스톤 설계하기",
        desc: "새로운 프로젝트를 기획하고 착수할 때, 시작에 쏟는 에너지의 30%를 최종 완성 단계를 점검하고 피드백하는 일정에 미리 배정해두십시오."
      },
      {
        title: "의견 조율 시 3초 멈추고 경청하기",
        desc: "강한 추진력과 주체성으로 인해 타인의 조언을 간섭으로 느끼기 쉽습니다. 대화 중 반론이 생기면 속으로 3초를 센 뒤 리액션하는 습관을 들이십시오."
      },
      {
        title: "초록빛 식물과 아침 산책으로 생기 충전",
        desc: "나무(木)의 솟구치는 기운이 침체될 때 슬럼프가 옵니다. 일주일에 2회 이상 나무가 우거진 곳을 걸으며 새벽이나 오전의 맑은 기운을 쐬십시오."
      }
    ],
    화: [
      {
        title: "의사결정 전 24시간 숙고 필터링 적용",
        desc: "감정이 고조되었을 때 즉흥적으로 약속하거나 투자하는 습관은 해롭습니다. 중요 결정은 반드시 하룻밤을 자고 난 후에 진행하십시오."
      },
      {
        title: "따뜻한 칭찬과 경청을 통한 인맥 관리",
        desc: "나의 화려한 화술로 좌중을 압도하기보다 상대방의 이야기를 적극적으로 이끌어내고 칭찬하여, 나를 돕는 우호적 세력을 견고히 하십시오."
      },
      {
        title: "심호흡과 차분한 조명의 명상 시간 가지기",
        desc: "넘치는 화(火) 기운을 다스리기 위해 침실 조명을 낮추고 하루 10분간 생각을 끄는 잔잔한 명상 또는 요가를 생활화하십시오."
      }
    ],
    토: [
      {
        title: "변화를 거부하지 않고 주 1회 새로운 시도",
        desc: "익숙함에 안주하면 운이 정체됩니다. 주 1회 가지 않던 길로 출근하거나 새로운 분야의 책을 읽으며 정체된 토(土) 기운을 순환시키십시오."
      },
      {
        title: "타인과의 감정적 거리 유지 및 경계선 긋기",
        desc: "넓은 포용력으로 타인의 짐을 짊어지다 지치기 쉽습니다. 나와 타인의 경계를 명확히 하고 거절하는 연습을 서서히 해나가야 합니다."
      },
      {
        title: "가벼운 유산소 운동으로 무거운 기운 털어내기",
        desc: "신체가 무거워지면 정신도 게을러지기 쉬운 오행입니다. 땀이 약간 날 정도의 달리기나 등산을 규칙적으로 하여 기운을 순환하십시오."
      }
    ],
    금: [
      {
        title: "완벽의 잣대를 내려놓고 80% 룰 적용",
        desc: "100% 완벽함을 추구하다 스스로를 옥죄고 타인을 다그치기 쉽습니다. 80%의 완성도에서 1차 실행을 하고 보완하는 융통성을 발휘하십시오."
      },
      {
        title: "가까운 인연에게 따뜻한 지지 표현하기",
        desc: "냉철한 피드백은 상대에게 비수가 될 수 있습니다. 지적이나 정답을 주기 전에 상대방의 감정에 먼저 공감하고 지지하는 따뜻한 말을 건네십시오."
      },
      {
        title: "부드러운 실크나 면 소재 의류 활용",
        desc: "차가운 날카로움을 중화하기 위해 일상 복장에 부드러운 파스텔톤 컬러나 촉감이 부드러운 의류를 믹스매치하여 인상을 유화시키십시오."
      }
    ],
    수: [
      {
        title: "생각을 머릿속에 가두지 않고 매일 메모하기",
        desc: "생각이 너무 깊어지면 행동이 정체됩니다. 매일 아침 오늘 실행할 핵심 업무 3가지를 화이트보드나 노트에 적어 시각화하고 즉시 착수하십시오."
      },
      {
        title: "경계심을 풀고 속내를 털어놓을 멘토 확보",
        desc: "혼자 고민을 안고 끙끙 앓다 보면 부정적 감정에 함몰되기 쉽습니다. 온전히 나를 지지해주는 신뢰할 수 있는 멘토나 상담 대상을 마련하십시오."
      },
      {
        title: "반신욕이나 족욕을 통해 차가운 기운 순환",
        desc: "수(水) 기운은 하체가 차가워지기 쉽습니다. 몸의 온도를 높여 기혈 순환을 돕고, 따뜻한 성질의 차를 자주 음용하십시오."
      }
    ]
  };

  const dispositionSummaries = {
    목: `귀하의 기질은 대지를 뚫고 솟아오르는 새싹이자 하늘을 향해 뻗어가는 아름드리나무의 본질을 지녔습니다. 곧고 바른 성품으로 명예를 중시하며, 창조적인 아이디어와 개척 정신이 매우 뛰어납니다. 다만 자신의 뜻이 꺾이거나 강제적인 지시를 받을 때 심하게 좌절하거나 반발심을 가질 수 있는 기질적 약점을 지니고 있습니다.`,
    화: `귀하의 기질은 세상을 환하게 비추는 태양이자 밤하늘을 수놓는 모닥불의 본질을 지녔습니다. 예의가 바르고 활력이 넘치며, 자신을 표현하고 대중을 이끄는 카리스마와 전달력이 대단히 훌륭합니다. 다만 흥분하기 쉽고 인내심이 부족해져 마무리가 다소 흐릿해지거나 감정에 휩쓸려 일을 그르칠 수 있는 약점이 있습니다.`,
    토: `귀하의 기질은 만물을 포용하고 길러내는 넓은 대지이자 거대한 산맥의 본질을 지녔습니다. 신용과 신의를 인생의 최고 가치로 삼으며, 듬직하고 과묵하게 주변 사람들을 품어주는 훌륭한 중재자입니다. 하지만 지나치게 보수적이거나 고집이 강해 변화에 둔감하고, 속마음을 쉽게 드러내지 않아 스스로 병을 키울 수 있습니다.`,
    금: `귀하의 기질은 날카로운 서릿발이자 가을의 결실을 거두는 예리한 칼날의 본질을 지녔습니다. 공과 사가 뚜렷하며, 정의롭고 한번 맺은 결단은 칼로 자르듯 확실하게 집행하는 실행력을 갖췄습니다. 하지만 인간관계에서 너무 융통성 없이 냉정하게 행동하여 의도치 않게 주변을 멀어지게 하는 차가움이 약점입니다.`,
    수: `귀하의 기질은 온 세상을 유연하게 적시는 맑은 물이자 깊고 넓은 바다의 본질을 지녔습니다. 두뇌 회전이 매우 빠르고 지혜로우며, 임기응변과 대인 관계의 유연함이 돋보입니다. 하지만 생각이 꼬리에 꼬리를 물어 과도한 걱정과 우울감에 사로잡히기 쉽고, 겉으로는 웃으면서도 진짜 속마음은 꽁꽁 숨겨두는 경향이 있습니다.`
  };

  const actionGuidelines = guidelines[dayStemEl] || guidelines["목"];
  const summary = dispositionSummaries[dayStemEl] || dispositionSummaries["목"];

  return {
    title: "타고난 기질 분석 및 3대 행동 강령",
    dispositionSummary: summary,
    actionGuidelines: actionGuidelines,
    secretKeys: `귀하의 일간(${dayStem})이 주변 오행들과 맺고 있는 구조적 비기는 다음과 같습니다. 사주에 내재된 은밀한 내적 충동은 주위의 지지를 받을 때 폭발적인 성과를 내지만, 고립되었을 때는 극단적인 냉소주의로 빠질 위험이 있습니다. 따라서 행동 강령에 제시된 습관적 훈련을 통하여 감정 조율의 항상성을 유지하는 것이 타고난 큰 그릇을 채우는 열쇠가 될 것입니다.`
  };
};

// ==========================================
// [신설 헬퍼 함수] 12페이지: 살아가는 방식 및 행운물 풍수 공간 처방 데이터 생성
// ==========================================
const getLifeStyleStrategyData = (sajuInfo) => {
  const dayStem = sajuInfo?.day?.stem || "甲";
  const dayStemEl = sajuInfo?.day?.stemEl || "목";

  // 일간 오행별 재물 획득 유형 및 행운의 아이템/풍수 매핑
  const data = {
    목: {
      wealthType: "아이디어 창조형 및 미래 가치 투자형 재물운",
      lifestyleIntro: "귀하는 머릿속의 기획과 지적 자산, 새로운 비즈니스 모델을 구상하여 무(無)에서 유(有)를 창조할 때 돈이 벌리는 유형입니다. 단순히 노동을 하거나 뻔한 루트로 자산을 굴리는 것은 맞지 않으며, 트렌드를 선점하는 투자나 교육, 창작, 기술 기반 자산 형성이 운을 극대화합니다.",
      fengshui: {
        bedroom: {
          space: "침실 (Bedroom)",
          item: "초록빛 아쿠아마린 스톤 소품",
          desc: "침실 동쪽 테이블 위에 배치하여 나무의 성장을 돕는 수생목(水生木)의 원활한 순환 기류를 유도합니다."
        },
        desk: {
          space: "책상 (Desk)",
          item: "소형 대나무 수경재배 화분",
          desc: "컴퓨터나 모니터 좌측에 두어 학문적 영감과 기획력을 자극하고, 눈의 피로를 막는 목(木) 에너지를 보강합니다."
        },
        livingroom: {
          space: "거실 (Living Room)",
          item: "부드러운 패브릭 소재의 하늘색 쿠션",
          desc: "거실 소파에 배치하여 가족 간의 반목을 해소하고 외출 후 귀가했을 때 지친 목(木) 기운을 재충전합니다."
        }
      },
      daeunStrategy: "향후 다가오는 대운 기류에서는 특히 귀하가 구상해 온 무형의 자산을 특허권, 저작권, 혹은 브랜드 형태로 규격화하여 권리소득(문서운)으로 전환하는 전략이 핵심입니다. 이를 위해 지속적으로 전문 자격을 갱신해 가십시오."
    },
    화: {
      wealthType: "네트워크 확장형 및 플랫폼 마케팅형 재물운",
      lifestyleIntro: "귀하는 수많은 사람들과의 연결망을 장악하고, 자신 혹은 회사의 매력을 널리 홍보하여 대중의 시선을 자본으로 치환하는 유형입니다. 브랜딩, 홍보, 예술, 방송, 다각적 소셜 미디어를 거점으로 삼아 활력을 전파할 때 돈의 흐름이 막힘없이 흘러들어오게 됩니다.",
      fengshui: {
        bedroom: {
          space: "침실 (Bedroom)",
          item: "은은한 우드 트레이와 아로마 디퓨저",
          desc: "침대 주변 서쪽 협탁에 두어 불꽃처럼 타오르는 화(火) 기운을 은은하고 차분하게 정화하여 숙면과 건강운을 돕습니다."
        },
        desk: {
          space: "책상 (Desk)",
          item: "붉은색 가죽 데스크 매트",
          desc: "책상 위 중앙이나 우측에 배치하여 즉각적인 의사결정력과 열정을 고취하고 나를 알리는 대외적 명예운을 높입니다."
        },
        livingroom: {
          space: "거실 (Living Room)",
          item: "노란색 도자기 화병 또는 도자기 오브제",
          desc: "남쪽 창가 근처에 배치하여 강한 불길의 설기를 도와 황금빛 토(土) 재물 창고를 튼튼하게 채워줍니다."
        }
      },
      daeunStrategy: "에너지가 밖으로 과도하게 확산되어 겉만 화려하고 실속이 줄어드는 시기가 올 수 있으므로, 대운의 흐름 속에서 유입된 자산은 반드시 즉시 실물 부동산이나 연금자산 등으로 묶어두는 강제적 잠금 장치가 반드시 병행되어야 합니다."
    },
    토: {
      wealthType: "안정 자산 축적형 및 가치 평가 감정형 재물운",
      lifestyleIntro: "귀하는 대지처럼 자산을 안전하게 보관하고, 저평가된 물건이나 부동산을 발굴하여 장기적으로 묵혀 가치를 올리는 자산 축적에 최적화된 유형입니다. 공격적인 단기 주식 매매보다는 안정적인 토지, 건물, 혹은 원자금 형태의 투자가 체질에 완벽히 부합합니다.",
      fengshui: {
        bedroom: {
          space: "침실 (Bedroom)",
          item: "천연 소금 램프",
          desc: "침실 남동쪽 구석에 은은하게 켜두어 탁한 기운을 살균하고, 따뜻한 기운으로 토(土)의 토양을 비옥하게 가꿔줍니다."
        },
        desk: {
          space: "책상 (Desk)",
          item: "황동 재질의 펜꽂이",
          desc: "책상 우측 모서리에 배치하여 토(土)의 기운이 금(金)이라는 알짜배기 결과물로 단단히 여물도록 촉진합니다."
        },
        livingroom: {
          space: "거실 (Living Room)",
          item: "베이지 톤의 극세사 러그",
          desc: "거실 중앙 바닥에 넓게 펼쳐두어 기운의 무게 중심을 아래로 가라앉히고, 집안 전체에 안정감과 금전이 머물도록 돕습니다."
        }
      },
      daeunStrategy: "묵직한 기운이 자칫 게으름이나 판단 지연으로 이어져 매수/매도 시기를 놓치기 쉬우므로, 신뢰할 수 있는 전문가나 대운 동반자와 정기적인 자산 진단을 약속해두는 정량적 관리가 재물 규모를 세 배로 늘려줄 것입니다."
    },
    금: {
      wealthType: "시스템 통제형 및 냉철한 펀드매니저형 재물운",
      lifestyleIntro: "귀하는 철저한 수치 계산과 데이터 기반의 리스크 통제를 통해 정밀하게 짜인 시스템에서 수익을 창출하는 유형입니다. 감정에 치우치지 않는 자산 배분 포트폴리오를 설계하거나, 구조화된 금융 상품, 약정이 확실한 채권 투자 등에서 두각을 나타냅니다.",
      fengshui: {
        bedroom: {
          space: "침실 (Bedroom)",
          item: "진한 남색빛 암막 커튼",
          desc: "침실 창에 설치하여 밤사이 유입되는 불필요한 살기를 차단하고 금(金) 기운의 날카로움을 깊은 명상적 수면으로 안정시킵니다."
        },
        desk: {
          space: "책상 (Desk)",
          item: "검은색 대리석 마우스패드",
          desc: "마우스 놓는 자리에 차가운 검정 돌(대리석) 소재를 활용하여 금생수(金生水)로 지혜로운 재테크 판단력을 극대화합니다."
        },
        livingroom: {
          space: "거실 (Living Room)",
          item: "스틸 프레임의 실버 액자",
          desc: "현관을 들어섰을 때 마주하는 벽면에 걸어두어 외부의 나쁜 액운을 금의 기운으로 쳐내고 평온을 유지합니다."
        }
      },
      daeunStrategy: "칼같이 차갑고 정확한 결정으로 단기 수익은 좋으나, 주변 사람들과의 이익 분배 과정에서 잡음이 생기면 큰 재물이 새어나갑니다. 나눌 몫을 명확히 명문화하고 기부 등 선행을 베풀어야 액운이 비껴갑니다."
    },
    수: {
      wealthType: "정보 비대칭 유통형 및 지적 라이선스 재물운",
      lifestyleIntro: "귀하는 다른 사람들이 알지 못하는 은밀한 정보나 깊이 있는 전문 지식을 가공하고 유통하여 중개 수수료나 로열티를 취득하는 유형입니다. 유통, 무역, 교육 컨설팅, 온라인 지식 콘텐츠 판매 등 흘러가는 물길처럼 경계가 없는 비즈니스에서 거부가 탄생합니다.",
      fengshui: {
        bedroom: {
          space: "침실 (Bedroom)",
          item: "순백의 백자 화병",
          desc: "머리맡에 금(金)의 기운을 담은 흰 도자기를 두어 맑은 수(水) 에너지가 마르지 않도록 끊임없이 생조(生助)해 줍니다."
        },
        desk: {
          space: "책상 (Desk)",
          item: "유리 재질의 모래시계",
          desc: "책상 정중앙에 두어 물 흐르듯 유연한 시간 관리 능력을 체화하고, 정보 가공 역량을 집중시킬 수 있게 돕습니다."
        },
        livingroom: {
          space: "거실 (Living Room)",
          item: "원형의 검은색 메탈 벽시계",
          desc: "거실 북쪽 벽면에 걸어두어 수(水) 기운의 본래 방위인 북방의 에너지를 활성화하고, 재물운의 파동을 널리 퍼뜨립니다."
        }
      },
      daeunStrategy: "기운이 너무 흘러 다니면 재물이 쌓이지 않고 모래알처럼 빠져나가기 쉽습니다. 대운의 길목에서는 반드시 등기 권리증이나 장기 적금 등 쉽게 현금화할 수 없는 단단한 문서 자산으로 잠가 두어야 안정적 말년이 보장됩니다."
    }
  };

  const selected = data[dayStemEl] || data["목"];

  return {
    title: "살아가는 방식 및 행운물 풍수 공간 처방",
    wealthType: selected.wealthType,
    lifestyleIntro: selected.lifestyleIntro,
    fengshui: selected.fengshui,
    daeunStrategy: selected.daeunStrategy
  };
};
