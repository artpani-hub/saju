"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Award, CheckSquare, AlertCircle } from "lucide-react";
import JobTable from "./components/JobTable";
import { getJobMatches } from "./utils";
import { getCumulativeCount } from "../../utils/counter";

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

          {/* 의뢰인님의 사주 명조 구성 상세 진단 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-[#A3845B] text-xs font-myeongjo">📝 {name}님의 사주팔자 명조 구성 요약</h4>
            <div className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
              의뢰인님의 사주는 <strong>{sajuInfo.year.stemEl}{sajuInfo.year.branchEl}의 해</strong>, 
              <strong>{sajuInfo.month.stemEl}{sajuInfo.month.branchEl}의 달</strong>, 
              <strong>{sajuInfo.day.stemEl}{sajuInfo.day.branchEl}의 날</strong>, 
              <strong>{sajuInfo.hour.stemEl}{sajuInfo.hour.branchEl}의 시간</strong>에 태어난 
              간지 조합으로 이루어져 있습니다.
              <br />
              이 명조의 핵심 주체는 일주의 천간인 <strong>'{sajuInfo.day.stem}'({sajuInfo.day.stemEl}의 기운)</strong>입니다. 
              {sajuInfo.day.stemEl === "목" ? (
                "위로 뻗어가는 목(木)의 강한 추진력과 생명력이 삶의 중심 원동력입니다. 기획이나 새로운 시작을 이끄는 역량이 강합니다."
              ) : sajuInfo.day.stemEl === "화" ? (
                "세상을 밝게 비추고 넓게 소통하는 화(火)의 열정이 중심 기운입니다. 나를 표현하고 남들과 어울리는 대외적 무대에 적합합니다."
              ) : sajuInfo.day.stemEl === "토" ? (
                "안정적으로 자원을 품고 조율하는 토(土)의 묵직한 중용과 신뢰가 중심 기운입니다. 중개하고 안정화하는 실력이 탁월합니다."
              ) : sajuInfo.day.stemEl === "금" ? (
                "비효율을 정리하고 칼같이 결단하는 금(金)의 기상이 중심 기운입니다. 통제하고 정확하게 결과를 내는 역할에 탁월합니다."
              ) : (
                "깊이 사고하고 흘러가며 지혜를 전달하는 수(水)의 유연함이 중심 기운입니다. 후방에서 전략을 수립하고 통찰을 발휘하기 좋습니다."
              )}
              <br />
              또한 태어난 계절의 기운(월지)인 <strong>{sajuInfo.month.branch} ({sajuInfo.month.branchEl}의 계절)</strong>의 속성을 강하게 수혈받아, 삶의 직업적 환경에서 {sajuInfo.month.branchEl === "목" ? "교육, 창조, 기획" : sajuInfo.month.branchEl === "화" ? "트렌드, IT, 미디어, 표현" : sajuInfo.month.branchEl === "토" ? "중개, 중용, 인프라, 부동산" : sajuInfo.month.branchEl === "금" ? "재무, 기술, 정밀 분석, 결단" : "연구, 전략, 정보 다루기, 심리"} 관련 역량을 발휘하는 데 매우 최적화되어 있습니다.
            </div>
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

    case "elements": {
      // 5개 오행 개수 계산
      const woodCount = sajuInfo.elements.목 || 0;
      const fireCount = sajuInfo.elements.화 || 0;
      const earthCount = sajuInfo.elements.토 || 0;
      const metalCount = sajuInfo.elements.금 || 0;
      const waterCount = sajuInfo.elements.수 || 0;
      const totalEl = woodCount + fireCount + earthCount + metalCount + waterCount || 8;

      // 5개 오행 좌표 (펜타곤 상생 다이어그램용)
      // 중심 (100, 100), 반지름 60
      const getPentagonPoints = () => {
        const angles = [0, 72, 144, 216, 288];
        return angles.map(angle => {
          const rad = (angle - 90) * Math.PI / 180;
          return {
            x: 100 + 60 * Math.cos(rad),
            y: 100 + 60 * Math.sin(rad)
          };
        });
      };
      
      const pts = getPentagonPoints();

      // 결핍/과다에 따른 행운 가이드 처방
      const elementsList = [
        { name: "목", count: woodCount, text: "푸른 나무 (木)", color: "#5F7A68", bg: "bg-[#5F7A68]/10", border: "border-[#5F7A68]/30", num: "3, 8", dir: "동쪽", item: "원목 인테리어 소품, 반려식물 화분", colorDesc: "초록색, 에메랄드" },
        { name: "화", count: fireCount, text: "붉은 불꽃 (火)", color: "#DC2626", bg: "bg-red-50", border: "border-red-200", num: "2, 7", dir: "남쪽", item: "향초, 조명 인프라, 붉은색 포인트 액세서리", colorDesc: "오렌지, 핑크, 레드" },
        { name: "토", count: earthCount, text: "황색 대지 (土)", color: "#A3845B", bg: "bg-[#A3845B]/10", border: "border-[#A3845B]/30", num: "5, 10", dir: "중앙", item: "도자기 그릇, 돌/원석 반지", colorDesc: "황토색, 베이지, 브라운" },
        { name: "금", count: metalCount, text: "하얀 바위 (金)", color: "#9CA3AF", bg: "bg-gray-50", border: "border-gray-200", num: "4, 9", dir: "서쪽", item: "은반지, 메탈 시계, 정밀 필기구", colorDesc: "화이트, 실버, 메탈" },
        { name: "수", count: waterCount, text: "검은 물결 (水)", color: "#1F2937", bg: "bg-gray-100", border: "border-gray-300", num: "1, 6", dir: "북쪽", item: "가습기, 실내 분수, 투명한 유리컵", colorDesc: "검은색, 네이비" }
      ];

      // 정렬하여 개수가 가장 적은 오행(결핍) 찾기
      const sortedByCount = [...elementsList].sort((a, b) => a.count - b.count);
      const deficientEl = sortedByCount[0];

      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📊 오행(五행) 에너지 분포 분석
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주는 목(나무), 화(불), 토(흙), 금(쇠), 수(물) 5가지 자연 에너지를 상징하는 <strong>'오행'</strong>의 비율로 해석됩니다. 오행의 균형은 삶의 크고 작은 굴곡을 조절하는 뼈대가 되며, 내 사주에 부족하거나 너무 과한 에너지를 파악하여 일상(색상, 숫자, 환경 등)에서 의식적으로 보완해 나갈 때 극적인 운의 개화와 자산 형성이 찾아옵니다.
          </p>

          {/* 프리미엄 시각화 1: 오행 상생상극 순환 SVG 펜타곤 */}
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
            <span className="font-bold text-xs text-[#8A6F4C] mb-4">🌀 내 사주 오행 상생상극(相生相剋) 순환 구조</span>
            <div className="relative w-[210px] h-[210px] flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-[180px] h-[180px]">
                {/* 상극 별 모양 선 */}
                <path d={`M ${pts[0].x} ${pts[0].y} L ${pts[2].x} ${pts[2].y} L ${pts[4].x} ${pts[4].y} L ${pts[1].x} ${pts[1].y} L ${pts[3].x} ${pts[3].y} Z`} fill="none" stroke="#E2DDD5" strokeWidth="1.5" strokeDasharray="3,3" />
                {/* 상생 외부 오각형 선 */}
                <polygon points={`${pts[0].x},${pts[0].y} ${pts[1].x},${pts[1].y} ${pts[2].x},${pts[2].y} ${pts[3].x},${pts[3].y} ${pts[4].x},${pts[4].y}`} fill="none" stroke="#A3845B" strokeWidth="1.5" opacity="0.4" />
                
                {/* 각 꼭짓점 오행 노드 */}
                {elementsList.map((item, idx) => {
                  const pt = pts[idx];
                  const percentage = (item.count / totalEl * 100).toFixed(0);
                  const circleSize = 18 + item.count * 3;
                  return (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r={circleSize} fill={item.color} opacity="0.9" />
                      <circle cx={pt.x} cy={pt.y} r={circleSize + 3} fill="none" stroke={item.color} strokeWidth="1" opacity="0.4" />
                      <text x={pt.x} y={pt.y - 1} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">{item.name}</text>
                      <text x={pt.x} y={pt.y + 8} textAnchor="middle" fill="#FFFFFF" fontSize="7" opacity="0.9">{percentage}%</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[10px] text-gray-500 font-light text-center mt-3">
              * 노드의 지름은 내 사주 원국에서 해당 오행이 차지하는 개수와 세기에 비례합니다.
            </p>
          </div>

          <div className="space-y-3 bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm">
            {elementsList.map((item) => {
              const percentage = (item.count / totalEl) * 100;
              return (
                <div key={item.name} className="flex items-center gap-3 text-xs">
                  <span className={`w-16 text-center py-1 rounded font-bold text-[11px] ${getElementColor(item.name)}`}>
                    {item.name} ({item.count}개)
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${getElementBarColor(item.name)}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-10 text-right font-semibold text-[#5F5F5F]">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>

          {/* 프리미엄 시각화 2: 2026년 오행 럭키 플레이트 */}
          <div className={`border ${deficientEl.border} ${deficientEl.bg} rounded-xl p-5 space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧭</span>
              <div>
                <span className="text-[10px] text-[#8A6F4C] font-bold block">결핍 오행 보강 처방</span>
                <span className="font-myeongjo text-sm font-bold text-gray-800">귀하의 수호 오행: {deficientEl.text}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-light text-justify">
              귀하의 사주 원국에서 가장 기운이 약한 오행은 <strong>{deficientEl.text}</strong>({deficientEl.count}자)입니다. 2026년 병오년의 타오르는 불 기운 속에 밸런스를 잡기 위해서는 이 부족한 기운을 일상에서 다음과 같이 의식적으로 수혈해 주셔야 합니다.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-medium text-gray-700 pt-1">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🎨 행운의 색상</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.colorDesc} 계열</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🔢 행운의 숫자</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.num}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🗺️ 행운의 방위</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.dir} (생활/공부 공간 기점)</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">💍 럭키 아이템</span>
                <span className="font-bold text-[#1A1A1A] truncate block">{deficientEl.item}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2 leading-relaxed font-traditional font-light text-gray-700">
            <h4 className="font-bold text-[#A3845B]">💡 오행 에너지 종합 총평</h4>
            <p className="text-[#2C2C2C] font-light whitespace-pre-line">
              {personalizedText.analysis}
            </p>
          </div>
        </div>
      );
    }

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

    case "metrics_chart": {
      const chartItems = [
        { label: "독립성 (Independence)", val: metrics.scores.independence, color: "bg-emerald-600", stroke: "#059669" },
        { label: "승부욕 (Competitiveness)", val: metrics.scores.competitiveness, color: "bg-red-600", stroke: "#DC2626" },
        { label: "기회포착 (Opportunity)", val: metrics.scores.opportunity, color: "bg-blue-600", stroke: "#2563EB" },
        { label: "사업감각 (Business Sense)", val: metrics.scores.business, color: "bg-amber-600", stroke: "#D97706" },
        { label: "통찰력 (Insight)", val: metrics.scores.insight, color: "bg-purple-600", stroke: "#7C3AED" },
        { label: "추진력 (Drive)", val: metrics.scores.drive, color: "bg-indigo-600", stroke: "#4F46E5" },
        { label: "인내력 (Patience)", val: metrics.scores.patience, color: "bg-teal-600", stroke: "#0D9488" },
        { label: "대인협상 (Negotiation)", val: metrics.scores.negotiation, color: "bg-pink-600", stroke: "#DB2777" }
      ];

      // 방사형 레이더 차트 다이어그램용 좌표 계산 (중심 100, 100, 최대 반지름 70)
      const radarPoints = chartItems.map((item, idx) => {
        const angle = idx * 45;
        const rad = (angle - 90) * Math.PI / 180;
        const radius = (item.val / 100) * 65;
        return {
          x: 100 + radius * Math.cos(rad),
          y: 100 + radius * Math.sin(rad)
        };
      });

      const radarPointsStr = radarPoints.map(p => `${p.x},${p.y}`).join(" ");

      const getGuidePoints = (ratio) => {
        const radius = ratio * 65;
        return chartItems.map((_, idx) => {
          const angle = idx * 45;
          const rad = (angle - 90) * Math.PI / 180;
          return `${100 + radius * Math.cos(rad)},${100 + radius * Math.sin(rad)}`;
        }).join(" ");
      };

      const topTalents = [...chartItems]
        .sort((a, b) => b.val - a.val)
        .slice(0, 3);

      const talentIcons = {
        "독립성 (Independence)": "🌱 자립",
        "승부욕 (Competitiveness)": "🔥 극복",
        "기회포착 (Opportunity)": "🎯 포착",
        "사업감각 (Business Sense)": "💼 설계",
        "통찰력 (Insight)": "👁️ 통찰",
        "추진력 (Drive)": "⚡ 실행",
        "인내력 (Patience)": "🛡️ 인내",
        "대인협상 (Negotiation)": "🤝 협상"
      };

      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📈 사주 8대 성향 수치표
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주에 담긴 잠재력을 현대 사회에서 가장 직관적으로 이해할 수 있는 <strong>8가지 성향 지표(능력치)</strong>로 수치화한 것입니다. 내가 직장이나 사업, 대인관계에서 발휘하는 숨은 지능지수(IQ) 및 감성지수(EQ)의 강도를 뜻합니다.
          </p>

          {/* 프리미엄 시각화 1: 커스텀 SVG 방사형 레이더 차트 */}
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
            <span className="font-bold text-xs text-[#8A6F4C] mb-4">🕸️ 내 사주 성향 오행 밸런스 레이더 맵</span>
            <div className="relative w-[210px] h-[210px] flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-[190px] h-[190px]">
                <polygon points={getGuidePoints(1.0)} fill="none" stroke="#F3F4F6" strokeWidth="1" />
                <polygon points={getGuidePoints(0.75)} fill="none" stroke="#E5E7EB" strokeWidth="1" />
                <polygon points={getGuidePoints(0.5)} fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,2" />
                <polygon points={getGuidePoints(0.25)} fill="none" stroke="#F3F4F6" strokeWidth="1" />

                {chartItems.map((_, idx) => {
                  const angle = idx * 45;
                  const rad = (angle - 90) * Math.PI / 180;
                  return (
                    <line key={idx} x1="100" y1="100" x2={100 + 65 * Math.cos(rad)} y2={100 + 65 * Math.sin(rad)} stroke="#E5E7EB" strokeWidth="1" />
                  );
                })}

                <polygon points={radarPointsStr} fill="rgba(163, 132, 91, 0.25)" stroke="#A3845B" strokeWidth="2" />

                {radarPoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3" fill={chartItems[idx].stroke} stroke="#FFFFFF" strokeWidth="1" />
                ))}

                {chartItems.map((item, idx) => {
                  const angle = idx * 45;
                  const rad = (angle - 90) * Math.PI / 180;
                  const labelRadius = 78;
                  const x = 100 + labelRadius * Math.cos(rad);
                  const y = 100 + labelRadius * Math.sin(rad) + 3;
                  const anchor = Math.abs(x - 100) < 10 ? "middle" : x > 100 ? "start" : "end";
                  const labelName = item.label.split(" ")[0];
                  return (
                    <text key={idx} x={x} y={y} textAnchor={anchor} fontSize="7" fontWeight="bold" fill="#4B5563">{labelName}</text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 프리미엄 시각화 2: 3대 핵심 재능 보드 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
            <span className="font-bold text-xs text-[#8A6F4C] block">🏆 귀하의 사주 3대 핵심 기질 (Top Talents)</span>
            <div className="grid grid-cols-3 gap-2">
              {topTalents.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E2DDD5]/70 p-3 rounded-lg shadow-sm text-center space-y-1">
                  <span className="text-lg block">{talentIcons[item.label]}</span>
                  <span className="text-[10px] text-[#1A1A1A] font-bold block truncate">{item.label.split(" ")[0]}</span>
                  <span className="text-xs text-[#8B221E] font-bold block">{item.val}점</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 font-light text-justify pt-1 leading-relaxed">
              위 3가지 능력은 귀하의 사주 원국에서 식상생재 혹은 관인상생의 생조(生助) 기류를 직간접적으로 받아 가장 강력하게 깨어있는 달란트입니다. 직무 결단이나 투자 시 위 3대 무기를 주축으로 삼을 때 가장 승률이 높습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {chartItems.map((item, idx) => (
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
    }

      case "metrics_detail_1": {
      const indVal = metrics.scores.independence;
      const compVal = metrics.scores.competitiveness;
      
      const ratio = indVal / (indVal + compVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "주도적 성과 개척형";
      let synergyDesc = "독립적으로 일하면서도 성과 지표가 뚜렷한 환경에서 활약할 때 양쪽 시너지가 극대화됩니다. 남의 지시에 기대지 않으면서도 한계를 돌파하는 추진력이 장점입니다.";
      if (indVal > 80 && compVal > 80) {
        synergyTitle = "독보적 혁신가 (스타트업 창업가형)";
        synergyDesc = "매우 강한 자아와 집념이 융합되어 난공불락의 문제를 무조건 해결하려는 극강의 기질을 보입니다. 단, 주변과의 극단적인 독선 마찰을 강력하게 주의하셔야 합니다.";
      } else if (indVal > compVal + 15) {
        synergyTitle = "마이웨이 연구 / 전문가형";
        synergyDesc = "경쟁을 통한 승리보다는 나만의 속도로 독창적인 성과를 쌓아올릴 때 기운이 편안해집니다. 외부 간섭을 배제할 수 있는 권한을 얻는 것이 좋습니다.";
      } else if (compVal > indVal + 15) {
        synergyTitle = "성과추구형 전투 리더십";
        synergyDesc = "협업 및 팀워크를 통해서라도 공동의 적이나 뚜렷한 목표치를 격파해 나갈 때 열정이 폭발합니다. 경쟁이 활성화된 필드에 자신을 던져야 활발해집니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (독립성 / 승부욕)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              나를 상징하는 8가지 성향 중 자아의 핵심이 되는 독립성과 목표 달성의 불꽃인 승부욕을 명리론과 현대 행동 심리학 관점에서 종합적으로 분석한 심층 진단 보고서입니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 독립성 vs 승부욕 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>독립성 중심 ({indVal}점)</span>
                  <span>승부욕 중심 ({compVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={`${pointerPos},26 ${pointerPos - 6},15 ${pointerPos + 6},15`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>🌟 두 기질의 시너지 지향점:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-[#5F7A68]">
                    • 독립성 지표 ({indVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-[#5F7A68] bg-[#5F7A68]/10 px-2.5 py-0.5 rounded-full">주체적 개척</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 독립성 점수는 **{indVal}점**으로, 이는 타인의 원조에 기대지 않고 자신의 운명을 주도적으로 개척해 가려는 강인한 자립심과 자아 강도를 의미합니다. 사주 원국 내에 독립성을 관장하는 기운이 잘 조율되어 있어, 집단이나 조직의 획일화된 규칙에 무조건 순응하기보다는 본인이 직접 의사결정의 주체가 되어 주도적으로 판을 이끌어갈 때 지치지 않고 최고의 퍼포먼스를 발휘하게 됩니다. 역경 속에서도 흔들리지 않는 자수성가형 인물의 표본이라 할 수 있습니다. 다만, 자존심이 다소 강해 타인의 이성적이고 진심 어린 조언마저 귀찮은 간섭이나 침해로 오해하여 밀어내는 고집(독선)으로 발현될 수 있으니, 유연한 경청의 태도를 의식적으로 기르는 것이 개운의 핵심입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>독립성 극대화 가이드라인:</strong> 의존적인 협업 구도보다는 나만의 고유 권한이 확보된 R&D, 독자 프로젝트, 혹은 1인 전담 업무처럼 책임 소재가 명확한 포지션에서 업무 생산성이 수 배 이상 폭발합니다. 중대한 결정 시에는 신뢰할 수 있는 멘토들의 조언을 최소 2개 이상 비교 검증하는 프로세스를 거치십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-red-700">
                    • 승부욕 지표 ({compVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">성과 창출</span>
                </div>
                <p className={`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 승부욕 지표는 **{compVal}점**으로 매우 뜨겁고 활기찬 목표 지향적 본능을 보여줍니다. 단순히 남을 이기려는 심리적 지배욕을 넘어, 장애물을 만나거나 남들이 포기하는 한계 상황일 때 승부욕이 자극되어 오히려 성취 속도와 에너지가 강력하게 활성화됩니다. 불리한 조건 속에서도 상황을 반전시켜 기필코 목표를 쟁취해 내는 돌파력이 우수합니다. 하지만 이 뜨거운 에너지는 감정의 조급증이나 작은 패배에도 크게 흔들리는 급격한 감정 냉각을 야기할 수 있습니다. 겉으로는 과열된 승부 본능을 유지하되, 내적으로는 냉철한 페이스 조절을 통해 장기 레이스에서 방전되지 않도록 제어 장치를 심어야 합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>승부욕 극대화 가이드라인:</strong> 정량화된 실적 평가 시스템이 존재하거나 경쟁적 자극이 주어지는 환경에 자신을 배치하면 잠재능력이 120% 각성됩니다. 다만, 과열된 날카로움이 주변인과의 불필요한 마찰로 번지지 않도록 하루 일과 후 호흡을 가다듬는 휴식을 꼭 습관화하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

      case "metrics_detail_2": {
      const oppVal = metrics.scores.opportunity;
      const bizVal = metrics.scores.business;
      
      const ratio = oppVal / (oppVal + bizVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "현실적 투자 실리파";
      let synergyDesc = "투자처를 명확히 판별하고 사업적 위험 요소가 닥치기 전에 기민하게 빠져나오는 뛰어난 실리추구형입니다. 타이밍 선점 능력이 최대 무기입니다.";
      if (oppVal > 80 && bizVal > 80) {
        synergyTitle = "자산 가치 극대화 설계자";
        synergyDesc = "부가가치를 창출하는 비즈니스 안목과 그것을 현금화하는 투자 판단력이 결합하여 금융 자산 및 실물 자산을 극적으로 굴려나갈 융합형 인재입니다.";
      } else if (oppVal > bizVal + 15) {
        synergyTitle = "트렌드 리스크 테이커";
        synergyDesc = "새로운 아이템이나 흐름이 왔을 때 가장 먼저 올라타는 얼리어답터형 투자 성향입니다. 단, 사기나 장기 보유 시 손실 리스크를 분산하십시오.";
      } else if (bizVal > oppVal + 15) {
        synergyTitle = "보수적 시스템 빌더";
        synergyDesc = "빠른 단기 마진보다는 장기적이고 견고한 오프라인/온라인 시스템 수익을 설계하려는 경향입니다. 느리지만 매우 안정적인 자산 형성을 지향합니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (기회포착 / 사업감각)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              내 운명의 재물적 흐름을 관장하는 기회포착 능력과 시장의 부가가치를 창출해내는 사업적 본능을 다각도로 분석하여 실제 자산 축적에 적용 가능한 전략적 해설을 담았습니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 기회포착 vs 사업감각 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>기회포착 중심 ({oppVal}점)</span>
                  <span>사업감각 중심 ({bizVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-600 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={`${pointerPos},26 ${pointerPos - 6},15 ${pointerPos + 6},15`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>💼 두 기질의 자산 운용 방식:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed font-traditional text-gray-700">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-blue-700">
                    • 기회포착 지표 ({oppVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">직관적 안목</span>
                </div>
                <p className={`font-light text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 기회포착 지표는 **{oppVal}점**입니다. 이는 외부 시장의 트렌드 변화나 흐름 속에서 유무형의 가치와 기회를 남들보다 빠르게 인지해 내는 직관력과 안목의 강도를 의미합니다. 이 기운이 발달한 사람은 계약 구조상의 빈틈, 유망한 투자처, 혹은 사업적 제휴 관계에서 본인에게 유리한 결정적인 타이밍을 기막히게 맞추는 동물적 본능을 소유하고 있습니다. 위기를 기회로 치환하는 센스가 대단히 뛰어난 사주입니다. 다만, 단기적인 타이밍 싸움에만 몰두하면 거시적인 큰 판의 흐름을 놓칠 수 있으므로 성급한 진입보다는 관망과 검증을 병행하는 호흡의 정돈이 요구됩니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>기회포착 극대화 가이드라인:</strong> 시장 동향을 선점해야 하는 신규 기획, 트렌드 분석가, 투자 파트너십 조율 직무에서 활약할 때 이익을 최대화합니다. 결정을 내리기 직전, 단순한 본인의 촉에만 의존하기보다는 객관적 통계 데이터 검증 과정을 거쳐 기회포착의 정밀도를 200% 보강하십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-amber-700">
                    • 사업감각 지표 ({bizVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">시스템 설계</span>
                </div>
                <p className={`font-light text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 사업감각 지표는 **{bizVal}점**을 기록하고 있습니다. 이는 정해진 월급 체계의 안정적 울타리에 안주하기보다는, 유동적인 자본의 흐름을 설계하고 자원과 인력을 구조화하여 새로운 수익을 창출하려는 시스템 구축 본능입니다. 플랫폼 비즈니스나 중간 유통, 기술의 상용화 등 시장의 부가가치 구조를 머릿속으로 시뮬레이션하는 능력이 남다릅니다. 설령 지금 직장생활을 하고 계시더라도 마음 깊은 곳에서는 언제든 자신의 브랜드를 내걸고 독자적인 사업체를 경영하고 싶어 하는 불씨가 항상 불타고 있습니다. 다만 세밀한 재무 설계와 내실 관리 없이 확장성만 쫓아가면 유동성 위기를 맞이할 수 있으니 튼튼한 기초 체력이 우선입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>사업감각 극대화 가이드라인:</strong> 나의 직접적인 육체적 노동력 투입을 배제하더라도 수익이 순환하도록 만드는 무형 자산(지적 재산권, 자동화 중개 시스템, 대리인 체제 등) 구축에 흥미를 가지고 체계적인 비즈니스 구조를 중점 설계해 나가야 합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

      case "metrics_detail_3": {
      const driVal = metrics.scores.drive;
      const patVal = metrics.scores.patience;
      
      const ratio = driVal / (driVal + patVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "속도 조절형 실행가";
      let synergyDesc = "상황에 따라 빠르게 달리는 추진력과 필요한 때 견뎌내는 인내력이 잘 조화되어 있습니다. 다만 추진 시점과 인내 시점을 혼동하여 생기는 비효율을 줄여야 합니다.";
      if (driVal > 80 && patVal > 80) {
        synergyTitle = "불도저형 대기만성 리더";
        synergyDesc = "매우 과감하게 계획을 밀고 나가면서도 아무리 모진 시련이 와도 포기하지 않고 견디는 철옹성 같은 결합입니다. 궁극적인 자수성가형 사업가 자질입니다.";
      } else if (driVal > patVal + 15) {
        synergyTitle = "기동형 프런티어";
        synergyDesc = "장기적인 수비보다는 빠르게 판을 벌리고 영역을 확장하는 기획 실행에 압도적인 강점을 보입니다. 지지부진한 관리 단계는 타인에게 양도하는 것이 이롭습니다.";
      } else if (patVal > driVal + 15) {
        synergyTitle = "장기 내실 수비대장";
        synergyDesc = "성급하게 판을 키워 위험을 초래하기보다는 돌다리도 두들겨 보고 건너며 리스크가 완전히 소거될 때까지 우직하게 대기하는 장기 전략가형입니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (추진력 / 인내력)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              행동의 속도를 조절하는 돌파구인 추진력과 난관을 견뎌내어 마침내 결실을 얻어내는 우직한 인내력의 조화를 상세 진단합니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 추진력 vs 인내력 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>추진력 중심 ({driVal}점)</span>
                  <span>인내력 중심 ({patVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-teal-500 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={`${pointerPos},26 ${pointerPos - 6},15 ${pointerPos + 6},15`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>🏃 두 기질의 결합 속도:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed font-traditional text-gray-700">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-indigo-700">
                    • 추진력 지표 ({driVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">과감한 실행</span>
                </div>
                <p className={`font-light text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 추진력 지표는 **{driVal}점**으로, 계획한 바를 즉각적이고 과감한 행동력으로 변환하는 리더십의 세기와 관계가 깊습니다. 머뭇거리는 모호함을 싫어하며 일단 부딪쳐 가며 문제점을 실시간으로 교정해 나가는 과감함이 특징입니다. 침체된 조직의 분위기를 쇄신하거나 완전히 새로운 영역의 프로젝트를 선두 지휘할 때 빛을 발하는 개척의 아이콘이 됩니다. 다만, 정밀한 사전 검토가 생략된 지나친 과속은 불필요한 비용 낭비나 예기치 않은 위험을 초래할 수 있으니 속도 조율이 필요합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>추진력 극대화 가이드라인:</strong> 초기 스타트업 단계나, 시장이 급변하여 빠른 판단력과 과감한 실행이 생명인 기동 타격대 성격의 환경에서 가치가 무한히 확장됩니다. 결정을 내린 직후 최종 실행 개시 전에 리스크를 방어할 수 있는 신중한 기획자나 장치를 곁에 두십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-teal-700">
                    • 인내력 지표 ({patVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">대기만성</span>
                </div>
                <p className={`font-light text-justify leading-relaxed text-[#2C2C2C] ${blurClass}`}>
                  귀하의 인내력 지표는 **{patVal}점**으로, 이는 거센 시련과 방해 요소 속에서도 목표를 포기하지 않고 우직하게 밀고 나가는 지속성과 뚝심의 크기입니다. 세상의 빠른 유행 변화에 일희일비하여 방향을 바꾸지 않으며, 시간이 지날수록 본인의 진가를 더해가는 전형적인 대기만성형 자산 형성 사주의 버팀목입니다. 주변인들에게 신뢰감을 심어주는 뿌리 깊은 나무와 같습니다. 그러나 흐름이 다하여 정리해야 할 타이밍에도 단순한 자존심이나 집착으로 일을 무작정 붙잡고 있는 아집을 반드시 경계해야 실속을 챙깁니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>인내력 극대화 가이드라인:</strong> 중장기 연구 개발, 정교한 라이선스 취득을 필요로 하는 전문 자격 영역, 혹은 부동산 및 주식 장기 가치 투자가 필요한 구조에서 결국 압도적인 결실을 거두게 됩니다. 사업이나 투자 전 최악의 한계선(손절 라인)을 설정해 고집으로 인한 낭비를 예방하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

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
    }case "job_aptitude": {
      const jobMatches = getJobMatches(metrics, sajuInfo.elements);
      const topMatches = jobMatches.slice(0, 4);

      const elementAptitudeMap = {
        "목": {
          temperament: "새로운 시작을 주도하는 추진력과 기획력이 뛰어납니다. 남들이 보지 못하는 가능성을 발굴하여 키워내는 성장을 지향하며, 교육적 성향과 선한 영향력을 중시하는 기질이 강합니다.",
          strategy: "기획자, 크리에이티브 디렉터, 교육 및 인재 육성, 바이오·친환경 산업 분야로 진출하는 것이 유리합니다. 수동적인 루틴 업무에 갇히기보다는 주도권을 쥐고 창의적인 씨앗을 뿌릴 수 있는 환경에서 큰 성공을 거둡니다."
        },
        "화": {
          temperament: "뜨거운 열정과 뛰어난 표현력, 사람들을 집중시키는 에너지를 지녔습니다. 자신을 대외적으로 드러내고 트렌드를 선도하며, 직관적인 커뮤니케이션에 특화된 기질이 있습니다.",
          strategy: "마케팅, 방송·미디어 콘텐츠 크리에이터, IT 개발 및 서비스 기획, 스타트업 창업, 홍보 분야가 최적입니다. 본인의 영향력을 브랜드화하거나 화려하게 가치를 입증할 수 있는 무대 중심의 비즈니스로 성공 방향을 잡으십시오."
        },
        "토": {
          temperament: "안정감과 신뢰도, 뛰어난 중개력 및 수렴 능력을 가졌습니다. 모험적인 투기보다 묵직하게 사람들과 자원을 이어주고, 안정적으로 조율하는 신용가 기질이 돋보입니다.",
          strategy: "부동산 기획/중개, 자산 자문, 교육 행정, 대형 플랫폼의 중개 서비스, 공공 인프라 관리 분야에서 대성합니다. 조급하게 성과를 내려 하기보다 오랜 기간 공신력을 쌓을 수 있는 시스템을 구축하는 방향이 성공 지름길입니다."
        },
        "금": {
          temperament: "냉철한 판단력과 날카로운 실행력, 공사 구분이 확실한 결단력을 지녔습니다. 비효율을 참지 못하고 정교하고 정밀하게 프로세스를 통제하거나 평가하는 성향이 강합니다.",
          strategy: "재무/회계 분석가, 법률·세무 상담사, 정밀 기술 연구, 컨설팅 전문가, 공적인 규격 관리 분야로 진출하십시오. 본인의 예리한 전문성으로 리스크를 통제하고 결과를 딱 떨어지게 만드는 결단성 있는 직무가 직업운의 성공 방향입니다."
        },
        "수": {
          temperament: "깊은 지혜와 뛰어난 정보 수집력, 유연하게 판세를 읽는 통찰력을 소유했습니다. 보이지 않는 전략을 기획하고 문제를 깊이 파고들어 본질적인 해답을 찾아내는 전략가 기질이 풍부합니다.",
          strategy: "데이터 사이언티스트, 시장 전략 애널리스트, R&D 심층 연구원, 전문 상담사, 글로벌 무역/외교 분야가 길합니다. 겉으로 드러나는 전선보다는 후방에서 빅데이터를 다루거나 큰 흐름의 설계를 주도하는 방향이 운을 틔웁니다."
        }
      };

      const dayStemEl = sajuInfo?.day?.stemEl || "목";
      const aptInfo = elementAptitudeMap[dayStemEl] || elementAptitudeMap["목"];

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

          {/* 사주 매칭 최적 직업 테이블 */}
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-4">
            <JobTable matches={topMatches} />
          </div>

          {/* 기질 및 직업운 성공 전략 가이드 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-4">
            <div>
              <span className="font-bold text-[#A3845B] block mb-1.5 flex items-center gap-1.5 text-xs">
                🧠 나의 타고난 핵심 직업 기질 (어떤 기질이 있는가?)
              </span>
              <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                의뢰인님의 일간 기운은 <strong>{sajuInfo?.day?.stemEl}({sajuInfo?.day?.stem})</strong>에 기반하고 있습니다. 
                이 사주적 특징에 비추어 볼 때, {aptInfo.temperament}
              </p>
            </div>
            <div className="border-t border-[#E2DDD5]/70 pt-3">
              <span className="font-bold text-[#5F7A68] block mb-1.5 flex items-center gap-1.5 text-xs">
                🔑 직업운 성공 전략 (어느 쪽으로 방향을 잡아야 성공하는가?)
              </span>
              <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                성공적인 직업운을 열기 위해서는 <strong>{aptInfo.strategy}</strong>
              </p>
            </div>
          </div>
        </div>
      );
    }

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

          {/* 병오년 총운 및 성공 액션 가이드 추가 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
            <div>
              <span className="font-bold text-[#A3845B] block mb-1 text-xs">📊 2026년 병오년 총운 및 핵심 키워드</span>
              <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                올해의 핵심 키워드는 <strong>"천지합화(天地合化), 열정의 분출, 관계의 변곡점, 과열 경계"</strong>입니다. 내면의 아이디어가 세상 밖으로 분출되는 매우 동적이고 활기찬 기운이 들어옵니다. 무언가 새로운 것을 창조하거나 적극적으로 어필하기에 좋은 시기이지만, 브레이크가 약한 엔진처럼 과속하여 리스크를 초래할 수 있으니 완급 조절을 최우선 삼으십시오.
              </p>
            </div>
            <div className="border-t border-[#E2DDD5]/70 pt-2.5">
              <span className="font-bold text-[#5F7A68] block mb-1 text-xs">🔑 성공적인 한 해를 위한 3대 개운(開運) 플랜</span>
              <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                ① <strong>의사결정의 이성적 감속</strong>: 기획력과 의욕이 넘쳐 성급한 이직이나 신규 투자를 감행하기 쉽습니다. 중요한 계약은 최소 일주일의 냉각기를 가진 후 최종 결론을 내리십시오.<br />
                ② <strong>대인관계 구설수 원천 차단</strong>: 욱하는 뜨거운 열기가 말실수나 다툼으로 번질 수 있습니다. 의견 대립 시 10초간 침묵하는 습관으로 인덕(人德)의 손상을 예방하십시오.<br />
                ③ <strong>수(水) 기운을 통한 마인드 컨트롤</strong>: 병오년의 지나친 화(火) 기운을 다스리기 위해 차분한 독서, 물가로의 여행, 야간 명상 등을 통해 차갑고 깊은 수(水) 에너지를 의식적으로 일상에 채워 넣으십시오.
              </p>
            </div>
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
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
              <strong className="text-[#8B221E] block">• 제 3기 대운 (35세 ~ 44세) : 인생 최대의 재물 폭발기 (용신 유입)</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                그동안 축적했던 기획력과 실력이 하나의 커다란 플랫폼/사업체/부동산으로 폭발하여 고도의 자산 가치 형성을 보장받습니다. 
              </p>
              <div className="border-t border-[#E2DDD5]/60 pt-2 space-y-1.5 text-[11px] text-[#666]">
                <p>🎯 <strong>핵심 행동 가이드:</strong> 사주 내 용신 기운이 지탱하는 황금기입니다. 과감히 자기 브랜드를 론칭하거나 주도권을 쥔 비즈니스 확장을 시도하십시오. 단, 자금은 반드시 장기 부동산이나 문서 자산에 묶어 두어야 합니다.</p>
                <p>⚠️ <strong>주의사항:</strong> 급격한 성장 속에서 만성 피로와 심혈관 과부하를 겪기 쉬우니 건강 조율이 필수적이며, 동업 계약이나 수익 분배는 반드시 서류로 철저히 서명해 두어야 뒤탈이 없습니다.</p>
              </div>
            </div>
            
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
              <strong className="text-[#A3845B] block">• 제 4기 대운 (45세 ~ 54세) : 안락한 자산 보존과 명예 완성</strong>
              <p className="text-[#5F5F5F] font-light leading-relaxed">
                무리한 실무에서 한 발짝 물러서서 조력자, 고문, 수동적 임대/시스템 소득을 정비하고 가정을 따뜻하게 보살펴 평화로운 귀인의 삶을 향유하게 되는 안정적인 종착지입니다.
              </p>
              <div className="border-t border-[#E2DDD5]/60 pt-2 space-y-1.5 text-[11px] text-[#666]">
                <p>🎯 <strong>핵심 행동 가이드:</strong> 이 시기의 성공 공식은 '공격'이 아니라 '수성'입니다. 직접 발로 뛰는 노동 소득을 점차 줄이고 임대료, 라이선스, 지분 배당 등 시스템 소득(수동적 소득)의 구축에 주력하십시오.</p>
                <p>⚠️ <strong>주의사항:</strong> 50대를 목전에 둔 시점에서의 무리한 투기성 모험이나 낯선 프랜차이즈 대형 창업은 평생 모은 재산을 한순간에 위태롭게 하니 수성적 자산 방어 태세를 유지해야 합니다.</p>
              </div>
            </div>

            {/* 중장년 대운 터닝포인트 종합 처방 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
              <div>
                <span className="font-bold text-[#A3845B] block mb-1 text-xs">💡 중장년 대운(35세~54세) 터닝포인트 종합 진단</span>
                <p className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
                  귀하의 인생 궤도에서 35세부터 54세까지의 20년은 **'성장의 결실과 자산 수성'**으로 이어지는 가장 중요한 황금 터닝포인트입니다. 30대 후반부터 40대 초반까지의 강력한 폭발력을 동력 삼아 부를 축적하고, 40대 후반부터는 이를 시스템 소득으로 정착시키는 2단계 자산 빌드업 전략이 일생의 부를 결정짓는 핵심 키입니다.
                </p>
              </div>
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
  // Cubic Bezier를 사용하여 SVG 캔버스 범위(0~250) 내에서 절대 위아래가 짤리지 않게 명시적으로 제어
  let dPath = "M 10 160 C 70 160, 140 100, 210 90 C 280 80, 280 180, 350 170 C 420 160, 420 50, 490 50 C 560 50, 560 210, 630 200 C 660 195, 680 120, 700 120";
  if (baseEl === "목") dPath = "M 10 180 C 70 180, 140 100, 210 90 C 280 80, 280 190, 350 180 C 420 170, 420 50, 490 50 C 560 50, 560 220, 630 210 C 660 205, 680 140, 700 140";
  else if (baseEl === "화") dPath = "M 10 150 C 70 150, 140 90, 210 90 C 280 90, 280 210, 350 200 C 420 190, 420 50, 490 50 C 560 50, 560 180, 630 170 C 660 165, 680 100, 700 100";
  else if (baseEl === "토") dPath = "M 10 190 C 70 190, 140 110, 210 90 C 280 70, 280 170, 350 160 C 420 150, 420 50, 490 50 C 560 50, 560 200, 630 190 C 660 185, 680 130, 700 130";
  else if (baseEl === "금") dPath = "M 10 170 C 70 170, 140 100, 210 90 C 280 80, 280 200, 350 190 C 420 180, 420 50, 490 50 C 560 50, 560 190, 630 180 C 660 175, 680 110, 700 110";

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
  const [cumulativeCount, setCumulativeCount] = useState(14820);

  useEffect(() => {
    setCumulativeCount(getCumulativeCount());
    
    const timer = setInterval(() => {
      setCumulativeCount(getCumulativeCount());
    }, 30000);
    
    return () => clearInterval(timer);
  }, []);
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
  const genderVal = searchParams.get("gender");
  const gender = (genderVal === "male" || genderVal === "남" || genderVal === "남성") ? "남성" : "여성";
  const typeParam = searchParams.get("type") || "saju"; // saju, newyear, tojeong, wealth, tarot, gunghap
  const type = typeParam === "tojeong" ? "newyear" : typeParam;
  const calendar = searchParams.get("calendar") || "solar";
  const year = parseInt(searchParams.get("year")) || 1995;
  const month = parseInt(searchParams.get("month")) || 8;
  const day = parseInt(searchParams.get("day")) || 25;
  const hour = searchParams.get("hour") || "10:00";
  const worryCategory = searchParams.get("worryCategory") || "general";
  const worryText = searchParams.get("worryText") || "";
  const reportGrade = searchParams.get("reportGrade") || "premium"; // premium(고급), deep(심화)
  const currentGrade = reportGrade;

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
  const metrics = getCharacterMetrics(sajuInfo);
  const isFree = reportGrade === "free" && !isPaid;

  // Determine user's base element for 2026 compatibility (일간 오행 기준)
  const baseEl = sajuInfo.day.stemEl; // Representing birth day element (일간)



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

  const handleUpgradeFromSms = (grade, amount) => {
    if (typeof window === "undefined") return;

    const updateLocalStorageOrderGrade = (targetGrade) => {
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
            orders[matchedIdx].reportGrade = targetGrade;
            if (typeParam === "tojeong") {
              orders[matchedIdx].productName = "정통 토정비결";
            }
            localStorage.setItem("hyeandang_orders", JSON.stringify(orders));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const performUpgrade = () => {
      updateLocalStorageOrderGrade(grade);
      setIsPaid(true);
      
      const url = new URL(window.location.href);
      url.searchParams.set("reportGrade", grade);
      window.location.href = url.toString();
    };

    const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE || "imp00000000";
    const pgCode = process.env.NEXT_PUBLIC_PORTONE_PG || "html5_inicis";

    // 테스트 가맹점 코드이면 IMP 모듈 없이도 모의 결제 진행
    if (impCode === "imp00000000") {
      alert(`[개발자 테스트 안내] 모의 업그레이드 결제를 즉시 실행합니다.\n\n확인을 누르시면 ${grade === "premium" ? "고급" : "프리미엄"} 리포트로 업그레이드됩니다.`);
      performUpgrade();
      return;
    }

    if (!window.IMP) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 인터넷 연결을 확인하시거나, 브라우저의 광고 차단 확장 프로그램(AdBlock 등)이 활성화되어 있다면 해제한 후 새로고침(F5)을 해주세요.");
      return;
    }

    try {
      const IMP = window.IMP;
      IMP.init(impCode);

      IMP.request_pay({
        pg: pgCode,
        pay_method: "card",
        merchant_uid: `merchant_${new Date().getTime()}`,
        name: `${name}님 ${typeParam === "tojeong" ? "토정비결" : "신수비결"} ${grade === "premium" ? "고급" : "프리미엄"} 업그레이드`,
        amount: amount,
        buyer_name: name,
      }, function (rsp) {
        if (rsp.success) {
          setIsProcessing(true);
          setProgress(0);
          
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                setIsProcessing(false);
                performUpgrade();
              }, 300);
            } else {
              setProgress(currentProgress);
            }
          }, 150);
        } else {
          alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
        }
      });
    } catch (err) {
      alert(`결제 모듈 실행 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handlePortonePayment = () => {
    if (typeof window === "undefined") return;

    const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE || "imp00000000";
    const pgCode = process.env.NEXT_PUBLIC_PORTONE_PG || "html5_inicis";

    // 테스트 가맹점 코드이면 IMP 모듈 없이도 모의 결제 진행
    if (impCode === "imp00000000") {
      alert("[개발자 테스트 안내] 모의 결제를 즉시 실행합니다.\n\n확인을 누르시면 결제완료 처리되고 상세 보고서 잠금이 풀립니다.");
      setIsPaid(true);
      updateLocalStorageOrderToPaid();
      return;
    }
    
    if (!window.IMP) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 인터넷 연결을 확인하시거나, 브라우저의 광고 차단 확장 프로그램(AdBlock 등)이 활성화되어 있다면 해제한 후 새로고침(F5)을 해주세요.");
      return;
    }

    try {
      const IMP = window.IMP;
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

  const handleUpgradePayment = () => {
    handleUpgradeFromSms("deep", 15000);
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
            정통 {typeParam === "tojeong" ? "토정비결" : (type === "newyear" ? "신년운세" : "사주 풀이")}로 잠금 해제 (34,900원)
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

  const renderUpgradeOverlay = (sectionTitle) => {
    return (
      <div className="absolute inset-0 bg-[#F9F8F6]/85 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center select-none print:hidden">
        <div className="border-2 border-[#A3845B] bg-[#F9F8F6] rounded-xl p-8 max-w-sm shadow-xl space-y-4 relative">
          <div className="absolute top-2 left-2 text-[#A3845B]/20 text-[10px]">卍</div>
          <div className="absolute top-2 right-2 text-[#A3845B]/20 text-[10px]">卍</div>
          
          <div className="w-12 h-12 bg-[#A3845B]/10 text-[#A3845B] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            👑
          </div>
          <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">
            {sectionTitle || "정밀 심화 분석"} 잠겨 있음
          </h4>
          <p className="text-[11px] text-[#5F5F5F] leading-relaxed font-light font-traditional">
            이 영역은 <strong>심화(Deep) 리포트 전용</strong> 고품격 분석서입니다. 현재 보유하신 고급 리포트에서 심화 리포트로 업그레이드하시면 즉시 전체 내용이 공개됩니다.
          </p>
          <button
            type="button"
            onClick={handleUpgradePayment}
            className="w-full py-2.5 bg-[#8A6F4C] hover:bg-[#705A3D] text-white rounded text-xs font-semibold shadow-md transition-all font-traditional cursor-pointer"
          >
            프리미엄(심화) 리포트로 업그레이드 (+15,000원) →
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPaid(true);
              const url = new URL(window.location.href);
              url.searchParams.delete("reportGrade");
              window.location.href = url.toString();
            }}
            className="w-full py-1.5 bg-[#5F7A68] hover:bg-[#38493D] text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all mt-1 cursor-pointer"
          >
            ⚙️ [개발자 테스트] 즉시 업그레이드 적용하기
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
    const hasJob = /이직|회사|직장|퇴사|취업|일|업무|창업|보스|상사|동료|사직|승진/.test(cleanedText);
    const hasLove = /남자|여자|남친|여친|결혼|연애|사랑|이혼|속마음|그 사람|헤어짐|이별|부부|갈등/.test(cleanedText);
    const hasMoney = /돈|금전|투자|주식|코인|부동산|재물|사업|빚|대출|사기|적금|예금/.test(cleanedText);
    const hasHealth = /건강|질병|아픔|수술|몸|치료|병원|피로|우울|마음|스트레스/.test(cleanedText);
    const hasStudy = /시험|합격|공부|학업|진학|대학|자격증|진로|배움|학원/.test(cleanedText);

    let analysis = "";
    let timing = "";
    let actionPlan = "";

    // [우선순위 재정렬] 텍스트에 포함된 구체적 키워드를 카테고리 변수보다 우선 탐색하여 매칭합니다.
    if (hasHealth) {
      analysis = `의뢰인 ${name}님의 건강 상태 및 심신의 안녕["${cleanedText}"]에 대한 명리학적 케어 가이드입니다. 사주 내 특정 오행(특히 화기운의 과다 혹은 수기운의 결핍)이 불균형을 이룰 때 피로가 누적되고 신경성 질환이나 면역력 약화가 찾아오기 쉽습니다. 몸의 적신호는 단순히 체력의 문제가 아니라, 마음의 응어리와 기운의 불통이 신체로 발현되는 과정입니다. 스스로를 가혹하게 채찍질하기보다 쉼표를 찍어줄 때입니다.`;
      timing = `정체된 기운이 소통되고 신체 리듬이 안정을 찾는 가장 길한 시기는 오행의 열기를 식히고 윤활유를 채워주는 가을철(음력 7~8월) 및 겨울철(음력 10~11월)입니다.`;
      actionPlan = `1. 매일 취침 전 15~20분간 따뜻한 물로 족욕을 실천하여 머리의 열을 내리고 아래를 따뜻하게 하는 수승화강(水昇火降)을 도우십시오.\n2. 자연의 목(木) 기운을 보완하기 위해 녹색 식물을 방에 두거나 가벼운 숲길 산책을 일상화하십시오.\n3. 신맛이 나는 차(오미자, 매실)나 따뜻한 보리차를 수시로 음용하여 마른 체내에 수분을 보충해 주십시오.`;
    } else if (hasStudy) {
      analysis = `의뢰인 ${name}님의 학업 성취, 자격증 취득 및 시험 합격 안건["${cleanedText}"]에 대한 명리 분석입니다. 시험과 공부는 사주에서 문서와 인내를 뜻하는 인성(印星)의 기운이 지지해 줄 때 합격의 문이 넓어집니다. 의욕이 앞설 때 집중력이 흩어지기 쉬운 구조를 가졌으니, 한 번에 여러 공부를 하기보다 하나의 목표를 잘게 쪼개어 정복해 나가는 끈기가 핵심입니다.`;
      timing = `집중력이 극대화되고 시험관이나 채점관에게 좋은 인상을 주는 합격 및 문서 취득의 골든 타임은 2026년 음력 8월(酉월) 및 9월(戌월)의 대길한 문서운 시기입니다.`;
      actionPlan = `1. 공부방이나 책상을 행운의 방위인 남서쪽이나 서쪽을 향하도록 배치하여 집중의 밀도를 높이십시오.\n2. 중요한 시험 당일에는 노란색(土)이나 브라운 계열의 의상을 입거나 필기구를 소지하여 문서의 수호 기운을 보충하십시오.\n3. 매일 아침 간단한 일일 투두리스트를 서면으로 작성하고 완료 시 체크하는 방식으로 성취감을 의식적으로 유도하십시오.`;
    } else if (hasJob) {
      analysis = `의뢰인 ${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, 직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
      timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 음력 7~9월 사이입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
      actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.\n2. 행운의 색상인 화이트(金)나 실버 액세서리를 착용하여 신뢰감을 주는 이미지를 메이킹하십시오.\n3. 이직을 진행할 때 서쪽(西) 방향에 위치한 회사나 기관이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
    } else if (hasLove) {
      analysis = `의뢰인 ${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
      timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 음력 10월(亥월) 및 11월(子월) 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
      actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.\n2. 따뜻한 붉은색 계열(火)의 홈웨어 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.\n3. 대화를 시도할 때는 서로 마주 보는 자리보다 나란히 걸으며 이야기할 때 감정의 대립을 막아줍니다.`;
    } else if (hasMoney) {
      analysis = `의뢰인 ${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, 고위험 코인, 부동산 모험)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
      timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
      actionPlan = `1. 현금 흐름의 60% 이상은 수동적 예적금이나 연금저축 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.\n2. 노란색(土) 지갑이나 브라운 계열의 의상을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.\n3. 거래 계약 시 노란 색상의 낙관 도장을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
    } else if (category === "business") {
      analysis = `의뢰인 ${name}님의 사업체 운영 및 비즈니스 경영상 겪고 계신 갈등["${cleanedText}"]에 대한 사주 정밀 분석입니다. 사주 내 과도한 화(火) 기운이 발현될 때, 조급한 투자 결정이나 감정적인 거래선 확장은 불필요한 금전적 리스크를 유발합니다. 또한 동업자나 고용 직원과의 갈등, 의견 대립이 잦아져 경영 전반에 마찰음이 커질 수 있으니 수(水)의 유연함과 통찰을 바탕으로 차분하게 내실을 수성하는 전략이 급선무입니다.`;
      timing = `새로운 비즈니스 계약이나 자금 집행, 사업장 이동은 하늘의 금(金) 기운과 수(水) 기운이 조화롭게 흐르는 음력 8월(酉월) 하반기 및 10월(亥월)이 가장 길합니다. 이 시기에 추진하시는 계약은 리스크가 최소화되고 안정적인 결실을 보장받습니다.`;
      actionPlan = `1. 사업장 내 북쪽(水) 방향에 수경 식물이나 미니 분수를 배치해 과열된 기운을 차분히 식히십시오.\n2. 중요 미팅이나 계약 날인 시 신뢰도와 차분한 기품을 주는 다크 네이비(水) 계열 의상을 착용하십시오.\n3. 동업 또는 하도급 계약서 작성 시 당일 즉시 서명하기보다 반드시 최소 3일간의 내부 검토 기간을 두는 필터링 룰을 적용해 손재수를 철저히 예방하십시오.`;
    } else if (category === "startup") {
      analysis = `의뢰인 ${name}님의 신규 창업 및 부업 개시 안건["${cleanedText}"]에 대한 명리 솔루션입니다. 귀하의 타고난 명조는 자기 브랜드를 구축하고자 하는 욕구(식상생재)가 매우 발달해 있습니다. 다만, 아직 경험이 완전히 축적되지 않은 상태에서 대출 비중을 높여 무리하게 진입하면 초기 고정비 과부하로 인한 큰 손실 위험이 있습니다. 소자본 및 온라인 채널을 통한 린 스타트업(Lean Startup) 형태의 철저한 테스트가 우선입니다.`;
      timing = `실제 매장을 오픈하거나 정식 사업자 등록을 하기에 가장 좋은 절기적 타이밍은 차가운 기운이 안정적으로 스며들어 감정적 조급함을 제어해 주는 음력 10월(亥월) 이후입니다.`;
      actionPlan = `1. 초기에 매장 임차료나 인테리어 설비 같은 하드웨어 비용 투자를 최소화하고, service/콘텐츠 등의 소프트웨어 위주로 시범 론칭하십시오.\n2. 노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용하여 신뢰와 중개력을 돕는 토의 기운을 보완하십시오.\n3. 창업 파트너나 조력자를 구할 때 사주 상 물(水)이나 금(金) 기운이 많고 냉철한 성품을 지닌 인물과 손잡을 때 내 부족한 추진력을 완벽히 비보해 줍니다.`;
    } else if (category === "trade") {
      analysis = `의뢰인 ${name}님의 장사 및 물류 유통 사업["${cleanedText}"]에 대한 역학 솔루션입니다. 장사와 유통은 고객과의 잦은 대면 소통과 끊임없는 유동성 관리가 본질입니다. 귀하의 사주는 대인 친화력이 뛰어나 단골 유치에는 유리하지만, 외상 거래나 인정에 끌린 무리한 어음/미수금 거래로 인해 현금이 묶여 고통받을 수 있는 약점이 있습니다. 철저한 선결제 시스템 구축과 마진 구조의 개혁이 핵심입니다.`;
      timing = `매출 활성화가 정점에 달하고 유통망이 매끄럽게 뚫리는 시기는 금(金)의 결실 에너지가 사주의 중심을 잡아주는 음력 7~9월 가을철입니다.`;
      actionPlan = `1. 카운터나 매장 입구에 붉은색(火) 계열의 행운 장식품이나 은은한 향을 매칭하여 손님들의 호기심과 발길을 자극하십시오.\n2. 거래처 미팅 시 흰색(金) 상의를 착용하여 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.\n3. 매장 내부의 서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서 서쪽 서랍에 깊숙이 보관하십시오.`;
    } else if (category === "facility") {
      analysis = `의뢰인 ${name}님의 설비투자 및 사업장 확장, 장비 구입["${cleanedText}"]에 대한 금전 비책입니다. 기계, 공장 설비, 신규 하드웨어를 구매하거나 대형 리모델링에 착수하는 것은 사주의 문서운(인성)과 장비 계약운(관성)이 깨끗할 때 진입해야 고장이나 시공 하자, 이자 비용의 폭증을 피할 수 있습니다. 현재의 충살 기운 하에서는 성급하게 고가의 장비를 리스하거나 확장 계약을 맺으면 향후 골칫거리가 될 수 있습니다.`;
      timing = `계약 체결 및 설비 입고에 가장 하자가 없고 안전한 골든 타임은 문서 기운이 가장 안정되는 2026년 음력 8월(酉월) 하반기 및 9월(戌월)입니다.`;
      actionPlan = `1. 계약 체결 시 반드시 보증보험이나 하자보수 서약서를 이중으로 징구하여 예상치 못한 파손 리스크에 대비하십시오.\n2. 노란색(土) 가죽 다이어리나 서류 바인더에 설비 도면과 서류를 보관하여 계약 체결 시 발생하는 살(煞)을 정화하십시오.\n3. 계약서 날인 당일에는 15분 동안 반신욕이나 족욕을 통해 몸의 열기를 다스린 후 가장 이성적이고 차분한 상태에서 최종 확인을 거쳐 서명하십시오.`;
    } else if (category === "career") {
      analysis = `의뢰인 ${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, 직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
      timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 음력 7~9월 사이입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
      actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.\n2. 행운의 색상인 화이트(金)나 실버 액세서리를 착용하여 신뢰감을 주는 이미지를 메이킹하십시오.\n3. 이직을 진행할 때 서쪽(西) 방향에 위치한 회사나 기관이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
    } else if (category === "love") {
      analysis = `의뢰인 ${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
      timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 음력 10월(亥월) 및 11월(子월) 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
      actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.\n2. 따뜻한 붉은색 계열(火)의 홈웨어 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.\n3. 대화를 시도할 때는 서로 마주 보는 자리보다 나란히 걸으며 이야기할 때 감정의 대립을 막아줍니다.`;
    } else if (category === "wealth") {
      analysis = `의뢰인 ${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, 고위험 코인, 부동산 모험)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
      timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
      actionPlan = `1. 현금 흐름의 60% 이상은 수동적 예적금이나 연금저축 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.\n2. 노란색(土) 지갑이나 브라운 계열의 의상을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.\n3. 거래 계약 시 노란 색상의 낙관 도장을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
    } else {
      analysis = `의뢰인 ${name}님께서 적어주신 인생의 고뇌["${cleanedText}"]에 대한 따뜻한 명리학적 위로와 해결책입니다. 귀하가 느끼시는 마음에 낀 안개와 정체는 사주 속 특정 오행의 흐름이 한자리에 고여 원활하게 소통되지 못해 생겨난 감정적 피로입니다. 모든 것을 내 책임으로 돌리고 혼자 짊어지려는 곧은 기질로 인해 번아웃에 직면해 있으니, 타인의 기대에 맞추기보다 나를 아끼는 것이 최우선 과제입니다.`;
      timing = `정체된 흐름이 풀려 마음의 안정을 찾을 수 있는 시기는 귀하의 기운을 다정하게 감싸줄 목(木)과 화(火)의 생동하는 에너지가 들어오는 음력 6~7월 사이입니다.`;
      actionPlan = `1. 타인의 무리한 부탁이나 기대에 대해 '아니오'라고 단호하고 완곡하게 거절하는 연습을 시작하십시오.\n2. 침실 내 싱그러운 초록 식물이나 화분을 배치하여 정체된 감정을 순화시키는 자연 개운을 도우십시오.\n3. 취침 전 하루의 스트레스를 땀으로 내보내는 20분간의 족욕을 통해 위는 차갑고 아래는 따뜻한 수승화강을 실천하십시오.`;
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

    // 고급 리포트(premium)일 때는 심화 전용 페이지(신년운세, 대운/용신, 고민심화) 제외
    const activePages = reportGrade === "premium"
      ? pages
          .filter(p => !["seoun_2026", "seoun_quarterly", "seoun_aspects", "daeun_orbit", "daeun_roadmap_1", "daeun_roadmap_2", "warning_period", "worry_solution"].includes(p.type))
          .map((p, idx) => ({ ...p, page: idx + 1 }))
      : pages;

    return (
      <div className="space-y-12 print:space-y-0">
        {activePages.map((page) => (
          <div
            key={page.page}
            className="print-page-wrapper print:text-[13px] print:leading-relaxed relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-8 shadow-md print:border-none print:shadow-none print:p-0 print:m-0"
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
              <span className="font-myeongjo font-bold">{page.page} / {activePages.length}</span>
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
                <span className="text-gray-400 line-through whitespace-nowrap">54,600원</span>
                <span className="text-white font-bold text-sm whitespace-nowrap">34,900원</span>
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
                <p>✓ 누적 {cumulativeCount.toLocaleString()}명이 본인의 진짜 모습을 확인했습니다</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

    // ----------------------------------------------------
  const renderSmsNewYearContent = () => {
    // 만약 토정비결일 경우 2페이지 요약본으로 분기 렌더링
    if (typeParam === "tojeong") {
      const decodedWorry = worryText ? decodeURIComponent(worryText) : "";
      const worrySolutionText = decodedWorry
        ? `귀하의 고민 [${decodedWorry}]에 대해:\n올해는 병오년의 조급한 화(火) 기운으로 인해 성급히 판단하면 그르치기 쉽습니다. 가을철(음력 8월) 이전까지는 중요한 결정을 유보하고, 현상을 안정적으로 유지하며 에너지를 실속 있게 다지는 것이 가장 유리합니다.`
        : "올해 고민 솔루션:\n올해는 조급한 감정적 충동을 억제하고 정중동(靜中動)의 자세를 유지하는 것이 좋습니다. 특히 가을 이전에는 서투른 확장을 피해 손재수를 차단하십시오.";

      const elStats = `목(${sajuInfo.elements.목}개) | 화(${sajuInfo.elements.화}개) | 토(${sajuInfo.elements.토}개) | 금(${sajuInfo.elements.금}개) | 수(${sajuInfo.elements.수}개)`;

      let tojeongGeneralDesc = "";
      const currentBaseEl = baseEl || (sajuInfo && sajuInfo.day && sajuInfo.day.stemEl) || "목";
      
      if (currentBaseEl === "목") {
        tojeongGeneralDesc = "목(木) 일간인 귀하에게 2026년은 맹렬한 화(火) 기운이 목생화(木生火)로 설계되어 내적 재능과 열정이 크게 발산되는 해입니다. 기획이나 창작 활동에서 눈부신 성과를 내고 대외적 영향력이 확장되나, 과도한 활동으로 체력이 쉽게 소진되고 심리적 조급증이나 상열감이 발생할 수 있으니 완급 조절이 필수적입니다. 특히 음력 5월과 6월의 폭발적인 화기 속에서는 무리한 확장을 지양하고 휴식을 병행하는 정중동의 지혜가 필요합니다.";
      } else if (currentBaseEl === "화") {
        tojeongGeneralDesc = "화(火) 일간인 귀하에게 2026년은 나와 같은 강력한 화(火) 기운이 세운에서 더해져 자신감과 고집이 최고조에 달하는 비겁(比劫)의 시기입니다. 스스로 독립하여 새로운 영역을 개척하려는 에너지가 솟구치나, 자만심으로 인한 무리한 투자나 대인관계의 시비, 동업 문제로 손재수를 입을 수 있으니 겸손과 자제가 가장 강력한 개운법입니다. 뜨거운 열정을 내실을 다지고 리스크를 방어하는 데 집중하여 큰 재물 손실을 피해야 합니다.";
      } else if (currentBaseEl === "토") {
        tojeongGeneralDesc = "토(土) 일간인 귀하에게 2026년은 맹렬한 불길이 단단한 흙을 돕는 화생토(火生土)의 강한 인성(印星)의 해입니다. 나를 돕는 귀인의 혜택이나 문서상의 계약(부동산, 자격증, 합격 등)에서 매우 길한 소식이 기대됩니다. 다만 생각이 지나치게 많아져 실행력이 떨어지는 '생각의 감옥'을 경계해야 합니다. 행동이 무거워지지 않도록 실용적인 계획을 세우고, 가을철 금(金)의 기류를 타고 결실을 과감히 쟁취해 보십시오.";
      } else if (currentBaseEl === "금") {
        tojeongGeneralDesc = "금(金) 일간인 귀하에게 2026년은 뜨거운 용광로의 불꽃이 단단한 쇠를 제련하는 화극금(화극금)의 관성(官星)의 해입니다. 직장에서의 승진, 명예 획득, 새로운 책임감 등 삶의 중요한 뼈대를 세우는 제련의 과정을 겪게 됩니다. 책임감이 무겁고 대외적 스트레스가 따르나, 이 시기를 묵묵히 인내하고 규칙을 준수하며 버텨낸다면 연말에는 값진 명예와 한 단계 도약한 사회적 지위를 얻을 것입니다.";
      } else { // 수
        tojeongGeneralDesc = "수(水) 일간인 귀하에게 2026년은 뜨거운 불을 다스리는 수극화(수극화)의 재성(財星)의 해입니다. 일생일대의 큰 재물적 기회와 성과가 눈앞에 다가오는 역동적인 시기입니다. 횡재수나 대외적인 실리를 확실하게 챙길 수 있는 판이 짜이지만, 조급하게 서두르거나 분수에 넘치는 과욕을 부리면 불길에 물이 모두 증발하여 오히려 큰 낭패를 볼 수 있으니 차분하고 이성적인 현금 자산 관리가 절대적으로 필요합니다.";
      }

      return (
        <div className="space-y-12 print:space-y-0">
          {/* SMS PAGE 1 - 운세 기조 및 4대 분야 요약 */}
          <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0">
            <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                  <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 토정비결 요약</span>
                  <span className="text-[9px] text-gray-400 font-light font-traditional">1. 세운 기조 및 4대 분야 요약</span>
                </div>

                <div className="space-y-5">
                  <div className="text-center py-3 space-y-1.5">
                    <span className="text-xs text-[#A3845B] tracking-widest font-bold block font-myeongjo">— 2026 丙午年 —</span>
                    <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wide">{name} 님 토정비결 요약</h2>
                    <div className="w-16 h-0.5 bg-[#A3845B]/40 mx-auto mt-0.5" />
                  </div>

                  {/* 한줄 총평 요약 배너 */}
                  <div className="bg-gradient-to-r from-[#A3845B] via-[#C49A6C] to-[#A3845B] text-white py-2.5 px-4 rounded-xl text-center shadow-md space-y-0.5">
                    <span className="text-[7px] tracking-widest text-[#FFFDFC]/85 block font-sans uppercase">2026 병오년 핵심 비결 총평</span>
                    <p className="font-myeongjo text-[11px] font-bold text-white tracking-wide">
                      "뜨거운 태양 아래 질주하는 적마(赤馬)의 형국, 속도를 조절하면 대업을 이룬다"
                    </p>
                  </div>

                  {/* 병오년 세운 기조 */}
                  <div className="bg-gradient-to-br from-[#FFFDFC] to-[#FFF9F6] border border-[#E8DFD8] rounded-xl p-4.5 space-y-3.5 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#A3845B] text-xs font-myeongjo flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C49A6C] animate-pulse" />
                        ■ 1. 2026년 병오년 세운 기조
                      </span>
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[8px] font-bold rounded-full border border-red-100">
                        丙午 붉은 말의 해
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-[#5F5F5F] font-light leading-relaxed space-y-2.5">
                      <p>
                        <strong>• 세운 특징:</strong>{' '}
                        <span className="font-semibold text-red-700 bg-red-50/50 px-1 py-0.5 rounded">천지합화(天地合火)</span> - 하늘과 땅이 모두 거대한 불꽃으로 화하는 역동적이고 주도적인 한 해입니다. 성급함을 제어하고 에너지를 잘 조율한다면 눈부신 도약의 발판이 됩니다.
                      </p>
                      
                      {/* 오행 분포 시각화 차트 */}
                      <div className="pt-2 border-t border-[#E8DFD8]/50">
                        <span className="text-[9px] font-semibold text-gray-700 block mb-2">📊 내 사주 오행 분포도 (전체 8자 기준)</span>
                        <div className="space-y-1.5">
                          {[
                            { name: '목(木)', key: '목', color: 'bg-emerald-600', valColor: 'text-emerald-700', bg: 'bg-emerald-50', desc: '성장, 시작' },
                            { name: '화(火)', key: '화', color: 'bg-red-500', valColor: 'text-red-600', bg: 'bg-red-50', desc: '열정, 확장' },
                            { name: '토(土)', key: '토', color: 'bg-amber-600', valColor: 'text-amber-700', bg: 'bg-amber-50', desc: '중재, 신용' },
                            { name: '금(金)', key: '금', color: 'bg-zinc-500', valColor: 'text-zinc-600', bg: 'bg-zinc-50', desc: '결실, 판단' },
                            { name: '수(水)', key: '수', color: 'bg-blue-600', valColor: 'text-blue-700', bg: 'bg-blue-50', desc: '지혜, 휴식' }
                          ].map(el => {
                            const count = sajuInfo.elements[el.key] || 0;
                            const percentage = Math.max(5, (count / 8) * 100);
                            return (
                              <div key={el.name} className="flex items-center gap-2">
                                <span className={`w-11 text-[8.5px] font-bold text-center py-0.5 rounded ${el.bg} ${el.valColor}`}>
                                  {el.name}
                                </span>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                                  <div 
                                    className={`h-full ${el.color} rounded-full transition-all duration-1000`} 
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="w-10 text-[8.5px] font-bold text-right text-gray-600">
                                  {count}개 ({Math.round((count / 8) * 100)}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4대 분야별 심층 요약 카드 */}
                  <div className="space-y-3">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 2. 4대 핵심 분야 운세 요약</span>
                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      
                      {/* 재물운 */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 hover:border-amber-400/50 hover:shadow-md transition-all duration-300 space-y-1 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute right-1 top-1 text-amber-500/10 group-hover:text-amber-500/25 transition-colors">
                          <DollarSign className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-amber-800 flex items-center gap-1 font-myeongjo">
                            <DollarSign className="w-3 h-3 text-amber-600" />
                            ① 재물운 (Wealth)
                          </span>
                          <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                            가을철(음력 7~9월) 금(金)의 수축기에 재물이 단단하게 축적되는 좋은 흐름입니다. 다만 상반기에는 화(火) 기운의 영향으로 충동적인 투자와 지출이 늘 수 있어 현금 확보에 집중해야 합니다.
                          </p>
                        </div>
                      </div>

                      {/* 직장운 */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 hover:border-blue-400/50 hover:shadow-md transition-all duration-300 space-y-1 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute right-1 top-1 text-blue-500/10 group-hover:text-blue-500/25 transition-colors">
                          <Award className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-blue-800 flex items-center gap-1 font-myeongjo">
                            <Award className="w-3 h-3 text-blue-600" />
                            ② 직장 & 커리어 (Career)
                          </span>
                          <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                            윗사람이나 귀인의 은밀한 천거가 기대되며 직장 내 승진이나 시험 합격, 창업/이직 등의 전환기는 음력 3월과 8월에 기운이 강합니다. 사람과의 신의를 먼저 지키면 관운이 함께 열립니다.
                          </p>
                        </div>
                      </div>

                      {/* 애정운 */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 hover:border-rose-400/50 hover:shadow-md transition-all duration-300 space-y-1 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute right-1 top-1 text-rose-500/10 group-hover:text-rose-500/25 transition-colors">
                          <Heart className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-rose-800 flex items-center gap-1 font-myeongjo">
                            <Heart className="w-3 h-3 text-rose-600" />
                            ③ 애정 & 대인관계 (Love)
                          </span>
                          <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                            솔로는 하반기에 조용하고 신뢰할 수 있는 실속 있는 인연을 만날 기회가 옵니다. 부부나 연인은 상반기 중 거친 말과 감정 충돌이 생기지 않도록 정성껏 배려하는 대화가 필수적입니다.
                          </p>
                        </div>
                      </div>

                      {/* 건강운 */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 hover:border-emerald-400/50 hover:shadow-md transition-all duration-300 space-y-1 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                        <div className="absolute right-1 top-1 text-emerald-500/10 group-hover:text-emerald-500/25 transition-colors">
                          <Shield className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-emerald-800 flex items-center gap-1 font-myeongjo">
                            <Shield className="w-3 h-3 text-emerald-600" />
                            ④ 건강 & 신수 (Health)
                          </span>
                          <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                            심장계 및 혈관계 피로, 상열감, 안구 건조 등 화독(火毒)의 증상을 조심해야 합니다. 주기적인 찬물 족욕이나 명상, 충분한 수분 섭취를 통해 화 기운을 가라앉히는 것이 중요합니다.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 3. 종합 운명 해설 추가 */}
                  <div className="bg-white border border-[#E2DDD5] rounded-xl p-4.5 space-y-2.5 shadow-sm relative overflow-hidden group hover:border-[#A3845B]/50 transition-all duration-300">
                    <div className="flex justify-between items-center border-b border-[#E2DDD5]/40 pb-1.5">
                      <span className="font-bold text-[#A3845B] text-xs font-myeongjo flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#C49A6C]" />
                        ■ 3. 2026년 토정비결 종합 운명 해설
                      </span>
                    </div>
                    <p className="text-[9.5px] text-gray-600 font-light leading-relaxed text-justify font-sans">
                      {tojeongGeneralDesc}
                    </p>
                  </div>

                </div>
              </div>

              {/* 하단 푸터 */}
              <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
                <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 토정비결 요약</span>
                <span className="font-myeongjo font-bold">1 / 2</span>
              </div>
            </div>
          </div>

          {/* SMS PAGE 2 - 12개월 타임라인 및 솔루션 */}
          <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0">
            <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                  <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 토정비결 요약</span>
                  <span className="text-[9px] text-gray-400 font-light font-traditional">2. 월별 타임라인 및 처방</span>
                </div>

                <div className="space-y-5">
                  {/* 12개월 타임라인 핵심 요약 */}
                  <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-sm">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 3. 12개월 월별 길흉 지수 요약</span>
                    <div className="grid grid-cols-4 gap-2 text-[9px] text-center">
                      {[
                        { m: 1, s: "★★★★☆" }, { m: 2, s: "★★★☆☆" }, { m: 3, s: "★★★★☆" }, { m: 4, s: "★★★☆☆" },
                        { m: 5, s: "★★☆☆☆" }, { m: 6, s: "★★★☆☆" }, { m: 7, s: "★★★★☆" }, { m: 8, s: "★★★★★" },
                        { m: 9, s: "★★★★☆" }, { m: 10, s: "★★★★☆" }, { m: 11, s: "★★★☆☆" }, { m: 12, s: "★★★★☆" }
                      ].map(item => (
                        <div key={item.m} className="bg-[#FAF8F5] p-1.5 rounded border border-[#E2DDD5]/45">
                          <span className="font-bold block text-gray-700">음력 {item.m}월</span>
                          <span className="text-red-700 text-[8px] tracking-tighter block mt-0.5">{item.s}</span>
                        </div>
                      ))}
                    </div>

                    {/* 월별 파동 그래프 시각화 (새로 추가) */}
                    <div className="pt-3 border-t border-[#E2DDD5]/50 mt-3">
                      <span className="text-[8.5px] font-bold text-[#A3845B] block mb-1 text-center font-sans tracking-wide">
                        📈 2026 병오년 월별 운세 에너지 파동 흐름
                      </span>
                      <div className="bg-[#FAF8F5]/80 rounded-lg p-2 border border-[#E2DDD5]/40 flex justify-center items-center">
                        <svg viewBox="0 0 360 90" className="w-full max-w-lg h-auto select-none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#A3845B" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#A3845B" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          {/* 가이드 수평선 */}
                          <line x1="15" y1="15" x2="345" y2="15" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                          <line x1="15" y1="28" x2="345" y2="28" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                          <line x1="15" y1="42" x2="345" y2="42" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                          <line x1="15" y1="55" x2="345" y2="55" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                          
                          {/* 면적 채우기 */}
                          <path d="M 15 28 L 45 42 L 75 28 L 105 42 L 135 55 L 165 42 L 195 28 L 225 15 L 255 28 L 285 28 L 315 42 L 345 28 L 345 70 L 15 70 Z" fill="url(#chartGrad)" />
                          
                          {/* 선 그리기 */}
                          <path d="M 15 28 L 45 42 L 75 28 L 105 42 L 135 55 L 165 42 L 195 28 L 225 15 L 255 28 L 285 28 L 315 42 L 345 28" fill="none" stroke="#A3845B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          
                          {/* 노드 점 그리기 */}
                          {[
                            { x: 15, y: 28, m: "1월" },
                            { x: 45, y: 42, m: "2월" },
                            { x: 75, y: 28, m: "3월" },
                            { x: 105, y: 42, m: "4월" },
                            { x: 135, y: 55, m: "5월" },
                            { x: 165, y: 42, m: "6월" },
                            { x: 195, y: 28, m: "7월" },
                            { x: 225, y: 15, m: "8월", p: true },
                            { x: 255, y: 28, m: "9월" },
                            { x: 285, y: 28, m: "10월" },
                            { x: 315, y: 42, m: "11월" },
                            { x: 345, y: 28, m: "12월" }
                          ].map((pt, idx) => (
                            <g key={idx}>
                              <circle cx={pt.x} cy={pt.y} r={pt.p ? "4.5" : "3.5"} fill={pt.p ? "#8B221E" : "#A3845B"} stroke="#FFFFFF" strokeWidth="1" />
                              <text x={pt.x} y="82" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#5F5F5F" className="font-sans">
                                {pt.m}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 2026 병오년 분기별 세운 대전술 (새로 추가) */}
                  <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-sm">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 4. 2026년 분기별 세운 대전술 (4계절 흐름)</span>
                    <div className="grid grid-cols-2 gap-3 text-[9px]">
                      
                      {/* 1분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <span className="text-[11px]">🌱</span>
                          <span>1분기 (음력 1~3월) : 태동기</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                          한 해의 기획을 수립하고 기류가 꿈틀대는 시기입니다. 섣부른 행동보다는 문서상의 기초를 다지며, 새로운 지식을 습득하고 계약의 유리함을 선점하는 전략이 절대적으로 적합합니다.
                        </p>
                      </div>

                      {/* 2분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-red-800">
                          <span className="text-[11px]">🔥</span>
                          <span>2분기 (음력 4~6월) : 성장기</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                          병오년의 활화산 같은 화(火)의 기운이 극에 달합니다. 감정적인 욱함이나 충동 거래를 피하고, 1등 자존심 대결보다는 남모르게 실속을 챙기며 후방 리스크를 단단히 방어해야 합니다.
                        </p>
                      </div>

                      {/* 3분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800">
                          <span className="text-[11px]">🌾</span>
                          <span>3분기 (음력 7~9월) : 수축기</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                          대지에 맹렬한 금(金)의 응축력이 작용하여 성과물이 실현되는 수확기입니다. 투자의 결실을 걷어 들이거나 자산을 문서나 안전자산 형태로 단단하게 묶는 것이 가장 길한 수입니다.
                        </p>
                      </div>

                      {/* 4분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-blue-800">
                          <span className="text-[11px]">❄️</span>
                          <span>4분기 (음력 10~12월) : 갈무리</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                          수(水)의 지혜와 차분함으로 다음 해를 설계하는 충전의 시기입니다. 겉으로 드러나는 무대를 만들기보단 실질 자산을 방어하고, 내면의 건강과 명상을 통해 기의 밸런스를 맞춰야 합니다.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* 올해의 개운 솔루션 & 조언 */}
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="border border-[#E2DDD5] rounded-xl p-4 bg-white shadow-sm space-y-2">
                      <span className="font-bold text-[#A3845B] block font-myeongjo">🍀 5. 행운의 개운 비법</span>
                      <div className="text-[9px] text-gray-500 space-y-1 font-light leading-normal">
                        <p><strong>• 행운의 색상/숫자:</strong> 백색, 흑색 / 1, 4, 6, 9</p>
                        <p><strong>• 행운의 방향:</strong> 서쪽, 북쪽</p>
                        <p><strong>• 수호 아이템:</strong> 메탈 시계, 실버 펄, 어두운 네이비 의류</p>
                      </div>
                    </div>
                    <div className="border border-[#E2DDD5] rounded-xl p-4 bg-white shadow-sm space-y-2">
                      <span className="font-bold text-[#A3845B] block font-myeongjo">🔑 6. 맞춤 고민 처방</span>
                      <p className="text-[9px] text-gray-500 font-light leading-relaxed text-justify">
                        {worrySolutionText}
                      </p>
                    </div>
                  </div>


                </div>
              </div>

              {/* 하단 푸터 및 공식 검증인 낙관 */}
              <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
                <div className="space-y-0.5">
                  <span className="font-myeongjo font-light block">慧眼堂 寶鑑 · 병오년 토정비결 요약</span>
                  <span className="font-sans text-gray-400">Copyright © 慧眼堂 명리연구소 All Rights Reserved.</span>
                </div>
                <span className="font-myeongjo font-bold pr-12">2 / 2</span>
                
                {/* 혜안당 공식 낙관 */}
                <div className="absolute right-0 bottom-2 select-none">
                  <svg viewBox="0 0 60 60" className="w-[36px] h-[36px] transform -rotate-12">
                    <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                    <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                      慧眼
                    </text>
                    <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                      堂인
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 화면 하단 플로팅 결제 바 (모바일 및 PC 대응, 인쇄시 숨김) */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 bg-[#1C1613]/95 backdrop-blur-md border-t border-[#A3845B]/30 py-3.5 px-6 shadow-[0_-8px_30px_rgb(0,0,0,0.2)] print:hidden rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
              <div className="text-left sm:pl-2">
                <span className="text-[8px] tracking-widest text-[#A3845B] block font-myeongjo font-bold uppercase">— 慧眼堂 프리미엄 업그레이드 —</span>
                <h4 className="font-myeongjo text-[11px] font-bold text-[#FAF7F0] leading-tight mt-0.5">
                  {name}님을 위한 30페이지 분량의 심층 분석 전체가 포함된 고급 리포트 대기 중
                </h4>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto sm:pr-2">
                <button
                  type="button"
                  onClick={() => handleUpgradeFromSms("premium", 15000)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] rounded-lg font-bold text-[10px] shadow transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  👑 고급 리포트 업그레이드 (+15,000원) →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(true);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("reportGrade");
                    window.location.href = url.toString();
                  }}
                  className="text-[8.5px] text-[#A3845B]/60 hover:text-white underline cursor-pointer shrink-0"
                >
                  [테스트용 즉시 해제]
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const lacks = prescriptions.map(p => p.name.split(" - ")[0]).join(", ");
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
      ? `귀하의 고민 [${decodedWorry}]에 대해:\n올해는 병오년의 조급한 화(火) 기운으로 인해 성급히 판단하면 그르치기 쉽습니다. 가을철(음력 8월) 이전까지는 중요한 결정을 유보하고, 현상을 안정적으로 유지하며 에너지를 실속 있게 다지는 것이 가장 유리합니다.`
      : "올해 고민 솔루션:\n올해는 조급한 감정적 충동을 억제하고 정중동(靜中動)의 자세를 유지하는 것이 좋습니다. 특히 가을 이전에는 서투른 확장을 피해 손재수를 차단하십시오.";

    const elStats = `목(${sajuInfo.elements.목}개) | 화(${sajuInfo.elements.화}개) | 토(${sajuInfo.elements.토}개) | 금(${sajuInfo.elements.금}개) | 수(${sajuInfo.elements.수}개)`;

    const smsText = `[혜안당 명리연구소] 2026 병오년 ${typeParam === "tojeong" ? "토정비결" : "신년운세"} 요약
──────────────────────────────
본 문서는 ${name} 님의 2026년 ${typeParam === "tojeong" ? "토정비결" : "신년운세"} 요약본입니다.

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

    const reportTitle = typeParam === "tojeong" ? "토정비결" : "신년운세";

    return (
      <div className="space-y-12 print:space-y-0">
        {/* PAGE 1 */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0">
          <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · {reportTitle} 요약</span>
                <span className="text-[9px] text-gray-400 font-light font-traditional">1. 운세 기조 및 오행 분포</span>
              </div>

              <div className="space-y-6">
                <div className="text-center py-4 space-y-2">
                  <span className="text-xs text-[#A3845B] tracking-widest font-bold block font-myeongjo">— 2026 丙午年 —</span>
                  <h2 className="font-myeongjo text-3xl font-bold text-[#1A1A1A] tracking-wide">{name} 님 신년 운세 요약 보감</h2>
                  <div className="w-20 h-0.5 bg-[#A3845B]/40 mx-auto mt-1" />
                </div>

                {/* 2026 병오년 운세 기조 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-3 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 1. 2026년 병오년 세운 기조</span>
                  <div className="text-xs text-[#5F5F5F] font-light leading-relaxed space-y-2">
                    <p><strong>• 세운 특징:</strong> <span className="font-semibold text-[#A3845B]">천지합화(天地合火)</span> - 하늘과 대지가 거대한 불꽃으로 화합하는 역동적 한 해입니다.</p>
                    <p><strong>• 오행 구성 상태:</strong> <span className="font-semibold text-gray-700">{elStats}</span></p>
                  </div>
                </div>

                {/* 기질 융합 해석 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-3 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">💡 일간(日干) 기질 융합 해석</span>
                  <p className="text-xs text-[#5F5F5F] font-light leading-relaxed bg-[#FAF7F0]/60 p-3 rounded border border-[#E2DDD5]/40 text-justify">
                    {yearInteractionText}
                  </p>
                </div>

                {/* 일간 오행 처방 키워드 및 행동 지침 */}
                {(() => {
                  const dayStemEl = sajuInfo?.day?.stemEl || "목";
                  const stemKeywords = {
                    "목": { keyword: "수기(水氣) 보존 · 감정 완화", color: "text-emerald-800 bg-emerald-50/50 border-emerald-100/80", tip: "뜨거운 불꽃 기류가 나무의 진액을 말리니, 충분한 수분 보충과 조용한 충전 시간을 가지는 것이 행운을 돕습니다." },
                    "화": { keyword: "자아 절제 · 차분한 유지", color: "text-red-800 bg-red-50/50 border-red-100/80", tip: "나와 같은 불 기운이 극도로 가중되니 충동적 거래나 동업 제안을 거절하고 이성을 사수하는 것이 급선무입니다." },
                    "토": { keyword: "문서 획득 · 학업 및 결실", color: "text-amber-800 bg-amber-50/50 border-amber-100/80", tip: "맹렬한 화기가 단단한 대지를 도우니 시험, 승진, 자격증 획득 등 문서상의 안정이 아주 높게 작용하는 황금기입니다." },
                    "금": { keyword: "규율 준수 · 스트레스 관리", color: "text-gray-800 bg-gray-50/50 border-gray-100/80", tip: "뜨거운 용광로의 제련 과정과 같습니다. 직장 및 대외 스트레스가 우려되나 이를 인내하면 값진 명예로 치환됩니다." },
                    "수": { keyword: "재물 포착 · 이성적 재무", color: "text-blue-800 bg-blue-50/50 border-blue-100/80", tip: "뜨거운 불을 조절하는 비가 내리는 격입니다. 일시적인 금전 기회가 크게 찾아오니 들뜨지 않고 침착하게 수확해야 합니다." }
                  }[dayStemEl] || { keyword: "오행 조화 · 중용 유지", color: "text-gray-800 bg-gray-50/50 border-gray-100/80", tip: "병오년의 활발한 불꽃 기류를 맞아 지나친 확장을 삼가고 내실을 굳건히 하는 자세가 최상의 방책입니다." };

                  return (
                    <div className={`border rounded-xl p-5 space-y-2.5 ${stemKeywords.color} shadow-sm`}>
                      <span className="font-bold text-xs block font-myeongjo">🎯 2026년 일간 맞춤 처방 키워드</span>
                      <div className="space-y-1.5 text-xs">
                        <p><strong>• 핵심 키워드:</strong> <span className="underline decoration-2 underline-offset-2 font-bold">{stemKeywords.keyword}</span></p>
                        <p className="leading-relaxed opacity-90"><strong>• 신년 지침:</strong> {stemKeywords.tip}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* 오행 에너지 시각화 요약 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-4 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">📊 타고난 오행 밸런스 수치 & 하모니 휠</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* 오행 막대 그래프 */}
                    <div className="space-y-2">
                      {Object.entries(sajuInfo.elements).map(([el, count]) => (
                        <div key={el} className="bg-[#FAF8F5] p-2 rounded border border-[#E2DDD5]/40 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-gray-700 w-12">{el} ({count}개)</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden mx-2">
                            <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${(count / 8) * 100}%` }} />
                          </div>
                          <span className="text-gray-400 text-[9px] w-6 text-right">{Math.round((count / 8) * 100)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* 오행 하모니 휠 SVG */}
                    <div className="flex justify-center items-center py-2 bg-[#FAF8F5]/50 border border-[#E2DDD5]/40 rounded-xl">
                      <svg viewBox="0 0 200 200" className="w-[140px] h-[140px]">
                        <defs>
                          <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFDF9" />
                            <stop offset="70%" stopColor="#FAF6EE" />
                            <stop offset="100%" stopColor="#E2DDD5" />
                          </radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="80" fill="url(#auraGrad)" stroke="#E2DDD5" strokeWidth="1" />
                        <circle cx="100" cy="100" r="55" fill="none" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="3,3" />
                        <polygon points="100,30 162,75 138,148 62,148 38,75" fill="none" stroke="#A3845B" strokeWidth="0.5" strokeOpacity="0.3" />
                        {(() => {
                          const angles = { "목": -90, "화": -18, "토": 54, "금": 126, "수": 198 };
                          const colors = {
                            "목": { fill: "#10B981", stroke: "#047857" },
                            "화": { fill: "#EF4444", stroke: "#B91C1C" },
                            "토": { fill: "#F59E0B", stroke: "#B45309" },
                            "금": { fill: "#9CA3AF", stroke: "#4B5563" },
                            "수": { fill: "#3B82F6", stroke: "#1D4ED8" }
                          };
                          
                          return Object.entries(sajuInfo.elements).map(([el, count]) => {
                            const angle = angles[el] || 0;
                            const rad = (angle * Math.PI) / 180;
                            const dist = 25 + (count / 8) * 45;
                            const cx = 100 + dist * Math.cos(rad);
                            const cy = 100 + dist * Math.sin(rad);
                            const labelDist = dist + 14;
                            const lx = 100 + labelDist * Math.cos(rad);
                            const ly = 100 + labelDist * Math.sin(rad);
                            
                            return (
                              <g key={el}>
                                <line x1="100" y1="100" x2={cx} y2={cy} stroke={colors[el]?.fill} strokeWidth="1" strokeDasharray="1,1" />
                                <circle cx={cx} cy={cy} r="5" fill={colors[el]?.fill} stroke={colors[el]?.stroke} strokeWidth="1" />
                                <circle cx={cx} cy={cy} r="2" fill="#FFFFFF" />
                                <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4B5563" className="font-sans">
                                  {el}
                                </text>
                              </g>
                            );
                          });
                        })()}
                        <circle cx="100" cy="100" r="7" fill="#A3845B" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="100" y="102.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">命</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 푸터 및 공식 검증인 낙관 */}
            <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
              <div className="space-y-0.5">
                <span className="font-myeongjo font-light block">慧眼堂 寶鑑 · 병오년 {typeParam === "tojeong" ? "토정비결" : "신수비결"} 요약</span>
                <span className="font-sans text-gray-400">Copyright © 慧眼堂 명리연구소 All Rights Reserved.</span>
              </div>
              <span className="font-myeongjo font-bold pr-12">1 / 2</span>
              
              {/* 혜안당 공식 낙관 */}
              <div className="absolute right-0 bottom-2 select-none">
                <svg viewBox="0 0 60 60" className="w-[36px] h-[36px] transform -rotate-12">
                  <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                  <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                    慧眼
                  </text>
                  <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                    堂印
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      
      {/* PAGE 2 */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-8 shadow-md print:border-none print:shadow-none print:p-0 print:m-0">
          <div>
            <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
              <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · {reportTitle} 요약</span>
              <span className="text-[9px] text-gray-400 font-light font-traditional">2. 전술 및 개운 처방</span>
            </div>

            <div className="space-y-5">
              {/* 분기별 플레이북 */}
              <div className="border border-[#E2DDD5] rounded-lg p-5 bg-white shadow-sm space-y-3">
                <span className="font-bold text-[#A3845B] text-xs block">💡 2. 분기별 전술 Playbook</span>
                <div className="grid grid-cols-2 gap-3 text-[10px] text-[#5F5F5F] font-light">
                  <div className="bg-[#FAF8F5] p-2.5 rounded border border-[#E2DDD5]/50">
                    <span className="font-bold text-[#8A6F4C] block mb-0.5">1분기 (음력 1~3월)</span>
                    <p className="leading-normal">변동운이 스쳐 가나 이직/계약 시 섣부른 결정을 유보하고 서류를 철저 검토하십시오.</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded border border-[#E2DDD5]/50">
                    <span className="font-bold text-[#8A6F4C] block mb-0.5">2분기 (음력 4~6월)</span>
                    <p className="leading-normal">타오르는 불꽃이 뜨거우니 구설과 시비를 피하고 10분 늦게 대답하며 평정을 유지하십시오.</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded border border-[#E2DDD5]/50">
                    <span className="font-bold text-[#8A6F4C] block mb-0.5">3분기 (음력 7~9월)</span>
                    <p className="leading-normal">결실을 수확하는 황금기입니다. 커리어 추진 및 자금 확보에 적극적으로 나서십시오.</p>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded border border-[#E2DDD5]/50">
                    <span className="font-bold text-[#8A6F4C] block mb-0.5">4분기 (음력 10~12월)</span>
                    <p className="leading-normal">기운을 갈무리하고 내실을 다지며 신축년의 새 흐름을 준비하고 건강에 집중하십시오.</p>
                  </div>
                </div>
              </div>

              {/* 고민 솔루션 & 개운법 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-[#E2DDD5] rounded-lg p-4 bg-[#F9F8F6] text-xs space-y-1.5">
                  <span className="font-bold text-[#A3845B] block">🔑 3. 맞춤 고민 극복 처방</span>
                  <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed whitespace-pre-line text-justify">
                    {worrySolutionText}
                  </p>
                </div>
                <div className="border border-[#E2DDD5] rounded-lg p-4 bg-[#F9F8F6] text-xs space-y-1.5">
                  <span className="font-bold text-[#A3845B] block">🍀 4. 신년 행운 개운 비법</span>
                  <div className="text-[10px] text-[#5F5F5F] font-light space-y-1">
                    <p><strong>• 행운의 색상:</strong> {prescriptions[0]?.color || "밝은 계열"}</p>
                    <p><strong>• 행운의 방향:</strong> {prescriptions[0]?.direction || "동서남북"}</p>
                    <p><strong>• 행운의 숫자:</strong> {prescriptions[0]?.number || "5, 10"}</p>
                    <p className="text-[9px] text-[#8A6F4C] leading-relaxed pt-1 border-t border-[#E2DDD5]/40 mt-1">
                      <strong>개운 조언:</strong> {prescriptions[0]?.items} 등을 곁에 두시면 흉한 기운을 막아줍니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 문자 복사 섹션 */}
              <div className="border border-[#E2DDD5]/60 bg-[#F9F8F6]/40 p-4 rounded-lg flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-gray-700 block">💬 모바일 문자 공유 최적화</span>
                  <p className="text-[9px] text-gray-400 font-light">요약된 보감을 클립보드에 복사해 가족들과 공유할 수 있습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySms(smsText)}
                  className="px-4 py-2 bg-[#A3845B]/10 hover:bg-[#A3845B]/20 text-[#A3845B] rounded text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  {copied ? "✓ 복사 완료" : "문자 복사하기"}
                </button>
              </div>

            </div>

            <div className="flex justify-between items-center border-t border-[#E2DDD5]/50 pt-3 mt-6 text-[9px] text-[#5F5F5F] mb-16 sm:mb-10">
              <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 {typeParam === "tojeong" ? "토정비결" : "신수비결"} 요약</span>
              <span className="font-myeongjo font-bold">2 / 2</span>
            </div>
          </div>

          {/* 화면 하단 플로팅 결제 바 (모바일 및 PC 대응, 인쇄시 숨김) */}
          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 bg-[#1C1613]/95 backdrop-blur-md border-t border-[#A3845B]/30 py-3.5 px-6 shadow-[0_-8px_30px_rgb(0,0,0,0.2)] print:hidden rounded-t-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
              <div className="text-left sm:pl-2">
                <span className="text-[8px] tracking-widest text-[#A3845B] block font-myeongjo font-bold uppercase">— 혜안당 정밀 분석 추가 제안 —</span>
                <h4 className="font-myeongjo text-[11px] font-bold text-[#FAF7F0] leading-tight mt-0.5">
                  {name}님을 위한 8가지 심화 콘텐츠 및 로드맵 전체 분석이 준비되어 있습니다.
                </h4>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto sm:pr-2">
                <button
                  type="button"
                  onClick={() => handleUpgradeFromSms("premium", 20000)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-[#A3845B]/40 hover:border-[#A3845B] text-[#FAF7F0] rounded font-bold text-[10px] shadow transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-w-[120px]"
                >
                  <span>고급 업그레이드 (+20k)</span>
                  <span className="text-[7px] font-normal text-gray-400 mt-0.5">36p 분석 해제</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpgradeFromSms("deep", 35000)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] rounded font-bold text-[10px] shadow transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-w-[120px]"
                >
                  <span>프리미엄 업그레이드 (+35k)</span>
                  <span className="text-[7px] font-normal text-[#1C1613]/70 mt-0.5">51p 분석 해제</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPaid(true);
                    const url = new URL(window.location.href);
                    url.searchParams.delete("reportGrade");
                    window.location.href = url.toString();
                  }}
                  className="text-[8.5px] text-[#A3845B]/60 hover:text-white underline cursor-pointer shrink-0"
                >
                  [즉시 해제]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getMonthlyFortuneData = (monthNum, dayStemEl) => {
    const scores = {
      1: 85, 2: 90, 3: 80, 4: 75, 5: 70, 6: 75, 7: 85, 8: 95, 9: 90, 10: 85, 11: 80, 12: 85
    };
    
    let score = scores[monthNum] || 80;
    if (dayStemEl === "목" && [1, 2, 3].includes(monthNum)) score += 5;
    if (dayStemEl === "화" && [4, 5, 6].includes(monthNum)) score += 5;
    if (dayStemEl === "금" && [7, 8, 9].includes(monthNum)) score += 5;
    if (dayStemEl === "수" && [10, 11, 12].includes(monthNum)) score += 5;
    if (score > 100) score = 100;
    if (score < 50) score = 50;

    const monthDetails = {
      1: {
        summary: "동풍이 솔솔 불어 얼어붙은 대지가 풀리며 새로운 기회가 움트는 달",
        analysis: "새로운 해의 첫 절기가 시작되어 주변인들로부터 다양한 정보와 이직, 동업 제안이 밀려듭니다. 기세는 좋으나 세운의 중심 화기가 본격 활동하기 전이므로 아직 관망이 유리합니다.",
        tactics: "밀려오는 제안에 솔깃하더라도 즉답을 피하고 최소 일주일 동안 계약 명세를 철저히 검토하는 필터를 마련하십시오."
      },
      2: {
        summary: "초목이 대지를 뚫고 나와 파릇파릇 푸르른 싹을 하늘로 뻗치는 달",
        analysis: "기운이 뻗어 나가는 시기이므로 내 주체성이 팽창합니다. 직무 상 의견 대립이나 부부 대화 시 고집을 부려 오해를 사기 쉬우니 주의해야 하는 달입니다.",
        tactics: "자신의 주장을 전개할 때 목소리를 낮추고 상대의 의견에 10초간 눈을 감고 미소로 대답하는 온화함을 유지하십시오."
      },
      3: {
        summary: "봄비가 내리며 대지가 비옥해지고 나무들이 깊게 뿌리를 뻗는 달",
        analysis: "토 기운의 중재로 그동안 꼬였던 대인관계나 계약의 마찰이 서서히 실마리를 찾는 달입니다. 든든한 조력자나 문서상의 안정이 깃들게 됩니다.",
        tactics: "나를 돕겠다는 귀인을 만나면 인색하게 대하지 말고 가벼운 식사 대접이나 감사 인사를 아끼지 마십시오."
      },
      4: {
        summary: "초여름의 기운이 피어나 화려한 불꽃이 대지 위를 넘보기 시작하는 달",
        analysis: "슬슬 열기가 팽창하므로 경제적인 투자 심리가 자극됩니다. 단타 주식이나 코인, 혹은 과도한 부업 창업 등으로 목돈이 묶일 손재수가 엿보입니다.",
        tactics: "내 지갑의 빗장을 굳게 걸어 잠그십시오. 어떠한 투자 권유도 올해 하반기로 결정을 과감하게 유예해야 안전합니다."
      },
      5: {
        summary: "맹렬한 태양이 하늘 높이 솟아올라 대지를 펄펄 끓게 만드는 한여름의 달",
        analysis: "1년 중 병오년의 불꽃이 가장 사납게 요동치는 최대의 고비입니다. 조급증, 다혈질적 감정 충돌, 심혈관계 피로 등이 한꺼번에 찾아와 판단력이 흐려질 수 있습니다.",
        tactics: "중요한 계약 서명이나 사직서 제출 등 인생의 대사는 절대로 피하십시오. 냉수를 자주 마시고 침묵하는 것이 최선의 개운입니다."
      },
      6: {
        summary: "뜨거운 가마솥 안에서 대지가 금속을 녹이고 에너지를 가두는 달",
        analysis: "화기가 흙(土) 속에 갇히는 절기로, 갈등의 정점은 지나갔으나 여전히 답답한 흐름입니다. 이성적인 태도를 되찾기 시작하지만 아직은 확장보다 내실 다지기가 길합니다.",
        tactics: "격렬한 운동보다 저녁 시간 소금물 족욕을 15분 이상 실천하여 몸속의 뜨거운 상체 열기를 아래로 끌어내리는 수승화강을 실천하십시오."
      },
      7: {
        summary: "맑은 가을바람이 살랑이며 타오르던 불꽃의 기세를 꺾는 결실의 달",
        analysis: "하늘의 금(金) 기운이 세운의 뜨거운 불기를 식혀주니 이성이 제자리로 돌아오고, 상반기에 꼬였던 계약이나 소송, 금전 갈등이 풀리기 시작하는 전환점입니다.",
        tactics: "새로운 부서 이동이나 이력서 제출, 투자 자산의 포트폴리오 리밸런싱을 단행하기에 가장 좋은 시기입니다."
      },
      8: {
        summary: "들판의 곡식이 황금빛으로 물들고 가을 서리가 냉철함을 주는 달",
        analysis: "가장 풍요롭고 길한 에너지의 균형이 완성되는 달입니다. 귀인의 손길이 실질적인 도움(금전 혹은 이직 확정)으로 연결되며, 시험 합격 소식 등이 들려옵니다.",
        tactics: "주변의 추천이나 자문을 경청하며 적극적으로 추진력을 발휘하십시오. 우물쭈물 기회를 놓치지 않는 것이 핵심입니다."
      },
      9: {
        summary: "낙엽이 지고 가을걷이가 끝나 창고에 곡식을 차곡차곡 쌓아두는 달",
        analysis: "풍성한 결실을 마무리하고 안전하게 내실을 굳히는 달입니다. 현실적인 실리를 톡톡히 챙길 수 있는 현금 흐름의 호조가 나타납니다.",
        tactics: "수확한 금전의 50% 이상은 예적금이나 안정적인 문서 자산으로 묶어두어 불필요한 누수를 원천 차단하십시오."
      },
      10: {
        summary: "겨울의 초입, 차가운 빗방울이 대지를 적시며 만물을 동결하려는 달",
        analysis: "겨울의 물(Water) 에너지가 세운의 화기와 자연스럽게 마주하며 긴장감을 유도합니다. 직장 내 상사와의 마찰이 살짝 예상되므로 겸손한 태도가 유용합니다.",
        tactics: "공적인 자리에서 튀는 행동을 자제하고, 윗사람의 지시에 성실히 순응하여 꼬투리를 잡히지 않도록 조심하십시오."
      },
      11: {
        summary: "차디찬 얼음 아래로 맑은 온천수가 흐르듯 보이지 않는 통찰력이 샘솟는 달",
        analysis: "세운의 오화(午)와 월운의 자수(子)가 마주치는 자오충(子午沖)의 영향으로 급작스러운 이사, 인사이동, 대인관계 단절 등의 환경 변화가 일어날 수 있습니다.",
        tactics: "변화에 감정적으로 맞서지 말고 흐름을 유연하게 수용하십시오. 지나치게 어두운 장소나 한밤중 외출은 자제해야 합니다."
      },
      12: {
        summary: "흰 눈이 온 세상을 뒤덮고 조용히 새봄의 기운을 잉태하는 평온의 달",
        analysis: "병오년 한 해의 풍파가 마무리되고 평화로운 안정감이 찾아옵니다. 가족들과의 화목함이 돈독해지며, 1년 농사에 대한 보람을 갈무리하는 따뜻한 휴식의 시기입니다.",
        tactics: "가족과 함께 따뜻한 차를 마시며 대화를 나누고, 나를 도운 지인들에게 감사 연하장을 보내는 등 온정을 표현해 기운을 갈무리하십시오."
      }
    };

    return {
      score,
      ...monthDetails[monthNum]
    };
  };

  const getNewYearPagesConfiguration = (name, partnerName) => {
    const isTojeong = typeParam === "tojeong";
    const suffix = isTojeong ? "토정비결" : "신수비결";
    
    if (isTojeong) {
      return [
        { page: 1, type: "tj_cover", title: "2026년 병오년 정통 토정비결 표지" },
        { page: 2, type: "tj_preface", title: "토정 이지함의 역학적 지혜와 서막" },
        { page: 3, type: "tj_intro_saju", title: "의뢰인 명조 분석과 오행 원국 배치" },
        { page: 4, type: "tj_daewun_flow", title: "생애 대운 흐름과 신년 기류의 융합" },
        { page: 5, type: "tj_seoun_analysis", title: "병오년 천지합화 세운 총평" },
        { page: 6, type: "tj_wealth", title: "재물운 심층 분석 (Wealth Deep Dive)" },
        { page: 7, type: "tj_career", title: "직장 및 커리어운 분석 (Career Deep Dive)" },
        { page: 8, type: "tj_love", title: "애정 및 대인관계운 분석 (Love Deep Dive)" },
        { page: 9, type: "tj_health", title: "건강 및 신수운 분석 (Health Deep Dive)" },
        { page: 10, type: "tj_monthly", title: "음력 1월 상세 토정비결", monthNum: 1 },
        { page: 11, type: "tj_monthly", title: "음력 2월 상세 토정비결", monthNum: 2 },
        { page: 12, type: "tj_monthly", title: "음력 3월 상세 토정비결", monthNum: 3 },
        { page: 13, type: "tj_monthly", title: "음력 4월 상세 토정비결", monthNum: 4 },
        { page: 14, type: "tj_monthly", title: "음력 5월 상세 토정비결", monthNum: 5 },
        { page: 15, type: "tj_monthly", title: "음력 6월 상세 토정비결", monthNum: 6 },
        { page: 16, type: "tj_monthly", title: "음력 7월 상세 토정비결", monthNum: 7 },
        { page: 17, type: "tj_monthly", title: "음력 8월 상세 토정비결", monthNum: 8 },
        { page: 18, type: "tj_monthly", title: "음력 9월 상세 토정비결", monthNum: 9 },
        { page: 19, type: "tj_monthly", title: "음력 10월 상세 토정비결", monthNum: 10 },
        { page: 20, type: "tj_monthly", title: "음력 11월 상세 토정비결", monthNum: 11 },
        { page: 21, type: "tj_monthly", title: "음력 12월 상세 토정비결", monthNum: 12 },
        { page: 22, type: "tj_action_plan", title: "올해의 개운(開運) 솔루션" },
        { page: 23, type: "tj_warning_advice", title: "올해의 조심할 점과 이지함 선생의 조언" },
        { page: 24, type: "tj_fengshui", title: "신년 공간 풍수 인테리어 처방" },
        { page: 25, type: "tj_lucky_items", title: "신년 추천 수호 소품 리스트" },
        { page: 26, type: "tj_diet", title: "체질 맞춤형 오행 섭생 처방" },
        { page: 27, type: "tj_worry_solution", title: "의뢰인 고민 극복 맞춤 비책" },
        { page: 28, type: "tj_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" },
        { page: 29, type: "tj_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" },
        { page: 30, type: "tj_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" },
        { page: 31, type: "tj_final_blessing", title: "병오년 성공 기원 최종 축원문" }
      ];
    }

    return [
      { page: 1, type: "ny_cover", title: `2026년 병오년(丙午年) 혜안당 정통 ${suffix} 표지` },
      { page: 2, type: "ny_preface", title: "새해를 맞이하는 마음가짐과 명리 서막" },
      { page: 3, type: "ny_intro_saju", title: "의뢰인 명조(命造) 분석과 오행 원국 배치" },
      { page: 4, type: "ny_daewun_flow", title: "생애 대운(大運)의 흐름과 2026년의 영향" },
      { page: 5, type: "ny_seoun_analysis", title: "병오년 천지합화(天地合火) 세운 총평" },
      { page: 6, type: "ny_stem_harmony", title: "일간(日干) 오행과 병오년 불꽃 기류 융합" },
      { page: 7, type: "ny_ilju_harmony", title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" },
      { page: 8, type: "ny_elements_balance", title: "신년 오행 과잉/결핍 진단" },
      { page: 9, type: "ny_elements_supplement", title: "부족한 오행을 채우는 일상 개운법" },
      { page: 10, type: "ny_health_presc", title: "세운 기류 변화에 따른 신년 건강 처방" },
      { page: 11, type: "ny_mind_meditation", title: "스트레스 조율 및 정신 건강 명상 처방" },
      { page: 12, type: "ny_lucky_secrets", title: "병오년 맞춤 신년 행운 비방" },
      { page: 13, type: "ny_season_spring", title: "봄철(음력 1~3월) 계절적 세부 기운과 전략" },
      { page: 14, type: "ny_monthly", title: `음력 1월 상세 ${suffix}`, monthNum: 1 },
      { page: 15, type: "ny_monthly", title: `음력 2월 상세 ${suffix}`, monthNum: 2 },
      { page: 16, type: "ny_monthly", title: `음력 3월 상세 ${suffix}`, monthNum: 3 },
      { page: 17, type: "ny_season_summer", title: "여름철(음력 4~6월) 계절적 세부 기운과 전략" },
      { page: 18, type: "ny_monthly", title: `음력 4월 상세 ${suffix}`, monthNum: 4 },
      { page: 19, type: "ny_monthly", title: `음력 5월 상세 ${suffix}`, monthNum: 5 },
      { page: 20, type: "ny_monthly", title: `음력 6월 상세 ${suffix}`, monthNum: 6 },
      { page: 21, type: "ny_season_autumn", title: "가을철(음력 7~9월) 계절적 세부 기운과 전략" },
      { page: 22, type: "ny_monthly", title: `음력 7월 상세 ${suffix}`, monthNum: 7 },
      { page: 23, type: "ny_monthly", title: `음력 8월 상세 ${suffix}`, monthNum: 8 },
      { page: 24, type: "ny_monthly", title: `음력 9월 상세 ${suffix}`, monthNum: 9 },
      { page: 25, type: "ny_season_winter", title: "겨울철(음력 10~12월) 계절적 세부 기운과 전략" },
      { page: 26, type: "ny_monthly", title: `음력 10월 상세 ${suffix}`, monthNum: 10 },
      { page: 27, type: "ny_monthly", title: `음력 11월 상세 ${suffix}`, monthNum: 11 },
      { page: 28, type: "ny_monthly", title: `음력 12월 상세 ${suffix}`, monthNum: 12 },
      { page: 29, type: "ny_wealth_fortune", title: "신년 재물 및 사업운 분석" },
      { page: 30, type: "ny_wealth_portfolio", title: "오행별 추천 투자 스타일 및 재무 가이드" },
      { page: 31, type: "ny_career_fortune", title: "신년 직장 및 커리어운세" },
      { page: 32, type: "ny_career_detailed", title: "이직 및 승진 상세 타이밍 가이드" },
      { page: 33, type: "ny_love_fortune", title: "신년 연애 및 가정운 주파수 조율" },
      { page: 34, type: "ny_social_life", title: "신년 인맥 관리 및 대인관계 조율" },
      { page: 35, type: "ny_study_fortune", title: "신년 학업 및 시험운 처방" },
      { page: 36, type: "ny_gossip_defense", title: "신년 구설 및 시비수 예방 수칙" },
      { page: 37, type: "ny_sinsal_active", title: "신년 3대 신살 작동 현황 분석" },
      { page: 38, type: "ny_gwiin_harmony", title: "신년 인연 및 귀인 조화 분석" },
      { page: 39, type: "ny_warning_period", title: "치명적인 액난 경보 및 방어 비책" },
      { page: 40, type: "ny_worry_solution", title: "고민 해결 맞춤형 솔루션" },
      { page: 41, type: "ny_personal_worry", title: "의뢰인 맞춤형 고민 정밀 비책" },
      { page: 42, type: "ny_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" },
      { page: 43, type: "ny_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" },
      { page: 44, type: "ny_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" },
      { page: 45, type: "ny_roadmap_2030", title: "2030년 경술년(庚戌年) 세운 로드맵" },
      { page: 46, type: "ny_roadmap_2031", title: "2031년 신해년(辛亥年) 세운 로드맵" },
      { page: 47, type: "ny_action_rules", title: "신년 개운 실천 3대 행동 강령" },
      { page: 48, type: "ny_fengshui_interior", title: "신년 공간 풍수 인테리어 처방" },
      { page: 49, type: "ny_lucky_items", title: "신년 추천 수호 소품 리스트" },
      { page: 50, type: "ny_lucky_fashion", title: "신년 패션 메이크업 스타일링 가이드" },
      { page: 51, type: "ny_diet_presc", title: "체질 맞춤형 오행 섭생 음식 처방" },
      { page: 52, type: "ny_final_blessing", title: "병오년 성공 기원 마지막 축원문" }
    ];
  };
  const renderNewYearPageContent = (page, ctx) => {
    const { isFree, currentGrade, worryCategory } = ctx;
    
    const wrapLock = (content, sectionTitle) => {
      const isNewYear = type === "newyear" && typeParam !== "tojeong";
      const isTojeong = typeParam === "tojeong";
      const premiumOnlyPages = [
        "ny_ilju_harmony",
        "ny_sinsal_active",
        "ny_warning_period",
        "ny_worry_solution",
        "ny_personal_worry",
        "ny_roadmap_2027",
        "ny_roadmap_2028",
        "ny_roadmap_2029",
        "ny_fengshui_interior"
      ];
      
      const isUpgradeLocked = isNewYear && currentGrade === "premium" && premiumOnlyPages.includes(page.type);
      const shouldBlur = !isTojeong && (isFree || isUpgradeLocked);

      return (
        <div className="relative min-h-[400px] flex flex-col justify-between">
          <div className={shouldBlur ? "blur-[5px] select-none pointer-events-none transition-all duration-300" : ""}>
            {content}
          </div>
          {isFree && renderLockOverlay(sectionTitle)}
          {!isFree && isUpgradeLocked && renderUpgradeOverlay(sectionTitle)}
        </div>
      );
    };

    switch (page.type) {
      // ----------------------------------------------------
      // [NEW] 토정비결 전용 30페이지 렌더링 케이스
      // ----------------------------------------------------
      case "tj_cover":
        return (
          <div className="text-center space-y-12 py-16 bg-[#FDFBF7] border border-[#E2DDD5]/80 rounded-lg p-8 shadow-inner relative min-h-[400px]">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.35em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-24 h-0.5 bg-[#A3845B]/40 mx-auto" />
            </div>
            <div className="space-y-6 py-8 overflow-hidden">
              <h1 className="font-myeongjo font-extrabold text-[#1A1A1A] tracking-widest leading-normal">
                <span className="block text-3xl md:text-5xl whitespace-nowrap">2026 丙午年</span>
                <span className="block text-xl sm:text-2xl md:text-4xl whitespace-nowrap break-keep mt-2">정통 토정비결 (土亭秘訣)</span>
              </h1>
              <p className="text-sm text-[#5F5F5F] font-light tracking-wide font-traditional">
                조선 명의 토정 이지함 선생의 비결로 풀어보는 귀하의 일생 지침 보감
              </p>
            </div>
            <div className="border border-[#E2DDD5] bg-white rounded-lg p-6 max-w-sm mx-auto space-y-4 text-xs shadow-sm text-left">
              <div className="grid grid-cols-2 gap-4 border-b border-[#E2DDD5]/50 pb-3">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">의뢰인 성명</span>
                  <span className="font-semibold text-gray-800 text-sm">{name} 님 ({gender})</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">출생 정보</span>
                  <span className="font-semibold text-gray-800">{year}년 {month}월 {day}일 {hour}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">분석 상품</span>
                  <span className="font-semibold text-gray-800">정통 토정비결</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">리포트 등급</span>
                  <span className="font-semibold text-emerald-700 uppercase font-sans font-bold">
                    고급 리포트 (무제한)
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-12">
              <span className="font-myeongjo text-sm font-bold text-[#1A1A1A]">慧眼堂 명리연구소</span>
              <p className="text-[9px] text-[#A3845B]/60 font-light">본 보감의 복제 및 무단 전재를 금합니다.</p>
            </div>
            
            {/* 혜안당 공식 직인 */}
            <div className="absolute right-8 bottom-8 select-none opacity-80">
              <svg viewBox="0 0 60 60" className="w-[45px] h-[45px] transform -rotate-12">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂印
                </text>
              </svg>
            </div>
          </div>
        );

      case "tj_preface":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">토정비결 서막 (土亭 序幕)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">토정 이지함의 역학적 지혜와 신년의 등대</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                토정비결은 조선 선조 시기의 대학자이자 기인인 <strong>토정 이지함(土亭 李之菡)</strong> 선생이 고단한 백성들의 흉함을 피하고 길함을 돕기 위해 천문 지리와 주역의 괘를 통속적으로 재해석하여 저술한 지혜서입니다.
              </p>
              <p>
                이지함 선생은 평생 동안 마포 강변의 흙집(土亭)에 머물며 스스로 가난한 삶을 자처하셨고, 길거리의 걸인들과 백성들의 고난을 직접 위로하셨습니다. 그분이 음양오행과 3대 상수(象數) 조합을 이용해 한 해의 길흉을 세밀하게 풀어낸 것은, 단순한 점술을 넘어 닥쳐올 고난을 미리 예방하고 지혜롭게 인생을 경영하고자 한 따뜻한 애민(愛民)정신의 발로였습니다.
              </p>
              <p>
                일반적인 주역이 64괘를 기반으로 하는 반면, 토정비결은 일 년의 흐름에 최적화하여 <strong>총 144가지의 세밀한 괘(卦)</strong>로 인생의 사계절을 풀어냅니다. 의뢰인 <strong>{name}</strong>님의 생년월일시와 주역의 수학적 상수 계산을 결합하여, 올해 병오년의 길흉화복을 다스릴 전용 비방을 수립하였습니다.
              </p>
            </div>

            {/* 신규 시각화: 괘 도출 메커니즘 다이어그램 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">⚙️ 토정비결 신년 괘(卦) 도출 프로세스</span>
              <div className="flex justify-center py-2">
                <svg viewBox="0 0 420 120" className="w-full max-w-[400px] h-auto font-sans">
                  {/* 상괘 박스 */}
                  <rect x="10" y="10" width="100" height="45" rx="5" fill="#FAF7F0" stroke="#A3845B" strokeWidth="1.5" />
                  <text x="60" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1A1A">상괘 (上卦)</text>
                  <text x="60" y="44" textAnchor="middle" fontSize="8" fill="#8A6F4C">생년 태세 수 (1~8)</text>

                  {/* 중괘 박스 */}
                  <rect x="160" y="10" width="100" height="45" rx="5" fill="#FAF7F0" stroke="#A3845B" strokeWidth="1.5" />
                  <text x="210" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1A1A">중괘 (中卦)</text>
                  <text x="210" y="44" textAnchor="middle" fontSize="8" fill="#8A6F4C">생월 대소 수 (1~6)</text>

                  {/* 하괘 박스 */}
                  <rect x="310" y="10" width="100" height="45" rx="5" fill="#FAF7F0" stroke="#A3845B" strokeWidth="1.5" />
                  <text x="360" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A1A1A">하괘 (下卦)</text>
                  <text x="360" y="44" textAnchor="middle" fontSize="8" fill="#8A6F4C">생일 주역 수 (1~3)</text>

                  {/* 연결 화살표들 */}
                  <path d="M 60 55 L 60 75 L 170 75" fill="none" stroke="#A3845B" strokeWidth="1.2" strokeDasharray="2,2" />
                  <path d="M 210 55 L 210 75" fill="none" stroke="#A3845B" strokeWidth="1.2" strokeDasharray="2,2" />
                  <path d="M 360 55 L 360 75 L 250 75" fill="none" stroke="#A3845B" strokeWidth="1.2" strokeDasharray="2,2" />
                  <polygon points="210,80 206,73 214,73" fill="#A3845B" />

                  {/* 결과물 박스 */}
                  <rect x="135" y="85" width="150" height="30" rx="4" fill="#1C1613" stroke="#A3845B" strokeWidth="1" />
                  <text x="210" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FAF7F0" letterSpacing="1">
                    신년 전용 괘합성 [총 144괘]
                  </text>
                </svg>
              </div>
              <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed text-justify">
                * 상괘, 중괘, 하괘의 조합으로 탄생한 3자리 숫자의 괘합(예: 312, 453 등)을 해독하여, 다가올 새해의 12달 각 절기 기류에 대해 일체 오차 없는 명리학적 가이드를 드립니다.
              </p>
            </div>
          </div>
        );

      case "tj_intro_saju": {
        const elementsList = [
          sajuInfo.year?.stemEl, sajuInfo.year?.branchEl,
          sajuInfo.month?.stemEl, sajuInfo.month?.branchEl,
          sajuInfo.day?.stemEl, sajuInfo.day?.branchEl,
          sajuInfo.hour?.stemEl, sajuInfo.hour?.branchEl
        ].filter(Boolean);

        const elementCounts = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
        elementsList.forEach(el => {
          if (elementCounts[el] !== undefined) {
            elementCounts[el]++;
          }
        });

        const elementColors = {
          "목": { fill: "#10B981", label: "木 (목/나무)" },
          "화": { fill: "#EF4444", label: "火 (화/불)" },
          "토": { fill: "#F59E0B", label: "土 (토/흙)" },
          "금": { fill: "#9CA3AF", label: "金 (금/쇠)" },
          "수": { fill: "#3B82F6", label: "水 (수/물)" }
        };

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조 분석 (命造 分析)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 <strong>{name}</strong>님이 태어난 우주적 순간의 여덟 글자(사주 원국) 배치입니다. 이는 의뢰인의 정신적 기틀이자 평생 변하지 않는 유전적 성향의 원형을 상징합니다.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.hour?.stem}{sajuInfo.hour?.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.hour?.stemEl}/{sajuInfo.hour?.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">{sajuInfo.day?.stem}{sajuInfo.day?.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">{sajuInfo.day?.stemEl}/{sajuInfo.day?.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.month?.stem}{sajuInfo.month?.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.month?.stemEl}/{sajuInfo.month?.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.year?.stem}{sajuInfo.year?.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.year?.stemEl}/{sajuInfo.year?.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <p>
                  네 기둥 중에서도 나 자신을 대표하는 <strong>일간(日干: {sajuInfo.day?.stem})</strong>은 나의 자아를 상징하며, 년주({sajuInfo.year?.stem}{sajuInfo.year?.branch})는 나의 든든한 가문과 사회적 뿌리를 의미합니다. 올 한 해 병오년의 기운이 이 여덟 글자와 마주하여 일으키는 상호 융합 작용을 상세 분석하여 최적의 대처 비책을 제공합니다.
                </p>
                <p>
                  각 기둥은 인생의 주요 전환점에 대응합니다. 년주는 삶의 시작점인 유아 및 초년을 규정하고, 월주는 학업에서 커리어의 정초를 다지는 청년기를 관장합니다. 일주는 주체적 자아를 확립해 나가는 중년의 성취와 안정을 지배하며, 시주는 노년의 운맥과 유산, 후손과의 상호 작용을 투영합니다.
                </p>
              </div>
            </div>

            {/* 신규 시각화: 오행 분포 차트 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📊 내 사주 원국 음양오행(陰陽五行) 분포 현황</span>
              <div className="space-y-3">
                {Object.keys(elementCounts).map(el => {
                  const count = elementCounts[el];
                  const percent = Math.round((count / 8) * 100);
                  const colorConfig = elementColors[el];
                  return (
                    <div key={el} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-gray-700">{colorConfig.label}</span>
                        <span className="text-[#A3845B] font-bold">{count}개 ({percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#E2DDD5]/40 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${percent > 0 ? percent : 2}%`, 
                            backgroundColor: colorConfig.fill 
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed text-justify border-t border-[#E2DDD5]/65 pt-2">
                * 오행의 고른 조화(각 1~2개 분포)가 갖춰질 때 삶의 풍파가 적고 평탄한 운을 유지합니다. 만약 특정 오행이 3개 이상 과다하거나 0개로 결핍되어 있다면, 해당 오행의 특성과 결부된 운명적 왜곡 현상이나 건강상의 불균형이 신년에 표출될 수 있으므로, 보완 기운을 적극 수렴하는 개운법 실천이 중요합니다.
              </p>
            </div>
          </div>
        );
      }

      case "tj_daewun_flow":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">대운 흐름 (大運 潮流)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">인생의 거대한 물결, 대운과 신년 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                명리학에서 <strong>대운(大運)</strong>이란 10년 주기로 움직이는 내 영혼의 도로 상태이자 기후를 의미하며, <strong>세운(歲運)</strong>은 매년 찾아오는 일시적인 날씨 변화에 비유됩니다. 아무리 날씨가 맑아도 도로가 험하면 속도를 낼 수 없고, 도로가 포장되어 있어도 폭풍우가 치면 조심해야 하듯, 이 두 물결의 유기적인 결합을 분석하는 것이 한 해 예측의 출발점입니다.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🌀 2026 신년 대운 및 세운 조화도</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span>대운-세운 에너지 융합 지수</span>
                    <span className="text-emerald-700 font-bold">85%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>
              </div>
              <p>
                의뢰인 {name}님의 타고난 일간 오행과 대운 지지의 상생 관계는 현재 안정기에 놓여 있습니다. 2026년 병오년의 맹렬한 화(火) 기류는 이 안정적인 도로 위에 타오르는 태양처럼 작용합니다. 사주 원국에 목(木)이 있다면 불의 세기가 증폭되어 성급함이 앞서기 쉽고, 수(水)가 있다면 뜨거운 열기와 부딪쳐 일시적인 변화와 마찰이 유도될 수 있습니다. 대운의 순탄한 토대를 믿고 세운의 과열을 지혜롭게 제어하는 수성이 최선의 길입니다.
              </p>
            </div>

            {/* 신규 시각화: 평생 대운 기류 변동 추이 곡선 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📈 평생 대운 기류 변동 추이 (Life-cycle Trend)</span>
              <div className="flex justify-center py-2">
                <svg viewBox="0 0 420 160" className="w-full max-w-[400px] h-auto font-sans">
                  <defs>
                    <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A3845B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A3845B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="30" y1="25" x2="390" y2="25" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="80" x2="390" y2="80" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="135" x2="390" y2="135" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Area & Path */}
                  <path d="M 30 135 Q 90 55 150 85 T 270 35 T 390 135" fill="url(#areaGrad)" />
                  <path d="M 30 135 Q 90 55 150 85 T 270 35 T 390 135" fill="none" stroke="#A3845B" strokeWidth="2" />

                  {/* Age Nodes */}
                  <circle cx="30" cy="135" r="3" fill="#A3845B" />
                  <text x="30" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">10대</text>
                  
                  <circle cx="102" cy="88" r="3" fill="#A3845B" />
                  <text x="102" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">20대</text>

                  <circle cx="174" cy="73" r="3" fill="#A3845B" />
                  <text x="174" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">30대</text>

                  {/* 현재 연령대 하이라이트 (30대~40대 사이) */}
                  <circle cx="210" cy="58" r="5" fill="#8B221E" />
                  <circle cx="210" cy="58" r="9" fill="none" stroke="#8B221E" strokeWidth="1" className="animate-ping" />
                  <line x1="210" y1="58" x2="210" y2="135" stroke="#8B221E" strokeWidth="1.2" strokeDasharray="2,2" />
                  <text x="210" y="42" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#8B221E">현재 대운 (2026)</text>
                  
                  <circle cx="246" cy="43" r="3" fill="#A3845B" />
                  <text x="246" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">40대</text>

                  <circle cx="318" cy="55" r="3" fill="#A3845B" />
                  <text x="318" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">50대</text>

                  <circle cx="390" cy="135" r="3" fill="#A3845B" />
                  <text x="390" y="148" textAnchor="middle" fontSize="7" fill="#8A6F4C">60대</text>

                  {/* Y축 라벨 */}
                  <text x="25" y="28" textAnchor="end" fontSize="6" fill="#8A6F4C">최고조</text>
                  <text x="25" y="83" textAnchor="end" fontSize="6" fill="#8A6F4C">평탄</text>
                  <text x="25" y="137" textAnchor="end" fontSize="6" fill="#8A6F4C">성찰기</text>
                </svg>
              </div>
              <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed text-justify">
                * 위 그래프는 평생 대운의 굴곡을 도식화한 예시 지표입니다. 붉은색 마커가 위치한 현재 대운 지점은 일생 중 가장 역동적이며 세운의 강한 화기운을 온전히 제련해 사회적 지위와 안정을 창출하기 좋은 골든타임 구간에 들어와 있음을 나타냅니다.
              </p>
            </div>
          </div>
        );

      case "tj_seoun_analysis": {
        const dayStemEl = sajuInfo.day?.stemEl || "목";
        const targetAdvice = {
          "목": "🔥 목생화(木生火) 작용으로 기운이 지나치게 설기되어 열정은 충만하나 심신의 번아웃이나 건강상 피로(특히 간, 혈압)가 우려됩니다. 적극적인 쉼과 완급 조절이 필요합니다.",
          "화": "🔥 화기운의 태과(太過)로 주변과의 마찰, 자존심 갈등 및 충동적인 이직/결단 위험이 1년 내내 도사립니다. 평정심을 지키고 10초 늦게 말하는 침묵 수행이 최선입니다.",
          "토": "🔥 화생토(火生土)의 뜨거운 문서운이 깃들어 시험, 승진, 계약 성취는 유리하나, 생각이 꼬리를 물어 우물쭈물 기회를 놓치거나 내면의 정서적 답답함이 유발될 수 있습니다.",
          "금": "🔥 화극금(火剋金)으로 거대한 용광로 속에 금속이 제련되는 명예의 해입니다. 커리어 성장의 영광이 있으나 윗사람 또는 조직의 과도한 압박(관성 스트레스)을 지혜롭게 식혀야 합니다.",
          "수": "🔥 수극화(水剋火)의 활발한 재정 전투가 개시됩니다. 큰돈을 만질 수 있는 식상생재의 기회가 열리나, 분에 넘치는 레버리지 투자나 지인 거래 시 자칫 큰 누수가 일어날 수 있습니다."
        }[dayStemEl] || "병오년의 천지합화 불꽃 기류가 사주 8자의 조화를 흔들며 강력한 변화의 기운을 유도하므로, 이성과 평정심을 바탕으로 수성하는 노력이 필요합니다.";

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">세운 총평 (歲運 總評)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 병오년(丙午年) 천지합화 세운의 궤적</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2026년 병오년(丙午年)은 하늘의 丙(양화)과 땅의 午(양화)가 완벽한 조화를 이루어 온 누리가 맹렬한 불꽃으로 뒤덮이는 **천지합화(天地合火)**의 기조를 띱니다. 이는 10년 주기 대운보다도 더 즉각적이고 강렬한 기온 변화와 같아서, 일상 곳곳에 급격한 활력과 조급증을 동시에 투영합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 일간 오행별 병오년 세운 비방 (의뢰인 명조 맞춤)</span>
                <p className="text-[10px] text-gray-700 font-light leading-relaxed">
                  의뢰인 <strong>{name}</strong>님의 대표 오행은 <strong>{dayStemEl}(日干)</strong> 기운입니다.<br />
                  {targetAdvice}
                </p>
              </div>

              <p>
                이 맹렬한 기맥은 나를 주도적으로 일어서게 하는 추진력이 되기도 하지만, 감정의 평정심을 잃고 악성 거래나 계약을 급하게 체결하는 리스크를 안겨줍니다. 아래 월별 불꽃 에너지 추이를 숙지하시어, 열기가 극에 달하는 계절에는 한 걸음 물러서는 안목이 필승의 열쇠입니다.
              </p>
            </div>

            {/* 신규 시각화: 월별 화기 에너지 추이 차트 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📊 병오년 음력 월별 화기(火氣) 에너지 기류 추이</span>
              <div className="flex justify-center py-2">
                <svg viewBox="0 0 420 140" className="w-full max-w-[400px] h-auto font-sans">
                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="390" y2="20" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="65" x2="390" y2="65" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="110" x2="390" y2="110" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Bars (1월 ~ 12월) */}
                  {[
                    { m: "1월", h: 30, c: "#3B82F6" },
                    { m: "2월", h: 40, c: "#60A5FA" },
                    { m: "3월", h: 50, c: "#F59E0B" },
                    { m: "4월", h: 75, c: "#EF4444" },
                    { m: "5월", h: 90, c: "#B91C1C" },
                    { m: "6월", h: 85, c: "#EF4444" },
                    { m: "7월", h: 60, c: "#F59E0B" },
                    { m: "8월", h: 45, c: "#10B981" },
                    { m: "9월", h: 35, c: "#10B981" },
                    { m: "10월", h: 25, c: "#3B82F6" },
                    { m: "11월", h: 20, c: "#1D4ED8" },
                    { m: "12월", h: 15, c: "#1E3A8A" }
                  ].map((item, idx) => {
                    const x = 42 + idx * 28;
                    const y = 110 - item.h;
                    const isPeak = idx === 4;
                    return (
                      <g key={idx}>
                        <rect 
                          x={x - 6} 
                          y={y} 
                          width="12" 
                          height={item.h} 
                          fill={item.c} 
                          rx="2" 
                        />
                        {isPeak && (
                          <text x={x} y={y - 4} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#B91C1C">극성(極盛)</text>
                        )}
                        <text x={x} y="122" textAnchor="middle" fontSize="7" fill="#8A6F4C">{item.m}</text>
                      </g>
                    );
                  })}

                  {/* Y축 라벨 */}
                  <text x="25" y="23" textAnchor="end" fontSize="6" fill="#8A6F4C">임계치</text>
                  <text x="25" y="68" textAnchor="end" fontSize="6" fill="#8A6F4C">보통</text>
                  <text x="25" y="112" textAnchor="end" fontSize="6" fill="#8A6F4C">안정</text>
                </svg>
              </div>
              <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed text-justify">
                * 병오년의 불꽃은 음력 5월(망종~소서 절기)에 극성한 최고조를 이루며, 음력 8월(신유월) 가을 서리가 내리며 안정을 찾고, 음력 11월 자오충(子午沖) 시기에 변동과 갈무리를 거칩니다. 최고조 시기에는 공격적 행위를 자제하십시오.
              </p>
            </div>
          </div>
        );
      }

      case "tj_wealth":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">재물운 (Wealth Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">재물 유입 타이밍과 누수 방지 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                올해 재물 흐름은 <strong>가을철(음력 7월~9월) 금(金) 기운</strong>이 세운의 과도한 화기를 제련하여 재물 문서로 안착시키는 골든타임을 맞이합니다. 새로운 무리한 주식/코인 투자는 봄과 여름철에 자금이 묶여 손재수(午午自刑)를 맞이하기 쉬우니 극히 엄금해야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 병오년 재정 손실 방지 3대 수성 강령</span>
                <div className="space-y-1.5 text-[10px] text-gray-650 font-light leading-relaxed">
                  <p><strong>1. 고위험성 모험 투자 금지:</strong> 상반기(음력 4~6월) 열기가 극대화될 때 고수익을 미끼로 한 주식 단타나 코인 모험은 현금을 묶어 손재수를 부릅니다.</p>
                  <p><strong>2. 지인 거래 및 보증 차단:</strong> 세운 지지의 午午 형살은 지인이나 가까운 동료와의 금전 융통 과정에서 관재수와 배신을 유발할 수 있으니 단호히 거절하십시오.</p>
                  <p><strong>3. 소득의 강제 자산화:</strong> 수익이 발생하는 즉시 최소 50% 이상을 임의 출금이 불가능한 예적금이나 부동산 청약 등 고정 문서 자산으로 잠그십시오.</p>
                </div>
              </div>
              
              <p className="bg-[#FAF7F0] p-3.5 rounded border border-[#E2DDD5]/60">
                💡 <strong>재무 전술:</strong> 가을(음력 8월 이후)에 유입되는 목돈은 수 기운(임대 소득, 안정 배당 등) 또는 안정성 있는 문서 형태로 보유하는 것이 가장 길합니다.
              </p>
            </div>

            {/* 신규 시각화: 포트폴리오 도넛 차트 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📊 병오년 맞춤 신년 재무 포트폴리오 배분 제안</span>
              <div className="flex justify-center items-center py-1">
                <svg viewBox="0 0 420 140" className="w-full max-w-[400px] h-auto font-sans">
                  {/* Donut Chart */}
                  <circle cx="90" cy="70" r="35" fill="none" stroke="#E5E7EB" strokeWidth="16" />
                  
                  {/* 안정적 문서 (40%) */}
                  <circle cx="90" cy="70" r="35" fill="none" stroke="#F59E0B" strokeWidth="16" 
                          strokeDasharray="88 220" strokeDashoffset="0" transform="rotate(-90 90 70)" />
                          
                  {/* 현금/안정예적금 (40%) */}
                  <circle cx="90" cy="70" r="35" fill="none" stroke="#3B82F6" strokeWidth="16" 
                          strokeDasharray="88 220" strokeDashoffset="-88" transform="rotate(-90 90 70)" />
                          
                  {/* 단기 유동성 (15%) */}
                  <circle cx="90" cy="70" r="35" fill="none" stroke="#10B981" strokeWidth="16" 
                          strokeDasharray="33 220" strokeDashoffset="-176" transform="rotate(-90 90 70)" />
                          
                  {/* 모험형 투자 한계선 (5%) */}
                  <circle cx="90" cy="70" r="35" fill="none" stroke="#EF4444" strokeWidth="16" 
                          strokeDasharray="11 220" strokeDashoffset="-209" transform="rotate(-90 90 70)" />

                  {/* 도넛 중심 텍스트 */}
                  <text x="90" y="66" textAnchor="middle" fontSize="6" fill="#8A6F4C">재무 성향</text>
                  <text x="90" y="78" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1C1613">수성(守成)</text>

                  {/* 범례 리스트 */}
                  <rect x="190" y="20" width="8" height="8" fill="#F59E0B" rx="1.5" />
                  <text x="204" y="27" fontSize="8" fontWeight="bold" fill="#374151">안정적 문서자산 (40%)</text>
                  <text x="204" y="38" fontSize="7" fill="#6B7280">국채, 우량 회사채, 부동산 청약 등</text>

                  <rect x="190" y="50" width="8" height="8" fill="#3B82F6" rx="1.5" />
                  <text x="204" y="57" fontSize="8" fontWeight="bold" fill="#374151">정기 예적금 및 금 현물 (40%)</text>
                  <text x="204" y="68" fontSize="7" fill="#6B7280">임의 출금이 불가능한 저축 상품</text>

                  <rect x="190" y="80" width="8" height="8" fill="#10B981" rx="1.5" />
                  <text x="204" y="87" fontSize="8" fontWeight="bold" fill="#374151">단기 비상 유동성 (15%)</text>
                  <text x="204" y="98" fontSize="7" fill="#6B7280">CMA 계좌 및 단기 대기성 자금</text>

                  <rect x="190" y="110" width="8" height="8" fill="#EF4444" rx="1.5" />
                  <text x="204" y="117" fontSize="8" fontWeight="bold" fill="#374151">모험 투자 최대 한계선 (5%)</text>
                  <text x="204" y="128" fontSize="7" fill="#6B7280">수동적 손실 수용 범위 내 주식/코인</text>
                </svg>
              </div>
            </div>
          </div>
        );

      case "tj_career":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">직장 &amp; 커리어운 (Career Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">이직, 승진 기회와 조직 내 귀인의 동향</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                직장 및 커리어에서는 귀하의 잠재력을 높이 평가하는 윗사람이나 선배(인성 귀인)의 천거가 예견됩니다. 특히 **음력 3월(진월)과 8월(유월)**에 문서 도장 날인 및 승진·이직에 관한 결정적 합의 기운이 강력하게 깃듭니다. 자격증 취득이나 공직 진출의 시험운도 하반기 결실의 계절에 대길합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">💼 병오년 커리어 로드맵 핵심 가이드</span>
                <div className="space-y-1.5 text-[10px] text-gray-650 font-light leading-relaxed">
                  <p><strong>• 골든타임 이직 단행:</strong> 음력 8월(양력 9월 전후)은 서쪽 방향의 문서운이 열리므로, 이 시기에 서기관이나 외근 비즈니스 위주의 조직으로 이직하는 것이 연봉 상승에 절대 유리합니다.</p>
                  <p><strong>• 2분기 구설 주의:</strong> 음력 5월 전후에는 화기운의 과부하로 상사나 동료와의 대립각이 서기 쉬우니, 비합리적인 지시에도 감정적 반발 대신 10분 유예 후 서면으로 보고하는 평정을 발휘하십시오.</p>
                </div>
              </div>
            </div>

            {/* 신규 시각화: 월별 커리어 운세 꺾은선 그래프 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📈 병오년 음력 월별 커리어 성취도 추이</span>
              <div className="flex justify-center py-2">
                <svg viewBox="0 0 420 140" className="w-full max-w-[400px] h-auto font-sans">
                  <defs>
                    <linearGradient id="careerAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="30" y1="20" x2="390" y2="20" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="65" x2="390" y2="65" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="30" y1="110" x2="390" y2="110" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Area beneath the line */}
                  <path d="M 42 110 L 42 55 L 70 47 L 98 25 L 126 55 L 154 70 L 182 62 L 210 47 L 238 20 L 266 32 L 294 40 L 322 55 L 350 47 L 350 110 Z" fill="url(#careerAreaGrad)" />

                  {/* Trend Line */}
                  <path d="M 42 55 L 70 47 L 98 25 L 126 55 L 154 70 L 182 62 L 210 47 L 238 20 L 266 32 L 294 40 L 322 55 L 350 47" fill="none" stroke="#3B82F6" strokeWidth="2" />

                  {/* Nodes & Labels */}
                  {[
                    { m: "1월", x: 42, y: 55 },
                    { m: "2월", x: 70, y: 47 },
                    { m: "3월", x: 98, y: 25, golden: true },
                    { m: "4월", x: 126, y: 55 },
                    { m: "5월", x: 154, y: 70, warn: true },
                    { m: "6월", x: 182, y: 62 },
                    { m: "7월", x: 210, y: 47 },
                    { m: "8월", x: 238, y: 20, golden: true },
                    { m: "9월", x: 266, y: 32 },
                    { m: "10월", x: 294, y: 40 },
                    { m: "11월", x: 322, y: 55 },
                    { m: "12월", x: 350, y: 47 }
                  ].map((pt, idx) => {
                    return (
                      <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r={pt.golden || pt.warn ? 4 : 2.5} fill={pt.golden ? "#D97706" : pt.warn ? "#EF4444" : "#3B82F6"} />
                        {pt.golden && (
                          <circle cx={pt.x} cy={pt.y} r="7" fill="none" stroke="#D97706" strokeWidth="0.8" className="animate-ping" />
                        )}
                        <text x={pt.x} y="122" textAnchor="middle" fontSize="7" fill="#8A6F4C">{pt.m}</text>
                      </g>
                    );
                  })}

                  {/* Highlight text labels */}
                  <text x="98" y="16" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#D97706">이직/결정</text>
                  <text x="238" y="11" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#D97706">최고조(승진)</text>
                  <text x="154" y="81" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#EF4444">구설경계</text>

                  {/* Y축 라벨 */}
                  <text x="25" y="23" textAnchor="end" fontSize="6" fill="#8A6F4C">대길(大吉)</text>
                  <text x="25" y="68" textAnchor="end" fontSize="6" fill="#8A6F4C">평이</text>
                  <text x="25" y="112" textAnchor="end" fontSize="6" fill="#8A6F4C">조율기</text>
                </svg>
              </div>
              <p className="text-[10px] text-[#5F5F5F] font-light leading-relaxed text-justify">
                * 성취도 분석 결과, 음력 3월과 8월이 한 해 중 가장 명예롭고 계약 성사율이 우수한 골든타임이며, 음력 5월은 감정 대립으로 인한 조직 내부 갈등을 각별히 주의해야 하는 조율기입니다.
              </p>
            </div>
          </div>
        );

      case "tj_love":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">애정 &amp; 대인관계 (Love Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">인연의 시작과 갈등 예방 대처 강령</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                <strong>솔로 의뢰인:</strong> 올해 하반기(음력 8월~10월)에 침착하고 지적인 이성을 소개받을 수 있는 강한 인연운이 들어옵니다. 예술이나 공부 모임 등 차분한 공간에서 인연이 시작될 확률이 높습니다.<br />
                <strong>커플 및 부부:</strong> 세운의 뜨거운 화기로 인해 사소한 의견 대립이 큰 말다툼으로 번지기 쉽습니다. 특히 한여름에 자존심 대립을 조심해야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 대인관계 안정 극대화 2대 강령</span>
                <div className="space-y-1.5 text-[10px] text-gray-650 font-light leading-relaxed">
                  <p><strong>• 공간적 거리두기 요결:</strong> 언쟁이 시작되려 할 때 같은 방에서 대화를 이어가면 화(火)의 열기가 폭발하므로, 즉각 30분간 야외 산책을 하거나 개인 독립 공간으로 자리를 옮겨 열을 식히십시오.</p>
                  <p><strong>• 음양 조화적 대화법:</strong> 상대방이 날카로운 말을 뱉을 때 맞대응하지 않고 10초간 호흡을 고른 뒤 유연한 목소리로 대답하는 '수(水)의 대화법'을 실행하여 살(煞)을 정화하십시오.</p>
                </div>
              </div>
            </div>

            {/* 신규 시각화: 대인관계 5대 지표 레이더 차트 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📊 신년 애정 및 대인관계 5대 지표 입체 분석</span>
              <div className="flex justify-center items-center py-1">
                <svg viewBox="0 0 420 140" className="w-full max-w-[400px] h-auto font-sans">
                  {/* Radar grid lines (Pentagons) */}
                  <polygon points="100,30 138,58 123.5,102.5 76.5,102.5 62,58" fill="none" stroke="#E2DDD5" strokeWidth="0.8" />
                  <polygon points="100,42 126.6,61.6 116.5,92.8 83.5,92.8 73.4,61.6" fill="none" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <polygon points="100,54 115.2,65.2 109.4,83 90.6,83 84.8,65.2" fill="none" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Axis lines */}
                  <line x1="100" y1="70" x2="100" y2="30" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="138" y2="58" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="123.5" y2="102.5" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="76.5" y2="102.5" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="62" y2="58" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Axis labels */}
                  <text x="100" y="24" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">신뢰도</text>
                  <text x="146" y="58" textAnchor="start" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">소통력</text>
                  <text x="128" y="111" textAnchor="start" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">공감도</text>
                  <text x="72" y="111" textAnchor="end" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">갈등조율</text>
                  <text x="54" y="58" textAnchor="end" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">열정</text>

                  {/* Data Shape */}
                  <polygon points="100,38 126.6,61.6 117.6,94.3 85.8,89.4 67.7,59.8" 
                           fill="#FDA4AF" fillOpacity="0.4" stroke="#F43F5E" strokeWidth="1.5" />

                  {/* Nodes */}
                  <circle cx="100" cy="38" r="2.5" fill="#F43F5E" />
                  <circle cx="126.6" cy="61.6" r="2.5" fill="#F43F5E" />
                  <circle cx="117.6" cy="94.3" r="2.5" fill="#F43F5E" />
                  <circle cx="85.8" cy="89.4" r="2.5" fill="#F43F5E" />
                  <circle cx="67.7" cy="59.8" r="2.5" fill="#F43F5E" />

                  {/* Legend/Info on the right */}
                  <rect x="200" y="20" width="8" height="8" fill="#F43F5E" rx="1.5" />
                  <text x="214" y="27" fontSize="8.5" fontWeight="bold" fill="#374151">신년 인연 에너지 상태</text>
                  
                  <text x="200" y="45" fontSize="7.5" fill="#4B5563">• 신뢰도 &amp; 열정 우수: 기본 애정 토대가 두터움</text>
                  <text x="200" y="58" fontSize="7.5" fill="#4B5563">• 갈등조율(60%) 요약: 감정 과열 시 조율력 약화</text>
                  
                  <rect x="200" y="76" width="180" height="42" rx="4" fill="#FAF7F0" stroke="#E2DDD5" strokeWidth="0.8" />
                  <text x="208" y="89" fontSize="7.5" fontWeight="bold" fill="#8B221E">🔑 관계 수호의 결론:</text>
                  <text x="208" y="100" fontSize="7" fill="#4B5563">감정의 폭발점인 여름철(음력 5~6월)에 자존심 대립을</text>
                  <text x="208" y="110" fontSize="7" fill="#4B5563">예방하고, 양보의 수(水) 기운을 먼저 내밀어야 성공합니다.</text>
                </svg>
              </div>
            </div>
          </div>
        );

      case "tj_health":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">건강 &amp; 신수 (Health Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조심할 질병수와 활력 충전 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                병오년의 강력한 불꽃 기운은 상체 상열감, 심혈관계 만성 피로, 안구 건조증을 유발하기 쉽습니다. 특히 체내 수분이 마르는 극심한 더위 시기(음력 5월)에는 탈수 및 무리한 장거리 야외 활동을 삼가야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🥗 음양 한열조습(寒熱燥濕) 섭생 요결</span>
                <div className="space-y-1.5 text-[10px] text-gray-650 font-light leading-relaxed">
                  <p><strong>• 수승화강(水昇火降) 족욕법:</strong> 찬 음료의 섭취는 위장(土)에 냉적을 쌓아 소화를 해치니 피하고, 취침 전 15분간 미지근한 물로 족욕을 행해 머리의 화기를 발아래로 유도하십시오.</p>
                  <p><strong>• 수기운 보양 섭생:</strong> 건조한 기관지와 안구를 보호하기 위해 물을 하루 1.5리터 이상 음용하고, 짠맛과 신맛이 나는 전통 차(매실, 오미자)를 즐겨 마셔 체내 음액을 보충하십시오.</p>
                </div>
              </div>
              <p className="bg-[#FAF7F0] p-3.5 rounded border border-[#E2DDD5]/60">
                ⚠️ <strong>유의 사항:</strong> 한여름(음력 5~6월) 뙤약볕 아래에서의 무리한 조깅이나 등산은 심혈관계 압박과 탈수 위험을 극대화하므로 가벼운 야간 산책이나 요가로 활력을 대체하는 것이 좋습니다.
              </p>
            </div>

            {/* 신규 시각화: 오장육부 오행 활력 레이더 차트 */}
            <div className="border border-[#E2DDD5] rounded-lg p-5 bg-[#FAF8F5] shadow-sm space-y-4">
              <span className="font-bold text-[#A3845B] text-xs block">📊 신체 오장육부 오행(五行) 건강 지표 분석</span>
              <div className="flex justify-center items-center py-1">
                <svg viewBox="0 0 420 140" className="w-full max-w-[400px] h-auto font-sans">
                  {/* Radar grid lines (Pentagons) */}
                  <polygon points="100,30 138,58 123.5,102.5 76.5,102.5 62,58" fill="none" stroke="#E2DDD5" strokeWidth="0.8" />
                  <polygon points="100,42 126.6,61.6 116.5,92.8 83.5,92.8 73.4,61.6" fill="none" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="2,2" />
                  <polygon points="100,54 115.2,65.2 109.4,83 90.6,83 84.8,65.2" fill="none" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Axis lines */}
                  <line x1="100" y1="70" x2="100" y2="30" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="138" y2="58" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="123.5" y2="102.5" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="76.5" y2="102.5" stroke="#E2DDD5" strokeWidth="0.5" />
                  <line x1="100" y1="70" x2="62" y2="58" stroke="#E2DDD5" strokeWidth="0.5" />

                  {/* Axis labels */}
                  <text x="100" y="24" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">火 (심장/소장)</text>
                  <text x="146" y="58" textAnchor="start" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">土 (비장/위장)</text>
                  <text x="128" y="111" textAnchor="start" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">金 (폐/대장)</text>
                  <text x="72" y="111" textAnchor="end" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">水 (신장/방광)</text>
                  <text x="54" y="58" textAnchor="end" fontSize="6.5" fontWeight="bold" fill="#8A6F4C">木 (간/담낭)</text>

                  {/* Data Shape */}
                  <polygon points="100,34 126.6,61.3 115.3,91.1 89.4,84.6 71.5,60.7" 
                           fill="#A7F3D0" fillOpacity="0.4" stroke="#10B981" strokeWidth="1.5" />

                  {/* Nodes */}
                  <circle cx="100" cy="34" r="2.5" fill="#10B981" />
                  <circle cx="126.6" cy="61.3" r="2.5" fill="#10B981" />
                  <circle cx="115.3" cy="91.1" r="2.5" fill="#10B981" />
                  <circle cx="89.4" cy="84.6" r="2.5" fill="#10B981" />
                  <circle cx="71.5" cy="60.7" r="2.5" fill="#10B981" />

                  {/* Legend/Info on the right */}
                  <rect x="200" y="20" width="8" height="8" fill="#10B981" rx="1.5" />
                  <text x="214" y="27" fontSize="8.5" fontWeight="bold" fill="#374151">신체 오행 장기 밸런스</text>
                  
                  <text x="200" y="45" fontSize="7.5" fill="#4B5563">• 火 (심장) 90% 과부하: 상열 피로 및 충혈 경계</text>
                  <text x="200" y="58" fontSize="7.5" fill="#4B5563">• 水 (신장) 45% 결핍: 진액 고갈 및 방광 주의</text>
                  
                  <rect x="200" y="76" width="180" height="42" rx="4" fill="#FAF7F0" stroke="#E2DDD5" strokeWidth="0.8" />
                  <text x="208" y="89" fontSize="7.5" fontWeight="bold" fill="#8B221E">🔑 건강 수호 결론:</text>
                  <text x="208" y="100" fontSize="7" fill="#4B5563">심장 열기를 끄고 신장 음액을 돕는 금수(金水)</text>
                  <text x="208" y="110" fontSize="7" fill="#4B5563">섭생(오미자차 음용 및 반신욕)을 필히 보강하십시오.</text>
                </svg>
              </div>
            </div>
          </div>
        );

      case "tj_monthly": {
        const mNum = page.monthNum;
        const data = getMonthlyFortuneData(mNum, sajuInfo?.day?.stemEl || "목");
        const gaugeColor = data.score >= 90 ? "#10B981" : data.score >= 75 ? "#F59E0B" : "#EF4444";
        const needleAngle = (data.score / 100) * 180 - 180; // -180 ~ 0도 범위 회전

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">월별 상세 운세 (Monthly Timeline)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 {mNum}월 토정비결 상세 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            {/* 개편된 시각화: 월별 운세 다이얼 게이지 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-4 flex flex-col items-center">
              <span className="font-bold text-[#A3845B] text-xs block text-center w-full">🎯 음력 {mNum}월 운세 종합 지수</span>
              <div className="relative w-[180px] h-[105px] flex justify-center">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <defs>
                    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                  
                  {/* Gauge Arc */}
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="#F3F4F6" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#dialGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="235" strokeDashoffset="24" />
                  
                  {/* Needle Center Pin */}
                  <circle cx="100" cy="90" r="6" fill="#1C1613" />
                  
                  {/* Needle */}
                  <line 
                    x1="100" 
                    y1="90" 
                    x2="155" 
                    y2="40" 
                    stroke="#1C1613" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                    transform={`rotate(${needleAngle} 100 90)`}
                    className="transition-transform duration-700 ease-out"
                  />
                </svg>
                {/* Score Text */}
                <div className="absolute bottom-2 text-center">
                  <span className="text-xl font-black font-sans" style={{ color: gaugeColor }}>{data.score}</span>
                  <span className="text-[10px] text-gray-500 font-semibold ml-0.5">점</span>
                </div>
              </div>
              <p className="font-myeongjo text-xs font-bold text-gray-800 leading-snug pt-2 border-t border-[#E2DDD5]/40 max-w-md mx-auto text-center break-keep">
                "{data.summary}"
              </p>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="space-y-1">
                <span className="font-bold text-[#8A6F4C] block">🔍 本월 흐름 정밀 분석</span>
                <p className="text-justify font-light text-gray-600 bg-white p-3 rounded border border-gray-100">
                  {data.analysis}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#8A6F4C] block">💡 이번 달 행동 개운 수칙</span>
                <p className="text-justify font-light text-gray-600 bg-[#FAF7F0]/40 p-3 rounded border border-[#E2DDD5]/40">
                  {data.tactics}
                </p>
              </div>
              <p className="text-[9px] text-[#A3845B]/60 font-light border-t border-gray-100 pt-2 text-justify leading-relaxed">
                * 월간 운세 지수는 이지함 선생의 조언 괘를 바탕으로 의뢰인의 일간 오행과 해당 월의 절기 기류를 매칭한 연산 결과입니다. 지수가 다소 낮더라도 개운 수칙을 이행할 때 부정적 살(煞)을 유연하게 피해 갈 수 있습니다.
              </p>
            </div>
          </div>
        );
      }

      case "tj_action_plan": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const presets = {
          "목": { color: "청록 / 초록 (Green)", number: "3, 8", direction: "동쪽 (East)", items: "나무 소재 키링, 아로마 수목 향수", colorHex: "#22c55e", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900",
            actions: ["아침 공원 산책 (목 기운 충전)", "나무 재질 소품 책상 위 배치", "청색 또는 녹색 계열 의상 착용", "동쪽 창가에서 업무 시작"],
            monthly: ["1~3월 ⭐⭐⭐⭐⭐", "4~6월 ⭐⭐⭐⭐", "7~9월 ⭐⭐⭐", "10~12월 ⭐⭐⭐⭐"]
          },
          "화": { color: "적색 / 주황 (Red)", number: "2, 7", direction: "남쪽 (South)", items: "가죽 카드 홀더, 우디 캔들", colorHex: "#ef4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-900",
            actions: ["태양이 떠오르는 일출 명상 (화 기운 충전)", "붉은 계열 소품 남쪽 공간 배치", "밝고 활기찬 아침 루틴 구축", "인간관계에서 먼저 손 내밀기"],
            monthly: ["1~3월 ⭐⭐⭐⭐", "4~6월 ⭐⭐⭐⭐⭐", "7~9월 ⭐⭐⭐⭐", "10~12월 ⭐⭐⭐"]
          },
          "토": { color: "황색 / 베이지 (Yellow)", number: "5, 10", direction: "중앙 (Center)", items: "도자기 머그컵, 오렌지 립밤", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900",
            actions: ["식사 후 규칙적인 소화 산책 (토 기운 충전)", "황토색 계열 소품 거실 중앙 배치", "일과 정리 및 노트 정리 습관 형성", "주변인과 신뢰 쌓는 약속 이행"],
            monthly: ["1~3월 ⭐⭐⭐", "4~6월 ⭐⭐⭐⭐", "7~9월 ⭐⭐⭐⭐⭐", "10~12월 ⭐⭐⭐⭐"]
          },
          "금": { color: "백색 / 실버 (White)", number: "4, 9", direction: "서쪽 (West)", items: "메탈 스냅 시계, 실버 액세서리", colorHex: "#94a3b8", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900",
            actions: ["정확한 계획 수립 후 실행 (금 기운 충전)", "메탈 소품 서쪽 공간 배치", "불필요한 관계 단정하게 정리", "규칙적인 절제와 단호한 결단 실천"],
            monthly: ["1~3월 ⭐⭐⭐⭐", "4~6월 ⭐⭐⭐", "7~9월 ⭐⭐⭐⭐⭐", "10~12월 ⭐⭐⭐⭐"]
          },
          "수": { color: "흑색 / 네이비 (Black)", number: "1, 6", direction: "북쪽 (North)", items: "어두운 네이비 의상, 미네랄 워터 미스트", colorHex: "#3b82f6", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900",
            actions: ["저녁 족욕 및 명상 수련 (수 기운 충전)", "검은색/네이비 소품 북쪽 공간 배치", "독서와 깊은 성찰로 지혜 축적", "급하게 서두르지 않는 여유 실천"],
            monthly: ["1~3월 ⭐⭐⭐⭐⭐", "4~6월 ⭐⭐⭐", "7~9월 ⭐⭐⭐⭐", "10~12월 ⭐⭐⭐⭐"]
          }
        }[dayStemEl] || { color: "황색", number: "5, 10", direction: "중앙", items: "소품", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", actions: ["꾸준한 실천"], monthly: [] };

        const openingScores = [
          { label: "재물 개운 가능성", value: 82, color: "bg-amber-500" },
          { label: "대인관계 호전도", value: 88, color: "bg-emerald-500" },
          { label: "건강 기운 보강도", value: 76, color: "bg-blue-500" },
          { label: "직업/사업 활성도", value: 85, color: "bg-purple-500" }
        ];

        return (
          <div className="space-y-6 py-4">
            {/* 헤더 */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">開運 行動 攻略 (개운 행동 공략)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">올해의 개운(開運) 솔루션</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-xs text-gray-500 font-light">사주의 기운 불균형을 일상의 실천으로 보완하는 명리 개운법</p>
            </div>

            {/* 오행 처방 요약 카드 */}
            <div className={`${presets.bg} border ${presets.border} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: presets.colorHex }}>
                  <span className="text-white font-bold text-sm">{dayStemEl}</span>
                </div>
                <div>
                  <span className={`font-bold text-sm ${presets.text}`}>{name}님의 일간 기운: <strong>{dayStemEl}(</strong>{dayStemEl === "목" ? "木" : dayStemEl === "화" ? "火" : dayStemEl === "토" ? "土" : dayStemEl === "금" ? "金" : "水"}<strong>) 기질</strong></span>
                  <p className="text-[10px] text-gray-500 font-light mt-0.5">올해 부족한 기운을 채우는 맞춤 개운 처방</p>
                </div>
              </div>

              {/* 행운 처방 4종 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-semibold block mb-1">🎨 수호 색상</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: presets.colorHex }} />
                    <span className="font-bold text-[11px] text-gray-800">{presets.color}</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-semibold block mb-1">🔢 행운의 숫자</span>
                  <span className="font-bold text-[11px] text-gray-800">{presets.number}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-semibold block mb-1">🧭 개운 방향</span>
                  <span className="font-bold text-[11px] text-gray-800">{presets.direction}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[9px] text-gray-400 font-semibold block mb-1">🎁 수호 아이템</span>
                  <span className="font-bold text-[11px] text-gray-800">{presets.items}</span>
                </div>
              </div>
            </div>

            {/* 개운 실천 지수 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                📊 개운 실천 시 예상 운세 보정 지수
              </h4>
              <div className="space-y-3">
                {openingScores.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-[#A3845B]">{item.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 월별 개운 에너지 타임라인 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">📅 분기별 개운 에너지 지수</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                {presets.monthly.map((item, i) => (
                  <div key={i} className="bg-[#FAF7F0] rounded-lg p-2.5 border border-[#E2DDD5]/50">
                    <span className="font-light text-gray-600 leading-relaxed block">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 실천 행동 지침 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                ✅ 일상 속 4대 개운 행동 수칙
              </h4>
              <div className="space-y-2">
                {presets.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#A3845B]/15 text-[#A3845B] border border-[#A3845B]/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-[11px] text-gray-700 font-light leading-relaxed">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 개운 선언 박스 */}
            <div className="bg-gradient-to-br from-[#1C1613] to-[#2C2018] border border-[#A3845B]/40 rounded-2xl p-5 text-center space-y-2 shadow-md">
              <span className="text-[9px] tracking-widest text-[#A3845B] font-myeongjo">— 병오년 개운 선언문 —</span>
              <p className="font-myeongjo text-xs font-semibold text-[#FAF7F0] leading-relaxed">
                "나는 오늘부터 {dayStemEl}의 기운을 적극적으로 일상에 주입하여, 2026년 병오년의 세운 기류 속에서 재물과 건강과 명예의 세 마리 토끼를 온전히 잡는다."
              </p>
              <span className="text-[9px] text-[#A3845B]/70">매일 아침 선언 후 하루를 시작하십시오.</span>
            </div>
          </div>
        );
      }

      case "tj_warning_advice": {
        const dayStemEl2 = sajuInfo?.day?.stemEl || "목";
        const warningInfo = {
          "목": {
            place: "습하고 바람이 강하게 부는 협곡이나 지하 터널",
            surname: "금(金) 성향을 지닌 성씨 (경, 신, 민, 유 씨 등)",
            behavior: "주변인과의 동업 서명 및 섣부른 구두 보증",
            danger1: { label: "금전 손실 위험도", value: 72, period: "음력 7~8월 (금 기운 충돌)" },
            danger2: { label: "인간관계 구설 위험도", value: 60, period: "음력 11~12월 (금극목 충돌)" },
            checklist: ["나무 소재 계약서에 서명할 때 반드시 법률 검토 후 진행", "새벽 강변이나 습한 지역 혼자 방문 삼가기", "경(庚)·신(辛) 일주를 지닌 지인과의 공동사업 보류", "홧김에 던지는 감정 소통 대신 24시간 냉각 후 대화"],
            phrase: "조급한 나무는 뿌리가 얕고, 서두르는 봄꽃은 서리에 꺾인다. 깊이 내려가 뿌리를 단단히 할 때 하늘이 복을 보내리라."
          },
          "화": {
            place: "화재나 인화 물질이 범람하는 주방, 사우나, 유흥가",
            surname: "수(水) 성향을 지닌 성씨 (임, 계, 조, 하 씨 등)",
            behavior: "홧김에 던지는 이직 발언 및 충동적 감정 표출",
            danger1: { label: "화재·사고 위험도", value: 78, period: "음력 5월 (병오 자형 극화)" },
            danger2: { label: "감정 충돌 위험도", value: 68, period: "음력 11월 (수화기제 대립)" },
            checklist: ["과도한 음주 자리에서 즉흥적 결정 보류", "뜨거운 주방·사우나 장시간 체류 자제", "임·계·하 씨 성향의 분들과 금전 보증 절대 금지", "분노가 치밀 때 바로 말하지 않고 세 번 참기"],
            phrase: "뜨거운 불꽃이 닿는 곳에 재가 남듯, 분노의 말은 귀한 인연을 재로 만든다. 차갑게 식힌 뒤에야 빛이 살아난다."
          },
          "토": {
            place: "토사가 무너질 염려가 있거나 먼지가 자욱한 공사장",
            surname: "목(木) 성향을 지닌 성씨 (갑, 을, 임, 박 씨 등)",
            behavior: "타인과의 구설에 동조하여 뒷얘기를 함께 나누는 행동",
            danger1: { label: "문서·계약 분쟁 위험도", value: 65, period: "음력 3~4월 (목극토 충돌)" },
            danger2: { label: "건강·소화기 위험도", value: 55, period: "음력 10월 (토기 약화기)" },
            checklist: ["뒷담화나 구설수에 절대 동조하지 않기", "황토 먼지 많은 공사장·골재 현장 방문 자제", "갑·을·박 씨 성향 지인과의 구두 계약 보류", "위장·소화기 관련 과식·폭식 절대 삼가기"],
            phrase: "대지는 고요히 만물을 품고 기른다. 너무 많이 담으려 하지 말고, 하나를 온전히 기를 때 나머지도 따라온다."
          },
          "금": {
            place: "차가운 에어컨 바람에 종일 노출되는 골방이나 금속 가구점",
            surname: "화(火) 성향을 지닌 성씨 (병, 정, 오, 최 씨 등)",
            behavior: "피로가 누적된 상태에서의 무리한 중장거리 운전",
            danger1: { label: "호흡기·피부 위험도", value: 70, period: "음력 5~6월 (화극금 절정)" },
            danger2: { label: "안전사고 위험도", value: 62, period: "음력 8월 (서금 과부하)" },
            checklist: ["피로 상태에서 장거리 야간 운전 절대 금지", "병·정·최 씨 지인과의 금전 거래 보류", "금속 공구 및 기계류 취급 시 안전 장비 필수 착용", "홧병 유발 상황에서 무조건 자리 피하기"],
            phrase: "날카로운 칼날도 쓰임이 있으나, 허공을 마구 베면 스스로 상하게 된다. 결단은 옳은 때에, 온전한 마음으로 써야 한다."
          },
          "수": {
            place: "물살이 세차게 소용돌이치는 깊은 저수지나 밤의 낚시터",
            surname: "토(土) 성향을 지닌 성씨 (무, 기, 황, 배 씨 등)",
            behavior: "가까운 지인과의 금전 단기 차용 및 동업 서명",
            danger1: { label: "금전 손해·사기 위험도", value: 75, period: "음력 6~7월 (토극수 극화)" },
            danger2: { label: "수분·신장 건강 위험도", value: 58, period: "음력 11~12월 (수 기운 과부하)" },
            checklist: ["무·기·황씨 지인과의 동업 및 금전 차용 절대 금지", "야간 물가(호수·강변·낚시터) 혼자 방문 절대 삼가기", "충동적 투자 결정 대신 최소 72시간 숙고 후 집행", "신장·방광 건강을 위한 규칙적 수면 사수하기"],
            phrase: "깊은 물은 소리 없이 흐른다. 서두르지 말고 조용히 흐를 때, 바위도 돌아가는 길이 열리리라."
          }
        }[dayStemEl2] || { place: "사람이 지나치게 붐비는 야외", surname: "조심할 성씨", behavior: "충동적인 결정", danger1: { label: "위험도", value: 60, period: "상반기" }, danger2: { label: "조심 지수", value: 55, period: "하반기" }, checklist: ["신중한 결정 내리기"], phrase: "신중함이 최고의 방패다." };

        return (
          <div className="space-y-6 py-4">
            {/* 헤더 */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs text-rose-700 font-bold block tracking-widest">警戒 豫防 守則 (경계 예방 수칙)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">올해의 조심할 점과 이지함 선생의 조언</h2>
              <div className="w-16 h-0.5 bg-rose-300/50 mx-auto my-1" />
              <p className="text-xs text-gray-500 font-light">나쁜 기운을 미리 알고 피하는 것이 가장 강한 개운법입니다</p>
            </div>

            {/* 3대 경계 요인 박스 */}
            <div className="bg-rose-50/30 border border-rose-200 rounded-2xl p-5 space-y-3 shadow-sm">
              <h4 className="font-myeongjo text-sm font-bold text-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                ⚠️ 2026년 극도로 경계해야 할 3대 악재 요인
              </h4>
              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start bg-white/80 p-3 rounded-xl border border-rose-100 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <div>
                    <span className="font-bold text-[10px] text-rose-800 block">📍 피해야 할 장소</span>
                    <p className="text-[11px] text-rose-950 font-light mt-0.5">{warningInfo.place}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start bg-white/80 p-3 rounded-xl border border-rose-100 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <div>
                    <span className="font-bold text-[10px] text-rose-800 block">👤 상극인 성씨 (금전 거래 주의)</span>
                    <p className="text-[11px] text-rose-950 font-light mt-0.5">{warningInfo.surname}</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start bg-white/80 p-3 rounded-xl border border-rose-100 shadow-sm">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <div>
                    <span className="font-bold text-[10px] text-rose-800 block">🚫 경계할 행동</span>
                    <p className="text-[11px] text-rose-950 font-light mt-0.5">{warningInfo.behavior}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 위험도 게이지 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">📊 시기별 위험도 경보 게이지</h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-rose-700">{warningInfo.danger1.label}</span>
                    <span className="text-rose-600">{warningInfo.danger1.value}% ⚠️</span>
                  </div>
                  <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full" style={{ width: `${warningInfo.danger1.value}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-light">위험 집중 시기: {warningInfo.danger1.period}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-semibold">
                    <span className="text-amber-700">{warningInfo.danger2.label}</span>
                    <span className="text-amber-600">{warningInfo.danger2.value}% ⚡</span>
                  </div>
                  <div className="w-full h-2.5 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${warningInfo.danger2.value}%` }} />
                  </div>
                  <p className="text-[9px] text-gray-400 font-light">주의 집중 시기: {warningInfo.danger2.period}</p>
                </div>
              </div>
            </div>

            {/* 예방 체크리스트 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                🛡️ {name}님을 지키는 4대 예방 수칙 체크리스트
              </h4>
              <div className="space-y-2">
                {warningInfo.checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 bg-[#FAF8F5] rounded-xl border border-[#E2DDD5]/40">
                    <span className="w-4 h-4 rounded border-2 border-[#A3845B]/50 bg-white flex items-center justify-center shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A3845B]" />
                    </span>
                    <span className="text-[11px] text-gray-700 font-light leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 토정 이지함의 명언 카드 - 강화 */}
            <div className="border-2 border-double border-[#A3845B] bg-[#1C1613] text-[#FAF7F0] rounded-2xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#A3845B]/60" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#A3845B]/60" />
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #A3845B 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <span className="text-[9px] tracking-widest text-[#A3845B] block font-myeongjo">— 土亭 李之菡 先生의 慧言 —</span>
              <div className="w-8 h-0.5 bg-[#A3845B]/40 mx-auto" />
              <p className="font-myeongjo text-sm font-semibold text-[#FAF7F0] leading-loose italic px-2">
                "{warningInfo.phrase}"
              </p>
              <div className="w-8 h-0.5 bg-[#A3845B]/40 mx-auto" />
              <div className="bg-[#A3845B]/10 border border-[#A3845B]/30 rounded-xl p-3 text-left space-y-1">
                <span className="text-[9px] text-[#A3845B] font-bold block">💡 혜안당 현대적 위로와 조언</span>
                <p className="text-[10px] text-[#FAF7F0]/80 font-light leading-relaxed">
                  이지함 선생은 액운이란 피할 수 없는 것이 아니라, 미리 알고 비켜 서는 자에게는 오히려 전화위복의 기회가 된다고 가르쳤습니다. {name}님은 위의 예방 수칙을 성실히 이행함으로써 2026년의 모든 위험을 슬기롭게 비껴갈 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case "tj_fengshui": {
        const fengshuiData = [
          { dir: "북", symbol: "N", el: "수(水)", elColor: "#3b82f6", lucky: "재물·지혜", items: "수경식물, 어항, 파란 소품", placement: "현관 입구 또는 거실 북쪽 벽면", effect: "재물 기운 흡수 및 두뇌 활성화" },
          { dir: "서", symbol: "W", el: "금(金)", elColor: "#94a3b8", lucky: "명예·결단", items: "메탈 시계, 크리스탈 소품, 실버 액자", placement: "서쪽 서재 또는 책상 위", effect: "판단력 강화 및 명예운 수호" },
          { dir: "동", symbol: "E", el: "목(木)", elColor: "#22c55e", lucky: "성장·건강", items: "관엽식물, 나무 소품, 초록 화분", placement: "침실 동쪽 창가", effect: "건강 기운 충전 및 활력 회복" },
          { dir: "남", symbol: "S", el: "화(火)", elColor: "#ef4444", lucky: "인기·명성", items: "촛불, 조명, 붉은 계열 그림", placement: "주방 또는 거실 남쪽 (소량 배치)", effect: "사회적 인기와 표현력 강화" }
        ];

        const roomPrescriptions = [
          { room: "침실", icon: "🛏️", prescription: "침대 머리를 북쪽 또는 서쪽으로 두어 수기(水氣)를 흡수하고 깊은 숙면을 도모하십시오. 남쪽으로 머리를 두면 열기가 머리로 올라 불면이 생깁니다.", caution: "빨간색 침구류 사용 금지" },
          { room: "거실·집무실", icon: "🏠", prescription: "메탈 스틸 소품, 크리스탈 유리 공예품을 공간 중앙에 배치하여 2026년 병오년의 뜨거운 화기(火氣)를 냉각하십시오.", caution: "지나치게 붉거나 오렌지빛 인테리어 억제" },
          { room: "현관", icon: "🚪", prescription: "현관 문 안쪽 북쪽 방향에 수경 식물이나 작은 어항을 두어 들어오는 재물 기운을 머물게 하는 풍수 비법을 실천하십시오.", caution: "현관에 시든 꽃이나 죽은 식물 방치 금지" },
          { room: "주방", icon: "🍳", prescription: "주방은 이미 화기(火氣)가 강한 공간이니 파란색 계열 소품이나 미니 어항을 두어 화기를 수기로 중화하십시오.", caution: "주방 창문을 자주 열어 환기 필수" }
        ];

        const fengshuiScores = [
          { label: "재물 기운 안정도", before: 55, after: 85, color: "bg-amber-500" },
          { label: "건강 기운 보강도", before: 60, after: 82, color: "bg-emerald-500" },
          { label: "대인관계 조화도", before: 65, after: 88, color: "bg-blue-500" },
          { label: "심리적 안정도", before: 58, after: 84, color: "bg-purple-500" }
        ];

        return (
          <div className="space-y-6 py-4">
            {/* 헤더 */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">空間 風水 地理 處方 (공간 풍수 지리 처방)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 공간 풍수 인테리어 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-xs text-gray-500 font-light">대지와 공간의 흐름을 바로잡아 재물·건강·명예운을 동시에 끌어올리는 풍수 비법</p>
            </div>

            {/* 서론 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5]/70 rounded-2xl p-4 text-xs text-gray-700 font-light leading-relaxed">
              동양 풍수지리학의 핵심은 <strong>공간의 기(氣) 흐름</strong>을 조율하여 거주자의 기운과 조화를 이루게 하는 데 있습니다. 2026년 병오년(丙午年)은 강렬한 화기(火氣)가 지배하는 해이므로, 집안의 각 공간에 <strong>수(水)·금(金) 기운을 보강</strong>하여 과열된 기류를 중화하고 안정적인 재물·건강·명예운을 확보해야 합니다.
            </div>

            {/* 방위별 오행 풍수 인포그래픽 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">🧭 방위별 오행 풍수 배치 가이드</h4>
              <div className="grid grid-cols-2 gap-3">
                {fengshuiData.map((item, i) => (
                  <div key={i} className="border border-[#E2DDD5]/60 rounded-xl p-3 space-y-2 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm" style={{ backgroundColor: item.elColor }}>
                        {item.symbol}
                      </div>
                      <div>
                        <span className="font-bold text-[11px] text-gray-800">{item.dir}쪽 ({item.el})</span>
                        <p className="text-[9px] text-gray-400">{item.lucky} 기운 담당</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-600 font-light space-y-1">
                      <p><strong className="text-[#A3845B]">소품:</strong> {item.items}</p>
                      <p><strong className="text-[#A3845B]">배치:</strong> {item.placement}</p>
                      <p className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">✓ {item.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 공간별 풍수 처방 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">🏠 공간별 맞춤 풍수 처방</h4>
              <div className="space-y-2.5">
                {roomPrescriptions.map((room, i) => (
                  <div key={i} className="border border-[#E2DDD5]/50 rounded-xl p-3.5 space-y-1.5 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{room.icon}</span>
                      <span className="font-bold text-[11px] text-[#1A1A1A]">{room.room}</span>
                    </div>
                    <p className="text-[10px] text-gray-600 font-light leading-relaxed">{room.prescription}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">⚠️ 주의: {room.caution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 풍수 실천 전후 효과 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B]">📊 풍수 인테리어 실천 전·후 운세 보정 효과</h4>
              <div className="space-y-3">
                {fengshuiScores.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-gray-400 text-[9px]">{item.before}% → <span className="text-[#A3845B] font-bold">{item.after}%</span></span>
                    </div>
                    <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-gray-300 rounded-full" style={{ width: `${item.before}%` }} />
                      <div className={`absolute h-full ${item.color} rounded-full opacity-80`} style={{ width: `${item.after}%` }} />
                    </div>
                    <div className="flex gap-2 text-[8px] text-gray-400">
                      <span className="flex items-center gap-0.5"><span className="w-2 h-1.5 bg-gray-300 rounded-sm inline-block" /> 실천 전</span>
                      <span className="flex items-center gap-0.5"><span className={`w-2 h-1.5 ${item.color} rounded-sm inline-block opacity-80`} /> 실천 후</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 풍수 핵심 3대 원칙 */}
            <div className="bg-gradient-to-br from-[#1C1613] to-[#2C2018] border border-[#A3845B]/40 rounded-2xl p-5 space-y-3 shadow-md">
              <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] text-center">🔑 병오년 풍수 3대 황금 원칙</h4>
              <div className="space-y-2">
                {[
                  { num: "一", title: "물을 들이고 불을 다스려라", desc: "북쪽에 수기 소품을 배치해 뜨거운 화기를 중화하고, 재물 에너지가 집 안에 머물게 하라." },
                  { num: "二", title: "금속으로 결단을 단단히 하라", desc: "서쪽 서재에 메탈 소품을 두어 판단력을 선명하게 하고 명예운의 방패를 세워라." },
                  { num: "三", title: "생명으로 활기를 불어넣어라", desc: "동쪽 창가에 살아있는 초록 식물을 두어 건강 기운을 충전하고 생명력을 강화하라." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-7 h-7 rounded-full bg-[#A3845B]/20 border border-[#A3845B]/40 text-[#A3845B] font-myeongjo font-bold text-xs flex items-center justify-center shrink-0">{item.num}</span>
                    <div>
                      <span className="font-bold text-[11px] text-[#FAF7F0] block">{item.title}</span>
                      <p className="text-[10px] text-[#FAF7F0]/70 font-light mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "tj_lucky_items": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        
        // 일간 오행별 럭키 컬러 및 아이템 정의
        let luckyColors = [];
        let itemsTable = [];
        let item1Title = "";
        let item1Desc = "";
        let item2Title = "";
        let item2Desc = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          luckyColors = [
            { name: "포레스트 그린", code: "#2F5233", energy: "목(木) 생기", desc: "주체성 회복" },
            { name: "에메랄드", code: "#00A86B", energy: "목(木) 성장", desc: "진로 확장" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "결단력 보완" },
            { name: "라이트 옐로우", code: "#FFF8D6", energy: "토(土) 신뢰", desc: "재물운 안착" }
          ];
          item1Title = "🪵 원목 또는 식물 소품";
          item1Desc = "작은 테이블용 반려식물 화분이나 원목으로 가공된 소품은 목의 솟구치는 생명력을 극대화하여 활력을 공급합니다.";
          item2Title = "✍️ 만년필 및 가죽 다이어리";
          item2Desc = "목의 계획성을 기록으로 보완하고 실행에 확실한 뼈대를 세우기 위해 가죽이나 천연 소재 소품이 길합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "내추럴 톤온톤 룩", item: "카키/베이지 리넨 셔츠", effect: "대인관계에 부드러운 신뢰와 편안함을 공급" },
            { type: "💄 메이크업", style: "내추럴 누드 톤 스킨", item: "차분한 브라운/피치 립밤", effect: "과도한 긴장을 가라앉히고 안정감을 연출" },
            { type: "💍 액세서리", style: "원목 가죽 믹스 주얼리", item: "천연 가죽 밴드 손목 시계", effect: "목의 고집을 조율하고 융통성 있는 교류 촉진" },
            { type: "💨 럭키 향수", style: "싱그러운 풀잎 향조", item: "그린 티, 편백나무 향", effect: "머리를 맑게 하고 집중력과 스트레스 저하 유도" }
          ];
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          luckyColors = [
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "감정 진정" },
            { name: "딥 블루", code: "#0F2027", energy: "수(水) 지혜", desc: "구설수 차단" },
            { name: "에메랄드 그린", code: "#1B4D3E", energy: "목(木) 상생", desc: "인덕 공급" },
            { name: "딥 퍼플", code: "#3F2B96", energy: "화(火) 조율", desc: "영감 충전" }
          ];
          item1Title = "🌊 수족관 및 미니 분수기";
          item1Desc = "작은 흐르는 물소리나 실내 가습기는 타오르는 불꽃의 열기를 이성적으로 식히고 구설수를 차단하는 효과를 줍니다.";
          item2Title = "🔮 흑요석 또는 오닉스 장식";
          item2Desc = "블랙 계열의 천연 원석은 넘쳐나는 화기를 흡수하고 안정적인 심리 방어막을 구축하여 차분함을 보완합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "시크 미니멀 룩", item: "제트 블랙 자켓, 차콜 슬랙스", effect: "감정적 과열을 억제하고 이성적 신용 구축" },
            { type: "💄 메이크업", style: "차분한 세미매트 스킨", item: "톤다운 무드 레드 립", effect: "들뜬 기운을 가라앉히고 확실한 중심감 어필" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "화이트 실버 체인 팔찌", effect: "화극금의 상성 충돌을 정화하고 판단력 확보" },
            { type: "💨 럭키 향수", style: "시원한 마린 앤 워터 향", item: "아쿠아, 바다 소금 향", effect: "주변 분위기를 정돈하고 본인의 카리스마 유연화" }
          ];
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          luckyColors = [
            { name: "메탈 실버", code: "#C0C0C0", energy: "금(金) 의지", desc: "결단력 보강" },
            { name: "제트 블랙", code: "#1C1C1C", energy: "수(水) 재물", desc: "현금 유입" },
            { name: "포레스트 그린", code: "#2B4C3F", energy: "목(木) 관성", desc: "직무 안정" },
            { name: "크림 화이트", code: "#FCFBF7", energy: "금(金) 신뢰", desc: "계약 성사" }
          ];
          item1Title = "💍 메탈 실버 액세서리";
          item1Desc = "은반지나 스틸 시계 등 금속 소품은 토의 우유부단함을 결단력으로 승화시켜 계약운을 향상시킵니다.";
          item2Title = "🏺 황토 도자기 오브제";
          item2Desc = "마당이 없더라도 실내에 흙으로 구워낸 미니 도자기나 돌 장식품을 두면 본인의 굳건한 터전을 안정시킵니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "모던 포멀 수트 룩", item: "아이보리 니트, 실버 그레이 자켓", effect: "토의 무거운 느낌을 세련된 신용감으로 전환" },
            { type: "💄 메이크업", style: "매끄럽고 맑은 피부 톤", item: "은은한 베이지 글로우 립", effect: "유연하고 호감 주는 인상을 주변에 전달" },
            { type: "💍 액세서리", style: "화이트 실버 제품", item: "메탈 스틸 프레임 안경", effect: "대인관계에서 이성적 판단과 세련된 경청 유도" },
            { type: "💨 럭키 향수", style: "묵직한 샌달우드 향조", item: "시더우드, 패출리 향", effect: "내면의 고집을 든든한 신뢰의 이미지로 정착" }
          ];
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          luckyColors = [
            { name: "포레스트 그린", code: "#3E5F46", energy: "목(木) 재물", desc: "수익 활성화" },
            { name: "스카이 BLUE", code: "#87CEEB", energy: "수(水) 상생", desc: "소통 유연" },
            { name: "딥 블랙", code: "#111111", energy: "수(水) 리스크", desc: "리스크 회피" },
            { name: "라이트 옐로우", code: "#FFF2CC", energy: "토(土) 인성", desc: "계약 자산" }
          ];
          item1Title = "🍀 반려식물 화분";
          item1Desc = "금의 예리하고 차가운 성정을 싱그러운 초록 식물로 완화시켜 대인관계 인덕을 부드럽게 끌어올립니다.";
          item2Title = "🌊 실내 미니 분수 또는 수분 가습기";
          item2Desc = "흐르는 물과 가습은 금생수(金生水) 기류를 활성화하여 생각의 유연성과 기발한 영감을 불어넣습니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "캐주얼 스마트 룩", item: "카키 상의, 브라운 톤 팬츠", effect: "차가운 이미지를 부드러운 중용의 기류로 보완" },
            { type: "💄 메이크업", style: "촉촉하고 생기 있는 연출", item: "로즈 피치 워터리 립스틱", effect: "얼굴에 밝은 화기를 주어 대인 매력도 상승" },
            { type: "💍 액세서리", style: "천연 가죽 소재 주얼리", item: "가죽 스트랩 브레이슬릿", effect: "날카로운 결단을 조화롭고 협조적으로 유지" },
            { type: "💨 럭키 향수", style: "싱그러운 시트러스 향조", item: "베르가못, 자몽, 만다린 향", effect: "날카로워진 신경을 즉각적으로 이완시키고 긍정화" }
          ];
        } else {
          // 수(水) 일간 혹은 기본
          luckyColors = [
            { name: "크림 화이트", code: "#FDFCFA", energy: "금(金) 상생", desc: "학문/문서" },
            { name: "메탈 실버", code: "#CCCCCC", energy: "금(金) 지혜", desc: "자산 계약" },
            { name: "네이비 블루", code: "#1C3144", energy: "수(水) 수호", desc: "주체성 자각" },
            { name: "미스티 그레이", code: "#8E9AAF", energy: "금(金) 정돈", desc: "결단력 상승" }
          ];
          item1Title = "🏺 화이트 백자 오브제";
          item1Desc = "하얗고 깔끔한 백자 도자기 소품은 금생수 기류를 자극해 내면의 깊은 생각들을 정돈해 줍니다.";
          item2Title = "⌚ 메탈 바디 아날로그 시계";
          item2Desc = "정확하게 움직이는 금속 스틸 시계는 수의 흐릿한 유동성을 제어해 계획적인 실천력을 채워 줍니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "미니멀 모던 클래식 핏", item: "크림 화이트 셔츠, 그레이 가디건", effect: "정리정돈된 매력과 깊은 신용을 연출" },
            { type: "💄 메이크업", style: "투명하고 맑은 수분광", item: "실버 펄 글로우 립, 투명 밤", effect: "피부 점막을 보습하고 명쾌한 소통 기류 강화" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "실버 링 귀걸이, 메탈 체인 링", effect: "인맥과의 불필요한 감정 얽힘을 칼처럼 차단" },
            { type: "💨 럭키 향수", style: "차분하고 맑은 화이트 머스크", item: "네롤리, 코튼, 베이비파우더 향", effect: "불안한 심연을 차분하게 달래고 깊은 안정 부여" }
          ];
        }

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">수호 소품 (吉祥 裝飾)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인을 지켜주는 수호 행운 소품 리스트</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                일상에서 지니는 소품과 색상은 사주 원국의 부족한 에너지를 채우고 세운의 거친 충극을 완화하는 <strong>가장 즉각적이고 손쉬운 행동 풍수 실천법</strong>입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간인 <strong>'{sajuInfo?.day?.stem}'({dayStemEl}의 기운)</strong>을 보완하여 액운을 막고 신년 운을 틔워주는 맞춤 수호 처방을 제안합니다.
              </p>

              {/* 시각화 1: 럭키 컬러 칩 팔레트 (Glassmorphism Color Chips) */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 {dayStemEl} 기운 보완 수호 럭키 컬러 팔레트</span>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto">
                  {luckyColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-3.5 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm transition-all hover:scale-105">
                      <div className="w-12 h-12 rounded-full border border-gray-200 shadow-inner" style={{ backgroundColor: color.code }} />
                      <span className="font-semibold text-gray-800 text-[10px] mt-1">{color.name}</span>
                      <span className="text-[8px] text-gray-500 font-light">{color.energy}</span>
                      <span className="text-[8px] text-[#A3845B] font-bold bg-[#FAF7F0] px-1.5 py-0.5 rounded-full mt-0.5">{color.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 스타일 시너지 및 보호 에너지 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 럭키 스타일링 장착 후 운세 보정 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 신용 및 평판 상승률</span>
                      <span className="text-[#8A6F4C]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-700 rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>구설수 방어 및 흉살 차단율</span>
                      <span className="text-[#8A6F4C]">89%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-700 rounded-full" style={{ width: "89%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>정서적 안정 및 자존감 유지 지수</span>
                      <span className="text-[#8A6F4C]">87%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full" style={{ width: "87%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>금전 창고(財庫) 활성 시너지</span>
                      <span className="text-[#8A6F4C]">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-600 rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 추천/기피 수호 소품 매칭 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🎯 수호 소품 처방 1
                  </span>
                  <span className="font-bold text-[10px] text-emerald-950 block">{item1Title}</span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {item1Desc}
                  </p>
                </div>
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🎯 수호 소품 처방 2
                  </span>
                  <span className="font-bold text-[10px] text-emerald-950 block">{item2Title}</span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {item2Desc}
                  </p>
                </div>
              </div>

              {/* 스타일 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 부위별 디테일 코디네이션 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">분류</th>
                      <th className="p-2">권장 스타일 및 포인트</th>
                      <th className="p-2">추천 아이템</th>
                      <th className="p-2">개운 메커니즘</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    {itemsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E2DDD5]/40 hover:bg-gray-50/50">
                        <td className="p-2 font-semibold text-gray-800 shrink-0 whitespace-nowrap">{row.type}</td>
                        <td className="p-2 font-medium">{row.style}</td>
                        <td className="p-2 text-[#A3845B] font-semibold">{row.item}</td>
                        <td className="p-2">{row.effect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">👔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">의복 보정</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수호 컬러의 의상을 착용해 아우라 보완</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">금속/가죽 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">맞춤 소품으로 의지력과 판단 기류 활성화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💨</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">행운의 향기</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">기운을 정돈하는 천연 오일 및 디퓨저 매칭</p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "tj_diet": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        let constitutionName = "오행 평형 체질";
        let constitutionDesc = "";
        let goodFoods = "";
        let badFoods = "";
        let teaName = "";
        let teaDesc = "";
        let organGraph = null;

        if (dayStemEl === "목" || dayStemEl === "木") {
          constitutionName = "풍목(風木) 체질 (간·담 기능 편중)";
          constitutionDesc = "목 기운의 특징인 솟구치는 기운이 강하여, 스트레스를 받거나 화기가 침범할 때 눈의 피로와 어깨 결림, 두통이 쉽게 동반되는 체질입니다. 타오르는 화기로 인해 체내 목기가 건조해져 신경계 피로가 누적될 위험이 높습니다.";
          goodFoods = "브로콜리, 미나리, 시금치 등 푸른 잎 채소 및 사과, 매실 (피로 해소 유도)";
          badFoods = "지나치게 매운 마늘/고추 요리, 튀긴 고기류, 고도수의 음주 (간열 증폭)";
          teaName = "구기자차 (枸杞子茶)";
          teaDesc = "구기자는 건조해진 간 기능을 보호하고 눈의 피로를 낮추며 목기를 부드럽게 이완시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 피로도</span>
                  <span className="text-[#8A6F4C]">80%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>위·장(土) 소화 효율</span>
                  <span className="text-[#8A6F4C]">75%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          constitutionName = "군화(君火) 체질 (심·소장 상열 체질)";
          constitutionDesc = "2026년 병오년의 타오르는 강력한 불꽃 세운과 만나 불기운이 극에 달할 수 있는 체질입니다. 상반신으로 열이 쉽게 솟구쳐 안면 홍조, 구내염, 수면 장애(불면증)가 생기기 쉬우며 혈압 조율에 신경 써야 합니다.";
          goodFoods = "오이, 토마토, 수박 등 수분과 찬 성질이 가득한 채소 및 메밀 (상열감 완화)";
          badFoods = "마라탕, 자극적인 향신료, 과도한 육류 섭취, 카페인 다량 섭취 (심혈관 열증 자극)";
          teaName = "보리차 또는 죽엽차 (竹葉茶)";
          teaDesc = "대나무 잎으로 우려낸 차는 심장의 불같은 열을 차분하게 가라앉히고 수분을 보충해 줍니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>심·소장(火) 과열도</span>
                  <span className="text-[#8A6F4C]">95%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 건조율</span>
                  <span className="text-[#8A6F4C]">90%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          constitutionName = "습토(濕土) 체질 (비·위장 소화기 편중)";
          constitutionDesc = "소화기 계통의 힘을 쥐고 있으나, 세운의 열기가 강해져 위장이 쉽게 메마르고 체내 노폐물(습담)이 끈적하게 남기 쉬운 체질입니다. 비위가 약해지면 피로감과 복부 팽만감을 자주 호소할 수 있습니다.";
          goodFoods = "단호박, 양배추, 연근, 감자 등 옐로우 푸드 및 율무 (비위 소화 촉진)";
          badFoods = "차가운 빙수나 맥주, 차가운 날음식, 밀가루 가공품 (비장 소화 마비)";
          teaName = "생강나무차 또는 백출차 (白朮茶)";
          teaDesc = "백출차는 위장의 습기를 제거하고 위벽을 튼튼하게 보해 소화 흡수력을 상승시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>비·위장(土) 방어막</span>
                  <span className="text-[#8A6F4C]">85%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 억제 지수</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          constitutionName = "조금(燥金) 체질 (폐·대장 호흡기 편중)";
          constitutionDesc = "단단하고 냉정하지만 화기 세운의 침입으로 가장 쉽게 녹아내리는(화극금) 연약한 쇠붙이의 기질입니다. 피부 건조증, 만성 마른기침, 대장 건조로 인한 변비 등에 매우 취약한 체질입니다.";
          goodFoods = "무, 도라지, 더덕, 버섯 등 흰색 뿌리 채소 및 배즙 (호흡기/피부 점막 보습)";
          badFoods = "바비큐, 구운 고기류, 고추장 등 매운 음식, 흡연 (기관지 건조 자극)";
          teaName = "맥문동차 (麥門冬茶)";
          teaDesc = "맥문동은 폐와 목구멍에 음액(수분)을 듬뿍 넣어 건조함을 몰아내고 마른기침을 가라앉힙니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>폐·기관지(金) 점막도</span>
                  <span className="text-[#8A6F4C]">65%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>대장(金) 수분 유지력</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          );
        } else {
          // 수(水) 일간 혹은 기본
          constitutionName = "한수(寒水) 체질 (신·방광 신진대사 편중)";
          constitutionDesc = "차분하고 유연한 물 기운을 타고났으나, 2026년 병오년의 극강의 불꽃 세운에 직격탄을 맞아 체내 수기가 통째로 증발(수화대립)하기 쉽습니다. 비뇨기, 자궁, 호르몬 대사 저하 및 체내 전해질 부족을 겪기 쉽습니다.";
          goodFoods = "미역, 다시마 등 해조류와 검은콩, 검은깨, 신선한 생선 및 굴 (신장 활성화)";
          badFoods = "짠 찌개 및 소금기 많은 스낵, 과한 알코올 섭취 (신장 탈수 가중)";
          teaName = "옥수수수염차 또는 검은콩차";
          teaDesc = "신장의 노폐물 배출력을 돕고 탈수를 막으며 신장 에너지를 깊숙이 충전합니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 음액 지수</span>
                  <span className="text-[#8A6F4C]">60%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>자궁·생식계 면역력</span>
                  <span className="text-[#8A6F4C]">68%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: "68%" }} />
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생 (五行 攝生)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신진대사를 돕는 오행 섭생 음식 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                매일 입으로 섭취하는 약선 음식의 성질은 내부 장기의 한열(寒熱) 밸런스를 바로잡아 질병을 예방하는 가장 현명한 체내 개운법입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간 오행과 올해 기류를 바탕으로 신체의 과열을 다스리는 수호 식단과 차 요법을 제안합니다.
              </p>

              {/* 체질 진단 카드 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <span className="text-[10px] text-[#A3845B] font-bold block">나의 맞춤형 오행 체질</span>
                    <span className="font-myeongjo text-sm font-bold text-gray-800">{constitutionName}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-[#E2DDD5]/40 pt-2 text-justify">
                  {constitutionDesc}
                </p>
              </div>

              {/* 시각화 1: 오행 장부 강약 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 오행 장부(臟腑) 에너지 밸런스</span>
                {organGraph}
              </div>

              {/* 추천/기피 섭생 매칭 플레이트 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🟢 추천 식자재 (Good)
                  </span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {goodFoods}
                  </p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-rose-800 text-[11px] block flex items-center gap-1">
                    🔴 삼가야 할 음식 (Bad)
                  </span>
                  <p className="text-[9px] text-rose-950 font-light leading-relaxed text-justify">
                    {badFoods}
                  </p>
                </div>
              </div>

              {/* 수호 약선차 디테일 카드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify flex items-start gap-4">
                <span className="text-2xl pt-0.5">☕</span>
                <div className="space-y-1">
                  <span className="font-bold text-[#A3845B] text-[11px] block">신년 추천 개운 차: {teaName}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">
                    {teaDesc} 따뜻하게 우려내어 하루 한 잔씩 편안한 시간에 음용하며 내면의 장기 기운을 순탄하게 보완하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "tj_worry_solution": {
        const categoryLabels = {
          love: "연애 / 속마음",
          career: "직장 / 이직",
          wealth: "금전 / 투자",
          exam: "학업 / 시험",
          general: "종합 / 기타",
          business: "사업 / 경영",
          startup: "창업 / 부업",
          trade: "장사 / 유통",
          facility: "설비 / 확장"
        };
        const currentCategoryLabel = categoryLabels[worryCategory] || "종합 / 기타";
        const personalizedText = getPersonalizedSolution(name, worryText, worryCategory);

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">고민 해결 처방 (苦悶 處方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인 맞춤형 고민 극복 정밀 솔루션</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 <strong>{name}</strong>님께서 직접 남겨주신 고민에 대하여, 병오년의 절기적 기류와 명조의 오행 변화를 대입해 도출해 낸 혜안당의 독점적인 명리 극복 솔루션입니다.
              </p>

              {/* 고민 정보 헤더 */}
              <div className="bg-[#FAF8F5] border-l-4 border-[#A3845B] p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-[#E2DDD5]/60 pb-1.5">
                  <span className="font-bold text-[10px] text-[#A3845B] uppercase font-sans">선택하신 고민 분야: {currentCategoryLabel}</span>
                  <span className="text-[9px] bg-[#A3845B]/10 text-[#A3845B] px-1.5 py-0.5 rounded font-bold font-sans">정밀 처방 안건</span>
                </div>
                <p className="text-[11px] text-gray-600 italic font-light">
                  "{worryText ? decodeURIComponent(worryText) : "인생 전반의 총체적 갈등 해소 및 개운"}"
                </p>
              </div>

              {/* 솔루션 상세 */}
              <div className="space-y-5">
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF8F5] space-y-3">
                  <span className="font-bold text-xs text-[#A3845B] block">📍 고민 안건의 명리학적 해석</span>
                  <p className="text-justify text-gray-600 font-light leading-relaxed pl-3 border-l border-[#A3845B]/30">
                    {personalizedText.analysis}
                  </p>
                </div>

                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF8F5] space-y-3">
                  <span className="font-bold text-xs text-[#A3845B] block">⏰ 하늘이 돕는 개운 타이밍</span>
                  <p className="text-justify text-gray-600 font-light leading-relaxed pl-3 border-l border-[#A3845B]/30">
                    {personalizedText.timing}
                  </p>
                </div>

                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/40 space-y-3">
                  <span className="font-bold text-xs text-[#8A6F4C] block">🔑 혜안당 정밀 개운 비책</span>
                  <div className="bg-[#FAF7F0] p-4 rounded-lg border border-[#E2DDD5]/50 whitespace-pre-line text-xs font-light text-gray-600 leading-relaxed">
                    {personalizedText.actionPlan}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "tj_roadmap_2027": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        
        let aspects = [
          { title: "💰 재물운", stars: "★★★★☆", desc: "병오년의 활발한 추진력이 문서로 전환되는 시기입니다. 부동산 계약, 중장기 채권 등 묶어두는 투자에서 큰 이익을 봅니다.", action: "단기 현금보다 등기부등본 및 계약서 형태의 문서 자산으로 환원하십시오." },
          { title: "🏢 직무/사업운", stars: "★★★★★", desc: "귀하의 결실이 공적인 문서(라이선스, 권한, 승진)로 인정받습니다. 협상에서 우위를 점하며 지위가 안정되는 해입니다.", action: "상반기에 주어지는 부서 이동이나 제휴 제안을 긍정적으로 검토하십시오." },
          { title: "💑 애정/가정운", stars: "★★★★☆", desc: "서로에게 든든한 현실적 조력자가 되는 시기입니다. 연인 간에는 결혼이나 공동 자산 형성 등 구체적인 계약이 성사되기 좋습니다.", action: "가벼운 만남보다 현실적 미래를 함께 설계하는 진중한 대화에 힘쓰십시오." },
          { title: "🛡️ 건강/수호운", stars: "★★★★☆", desc: "과열되었던 장부의 기운이 흙(土)의 기운을 만나 차분하게 수렴됩니다. 만성 피로가 호전되며 위장 건강이 회복됩니다.", action: "소화기에 습기가 차지 않도록 따뜻하고 규칙적인 한식 위주의 식습관을 유지하십시오." }
        ];

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2027)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2027년 정미년(丁未年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2027년 정미년(丁未年)은 맹렬히 타오르던 병오년(2026년)의 불꽃이 기름진 흙(土)의 품으로 수렴되어 안착하는 <strong>화생토(火生土)의 안정기이자 결실의 구체화 주기</strong>입니다. 지난 한 해 동안 기획하고 시작했던 여러 프로젝트들이 드디어 구체적인 권리, 계약서, 직위 상승 등 '문서상의 확실한 권익'으로 고정됩니다.
              </p>

              {/* 시각화 1: 2027년 분기별 흐름 타임라인 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">📅 2027년 분기별 마일스톤 흐름도</span>
                
                <div className="relative border-l border-[#A3845B]/30 ml-4 pl-6 space-y-5">
                  {[
                    { q: "🌸 1분기 (1~3월) : 정돈 및 인프라 설계", desc: "병오년의 들떴던 실행의 여운을 정리하고, 상반기 계약 체결을 위한 기초 설계를 다집니다." },
                    { q: "☀️ 2분기 (4~6월) : 귀인 인연과의 계약 체결", desc: "나를 돕는 귀인이나 공인 파트너십을 통해 계약서 도장을 찍는 실익이 발생하는 골든타임입니다." },
                    { q: "🍁 3분기 (7~9월) : 자산 가치 안정화 및 수렴", desc: "재물 흐름이 안정 궤도에 접어듭니다. 단기 투자보다 안정적 중장기 저축 자산으로 락업하십시오." },
                    { q: "❄️ 4분기 (10~12월) : 내실 다지기와 2028년 도약 준비", desc: "중말년 대운의 도약을 앞두고 자산 기반을 견고히 하며 건강과 가정을 평화롭게 보살핍니다." }
                  ].map((milestone, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#A3845B] border-2 border-white group-hover:scale-125 transition-transform" />
                      <span className="font-bold text-[10px] text-[#A3845B] block">{milestone.q}</span>
                      <p className="text-[9px] text-gray-500 font-light mt-0.5 leading-relaxed text-justify">{milestone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 2027년 분야별 상세 등급 및 행동 강령 */}
              <div className="space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2027년 분야별 등급 평가 및 전술</span>
                <div className="grid gap-3">
                  {aspects.map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#E2DDD5]/70 rounded-xl p-4 shadow-sm space-y-2 text-justify">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-[#1A1A1A]">{item.title}</span>
                        <span className="text-yellow-500">{item.stars}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-light leading-relaxed">{item.desc}</p>
                      <div className="bg-[#FAF7F0] p-2 rounded-lg border-l-2 border-[#A3845B] text-[9px] font-light text-gray-600">
                        <strong className="text-[#A3845B] font-semibold">대응 전술:</strong> {item.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 3: 2027년 핵심 행동 강령 보드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-[#A3845B] text-[11px] mb-2">🎯 2027년 정미년 인생 성공 강령</h4>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed text-justify">
                  올해의 핵심 성공 열쇠는 <strong>'안정과 수성(守成)'</strong>입니다. 무리한 단기 배팅이나 타인의 투기성 권유에 지갑을 열지 마시고, 2026년에 만들어둔 기틀을 바탕으로 인맥을 견고히 하고 공인된 자격을 확보하여 내 자산을 지키는 것을 최우선 목표로 삼으십시오.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case "tj_roadmap_2028": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        
        let aspects = [
          { title: "💰 재물운", stars: "★★★★★", desc: "드디어 하늘과 땅에 금(金)의 수확 기운이 차오르며, 묶여있던 현금 흐름에 거대한 활로가 뚫립니다. 투자 실익과 사업 매출이 일제히 우상향합니다.", action: "시드머니를 모아두었다면 이 시기에 핵심 우량 실물이나 지분 구조로 환금성을 높이십시오." },
          { title: "🏢 직무/사업운", stars: "★★★★★", desc: "귀하의 강력한 돌파력과 결과 지향적 태도가 회사나 거래처에 깊게 어필됩니다. 중요한 프로젝트 주도권을 쟁취하게 됩니다.", action: "경쟁이 수반되는 승부처나 입찰 제안에 자신감을 가지고 적극 참여해 이익을 얻으십시오." },
          { title: "💑 애정/가정운", stars: "★★★★☆", desc: "집안에 든든한 경제적 여유가 더해지며 배우자와의 불필요한 금전 갈등이 원만하게 해소되고 화목함이 깃듭니다.", action: "가족들과 함께 성취를 축하하며 풍요로운 여가나 감사 선물을 아끼지 마십시오." },
          { title: "🛡️ 건강/수호운", stars: "★★★★☆", desc: "정신적 뚝심과 결단력이 샘솟아 머리가 맑아집니다. 스트레스나 잡생각이 정리되며 활발한 기혈 순환을 보여줍니다.", action: "호흡기와 뼈의 활력을 위해 신선한 공기가 가득한 산림욕이나 가벼운 근력 운동을 습관화하십시오." }
        ];

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2028)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2028년 무신년(戊申年)은 오랜 기간 준비하고 제련해왔던 귀하의 노력들이 드디어 차가운 금(金)의 기운을 얻어 단단한 결실로 영그는 <strong>생애 최대 수확 및 경제적 팽창의 원년</strong>입니다. 내적으로만 머물던 비즈니스 모델이나 투자 설계가 실질적인 현금과 자산의 급격한 상승 기류를 타고 폭발적인 실리를 안겨주는 골든타임이 다가옵니다.
              </p>

              {/* 시각화 1: 2028년 분기별 흐름 타임라인 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">📅 2028년 분기별 마일스톤 흐름도</span>
                
                <div className="relative border-l border-[#A3845B]/30 ml-4 pl-6 space-y-5">
                  {[
                    { q: "🌸 1분기 (1~3월) : 새로운 자산 파이프라인 가동", desc: "연초부터 새로운 비즈니스나 자산 운용 방식에서 긍정적인 초기 현금 유입 소식이 전달되기 시작합니다." },
                    { q: "☀️ 2분기 (4~6월) : 대형 계약 선점 및 지위 상승", desc: "치열한 경쟁에서 귀하의 안목과 실력을 확실히 입증하여 대형 수주나 핵심 주도권을 쟁취해냅니다." },
                    { q: "🍁 3분기 (7~9월) : 대규모 현금 실익 수확기", desc: "금(金)의 결실 기류가 최고조에 도달합니다. 인센티브, 투자 보상금, 영업 수익 등이 통장에 안착하는 해의 중심지입니다." },
                    { q: "❄️ 4분기 (10~12월) : 포트폴리오의 보수적 다변화", desc: "벌어들인 현금을 단기 투기에 재진입시키지 않고, 부동산이나 채권 등 영구형 문서 자산으로 굳건히 고정합니다." }
                  ].map((milestone, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#A3845B] border-2 border-white group-hover:scale-125 transition-transform" />
                      <span className="font-bold text-[10px] text-[#A3845B] block">{milestone.q}</span>
                      <p className="text-[9px] text-gray-500 font-light mt-0.5 leading-relaxed text-justify">{milestone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 2028년 분야별 상세 등급 및 행동 강령 */}
              <div className="space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2028년 분야별 등급 평가 및 전술</span>
                <div className="grid gap-3">
                  {aspects.map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#E2DDD5]/70 rounded-xl p-4 shadow-sm space-y-2 text-justify">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-[#1A1A1A]">{item.title}</span>
                        <span className="text-yellow-500">{item.stars}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-light leading-relaxed">{item.desc}</p>
                      <div className="bg-[#FAF7F0] p-2 rounded-lg border-l-2 border-[#A3845B] text-[9px] font-light text-gray-600">
                        <strong className="text-[#A3845B] font-semibold">대응 전술:</strong> {item.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 3: 2028년 핵심 행동 강령 보드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-[#A3845B] text-[11px] mb-2">🎯 2028년 무신년 인생 성공 강령</h4>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed text-justify">
                  올해의 핵심 성공 키워드는 <strong>'기회 포착과 적극적 돌파'</strong>입니다. 뒤로 물러서서 관망하기보다 내 브랜드와 아이디어를 시장에 널리 드러내고 치열한 경쟁 환경에서 우위를 점할 수 있는 용기를 단행하여 평생의 가장 큰 종잣돈을 완성해내십시오.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case "tj_roadmap_2029": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        
        let aspects = [
          { title: "💰 재물운", stars: "★★★★☆", desc: "자산 포트폴리오의 가치 상승이 안정 궤도에 정착하며, 불필요하게 흩어지던 소비와 지출이 자연스레 통제되어 곳간이 채워집니다.", action: "신규 모험 투자보다 기존 보유 자산의 리모델링이나 보수적인 관리에 힘쓰십시오." },
          { title: "🏢 직무/사업운", stars: "★★★★★", desc: "대규모 조직의 장(長)이나 중요 부서의 고문, 독점 권한을 지닌 수장이 되는 등 명예운과 신뢰도가 인생 최고의 장치에 안착합니다.", action: "경쟁 관계를 적대하기보다 나와 공생할 수 있는 연대 관계의 네트워크를 확고히 구축하십시오." },
          { title: "💑 애정/가정운", stars: "★★★★★", desc: "부부나 연인 간에 서로의 품격을 인정하고 가정을 가장 아름다운 성소로 완성하는 복이 가득합니다. 자녀운도 매우 길합니다.", action: "집안에 따뜻한 조명과 차분한 음악을 곁들여 집을 내적 행운의 공간으로 가꾸십시오." },
          { title: "🛡️ 건강/수호운", stars: "★★★★★", desc: "신년 스트레스 지수가 최저 수준으로 하락하여 오장육부의 상생 흐름이 원활합니다. 심신이 안정되어 수면의 질이 높아집니다.", action: "맑은 물(水)의 순환을 위해 매일 저녁 가벼운 족욕이나 반신욕을 즐겨 기혈을 이완하십시오." }
        ];

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2029)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2029년 기유년(己酉年)은 수확했던 단단한 원석이 보석으로 매끄럽고 다정하게 제련되는 <strong>대외 명예의 완성 및 보수적 수성(守成)의 해</strong>입니다. 무분별한 신규 확장은 삼가고, 지난 3년간 쟁취해낸 번영의 영토를 확실하게 수비하며 귀하의 지위와 명성을 사회적으로 단단히 뿌리내리기에 아주 유리한 한 해입니다.
              </p>

              {/* 시각화 1: 2029년 분기별 흐름 타임라인 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">📅 2029년 분기별 마일스톤 흐름도</span>
                
                <div className="relative border-l border-[#A3845B]/30 ml-4 pl-6 space-y-5">
                  {[
                    { q: "🌸 1분기 (1~3월) : 입지와 평판의 선점", desc: "학문, 기획력, 성과에 대한 대외적 극찬을 얻어 단숨에 사내외 영향력의 상층부로 등극합니다." },
                    { q: "☀️ 2분기 (4~6월) : 귀인 파트너십 구축", desc: "나의 업무 시스템을 자동화해줄 유능한 대리인이나 협조자들을 보강하여 실무 피로도를 낮춥니다." },
                    { q: "🍁 3분기 (7~9월) : 시스템 내실 수비 및 고정", desc: "자금 누수의 요소를 원천 차단하고 보수적이고 안전한 정기수익 인프라를 한층 견고히 다집니다." },
                    { q: "❄️ 4분기 (10~12월) : 정신적 성찰 및 평화", desc: "인생의 큰 계절 변화를 앞두고 심신을 편안히 가다듬으며, 자비와 평온의 기류를 향유합니다." }
                  ].map((milestone, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#A3845B] border-2 border-white group-hover:scale-125 transition-transform" />
                      <span className="font-bold text-[10px] text-[#A3845B] block">{milestone.q}</span>
                      <p className="text-[9px] text-gray-500 font-light mt-0.5 leading-relaxed text-justify">{milestone.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 2029년 분야별 상세 등급 및 행동 강령 */}
              <div className="space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2029년 분야별 등급 평가 및 전술</span>
                <div className="grid gap-3">
                  {aspects.map((item, idx) => (
                    <div key={idx} className="bg-white border border-[#E2DDD5]/70 rounded-xl p-4 shadow-sm space-y-2 text-justify">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-[#1A1A1A]">{item.title}</span>
                        <span className="text-yellow-500">{item.stars}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-light leading-relaxed">{item.desc}</p>
                      <div className="bg-[#FAF7F0] p-2 rounded-lg border-l-2 border-[#A3845B] text-[9px] font-light text-gray-600">
                        <strong className="text-[#A3845B] font-semibold">대응 전술:</strong> {item.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 3: 2029년 핵심 행동 강령 보드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-[#A3845B] text-[11px] mb-2">🎯 2029년 기유년 인생 성공 강령</h4>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed text-justify">
                  올해의 핵심 성공 전술은 <strong>'공격보다 단단한 수성'</strong>입니다. 이미 얻은 자산과 지위를 지혜롭게 수비하고 곁의 소중한 인연들에게 감사와 덕을 베풀어 중말년 영구적 평화와 안락함을 보장받는 안전 기지로 정돈해 나가십시오.
                </p>
              </div>
            </div>
          </div>
        );
      }

      case "tj_final_blessing": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        let elementBlessing = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          elementBlessing = "푸른 거목처럼 굳건히 뿌리 내려 세운의 뜨거운 열기를 헤치고 위대한 성장을 이루어내시길 축원합니다.";
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          elementBlessing = "어둠을 사르는 태양처럼 세상을 찬란하게 밝히고 내면의 열정과 성취를 아름다운 결실로 승화하시길 기원합니다.";
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          elementBlessing = "만물을 품는 넓은 대지처럼 묵직한 신용과 끈기로 온갖 복록과 금전의 창고를 활짝 열어가시길 축원합니다.";
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          elementBlessing = "단단하고 빛나는 보석처럼 매사에 차분하고 명료한 결단으로 일생의 귀한 대업을 굳건히 완성하시길 기원합니다.";
        } else {
          elementBlessing = "심연을 흐르는 맑은 물결처럼 무한한 지혜와 통찰력으로 삶의 모든 굴곡을 유연하고 복되게 개척해가시길 축원합니다.";
        }

        return (
          <div className="py-8 px-4 flex flex-col justify-between min-h-[600px] bg-gradient-to-b from-[#FDFBF7] to-[#FAF6EE] border-4 border-[#A3845B]/30 rounded-2xl relative shadow-lg overflow-hidden">
            {/* 고풍스러운 모서리 문양 */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />

            <div className="text-center space-y-3 mt-4">
              <span className="text-xs tracking-[0.4em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto" />
            </div>

            <div className="my-auto py-8 text-center space-y-8 max-w-lg mx-auto">
              <h1 className="font-myeongjo text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-wider leading-relaxed">
                丙午年 成功 祈願<br />
                최종 축원문 (祝願文)
              </h1>
              
              <div className="w-12 h-1 bg-[#A3845B]/40 mx-auto my-4" />

              {/* 액자식 길조 수호 조언 */}
              <div className="bg-[#FAF8F5]/80 border border-[#E2DDD5]/70 rounded-xl p-6 shadow-inner text-justify text-xs font-traditional font-light text-gray-700 leading-relaxed space-y-4">
                <p>
                  천지합화(天地合火)의 맹렬한 불꽃 기류가 의뢰인 <strong>{name}</strong>님의 인생 앞길을 밝히는 광명의 횃불이 되기를 간절히 기원합니다. 올해의 뜨거운 에너지는 귀하를 지치게 하는 액난을 모두 소멸시키고, 굳건한 금빛 성공의 토양으로 환원될 것입니다.
                </p>
                <p className="font-semibold text-[#8B221E] border-t border-[#E2DDD5]/40 pt-3 text-center">
                  ✨ {name}님을 위한 오행 수호 축원
                </p>
                <p className="italic text-center text-gray-600 font-medium">
                  "{elementBlessing}"
                </p>
              </div>
            </div>

            <div className="mt-8 mb-6 text-center space-y-3 relative z-10">
              <span className="font-myeongjo text-base font-bold text-[#1A1A1A] tracking-widest block">慧眼堂 명리연구소 소장 배상</span>
              <p className="text-[10px] text-gray-400 font-light font-sans">본 보감의 개운법을 일상에 새겨 복록을 누리소서.</p>
            </div>

            {/* 혜안당 공식 직인 (낙관) */}
            <div className="absolute right-12 bottom-12 select-none opacity-90 z-20">
              <svg viewBox="0 0 60 60" className="w-[50px] h-[50px] transform -rotate-6 filter drop-shadow-[0_2px_4px_rgba(139,34,30,0.15)]">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂인
                </text>
              </svg>
            </div>
          </div>
        );
      }

      case "ny_cover":
        return (
          <div className="text-center space-y-12 py-16">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.35em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-24 h-0.5 bg-[#A3845B]/40 mx-auto" />
            </div>
            <div className="space-y-6 py-8 overflow-hidden">
              <h1 className="font-myeongjo font-extrabold text-[#1A1A1A] tracking-widest leading-normal">
                <span className="block text-3xl md:text-5xl whitespace-nowrap">2026 丙午年</span>
                <span className="block text-xl sm:text-2xl md:text-4xl whitespace-nowrap break-keep mt-2">
                  {typeParam === "tojeong" ? "정통 토정비결 (土亭秘訣)" : "정통 신수비결 (新年運勢)"}
                </span>
              </h1>
              <p className="text-sm text-[#5F5F5F] font-light tracking-wide font-traditional">
                {typeParam === "tojeong" ? "조선 정통 이지함의 비결로 풀어보는 한 해의 지침" : "천지합화(天地合火)의 기운을 다스리는 인생 지침 보감"}
              </p>
            </div>
            <div className="border border-[#E2DDD5] bg-[#F9F8F6]/80 rounded-lg p-6 max-w-md mx-auto space-y-4 text-xs shadow-sm">
              <div className="grid grid-cols-2 gap-4 text-left border-b border-[#E2DDD5]/50 pb-3">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">의뢰인 성명</span>
                  <span className="font-semibold text-gray-800 text-sm">{name} 님 ({gender})</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">출생 정보</span>
                  <span className="font-semibold text-gray-800">{year}년 {month}월 {day}일 {hour}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">분석 상품</span>
                  <span className="font-semibold text-gray-800">{typeParam === "tojeong" ? "정통 토정비결" : "정통 신년운세"}</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">리포트 등급</span>
                  <span className="font-semibold text-[#8B221E] uppercase font-sans">
                    {currentGrade === "free" ? "무료 체험" : currentGrade === "premium" ? "고급 리포트" : "프리미엄 리포트"}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-12">
              <span className="font-myeongjo text-sm font-bold text-[#1A1A1A]">慧眼堂 명리연구소</span>
              <p className="text-[9px] text-[#A3845B]/60 font-light">본 보감의 복제 및 무단 전재를 금합니다.</p>
            </div>
          </div>
        );

      case "ny_preface":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명리 서막 (命理 序幕)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">새해를 맞이하는 역학적 지혜와 혜안의 등대</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                동양 명리학의 근본 원리인 <strong>천인상응(天人相應: 하늘과 인간은 긴밀하게 소통하며 반응한다)</strong> 사상에 따르면, 1년의 운(運)이란 미리 정해진 고정된 시나리오가 아니라 매년 우리에게 새롭게 밀려오는 거대한 계절적 날씨와 기후에 비유됩니다. 폭풍우가 치는 한겨울에 억지로 봄 씨앗을 뿌리려 하거나, 땡볕이 내리쬐는 극심한 가뭄에 물을 주지 않고 방치한다면, 아무리 훌륭한 씨앗이라 한들 결실을 맺지 못하고 썩어버리는 자연의 이치와도 같습니다.
              </p>
              <p>
                동양 역학의 최고 정수인 삼재(三才) 사상에서는 우리의 한 해 성패를 결정짓는 요소를 세 가지로 나눕니다. 첫째는 하늘의 때를 선제적으로 읽어내는 <strong>천시(天時)</strong>이고, 둘째는 내가 딛고 서 있는 대지와 가구, 인테리어 등 공간적 에너지를 조율하는 <strong>지리(地理)</strong>이며, 셋째는 닥쳐올 운명을 알고 나 스스로의 감정을 통제하여 결단력 있게 행동하는 <strong>인화(人和)</strong>입니다. 이 세 가지가 하나로 결합할 때 비로소 위대한 도약과 운명의 전환이 보장됩니다.
              </p>
              <p>
                본 혜안당 정통 신수비결은 2026년 병오년(丙午年)에 우리를 찾아올 거대한 태양과 용광로의 불꽃 기운을 정밀 진단하여, 의뢰인 {name}님이 어느 시기에 돛을 활짝 펼쳐 공격적으로 전진하고, 어느 시기에 닻을 내린 채 내실을 기하며 자산을 수호해야 하는지를 천간지지의 역학적 조합으로 풀어낸 고품격 명조 비방서입니다.
              </p>
              <p className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-amber-900 font-semibold text-center leading-relaxed">
                "우매한 자는 닥쳐올 길흉에 일희일비하지만, 지혜로운 자는 다가올 흐름을 미리 파악해 스스로의 기운을 튜닝한다(趨吉避凶)."
              </p>
              <p>
                신년의 강렬한 화(火)의 팽창력은 우리에게 활발한 대외 성장의 기회를 주는 동시에 감정 과열과 충동이라는 어두운 그림자를 함께 던집니다. 올 한 해 수많은 선택의 갈림길에서 본 보감을 항상 곁에 두시고, 삶의 든든한 등대이자 최고의 전략적 플레이북으로 삼아 대길한 성취를 이루시길 간절히 기원합니다.
              </p>
            </div>
          </div>
        );

      case "ny_intro_saju":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 ${name}님이 탄생하는 그 순간, 우주 공간을 채웠던 여덟 글자의 명조(命造: 사주 원국) 배치입니다. 명리학에서 사주 원국은 평생에 걸쳐 귀하를 구성하는 <strong>정신적 뼈대이자 유전적인 기질의 기본형</strong>을 상징합니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">${sajuInfo.hour.stem}${sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">${sajuInfo.hour.stemEl}/${sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">${sajuInfo.day.stem}${sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">${sajuInfo.day.stemEl}/${sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">${sajuInfo.month.stem}${sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">${sajuInfo.month.stemEl}/${sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">${sajuInfo.year.stem}${sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">${sajuInfo.year.stemEl}/${sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p>
                  네 개의 기둥 중에서도 나 자신을 대변하는 <strong>일간(日干: ${sajuInfo.day.stem})</strong>은 나의 정신적 자아와 핵심 가치관을 주도하는 최고 결정권자입니다. 일주(日柱)의 지지(${sajuInfo.day.branch})는 내가 지향하는 내면의 안전지대이자 배우자와 정서적 교감을 나누는 주거 환경입니다.
                </p>
                <p>
                  또한 사회적 활동 영역과 직업적 성취를 보여주는 월주(月柱)는 청년기부터 사회 초년생 시절의 대외적인 명예와 성장의 속도를 지배합니다. 초년과 조상의 기틀을 의미하는 년주(年柱)는 굳건한 뿌리가 되어 귀하의 든든한 보호막이 되어 줍니다.
                </p>
                <p>
                  올해 병오년의 불꽃은 이 여덟 글자의 유기적 관계와 마주하여 천간의 합과 지지의 충을 정밀하게 일으킵니다. 내 원국에 어떤 글자들이 있고, 그 글자들이 세운의 글자와 어떻게 융합하는지 명확하게 인지하고 대처할 때 나쁜 액운을 지혜롭게 비껴가고 인생의 큰 복록을 온전히 취하게 될 것입니다.
                </p>
              </div>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );

      case "ny_daewun_flow": {
        const dayStemElVal = sajuInfo.day.stemEl;
        let harmonyVal = 70;
        let stressVal = 60;
        let opportunityVal = 75;

        if (dayStemElVal === "수" || dayStemElVal === "水") {
          harmonyVal = 85; stressVal = 45; opportunityVal = 90;
        } else if (dayStemElVal === "금" || dayStemElVal === "金") {
          harmonyVal = 75; stressVal = 75; opportunityVal = 80;
        } else if (dayStemElVal === "화" || dayStemElVal === "火") {
          harmonyVal = 50; stressVal = 85; opportunityVal = 55;
        } else if (dayStemElVal === "목" || dayStemElVal === "木") {
          harmonyVal = 65; stressVal = 70; opportunityVal = 70;
        } else {
          harmonyVal = 80; stressVal = 50; opportunityVal = 75;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">운명의 거대한 강물, 10년 대운과 신년의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 대운-세운 상호작용 에너지 튜브 흐름도 (SVG) */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">🌀 대운(大運) &amp; 세운(歲運) 에너지 조화 튜브</span>
              <div className="relative h-14 bg-gray-50 rounded-lg flex items-center justify-between px-6 border border-gray-100">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-gray-400">10년 주기</span>
                  <span className="text-xs font-bold text-gray-800">대운 환경</span>
                </div>
                <div className="flex-1 mx-4 h-6 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A3845B" />
                        <stop offset="50%" stopColor="#E2DDD5" />
                        <stop offset="100%" stopColor="#DC2626" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 10 Q 25 2, 50 10 T 100 10" fill="none" stroke="url(#tubeGrad)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="10" r="4" fill="#8B221E" />
                  </svg>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-400">2026 병오년</span>
                  <span className="text-xs font-bold text-red-600">세운 불꽃</span>
                </div>
              </div>
            </div>

            {/* 프리미엄 시각화 2: 신년 대운 융합 지표 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 신년 대운 조율 지표</span>
              <div className="space-y-2 text-[9px] font-semibold text-gray-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>에너지 융합 조화도</span>
                    <span className="text-emerald-700">{harmonyVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${harmonyVal}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>신년 기회 포착률</span>
                    <span className="text-blue-700">{opportunityVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${opportunityVal}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>기류 과열 스트레스</span>
                    <span className="text-red-600">{stressVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: `${stressVal}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light">
                명리학에서 흔히 말하는 대운(大運)이란 '갑자기 찾아오는 엄청나게 좋은 대박 행운'이 아니라, 10년마다 순환하며 바뀌는 <strong>내 인생의 거대한 기후적 환경과 무대</strong>를 의미합니다.
              </p>
              <p className="text-justify font-light">
                쉽게 말해 대운은 내가 운전해 가야 하는 도로의 포장 상태나 계절적 계절(봄·여름·가을·겨울)과 같으며, 매년 들어오는 세운(歲運)은 그 계절 위에서 날씨 변화처럼 매일 요동치는 비바람과 태양에 비유할 수 있습니다. 내가 달리는 고속도로(대운)가 비포장도로라면 아무리 맑은 날씨의 세운을 만나더라도 속도를 내기 어렵고, 도로 상태가 매끄러운 8차선 아스팔트 대운을 지나고 있다면 일시적으로 태풍이나 눈비(나쁜 세운)가 찾아오더라도 가볍게 이겨내며 안정을 유지할 수 있는 이치입니다.
              </p>
              <p className="text-justify font-light">
                의뢰인 {name}님의 현재 10년 대운의 궤적은 2026년 병오년의 맹렬한 불꽃 기류와 만나 인생의 실질적인 전환점과 삶의 우선순위 조정을 강력하게 암시하고 있습니다. 대운의 지지가 나의 사주 균형을 돕는 오행인 수(水)나 금(金) 기운을 다정하게 머금고 있다면 세운의 과도한 화기를 정밀 제어하여 유용한 황동 보검으로 제련해 내는 생애 최고의 번영기가 펼쳐질 것이고, 대운마저 불씨를 자극하는 목(木)이나 화(火) 기류로 치우쳐 있다면 감정적 과열과 돌발 손재수를 방어하는 보수적 수비 전략이 강력하게 요구됩니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 내 인생의 대세 대운을 면밀하게 이해하고, 세운의 기후 변화에 유연하게 옷을 갈아입는 자만이 무모한 질주를 차단하고 다가올 10년의 경제적·신체적 안정을 견고하게 수호할 수 있습니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );
      }

      case "ny_seoun_analysis": {
        const speedAngle = -180 + (92 / 100) * 180;
        const rad = speedAngle * Math.PI / 180;
        const needleX = 100 + 60 * Math.cos(rad);
        const needleY = 90 + 60 * Math.sin(rad);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2026 병오년(丙午年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">천지합화(天地合火) - 태양과 용광로의 역동적 서사</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 화기 팽창도 스피도미터 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
              <span className="font-bold text-xs text-[#8A6F4C] mb-2">🔥 2026 병오년 세운 화기(火氣) 팽창도</span>
              <div className="relative w-[180px] h-[105px]">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="#F3F4F6" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="235" strokeDashoffset="18" />
                  
                  <circle cx="100" cy="90" r="5" fill="#1A1A1A" />
                  <line x1="100" y1="90" x2={needleX} y2={needleY} stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <text x="100" y="80" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8B221E">92% 극대화</text>
                  <text x="25" y="105" textAnchor="middle" fontSize="8" fill="#9CA3AF">안정</text>
                  <text x="175" y="105" textAnchor="middle" fontSize="8" fill="#EF4444">임계(팽창)</text>
                </svg>
              </div>
              <p className="text-[9px] text-gray-400 font-light mt-1">
                * 올해 천지합화(天地合火) 기운에 의해 우주적 열팽창도가 임계치에 다다라 자아 및 감정이 과열되기 쉽습니다.
              </p>
            </div>

            {/* 프리미엄 시각화 2: 4대 분야별 신년 운세 등급 카드 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 분야별 길흉 대조 카드</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold">
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🪙 재물운</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded block">대길 (大吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">💼 직업운</span>
                  <span className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded block">상승 (吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🌿 건강운</span>
                  <span className="bg-red-50 text-red-800 px-1 py-0.5 rounded block">경고 (凶)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🤝 대인운</span>
                  <span className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded block">조율 (平)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="border-l-4 border-[#8B221E] pl-4 py-1">
                <h4 className="font-myeongjo text-sm font-bold text-gray-800">하늘과 대지를 붉게 태우는 거대한 에너지</h4>
                <p className="text-[11px] text-gray-500 mt-1">천간 丙火(태양)와 지지 午火(용광로)가 일으키는 극단적 양기(陽氣)의 절정</p>
              </div>
              <p className="text-justify font-light">
                2026년 병오년은 하늘의 환하고 눈부신 태양이자 만물을 비추는 순수 불꽃인 <strong>병화(丙火)</strong>와 지상의 거대한 용광로이자 쉬지 않고 거칠게 질주하는 준마인 <strong>오화(午火)</strong>가 위아래로 하나를 이루며 다가오는 격정적인 해입니다. 명리학에서는 이처럼 천간과 지지가 모두 화(火) 기운으로 강력하게 결합한 형세를 <strong>천지합화(天地合火)</strong>라 칭하며, 우주의 팽창력과 열정이 극한에 다다르는 시기로 정의합니다.
              </p>
              <p className="text-justify font-light">
                이 기류 하에서는 온 세상의 라이프사이클 속도가 무서우리만치 빨라집니다. 감추어졌던 어두운 위선이나 묵은 조직의 모순들이 태양 아래 적나라하게 폭로되며 강제적인 개혁과 정리가 단행되고, 문화, 기술, IT 산업에서는 기존 패러다임을 뒤흔드는 파괴적 혁신이 불길처럼 번집니다. 개인 역시 그간 억눌러 왔던 자립심과 열망이 폭발하여 이직, 독립, 새로운 공부나 비즈니스에 도전하고자 하는 마음의 역동성이 최대로 상승하게 됩니다.
              </p>
              <p className="text-justify font-light">
                그러나 과도한 화염은 반드시 주위의 물과 쇠를 메마르게 하고 산을 가뭄에 찌들게 합니다. 심리적인 조급함으로 인해 섣부른 계약서 도장을 찍거나, 분노를 조절하지 못해 소중한 인맥을 태워버릴 리스크가 공존하므로, 타오르는 불길 한가운데에서 차가운 호수 같은 침묵과 정교한 자금 수비 대책을 세워 두는 것만이 올해 약속된 번영과 권세를 완전히 내 것으로 만드는 혜안의 핵심입니다.
              </p>
            </div>
          </div>,
          "병오년 세운 기류 총평"
        );
      }

      case "ny_stem_harmony":
        let stemHarmonyDesc = "";
        let relationGraph = null;
        const dayStemEl = sajuInfo.day.stemEl;
        const dayStem = sajuInfo.day.stem;
        
        if (dayStemEl === "목") {
          stemHarmonyDesc = `의뢰인 ${name}님은 청량한 나무(木)의 일간(${dayStem}) 기질을 품고 계십니다. 나무가 병오년의 불꽃(화)을 만나면 자신의 잎과 꽃을 흐드러지게 피워내는 '식상(食傷)'의 작용이 일어납니다. 올해는 창의적인 아이디어가 번뜩이고 표현 능력이 극대화되어 나의 매력과 실력을 세상에 널리 알릴 최고의 기회입니다. 새로운 프로젝트의 기획이나 예술적 창작, 그리고 대외적인 마케팅 활동에서 누구보다 눈부신 두각을 나타내게 될 것입니다. 다만, 불이 맹렬해질수록 내 본연의 수분이 빠르게 고갈되므로 감정적 번아웃과 불만족(욱하는 감정)을 슬기롭게 다스려야 합니다. 특히 대인 관계에서 자존심을 앞세우기보다 한 템포 물러서서 상대의 의견을 경청하는 유연성이 올 한 해의 성패를 가를 것입니다.`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#5F7A68] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}木)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">목생화 (식상·발산)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "화") {
          stemHarmonyDesc = `의뢰인 ${name}님은 태양 혹은 횃불(화)의 일간(${dayStem}) 기질을 지니셨습니다. 내 기운과 동일한 병오년의 거대한 불꽃(화)을 조우하여 '비겁(比劫)'이 극에 달하는 주체적인 해가 됩니다. 자신감과 독립심이 극대화되어 신규 사업, 창업, 혹은 강력한 자립을 도모하려는 에너지가 솟구칩니다. 남의 눈치를 보지 않고 오롯이 내 주도하에 판을 짜고 리드할 수 있는 최적의 시기입니다. 다만, 강한 자존심끼리 마주쳐 동료, 배우자와 대립하거나 자만으로 손재수를 입기 쉬우니 한 걸음 양보가 운을 살리는 지름길입니다. 주변 사람들과의 공생을 먼저 고려하고, 지나친 확장을 경계하는 신중함이야말로 솟구치는 불길을 황금으로 바꾸는 연쇠가 될 것입니다.`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-red-500 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}火)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">비겁중중 (경쟁·자립)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "토") {
          stemHarmonyDesc = `의뢰인 ${name}님은 넉넉한 대지(토)의 일간(${dayStem}) 기질을 소유하고 계십니다. 불꽃(화)이 흙을 다정하게 익혀주고 단단히 다져주는 '인성(印星)'의 대단히 길한 기류가 도래합니다. 공부, 학업, 국가 고시, 자격증 취득 등 문서상의 경사가 따르며, 나를 후원해 주는 조력자나 은인(귀인)의 등장이 강력하게 보장되는 은혜롭고 든든한 한 해가 될 것입니다. 인생의 중요한 계약서 도장을 찍거나, 부동산 및 문서 형태의 자산을 확보하는 데 최고의 타이밍입니다. 다만, 들어오는 기운이 지나치게 강해지면 스스로 안일함에 빠지거나 행동하지 않고 생각만 많아지는 부작용이 생길 수 있으니, 계획을 세웠다면 지체 없이 실천으로 옮기는 기동력을 발휘하십시오.`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#A3845B] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}土)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">화생토 (인성·후원)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "금") {
          stemHarmonyDesc = `의뢰인 ${name}님은 단단한 바위나 보석(금)의 일간(${dayStem}) 기질을 타고나셨습니다. 맹렬한 불꽃(화)이 쇠붙이를 제련하고 쓸모 있는 도구로 다듬는 강력한 '관성(官星)'의 해를 지납니다. 직장에서 중책을 맡아 공적 위상이 올라가거나 승진 및 영전의 기회를 얻게 됩니다. 나의 명예와 신용도가 크게 올라가 주변의 존경을 받는 귀한 시기입니다. 다만 압박감과 책임감이 극에 달해 뼈, 호흡기 계통 건강 관리 및 상사와의 충돌 조절에 만전을 기해야 합니다. 지나친 완벽주의로 스스로를 옥죄기 쉬우니, 일과 휴식의 균형을 엄격하게 관리하고 사소한 실수에는 관대해지는 너그러운 마음가짐이 절대적으로 요구됩니다.`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-400 text-gray-900 rounded font-bold text-xs shadow-sm">나 ({dayStem}金)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-red-100 text-red-950 border border-red-300 rounded text-[9px] font-semibold">화극금 (관성·제련)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else {
          stemHarmonyDesc = `의뢰인 ${name}님은 깊고 차가운 물(수)의 일간(${dayStem}) 기질을 지니고 태어나셨습니다. 차가운 물줄기가 2026년 병오년의 거대한 화기(화)를 통제하고 가두는 '재성(財星)'의 해가 열립니다. 막혔던 현금 흐름이 트이고 투자 소득, 연봉 협상 타결, 횡재수 등 경제적 기회가 요동칩니다. 내 노력의 결실이 눈에 보이는 성과물로 뚜렷하게 환원되는 가장 역동적인 한 해가 될 것입니다. 다만 불을 끄느라 내 수분이 소모되므로 건강을 챙기며 에너지를 완급 조절하십시오. 급격하게 늘어나는 지출이나 감정적 소비를 통제하고, 안정적인 저축 비중을 늘려야 연말에 새어나가는 자금 없이 든든한 금고를 지킬 수 있습니다.`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-800 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}水)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">수극화 (재성·획득)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일간(日干)과의 융합</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 타고난 일간과 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center font-bold text-sm text-[#A3845B]">
                {name}님의 일간: {dayStem} ({dayStemEl}의 기운)
              </div>
              
              {relationGraph}

              <p className="mt-4">
                {stemHarmonyDesc}
              </p>
            </div>
          </div>,
          "일간 오행과 세운의 융합 분석"
        );

      case "ny_ilju_harmony":
        const ilju = sajuInfo.day.stem + sajuInfo.day.branch;
        const dayBranch = sajuInfo.day.branch;
        let relationDesc = "";
        let statusBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>;
        
        if (dayBranch === "子") {
          relationDesc = "2026년 오화(午火) 세운은 귀하의 일지 자수(子水)와 격렬히 부딪치는 자오충(子午沖)을 유발합니다. 이는 집터, 근무지 이동, 혹은 부부 관계의 급격한 지각변동을 뜻합니다. 흔들림을 두려워하기보다 고여있던 나쁜 습관을 털어내는 계기로 삼으십시오.";
          statusBadge = <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-sm">⚠️ 격렬한 변화 (충살)</span>;
        } else if (dayBranch === "午") {
          relationDesc = "2026년 오화(午火)는 내 일지의 오화와 겹쳐 스스로를 옭아매는 오오자형(午午自刑)을 일으킵니다. 감정 기복이 심해져 섣부른 말이나 행동으로 일을 그르치기 쉬우니 계약 체결 시에는 반드시 타인의 피드백을 한 번 더 거치십시오.";
          statusBadge = <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 스스로 단속 (자형)</span>;
        } else if (dayBranch === "未" || dayBranch === "寅" || dayBranch === "戌") {
          relationDesc = "2026년 세운의 오화(午火)는 내 일지와 따뜻한 합(午未 육합, 寅午戌 삼합)을 이루어 평화롭고 조화로운 기류를 형성합니다. 대인관계의 오해가 눈 녹듯 풀리고 귀인의 적극적인 협력을 받아 편안하게 안정을 얻을 수 있는 대길한 흐름입니다.";
          statusBadge = <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 대길한 화합 (지합)</span>;
        } else if (dayBranch === "丑") {
          relationDesc = "2026년 오화(午火)는 내 일지 축토(丑土)와 만나며 서로 은근히 밀어내고 원망하게 만드는 축오원진(丑午怨嗔) 및 귀문관살 기류를 생성합니다. 예민함과 심리적 불안정이 높아져 가까운 이의 말 한마디에 큰 상처를 입거나 오해를 하기 쉽습니다. 상대방을 비난하기 전에 한 템포 호흡을 고르고 이성적으로 팩트를 점검하십시오.";
          statusBadge = <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 감정 오해 (원진)</span>;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일주(日柱) 지합·충 진단</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">일주와 세운의 형·충·회·합 정밀 진단</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="flex justify-between items-center bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-sm font-bold text-[#8B221E]">
                <span>귀하의 타고난 일주: {ilju}일주</span>
                {statusBadge}
              </div>
              <p className="mt-4">
                일지는 사주에서 <strong>나의 개인적인 안식처, 침실, 그리고 배우자 궁</strong>을 상징합니다. 1년의 기류를 지배하는 세운의 지지(오화)가 내 안식처의 글자와 어떤 관계를 맺느냐에 따라 실질적인 신체 컨디션과 가정생활의 평화 지수가 좌우됩니다.
              </p>
              <p>
                {relationDesc}
              </p>
            </div>
          </div>,
          "일주와 세운의 합·충·형·파·해 진단"
        );

      case "ny_elements_balance":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 오행 균형</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 세운 유입 오행 균형 분석</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs text-gray-700 font-traditional">
              <p className="leading-relaxed font-light">
                의뢰인 {name}님의 타고난 사주 원국 8글자에 2026년 병오년의 <strong>강렬한 불(火) 기운 2개</strong>가 유입되었을 때의 종합 오행 저울 분포 상태입니다. 오행의 치우침 정도에 따라 한 해의 운명적 컨디션이 요동치게 됩니다.
              </p>
              
              <div className="space-y-3 bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60">
                {Object.entries(sajuInfo.elements).map(([el, count]) => {
                  const nyCount = el === "화" ? count + 2 : count;
                  const percentage = (nyCount / 10) * 100;
                  return (
                    <div key={el} className="flex items-center gap-3 text-xs">
                      <span className={`w-16 text-center py-0.5 rounded font-bold text-[10px] ${getElementColor(el)}`}>
                        {el} ({nyCount}개)
                      </span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getElementBarColor(el)}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-gray-500">{Math.round(percentage)}%</span>
                    </div>
                  );
                })}
              </div>

              <p className="leading-relaxed font-light border-t border-[#E2DDD5]/60 pt-3">
                {sajuInfo.elements.화 + 2 >= 4 ? (
                  <span className="text-red-700 font-bold block mb-1 flex items-center gap-1">⚠️ [경보] 화(火) 기운의 비대화로 인한 건조/과열 상태</span>
                ) : (
                  <span className="text-gray-800 font-bold block mb-1 flex items-center gap-1">✓ [안정] 적절한 화기 조율 상태</span>
                )}
                올해 세상은 거대한 화염으로 뒤덮여, 상대적으로 <strong>수(水)와 금(金)의 기운이 극단적으로 증발하거나 쇠약해지는 약화 상태</strong>가 발생하기 쉽습니다. 사주 균형이 무너지면 심리적으로 성급해지고 체력이 쉽게 고갈되므로, 일상생활 속에서 인위적으로 물과 금속의 차갑고 안정적인 에너지를 수혈하여 기류의 과열을 방어해 주는 처방이 필수적입니다.
              </p>
            </div>
          </div>,
          "신년 오행 과잉/결핍 진단"
        );

      case "ny_elements_supplement":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 보완 비책 (五行 補完 秘策)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">부족한 오행을 채우는 생활 밀착 개운법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)의 맹렬한 불꽃 기류 속에서 내 사주 원국을 안정시키기 위해서는 강한 불기운에 의해 증발하기 쉬운 <strong>수(水)</strong> 기운과 녹아내리기 쉬운 <strong>금(金)</strong> 기운을 보완해야 합니다. 오행의 상생 흐름인 <strong>금생수(金生水: 쇠가 물을 맑게 걸러내고 생한다)</strong> 작용을 일상에서 실천하여 운명을 개척하는 최고의 처방입니다.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 수 기운 보완 처방 */}
                <div className="border border-[#D4E2D7] bg-[#F4FAF6] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="font-bold text-[#2D5A27] text-xs border-b border-[#2D5A27]/20 pb-2 flex items-center gap-1.5">
                    <span className="text-lg">🌊</span> 수(水) 기운 처방: 지혜와 평온
                  </div>
                  
                  {/* 시각화: 개운 지표 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-[#2D5A27] font-semibold">
                      <span>정신적 여유 & 충동 억제</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E6EFEA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D5A27] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>

                  <ul className="space-y-2 text-[10px] text-gray-600 font-light pt-2">
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>개운 시간:</strong> 진시(07~09시) 공복 냉수, 해시(21~23시) 명상 반신욕</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>공간 풍수:</strong> 집안 북쪽에 바다/호수 그림 액자나 미니 어항 배치</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>행운 스타일:</strong> 블랙, 네이비 계열 의상, 유연한 실크 소재 패션</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>보약 식품:</strong> 미역, 다시마 등 해조류, 블랙푸드(검은깨, 검은콩)</span>
                    </li>
                  </ul>
                  <p className="text-[9px] text-gray-500 bg-white/70 p-2 rounded border border-[#E2DDD5]/30 leading-normal">
                    💡 <strong>보충 설명:</strong> 수(水) 기운은 성급한 불길을 잠재우고 내면의 통찰을 깨워줍니다. 감정이 격앙될 때 시원한 물 한 잔을 천천히 음미하는 행동이 즉각적인 개운법입니다.
                  </p>
                </div>

                {/* 금 기운 보완 처방 */}
                <div className="border border-[#E7DCD0] bg-[#FCF9F5] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="font-bold text-[#A3845B] text-xs border-b border-[#A3845B]/20 pb-2 flex items-center gap-1.5">
                    <span className="text-lg">🪙</span> 금(金) 기운 처방: 결단과 자산
                  </div>

                  {/* 시각화: 개운 지표 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-[#A3845B] font-semibold">
                      <span>현실적 결단 & 자산 보호</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2ECE4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>

                  <ul className="space-y-2 text-[10px] text-gray-600 font-light pt-2">
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>개운 시간:</strong> 사시(09~11시) 플래너 수기 기록, 신시(15~17시) 완급 조율</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>공간 풍수:</strong> 서재 서쪽에 정돈된 금속 스탠드나 흰색 석조 소품 배치</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>행운 스타일:</strong> 화이트, 실버 메탈 시계나 은 반지 악세사리 착용</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>보약 식품:</strong> 아몬드, 호두 등 견과류, 도라지나 배 등 흰색 식품</span>
                    </li>
                  </ul>
                  <p className="text-[9px] text-gray-500 bg-white/70 p-2 rounded border border-[#E2DDD5]/30 leading-normal">
                    💡 <strong>보충 설명:</strong> 금(金) 기운은 맺고 끊음이 흐려질 때 단호한 판단력을 주고, 불필요하게 돈이 세어 나가는 것을 방어하여 내 지갑과 재물 창고를 튼튼하게 지켜줍니다.
                  </p>
                </div>
              </div>

              {/* 하단 융합 시각적 요약 박스 (금생수 상생 작용) */}
              <div className="border border-[#E2DDD5] bg-[#FAF8F5] rounded-xl p-5 space-y-3">
                <h4 className="font-myeongjo text-xs font-bold text-[#8B221E] text-center">
                  🔑 2026 병오년 수호의 핵심: 금생수(金生水) 상생 순환도
                </h4>
                
                <div className="flex items-center justify-around py-2 max-w-sm mx-auto bg-white rounded-lg border border-[#E2DDD5]/60 shadow-inner">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-bold text-xs text-gray-800 shadow-sm">金 (금)</div>
                    <span className="text-[8px] text-gray-500 mt-1">냉철한 결단</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-bold text-sm">➔</span>
                    <span className="text-[7px] text-[#8B221E] font-semibold bg-red-50 px-1 rounded border border-red-200">금생수 (상생)</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-900 shadow-sm">水 (수)</div>
                    <span className="text-[8px] text-blue-600 mt-1">유연한 수용</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-bold text-sm">➔</span>
                    <span className="text-[7px] text-green-700 font-semibold bg-green-50 px-1 rounded border border-green-200">화기 제어 (안정)</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-xs text-amber-900 shadow-sm">平 (평)</div>
                    <span className="text-[8px] text-amber-700 mt-1">신년 균형 회복</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed text-center font-light pt-1">
                  결단(金)이 바로 서야 지혜(水)가 맑아지고, 비로소 세운의 격렬한 불기운(火)을 지혜롭게 조율하여 **안정적인 부와 명예**를 성취할 수 있습니다.
                </p>
              </div>
            </div>
          </div>,
          "부족한 오행을 채우는 일상 개운법"
        );

      case "ny_health_presc":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">건강 수호 보감 (健康 守護 寶鑑)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">세운 기류 변화에 따른 신년 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                동양 의학의 원전인 황제내경(黃帝內經) 운기학에 따르면, 2026년 병오년은 강력한 불의 세력이 기승을 부려 우리 신체 내부의 <strong>심장(심혈관계), 소장, 그리고 안구 부위의 열감을 강하게 자극</strong>하게 됩니다. 상대적으로 화기(火氣)에 의해 수분과 금속 기운이 증발하면서 <strong>호흡기계(폐/기관지) 및 비뇨기계(신장/방광)가 건조하게 메마르는 리스크</strong>가 유독 높으므로 이에 대한 선제적 방어가 필수적입니다.
              </p>
              
              {/* 장부별 건강 적신호 정밀 진단 카드 */}
              <div className="space-y-4">
                {/* 심혈관계 카드 */}
                <div className="border border-red-100 bg-red-50/30 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-red-100/70 pb-2">
                    <span className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
                      <span>❤️</span> 심혈관계 (심장 / 혈압 / 혈액순환)
                    </span>
                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">⚠️ 과열·위험 상태</span>
                  </div>
                  
                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-red-700 font-semibold">
                      <span>심장 열감 및 자율신경 압박도</span>
                      <span>80% (위험)</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100/60 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    강렬한 세운의 화기가 혈압 상승 및 상열감을 부추깁니다. 평소 두통이 잦거나 안구가 쉽게 충혈되는 증상이 생기며, 자율신경계 과열로 인한 가슴 두근거림이나 불면 증상이 찾아올 수 있으니 흥분과 과로를 피해야 합니다.
                  </p>
                  <div className="text-[9px] text-[#8B221E] font-medium bg-white/80 p-2 rounded border border-red-200/50">
                    💡 <strong>실천 요령:</strong> 매운 자극성 음식과 음주를 제한하고, 하루 10분씩 뇌를 식히는 냉각 호흡 및 명상을 실천해 열감을 내려야 합니다.
                  </div>
                </div>

                {/* 호흡기계 카드 */}
                <div className="border border-amber-100 bg-amber-50/20 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-amber-100/70 pb-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                      <span>🤍</span> 호흡기계 (폐 / 기관지 / 피부 건조)
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">⚠️ 수분 증발·주의</span>
                  </div>

                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-amber-800 font-semibold">
                      <span>기관지 점막 및 피부 건조도</span>
                      <span>60% (주의)</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    뜨거운 열기가 사주의 금(金) 기운을 녹이면서 기관지 점막과 피부 장벽을 빠르게 메마르게 만듭니다. 원인 모를 마른기침, 목 이물감, 만성적인 인후염 및 피부 가려움증이 쉽게 도질 수 있어 보습 관리가 생명입니다.
                  </p>
                  <div className="text-[9px] text-amber-900 font-medium bg-white/80 p-2 rounded border border-amber-200/50">
                    💡 <strong>실천 요령:</strong> 가습기를 활용해 실내 습도를 50~60%로 고정하고, 점막을 촉촉하게 지켜주는 맥문동이나 오미자차를 수시로 마시면 건조증을 예방할 수 있습니다.
                  </div>
                </div>

                {/* 비뇨기계 카드 */}
                <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-100/70 pb-2">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                      <span>🖤</span> 비뇨기계 (신장 / 방광 / 만성 피로)
                    </span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">⚠️ 수기 고갈·쇠약</span>
                  </div>

                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-blue-800 font-semibold">
                      <span>신장 필터 기능 및 에너지 쇠약도</span>
                      <span>40% (약화)</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    오행의 물(水) 기운이 세운의 불길을 잡기 위해 과도하게 소모되면서 신장과 방광 기능이 쇠약해집니다. 이로 인해 만성 피로가 유발되고, 아침마다 몸과 얼굴이 자주 부으며 하체 근력과 비뇨계통 에너지가 저하되기 쉽습니다.
                  </p>
                  <div className="text-[9px] text-blue-950 font-medium bg-white/80 p-2 rounded border border-blue-200/50">
                    💡 <strong>실천 요령:</strong> 무리한 야근과 과로를 피하고 충분한 수면 시간을 보장해야 하며, 검은깨, 검은콩 등 짠맛을 지닌 블랙 오행 식품으로 신장의 근본 수기를 보충해야 합니다.
                  </div>
                </div>
              </div>

              {/* 하단: 건강 수호 3대 비책 체크리스트 */}
              <div className="border border-[#E2DDD5]/60 rounded-xl p-5 bg-[#FAF8F5] shadow-sm space-y-3">
                <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] border-b border-[#E2DDD5]/50 pb-1.5 flex items-center gap-1.5">
                  🍀 [신년 건강 수호를 위한 3대 핵심 생활 수칙]
                </h4>
                <div className="grid gap-2 text-[10px] text-gray-600 font-light">
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <p className="leading-relaxed"><strong>하루 미온수 1.5L 규칙적 수혈:</strong> 차가운 얼음물은 자칫 비위를 상하게 하니 체온과 비슷한 온도의 맑은 물을 매시간 반 컵씩 음용하십시오.</p>
                  </div>
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <p className="leading-relaxed"><strong>야간 족욕 및 반신욕 생활화:</strong> 머리로 솟아오른 뜨거운 기운을 발밑으로 끌어내리는 수승화강(水昇火降) 요법으로 불면증과 안구 건조증을 퇴치하십시오.</p>
                  </div>
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <p className="leading-relaxed"><strong>자연 친화적 흙길 밟기(어싱):</strong> 전자파를 빼주고 지구 대지의 안정적 에너지를 발바닥으로 흡수하여 심혈관계의 압박을 낮추는 최고의 자연 요법입니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          "신년 건강 처방"
        );
      case "ny_lucky_secrets":
        const luckyColor = prescriptions[0]?.color || "밝은 계열";
        const luckyDir = prescriptions[0]?.direction || "북쪽";
        const luckyNum = prescriptions[0]?.number || "1, 6";
        const luckyItem = prescriptions[0]?.items || "수경 식물, 미니 가습기";
        const dayStemElChar = sajuInfo.day.stemEl;
        
        let luckyMantra = "";
        if (dayStemElChar === "목") luckyMantra = "나는 굳건한 거목처럼 흔들림 없이 성장하며, 신년의 불꽃을 창조적 결실로 승화한다.";
        else if (dayStemElChar === "화") luckyMantra = "나는 밝은 등불이 되어 세상을 주도하며, 주변과 상생하는 지혜를 실천한다.";
        else if (dayStemElChar === "토") luckyMantra = "나는 넉넉한 대지처럼 만물을 품어 안으며, 차분한 문서의 경사를 맞이한다.";
        else if (dayStemElChar === "금") luckyMantra = "나는 강직한 무쇠처럼 스스로를 제련하여, 명예로운 승진과 안정을 쟁취한다.";
        else luckyMantra = "나는 유연한 강물처럼 굽이쳐 흐르며, 다가오는 풍요로운 재물 기회를 온전히 담아낸다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 행운 비방 (新年 行運 秘方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026 병오년 맞춤 수호 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-gray-600 font-light text-justify">
                2026년 병오년의 타오르는 불꽃 속에서 의뢰인 ${name}님의 기운을 온전히 수호하고 재물운과 명예운을 팽창시켜 줄 행운 비방입니다. 일상 속에서 적극 활용하여 개운을 유도하십시오.
              </p>
              
              <div className="grid grid-cols-3 gap-3 text-center py-4 bg-[#FAF7F0] rounded-xl border border-[#E2DDD5]/60 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-semibold">🎨 수호 색상</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyColor}</span>
                </div>
                <div className="space-y-1 border-x border-[#E2DDD5]/60">
                  <span className="text-[10px] text-gray-400 block font-semibold">🔢 행운의 숫자</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyNum}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-semibold">🧭 개운 방향</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyDir}</span>
                </div>
              </div>

              {/* 추가 처방 카드 */}
              <div className="border border-[#E2DDD5]/70 rounded-xl p-4 bg-[#FAF8F5] space-y-3 shadow-sm">
                <span className="font-bold text-xs text-[#A3845B] block">🗝️ 수호 귀인 보완 소품</span>
                <p className="text-[11px] text-gray-600 leading-normal">
                  귀하의 신년 수호 소품은 <strong>{luckyItem}</strong>입니다. 현관 입구의 잘 보이는 곳이나 집안의 {luckyDir} 방위에 해당 소품을 배치해 두면, 탁하고 과열된 기류를 정화하고 대길한 에너지를 실시간으로 수혈해 주는 필터 역할을 합니다.
                </p>
              </div>

              {/* 수호 선언문 (Mantra) */}
              <div className="border-2 border-double border-[#A3845B]/40 bg-white rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#A3845B]/5 rounded-bl-full flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold text-[#A3845B]/40 rotate-45 select-none">MANTRA</span>
                </div>
                <span className="font-bold text-xs text-[#8B221E] block">🔮 매일 아침 외치는 [신년 수호 만트라]</span>
                <div className="bg-[#FAF7F0] border-l-4 border-[#8B221E] p-3 rounded-r">
                  <p className="font-myeongjo text-[11px] leading-relaxed text-gray-800 italic font-semibold">
                    " {luckyMantra} "
                  </p>
                </div>
                <p className="text-[9px] text-gray-400 font-light leading-relaxed">
                  * 매일 아침 거울을 보고 이 선언문을 스스로에게 낭독하십시오. 말(言)이 가진 파동 에너지가 잠든 무의식을 깨워 운의 궤도를 즉시 순행하도록 조율해 줍니다.
                </p>
              </div>
            </div>
          </div>,
          "신년 맞춤 행운 비방"
        );

      case "ny_monthly": {
        const m = page.monthNum || 1;
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const elements = sajuInfo?.elements || {};
        
        let monthlyPrescription = "";
        if (m === 10) {
          if (dayStemEl === "목") monthlyPrescription = " 수생목(水生木)의 기류가 뇌파를 안정시키니, 새로운 지식을 습득하고 명상을 통해 정신을 맑게 가다듬기에 최적의 시기입니다.";
          else if (dayStemEl === "화") monthlyPrescription = " 수극화(水剋火)의 흐름 속에 심장의 열기가 조율되니, 흥분을 가라앉히고 냉정한 시각으로 계약서나 문서를 꼼꼼히 검토하십시오.";
          else if (dayStemEl === "토") monthlyPrescription = " 토극수(土剋水)의 재성 기운이 활성화되니, 그동안 미뤄두었던 실질적인 자산 투자나 재정 관리에 착수하면 이롭습니다.";
          else if (dayStemEl === "금") monthlyPrescription = " 금생수(金生水)의 설기 기운이 강해지니, 과도한 에너지 소모를 방지하기 위해 충분한 휴식을 취하고 체력 관리에 힘쓰십시오.";
          else monthlyPrescription = " 수(水) 기운이 겹쳐 비겁이 강해지는 시기이니, 고집을 부리기보다 주변 조력자의 의견을 경청하는 포용력이 필요합니다.";
        } else if (m === 11) {
          if (dayStemEl === "목") monthlyPrescription = " 금생수-수생목의 관인상생(官印相生) 기류가 문서를 돕고 학문 성취를 길하게 하니, 중요한 시험이나 라이선스 획득에 집중하십시오.";
          else if (dayStemEl === "화") monthlyPrescription = " 강한 관성의 압박이 들어오는 시기이므로, 무리한 운동이나 과로를 피하고 충분한 숙면을 통해 심혈관 건강을 지키십시오.";
          else if (dayStemEl === "토") monthlyPrescription = " 금식상과 수재성이 어우러져 식상생재(食傷生財)를 이루니, 적극적으로 재능을 펼치고 창의적인 비즈니스 아이디어를 실천해보십시오.";
          else if (dayStemEl === "금") monthlyPrescription = " 비겁의 굳건함과 식상의 활동성이 조화되니, 자신감을 바탕으로 업무적인 주도권을 잡고 일을 추진해 나가기 좋습니다.";
          else monthlyPrescription = " 수(水) 기운이 극도로 왕성해져 차가운 냉기가 도니, 아랫배를 따뜻하게 유지하고 매일 따뜻한 물이나 생강차를 자주 마셔 보온하십시오.";
        } else if (m === 12) {
          if (dayStemEl === "목") monthlyPrescription = " 토재성과 금관성이 관인과 연결되는 교두보이므로, 불필요한 대인 관계 갈등을 줄이고 실리적인 비즈니스 조율에 힘쓰십시오.";
          else if (dayStemEl === "화") monthlyPrescription = " 축토 식상의 습기와 신금 재성이 열기를 수렴하니, 감정적인 지출을 억제하고 안전자산 비중을 단단히 굳히는 것이 유리합니다.";
          else if (dayStemEl === "토") monthlyPrescription = " 비겁과 식상의 기운이 응축되는 엄동설한이니, 새로운 판을 벌이기보다 기존 자산을 정밀하게 결산하고 신년 계획을 설계하십시오.";
          else if (dayStemEl === "금") monthlyPrescription = " 인성과 비겁이 든든한 버팀목이 되어주니, 주변의 든든한 신뢰를 바탕으로 장기적인 투자나 계약의 기틀을 마련해보십시오.";
          else monthlyPrescription = " 토관성이 관리를 돕고 금인성이 지혜를 채우니, 마음의 조급함을 버리고 차분히 자리를 지키며 실력을 배양하는 내실에 집중하십시오.";
        }

        const monthTitles = {
          1: "음력 1월은 새로운 기운이 싹트는 무풍지대와 같으나, 세운의 갑작스러운 변화 기류를 감지해야 합니다.",
          2: "음력 2월은 만물이 깨어나는 춘분기이나, 일시적인 꽃샘추위처럼 인간관계의 구설수를 주의하십시오.",
          3: "음력 3월은 비옥한 황토 대지에 씨앗을 뿌리는 시기이니, 새로운 비즈니스 파트너십이 대길합니다.",
          4: "음력 4월은 여름의 초입에서 만물이 울창해지듯, 내 능력을 적극 발산하고 제안서를 제출하기 최적입니다.",
          5: "음력 5월은 화기가 극대화되는 시기이니, 심혈관계 피로와 충동적인 투자를 피하는 수성(守城) 전략을 쓰십시오.",
          6: "음력 6월은 무더운 삼복더위처럼 갈등이 표출되기 쉬우니 감정적 대립을 억제하고 소통을 부드럽게 유지하십시오.",
          7: "음력 7월은 선선한 가을바람이 불어와 열기를 내리듯, 묵은 문서나 계약 갈등이 순탄하게 조율되기 시작합니다.",
          8: "음력 8월은 풍요로운 추수기이니, 노력했던 자산 성취나 승진 계약의 도장을 찍기 최고의 골든타임입니다.",
          9: "음력 9월은 서리가 내리는 시기이니, 무리한 확장보다 기존 성과를 안전하게 결산하고 내실을 다지십시오.",
          10: "음력 10월은 기해월(己亥月)로서 굳건한 토 기운과 풍부한 수 기운이 유입되어 차분한 성찰에 유리합니다." + monthlyPrescription,
          11: "음력 11월은 경자월(庚子月)로서 싸늘한 금 기운과 응축된 수 기류가 천하를 덮어 조용히 기량을 닦아야 합니다." + monthlyPrescription,
          12: "음력 12월은 신축월(辛丑月)로서 차갑고 단단한 금토 기운이 1년의 마지막 결실을 갈무리하며 다음 도약을 예비합니다." + monthlyPrescription
        };
        const monthDetailsEnriched = {
          1: {
            wealth: "신년 초반에는 예상외의 지출이 생길 수 있으니 가계부를 철저히 점검하고 보수적으로 행동하십시오.",
            love: "서로에게 바빠 소홀해질 수 있으니 주말에는 온전히 동반자에게 마음을 집중해 대화를 나누십시오.",
            health: "겨울철 찬 바람으로 호흡기 면역력이 저하되기 쉬우니 충분한 미온수 음용과 휴식을 유지하십시오.",
            wealthVal: 3, loveVal: 3, healthVal: 3
          },
          2: {
            wealth: "구설수로 인한 불필요한 위약금이나 손실이 있을 수 있으니 서류 상의 확인을 두 번 이상 반복하십시오.",
            love: "작은 말다툼이 커져 신뢰에 금이 가기 쉽습니다. 상대가 먼저 불만을 말할 때 끝까지 들어주는 혜안이 필요합니다.",
            health: "환절기 비염이나 알레르기 피부 질환을 겪기 쉬우니 실내 청결과 공기 정화에 정성을 기울이십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 3
          },
          3: {
            wealth: "좋은 협력자가 찾아와 유리한 조건의 비즈니스 계약을 제안하니 긍정적인 파트너십을 추진하십시오.",
            love: "싱글이라면 뜻하지 않은 모임에서 품격 있는 인연을 만나며, 커플은 깊은 신뢰 관계가 형성됩니다.",
            health: "겨울철에 움츠러들었던 신체 기맥을 깨워주는 스트레칭과 가벼운 하이킹으로 활력을 충전하십시오.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          4: {
            wealth: "내가 기획한 아이디어나 능력이 상사나 거래처의 호평을 받아 추가적인 인센티브나 기회가 도래합니다.",
            love: "다정다감한 태도가 연인에게 큰 안정감을 선사하며, 가족 간의 화목이 배가되는 평화로운 운기입니다.",
            health: "야외 활동이 잦아져 체력 소모가 빠르니 충분한 고단백 섭식과 숙면을 통해 에너지를 보충하십시오.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          5: {
            wealth: "화기가 팽창하여 충동적인 대출이나 리스크 높은 투자의 유혹이 생기나 무조건 지갑을 닫는 수성이 최선입니다.",
            love: "마음속의 짜증이 연인에게 화풀이로 이어지기 쉽습니다. 감정이 격해질 때는 잠시 거리를 두는 것이 안전합니다.",
            health: "심장의 열이 올라 불면증이나 두통이 생길 수 있으니 야간 카페인 섭취를 금하고 명상을 실천해 보십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 2
          },
          6: {
            wealth: "상반기 재정을 종합 결산하며 새는 구멍을 막아야 하는 시기입니다. 고정 비용을 줄이는 구조조정을 단행하십시오.",
            love: "오래 묵은 해묵은 갈등이 다시 떠오를 수 있습니다. 회피하지 말고 진심 어린 사과와 배려로 매듭을 지으십시오.",
            health: "여름철 더위로 인한 탈수 및 비뇨기계 질환이 염려되니 짠 음식을 피하고 수분을 넉넉히 보충하십시오.",
            wealthVal: 3, loveVal: 2, healthVal: 3
          },
          7: {
            wealth: "지연되었던 거래대금이 입금되거나 문서 갈등이 극적으로 조율되어 한숨을 돌리는 안정 기류가 흐릅니다.",
            love: "서로에 대한 불만이 오해였음을 깨닫고 편안한 정을 나눕니다. 가벼운 교외 드라이브가 연애운을 북돋웁니다.",
            health: "소화기계 점막이 약해져 체기가 생기기 쉬우니 기름지고 차가운 맥주나 인스턴트 섭취를 조절하십시오.",
            wealthVal: 4, loveVal: 4, healthVal: 3
          },
          8: {
            wealth: "상반기부터 땀 흘려 노력해 온 결과물이 금전적 계약이나 승진, 성과급의 형태로 확정되는 길한 시기입니다.",
            love: "연인과 미래의 구체적인 약속을 하거나 부모님께 인사를 드리는 등 공인된 관계로 안착하기 좋은 달입니다.",
            health: "신체 기운이 고르게 순환되어 가벼운 피로 외에는 최상의 컨디션을 유지하니 규칙적인 운동을 지속하십시오.",
            wealthVal: 5, loveVal: 5, healthVal: 4
          },
          9: {
            wealth: "신규 무리한 투자는 손실의 징조가 짙으니 국채나 예적금 등 원금 보존형 구조를 단단히 잠그십시오.",
            love: "서로에게 지나친 참견을 하기보다는 각자의 프라이버시를 존중하며 성숙한 거리를 지키는 것이 이롭습니다.",
            health: "기온 차가 큰 환절기이므로 체온 유지를 위해 머플러를 착용하시고 가벼운 따뜻한 차 음용을 습관화하십시오.",
            wealthVal: 3, loveVal: 3, healthVal: 3
          },
          10: {
            wealth: "풍부한 수기가 자금을 원활히 소통시켜 부차적인 이익을 창출하나, 동업 제안은 단호히 거절해야 자산을 지킵니다.",
            love: "대인관계와 연인 궁합에 은혜로운 평화가 도래합니다. 묵은 오해가 눈 녹듯 사그라들어 편안한 안락함을 공유하며 아늑한 정을 돈독하게 쌓아올립니다.",
            health: "신장과 비뇨기계 컨디션이 호전됩니다. 취침 전 따뜻한 핫팩을 아랫배에 올려 혈류를 덥혀주고 숙면을 취하면 다음 날 아침이 개운해질 것입니다.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          11: {
            wealth: "급작스러운 출장이나 환경적 변동으로 인해 부가적인 비용 지출이 발생할 수 있습니다. 비상금을 충분히 확보해 두고, 지인과의 금전 거래나 보증은 완전 거부하십시오.",
            love: "물리적 공간 변동(이사, 장거리 출장 등)으로 인해 서로 소통의 부재가 발생할 수 있습니다. 매일 정해진 시간에 다정하게 목소리 전화를 나누어 안심을 선물하십시오.",
            health: "빙판길 골절 사고나 심한 감기몸살의 위험이 상존하니 외출 시 따뜻하게 체온을 보존하시고 굽이 낮고 미끄러지지 않는 신발을 착용하십시오.",
            wealthVal: 2, loveVal: 3, healthVal: 1
          },
          12: {
            wealth: "1년의 재정 결산을 마무리하고 신년의 새로운 자금 계획을 세우는 시기입니다. 고정비를 줄이고 저축 비율을 한 단계 끌어올리는 알뜰한 재무 구조가 완성됩니다.",
            love: "안정적이고 차분한 애정 전선이 흐릅니다. 서로를 존중하며 다가오는 새해의 공통 목표(내 집 마련, 장기 계획 등)를 다정하게 설계하기에 최적입니다.",
            health: "체력을 고갈되기 쉬운 엄동설한의 시기이니 흰색 뿌리채소와 고단백 한식 요리로 신체 내부의 온기 센서를 채워 체력을 원천 보충해 주십시오.",
            wealthVal: 3, loveVal: 3, healthVal: 3
          }
        };
        
        const activeDetailBase = monthDetailsEnriched[m] || { wealth: "", love: "", health: "", wealthVal: 3, loveVal: 3, healthVal: 3 };
        
        let wealthMod = 0;
        let loveMod = 0;
        let healthMod = 0;

        const hwaCount = elements["화"] || 0;
        const toCount = elements["토"] || 0;
        const geumCount = elements["금"] || 0;
        const waterCount = elements["수"] || 0;

        if (m === 10) {
          if (dayStemEl === "목") wealthMod = (toCount >= 1) ? 1 : 0;
          else if (dayStemEl === "토") wealthMod = (toCount >= 2) ? 1 : 0;
          else if (dayStemEl === "화") wealthMod = (waterCount >= 3) ? -1 : 0;
          
          if (dayStemEl === "토" || dayStemEl === "금") loveMod = 1;
          else if (dayStemEl === "화" && waterCount >= 3) loveMod = -1;

          if (hwaCount >= 3 && waterCount === 0) healthMod = -1;
          else if (waterCount >= 1) healthMod = 1;
        } else if (m === 11) {
          if (dayStemEl === "목" && waterCount >= 1) wealthMod = 1;
          else if (dayStemEl === "화") wealthMod = -1;
          
          if (dayStemEl === "목" || dayStemEl === "토") loveMod = 1;

          if (hwaCount <= 1) healthMod = -1;
          else if (hwaCount >= 2) healthMod = 1;
        } else if (m === 12) {
          if (toCount >= 1 && geumCount >= 1) wealthMod = 1;
          if (dayStemEl === "화" || dayStemEl === "수") loveMod = 1;
          if (geumCount >= 3 && (elements["목"] || 0) <= 1) healthMod = -1;
        }

        const activeDetail = {
          ...activeDetailBase,
          wealthVal: Math.max(1, Math.min(5, activeDetailBase.wealthVal + wealthMod)),
          loveVal: Math.max(1, Math.min(5, activeDetailBase.loveVal + loveMod)),
          healthVal: Math.max(1, Math.min(5, activeDetailBase.healthVal + healthMod))
        };
        
        // 시각화: 별점 렌더러
        const renderStars = (val) => {
          return (
            <div className="flex gap-0.5 text-amber-500 font-bold text-[13px] shrink-0">
              {"★".repeat(val)}{"☆".repeat(5 - val)}
            </div>
          );
        };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">월별 상세 신수비결</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 음력 {m}월 정밀 운명 지도</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2DDD5]/60 text-[11px] font-semibold text-[#8B221E] leading-relaxed text-justify">
                {monthTitles[m]}
              </p>
              
              {/* 운기 정밀 지표 리스트 (시각화 보강) */}
              <div className="space-y-4 pt-2">
                <div className="bg-[#FCF9F5] border border-[#E2DDD5]/70 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E2DDD5]/40 pb-1.5">
                    <span className="font-bold text-[#A3845B] flex items-center gap-1 text-[11px]">🪙 재물/비즈니스 전술</span>
                    {renderStars(activeDetail.wealthVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.wealth}</p>
                </div>

                <div className="bg-[#FFF5F5]/30 border border-red-100 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-red-100/70 pb-1.5">
                    <span className="font-bold text-red-700 flex items-center gap-1 text-[11px]">💕 애정/연인 전술</span>
                    {renderStars(activeDetail.loveVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.love}</p>
                </div>

                <div className="bg-[#F4FAF6] border border-[#D4E2D7] rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#D4E2D7]/70 pb-1.5">
                    <span className="font-bold text-[#2D5A27] flex items-center gap-1 text-[11px]">🌿 건강/수호 처방</span>
                    {renderStars(activeDetail.healthVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.health}</p>
                </div>
              </div>
            </div>
          </div>,
          `음력 ${m}월 상세 신수비결`
        );
      }


      case "ny_wealth_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const elements = sajuInfo?.elements || {};
        const geumCount = elements["금"] || 0;
        const hwaCount = elements["화"] || 0;
        const waterCount = elements["수"] || 0;

        let opportunityIndex = 80;
        if (dayStemEl === "수") {
          opportunityIndex = 85 + Math.floor(waterCount * 1.5);
          if (opportunityIndex > 92) opportunityIndex = 92;
        } else if (dayStemEl === "화") {
          opportunityIndex = 75 - Math.floor(hwaCount * 2);
          if (opportunityIndex < 65) opportunityIndex = 65;
        } else {
          opportunityIndex = 75 + Math.min(10, geumCount + waterCount * 2);
        }

        let leakRiskIndex = 70;
        if (geumCount >= 3) {
          leakRiskIndex = Math.max(45, 60 - (geumCount - 2) * 8);
        } else if (geumCount === 0 || hwaCount >= 3) {
          leakRiskIndex = 80 + Math.min(15, hwaCount * 4);
        } else {
          leakRiskIndex = 70 + (3 - geumCount) * 3 - Math.min(10, hwaCount * 2);
        }

        let safetyRulesText = "";
        if (dayStemEl === "목") {
          safetyRulesText = "목(木) 일간인 귀하는 성장과 팽창을 지향하는 성향이 강해 병오년의 화기(火氣)를 만나면 무리한 확장을 꾀하기 쉽습니다. 올해는 투자의 스케일을 키우기보다는 현재 보유한 현금 흐름을 재점검하고, 리스크가 높은 신흥 시장보다는 정기적 배당이 나오는 대형 가치주 위주로 방어망을 구축하십시오.";
        } else if (dayStemEl === "화") {
          safetyRulesText = "화(火) 일간인 귀하는 병오년의 불타오르는 기운이 강한 비겁으로 작용하여, 주위의 부추김이나 충동적인 투기 심리에 휘둘릴 가능성이 매우 높습니다. 동업이나 금전 대여, 레버리지를 활용한 무리한 베팅은 절대 금물이며, 자산의 70% 이상을 안정적인 은행 예적금이나 안전 국채에 묶어두는 수성(守城) 전략이 생명입니다.";
        } else if (dayStemEl === "토") {
          safetyRulesText = "토(土) 일간인 귀하는 화생토의 흐름으로 문서를 잡거나 자산을 고정하는 기운이 강하게 작용합니다. 다만 과도한 화기로 인해 부동산이나 실물 자산에 지나치게 묶여 유동성 위기를 겪을 수 있으니, 현금성 자산을 충분히 확보해 두고 안정성 높은 실물 리츠나 채권형 포트폴리오를 우선시하십시오.";
        } else if (dayStemEl === "금") {
          safetyRulesText = "금(金) 일간인 귀하는 화극금의 흐름으로 재물의 통제권(관성)이 과열되는 시기입니다. 섣부른 시장 예측으로 무리한 포지션을 취하면 큰 변동성에 노출될 수 있으니, 명확한 손절 원칙을 세우고 메탈이나 원자재, 미국 달러 등 달러 베이스의 안전 자산 비중을 늘려 방어력을 높이십시오.";
        } else { // 수
          safetyRulesText = "수(水) 일간인 귀하는 병오년의 화기가 재성(財星)으로 들어와 자산 획득 기회가 크게 늘어납니다. 다만, 사주 원국에 수 기운이 부족할 경우 들어온 재물을 감당하지 못하고 오히려 유출될 수 있으니, 수익이 날 때마다 즉시 달러나 채권, 예금 등 꺼내 쓰기 힘든 안전자산으로 강제 전환하여 이익을 확정 지으십시오.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">신년 재물 및 사업운 (新年 財物運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 금전 팽창 기회와 리스크 예방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                병오년의 급격한 화기(火氣) 팽창은 돈을 끌어당기는 일시적인 자석 역할을 하지만, 나무 땔감이 순식간에 활활 타버리고 한 줌의 재로 변하듯 과도한 팽창 뒤에 동반되는 급작스러운 자산 누수를 철저히 조율해야 합니다. 공격적인 투자보다는 단단한 방어를 무기로 삼는 한 해가 되어야 합니다.
              </p>

              {/* 시각화: 재물 흐름 지수 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 신년 재물 운세 입출 기류</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>자산 획득 기회지수</span>
                      <span className="text-[#8A6F4C]">{opportunityIndex}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${opportunityIndex}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-500">
                      <span>일시적 자산 누수 위험</span>
                      <span className="text-red-700">{leakRiskIndex}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${leakRiskIndex}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 개인화 수호 안전 수칙 텍스트 카드 */}
              <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-2 text-justify">
                <span className="font-bold text-[#A3845B] text-[11px] block flex items-center gap-1">
                  💡 의뢰인 사주 맞춤형 수호 안전 수칙
                </span>
                <p className="text-[10px] text-gray-700 font-light leading-relaxed">
                  {safetyRulesText}
                </p>
              </div>

              {/* 재물 수호 수칙 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 2026년 재물 수호 안전 수칙</span>
                <ul className="space-y-2.5 text-[10px] text-gray-600 font-light">
                  <li>• <strong>투기성 고위험 자산 진입 금지:</strong> 올해의 기류는 변동 속도가 상상을 초월하여 뇌동 매매에 취약합니다. 상반기(음력 4~6월)에 순간적인 욕심으로 진입한 투자는 큰 손실로 이어질 확률이 높으니 보수적으로 가십시오.</li>
                  <li>• <strong>공동 투자 및 보증 절대 금지:</strong> 사주 내 비견/겁재가 세운의 화기를 만나면 동업자 간의 불화와 수익 분배 갈등이 촉발됩니다. 돈도 잃고 사람도 잃을 운이니 독자적 운영이나 현금 수성에 매진하십시오.</li>
                  <li>• <strong>재물 수렴 골든타임 활용:</strong> 음력 8월(계유월)은 금(金) 기운이 극에 달해 가장 유리한 재무 성과나 보상 합의가 가능하므로, 계약 도장은 이 시기에 찍는 것이 가장 길합니다.</li>
                  <li>• <strong>보시(布施)와 기부의 개운 메커니즘:</strong> 화가 극성할 때는 타인을 위한 순수한 기부나 식사 대접을 통해 기운을 의도적으로 누설(설기)시키는 것이 예기치 못한 금전 유실 액난을 원천 방어하는 최고의 비방입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 재물 및 사업운 분석"
        );
      }


      case "ny_career_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const responsibilityScore = Math.min(99, 80 + (earthCount + metalCount) * 2);
        const harmonyScore = Math.min(95, 75 + (woodCount + waterCount) * 3);
        const volatilityScore = Math.min(95, 65 + fireCount * 5 + (dayStemEl === "목" || dayStemEl === "화" ? 10 : 0));

        // 일간별 텍스트 처방
        const careerAdviceText = {
          "목": "올해는 강렬한 화기가 나무의 기운을 다소 설기(泄氣)시키는 해이므로, 무리한 업무 확장보다는 내실과 안정에 주력하십시오. 주변의 이직 유혹이 있더라도 현재 위치를 굳건히 지키는 수성(守城) 전략이 커리어 성공률을 극대화합니다.",
          "화": "나의 주체적인 기운(불)이 극도로 과열되는 한 해입니다. 직장 상사나 동료와의 갈등 발생 시 섣부르게 사직서를 내거나 감정적으로 대응하면 크게 불리하니, 이성적인 판단력을 유지하고 3일 이상 고민한 뒤 중요한 결정을 내리십시오.",
          "토": "뜨거운 화기가 대지를 돕는 화생토(火生土)의 해이므로, 조직 내에서 문서상의 승인, 자격 취득, 권한의 확대 등 매우 상서로운 흐름이 예상됩니다. 중간 관리자로서 신임을 굳건히 하고 주도적으로 프로젝트를 이끄십시오.",
          "금": "용광로 속에서 단단히 제련되는 한 해입니다. 과도한 업무 책임과 임무가 주어져 일시적으로 번아웃이 오기 쉬우나, 이를 인내하고 극복하면 값진 승진과 직책 상승이라는 최고의 명예로 보상받게 될 것입니다.",
          "수": "뜨거운 불길을 조절하는 물의 역할을 수행하므로, 조직 내 핵심 해결사로 등극하여 높은 성과를 인정받습니다. 일시적으로 연봉 상승 기회가 생길 수 있으니 차분하고 이성적으로 협상 테이블에 임하십시오."
        }[dayStemEl] || "병오년의 활발한 불꽃 기류 속에서 지나친 변동을 삼가고, 내실을 다지며 신뢰를 쌓아가는 것이 신년 커리어 안정을 돕는 최고의 방책입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">신년 직장 및 커리어 (新年 職務運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조직 내 입지와 책임감의 시험대</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년은 명예와 조직운을 상징하는 관성(官星) 기류가 세운의 격렬한 불꽃 기운과 조우하는 해입니다. 무조건적인 확장이나 홧김에 하는 이직은 극약 처방이 될 수 있으며, 현재 조직에서 내 가치를 확실히 입증하고 기반을 닦는 뚝심이 더 크게 인정받는 해가 될 것입니다.
              </p>

              {/* 시각화: 커리어 상승 지수 */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 신년 커리어 역량 기류</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">{responsibilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${responsibilityScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>조직 내 조화 및 소통성</span>
                      <span className="text-[#5F7A68]">{harmonyScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${harmonyScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 성급한 이직 변동성</span>
                      <span className="text-gray-600">{volatilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${volatilityScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 커리어 전략 카드 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">💡 커리어 조율 개운 비방 ({dayStemEl}일간 맞춤)</span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                  {careerAdviceText}
                </p>
                <p className="text-[9px] text-gray-400 leading-normal border-t border-emerald-100/50 pt-2 font-light">
                  * 특히 금(金) 기운의 조력이 본격화되는 <strong>하반기(음력 7월 이후)</strong>에 이직서 제출이나 부서 변동 협상을 실행해야 후회 없는 결정을 이끌어낼 수 있습니다.
                </p>
              </div>
            </div>
          </div>,
          "신년 직장 및 커리어"
        );
      }

      case "ny_love_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const loveStabilityScore = Math.min(98, 75 + (woodCount + earthCount) * 3);
        const communicationScore = Math.min(95, 70 + (waterCount + metalCount) * 4);

        // 연애 솔루션 일간별
        const loveAdviceList = {
          "목": [
            "수생목(水生木)의 완충 기류가 절실하므로 감정이 격앙될 때 네이비나 차콜 계열의 의상을 입어 이성적인 차분함을 표현하십시오.",
            "커플: 상대방에게 강요나 재촉을 하기보다는 10초 늦게 말하기를 통해 부드러운 중용의 미덕을 실천할 때 관계가 굳건해집니다."
          ],
          "화": [
            "나와 같은 불꽃이 불타오르는 기류이므로 감정의 대립 시 폭발하기 쉽습니다. 데이트 중 의견이 충돌하면 즉각 침묵하고 자리를 잠시 비우십시오.",
            "솔로: 갑작스럽고 자극적인 이성과의 만남보다 지인의 정중한 소개를 통한 진지한 대화가 훨씬 길한 인연을 부릅니다."
          ],
          "토": [
            "화생토의 안정성이 뒷받침되므로 가정 내 경사나 뜻밖의 기쁜 소식이 찾아오는 따뜻하고 상서로운 달입니다.",
            "커플: 연인과 함께 고풍스러운 찻집을 가거나 대지를 밟으며 산책하는 데이트를 즐길 때 가정이 평안해집니다."
          ],
          "금": [
            "화기운에 제련되는 격이니 감정이 다소 예민해질 수 있습니다. 연인이나 가족에게 스트레스를 해소하지 않도록 주의하십시오.",
            "솔로: 화려하고 돋보이는 코디보다는 단정하고 깔끔한 화이트/실버 톤의 액세서리로 대인 신뢰감을 극대화하십시오."
          ],
          "수": [
            "불꽃을 조율하는 시원한 소나기가 내리는 운세로, 대인관계 주파수가 안정되고 대화의 주도권을 쥐게 됩니다.",
            "커플: 그간 서먹했거나 오해가 쌓여있던 연인과의 대화가 물 흐르듯 순탄하게 풀려나가며 더욱 친밀해질 것입니다."
          ]
        }[dayStemEl] || [
          "세운의 강력한 화기 속에서 불필요한 고집을 꺾고 상대를 먼저 존중하는 배려의 자세가 애정을 탄탄하게 유지합니다.",
          "음력 5월과 11월에 일시적인 마찰 기류가 극에 달하니 대화를 부드럽고 차분하게 조율하는 것이 개운의 요체입니다."
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#B26E8D] font-bold block">신년 연애 및 가정운 (新年 愛情運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">뜨거운 열기 속에서 필요한 차분한 포용력</h2>
              <div className="w-16 h-0.5 bg-[#B26E8D]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                병오년의 강렬한 화기는 열정적이고 급격한 인연의 끌림을 선사하기도 하지만, 과열된 감정 탓에 사소한 단어 하나가 큰 싸움으로 불타오르는 감정의 화재를 유발하기 쉽습니다. 상대방을 향한 비판보다는 차분하게 한 걸음 물러나 경청하는 여유가 가정을 지키는 최고의 방책입니다.
              </p>

              {/* 시각화: 관계 조화도 */}
              <div className="bg-[#FCF6F9] border border-pink-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#B26E8D] block">📊 신년 관계 및 가정 주파수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#B26E8D]">
                      <span>가정 및 관계 안정도</span>
                      <span className="text-[#B26E8D]">{loveStabilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: `${loveStabilityScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#B26E8D]">
                      <span>소통 및 경청 원활도</span>
                      <span className="text-[#B26E8D]">{communicationScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: `${communicationScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 소통 가이드 */}
              <div className="border border-pink-100 rounded-xl p-4 bg-[#FCF6F9]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#B26E8D] block">❤️ 혜안당 애정 개운 솔루션 ({dayStemEl}일간 맞춤)</span>
                <ul className="space-y-2 text-[10px] text-gray-600 font-light">
                  <li>• <strong>솔로:</strong> {loveAdviceList[0]}</li>
                  <li>• <strong>기혼/커플:</strong> {loveAdviceList[1]}</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 연애 및 가정운"
        );
      }

      case "ny_study_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const examScore = Math.min(99, 70 + (metalCount + earthCount) * 4);
        const reasoningScore = Math.min(95, 70 + (metalCount + waterCount) * 4);
        const focusScore = Math.max(50, 95 - fireCount * 5);
        const resilienceScore = Math.min(98, 75 + (woodCount + earthCount) * 3);

        // 부족 오행 분석
        const elementCounts = { "목": woodCount, "화": fireCount, "토": earthCount, "금": metalCount, "수": waterCount };
        let deficientElement = "수";
        let minCount = 99;
        Object.entries(elementCounts).forEach(([el, count]) => {
          if (count < minCount) {
            minCount = count;
            deficientElement = el;
          }
        });

        // 부족 오행에 최적화된 공부방 처방 테이블
        const studyDeficiencyAdvices = {
          "수": { direction: "북향 (北向)", color: "블루, 네이비, 블랙", decor: "가습기, 미니 수경 식물", desc: "차가운 수(水) 기운을 통해 상열감을 내리고 뇌파를 정갈하게 안정시키는 수승화강 효과를 도모합니다." },
          "목": { direction: "동향 (東向)", color: "초록색, 그린 톤", decor: "나무 연필꽂이, 화분", desc: "목(木)의 성장 기류와 활기찬 시작의 기운을 수혈하여 끈기 있고 활력 있는 두뇌 회전을 돕습니다." },
          "화": { direction: "남향 (南向)", color: "붉은 포인트, 오렌지", decor: "따뜻한 스탠드, 조명", desc: "적절한 집중의 열기(火)를 인위적으로 유도하여 시험 전 막판 암기 스퍼트 및 의욕 극대화를 유발합니다." },
          "토": { direction: "중앙 및 황토색", color: "노란색, 베이지, 브라운", decor: "황토 도자기, 스톤 소품", desc: "토(土)의 굳건하고 안정된 대지의 성정을 공급하여 엉덩이를 무겁게 하고 장기 집중력을 지탱합니다." },
          "금": { direction: "서향 (西向)", color: "화이트, 골드, 실버", decor: "메탈 조명, 철제 책상", desc: "금(金)의 칼날 같은 명확성과 결단력을 자극하여 논리적 추론 및 오차 없는 오답 분석을 지원합니다." }
        }[deficientElement] || { direction: "북향 (北向)", color: "블루, 네이비, 블랙", decor: "가습기, 미니 수경 식물", desc: "부족한 보색 조율을 통해 신년 공부방 기류를 최적의 집중 환경으로 승화시킵니다." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 학업 및 시험운 (新年 學업運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">집중력 과부하를 이기는 차분한 독기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강력한 화(火) 기운이 의뢰인 {name}님의 머리 쪽으로 열을 올리는 상열감(上熱感)을 자극하기 쉽습니다. 이로 인해 평소보다 가슴이 답답하고 집중력이 쉽게 흩어지며, 시험을 앞두고 불필요한 불안감이나 조급증이 유발될 수 있습니다. 엉덩이를 무겁게 하고 이성적인 루틴을 굳건히 유지하는 차분한 자기 제어가 신년 자격증 취득 및 공무원/승진 시험의 성공을 가르는 핵심 열쇠입니다. 학습 공간의 풍수 재배치와 행동 수칙을 결합하여 합격 기류를 수혈받으십시오.
              </p>

              {/* 시각화: 학업/합격 역량 지표 게이지 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 학업 & 합격 에너지 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>공식 시험/자격증 합격운</span>
                      <span className="text-[#8A6F4C]">{examScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${examScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>논리적 추론 및 분석 암기력</span>
                      <span className="text-[#8A6F4C]">{reasoningScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${reasoningScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>두뇌 집중력 유지도</span>
                      <span className="text-[#8A6F4C]">{focusScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${focusScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>슬럼프 극복 회복탄력성</span>
                      <span className="text-[#8A6F4C]">{resilienceScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${resilienceScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 학습 환경 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🏠 합격운을 부르는 학습 환경 처방 (부족오행 '{deficientElement}' 기운 보완)</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">처방 영역</th>
                      <th className="p-2 text-center">권장 조건</th>
                      <th className="p-2">공간 조율 효과 및 설명</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🪑 책상 방위</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.direction}</td>
                      <td className="p-2">{studyDeficiencyAdvices.desc}</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🎨 환경 색상</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.color}</td>
                      <td className="p-2">보색의 가구/커튼 배치로 마인드 밸런스를 유도해 조급증과 불안 차단</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💡 조명 및 소품</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.decor}</td>
                      <td className="p-2">해당 수호 소품 배치를 책상에 세팅하여 학습 기맥을 보강</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 개운 행동 3대 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">💧</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">차가운 음용수</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">공부 전 냉수 한 잔으로 상열감을 즉각 진정</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">🧘</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">3분 단전호흡</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">불안이 고조될 때 심호흡으로 뇌파 안정</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">📴</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">디지털 디톡스</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">학습 공간 내 붉은 조명 및 스마트폰 차단</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 학업 및 시험운 처방"
        );
      }

      case "ny_gossip_defense": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const frictionRisk = Math.min(95, 50 + fireCount * 8 + (dayStemEl === "화" ? 10 : 0));
        const selfControl = Math.min(98, 70 + (woodCount + earthCount) * 3);

        // 구설 방어 조언
        const gossipAdvice = {
          "목": "목(木) 일간은 화기가 강해질 때 급하게 말을 뱉어 실수가 잦아집니다. 회의 중이나 카톡방에서 즉각 반론을 펴기보다 '검토해 보겠습니다'라며 답변을 하루 유보하는 훈련이 최고의 개운법입니다.",
          "화": "나의 주체적인 불꽃이 폭발하는 기류이므로 자존심을 건드리는 말 한마디에 폭발할 위험이 큽니다. 시비가 걸리면 그 즉시 시선을 피하고 시원한 생수를 들이켜 감정을 내리십시오.",
          "토": "대외적인 신용은 탄탄하나, 남을 돕기 위해 무심코 던진 훈수가 오해를 불러올 수 있습니다. 타인의 영역에 불필요하게 관여하지 말고 자신의 역할에만 주력하는 것이 안전합니다.",
          "금": "관성(官星)의 억압감이 가중되는 해이므로 윗사람이나 거래처 대화 시 예민한 톤이 드러나기 쉽습니다. 목소리 톤을 한 옥타브 낮추고 단정하고 공손한 태도를 굳건히 유지하십시오.",
          "수": "시원한 물줄기가 조절자 역할을 하나, 재물적 협상이나 이권 다툼 시 너무 칼날 같은 언행으로 적을 만들기 쉽습니다. 실리는 챙기되 말투는 부드러운 중용의 화법을 구사하십시오."
        }[dayStemEl] || "병오년의 뜨거운 화 기운 속에서 한 번 더 생각하고 말하는 이성적 언행 필터가 구설 액운을 완벽하게 차단해 줍니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">구설 및 시비 예방 (口舌 防禦)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">언행의 빗장을 걸어 잠가 액운을 피하는 법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년은 세운의 강력한 화기가 말(言)을 제어하는 이성 필터를 녹이기 쉽습니다. 평소라면 그냥 넘어갈 가벼운 농담이나 조언이 타인의 시기와 오해를 사서 큰 송사나 마찰(구설수)로 증폭될 소지가 다분합니다. 올해는 침묵이 최고의 은혜이며 보석입니다.
              </p>

              {/* 시각화: 구설 노출도 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-900 block">📊 구설 및 마찰 노출 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-700">
                      <span>대인관계 마찰 위험도</span>
                      <span className="text-red-700">{frictionRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${frictionRisk}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>섭섭함 & 감정 조율도</span>
                      <span className="text-gray-600">{selfControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${selfControl}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 구설 예방 강령 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-3">
                <span className="font-bold text-xs text-red-950 block">🧭 혜안당 구설 예방 3대 강령 ({dayStemEl}일간 맞춤)</span>
                <ul className="space-y-2 text-[10px] text-red-900 font-light">
                  <li>• <strong>1단계 (10분 보류):</strong> {gossipAdvice}</li>
                  <li>• <strong>2단계 (소셜 미디어 차단):</strong> 홧김에 적는 SNS 글이나 메신저 하소연이 캡처되어 내 등에 칼이 되어 돌아올 수 있으니 사적인 속마음 표출은 극구 제한하십시오.</li>
                  <li>• <strong>3단계 (음력 5월 극도 경계):</strong> 자오충과 오오자형이 겹치는 한여름에는 계약이나 구두 확답 시 반드시 두 번 확인하고 서면 기록을 남겨야 안전합니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 구설 및 시비수 예방 수칙"
        );
      }

      case "ny_sinsal_active": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const dohwaScore = Math.min(95, 60 + (woodCount + fireCount) * 5);
        const yeokmaScore = Math.min(95, 55 + (waterCount + fireCount) * 5);
        const hwagaeScore = Math.min(95, 60 + (earthCount + metalCount) * 5);

        // 지배적 신살 선정 및 조언
        let dominantSinsal = "도화살 (桃花煞)";
        let sinsalTip = "신년에는 대외적인 네트워킹과 프레젠테이션, 미팅 시 나를 돋보이게 가꿀수록 인맥 신용과 재물 기회가 증폭되는 아주 상서로운 흐름입니다.";
        
        if (yeokmaScore > dohwaScore && yeokmaScore > hwagaeScore) {
          dominantSinsal = "역마살 (驛馬煞)";
          sinsalTip = "신년에는 잦은 출장, 부서 이동, 이사 등 물리적 공간 변동이 강하게 발생합니다. 조급히 머무르려 하기보다 파도에 올라타 유연하게 움직이는 것이 커리어에 유리합니다.";
        } else if (hwagaeScore > dohwaScore && hwagaeScore > yeokmaScore) {
          dominantSinsal = "화개살 (華蓋煞)";
          sinsalTip = "예술적 감각과 연구, 학문 집중 기맥이 최고조입니다. 자격증 취득이나 특허/문서 기획서 작성 등 나만의 독창적 산출물을 정리해 두면 평생의 든든한 자산이 됩니다.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">신년 3대 신살 (新年 神煞)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 삶을 변화시킬 핵심 신살 분석</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                명리학적 신살(神煞)은 나의 무의식적 행동 경향과 우주의 자기장 융합을 뜻합니다. 올해 {name}님의 사주 기틀과 병오년이 만나 활성화되는 대표적인 3대 신살의 세부 에너지 지표입니다.
              </p>

              {/* 시각화: 신살 작동도 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 3대 신살 활성화 게이지</span>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">도화살 (인기·매력)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{dohwaScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: `${dohwaScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">역마살 (이동·변화)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{yeokmaScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: `${yeokmaScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">화개살 (예술·학문)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{hwagaeScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: `${hwagaeScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 신살 상세 정보 */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E2DDD5]/50 pb-2">
                  <span className="font-bold text-[#A3845B] text-[11px]">🎯 최강 활성 신살: {dominantSinsal}</span>
                  <p className="text-[10px] text-gray-600 mt-1 font-light leading-relaxed">
                    {sinsalTip}
                  </p>
                </div>
                <div className="pt-1">
                  <span className="font-bold text-[#8A6F4C] text-[11.5px] block mb-1">🕯️ 3대 신살 개운 가이드:</span>
                  <p className="text-[9.5px] text-gray-500 font-light leading-relaxed">
                    * 도화살 발현을 위해 미팅 시 네이비/골드 컬러 악세서리를 조합하십시오.<br/>
                    * 화개살 보완을 위해 명상 시간이나 1인 자격 취득용 스터디 루틴을 주 3회 세우시면 액막이에 탁월합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 3대 신살 작동 현황 분석"
        );
      }

      case "ny_gwiin_harmony": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";

        // 귀인 조견표 매칭 (일간별)
        const gwiinData = {
          "목": { peer: "돼지띠, 토끼띠", boss: "양띠 (오미육합)", direction: "북쪽 (水)", tip: "수생목의 기류를 전하는 돼지띠 동료와 협업 시 계약 마찰이 부드럽게 완화됩니다." },
          "화": { peer: "호랑이띠, 개띠", boss: "양띠 (화기를 제어)", direction: "남서쪽 (土)", tip: "뜨거운 화기를 식혀줄 흙의 성정을 지닌 양띠 상사의 자문이 승진의 지름길입니다." },
          "토": { peer: "뱀띠, 닭띠", boss: "말띠 (화생토 지탱)", direction: "남동쪽 (金)", tip: "의뢰인님의 대지를 견고히 지탱할 뱀띠 귀인에게 문서 검토를 양도하십시오." },
          "금": { peer: "닭띠, 용띠", boss: "뱀띠 (사유축 합)", direction: "서북쪽 (土)", tip: "금의 단단한 뿌리가 될 용띠 조력자의 정보 수혈이 금전 리스크를 막아줍니다." },
          "수": { peer: "원숭이띠, 쥐띠", boss: "돼지띠 (수생목 조율)", direction: "북쪽 (水)", tip: "자금 유통이나 재무 계획 시 돼지띠 또는 원숭이띠 자산가와 긴밀히 소통하십시오." }
        }[dayStemEl] || { peer: "말띠, 개띠", boss: "양띠", direction: "북쪽", tip: "오행의 평온을 유도하고 이성적 조언을 전달할 상생 귀인과 함께 협업하십시오." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">인연 및 귀인 조화 (貴人 支助)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 평판과 상생을 이끌 귀인 인연</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                병오년의 강렬한 화기를 다스리기 위해 나에게 등대가 되어줄 귀인의 성향과 나이대, 그리고 방향에 관한 정밀 분석 조견표입니다.
              </p>

              {/* 귀인 인포그래픽 테이블 */}
              <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                      <th className="p-2.5">귀인 유형</th>
                      <th className="p-2.5">핵심 띠 & 상성</th>
                      <th className="p-2.5">도움의 성격</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-emerald-100/50">
                      <td className="p-2.5 font-semibold text-emerald-950">🤝 동료/협력 귀인</td>
                      <td className="p-2.5">{gwiinData.peer}</td>
                      <td className="p-2.5">업무 분산 및 프로젝트 성과 안착 조력</td>
                    </tr>
                    <tr className="border-b border-emerald-100/50">
                      <td className="p-2.5 font-semibold text-emerald-950">👑 직장 상사 귀인</td>
                      <td className="p-2.5">{gwiinData.boss}</td>
                      <td className="p-2.5">인사 갈등 차단 및 부서 연봉 상승 추천</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-emerald-950">🗺️ 방위 및 공간</td>
                      <td className="p-2.5">{gwiinData.direction} 방위</td>
                      <td className="p-2.5">계약서 검토 및 책상 방향 배치 권장</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100 text-[10px] text-emerald-900 leading-relaxed font-light">
                💡 <strong>{dayStemEl}일간 맞춤 귀인 유인책:</strong> {gwiinData.tip} 의상 매칭 시 메탈 시계나 정돈된 실버 액세서리를 착용할 때 귀인의 협조 주파수가 극대화됩니다.
              </div>
            </div>
          </div>,
          "신년 인연 및 귀인 조화 분석"
        );
      }

      case "ny_warning_period": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 액난 지수 계산
        const mayRisk = Math.min(99, 70 + fireCount * 6);
        const novemberRisk = Math.min(95, 60 + waterCount * 7);

        // 일간별 액막이 처방
        const wardOffAdvice = {
          "목": "목(木) 일간은 강한 불기운에 수분이 증발하는 형태입니다. 음력 5월에는 물(Water) 기운 보존을 위해 밤 10시 이후 차분한 족욕과 명상을 가지고, 불필요한 과도한 아웃도어 스포츠나 한여름 사우나를 삼가십시오.",
          "화": "화(火) 일간은 불이 불을 만나 조급증이 극에 달합니다. 음력 5월에는 이메일 상으로 홧김에 직장을 때려치우거나 동료와 감정 폭언을 절대 금지하십시오. 3초간 눈감고 물을 마시는 훈련이 살길입니다.",
          "토": "토(土) 일간은 대지가 건조해지기 쉽습니다. 음력 11월 자오충의 대립 상황에서 급작스러운 운전 사고나 기물 파손의 우려가 있으니, 자차를 정비하고 보수적인 퇴근길을 운행하십시오.",
          "금": "금(金) 일간은 용광로 속에서 성정이 닳기 쉽습니다. 음력 5월에는 윗사람과의 의견 충돌이나 서류 결재 대기 시 불만을 직접 표출하지 마시고, 서면으로 꼼꼼히 정리해 보고하십시오.",
          "수": "수(水) 일간은 불과 물의 전투로 에너지가 소모됩니다. 음력 11월에 급작스러운 주식/코인 투자 권유나 금전 거래 제안이 귀에 들리더라도 눈과 귀를 닫고 안정 예금으로 수성하십시오."
        }[dayStemEl] || "병오년의 충돌 월운 기간에는 중요한 인생 결정을 뒤로 유보하고 가벼운 스트레칭과 수분 섭취를 유지하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">치명적 액난 경보 (厄難 警報)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">올해 가장 주의해야 할 3대 경고 기간</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                세운의 화기가 극대화되거나 충돌하여 안전사고, 금전 사기, 부부 마찰이 강하게 예측되는 시기를 짚어드립니다. 이 시기에는 사소한 일도 보수적으로 처리하고 소나기는 무조건 피해 가는 지혜를 발휘해야 합니다.
              </p>

              {/* 시각화: 액난 위험도 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-950 block">📊 월별 액난 및 충돌 위험 지표</span>
                <div className="space-y-2 text-[9px] font-semibold text-red-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🔥 음력 5월 (갑오월: 오오자형 극대화)</span>
                      <span>{mayRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${mayRisk}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🌊 음력 11월 (경자월: 자오충 대립)</span>
                      <span>{novemberRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400" style={{ width: `${novemberRisk}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 액난 방어 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-2">
                <span className="font-bold text-xs text-red-950 block">🛡️ 액막이 및 안전 방어 비책 ({dayStemEl}일간 맞춤)</span>
                <p className="text-[10px] text-red-900 leading-relaxed font-light">
                  {wardOffAdvice}
                </p>
                <ul className="space-y-1 text-[9px] text-red-700 font-light border-t border-red-200/50 pt-2 mt-2">
                  <li>• 음력 5월에는 무조건 투자를 유예하고 사직서 제출 등 충동적 결정을 보류하십시오.</li>
                  <li>• 음력 11월에는 장거리 야간 운전을 자제하고, 계약 서명 시 세무 검토를 두 번 하십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "치명적인 액난 경보 및 방어 비책"
        );
      }

      case "ny_worry_solution": {
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const solveSuccessRate = Math.min(98, 70 + (woodCount + metalCount) * 4);
        const negotiationLeeway = Math.min(95, 65 + (waterCount + earthCount) * 4);
        const emotionControl = Math.min(95, 60 + (waterCount + metalCount) * 5);
        const connectionEfficiency = Math.min(95, 70 + (woodCount + earthCount) * 4);

        // 고민 카테고리별 3단계 해결 비방
        const categoryLabel = {
          "wealth": "금전 / 투자 / 부동산 고민",
          "career": "이직 / 승진 / 직장 대인관계 고민",
          "love": "부부 / 연애 / 가정사 갈등 고민",
          "health": "체력 저하 / 장부 건강 고민"
        }[worryCategory] || "신년 현실적인 안건 고민";

        const stepAdvices = {
          "wealth": [
            "⏳ 1단계 (수성): 상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 계약이나 변동을 일체 금하고 대출 비중을 최소화하십시오.",
            "📑 2단계 (법적 조율): 음력 8월의 선선한 금 기운을 기점으로 세무 감사 및 계약서 전문 서류의 법적 검토를 조용히 단행하십시오.",
            "🏆 3단계 (성과 안착): 연말 음력 10월 이후, 상사 귀인의 조력을 득해 최종 계약서에 서명함으로써 금전 고민을 원만히 회수하십시오."
          ],
          "career": [
            "⏳ 1단계 (평정): 직장 내 상사/동료와의 사소한 마찰은 상반기 화기의 팽창 현상입니다. 10분 늦게 대답하며 직무 인프라를 보강해 두십시오.",
            "📑 2단계 (골든타임): 이직이나 부서 이동은 가을철 금(金) 기운이 세운의 열기를 식혀주는 음력 7~9월 사이에 실행하는 것이 연봉 협상에 길합니다.",
            "🏆 3단계 (성과 안착): 연말 10월 이후 새로운 조직에 빠르게 적응하고 실질적인 권력/결재권 획득을 쟁취할 수 있는 보상이 다가옵니다."
          ],
          "love": [
            "⏳ 1단계 (경청): 사소한 감정 대립은 병오년의 불꽃 탓입니다. 상대방이 성을 낼 때 3초간 눈을 감고 미소로 대답하는 포용력을 유지하십시오.",
            "📑 2단계 (조화): 부부/연인과 함께 고풍스러운 찻집을 가거나 차가운 블루 톤의 보색 소품을 침실에 배치하여 감정의 화재를 진정시키십시오.",
            "🏆 3단계 (안정): 음력 10월 이후 기해월의 풍부한 수기가 감정을 평온하게 만들어 관계가 물 흐르듯 순탄하게 합을 이루게 됩니다."
          ],
          "health": [
            "⏳ 1단계 (음용): 상열감으로 인한 심혈관 피로 및 비뇨기 결핍이 예상됩니다. 아침 공복 시 시원한 냉수를 마셔 체내 불길을 즉각 내리십시오.",
            "📑 2단계 (운동): 무리한 등산이나 고열 러닝보다 15분간의 소금물 족욕을 통해 머리의 열을 발끝으로 내리는 수승화강을 실천하십시오.",
            "🏆 3단계 (조율): 기력이 갈무리되는 음력 10월 이후 체력이 정상 궤도에 오르니, 겨울철 맞춤 한수/한풍 섭생 식단을 결합하여 건강을 회수하십시오."
          ]
        }[worryCategory] || [
          "⏳ 1단계 (수성): 상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 변동을 일체 금하고 내실을 다지십시오.",
          "📑 2단계 (서류 조율): 음력 8월의 선선한 금 기운을 기점으로 자금 설계 및 문서 검토를 단행하십시오.",
          "🏆 3단계 (안착): 연말 음력 10월 이후 귀인의 조력을 득해 최종 고민 안건을 조화롭게 해결해내십시오."
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 솔루션 (苦悶 解決)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인의 현실적인 고민에 대한 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님이 제출하신 현실적인 고민 안건(<strong>분야: {categoryLabel}</strong>)에 대하여 명리 연구소의 정밀 운기 분석을 바탕으로 도출한 대안 및 행동 실천 로드맵입니다. 마음의 조급함과 불필요한 생각의 감옥(과다 인성)을 해제하고 선선한 가을철 금(金) 기운을 기점으로 자금과 계약서를 철저히 설계 및 조율해 나간다면, 리스크를 완벽하게 차단하고 원하는 결실의 대부분을 쟁취할 수 있습니다.
              </p>

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">{solveSuccessRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${solveSuccessRate}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">{negotiationLeeway}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${negotiationLeeway}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">{emotionControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${emotionControl}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">{connectionEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${connectionEfficiency}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 (3열) */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[0].slice(0, 11)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[0].slice(13)}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[1].slice(0, 14)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[1].slice(16)}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[2].slice(0, 14)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[2].slice(16)}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "고민 해결 맞춤형 솔루션"
        );
      }

      case "ny_personal_worry": {
        const categoryLabels = {
          love: "연애 / 속마음",
          career: "직장 / 이직",
          wealth: "금전 / 투자",
          exam: "학업 / 시험",
          general: "종합 / 기타",
          business: "사업 / 경영",
          startup: "창업 / 부업",
          trade: "장사 / 유통",
          facility: "설비 / 확장"
        };
        const currentCategoryLabel = categoryLabels[worryCategory] || "종합 / 기타";

        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const solveSuccessRate = Math.min(98, 70 + (woodCount + metalCount) * 4);
        const negotiationLeeway = Math.min(95, 65 + (waterCount + earthCount) * 4);
        const emotionControl = Math.min(95, 60 + (waterCount + metalCount) * 5);
        const connectionEfficiency = Math.min(95, 70 + (woodCount + earthCount) * 4);

        const metricsData = { 
          success: solveSuccessRate, 
          negotiation: negotiationLeeway, 
          control: emotionControl, 
          synergy: connectionEfficiency 
        };

        const textSolution = worryText && worryText.trim() !== "" ? getPersonalizedSolution(name, worryText, worryCategory) : null;
        const categorySolution = worryCategory ? getPersonalizedSolution(name, "", worryCategory) : null;

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 정밀 처방 (苦悶 處方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인 입력 안건에 대한 혜안당 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              {/* 고민 정보 헤더 */}
              <div className="bg-[#FAF7F0] border-l-4 border-[#A3845B] p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-[#E2DDD5]/60 pb-1.5">
                  <span className="font-bold text-[10px] text-[#A3845B] uppercase font-sans">고민 분야: {currentCategoryLabel}</span>
                  <span className="text-[9px] bg-[#A3845B]/10 text-[#A3845B] px-1.5 py-0.5 rounded font-bold font-sans">정밀 분석 안건</span>
                </div>
                <p className="text-[11px] text-gray-600 italic font-light">
                  "{worryText ? decodeURIComponent(worryText) : "인생 전반의 총체적 갈등 해소 및 개운"}"
                </p>
              </div>

              {/* 1. 작성하신 안건 분석 대답 */}
              {textSolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">✍️ 작성하신 고민 안건 정밀 처방</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 안건의 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {textSolution.analysis}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {textSolution.timing}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 🔑 혜안당 정밀 개운 비책</span>
                      <div 
                        className="bg-white p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-[11px] font-light text-gray-600 pl-3"
                        dangerouslySetInnerHTML={{ __html: textSolution.actionPlan }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 체크하신 고민 분야 조언 */}
              {categorySolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">🏷️ 선택하신 [{currentCategoryLabel}] 분야 조언</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 분야별 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {categorySolution.analysis}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {categorySolution.timing}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 🔑 혜안당 정밀 개운 비책</span>
                      <div 
                        className="bg-white p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-[11px] font-light text-gray-600 pl-3"
                        dangerouslySetInnerHTML={{ __html: categorySolution.actionPlan }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0]/60 border border-[#E2DDD5] rounded-xl p-4 space-y-3 mt-4">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">{metricsData.success}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: `${metricsData.success}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">{metricsData.negotiation}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: `${metricsData.negotiation}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">{metricsData.control}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: `${metricsData.control}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">{metricsData.synergy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: `${metricsData.synergy}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">⏳ 1단계: 수성 & 보류</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    상반기의 기운 과열 시기에는 홧김에 하는 결정을 피하고 내실을 다지십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📑 2단계: 법적 조율</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    음력 8월의 선선한 금(金) 기운을 기점으로 자금과 계약 서류의 완성도를 검증하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3단계: 성과 안착</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    연말 음력 10월 이후 귀인의 조력을 득해 고민 안건을 원만히 갈무리하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "의뢰인 맞춤형 고민 정밀 비책"
        );
      }

      case "ny_roadmap_2027": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const wealthEfficiency = Math.min(95, 70 + (earthCount === 0 ? 15 : 5) + metalCount * 3);
        const cashFlowStability = Math.min(95, 65 + (waterCount + earthCount) * 4);
        
        const advice2027 = {
          "목": "목(木) 일간에게 정미년은 재성(財星)이 뜨거운 흙으로 들어오는 흐름입니다. 급격한 부동산 매수보다 현금 수성을 제1원칙으로 하십시오.",
          "화": "화(火) 일간에게 정미년은 활발한 식상(食傷)의 활동기입니다. 내 재주와 능력을 표출해 조직 내 입지를 크게 다질 수 있습니다.",
          "토": "토(土) 일간에게 정미년은 든든한 동료 비겁(比劫)이 가중되는 해입니다. 신용과 문서 안정이 최고조에 이릅니다.",
          "금": "금(金) 일간에게 정미년은 관성과 인성의 작용으로 책임감이 커지는 시기입니다. 윗사람의 조력을 받아 승진에 유리합니다.",
          "수": "수(水) 일간에게 정미년은 재성과 관성의 균형이 맞춰지는 해로, 이성적인 판단으로 자산을 안전하게 묶어둘 때 길합니다."
        }[dayStemEl] || "안정과 정리를 모토로 삼고, 전년도에 벌려놓았던 자산을 회수하는 안정주의 전략을 취하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2027 정미년(丁未年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2027년 정미년(丁未年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2027년 정미년(丁未年)은 하늘의 전원 촛불 정화(丁火)와 땅의 뜨겁고 건조한 흙 미토(未土)가 결합하는 흐름입니다. 2026년 병오년의 맹렬한 불꽃 기운이 미토 속에 서서히 가두어지며 안정세를 찾아가는 과도기적 정리의 해입니다. 격렬한 확장이나 신규 진입보다는 그동안 벌려놓았던 사업이나 투자 자산을 굳건하게 수성하고 정리·안착시키는 보수적인 흐름이 유리하게 작용합니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 정미년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물 관리 및 수성 효율</span>
                      <span className="text-[#8A6F4C]">{wealthEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${wealthEfficiency}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>현금 흐름 안정성 지표</span>
                      <span className="text-[#8A6F4C]">{cashFlowStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${cashFlowStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 정미년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2027}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>정미년 핵심 전략:</strong> 투자 자산의 50% 이상을 현금성 자산으로 묶고, 신규 확장 안건은 음력 10월 이후로 결정을 조율하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2027년 정미년 세운 로드맵"
        );
      }

      case "ny_roadmap_2028": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const assetInflow = Math.min(99, 70 + metalCount * 5);
        const newInvestment = Math.min(95, 65 + (earthCount + metalCount) * 4);

        const advice2028 = {
          "목": "목(木) 일간에게 무신년은 재물과 관성이 편재/편관으로 크게 교차하는 해입니다. 큰 자산 기회가 찾아오나 욕심을 줄이고 문서 위주로 묶어야 안전합니다.",
          "화": "화(火) 일간에게 무신년은 식신과 재성이 토생금으로 생조되는 해로, 신규 사업 추진 및 연봉 협상 등 능동적 경제 활동에 최고의 골든타임입니다.",
          "토": "토(土) 일간에게 무신년은 식상과 재성이 흐르는 해입니다. 그간 기획해온 사업 계획서나 이직 안건을 가시화해 이득을 취하십시오.",
          "금": "금(金) 일간에게 무신년은 비겁과 토인성의 도움으로 내 뿌리가 굳건해지는 해입니다. 동업이나 직책 승진의 기운이 강합니다.",
          "수": "수(水) 일간에게 무신년은 관성이 단단한 쇠의 생조를 받아 나를 제어하는 해입니다. 직장에서의 책임 권한과 명예가 크게 팽창합니다."
        }[dayStemEl] || "강한 금 기운의 수확 시기를 맞아, 적극적이고 과감한 투자 리밸런싱을 시도하기에 최고의 적기입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2028 무신년(戊申年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2028년 무신년(戊申年)은 하늘의 비옥한 흙 무토(戊土)와 땅의 단단하고 냉철한 쇠 신금(申金)이 만나 토생금(土生金)의 결실을 맺는 수확의 해입니다. 지난 2년간 수성하고 정비했던 노력들이 비로소 눈에 보이는 실질적 자산이나 승진, 신분 상승이라는 결과물로 전환되는 상서로운 흐름입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 무신년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>자산 유입 성공률</span>
                      <span className="text-[#8A6F4C]">{assetInflow}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${assetInflow}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>신규 투자 및 비즈니스 적합도</span>
                      <span className="text-[#8A6F4C]">{newInvestment}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${newInvestment}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 무신년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2028}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>무신년 핵심 전략:</strong> 금(金)의 결실을 챙기는 음력 7~9월 사이에 과감한 포트폴리오 조율과 연봉 협상을 시도하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2028년 무신년 세운 로드맵"
        );
      }

      case "ny_roadmap_2029": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const documentSuccess = Math.min(95, 75 + (earthCount + metalCount) * 3);
        const infrastructureStability = Math.min(95, 70 + (woodCount + waterCount) * 3);

        const advice2029 = {
          "목": "목(木) 일간에게 기유년은 정재와 정관이 조화를 이루는 최고의 명예기입니다. 조직 내 승진 및 신뢰 획득 확률이 대단히 높습니다.",
          "화": "화(火) 일간에게 기유년은 재물의 결실이 유금(酉金) 귀인으로 굳건히 맺어지는 해입니다. 안정형 현금 창고를 확보할 수 있습니다.",
          "토": "토(土) 일간에게 기유년은 상관과 유금의 조합으로 내 능력이 문서상 규격으로 확실히 인정받아 자격 취득에 대길합니다.",
          "금": "금(金) 일간에게 기유년은 단단한 금 기운이 극대화되는 시기입니다. 주체성이 강해지나 독선을 삼가고 협력 인프라를 지키십시오.",
          "수": "수(水) 일간에게 기유년은 금생수의 풍부한 인성(印星) 조력으로 문서 취득, 전세금 환수, 계약 성공이 강력히 들어오는 축복의 해입니다."
        }[dayStemEl] || "문서운 and 계약의 완성이 매우 상서로우니, 우량 부동산 거래나 장기 계약 체결에 집중하기 가장 좋습니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2029 기유년(己酉年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2029년 기유년(己酉年)은 전원 흙 기토(己土)와 완성된 보석 유금(酉金)이 조우하여, 잘 다듬어진 최고의 계약 문서와 탄탄한 명예를 잉태하는 안정의 해입니다. 변동성이 차분하게 진정되고, 내 삶의 기틀이 되는 인프라를 안정적으로 수호하고 명예를 공고히 다지는 시기입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 기유년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 취득 및 계약 성공률</span>
                      <span className="text-[#8A6F4C]">{documentSuccess}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${documentSuccess}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>내부 인프라 & 평판 안정성</span>
                      <span className="text-[#8A6F4C]">{infrastructureStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${infrastructureStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 기유년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2029}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>기유년 핵심 전략:</strong> 관인상생의 기류가 깃드는 음력 8월(유금월)에 공식 자격증 등록, 법인 설립, 장기 임대차 문서에 서명하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2029년 기유년 세운 로드맵"
        );
      }

      case "ny_roadmap_2030": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const careerHonor = Math.min(98, 70 + (earthCount + metalCount) * 4);
        const organStability = Math.min(95, 75 + (woodCount + waterCount) * 3);

        const advice2030 = {
          "목": "목(木) 일간에게 경술년은 편관과 편재의 조합으로 책임감과 변동 기류가 크게 교차합니다. 조직 내 안정을 추구하십시오.",
          "화": "화(火) 일간에게 경술년은 식상생재로 자금 회전력이 회복되는 해입니다. 적극적인 부업 창업 등으로 이득을 실현하십시오.",
          "토": "토(土) 일간에게 경술년은 내 식상 능력을 널리 표출하고 평판을 올릴 수 있는 예술/기획 안건의 성공 기류입니다.",
          "금": "금(金) 일간에게 경술년은 비겁과 술토 인성의 뒷받침으로 주체성이 강해져, 승진 및 권력 장악을 할 최고의 골든타임입니다.",
          "수": "수(水) 일간에게 경술년은 굳건한 관성 기류의 작동으로 법적 정돈, 장기 근속, 라이센스 확보 등 신분의 도약이 깃듭니다."
        }[dayStemEl] || "조직 내 주도권 획득과 문서 자산 통합에 매진하기에 가장 든든하고 상서로운 타이밍입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2030년 경술년(庚戌年)은 가공되지 않은 백금 경금(庚金)과 단단하고 건조한 영토 술토(戌土)가 만나 토생금(土生金)의 결단력과 단단함을 선사하는 해입니다. 조직 내에서 내 발언권이 막강해지며, 흩어져 있던 리소스를 한 방향으로 통합하여 최종적인 권위와 신분을 확립하는 매듭의 절기입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 경술년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>커리어 명예 및 권위 획득율</span>
                      <span className="text-[#8A6F4C]">{careerHonor}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${careerHonor}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 정착도 & 기맥 안정도</span>
                      <span className="text-[#8A6F4C]">{organStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${organStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 경술년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2030}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>경술년 핵심 전략:</strong> 금(金)과 토(土)의 숙살 기운이 조화를 이루는 시기이므로, 조직 내 비효율을 과감하게 다이어트하고 정예 인프라만 선별하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2030년 경술년 세운 로드맵"
        );
      }

      case "ny_roadmap_2031": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const comfortScore = Math.min(99, 70 + (waterCount + woodCount) * 4);
        const homeStability = Math.min(95, 65 + (earthCount + waterCount) * 4);
        const creativeScore = Math.min(95, 60 + (woodCount + fireCount) * 5);
        const incomeStability = Math.min(95, 65 + (metalCount + earthCount) * 4);

        const advice2031 = {
          "목": "목(木) 일간에게 신해년은 정관과 편인이 함께 유입되는 운기입니다. 새로운 도전보다는 장기적인 연구 및 내실 다지기에 힘쓰는 것이 가장 길합니다.",
          "화": "화(火) 일간에게 신해년은 편관과 정인의 흐름입니다. 책임감이 커지는 동시에 윗사람의 전폭적인 지지를 받아 명예가 높아지는 한 해입니다.",
          "토": "토(土) 일간에게 신해년은 상관과 편재가 어우러집니다. 창의적인 아이디어를 바탕으로 예상치 못한 재물 성과를 낼 수 있으나, 건강 관리에 유념하십시오.",
          "금": "금(金) 일간에게 신해년은 식신과 비견이 만나는 상서로운 해입니다. 동료들과의 돈독한 연대로 새로운 사업 터전을 확보하기에 매우 든든합니다.",
          "수": "수(水) 일간에게 신해년은 겁재와 편인의 복잡한 기류가 작용합니다. 자산의 외부 누수를 적극 차단하고, 건강 검진을 필수적으로 챙기십시오."
        }[dayStemEl] || "내적인 쉼표와 복록 안착을 모토로 삼고, 그동안 벌려놓았던 자산을 갈무리하는 안정화 전략을 취하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2031 신해년(辛亥年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2031년 신해년(辛亥年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2031년 신해년(辛亥年)은 은은하고 고귀한 보석 신금(辛金)과 끝없는 겨울 바다 해수(亥水)가 결합하여 맑고 청아한 금수상생(金水相生)을 형성합니다. 지난 5년간 치열하게 추진해왔던 도전과 확장이 마침내 온전한 내적인 쉼표, 가족의 안온함, 그리고 고요한 자기 성찰로 회귀하는 복록이 깊은 해입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 신해년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>생활 및 정신적 안락 지수</span>
                      <span className="text-[#8A6F4C]">{comfortScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${comfortScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안온도 및 복록 안착</span>
                      <span className="text-[#8A6F4C]">{homeStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${homeStability}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>창의 및 직관적 안건 도출</span>
                      <span className="text-[#8A6F4C]">{creativeScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${creativeScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>고정 배당/인컴 자산 안정도</span>
                      <span className="text-[#8A6F4C]">{incomeStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${incomeStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 신해년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2031}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>신해년 실천 3대 카드:</strong> 내면의 정수(명상), 고정수익 편재(안정자산), 격조 있는 취미(서예/예술)를 실천하여 심신을 안정시키십시오.
                </p>
              </div>
            </div>
          </div>,
          "2031년 신해년 세운 로드맵"
        );
      }

      case "ny_action_rules": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const presets = {
          "목": { color: "청록 / 초록 (Green)", number: "3, 8", direction: "동쪽 (East)", items: "나무 소재 키링, 아로마 수목 향수", colorHex: "#22c55e", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900",
            actions: [
              { title: "🌳 목(木) 기운 충전", desc: "아침 공원 산책을 통해 솟구치는 생기를 얻고, 주체적인 정신 상태를 유지하십시오." },
              { title: "🪵 천연 원목 소품", desc: "책상 위나 침대 근처에 자연 소재의 나무 소품이나 식물을 배치해 기류를 보완하십시오." },
              { title: "👗 초록/청색 의상", desc: "중요한 협상이나 만남이 있는 날에는 푸른색 또는 초록색 상의를 입어 인덕을 당기십시오." }
            ]
          },
          "화": { color: "적색 / 주황 (Red)", number: "2, 7", direction: "남쪽 (South)", items: "가죽 카드 홀더, 우디 캔들", colorHex: "#ef4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-900",
            actions: [
              { title: "🌅 일출 명상", desc: "태양이 떠오르는 시간대에 가벼운 스트레칭이나 명상을 진행해 활발한 아침 성정을 충전하십시오." },
              { title: "🕯️ 붉은 계열 조명", desc: "거실이나 집무실 남쪽 공간에 붉은색 조명이나 아로마 캔들을 두어 활력과 열정을 자극하십시오." },
              { title: "🤝 능동적 소통", desc: "대인관계에서 침묵하기보다 밝고 명랑한 태도로 먼저 손을 내밀어 네트워크를 주도하십시오." }
            ]
          },
          "토": { color: "황색 / 베이지 (Yellow)", number: "5, 10", direction: "중앙 (Center)", items: "도자기 머그컵, 오렌지 립밤", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900",
            actions: [
              { title: "🚶 규칙적인 산책", desc: "식사 후 가벼운 흙길 산책을 습관화하여 비위장 소화 기능을 돕고 토 기운을 강화하십시오." },
              { title: "🏺 도자기 소품", desc: "거실 중앙이나 테이블 위에 흙으로 구워진 황토색 도자기 소품을 배치해 신용 기운을 모으십시오." },
              { title: "📝 기록의 정돈", desc: "하루의 업무나 일기를 노트에 손글씨로 기록하여 흐트러진 생각을 확실한 계약으로 매듭지으십시오." }
            ]
          },
          "금": { color: "백색 / 실버 (White)", number: "4, 9", direction: "서쪽 (West)", items: "메탈 스냅 시계, 실버 액세서리", colorHex: "#94a3b8", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900",
            actions: [
              { title: "⏰ 계획의 단행", desc: "시간대별 세부 목표를 정밀하게 수립하고, 우유부단함을 버린 단호한 결단을 즉각 실행하십시오." },
              { title: "⚙️ 메탈 프레임 가구", desc: "서재나 책상 위 서쪽 공간에 스틸 프레임이나 금속제 수집품을 두어 결단력을 촉진하십시오." },
              { title: "✂️ 인맥 다이어트", desc: "불필요하게 감정을 갉아먹는 관계나 관행을 깔끔하게 정리하여 내면의 내실을 지키십시오." }
            ]
          },
          "수": { color: "흑색 / 네이비 (Black)", number: "1, 6", direction: "북쪽 (North)", items: "어두운 네이비 의상, 미네랄 워터 미스트", colorHex: "#3b82f6", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900",
            actions: [
              { title: "🛀 저녁 족욕 수련", desc: "취침 전 따뜻한 족욕과 명상으로 머리의 화기를 내리고 하체의 차분한 수기를 채우십시오." },
              { title: "🌌 네이비 장식 소품", desc: "거주 공간 북쪽 벽면에 어두운 네이비색 프레임 액자나 장식을 배치해 지혜를 당기십시오." },
              { title: "📚 성찰과 독서", desc: "급하게 결정을 몰아치지 말고 차분한 정독과 사색을 통해 지혜로운 최상의 방안을 모색하십시오." }
            ]
          }
        }[dayStemEl] || { color: "황색", number: "5, 10", direction: "중앙", items: "소품", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", actions: [] };

        // 개운 실천 예상 보정 지수
        const correctionWealth = Math.min(98, 70 + (waterCount + earthCount) * 3);
        const correctionSocial = Math.min(98, 75 + (woodCount + waterCount) * 3);
        const correctionHealth = Math.min(95, 65 + (woodCount + metalCount) * 4);
        const correctionCareer = Math.min(98, 70 + (metalCount + fireCount) * 3);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">開運 行動 攻略 (개운 행동 공략)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 개운 실천 3대 행동 강령</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-[10px] text-gray-500 font-light">사주의 기운 불균형을 일상의 행동 풍수로 보완하는 명리 개운법</p>
            </div>

            {/* 오행 처방 요약 카드 */}
            <div className={`${presets.bg} border ${presets.border} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: presets.colorHex }}>
                  <span className="text-white font-bold text-sm">{dayStemEl}</span>
                </div>
                <div>
                  <span className={`font-bold text-sm ${presets.text}`}>{name}님의 일간 기운: <strong>{dayStemEl}(</strong>{dayStemEl === "목" ? "木" : dayStemEl === "화" ? "火" : dayStemEl === "토" ? "土" : dayStemEl === "금" ? "金" : "水"}<strong>) 기질 보완 처방</strong></span>
                  <p className="text-[9px] text-gray-500 font-light mt-0.5">일상 속에서 부족한 기운을 인위적으로 보완하는 법</p>
                </div>
              </div>

              {/* 행운 처방 4종 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🎨 수호 색상</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: presets.colorHex }} />
                    <span className="font-bold text-[10px] text-gray-800">{presets.color}</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🔢 행운의 숫자</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.number}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🧭 개운 방향</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.direction}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🎁 수호 아이템</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.items}</span>
                </div>
              </div>
            </div>

            {/* 개운 실천 지수 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                📊 개운 실천 시 예상 운세 보정 지수
              </h4>
              <div className="space-y-3">
                {[
                  { label: "재물 개운 가능성", value: correctionWealth, color: "bg-amber-500" },
                  { label: "대인관계 호전도", value: correctionSocial, color: "bg-emerald-500" },
                  { label: "건강 기운 보강도", value: correctionHealth, color: "bg-blue-500" },
                  { label: "직업/사업 활성도", value: correctionCareer, color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-[#A3845B]">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3대 실천 행동 지침 카드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                ✅ 병오년 개운 실천 3대 행동 강령
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {presets.actions.map((act, i) => (
                  <div key={i} className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                    <span className="font-bold text-[#8A6F4C] text-[10px] block">✨ {act.title}</span>
                    <p className="text-[8.5px] text-gray-500 font-light mt-1 leading-snug">
                      {act.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          "신년 개운 실천 3대 행동 강령"
        );
      }

      case "ny_fengshui_interior": {
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const fengshuiData = [
          { dir: "북", symbol: "N", el: "수(水)", elColor: "#3b82f6", lucky: "재물·지혜", items: "수경식물, 어항, 파란 소품", placement: "현관 입구 또는 거실 북쪽 벽면", effect: "재물 기운 흡수 및 두뇌 활성화" },
          { dir: "서", symbol: "W", el: "금(金)", elColor: "#94a3b8", lucky: "명예·결단", items: "메탈 시계, 크리스탈 소품, 실버 액자", placement: "서쪽 서재 또는 책상 위", effect: "판단력 강화 및 명예운 수호" },
          { dir: "동", symbol: "E", el: "목(木)", elColor: "#22c55e", lucky: "성장·건강", items: "관엽식물, 나무 소품, 초록 화분", placement: "침실 동쪽 창가", effect: "건강 기운 충전 및 활력 회복" },
          { dir: "남", symbol: "S", el: "화(火)", elColor: "#ef4444", lucky: "인기·명성", items: "촛불, 조명, 붉은 계열 그림", placement: "주방 또는 거실 남쪽 (소량 배치)", effect: "사회적 인기와 표현력 강화" }
        ];

        const roomPrescriptions = [
          { room: "침실", icon: "🛏️", prescription: "침대 머리를 북쪽 또는 서쪽으로 두어 수기(水氣)를 흡수하고 깊은 숙면을 도모하십시오. 남쪽으로 머리를 두면 열기가 머리로 올라 불면이 생깁니다.", caution: "빨간색 침구류 사용 금지" },
          { room: "거실·집무실", icon: "🏠", prescription: "메탈 스틸 소품, 크리스탈 유리 공예품을 공간 중앙에 배치하여 2026년 병오년의 뜨거운 화기(火氣)를 냉각하십시오.", caution: "지나치게 붉거나 오렌지빛 인테리어 억제" },
          { room: "현관", icon: "🚪", prescription: "현관 문 안쪽 북쪽 방향에 수경 식물이나 작은 어항을 두어 들어오는 재물 기운을 머물게 하는 풍수 비법을 실천하십시오.", caution: "현관에 시든 꽃이나 죽은 식물 방치 금지" },
          { room: "주방", icon: "🍳", prescription: "주방은 이미 화기(火氣)가 강한 공간이니 파란색 계열 소품이나 미니 어항을 두어 화기를 수기로 중화하십시오.", caution: "주방 창문을 자주 열어 환기 필수" }
        ];

        // 풍수 실천 전/후 운세 보정 지수
        const fengshuiScores = [
          { label: "재물 기운 안정도", before: 50 + woodCount * 3, after: 80 + woodCount * 3, color: "bg-amber-500" },
          { label: "건강 기운 보강도", before: 55 + waterCount * 3, after: 78 + waterCount * 3, color: "bg-emerald-500" },
          { label: "대인관계 조화도", before: 60 + fireCount * 3, after: 83 + fireCount * 3, color: "bg-blue-500" },
          { label: "심리적 안정도", before: 52 + earthCount * 3, after: 81 + earthCount * 3, color: "bg-purple-500" }
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            {/* 헤더 */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">空間 風水 地理 處方 (공간 풍수 지리 처방)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 공간 풍수 인테리어 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-[10px] text-gray-500 font-light">대지와 공간의 흐름을 바로잡아 재물·건강·명예운을 동시에 끌어올리는 풍수 비법</p>
            </div>

            {/* 서론 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5]/70 rounded-2xl p-4 text-xs text-gray-700 font-light leading-relaxed">
              동양 풍수지리학의 핵심은 <strong>공간의 기(氣) 흐름</strong>을 조율하여 거주자의 기운과 조화를 이루게 하는 데 있습니다. 2026년 병오년(丙午年)은 강렬한 화기(火氣)가 지배하는 해이므로, 집안의 각 공간에 <strong>수(水)·금(金) 기운을 보강</strong>하여 과열된 기류를 중화하고 안정적인 재물·건강·명예운을 확보해야 합니다.
            </div>

            {/* 방위별 오행 풍수 배치 가이드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">🧭 방위별 오행 풍수 배치 가이드</h4>
              <div className="grid grid-cols-2 gap-3">
                {fengshuiData.map((item, i) => (
                  <div key={i} className="border border-[#E2DDD5]/60 rounded-xl p-3 space-y-2 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-sm" style={{ backgroundColor: item.elColor }}>
                        {item.symbol}
                      </div>
                      <div>
                        <span className="font-bold text-[10px] text-gray-800">{item.dir}쪽 ({item.el})</span>
                        <p className="text-[8px] text-gray-400">{item.lucky} 기운 담당</p>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-600 font-light space-y-1">
                      <p><strong className="text-[#A3845B]">소품:</strong> {item.items}</p>
                      <p><strong className="text-[#A3845B]">배치:</strong> {item.placement}</p>
                      <p className="text-[8.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">✓ {item.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 공간별 풍수 처방 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">🏠 공간별 맞춤 풍수 처방</h4>
              <div className="space-y-2.5">
                {roomPrescriptions.map((room, i) => (
                  <div key={i} className="border border-[#E2DDD5]/50 rounded-xl p-3 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{room.icon}</span>
                      <span className="font-bold text-[10px] text-[#1A1A1A]">{room.room}</span>
                    </div>
                    <p className="text-[9px] text-gray-600 font-light leading-relaxed mt-1 text-justify">{room.prescription}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">⚠️ 주의: {room.caution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 풍수 실천 전후 효과 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">📊 풍수 인테리어 실천 전·후 운세 보정 효과</h4>
              <div className="space-y-3">
                {fengshuiScores.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-gray-400 text-[8px]">{item.before}% → <span className="text-[#A3845B] font-bold">{item.after}%</span></span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-gray-300 rounded-full" style={{ width: `${item.before}%` }} />
                      <div className={`absolute h-full ${item.color} rounded-full opacity-80`} style={{ width: `${item.after}%` }} />
                    </div>
                    <div className="flex gap-2 text-[7px] text-gray-400">
                      <span className="flex items-center gap-0.5"><span className="w-1.5 h-1 bg-gray-300 rounded-sm inline-block" /> 실천 전</span>
                      <span className="flex items-center gap-0.5"><span className={`w-1.5 h-1 ${item.color} rounded-sm inline-block opacity-80`} /> 실천 후</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          "신년 공간 풍수 인테리어 처방"
        );
      }

      case "ny_lucky_items": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let luckyColors = [];
        let itemsTable = [];
        let item1Title = "";
        let item1Desc = "";
        let item2Title = "";
        let item2Desc = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          luckyColors = [
            { name: "포레스트 그린", code: "#2F5233", energy: "목(木) 생기", desc: "주체성 회복" },
            { name: "에메랄드", code: "#00A86B", energy: "목(木) 성장", desc: "진로 확장" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "결단력 보완" },
            { name: "라이트 옐로우", code: "#FFF8D6", energy: "토(土) 신뢰", desc: "재물운 안착" }
          ];
          item1Title = "🪵 원목 또는 식물 소품";
          item1Desc = "작은 테이블용 반려식물 화분이나 원목으로 가공된 소품은 목의 솟구치는 생명력을 극대화하여 활력을 공급합니다.";
          item2Title = "✍️ 만년필 및 가죽 다이어리";
          item2Desc = "목의 계획성을 기록으로 보완하고 실행에 확실한 뼈대를 세우기 위해 가죽이나 천연 소재 소품이 길합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "내추럴 톤온톤 룩", item: "카키/베이지 리넨 셔츠", effect: "대인관계에 부드러운 신뢰와 편안함을 공급" },
            { type: "💄 메이크업", style: "내추럴 누드 톤 스킨", item: "차분한 브라운/피치 립밤", effect: "과도한 긴장을 가라앉히고 안정감을 연출" },
            { type: "💍 액세서리", style: "원목 가죽 믹스 주얼리", item: "천연 가죽 밴드 손목 시계", effect: "목의 고집을 조율하고 융통성 있는 교류 촉진" },
            { type: "💨 럭키 향수", style: "싱그러운 풀잎 향조", item: "그린 티, 편백나무 향", effect: "머리를 맑게 하고 집중력과 스트레스 저하 유도" }
          ];
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          luckyColors = [
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "감정 진정" },
            { name: "딥 블루", code: "#0F2027", energy: "수(水) 지혜", desc: "구설수 차단" },
            { name: "에메랄드 그린", code: "#1B4D3E", energy: "목(木) 상생", desc: "인덕 공급" },
            { name: "딥 퍼플", code: "#3F2B96", energy: "화(火) 조율", desc: "영감 충전" }
          ];
          item1Title = "🌊 수족관 및 미니 분수기";
          item1Desc = "작은 흐르는 물소리나 실내 가습기는 타오르는 불꽃의 열기를 이성적으로 식히고 구설수를 차단하는 효과를 줍니다.";
          item2Title = "🔮 흑요석 또는 오닉스 장식";
          item2Desc = "블랙 계열의 천연 원석은 넘쳐나는 화기를 흡수하고 안정적인 심리 방어막을 구축하여 차분함을 보완합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "시크 미니멀 룩", item: "제트 블랙 자켓, 차콜 슬랙스", effect: "감정적 과열을 억제하고 이성적 신용 구축" },
            { type: "💄 메이크업", style: "차분한 세미매트 스킨", item: "톤다운 무드 레드 립", effect: "들뜬 기운을 가라앉히고 확실한 중심감 어필" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "화이트 실버 체인 팔찌", effect: "화극금의 상성 충돌을 정화하고 판단력 확보" },
            { type: "💨 럭키 향수", style: "시원한 마린/아쿠아 향조", item: "시트러스 마린, 시원한 바다 향", effect: "뜨거운 열기를 차갑고 지혜로운 공기로 전환" }
          ];
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          luckyColors = [
            { name: "라이트 베이지", code: "#FAF5EB", energy: "토(土) 신용", desc: "안정적 결실" },
            { name: "골드", code: "#D4AF37", energy: "금(金) 결실", desc: "자산 회전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "조력 귀인" },
            { name: "딥 브라운", code: "#4A3B32", energy: "토(土) 수호", desc: "근간 수비" }
          ];
          item1Title = "🏺 도자기 화병 또는 세라믹 소품";
          item1Desc = "고풍스러운 세라믹 소품은 흙의 단단한 신용을 자극하여 영업 및 중요한 계약 성공률을 비약적으로 올려줍니다.";
          item2Title = "🪙 황금색 가죽 지갑";
          item2Desc = "베이지 또는 골드빛 천연 가죽 지갑은 사주 내 토 기운을 강화하여 자산이 밖으로 새지 않는 금전 창고를 닦아줍니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "베이지/얼스 톤 매칭", item: "베이지 셔켓, 라이트 토프 슬랙스", effect: "상대방에게 굳건하고 편안한 장기적 신용 어필" },
            { type: "💄 메이크업", style: "차분하고 화사한 음영 톤", item: "오렌지/브라운 매트 립스틱", effect: "비위장과 위장을 편안히 보해 안색 안정 유도" },
            { type: "💍 액세서리", style: "골드/황동 주얼리", item: "로즈 골드 링, 황동 열쇠고리", effect: "토생금의 상생으로 자금 회전력과 기회 상승" },
            { type: "💨 럭키 향수", style: "포근하고 은은한 우디 향조", item: "샌달우드, 앰버 향", effect: "흔들리지 않는 굳건하고 진중한 신뢰감 조성" }
          ];
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          luckyColors = [
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 결단", desc: "이성 회복" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 청량", desc: "명예 수호" },
            { name: "네이비", code: "#1A2E40", energy: "수(水) 설기", desc: "과열 냉각" },
            { name: "딥 카키", code: "#3B4D3C", energy: "목(木) 재성", desc: "재물 확보" }
          ];
          item1Title = "⌚ 메탈 바디 손목시계";
          item1Desc = "차가운 금속 톤의 스틸 시계나 메탈 소품은 금(金)의 지혜를 더하여 대인관계 내 칼 같은 분별력과 명예를 지켜줍니다.";
          item2Title = "🪞 원형 유리 거울 또는 크리스탈";
          item2Desc = "빛을 반사하고 맑게 투과하는 투명 크리스탈 소품은 폐/대장의 조금 기질을 맑게 제련하여 건강운을 보강합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "클래식 모노톤 비즈니스 룩", item: "화이트 셔츠, 차콜 자켓", effect: "이성적인 전문성과 신뢰감 있는 판단력 전달" },
            { type: "💄 메이크업", style: "맑고 깨끗한 하이라이터 포인트", item: "실버 펄 하이라이터, 립글로스", effect: "얼굴에 맑고 시원한 금수의 기류를 활성화" },
            { type: "💍 액세서리", style: "실버/화이트 골드 주얼리", item: "실버 링, 스틸안경테", effect: "화기의 위협으로부터 나를 수호하는 방패 작동" },
            { type: "💨 럭키 향수", style: "시원하고 깨끗한 비누 향조", item: "코튼, 화이트 머스크 향", effect: "정신적인 피로를 풀고 투명하고 맑은 성정 정돈" }
          ];
        } else {
          luckyColors = [
            { name: "딥 네이비", code: "#1A2E40", energy: "수(水) 지혜", desc: "인맥 확보" },
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "자산 보존" },
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 상생", desc: "에너지 충전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "계약 보증" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "모던 미니멀 시크 룩", item: "네이비 자켓, 블랙 슬랙스", effect: "상대에게 지혜롭고 깊이 있는 신용과 무게감 전달" },
            { type: "💄 메이크업", style: "윤기 나는 세미글로우 스킨", item: "투명 수분 립밤, 펄 에센스", effect: "가을 이슬 같은 촉촉함으로 금수쌍청 기류 극대화" },
            { type: "💍 액세서리", style: "메탈 스틸 시계", item: "스틸 손목시계, 은 귀걸이", effect: "수기를 생조하는 금의 기류로 명예운과 의지 강화" },
            { type: "💨 럭키 향수", style: "차분하고 묵직한 마린/우디 향", item: "마린, 샌달우드, 머스크 향", effect: "조급한 열기를 가라앉히고 지혜로운 여유 풍김" }
          ];
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">吉慶 衣裝 (길경 의장)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 추천 수호 소품 리스트</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의복과 수호 소품의 매칭은 일상 속에서 가장 즉각적으로 기운의 불균형을 바로잡는 <strong>개운 행동 풍수</strong>의 핵심입니다. 2026년 병오년의 맹렬한 화(火) 기류에 반응하여 의뢰인 {name}님의 사주에 안락함을 선사할 맞춤형 아이템과 의상 코디네이션을 제안합니다.
              </p>

              {/* 시각화: 오행 럭키 컬러 칩 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 {dayStemEl}일간 맞춤 럭키 컬러 팔레트</span>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {luckyColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                      <div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color.code }} />
                      <span className="font-semibold text-gray-800 text-[9px]">{color.name}</span>
                      <span className="text-[8px] text-gray-400 font-light">{color.energy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수호 아이템 2열 카드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl space-y-2 text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block">{item1Title}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">{item1Desc}</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl space-y-2 text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block">{item2Title}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">{item2Desc}</p>
                </div>
              </div>

              {/* 디테일 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 부위별 디테일 코디네이션 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">분류</th>
                      <th className="p-2 text-center">권장 스타일 및 포인트</th>
                      <th className="p-2 text-center">추천 아이템 / 컬러</th>
                      <th className="p-2">개운 메커니즘</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    {itemsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E2DDD5]/40">
                        <td className="p-2 font-semibold text-gray-800">{row.type}</td>
                        <td className="p-2 text-center font-medium">{row.style}</td>
                        <td className="p-2 text-center text-[#8A6F4C] font-semibold">{row.item}</td>
                        <td className="p-2">{row.effect}</td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/30">
                      <td className="p-2 font-semibold text-rose-800">⚠️ 피할 스타일</td>
                      <td className="p-2 text-center font-medium text-rose-950">화려한 원색 패션</td>
                      <td className="p-2 text-center text-rose-700 font-semibold">레드, 핫핑크, 네온 오렌지</td>
                      <td className="p-2 text-rose-950">뜨거운 화기를 자극해 심리적 충동과 구설 유발</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">👔 의복 수호</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수호 컬러의 의상을 착용해 조후 균형 보강</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">💍 금속 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">메탈 주얼리나 시계로 결단 기류 활성화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">💨 행운 향기</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">안락을 선사하는 럭키 향수로 정서 안정 유도</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 추천 수호 소품 리스트"
        );
      }


      case "ny_lucky_fashion": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let luckyColors = [];
        let itemsTable = [];

        if (dayStemEl === "목" || dayStemEl === "木") {
          luckyColors = [
            { name: "포레스트 그린", code: "#2F5233", energy: "목(木) 생기", desc: "주체성 회복" },
            { name: "에메랄드", code: "#00A86B", energy: "목(木) 성장", desc: "진로 확장" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "결단력 보완" },
            { name: "라이트 옐로우", code: "#FFF8D6", energy: "토(土) 신뢰", desc: "재물운 안착" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "내추럴 톤온톤 룩", item: "카키/베이지 리넨 셔츠", effect: "대인관계에 부드러운 신뢰와 편안함을 공급" },
            { type: "💄 메이크업", style: "내추럴 누드 톤 스킨", item: "차분한 브라운/피치 립밤", effect: "과도한 긴장을 가라앉히고 안정감을 연출" },
            { type: "💍 액세서리", style: "원목 가죽 믹스 주얼리", item: "천연 가죽 밴드 손목 시계", effect: "목의 고집을 조율하고 융통성 있는 교류 촉진" },
            { type: "💨 럭키 향수", style: "싱그러운 풀잎 향조", item: "그린 티, 편백나무 향", effect: "머리를 맑게 하고 집중력과 스트레스 저하 유도" }
          ];
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          luckyColors = [
            { name: "제트 BLACK", code: "#0D0D0D", energy: "수(水) 수호", desc: "감정 진정" },
            { name: "딥 BLUE", code: "#0F2027", energy: "수(水) 지혜", desc: "구설수 차단" },
            { name: "에메랄드 그린", code: "#1B4D3E", energy: "목(木) 상생", desc: "인덕 공급" },
            { name: "딥 PURPLE", code: "#3F2B96", energy: "화(火) 조율", desc: "영감 충전" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "시크 미니멀 룩", item: "제트 블랙 자켓, 차콜 슬랙스", effect: "감정적 과열을 억제하고 이성적 신용 구축" },
            { type: "💄 메이크업", style: "차분한 세미매트 스킨", item: "톤다운 무드 RED 립", effect: "들뜬 기운을 가라앉히고 확실한 중심감 어필" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "실버 체인 팔찌, 메탈 실버 귀걸이", effect: "화극금의 상성 충돌을 정화하고 판단력 확보" },
            { type: "💨 럭키 향수", style: "시원한 마린/아쿠아 향조", item: "시트러스 마린, 시원한 바다 향", effect: "뜨거운 열기를 차갑고 지혜로운 공기로 전환" }
          ];
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          luckyColors = [
            { name: "라이트 베이지", code: "#FAF5EB", energy: "토(土) 신용", desc: "안정적 결실" },
            { name: "골드", code: "#D4AF37", energy: "금(金) 결실", desc: "자산 회전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "조력 귀인" },
            { name: "딥 브라운", code: "#4A3B32", energy: "토(土) 수호", desc: "근간 수비" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "베이지/얼스 톤 매칭", item: "베이지 셔켓, 라이트 토프 슬랙스", effect: "상대방에게 굳건하고 편안한 장기적 신용 어필" },
            { type: "💄 메이크업", style: "차분하고 화사한 음영 톤", item: "오렌지/브라운 매트 립스틱", effect: "비위장과 위장을 편안히 보해 안색 안정 유도" },
            { type: "💍 액세서리", style: "골드/황동 주얼리", item: "로즈 골드 링, 황동 열쇠고리", effect: "토생금의 상생으로 자금 회전력과 기회 상승" },
            { type: "💨 럭키 향수", style: "포근하고 은은한 우디 향조", item: "샌달우드, 앰버 향", effect: "흔들리지 않는 굳건하고 진중한 신뢰감 조성" }
          ];
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          luckyColors = [
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 결단", desc: "이성 회복" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 청량", desc: "명예 수호" },
            { name: "네이비", code: "#1A2E40", energy: "수(Water) 설기", desc: "과열 냉각" },
            { name: "딥 카키", code: "#3B4D3C", energy: "목(木) 재성", desc: "재물 확보" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "클래식 모노톤 비즈니스 룩", item: "화이트 셔츠, 차콜 자켓", effect: "이성적인 전문성과 신뢰감 있는 판단력 전달" },
            { type: "💄 메이크업", style: "맑고 깨끗한 하이라이터 포인트", item: "실버 펄 하이라이터, 립글로스", effect: "얼굴에 맑고 시원한 금수의 기류를 활성화" },
            { type: "💍 액세서리", style: "실버/화이트 골드 주얼리", item: "실버 링, 스틸안경테", effect: "화기의 위협으로부터 나를 수호하는 방패 작동" },
            { type: "💨 럭키 향수", style: "시원하고 깨끗한 비누 향조", item: "코튼, 화이트 머스크 향", effect: "정신적인 피로를 풀고 투명하고 맑은 성정 정돈" }
          ];
        } else {
          luckyColors = [
            { name: "딥 네이비", code: "#1A2E40", energy: "수(水) 지혜", desc: "인맥 확보" },
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "자산 보존" },
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 상생", desc: "에너지 충전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "계약 보증" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "모던 미니멀 시크 룩", item: "네이비 자켓, 블랙 슬랙스", effect: "상대에게 지혜롭고 깊이 있는 신용과 무게감 전달" },
            { type: "💄 메이크업", style: "윤기 나는 세미글로우 스킨", item: "투명 수분 립밤, 펄 에센스", effect: "가을 이슬 같은 촉촉함으로 금수쌍청 기류 극대화" },
            { type: "💍 액세서리", style: "메탈 스틸 시계", item: "스틸 손목시계, 은 귀걸이", effect: "수기를 생조하는 금의 기류로 명예운과 의지 강화" },
            { type: "💨 럭키 향수", style: "차분하고 묵직한 마린/우디 향", item: "마린, 샌달우드, 머스크 향", effect: "조급한 열기를 가라앉히고 지혜로운 여유 풍김" }
          ];
        }

        const creditScore = Math.min(95, 75 + earthCount * 4);
        const gossipDefense = Math.min(95, 70 + (waterCount + metalCount) * 4);
        const calmRate = Math.min(95, 65 + (waterCount + earthCount) * 5);
        const synergyScore = Math.min(95, 70 + (woodCount + metalCount) * 4);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 2026년 병오년의 타오르는 화(火)의 열기를 식히고 메마른 땅을 적시는 수(수) 기운과, 단단한 결단력을 제공하는 금(금) 기운을 일상의 패션과 메이크업, 향수 섭생법을 통해 적극적으로 주입하십시오.
              </p>

              {/* 시각화 1: 럭키 컬러 칩 팔레트 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 병오년 수호 오행 럭키 컬러 팔레트</span>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {luckyColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                      <div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color.code }} />
                      <span className="font-semibold text-gray-800 text-[9px]">{color.name}</span>
                      <span className="text-[8px] text-gray-400 font-light">{color.energy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 스타일 시너지 및 보호 에너지 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 럭키 스타일링 운세 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 신용 및 평판 상승률</span>
                      <span className="text-[#8A6F4C]">{creditScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${creditScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>구설수 방어 및 악살 차단율</span>
                      <span className="text-[#8A6F4C]">{gossipDefense}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${gossipDefense}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>심리적 안정 & 조급함 냉각률</span>
                      <span className="text-[#8A6F4C]">{calmRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${calmRate}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>영업 / 계약 성사 시너지</span>
                      <span className="text-[#8A6F4C]">{synergyScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${synergyScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 스타일 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 부위별 디테일 코디네이션 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">분류</th>
                      <th className="p-2 text-center">권장 스타일 및 포인트</th>
                      <th className="p-2 text-center">추천 아이템 / 컬러</th>
                      <th className="p-2">개운 메커니즘</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    {itemsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E2DDD5]/40">
                        <td className="p-2 font-semibold text-gray-800">{row.type}</td>
                        <td className="p-2 text-center font-medium">{row.style}</td>
                        <td className="p-2 text-center text-[#8A6F4C] font-semibold">{row.item}</td>
                        <td className="p-2">{row.effect}</td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/30">
                      <td className="p-2 font-semibold text-rose-800">⚠️ 피할 스타일</td>
                      <td className="p-2 text-center font-medium text-rose-950">화려한 원색 및 형광 패션</td>
                      <td className="p-2 text-center text-rose-700 font-semibold">레드, 네온 오렌지 상의</td>
                      <td className="p-2 text-rose-950">가뜩이나 뜨거운 병오년의 화기(불꽃)를 자극해 심리적 충동과 구설을 유발</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">👔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">수호 컬러 코디</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수호 오행 컬러의 상의를 선택하여 밸런스 확보</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">메탈 포인트</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">스틸 시계나 실버 주얼리로 결단력 보완</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💄</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">광택 하이라이터</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">얼굴에 투명한 수분감을 더해 조급성 냉각</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        );
      }

      case "ny_diet_presc": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let constitutionName = "오행 평형 체질";
        let constitutionDesc = "";
        let goodFoods = "";
        let badFoods = "";
        let teaName = "";
        let teaDesc = "";
        let organGraph = null;

        // 동적 지표 사전 선언으로 미선언 에러 차단
        const woodRisk = Math.min(95, 55 + fireCount * 6);
        const woodEfficiency = Math.min(95, 75 + woodCount * 3);
        const fireOverheat = Math.min(99, 70 + fireCount * 7);
        const waterDryness = Math.min(95, 60 + (4 - waterCount) * 7);
        const earthBarrier = Math.min(95, 75 + earthCount * 4);
        const woodSuppress = Math.min(95, 65 + woodCount * 3);
        const lungMucosa = Math.min(95, 50 + metalCount * 8);
        const bowelStability = Math.min(95, 60 + (metalCount + waterCount) * 4);
        const waterIndex = Math.min(95, 50 + waterCount * 8);
        const wombImmunity = Math.min(95, 60 + (waterCount + metalCount) * 4);

        if (dayStemEl === "목" || dayStemEl === "木") {
          constitutionName = "풍목(風木) 체질 (간·담 기능 편중)";
          constitutionDesc = "목 기운의 특징인 솟구치는 기운이 강하여, 스트레스를 받거나 화기가 침범할 때 눈의 피로와 어깨 결림, 두통이 쉽게 동반되는 체질입니다. 타오르는 화기로 인해 체내 목기가 건조해져 신경계 피로가 누적될 위험이 높습니다.";
          goodFoods = "브로콜리, 미나리, 시금치 등 푸른 잎 채소 및 사과, 매실 (피로 해소 유도)";
          badFoods = "지나치게 매운 마늘/고추 요리, 튀긴 고기류, 고도수의 음주 (간열 증폭)";
          teaName = "구기자차 (枸杞子茶)";
          teaDesc = "구기자는 건조해진 간 기능을 보호하고 눈의 피로를 낮추며 목기를 부드럽게 이완시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 피로도</span>
                  <span className="text-[#8A6F4C]">{woodRisk}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${woodRisk}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>위·장(土) 소화 효율</span>
                  <span className="text-[#8A6F4C]">{woodEfficiency}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${woodEfficiency}%` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          constitutionName = "군화(君火) 체질 (심·소장 상열 체질)";
          constitutionDesc = "2026년 병오년의 타오르는 강력한 불꽃 세운과 만나 불기운이 극에 달할 수 있는 체질입니다. 상반신으로 열이 쉽게 솟구쳐 안면 홍조, 구내염, 수면 장애(불면증)가 생기기 쉬우며 혈압 조율에 신경 써야 합니다.";
          goodFoods = "오이, 토마토, 수박 등 수분과 찬 성질이 가득한 채소 및 메밀 (상열감 완화)";
          badFoods = "마라탕, 자극적인 향신료, 과도한 육류 섭취, 카페인 다량 섭취 (심혈관 열증 자극)";
          teaName = "보리차 또는 죽엽차 (竹葉茶)";
          teaDesc = "대나무 잎으로 우려낸 차는 심장의 불같은 열을 차분하게 가라앉히고 수분을 보충해 줍니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>심·소장(火) 과열도</span>
                  <span className="text-[#8A6F4C]">{fireOverheat}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: `${fireOverheat}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(Water) 건조율</span>
                  <span className="text-[#8A6F4C]">{waterDryness}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: `${waterDryness}%` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          constitutionName = "습토(濕土) 체질 (비·위장 소화기 편중)";
          constitutionDesc = "소화기 계통의 힘을 쥐고 있으나, 세운의 열기가 강해져 위장이 쉽게 메마르고 체내 노폐물(습담)이 끈적하게 남기 쉬운 체질입니다. 비위가 약해지면 피로감과 복부 팽만감을 자주 호소할 수 있습니다.";
          goodFoods = "단호박, 양배추, 연근, 감자 등 옐로우 푸드 및 율무 (비위 소화 촉진)";
          badFoods = "차가운 빙수나 맥주, 차가운 날음식, 밀가루 가공품 (비장 소화 마비)";
          teaName = "생강나무차 또는 백출차 (白朮茶)";
          teaDesc = "백출차는 위장의 습기를 제거하고 위벽을 튼튼하게 보해 소화 흡수력을 상승시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>비·위장(土) 방어막</span>
                  <span className="text-[#8A6F4C]">{earthBarrier}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${earthBarrier}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 억제 지수</span>
                  <span className="text-[#8A6F4C]">{woodSuppress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${woodSuppress}%` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          constitutionName = "조금(燥金) 체질 (폐·대장 호흡기 편중)";
          constitutionDesc = "단단하고 냉정하지만 화기 세운의 침입으로 가장 쉽게 녹아내리는(화극금) 연약한 쇠붙이의 기질입니다. 피부 건조증, 만성 마른기침, 대장 건조로 인한 변비 등에 매우 취약한 체질입니다.";
          goodFoods = "무, 도라지, 더덕, 버섯 등 흰색 뿌리 채소 및 배즙 (호흡기/피부 점막 보습)";
          badFoods = "바비큐, 구운 고기류, 고추장 등 매운 음식, 흡연 (기관지 건조 자극)";
          teaName = "맥문동차 (麥門冬茶)";
          teaDesc = "맥문동은 폐와 목구멍에 음액(수분)을 듬뿍 넣어 건조함을 몰아내고 마른기침을 가라앉힙니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>폐·기관지(金) 점막도</span>
                  <span className="text-[#8A6F4C]">{lungMucosa}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${lungMucosa}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>대장(金) 수분 유지력</span>
                  <span className="text-[#8A6F4C]">{bowelStability}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: `${bowelStability}%` }} />
                </div>
              </div>
            </div>
          );
        } else {
          constitutionName = "한수(寒水) 체질 (신·방광 신진대사 편중)";
          constitutionDesc = "차분하고 유연한 물 기운을 타고났으나, 2026년 병오년의 극강의 불꽃 세운에 직격탄을 맞아 체내 수기가 통째로 증발(수화대립)하기 쉽습니다. 비뇨기, 자궁, 호르몬 대사 저하 및 체내 전해질 부족을 겪기 쉽습니다.";
          goodFoods = "미역, 다시마 등 해조류와 검은콩, 검은깨, 신선한 생선 및 굴 (신장 활성화)";
          badFoods = "짠 찌개 및 소금기 많은 스낵, 과한 알코올 섭취 (신장 탈수 가중)";
          teaName = "옥수수수염차 또는 검은콩차";
          teaDesc = "신장의 노폐물 배출력을 돕고 탈수를 막으며 신장 에너지를 깊숙이 충전합니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 음액 지수</span>
                  <span className="text-[#8A6F4C]">{waterIndex}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: `${waterIndex}%` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>자궁·생식계 면역력</span>
                  <span className="text-[#8A6F4C]">{wombImmunity}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: `${wombImmunity}%` }} />
                </div>
              </div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생법 (五行 攝生)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기운을 안정시키는 건강 체질 음식 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간 오행 성향을 분석한 결과, 아래와 같이 맞춤형 약선 섭생 처방이 제공됩니다.
              </p>

              {/* 시각화 1: 개인 사주 맞춤 체질 진단 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <span className="text-[10px] text-[#A3845B] font-bold block">나의 맞춤형 오행 체질</span>
                    <span className="font-myeongjo text-sm font-bold text-gray-800">{constitutionName}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-[#E2DDD5]/40 pt-2 text-justify">
                  {constitutionDesc}
                </p>
              </div>

              {/* 시각화 2: 오행 장부 강약 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 오행 장부(臟腑) 에너지 밸런스</span>
                {organGraph}
              </div>

              {/* 추천/기피 섭생 매칭 플레이트 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🟢 추천 식자재 (Good)
                  </span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {goodFoods}
                  </p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-rose-800 text-[11px] block flex items-center gap-1">
                    🔴 삼가야 할 음식 (Bad)
                  </span>
                  <p className="text-[9px] text-rose-950 font-light leading-relaxed text-justify">
                    {badFoods}
                  </p>
                </div>
              </div>

              {/* 수호 약선차 디테일 카드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify flex items-start gap-4">
                <span className="text-2xl pt-0.5">☕</span>
                <div className="space-y-1">
                  <span className="font-bold text-[#A3845B] text-[11px] block">신년 추천 개운 차: {teaName}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">
                    {teaDesc} 따뜻하게 우려내어 하루 한 잔씩 편안한 시간에 음용하며 내면의 장기 기운을 순탄하게 보완하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "체질 맞춤형 오행 섭생 음식 처방"
        );
      }

      case "ny_final_blessing": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        let elementBlessing = "";

        if (dayStemEl === "목" || dayStemEl === " 木") {
          elementBlessing = "푸른 거목처럼 굳건히 뿌리 내려 세운의 뜨거운 열기를 헤치고 위대한 성장을 이루어내시길 축원합니다.";
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          elementBlessing = "어둠을 사르는 태양처럼 세상을 찬란하게 밝히고 내면의 열정과 성취를 아름다운 결실로 승화하시길 기원합니다.";
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          elementBlessing = "만물을 품는 넓은 대지처럼 묵직한 신용과 끈기로 온갖 복록과 금전의 창고를 활짝 열어가시길 축원합니다.";
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          elementBlessing = "단단하고 빛나는 보석처럼 매사에 차분하고 명료한 결단으로 일생의 귀한 대업을 굳건히 완성하시길 기원합니다.";
        } else {
          elementBlessing = "심연을 흐르는 맑은 물결처럼 무한한 지혜와 통찰력으로 삶의 모든 굴곡을 유연하고 복되게 개척해가시길 축원합니다.";
        }

        return wrapLock(
          <div className="py-8 px-4 flex flex-col justify-between min-h-[600px] bg-gradient-to-b from-[#FDFBF7] to-[#FAF6EE] border-4 border-[#A3845B]/30 rounded-2xl relative shadow-lg overflow-hidden">
            {/* 고풍스러운 모서리 문양 */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />

            <div className="text-center space-y-3 mt-4">
              <span className="text-xs tracking-[0.4em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto" />
            </div>

            <div className="my-auto py-8 text-center space-y-8 max-w-lg mx-auto">
              <h1 className="font-myeongjo text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-wider leading-relaxed">
                丙午年 成功 祈願<br />
                최종 축원문 (祝願文)
              </h1>
              
              <div className="w-12 h-1 bg-[#A3845B]/40 mx-auto my-4" />

              {/* 액자식 길조 수호 조언 */}
              <div className="bg-[#FAF8F5]/80 border border-[#E2DDD5]/70 rounded-xl p-6 shadow-inner text-justify text-xs font-traditional font-light text-gray-700 leading-relaxed space-y-4">
                <p>
                  천지합화(天地合火)의 맹렬한 불꽃 기류가 의뢰인 <strong>{name}</strong>님의 인생 앞길을 밝히는 광명의 횃불이 되기를 간절히 기원합니다. 올해의 뜨거운 에너지는 귀하를 지치게 하는 액난을 모두 소멸시키고, 굳건한 금빛 성공의 토양으로 환원될 것입니다.
                </p>
                <p className="font-semibold text-[#8B221E] border-t border-[#E2DDD5]/40 pt-3 text-center">
                  ✨ {name}님을 위한 오행 수호 축원
                </p>
                <p className="italic text-center text-gray-600 font-medium">
                  "{elementBlessing}"
                </p>
              </div>
            </div>

            <div className="mt-8 mb-6 text-center space-y-3 relative z-10">
              <span className="font-myeongjo text-base font-bold text-[#1A1A1A] tracking-widest block">慧眼堂 명리연구소 소장 배상</span>
              <p className="text-[10px] text-gray-400 font-light font-sans">본 보감의 개운법을 일상에 새겨 복록을 누리소서.</p>
            </div>

            {/* 혜안당 공식 직인 (낙관) */}
            <div className="absolute right-12 bottom-12 select-none opacity-90 z-20">
              <svg viewBox="0 0 60 60" className="w-[50px] h-[50px] transform -rotate-6 filter drop-shadow-[0_2px_4px_rgba(139,34,30,0.15)]">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂인
                </text>
              </svg>
            </div>
          </div>
        );
      }

      case "ny_intro_saju":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인 명조 분석과 사주 원국</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 {name}님의 사주 팔자(四柱八字) 원국 구성입니다. 사주는 연(年), 월(月), 일(日), 시(時)의 네 기둥과 여덟 글자로 이루어지며, 나의 타고난 기질과 에너지 흐름을 보여줍니다.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">{sajuInfo.hour.stem}{sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">{sajuInfo.hour.stemEl}/{sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1">{sajuInfo.day.stem}{sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light">{sajuInfo.day.stemEl}/{sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1 font-normal">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">{sajuInfo.month.stem}{sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">{sajuInfo.month.stemEl}/{sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">{sajuInfo.year.stem}{sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">{sajuInfo.year.stemEl}/{sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">초년·조상궁</div>
                </div>
              </div>
              <p className="border-t border-[#E2DDD5]/60 pt-3">
                특히 일간(日干: {sajuInfo.day.stem})은 나 자신을 상징하는 핵심적인 글자이며, 2026년 병오년 세운의 유입에 따라 가장 역동적으로 반응하게 됩니다.
              </p>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );

      case "ny_daewun_flow":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">대세 대운 흐름과 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                대운(大運)이란 10년 주기로 변화하는 나의 큰 운명적 환경을 뜻합니다. 매년 들어오는 세운(歲運)은 이 대운이라는 거대한 무대 위에서 춤을 추는 댄서와 같습니다.
              </p>
              <p>
                의뢰인 {name}님의 현재 대운 기류는 2026년 병오년의 천지합화(天地合火) 기운과 만나 삶의 우선순위를 재배치하게 만듭니다. 대운의 지지가 화(火) 기운을 지지하느냐, 혹은 제어하느냐에 따라 성공의 속도와 수호의 강도가 결정됩니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 올해는 장기적인 커리어 변화를 추진하기 전, 현재 위치에서 대운의 지지적 안정을 확보하는 것이 가장 현명합니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );

      case "ny_elements_supplement":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 보완 비책</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">부족한 오행을 채우는 생활 습관</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2026년 병오년에는 화(火) 기운이 극단적으로 팽창하여 수(水)와 금(金)이 쉽게 메마릅니다. 일상에서 부족한 기운을 인위적으로 보완해 주는 비책입니다.
              </p>
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E2DDD5]/50 pb-2">
                  <span className="font-bold text-[#5F7A68]">🌊 수(水) 기운 보완법:</span>
                  <p className="text-gray-500 mt-1">취침 전 반신욕이나 족욕을 통해 체내 순환을 돕고, 하루 1.5L 이상의 수분을 지속적으로 섭취하십시오. 북쪽으로 머리를 두고 자는 것이 기류 안정에 좋습니다.</p>
                </div>
                <div>
                  <span className="font-bold text-[#8A6F4C]">🪙 금(金) 기운 보완법:</span>
                  <p className="text-gray-500 mt-1">메탈 소재의 시계나 은 액세서리를 착용하십시오. 업무 공간에는 금속 제 소품이나 정돈된 스틸 프레임 가구를 두는 것이 정신 집중을 돕습니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "부족한 오행을 채우는 일상 개운법"
        );

      case "ny_mind_meditation":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">정신 수양 보감</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조급함을 다스리는 마음가짐</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                병오년의 강한 화(火) 기운은 마음속에 조급함과 불같은 분노, 충동성을 자극하기 쉽습니다. 감정 과열로 인한 실수를 방지하는 혜안 명상법입니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 space-y-2">
                <p className="font-semibold text-[#8B221E]">🧘 하루 10분 마인드풀니스 실천:</p>
                <p className="text-[11px] text-gray-600 font-light">
                  아침 기상 직후 또는 잠들기 전 10분 동안 스마트폰을 멀리하고 숨을 깊게 들이쉬고 내쉬며, 타오르는 불길이 차가운 호수에 가라앉는 시각화를 진행하십시오. 호흡을 조절할 때 비로소 화기가 진정되고 차분한 이성이 돌아옵니다.
                </p>
              </div>
            </div>
          </div>,
          "스트레스 조율 및 정신 건강 명상 처방"
        );

      case "ny_season_spring":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">봄철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 1월~3월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                봄은 목(木)의 기운이 솟아나 화(火)의 불길을 지피기 시작하는 명리학적 인오축(寅午戌)의 시기입니다. 
              </p>
              <p>
                이 시기에는 성급한 도전을 피하고 기획서 작성, 시장 조사, 네트워크 형성에 집중하는 것이 좋습니다. 외부적인 확장은 최소화하되, 내적인 역량을 키우는 준비 운동을 완벽하게 끝내야 다가오는 뜨거운 여름에 성과를 극대화할 수 있습니다.
              </p>
            </div>
          </div>,
          "봄철 계절적 세부 기운과 전략"
        );

      case "ny_season_summer":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">여름철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 4월~6월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                여름은 사오미(巳午未)의 순수 화기가 폭발하는 병오년의 절정기이자 화기 과열 구간입니다.
              </p>
              <p>
                인간관계에서의 사소한 오해가 큰 구설로 비화되거나 홧김에 직장을 그만두는 충동적 판단의 위험이 높습니다. 중요 의사결정은 가을로 유보하고, 건강 면에서는 탈수 증세와 심혈관 질환에 특히 유의해야 하는 시기입니다.
              </p>
            </div>
          </div>,
          "여름철 계절적 세부 기운과 전략"
        );

      case "ny_season_autumn":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">가을철 기류 전략 (음력 7~9월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">결실의 수확, 팽창을 멈추고 현금화하는 황금기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                가을철(음력 7월~9월)은 신유술(申酉戌) 금(金)의 기운이 지배하여 만물의 성장을 매듭짓고 단단한 결실을 영그는 수축의 시기입니다. 그동안 벌려놓았던 일들이 매끄러운 계약이나 성과로 나타나는 최고의 골든타임입니다. 새로운 투자보다는 수확한 결과를 안전자산으로 지키는 지혜가 빛을 발하게 될 것입니다.
              </p>
              
              {/* 시각화: 가을철 기류 지수 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 가을철 기류 전략 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>수확 및 결실 완성도</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 및 계약 성취도</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 투자 지향성</span>
                      <span className="text-[#A3845B]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>과열 기류 제어도</span>
                      <span className="text-[#A3845B]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 실천 가이드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 가을철 3대 실천 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-600 font-light">
                  <li>• <strong>음력 7월 (임신월):</strong> 봄과 여름철 벌여온 업무나 프로젝트의 중간 성과를 철저히 검토하고, 문서상의 법적/절차적 미비점을 수정 및 보강하십시오.</li>
                  <li>• <strong>음력 8월 (계유월):</strong> 명리학적 금(金) 기운의 조력으로 귀인이 돕는 시기입니다. 이직, 연봉 협상, 중대 계약 진행 시 적극적으로 권리를 주장하십시오.</li>
                  <li>• <strong>음력 9월 (갑술월):</strong> 수확한 재물이나 성과를 성급하게 재투자하지 마십시오. 이익을 확실하게 현금화하고 겨울의 동결기를 준비하는 자산 수렴 단계입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "가을철 계절적 세부 기운과 전략"
        );

      case "ny_season_winter":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#2A4B7C] font-bold block">겨울철 기류 전략 (음력 10~12월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">에너지의 수렴, 차분한 갈무리와 내일의 준비</h2>
              <div className="w-16 h-0.5 bg-[#2A4B7C]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                겨울철(음력 10월~12월)은 해자축(亥子丑) 수(水)의 기운이 도래하여 병오년의 뜨거운 잔열을 잠재우고 내실을 다지는 수렴과 응축의 시기입니다. 외부적인 활동과 무리한 투자는 가급적 멈추고, 자산을 갈무리하며 체력과 정신을 보존해야 하는 정밀한 리밸런싱 타임입니다.
              </p>

              {/* 시각화: 겨울철 기류 지수 */}
              <div className="bg-[#FAFBFD] border border-blue-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#2A4B7C] block">📊 겨울철 기류 안녕 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#2A4B7C]">
                      <span>자금 및 자산 안정도</span>
                      <span className="text-[#2A4B7C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#2A4B7C]">
                      <span>정신적·육체적 재충전 효율</span>
                      <span className="text-[#2A4B7C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-500">
                      <span>무리한 투자 위험 노출도</span>
                      <span className="text-red-700">20%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: "20%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>차기 대운 기류 안착률</span>
                      <span className="text-gray-700">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 실천 가이드 */}
              <div className="border border-blue-100 rounded-xl p-4 bg-[#FAFBFD]/50 text-justify space-y-2">
                <span className="font-bold text-xs text-[#2A4B7C] block">🧭 겨울철 3대 생존 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-600 font-light">
                  <li>• <strong>음력 10월 (을해월):</strong> 자산 수성에 만전을 기할 시기입니다. 겉보기만 그럴싸한 지인의 동업 제안이나 신규 투자를 단호히 거절하십시오.</li>
                  <li>• <strong>음력 11월 (병자월):</strong> 자오충(子午沖)의 수화 마찰 기류가 강해집니다. 주거지 이전이나 급작스러운 계약은 피하고, 심장과 신장 건강을 회복하십시오.</li>
                  <li>• <strong>음력 12월 (정축월):</strong> 2026년의 전체적인 성과와 자산을 안전하게 정산하고, 2027년 정미년(丁未年)의 새로운 세운 로드맵을 기획하기 좋은 갈무리 적기입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "겨울철 계절적 세부 기운과 전략"
        );

      case "ny_wealth_portfolio":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">재무 포트폴리오 (財務 指針)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">오행 성향 맞춤형 신년 재테크 조언</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님의 사주 오행 밸런스를 토대로 제안하는 2026년 최상의 자산 방어 및 투자 포트폴리오 비중 조율 제안서입니다. 화(火)의 팽창이 극에 달해 물이 쉽게 메마르고 쇳가루가 휘날리는 흐름 속에서 내 자산을 지켜내고 증식하기 위한 오행 처방입니다.
              </p>

              {/* 시각화: 자산 포트폴리오 비중 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 제안 자산 구성 비율</span>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex text-[8px] font-bold text-white text-center leading-4">
                  <div className="bg-[#8A6F4C]" style={{ width: "60%" }}>안전자산 60%</div>
                  <div className="bg-[#A3845B]" style={{ width: "30%" }}>배당/채권 30%</div>
                  <div className="bg-[#5F7A68]" style={{ width: "10%" }}>우량가치주 10%</div>
                </div>
                <p className="text-[9px] text-gray-400 font-light leading-snug">
                  * 무리한 성장주 레버리지 투자는 70% 이상의 손실 확률을 가지므로 금지하며, 원금 보장형 예적금이나 미국 단기 채권 ETF에 60% 이상 집중하십시오.
                </p>
              </div>

              {/* 추가: 오행 맞춤형 3대 투자 원칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌊</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">수(水) 기운: 수성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">예적금과 금 실물에 60%를 배분하여 원금을 굳건히 지킴</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🪙</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">금(金) 기운: 흐름</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">미국 단기 채권 및 월배당 리츠 30%로 안정적 이자 획득</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌲</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">목(木) 기운: 성장</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">글로벌 지수 ETF 및 대형 우량 가치주 10%로 방어적 투자</p>
                </div>
              </div>

              {/* 추가: 포트폴리오 자산 배분 조견표 */}
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm pt-2">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">자산 분류</th>
                      <th className="p-2">추천 오행</th>
                      <th className="p-2">권장 비중</th>
                      <th className="p-2">투자 실행 가이드</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🔒 안전성 보존 자산</td>
                      <td className="p-2 text-center">수(水) / 토(土)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">60%</td>
                      <td className="p-2">고금리 정기 예적금, 금(Gold) 현물 수성</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💵 고정 배당 자산</td>
                      <td className="p-2 text-center">금(金)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">30%</td>
                      <td className="p-2">월배당 인컴형 리츠, 미국 하이일드/단기채 ETF</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">📈 우량 가치 자산</td>
                      <td className="p-2 text-center">목(木)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">10%</td>
                      <td className="p-2">글로벌 지수 추종 ETF, 초우량 빅테크 가치 분할매수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>,
          "오행별 추천 투자 스타일 및 재무 가이드"
        )

      case "ny_career_detailed": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const jobChangeScore = Math.min(99, 70 + (metalCount + waterCount) * 4);
        const promotionScore = Math.min(95, 70 + (earthCount + metalCount) * 4);
        const frictionScore = Math.min(95, 50 + fireCount * 8);
        const professionalScore = Math.min(99, 80 + (earthCount + metalCount) * 2);

        // 골든타임 가이드 텍스트 (일간별)
        const detailedTimeline = {
          "목": { spring: "비교적 조용히 역량 보존 및 이력서 최신화에 전념할 때입니다.", summer: "화기가 팽창해 구설수가 우려되니 마찰을 전면 방어하십시오.", autumn: "금(金) 기운이 찾아와 문서를 취득하고 이직 도장을 찍기 최고의 적기입니다." },
          "화": { spring: "직무상 사소한 불만에 흔들리지 않도록 마인드 컨트롤이 최선입니다.", summer: "동료와 심한 의견 충돌이나 충동적 사직 가능성이 크니 절대 수성하십시오.", autumn: "열기가 식으면서 협상력이 상승하니 연봉 및 부서 조율을 도모하십시오." },
          "토": { spring: "새로운 프로젝트나 문서 업무가 시작되는 바쁜 준비기입니다.", summer: "화생토의 강력한 기운이 나를 지탱하므로 자격증 취득에 매우 유리합니다.", autumn: "실질적인 권위 상승 및 승진 기류가 본격적으로 작동하는 골든타임입니다." },
          "금": { spring: "업무 스트레스가 과중되나 기반을 닦는 중요한 수련 단계입니다.", summer: "감정적 조급증으로 협상판을 깨지 않도록 마음의 정돈이 필요합니다.", autumn: "나를 제련하던 용광로가 끝나고 마침내 완성된 보석처럼 명예가 드러나는 시기입니다." },
          "수": { spring: "조용히 변화를 조율하며 향후 재무/비즈니스 계획을 세우는 시기입니다.", summer: "재물 기회가 크게 들어오니 내 업무적 성과를 적극 어필하십시오.", autumn: "계약 협상 및 상사 귀인의 조력으로 이직/승진에 가장 유리한 달입니다." }
        }[dayStemEl] || { spring: "조용히 이력서를 보강하고 기본에 충실하십시오.", summer: "자오충으로 인한 급격한 충동적 결정은 뒤로 유보하는 것이 안전합니다.", autumn: "오행의 평온이 회복되면서 계약 서명이나 이직 원서 제출에 길합니다." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">이직 및 승진 타이밍 (職務 變動)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 직무 및 신분 변화 타이밍 가이드</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강렬한 화(화) 기운이 의뢰인 {name}님의 관성(관성: 직장 및 조직 명예)과 인성(인성: 문서 및 계약) 기류를 격렬하게 뒤흔드는 변화의 해입니다. 상반기의 성급한 판단이나 충동적인 사직은 자칫 독이 될 수 있으나, 가을철 금(금) 기운의 조력이 본격화되는 <strong>골든타임</strong>을 조율해 움직인다면 연봉 상승과 더불어 신분을 한 단계 업그레이드할 수 있는 절호의 기회입니다. 아래의 다차원 역량 기류 및 분기별 타임라인을 고려하여 체계적인 이직/승진 로드맵을 수립하십시오.
              </p>

              {/* 시각화: 커리어 역량 지표 게이지 */}
              <div className="bg-[#F6FAF7] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 2026년 신년 커리어 역량 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>이직 & 부서 이동 성공률</span>
                      <span className="text-[#5F7A68]">{jobChangeScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${jobChangeScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>내부 승진 및 권위 획득율</span>
                      <span className="text-[#5F7A68]">{promotionScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${promotionScore}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 갈등 및 마찰 지수</span>
                      <span className="text-gray-600">{frictionScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${frictionScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">{professionalScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${professionalScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 월별 커리어 로드맵 (3열 카드 형태) */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">📅 2026년 분기별 커리어 로드맵 (음력)</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌱 1분기: 내실 & 준비</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">음력 1월 ~ 3월</span>
                  <p className="text-[8.5px] text-gray-600 font-light mt-1 leading-snug">
                    {detailedTimeline.spring}
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">🔥 2분기: 조급 & 경계</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">음력 4월 ~ 6월</span>
                  <p className="text-[8.5px] text-red-600 font-light mt-1 leading-snug">
                    {detailedTimeline.summer}
                  </p>
                </div>
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">🍂 3-4분기: 계약 & 이동</span>
                  <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">음력 7월 ~ 12월</span>
                  <p className="text-[8.5px] text-emerald-700 font-light mt-1 leading-snug">
                    {detailedTimeline.autumn}
                  </p>
                </div>
              </div>

              {/* 커리어 안착을 위한 행동 수칙 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">🧭 커리어 성공을 위한 개운 행동 지침</span>
                <ul className="space-y-2 text-[10px] text-gray-600 font-light">
                  <li>• <strong>이직 면접 및 연봉 협상:</strong> 과열된 분위기를 진정시키고 신뢰도를 풍기기 위해 차분한 네이비, 짙은 그레이 계열의 비즈니스 룩을 필히 매칭하십시오.</li>
                  <li>• <strong>골든타임 기회 확보:</strong> 특히 <strong>음력 8월(계유월)</strong>은 금(금) 기운이 극에 달해 문서운과 상사 귀인운이 상호 조력하는 최고의 계약 시기입니다.</li>
                  <li>• <strong>소통 채널 수호:</strong> 음력 5월에는 이메일이나 사내 메신저 상의 구두 합의를 가급적 피하고 명문화된 공식 서류 위주로 결재를 득해야 낭패가 없습니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "이직 및 승진 상세 타이밍 가이드"
        );
      }

      case "ny_social_life": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const socialTrustScore = Math.min(95, 75 + earthCount * 4);
        const connectionFrequency = Math.min(95, 70 + (woodCount + waterCount) * 4);
        const relationshipFriction = Math.min(95, 40 + fireCount * 8);
        const communicationEfficiency = Math.min(95, 75 + (waterCount + metalCount) * 3);

        // 상생 귀인 및 경계 띠 (일간별 궁합 분석)
        const affinityZodiacs = {
          "목": { lucky: "돼지띠, 토끼띠, 양띠", bad: "쥐띠", desc: "나를 수생목/목해합으로 생조 및 조력하는 기운으로 계약서 검토 및 신규 인프라 획득에 최고의 파트너입니다." },
          "화": { lucky: "개띠, 양띠, 호랑이띠", bad: "쥐띠 (자오충 충돌)", desc: "강한 불기를 설기시켜 이성을 찾아주고 동업적 제안 시 실익을 배가시켜주는 띠입니다." },
          "토": { lucky: "뱀띠, 말띠, 닭띠", bad: "토끼띠", desc: "화생토의 에너지 순환과 금의 결실로 나의 문서 자산을 수호하고 신용도를 올려주는 귀인입니다." },
          "금": { lucky: "닭띠, 뱀띠, 용띠", bad: "범띠", desc: "뜨거운 제련을 견디도록 금의 뿌리를 지탱해주고 신년 문서 계약 체결 시 도장을 보증할 든든한 조력자입니다." },
          "수": { lucky: "원숭이띠, 쥐띠, 돼지띠", bad: "말띠 (수화 상쟁)", desc: "금생수로 물줄기의 근원을 살리고 자금 유통과 투자 협업 시 등대와 같은 현실 조언을 건넵니다." }
        }[dayStemEl] || { lucky: "말띠, 양띠, 개띠", bad: "쥐띠", desc: "의뢰인님의 명조 기류를 조율하고 일시적인 대인관계 갈등을 지탱해줄 최상의 궁합 띠입니다." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">대인관계 조율 (人脈 關係)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 인맥 관리 및 대인관계 조율</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강력한 불꽃 기운이 인맥 생태계를 달구어, 대인관계 상에서 불필요한 대립과 리셋 기류를 자극하기 쉽습니다. 사소한 언행 하나로 평소 친했던 지인과의 마찰이 발생할 수 있으나, 귀하의 기운을 차분히 받아주고 상생을 이룰 수 있는 띠 인연과 미리 소통선을 닦아놓는다면 위기에서 등대와 같은 조력을 얻을 수 있습니다. 아래의 대인 조화 지표와 인맥 매칭 전략을 참고하여 감정의 낭비를 예방하십시오.
              </p>

              {/* 시각화: 관계 신용 및 네트워킹 지표 게이지 */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 2026년 인맥 및 소통 에너지 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>인맥 신용도 & 신뢰 안착률</span>
                      <span className="text-[#5F7A68]">{socialTrustScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${socialTrustScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>귀인 상생 주파수 호응도</span>
                      <span className="text-[#5F7A68]">{connectionFrequency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${connectionFrequency}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>불필요한 갈등 노출도</span>
                      <span className="text-gray-600">{relationshipFriction}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${relationshipFriction}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사회적 소통 및 네트워킹 효율</span>
                      <span className="text-[#5F7A68]">{communicationEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${communicationEfficiency}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 인연 매칭 인포그래픽 (3열 카드 형태) */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">👥 2026년 귀인 및 경계 인맥 조견표 ({dayStemEl}일간 맞춤)</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">👍 올해의 상생 귀인</span>
                  <span className="text-[9px] font-semibold text-emerald-950 block mt-0.5">{affinityZodiacs.lucky}</span>
                  <p className="text-[8px] text-emerald-700 font-light mt-1 leading-snug">
                    {affinityZodiacs.desc}
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">⚠️ 경계해야 할 인연</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">{affinityZodiacs.bad}</span>
                  <p className="text-[8px] text-red-500 font-light mt-1 leading-snug">
                    주요 계약 분쟁이 생기거나 감정적 부침을 겪기 쉬우니 한 템포 유보하는 태도가 좋습니다.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🧭 인맥 개운 요결</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">서북 방위 & 금색 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    서북쪽 방향의 인프라를 활용하고, 은빛 실버 액세서리나 정돈된 복장이 대화의 신뢰를 올립니다.
                  </p>
                </div>
              </div>

              {/* 갈등 조율을 위한 행동 수칙 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#5F7A68] block">🧭 인맥 갈등 차단 3대 강령</span>
                <ul className="space-y-1.5 text-[9px] text-gray-600 font-light">
                  <li>• <strong>공과 사의 완벽한 분리:</strong> 친분 관계에 기인한 구두 계약이나 차용은 기류의 팽창 속에서 분쟁으로 가기 쉬우니 명확한 서류를 마련하십시오.</li>
                  <li>• <strong>의견 대립 시 3초 묵언:</strong> 음력 5월과 11월에 의견 대립이 시작되면 논리적 반박 대신 차가운 냉수를 한 잔 들이켜며 화기를 식히십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 인맥 관리 및 대인관계 조율"
        );
      }

      case "ny_roadmap_2030": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const careerHonor = Math.min(98, 70 + (earthCount + metalCount) * 4);
        const organStability = Math.min(95, 75 + (woodCount + waterCount) * 3);

        const advice2030 = {
          "목": "목(木) 일간에게 경술년은 편관과 편재의 조합으로 책임감과 변동 기류가 크게 교차합니다. 조직 내 안정을 추구하십시오.",
          "화": "화(火) 일간에게 경술년은 식상생재로 자금 회전력이 회복되는 해입니다. 적극적인 부업 창업 등으로 이득을 실현하십시오.",
          "토": "토(土) 일간에게 경술년은 내 식상 능력을 널리 표출하고 평판을 올릴 수 있는 예술/기획 안건의 성공 기류입니다.",
          "금": "금(金) 일간에게 경술년은 비겁과 술토 인성의 뒷받침으로 주체성이 강해져, 승진 및 권력 장악을 할 최고의 골든타임입니다.",
          "수": "수(水) 일간에게 경술년은 굳건한 관성 기류의 작동으로 법적 정돈, 장기 근속, 라이센스 확보 등 신분의 도약이 깃듭니다."
        }[dayStemEl] || "조직 내 주도권 획득과 문서 자산 통합에 매진하기에 가장 든든하고 상서로운 타이밍입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2030년 경술년(庚戌年)은 가공되지 않은 백금 경금(庚金)과 단단하고 건조한 영토 술토(戌土)가 만나 토생금(土生金)의 결단력과 단단함을 선사하는 해입니다. 조직 내에서 내 발언권이 막강해지며, 흩어져 있던 리소스를 한 방향으로 통합하여 최종적인 권위와 신분을 확립하는 매듭의 절기입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 경술년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>커리어 명예 및 권위 획득율</span>
                      <span className="text-[#8A6F4C]">{careerHonor}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${careerHonor}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 정착도 & 기맥 안정도</span>
                      <span className="text-[#8A6F4C]">{organStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${organStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 경술년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2030}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>경술년 핵심 전략:</strong> 금(金)과 토(土)의 숙살 기운이 조화를 이루는 시기이므로, 조직 내 비효율을 과감하게 다이어트하고 정예 인프라만 선별하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2030년 경술년 세운 로드맵"
        );
      }

      case "ny_roadmap_2031":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2031 신해년(辛亥年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2031년 신해년(辛亥年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2031년 신해년(辛亥年)은 은은하고 고귀한 보석 신금(辛金)과 끝없는 겨울 바다 해수(亥水)가 결합하여 맑고 청아한 금수상생(金水相生)을 형성합니다. 지난 5년간 치열하게 추진해왔던 도전과 확장이 마침내 온전한 내적인 쉼표, 가족의 안온함, 그리고 고요한 자기 성찰로 회귀하는 복록이 깊은 해입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 신해년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>생활 및 정신적 안락 지수</span>
                      <span className="text-[#8A6F4C]">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안온도 및 복록 안착</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>창의 및 직관적 안건 도출</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>고정 배당/인컴 자산 안정도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 신해년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 신해년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌊 1. 내면의 정수</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">경쟁에서 한 걸음 비켜서서 명상과 수련을 즐기며 신진대사를 안정시켜 두뇌를 쉬게 하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">💸 2. 고정수익 편재</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">월세 흐름이나 고배당 펀드 등 고정 현금 인컴 포트폴리오를 다져 연금 기반을 닦으십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🎨 3. 격조 있는 취미</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">예술, 음악, 서예 등 정신을 다스리고 격조를 높일 수 있는 여가 활동을 충실히 향유하십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "2031년 신해년(辛亥年) 세운 로드맵"
        )

      case "ny_lucky_fashion":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다.
              </p>

              {/* 스타일 팁 카드 */}
              <div className="space-y-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#5F7A68] text-[11px] block mb-1">👔 추천 룩: 미니멀 클래식 코디</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    지나치게 화려하거나 붉은 계열의 의상은 피하십시오. 네이비, 차콜, 화이트 등 정돈된 미니멀 클래식 룩을 매치할 때, 내적인 카리스마와 지혜로운 설득력을 전달하기가 가장 수월합니다.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block mb-1">💍 액세서리: 메탈 및 실버 포인트</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    심플한 스틸 시계나 실버 주얼리, 정갈한 메탈 안경테를 활용하여 내적인 금 기운을 튜닝하십시오. 타인에게 신뢰감을 전달하고 불필요한 구설을 차단하는 강력한 보호 펜스가 됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        )

      case "ny_diet_presc": {
        const dayStemEl = sajuInfo.day.stemEl;
        let constitutionName = "오행 평형 체질";
        let constitutionDesc = "";
        let goodFoods = "";
        let badFoods = "";
        let teaName = "";
        let teaDesc = "";
        let organGraph = null;

        if (dayStemEl === "목" || dayStemEl === "木") {
          constitutionName = "풍목(風木) 체질 (간·담 기능 편중)";
          constitutionDesc = "목 기운의 특징인 솟구치는 기운이 강하여, 스트레스를 받거나 화기가 침범할 때 눈의 피로와 어깨 결림, 두통이 쉽게 동반되는 체질입니다. 타오르는 화기로 인해 체내 목기가 건조해져 신경계 피로가 누적될 위험이 높습니다.";
          goodFoods = "브로콜리, 미나리, 시금치 등 푸른 잎 채소 및 사과, 매실 (피로 해소 유도)";
          badFoods = "지나치게 매운 마늘/고추 요리, 튀긴 고기류, 고도수의 음주 (간열 증폭)";
          teaName = "구기자차 (枸杞子茶)";
          teaDesc = "구기자는 건조해진 간 기능을 보호하고 눈의 피로를 낮추며 목기를 부드럽게 이완시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 피로도</span>
                  <span className="text-[#8A6F4C]">80%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>위·장(土) 소화 효율</span>
                  <span className="text-[#8A6F4C]">75%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          constitutionName = "군화(君火) 체질 (심·소장 상열 체질)";
          constitutionDesc = "2026년 병오년의 타오르는 강력한 불꽃 세운과 만나 불기운이 극에 달할 수 있는 체질입니다. 상반신으로 열이 쉽게 솟구쳐 안면 홍조, 구내염, 수면 장애(불면증)가 생기기 쉬우며 혈압 조율에 신경 써야 합니다.";
          goodFoods = "오이, 토마토, 수박 등 수분과 찬 성질이 가득한 채소 및 메밀 (상열감 완화)";
          badFoods = "마라탕, 자극적인 향신료, 과도한 육류 섭취, 카페인 다량 섭취 (심혈관 열증 자극)";
          teaName = "보리차 또는 죽엽차 (竹葉茶)";
          teaDesc = "대나무 잎으로 우려낸 차는 심장의 불같은 열을 차분하게 가라앉히고 수분을 보충해 줍니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>심·소장(火) 과열도</span>
                  <span className="text-[#8A6F4C]">95%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 건조율</span>
                  <span className="text-[#8A6F4C]">90%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          constitutionName = "습토(濕土) 체질 (비·위장 소화기 편중)";
          constitutionDesc = "소화기 계통의 힘을 쥐고 있으나, 세운의 열기가 강해져 위장이 쉽게 메마르고 체내 노폐물(습담)이 끈적하게 남기 쉬운 체질입니다. 비위가 약해지면 피로감과 복부 팽만감을 자주 호소할 수 있습니다.";
          goodFoods = "단호박, 양배추, 연근, 감자 등 옐로우 푸드 및 율무 (비위 소화 촉진)";
          badFoods = "차가운 빙수나 맥주, 차가운 날음식, 밀가루 가공품 (비장 소화 마비)";
          teaName = "생강나무차 또는 백출차 (白朮茶)";
          teaDesc = "백출차는 위장의 습기를 제거하고 위벽을 튼튼하게 보해 소화 흡수력을 상승시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>비·위장(土) 방어막</span>
                  <span className="text-[#8A6F4C]">85%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 억제 지수</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          constitutionName = "조금(燥金) 체질 (폐·대장 호흡기 편중)";
          constitutionDesc = "단단하고 냉정하지만 화기 세운의 침입으로 가장 쉽게 녹아내리는(화극금) 연약한 쇠붙이의 기질입니다. 피부 건조증, 만성 마른기침, 대장 건조로 인한 변비 등에 매우 취약한 체질입니다.";
          goodFoods = "무, 도라지, 더덕, 버섯 등 흰색 뿌리 채소 및 배즙 (호흡기/피부 점막 보습)";
          badFoods = "바비큐, 구운 고기류, 고추장 등 매운 음식, 흡연 (기관지 건조 자극)";
          teaName = "맥문동차 (麥門冬茶)";
          teaDesc = "맥문동은 폐와 목구멍에 음액(수분)을 듬뿍 넣어 건조함을 몰아내고 마른기침을 가라앉힙니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>폐·기관지(金) 점막도</span>
                  <span className="text-[#8A6F4C]">65%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>대장(金) 수분 유지력</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: "70%" }} />
                </div>
              </div>
            </div>
          );
        } else {
          // 수(水) 일간 혹은 기본
          constitutionName = "한수(寒水) 체질 (신·방광 신진대사 편중)";
          constitutionDesc = "차분하고 유연한 물 기운을 타고났으나, 2026년 병오년의 극강의 불꽃 세운에 직격탄을 맞아 체내 수기가 통째로 증발(수화대립)하기 쉽습니다. 비뇨기, 자궁, 호르몬 대사 저하 및 체내 전해질 부족을 겪기 쉽습니다.";
          goodFoods = "미역, 다시마 등 해조류와 검은콩, 검은깨, 신선한 생선 및 굴 (신장 활성화)";
          badFoods = "짠 찌개 및 소금기 많은 스낵, 과한 알코올 섭취 (신장 탈수 가중)";
          teaName = "옥수수수염차 또는 검은콩차";
          teaDesc = "신장의 노폐물 배출력을 돕고 탈수를 막으며 신장 에너지를 깊숙이 충전합니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 음액 지수</span>
                  <span className="text-[#8A6F4C]">60%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>자궁·생식계 면역력</span>
                  <span className="text-[#8A6F4C]">68%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: "68%" }} />
                </div>
              </div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생법 (五行 攝生)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기운을 안정시키는 건강 체질 음식 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간 오행 성향을 분석한 결과, 아래와 같이 맞춤형 약선 섭생 처방이 제공됩니다.
              </p>

              {/* 시각화 1: 개인 사주 맞춤 체질 진단 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <span className="text-[10px] text-[#A3845B] font-bold block">나의 맞춤형 오행 체질</span>
                    <span className="font-myeongjo text-sm font-bold text-gray-800">{constitutionName}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-[#E2DDD5]/40 pt-2 text-justify">
                  {constitutionDesc}
                </p>
              </div>

              {/* 시각화 2: 오행 장부 강약 지표 (동적 구성) */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 오행 장부(臟腑) 에너지 밸런스</span>
                {organGraph}
              </div>

              {/* 추천/기피 섭생 매칭 플레이트 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🟢 추천 식자재 (Good)
                  </span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {goodFoods}
                  </p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-rose-800 text-[11px] block flex items-center gap-1">
                    🔴 삼가야 할 음식 (Bad)
                  </span>
                  <p className="text-[9px] text-rose-950 font-light leading-relaxed text-justify">
                    {badFoods}
                  </p>
                </div>
              </div>

              {/* 수호 약선차 디테일 카드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify flex items-start gap-4">
                <span className="text-2xl pt-0.5">☕</span>
                <div className="space-y-1">
                  <span className="font-bold text-[#A3845B] text-[11px] block">신년 추천 개운 차: {teaName}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">
                    {teaDesc} 따뜻하게 우려내어 하루 한 잔씩 편안한 시간에 음용하며 내면의 장기 기운을 순탄하게 보완하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "체질 맞춤형 오행 섭생 음식 처방"
        );
      }

      case "ny_final_blessing":
        return (
          <div className="text-center space-y-8 py-12">
            <span className="text-xs tracking-widest text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 終章 —</span>
            <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto" />
            
            <div className="space-y-4 max-w-md mx-auto">
              <p className="font-myeongjo text-lg font-bold text-gray-800">
                "어둠이 아무리 깊어도 태양은 다시 떠오르고,<br />
                흔들리는 대지 위에 굳건한 성이 세워집니다."
              </p>
              <p className="text-xs text-gray-500 leading-relaxed font-light font-traditional">
                의뢰인 {name}님이 병오년의 타오르는 거대한 불꽃 속에서도 흔들림 없이 중심을 잡으시고, 액운은 지혜롭게 흘려보내며 대길한 복록만을 오롯이 움켜쥐시기를 혜안당 명리연구소가 온 마음으로 정성스레 축원합니다.
              </p>
            </div>
            

          </div>
        );

      default:
        return null;
    }
  };

  const renderNewYearContent = () => {
    if (reportGrade === "sms") {
      return renderSmsNewYearContent();
    }

    const pages = getNewYearPagesConfiguration(name, partnerName);
    const metrics = getCharacterMetrics(sajuInfo);
    const isFree = reportGrade === "free" && !isPaid;

    const deepExcludeTypes = [
      "ny_ilju_harmony",
      "ny_sinsal_active",
      "ny_warning_period",
      "ny_worry_solution",
      "ny_roadmap_2027",
      "ny_roadmap_2028",
      "ny_roadmap_2029",
      "ny_fengshui_interior"
    ];

    const isNewYear = type === "newyear" && typeParam !== "tojeong";

    const activePages = isNewYear
      ? pages
      : (reportGrade === "premium"
          ? pages
              .filter(p => !deepExcludeTypes.includes(p.type))
              .map((p, idx) => ({ ...p, page: idx + 1 }))
          : pages);

    return (
      <div className="space-y-12 print:space-y-0">
        {activePages.map((page) => (
          <div
            key={page.page}
            className="print-page-wrapper print:text-[13px] print:leading-relaxed relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-8 shadow-md print:border-none print:shadow-none print:p-0 print:m-0"
          >
            <div>
              {/* Decorative Corner Seals (Inside page) */}
              <div className="absolute top-2 left-2 text-[#A3845B]/15 text-[8px] print:hidden">卍</div>
              <div className="absolute top-2 right-2 text-[#A3845B]/15 text-[8px] print:hidden">卍</div>

              {/* Page Header */}
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · {typeParam === "tojeong" ? "토정비결" : "신년운세"}</span>
                <span className="text-[9px] text-gray-400 font-light font-traditional">{page.title}</span>
              </div>

              {/* Dynamic Page Content */}
              <div className="flex-1">
                {renderNewYearPageContent(page, {
                  name,
                  gender,
                  year,
                  month,
                  day,
                  hour,
                  sajuInfo,
                  prescriptions,
                  personalizedText,
                  baseEl,
                  worryText,
                  worryCategory,
                  isFree,
                  currentGrade,
                  type,
                  typeParam
                })}
              </div>
            </div>

            {/* Page Footer */}
            <div className="flex justify-between items-center border-t border-[#E2DDD5]/50 pt-3 mt-6 text-[9px] text-[#5F5F5F] print:text-xs">
              <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 {typeParam === "tojeong" ? "토정비결" : "신수비결"}</span>
              <span className="font-myeongjo font-bold">{page.page} / {activePages.length}</span>
            </div>
          </div>
        ))}

        {isFree && (
          <div className="relative mt-8">
            {/* 정교한 유료 잠금 오버레이 배너 */}
            <div className="bg-[#1C1613] text-[#FAF7F0] border-4 border-double border-[#A3845B] rounded-xl p-8 shadow-2xl text-center font-traditional relative overflow-hidden print:hidden">
              <div className="text-[10px] tracking-widest text-[#A3845B] mb-2">— 이현의 마지막 제안 —</div>
              
              <h4 className="font-myeongjo text-xl font-bold text-white mb-6">
                {name}님 {typeParam === "tojeong" ? "토정비결" : "신수비결"}엔 <span className="text-[#A3845B]">8가지 심화 분석</span>이 잠겨 있습니다.
              </h4>

              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto mb-6 text-xs font-semibold">
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2C2C] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  일주 합충형파해 연쇄 진단 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2C2C] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  신년 3대 신살 작동 분석 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2C2C] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  치명적인 액난 경보 & 방어 🔓
                </button>
                <button type="button" onClick={handlePortonePayment} className="py-2.5 px-4 bg-[#2C2C2C] border border-[#A3845B]/30 hover:border-[#A3845B] rounded transition-all text-[#FAF7F0]">
                  향후 3개년 로드맵 🔓
                </button>
              </div>

              <p className="text-[11px] text-gray-300 font-light mb-6">
                이 8가지를 포함하여 총 36개 이야기.<br />
                <strong>그 외의 주요 지표의 일부만 열람하셨습니다.</strong>
              </p>

              <div className="flex items-center justify-center gap-3 text-xs mb-6 bg-black/40 py-2.5 px-4 rounded-lg max-w-xs mx-auto">
                <span className="text-red-500 font-bold">⏰ 단 1회 한정 특가</span>
                <span className="text-gray-400 line-through whitespace-nowrap">54,600원</span>
                <span className="text-white font-bold text-sm whitespace-nowrap">34,900원</span>
                <span className="text-[#A3845B] font-bold">36%↓</span>
              </div>

              <div className="space-y-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={handlePortonePayment}
                  className="w-full py-4 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] rounded font-bold text-sm shadow-xl transition-all tracking-widest cursor-pointer"
                >
                  {name}님 정통 {typeParam === "tojeong" ? "토정비결" : "신수비결"} 풀이 ({metrics.nickname}) →
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaid(true)}
                  className="w-full py-2 bg-[#FAF7F0]/10 hover:bg-[#FAF7F0]/20 text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all"
                >
                  ⚙️ [개발자 테스트] 결제 없이 즉시 잠금해제 확인하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // Render: 재물 & 비즈니스운 (wealth) - Upgraded to Premium
  // ----------------------------------------------------
  const renderWealthContent = () => {
    // Dynamic Business Metrics Calculation
    const driveScore = metrics.scores.drive || 85;
    const patienceScore = metrics.scores.patience || 60;
    const negotiationScore = metrics.scores.negotiation || 75;

    let commentText = "";
    if (driveScore >= 75) {
      commentText += `귀하는 강한 추진력과 돌파력(${driveScore}%)을 타고나 사업을 일으키고 매출을 만드는 에너지가 아주 훌륭합니다. `;
    } else {
      commentText += `귀하는 돌발적인 행동보다는 신중하게 기회를 포착하는 안정적인 추진력(${driveScore}%)을 지니고 있습니다. `;
    }

    if (patienceScore >= 70) {
      commentText += `특히 자산을 철저하게 지켜내고 위기 상황을 통제하는 관리력(${patienceScore}%)이 우수하여 안정된 사업 운영이 가능합니다. `;
    } else {
      commentText += `다만, 벌어들인 재물을 안전하게 묶어두는 통제력(${patienceScore}%)이 다소 취약할 수 있으니 무리한 재투자는 피하고 현금 자산을 굳건히 수비하는 시스템을 구축하십시오. `;
    }

    if (negotiationScore >= 70) {
      commentText += `또한, 타인과의 상생 및 협상력(${negotiationScore}%)이 뛰어나 귀인의 도움을 얻거나 유리한 동업/제휴를 맺기에 좋은 명조입니다.`;
    } else {
      commentText += `또한, 대인 관계의 주도권에서 기운의 소모가 클 수 있으니 동업이나 공동 투자는 지분을 명확히 하고 독립적으로 판단하는 것이 훨씬 안전합니다.`;
    }

    // Determine custom age ranges for wealth golden eras
    const birthYearNum = parseInt(searchParams.get("year")) || 1990;
    const birthMonthNum = parseInt(searchParams.get("month")) || 1;
    const birthDayNum = parseInt(searchParams.get("day")) || 15;
    const ageOffset = ((birthYearNum * birthMonthNum + birthDayNum) % 9) - 4; // range -4 to +4

    const era1_start = 28 + ageOffset;
    const era1_end = 35 + ageOffset;
    const era2_start = 42 + ageOffset;
    const era2_end = 48 + ageOffset;
    const era3_start = 55 + ageOffset;
    const era3_end = 62 + ageOffset;

    let era2Desc = "";
    if (baseEl === "목") {
      era2Desc = `사주의 대운 흐름 상, 부족한 토(재성)와 화(식상)의 기운이 조화를 이루어 나무가 무럭무럭 자라고 큰 숲을 이루는 대길한 시기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.`;
    } else if (baseEl === "화") {
      era2Desc = `사주의 대운 흐름 상, 부족한 금(재성)의 결실 에너지가 조화를 이루어 활활 타오르는 불꽃이 황금 열매를 맺는 대길한 시기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.`;
    } else if (baseEl === "토") {
      era2Desc = `사주의 대운 흐름 상, 부족한 수(재성)와 목(관성)의 흐름이 대지에 흐르며 메마른 땅이 비옥한 옥토로 변화하는 대길한 시기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.`;
    } else if (baseEl === "금") {
      era2Desc = `사주의 대운 흐름 상, 부족한 화(관성)의 열기가 쇠붙이를 달구어 예리하고 진귀한 보검으로 제련해 내는 대길한 시기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.`;
    } else { // 수
      era2Desc = `사주의 대운 흐름 상, 부족한 토(관성)와 화(재성)의 기운이 물길을 막아 댐처럼 거대한 재물을 조용히 가두고 축적하는 대길한 시기입니다. 사업체를 소유했다면 매출이 급등하며, 투자했던 자산이 몇 배로 불어나 인생에서 가장 큰 재물 창고를 개방하게 되는 황금 종착지입니다.`;
    }

    // Determine Wealth Summary Cards dynamically
    let wealthGlassSize = "중상급 (中上級)";
    const bizScore = metrics.scores.business || 75;
    if (bizScore >= 85) {
      wealthGlassSize = "대부격 (大富格)";
    } else if (bizScore >= 70) {
      wealthGlassSize = "중상급 (中上級)";
    } else {
      wealthGlassSize = "자수성가형 (自手成家)";
    }

    let optimalBizField = "유통/지식/부동산";
    if (baseEl === "목") {
      optimalBizField = "교육/문화/콘텐츠";
    } else if (baseEl === "화") {
      optimalBizField = "IT/마케팅/요식업";
    } else if (baseEl === "토") {
      optimalBizField = "부동산/개발/중개";
    } else if (baseEl === "금") {
      optimalBizField = "금융/제조/기술";
    } else { // 수
      optimalBizField = "무역/유통/물류";
    }

    let wealthWeakness = "단타 투자/동업";
    if (baseEl === "목") {
      wealthWeakness = "동업/인정 기반 거래";
    } else if (baseEl === "화") {
      wealthWeakness = "단타 투자/조급한 확장";
    } else if (baseEl === "토") {
      wealthWeakness = "자금 동결/리스크 방치";
    } else if (baseEl === "금") {
      wealthWeakness = "무리한 베팅/과소비";
    } else { // 수
      wealthWeakness = "누수 지출/자산 분산";
    }

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
              {personalizedText.analysis}
            </p>
          </div>
        )}

        {/* Core Wealth Vessel Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center text-xs">
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">평생 재물 그릇 크기</span>
            <span className="font-bold text-sm sm:text-base text-[#5F7A68]">{wealthGlassSize}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">최적 비즈니스 분야</span>
            <span className="font-bold text-sm sm:text-base text-[#5F7A68]">{optimalBizField}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded p-4 shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">재물 관리 취약점</span>
            <span className="font-bold text-sm sm:text-base text-red-600">{wealthWeakness}</span>
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
                <span className="text-[#5F7A68] font-bold">{driveScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${driveScore}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">🛡️ 자산 안전 수호 및 리스크 통제력</span>
                <span className="text-[#5F7A68] font-bold">{patienceScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${patienceScore}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-foreground">🤝 귀인 운세 및 동업 파트너십 상성</span>
                <span className="text-[#5F7A68] font-bold">{negotiationScore}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: `${negotiationScore}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-foreground-muted leading-relaxed font-light">
            * {commentText}
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
              <span className="text-xs font-bold text-[#A3845B] block">1차 황금기 ({era1_start}세 ~ {era1_end}세) : 기초 자산 형성기</span>
              <p className="text-[11px] text-foreground-muted font-light leading-relaxed">
                사회 활동의 정착과 전문직/사업 기반의 성립으로 첫 자산이 모이는 시기입니다. 이 시기에 뿌려진 인맥과 배움이 중년 대박의 거름이 됩니다.
              </p>
            </div>
            
            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">2차 황금기 ({era2_start}세 ~ {era2_end}세) : 인생 최대의 수확기</span>
              <p className="text-[11px] text-foreground-muted font-light leading-relaxed">
                {era2Desc}
              </p>
            </div>

            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#A3845B] block">3차 황금기 ({era3_start}세 ~ {era3_end}세) : 수동적 임대/연금 수익기</span>
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

      <div className={`max-w-3xl mx-auto bg-[#F6F3EC] border-4 border-[#A3845B] rounded-lg p-6 md:p-12 shadow-md relative print:shadow-none print:border-none print:bg-white ${isFree ? "pb-24 md:pb-32" : ""}`}>
        
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
        <div className="print:break-after-page min-h-[calc(100vh-120px)] flex flex-col justify-between py-16 px-6 border-b-2 border-dashed border-[#A3845B]/40 print:border-none relative">
          
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
              {type === "newyear" && (typeParam === "tojeong" ? "토정비결 보고서" : "신년운세 보고서")}
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
                  {type === "newyear" && (typeParam === "tojeong" ? "토정비결" : "신년운세")}
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

        {/* 하단 고정 결제 CTA 플로팅 바 (isFree 일 때 노출) */}
        {isFree && (
          <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
            <button
              type="button"
              onClick={handlePortonePayment}
              className="w-full bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm md:text-base flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#A3845B]/20"
            >
              <span>{name}님 정통 {typeParam === "tojeong" ? "토정비결" : (type === "newyear" ? "신년운세" : "사주 풀이")} ({metrics.nickname})</span>
              <span className="text-lg">➔</span>
            </button>
          </div>
        )}

        {/* 신년운세 고급 리포트일 때 프리미엄 업그레이드 하단 고정 플로팅 바 */}
        {!isFree && type === "newyear" && typeParam !== "tojeong" && currentGrade === "premium" && (
          <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
            <button
              type="button"
              onClick={handleUpgradePayment}
              className="w-full bg-[#5F7A68] hover:bg-[#465A4B] text-white py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm md:text-base flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#5F7A68]/20"
            >
              <span>👑 {name}님 신년운세 프리미엄 리포트로 업그레이드 (+15,000원)</span>
              <span className="text-lg">➔</span>
            </button>
          </div>
        )}

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
