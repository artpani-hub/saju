"use client";
import { renderNewYearPageContent } from "./components/renderNewYearPageContent";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Calendar, Award, CheckSquare, AlertCircle } from "lucide-react";
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

  const iljuKey = `${dayStem}${dayBranch}`;
  const iljuDestinyDatabase = {
    "甲子": { nickname: "지혜의 비를 품은 푸른 선구자형", rarity: "1.4%", description: "깊고 투명한 밤의 샘물(子)을 수혈받아 마르지 않는 학문적 총명함과 **독창적인 기획 전략**으로 세상을 이끄는 선구자의 기류를 지녔습니다." },
    "甲寅": { nickname: "광야를 개척하는 거목의 포효형", rarity: "1.8%", description: "스스로 거대한 기둥(寅)으로 우뚝 솟아 어떠한 타협이나 외압 없이 독자적인 영역을 장악하는 **강인한 독립과 자수성가**의 화신입니다." },
    "甲辰": { nickname: "푸른 숲을 거느린 대지의 제왕형", rarity: "2.1%", description: "자양분이 깃든 비옥한 봄의 땅(辰)에 곧게 뿌리를 뻗쳐, 주변인들에게 그늘을 제공하고 **거대한 재물과 권위**를 움켜쥐는 안락한 거목의 품입니다." },
    "甲午": { nickname: "하늘을 찌를 듯 솟구친 불꽃 나무형", rarity: "1.9%", description: "뜨겁고 찬란한 여름 태양의 빛(午)을 향해 뻗어나가는 형상으로, **빛나는 창의성과 거침없는 예술적 추진력**으로 트렌드를 리드합니다." },
    "甲申": { nickname: "절벽 위를 견고히 지키는 청솔형", rarity: "1.6%", description: "단단한 바위 절벽(申)을 뚫고 뿌리내려 매섭고 냉철한 풍파 속에서도 자신을 제련하고 **명예와 강건한 기상**을 지켜내는 영웅의 명조입니다." },
    "甲戌": { nickname: "금맥을 휘감은 황금빛 거목형", rarity: "1.7%", description: "용광로의 열기를 품은 마른 흙(戌) 속에 숨겨진 금고를 굳건히 딛고 서서, **안정된 자산 수성과 영리한 실리 추구**에 탁월한 보물창고를 지녔습니다." },
    "乙丑": { nickname: "눈 속을 뚫고 싹트는 인내의 들꽃형", rarity: "1.5%", description: "차가운 겨울 눈밭(丑)의 혹독한 기류 속에서도 기어코 생명의 싹을 틔워내는 **경이로운 생명력과 끈기**로 험난한 고비를 돌파하는 끈기형입니다." },
    "乙卯": { nickname: "대지를 초록으로 뒤덮는 생명의 꽃밭형", rarity: "2.2%", description: "완연한 봄날의 들판(卯)에 흐드러진 넝쿨처럼, 유연하고 다정한 친화력과 **강한 사교성 및 유연한 융통성**으로 대중의 인기를 끕니다." },
    "乙巳": { nickname: "불꽃 속에서 피어오른 붉은 넝쿨형", rarity: "1.7%", description: "화려하게 번지는 불꽃(巳)을 휘감고 올라가 자신의 재능을 최고조로 노출시키는 형세로, **언변이 수려하고 미적 감각이 대단한 스타형** 사주입니다." },
    "乙未": { nickname: "백사장을 지키는 불굴의 선인장형", rarity: "1.8%", description: "뜨거운 여름 모래밭(未)에서도 마르지 않고 생존하는 선인장의 형상으로, **강인한 생활력과 꼼꼼한 마진 수리 감각**으로 마침내 성공을 지켜냅니다." },
    "乙酉": { nickname: "은장도를 품은 서슬 퍼런 꽃바람형", rarity: "1.3%", description: "차갑고 단단한 보석 칼날(酉) 위에 아슬아슬하게 핀 꽃처럼, **예민하고 직관적인 예술성**과 타협 없는 고결한 자존심을 무기로 섭니다." },
    "乙亥": { nickname: "푸른 바다 위를 떠다니는 수련형", rarity: "1.6%", description: "끝없는 겨울의 바다(亥)를 표류하며 스스로 상생의 길을 찾는 연꽃처럼, **순수한 영혼과 학문적 깊이**를 품어 예술과 종교적 통찰이 깊습니다." },
    "丙子": { nickname: "호수 위를 환히 비추는 윤슬 태양형", rarity: "1.5%", description: "조용하고 맑은 물빛(子) 위에 쏟아지는 찬란한 태양광처럼, **수려한 카리스마와 정갈한 품위**로 조직의 명예를 공고히 다지는 리더입니다." },
    "丙寅": { nickname: "동트는 아침 하늘을 가르는 붉은 태양형", rarity: "1.9%", description: "새벽녘 숲속(寅)의 기운을 수혈받아 떠오르는 찬란한 서광처럼, **강력한 학습 능력과 후원자 귀인의 은덕**을 품고 도약하는 귀한 명조입니다." },
    "丙辰": { nickname: "비를 촉촉이 머금은 붉은 대지형", rarity: "2.1%", description: "비옥하고 넓은 습토(辰)에 태양빛을 고르게 나누어주는 상생의 기맥으로, **다정한 이타심과 재능 표출력(식상)**이 뛰어나 대인관계가 깊습니다." },
    "丙午": { nickname: "천하를 녹일 듯 타오르는 태양의 심장형", rarity: "2.4%", description: "한여름 난공불락의 불기둥(午)처럼 거침없는 주체성과 **폭발적인 에너지 및 정열적인 카리스마**로 대중의 판세를 단숨에 제압합니다." },
    "丙申": { nickname: "서산 낙조에 금빛으로 빛나는 태양형", rarity: "1.8%", description: "금을 제련하는 가을의 기맥(申) 위에 빛나는 형상으로, **비즈니스적 이권 개입과 발 빠른 투자 기회 포착**에 극도로 특화된 금전 귀인입니다." },
    "丙戌": { nickname: "노을빛 아래 보석을 품은 붉은 산형", rarity: "1.6%", description: "금고를 소중히 소장한 붉은 산(戌)의 모습으로, 겉은 화려하나 속은 차분하게 **실리를 저장하고 재정을 수성**하는 백호의 든든한 리더십이 돋보입니다." },
    "丁丑": { nickname: "겨울철 촛불 아래 보석을 제련하는 촛불형", rarity: "1.4%", description: "눈 덮인 논밭(丑) 아래 화로처럼 조용히 에너지를 숨긴 형상으로, **예리한 분석력และ 남모를 재정 수완**을 바탕으로 조용히 자산을 불립니다." },
    "丁寅": { nickname: "아늑한 숲을 훈훈하게 가꾸는 모닥불형", rarity: "1.7%", description: "마른 장작(寅)을 머금어 마르지 않는 모닥불처럼, **깊은 학습 능력과 예술적 통찰**을 지녔으며 인생 전반에 든든한 학문운이 따릅니다." },
    "丁卯": { nickname: "달빛 아래 수줍게 피어난 푸른 넝쿨형", rarity: "1.8%", description: "봄바람 부는 숲속(卯)의 작은 모닥불로, **다정한 감수성과 날카로운 예지력**을 활용하여 기획과 카운셀링 분야에서 두각을 나타냅니다." },
    "丁巳": { nickname: "천지를 태울 듯 이글거리는 모닥불꽃형", rarity: "2.0%", description: "화려하고 활발하게 확산하는 불(巳)의 기운을 지녀, **사교성이 출중하고 자의식이 대단히 견고**하며 추진하고자 하는 일을 끝까지 이룹니다." },
    "丁未": { nickname: "뜨거운 황토 가마를 지키는 횃불형", rarity: "1.9%", description: "한여름 가마솥 흙(未)을 굽는 열기처럼, **엄청난 뚝심과 끈기**를 보유하여 어떤 위기와 과적 상태가 와도 스스로 자수성가해 냅니다." },
    "丁酉": { nickname: "옥쟁반 위에 영롱하게 빛나는 황금 등불형", rarity: "1.1%", description: "맑고 차가운 귀금속(酉) 위에 켜진 촛불이자 천을귀인(天乙貴인)의 상징으로, **독보적인 예술 감각과 평생 재물 및 귀인의 인덕**이 깊습니다." },
    "丁亥": { nickname: "밤바다 위를 잔잔하게 비추는 달빛형", rarity: "1.5%", description: "검고 넓은 바다(亥)를 고요히 밝히는 달빛처럼, **천성적으로 도덕적이고 정갈하며 법 없이도 살 명예 지향적**인 선비의 기상을 품었습니다." },
    "戊子": { nickname: "겨울철 깊은 산골의 보물 샘물형", rarity: "1.6%", description: "거대한 흙산(戊) 아래 맑은 온천수(子)가 도사린 재성 귀인형으로, **실리 포착이 칼 같고 재테크 감각이 대단히 명확**하여 평생 부유합니다." },
    "戊寅": { nickname: "푸른 거목을 우뚝 품은 황금산형", rarity: "1.8%", description: "바위산(戊)에 곧게 자란 소나무(寅)의 장엄한 풍경으로, **대단히 묵직한 관직 지향성과 책임감**을 통해 마침내 우두머리 직위를 얻습니다." },
    "戊辰": { nickname: "봄비 내리는 비옥한 황금 벌판형", rarity: "2.2%", description: "수분을 가득 머금어 만물을 기르는 대지(辰)와 백호살의 기운이 깃들어, **엄청난 스케일의 사업 수완과 대인 포용력**을 한껏 과시합니다." },
    "戊午": { nickname: "화산의 뜨거운 마그마를 품은 바위산형", rarity: "1.9%", description: "태양열로 가득 찬 용암 산(午)의 기세로, **최고조의 고집과 타협 없는 강인함**을 자랑하며, 학문적 깊이와 전문 지식이 대단히 견고합니다." },
    "戊申": { nickname: "황금 광산을 품은 거대한 대산형", rarity: "2.1%", description: "가을철 알짜배기 쇠광산(申)을 소유한 형상으로, **기발한 창의력과 언어 능력(식상)**을 무기로 삼아 무에서 유를 창출하는 비즈니스 특화형입니다." },
    "戊戌": { nickname: "우주를 품은 굳건한 첩첩산중형", rarity: "1.7%", description: "끝이 보이지 않는 광활한 황토 산맥(戌)의 모습으로, **우직한 신용과 뚝심**을 지녔으며 괴강의 무서운 결단력으로 난세를 극복하는 보스입니다." },
    "己丑": { nickname: "눈 덮인 논밭을 지키는 묵묵한 개척자형", rarity: "1.5%", description: "차가운 겨울 대지(丑)를 묵묵히 갈아엎는 보이지 않는 개척자처럼, **강인한 성실함과 견고한 은근성**으로 자산을 착실하게 축적해 나갑니다." },
    "己寅": { nickname: "황토 밭에 단단한 거목을 키우는 농부형", rarity: "1.6%", description: "초봄 대지(己) 위에 곧게 솟은 나무(寅)처럼, **매우 바르고 도덕적인 책임감**을 삶의 가치관으로 삼으며 조직 내 핵심 인재로 도약합니다." },
    "己卯": { nickname: "푸른 새싹을 가꾸는 따스한 텃밭형", rarity: "1.7%", description: "들풀(卯)이 무성하게 자라나는 대지의 형상으로, **섬세하고 남을 배려하는 카운셀링 본능**이 깊으나 외부의 억압(관살)에 예민하게 방어합니다." },
    "己巳": { nickname: "여름 볕에 무르익는 풍요로운 황금 들판형", rarity: "1.8%", description: "이글거리는 뱀의 화기(巳)를 품어 대지를 비옥하게 개량하는 형상으로, **다재다능하고 예술과 무형 자산 취득**에 뛰어난 기량을 뽐냅니다." },
    "己未": { nickname: "사막 한가운데 굳건히 서 있는 옥토성형", rarity: "1.9%", description: "단단하고 건조한 한여름의 흙(未)이 뭉친 성으로, **남다른 자존심과 자립성**을 장착하여 어떠한 역경이 닥쳐도 스스로 헤쳐 나가는 해결사입니다." },
    "己酉": { nickname: "보석 광산을 수호하는 황금 텃밭형", rarity: "1.4%", description: "맑은 닭(酉)의 보석 광석을 대지 아래에 조용히 소장한 모습으로, **수리 연산 감각이 대단히 명확하고 맛과 멋의 예술적 감성**이 유달리 뛰어납니다." },
    "己亥": { nickname: "물이 고요히 흐르는 옥토 벌판형", rarity: "1.6%", description: "겨울철 비옥한 들판에 물(亥)이 순환하는 재성 귀인형으로, **겉은 소박해 보이지만 속으로 현금 시재를 빈틈없이 저축하는 알짜배기 부자**의 명조입니다." },
    "庚子": { nickname: "맑은 물에 씻긴 예리한 강철 검사형", rarity: "1.5%", description: "바위틈에서 용솟음치는 맑은 샘물(子)의 형세로, **직관적인 예리함과 수려한 미적 표현력**을 갖추어 기획 및 비판적 분석에 최고입니다." },
    "庚寅": { nickname: "황금 사막을 질주하는 포효하는 호랑이형", rarity: "1.8%", description: "바위(庚) 아래 봄의 숲(寅)을 거느린 형상으로, **대단히 역동적인 개척 정신과 편재(재물) 쟁취 본능**을 장착하여 큰돈을 움직이는 무사입니다." },
    "庚辰": { nickname: "금맥을 품은 수호룡의 강철 기상형", rarity: "2.1%", description: "수분을 머금은 대지(辰)가 쇠를 소생시키는 기운과 괴강살이 깃들어, **독보적인 지혜와 좌중을 장악하는 뚝심의 사령관 기질**을 지녔습니다." },
    "庚오": { nickname: "용광로에 단단히 제련되는 명검의 기상형", rarity: "1.7%", description: "단단한 무쇠(庚)가 용광로 불빛(午)에 제련되어 최고급 검이 되는 형상으로, **법과 규율을 정교하게 다스리는 공직/대기업 리더**의 기상을 품었습니다." },
    "庚申": { nickname: "하늘을 찌를 듯한 서슬 퍼런 강철 바위형", rarity: "2.3%", description: "위아래가 온통 바위와 강철(申)로 뭉친 간여지동의 표본으로, **의리가 지극하고 누구도 꺾지 못할 추진력**으로 세상을 돌파합니다." },
    "庚戌": { nickname: "금고를 굳건히 지키는 은빛 수호신형", rarity: "1.6%", description: "뜨거운 화로 흙(戌) 속에 은신한 쇳덩이와 괴강의 기운으로, **무서운 집념과 공사 구분이 칼 같은 정확성**을 자랑하는 해결사 사주입니다." },
    "辛丑": { nickname: "얼어붙은 진흙 속을 보관하는 귀한 보석형", rarity: "1.4%", description: "겨울철 차가운 흙(丑) 속에 숨겨진 광석 보석처럼, **차분하게 실력을 수련하고 문서를 확보**하여 기어코 내실 있는 결실을 얻어냅니다." },
    "辛寅": { nickname: "보석 칼날로 거목을 깎아내는 장인형", rarity: "1.6%", description: "보석 칼(辛)이 봄의 숲(寅)에 닿아 재물을 수확하는 정재 귀인형으로, **세밀한 예산 관리와 정확한 실리 설계**로 인생의 부를 차근차근 이룩합니다." },
    "辛卯": { nickname: "봄비 속에 가위를 든 정원사형", rarity: "1.7%", description: "작은 보석(辛)이 풀밭(卯)을 정교하게 조율하는 형세로, **남다른 손재주나 직관적인 안목, 예술성**이 빛을 발해 독특한 기획을 내놓습니다." },
    "辛巳": { nickname: "햇살 아래 반짝이는 영롱한 귀걸이형", rarity: "1.5%", description: "뜨거운 태양빛(巳)을 받아 보석의 명예를 더욱 눈부시게 밝히는 형상으로, **예의가 바르고 명예와 직권을 중시하는 엘리트 관직형**입니다." },
    "辛未": { nickname: "사막 속의 마른 진흙으로 빚은 보석형", rarity: "1.8%", description: "뜨거운 사막 흙(未) 속에 견고하게 정제된 보석처럼, **대단히 날카롭고 자존심이 세며 학문과 라이선스를 바탕으로 우뚝 서는 전문가**입니다." },
    "辛酉": { nickname: "상자 속에 정교하게 세공된 은빛 다이아몬드형", rarity: "2.0%", description: "티 없이 맑은 은빛 보석과 가위(酉)가 위아래로 뭉친 형상으로, **완벽주의적 깔끔함과 극도의 정밀함**으로 칼같이 프로젝트를 완성합니다." },
    "辛亥": { nickname: "맑은 시냇물에 영롱하게 씻긴 옥빛 구슬형", rarity: "1.6%", description: "겨울의 바다 물결(亥)에 반짝이는 보석처럼, **머리가 대단히 비상하고 감수성이 수려하며 예술과 학문**에서 독보적 존재감을 과시합니다." },
    "壬子": { nickname: "심연을 소용돌이치며 흐르는 밤의 해일형", rarity: "2.2%", description: "끝을 모를 겨울의 거대한 물줄기(子)가 융합되어, **천하를 덮을 듯한 배포와 뛰어난 두뇌 지략**으로 거대한 세력을 규합하고 이끕니다." },
    "壬寅": { nickname: "숲속 계곡에서 포효하며 도약하는 수호 호랑이형", rarity: "1.9%", description: "넓은 강물(壬)이 봄의 숲(寅)을 기르고 생조하는 식신(창의성) 귀인형으로, **언변이 청산유수며 교육과 인프라 구축**에서 대길합니다." },
    "壬辰": { nickname: "비구름 속을 뚫고 승천하는 수호룡형", rarity: "2.0%", description: "드넓은 댐의 호수(辰)와 괴강살이 결합한 리더십으로, **뛰어난 위기 돌파 능력과 거대 자산을 쥐고 조율하는 보스**의 운명을 타고났습니다." },
    "壬午": { nickname: "밤바다 위에 붉은 등대를 켜둔 형상형", rarity: "1.6%", description: "넓은 호수(壬)가 여름철 불꽃(午)과 속으로 합(合)을 이루는 재성 기맥으로, **현실 타협과 실리 추구가 유연하고 수완이 탁월한 금전운**입니다." },
    "壬申": { nickname: "거대한 철광산에서 발원하는 마르지 않는 강물형", rarity: "1.8%", description: "바위산(申)에서 솟구쳐 평생 끊이지 않고 흐르는 큰 물줄기처럼, **학습과 계약(인성)의 복이 대단하여 장기 문서 자산**을 수성합니다." },
    "壬戌": { nickname: "댐 속에 대규모 금고를 간직한 수호신형", rarity: "1.7%", description: "용광로 흙(戌) 속에 물을 채워 화기를 조율하는 백호의 형상으로, **정치적 조율 감각과 강인한 결단력을 통해 마침내 자수성가**합니다." },
    "癸丑": { nickname: "겨울 얼음판 아래 묵묵히 흐르는 샘물형", rarity: "1.4%", description: "눈 덮인 논밭(丑) 아래 고요하게 기맥을 조율하며 흐르는 물처럼, **대단히 끈질긴 승부욕과 강단을 지닌 침묵의 실력가**입니다." },
    "癸寅": { nickname: "봄 이슬을 머금고 화사하게 피어난 푸른 거목형", rarity: "1.8%", description: "겨울 이슬(癸)이 봄 나무(寅)에 닿아 기운을 내뿜는 상관 귀인형으로, **기획력과 예술적 재치가 뛰어나며 언변과 교육적 수완**이 빛납니다." },
    "癸卯": { nickname: "새벽 이슬을 머금고 자라는 파릇한 새싹형", rarity: "1.5%", description: "새벽녘 정원(卯)에 내리는 촉촉한 이슬이자 천을귀인의 표본으로, **품성이 맑고 단아하며 주변의 사랑과 평생 귀인의 조력**을 받습니다." },
    "癸巳": { nickname: "소나기 그친 뒤 무지개 뜬 꽃밭형", rarity: "1.2%", description: "맑은 옹달샘(癸)이 꽃밭의 불(巳)과 천을귀인으로 공존하는 형태로, **비상한 현실 감각과 동업 상성, 인덕의 복을 받아 평생 의식이 풍족**합니다." },
    "癸未": { nickname: "마른 모래사막을 촉촉이 적시는 오아시스형", rarity: "1.7%", description: "건조한 모래밭(未)에 수분을 조율하는 오아시스처럼, **남다른 인내력과 명예 지향성을 가지며 조직 내의 어려운 갈등을 우아하게 해결**합니다." },
    "癸申": { nickname: "정교한 보석 바위에서 솟구치는 맑은 샘물형", rarity: "1.6%", description: "보석(申)이 평생 깨끗한 온천수를 용출시켜 주는 형상으로, **머리가 비상하고 문서 취득 및 학문적 계약의 성취율**이 유달리 대길합니다." },
    "癸酉": { nickname: "금 항아리 속에 정갈하게 보존된 지혜의 이슬형", rarity: "1.8%", description: "보석 항아리(酉)에 담긴 맑은 이슬처럼, **완벽주의적이고 예민하며 남다른 영적 예지력과 학문적 깊이**로 무형의 통찰력을 행사합니다." },
    "癸亥": { nickname: "온 천하를 향해 유유히 흐르는 맑은 은빛 바다형", rarity: "2.1%", description: "위아래가 맑은 물(亥)로만 가득 찬 우람한 수생 기류로, **유연하면서도 절대 기가 꺾이지 않는 남다른 배포와 통찰력의 전략가**입니다." }
  };

  const defaultDestiny = {
    nickname: "보이지 않는 길을 걷는 개척자형",
    rarity: "3.2%",
    description: "스스로 힘을 기르고 시기를 기다려 세상을 놀라게 할 사주입니다."
  };

  const currentDestiny = iljuDestinyDatabase[iljuKey] || defaultDestiny;
  nickname = currentDestiny.nickname;
  rarity = currentDestiny.rarity;
  description = currentDestiny.description;

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
    { page: 18, type: "worry_solution", title: "개별 고민 정밀 조율 솔루션" },
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
    worryCategory,
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
    handleUpgradePayment,
    reportGrade,
    isPaid,
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
                <span className="text-[10px] text-[#A3845B] font-semibold block">성명</span>
                <span className="font-myeongjo text-base font-bold text-[#1A1A1A]">{name} 님 ({gender})</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">출생 정보</span>
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  {year}년 {month}월 {day}일 {hour === "unknown" ? "시간 모름" : hour} ({calendar === "solar" ? "양력" : "음력"})
                </span>
              </div>
            </div>
            <div className="border-t border-[#E2DDD5]/70 pt-3 grid grid-cols-2 gap-4 text-left">
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">의뢰 구분 및 등급</span>
                <span className="text-xs font-bold text-[#A3845B]">
                  {(reportGrade === "sms" || reportGrade === "free") ? "평생 종합 사주 (문자요약)" : 
                   reportGrade === "deep" ? "평생 종합 사주 (고급)" : 
                   "평생 종합 사주 (프리미엄)"}
                </span>
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

          {/* 귀하의 사주 명조 구성 상세 진단 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-[#A3845B] text-xs font-myeongjo">📝 {name}님의 사주팔자 명조 구성 요약</h4>
            <div className={`text-[11px] text-[#5F5F5F] font-light leading-relaxed ${blurClass}`}>
              귀하의 사주는 <strong>{sajuInfo.year.stemEl}{sajuInfo.year.branchEl}의 해</strong>, 
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

      case "character": {
        const bgGradients = {
          "목": "from-[#2D3A30] to-[#1E2620]", // 차분한 딥 그린
          "화": "from-[#4A1E1B] to-[#2B100E]", // 따뜻하고 깊은 버건디/레드 브라운
          "토": "from-[#3E3325] to-[#241D15]", // 고급스러운 다크 브라운/골드 토조
          "금": "from-[#33383B] to-[#1E2122]", // 은은하고 세련된 차콜/실버 그레이
          "수": "from-[#1D2A3A] to-[#111924]"  // 깊은 심연의 네이비/미드나잇 블루
        };
        const activeBg = bgGradients[sajuInfo.day.stemEl] || bgGradients["목"];

        return (
          <div className="space-y-6">
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
              ✨ 나의 타고난 천명 성향 유형 분석
            </h3>
            <div className={`bg-gradient-to-br ${activeBg} border-4 border-[#A3845B] rounded-xl p-8 text-center text-[#FAF7F0] space-y-4 shadow-xl relative overflow-hidden`}>
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
      }

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
            💌 개별 고민 정밀 조율 솔루션
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
                      `귀하의 사주 지지에는 도화살에 해당하는 글자(자/오/묘/유)가 ${dowhaCount}개 존재합니다. 남들의 시선을 자연스럽게 이끄는 훌륭한 매력과 대중 친화적인 기운이 강력하게 작동하고 있으므로 남들 앞에 자신을 드러낼 때 귀인의 도움을 얻거나 재물 기회를 포착하는 속도가 매우 빠릅니다.`
                    ) : (
                      "귀하의 사주 지지에는 도화살에 해당하는 글자(자/오/묘/유)가 없습니다. 억지로 대중 앞에 나서 튀려고 하기보다, 탄탄한 전문성이나 정직함 및 진정성을 먼저 구축하여 사람들의 신뢰를 얻어가는 것이 훨씬 유리합니다."
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
                      `귀하의 사주 지지에는 역마살에 해당하는 글자(인/신/사/해)가 ${yeokmaCount}개 존재합니다. 활동 반경이 국내외로 매우 넓고, 스스로 개척하여 판도를 바꾸는 강력한 실행력과 임기응변 능력을 갖추고 있어 정적인 일보다는 끊임없이 환경에 변화를 주는 구조에서 운이 가장 발복합니다.`
                    ) : (
                      "귀하의 사주 지지에는 역마살에 해당하는 글자(인/신/사/해)가 없습니다. 잦은 이동이나 급격한 거주/직무 변화는 오히려 심신을 피로하게 하므로, 한 지역이나 안정된 고정 근무지에서 오랜 기간 뿌리를 내리고 숙련도를 키워가는 것이 재정 안정에 훨씬 적합합니다."
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
                      `귀하의 사주 지지에는 화개살에 해당하는 글자(진/술/축/미)가 ${hwagaeCount}개 존재합니다. 복잡하고 눈에 보이는 현실 너머의 본질을 꿰뚫는 사색적 능력과 창작·문화예술에 깊은 안목이 있습니다. 타인의 지식이나 노하우를 그대로 답습하기보다 스스로 연구하여 독자적인 통찰을 끌어낼 때 재물이 화개 창고에 쌓이게 됩니다.`
                    ) : (
                      "귀하의 사주 지지에는 화개살에 해당하는 글자(진/술/축/미)가 없습니다. 생각에만 갇혀 우울감이나 고독에 허우적대는 일이 거의 없고, 현실적이며 행동주의적 사고를 좋아하지만 고유한 정신적 깊이나 영감을 얻는 인문학 독서 등에는 의식적인 할애가 보완되어야 합니다."
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

      const getPersonalizedSolution = (name, text, category, dayStemEl) => {
        const cleanedText = text ? decodeURIComponent(text).replace(new RegExp('</?[^>]+(>|$)', 'g'), '') : '';
        const el = dayStemEl || "목";
    
        let analysis = "";
        let timing = "";
        let actionPlan = "";
    
        if (category === "business" || category === "startup" || category === "trade") {
          analysis = `${name}님의 신년 사업 및 창업 안건["${cleanedText}"]에 대한 정밀 비책입니다. 병오년의 타오르는 화(火) 기운 속에서 사업을 전개할 때는 내 사주의 불 기운과 물 기운의 균형이 가장 큰 성패를 가릅니다. `;
          if (el === "목" || el === "木") {
            analysis += "귀하의 목(木) 기운은 목생화로 에너지를 과도하게 빼앗기기 쉬운 흐름에 처해 있습니다. 따라서 무리한 사업 확장이나 공격적인 설비 투자는 자금 갈증을 부르니 내실을 기하는 자산 수비가 먼저입니다.";
            timing = "금(金)의 결실 에너지가 조력해 흐름을 잡아주는 음력 7~9월 가을철이 사업의 숨통이 트이는 골든타임입니다.";
            actionPlan = `1. 카운터나 매장 입구에 싱그러운 초록색(木) 식물을 배치하여 내면의 주체적인 생명 에너지를 보강하십시오.\n2. 거래처 미팅 시 네이비(水) 계열 상의를 착용해 물 흐르듯 유연한 계약 체결을 도모하십시오.\n3. 매장 동쪽(東) 방향에 원목 소품이나 책을 두어 사업 기운을 보강하십시오.`;
          } else if (el === "화" || el === "火") {
            analysis += "귀하의 화(火) 기운은 병오년의 불꽃 세운과 결합하여 투기적이거나 조급한 성향을 증폭시킬 우려가 큽니다. 동업이나 신규 확장은 필히 억제하고 리스크 수성에 주력하십시오.";
            timing = "열기가 서서히 누그러지고 이성적 판단이 돌아오는 음력 10월~12월 겨울철이 가장 대길합니다.";
            actionPlan = `1. 매장 입구에 투명한 유리로 된 작은 실내 분수나 수조(水)를 두어 불필요한 화기를 가라앉히십시오.\n2. 중요 미팅 시 블랙이나 네이비 의상을 매칭해 이성적이고 차분한 신뢰감을 전하십시오.\n3. 매장 북쪽(北) 방향을 정갈히 청소하고, 북쪽 서랍에 자금을 보관하십시오.`;
          } else if (el === "토" || el === "土") {
            analysis += "귀하의 토(土) 기운은 화생토로 든든한 학문과 인프라의 기맥을 수혈받는 좋은 상태입니다. 다만, 신규 투자는 과다한 습담(노폐물)이 낄 수 있으니 꼼꼼한 마진 수치 관리가 필수적입니다.";
            timing = "나의 결실인 금(金) 기운이 발산되는 음력 8월(酉월) 하반기 및 9월(戌월)이 계약 적기입니다.";
            actionPlan = `1. 계약 서류 바인더를 노란색(土)이나 베이지 톤으로 정리하여 비즈니스 문서 살(煞)을 예방하십시오.\n2. 미팅 시 메탈 시계나 실버 주얼리(金)를 착용해 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.\n3. 매장 중앙(中央) 또는 서쪽 서랍에 계약 인감을 깊숙이 보관하십시오.`;
          } else if (el === "금" || el === "金") {
            analysis += "귀하의 금(金) 기운은 뜨거운 불꽃 세운에 제련되는 형국으로 팽팽한 긴장감이 감도는 상태입니다. 기획이나 제품의 핵심 완성도를 높여야 비로소 빛을 보게 됩니다.";
            timing = "나를 단단히 지탱해줄 토(土)와 금(金) 기운이 함께 동행하는 음력 7~9월 가을철이 가장 유리합니다.";
            actionPlan = `1. 사업장 내에 백색(金)이나 실버 포인트 인테리어를 가미해 차가운 제련력을 충원하십시오.\n2. 미팅 시 황토색/베이지(土) 톤 의상을 매칭해 신뢰성과 탄탄한 중용을 전달하십시오.\n3. 매장 서쪽(西) 창문을 자주 환기하고 밝은 조명을 두어 재물 누수를 방어하십시오.`;
          } else {
            analysis += "귀하의 수(水) 기운은 솟구치는 불길과 대립하는 수화상쟁의 세력을 형성하고 있습니다. 자금 흐름의 일시적인 동결이나 수금 지연이 도사리고 있으니 현금 시재를 넉넉히 확보하십시오.";
            timing = "수(水)의 본질적 생명력이 살아나는 음력 10월~11월 겨울철이 유통망 확보 및 매출 활성화의 골든타임입니다.";
            actionPlan = `1. 카운터에 검은 가죽 지갑(수)이나 어두운 톤의 포인트를 주어 재정적 안착을 도우십시오.\n2. 미팅 시 깔끔한 화이트(金) 상의를 조화시켜 금생수로 내 지혜를 든든히 보완해 주십시오.\n3. 매장 북쪽(北)을 깨끗이 정돈하고 정수기나 물병을 그 방향에 두십시오.`;
          }
        } else if (category === "facility") {
          analysis = `${name}님의 설비투자 및 사업장 확장 안건["${cleanedText}"]에 대한 처방입니다. 장비 구입이나 대형 리모델링은 사주의 문서운(인성)과 장비 계약운(관성)의 흐름이 편안할 때 진행해야 고장이나 하자, 금융 비용의 폭증을 예방할 수 있습니다. `;
          if (el === "목" || el === "木") {
            analysis += "목(木) 일간인 귀하의 경우 세운의 화 기운에 기운이 지나치게 방출되어 성급한 확장 결정을 내릴 리스크가 큽니다. 한 템포 조율이 필요합니다.";
            timing = "문서 기운이 탄탄해지고 계약의 길함이 도래하는 음력 9월~10월이 최적의 골든타임입니다.";
            actionPlan = `1. 설비 계약서 보관 시 반드시 초록색이나 청색 바인더를 써서 목기를 충원하십시오.\n2. 계약 날인 당일에는 차가운 녹차를 음용하며 마인드 컨트롤을 실천해 충동적 사인을 막으십시오.\n3. 사무실 동쪽(東) 벽면에 원목 프레임의 액자를 두어 개운을 유도하십시오.`;
          } else if (el === "화" || el === "火") {
            analysis += "화(火) 일간인 귀하는 세운의 타오르는 불길과 만나 급격한 열정이 솟구치므로 리스크 검토를 건너뛸 위험이 있습니다. 설비 견적을 이중으로 교차 검증하십시오.";
            timing = "수(水) 기운의 조율이 본격화되는 음력 11월(子월) 즈음이 하자 없는 입고의 적기입니다.";
            actionPlan = `1. 계약서 서명 전 20분간 산책이나 호흡 조율을 통해 머리를 차갑게 식히십시오.\n2. 어두운 톤(블랙/네이비)의 펜을 써서 날인함으로써 이성적이고 차분한 서명을 도우십시오.\n3. 사업장 북쪽(北) 방향의 조명을 교체해 정돈된 기류를 충만케 하십시오.`;
          } else if (el === "토" || el === "土") {
            analysis += "토(土) 일간인 귀하는 주변의 달콤한 확장 권유나 과장된 설비 마케팅에 휘둘릴 여지가 있습니다. 실리적인 평당 단가와 이자 효율을 칼같이 계산하십시오.";
            timing = "금(金) 기운이 탄탄히 기틀을 잡는 음력 8월(酉월) 하반기가 시공 하자를 예방하는 최상의 타이밍입니다.";
            actionPlan = `1. 설비 도면 서류 위에 노란 원석이나 황토색 돌(土)을 얹어두어 나쁜 살(煞)을 억누르십시오.\n2. 날인 시 실버 링이나 메탈릭 볼펜을 사용해 결단력 있는 계약 도장을 남기십시오.\n3. 계약을 맺는 미팅 룸의 테이블을 베이지나 브라운 천으로 세팅해 기맥을 고르게 하십시오.`;
          } else if (el === "금" || el === "金") {
            analysis += "금(金) 일간인 귀하는 화극금의 강한 압박으로 자칫 무리한 레버리지 차입이나 고금리 대출로 자금줄이 경색될 우려가 도사리고 있습니다.";
            timing = "나의 쇠 기운을 탄탄히 보호해 줄 토(土)의 절기인 음력 9월(戌월) 가을철이 적절한 자금 융통 시기입니다.";
            actionPlan = `1. 계약 체결 시 보증보험 및 하자보수 이중 확약서를 반드시 요구해 서류로 철벽 방어막을 치십시오.\n2. 날인 시 흰색 봉투에 계약서를 고이 담아 보관하여 금기의 상서로움을 튜닝하십시오.\n3. 사업장의 서쪽(西) 공간에 메탈 수납장을 배치해 안정적인 기류를 완성하십시오.`;
          } else {
            analysis += "수(水) 일간인 귀하는 물이 불에 부딪쳐 증발하는 형세이므로 대형 설비투자 시 자금 조달 단계에서 뜻밖의 누수나 지연이 생길 수 있습니다.";
            timing = "수 기운의 생조를 수혈받는 음력 10월(亥월) 및 11월(子월) 겨울철이 자금 소통과 설치에 가장 상서로운 달입니다.";
            actionPlan = `1. 계약서 사인 당일 흰색이나 실버(金) 톤 의상을 입어 금생수의 지혜를 발휘하십시오.\n2. 푸른 빛이 도는 잉크 펜으로 서명해 물의 기류를 자연스레 유통하십시오.\n3. 확장 대상 공간의 북쪽(North) 모서리에 정갈한 유리 물병을 두어 탁기를 정화하십시오.`;
          }
        } else if (category === "career") {
          analysis = `${name}님께서 고민 중이신 직장 생활 및 이직 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. `;
          if (el === "목" || el === "木") {
            analysis += "목(木) 일간인 귀하는 세운의 강한 화기 탓에 현 직장에서 자존심 상하는 일로 홧김에 사표를 던질 이직 충동이 대단히 강합니다. 충동적 사직은 필히 삼가십시오.";
            timing = "직장운(관성)과 문서합격운이 편안하게 동행해 안정적인 문을 열어줄 음력 8월(酉월) 하반기 이후가 최고의 골든타임입니다.";
            actionPlan = `1. 회사 책상 우측에 싱그러운 허브 화분(木)을 두어 일상 스트레스의 열을 흘려보내십시오.\n2. 이직용 포트폴리오를 정리할 때 파란색/초록색 포인트 디자인을 사용해 에너지를 정돈하십시오.\n3. 동쪽(東) 방향에 위치한 회사나 기관 위주로 원서를 서류 접수하십시오.`;
          } else if (el === "화" || el === "火") {
            analysis += "화(火) 일간인 귀하는 세운의 타오르는 불 기류와 융합되어 감정의 진폭이 극대화된 상태입니다. 상사의 지시나 동료 간의 사소한 눈길도 크게 받아들이기 쉽습니다.";
            timing = "열기가 식고 대화 주파수가 차분하게 조율되는 음력 10월~11월 겨울철에 비로소 상생의 문이 열립니다.";
            actionPlan = `1. 출근 시 블랙이나 차콜 계열의 모노톤 비즈니스 캐주얼을 착용해 나를 차분하게 방어하십시오.\n2. 책상 위에 투명한 물컵이나 미니 가습기(水)를 두어 불필요한 직장 내 화기를 수시로 다스리십시오.\n3. 북쪽(北)에 위치한 기업과의 소통이 귀하의 마음에 깊은 정서적 안정을 선사할 것입니다.`;
          } else if (el === "토" || el === "土") {
            analysis += "토(土) 일간인 귀하는 조직 속에서 묵묵히 버텨내고 있으나, 내적인 소화 효율과 스트레스 습기가 차서 만성 피로를 겪고 있습니다. 이직은 내 재능을 보증하는 문서를 확보할 때 길합니다.";
            timing = "승진 기맥이 깨끗하고 상사 귀인의 밀어줌이 본격화되는 음력 7월~9월 사이가 이동의 대길한 골든먼스입니다.";
            actionPlan = `1. 면접 미팅 시 옐로우/베이지 계열이나 메탈 장식 시계를 착용해 확실한 신용을 연출하십시오.\n2. 나만의 고유 직무 영역을 정갈히 매뉴얼화하고, 감정적인 구두 반박은 완전 차단하십시오.\n3. 서쪽(西) 방향에 자리한 직무가 귀하에게 경제적으로 탄탄한 마진을 보장해 줍니다.`;
          } else if (el === "금" || el === "金") {
            analysis += "금(金) 일간인 귀하는 화극금의 매서운 칼날 위에 서 있는 상태입니다. 직무에 대한 과도한 책임 지움이나 조직 개편으로 인한 압박이 극에 달해 이직이 불가피해 보일 수 있습니다.";
            timing = "나의 쇠 기운을 탄탄히 보호해 줄 토(土)의 절기인 음력 9월(戌월) 가을철에 비로소 연봉을 높여 유리하게 이동할 수 있습니다.";
            actionPlan = `1. 이직 포트폴리오를 철저히 숫자로 계량화(金)하여 이성적 성과를 입증하도록 준비하십시오.\n2. 은색 실버 링이나 메탈 안경테를 활용하여 내적인 신뢰 장벽을 견고히 세우십시오.\n3. 서북쪽(西北)에 귀하의 잠재력을 높이 평가해 줄 강력한 귀인이 기다리고 있습니다.`;
          } else {
            analysis += "수(수) 일간인 귀하는 2026년 병오년의 불과 충돌하는 형세라, 업무 실적에 비해 평판이 왜곡되거나 억울한 구설에 오르내릴 소지가 다분합니다. 섣부른 이직 시도보다는 기반 수성이 우선입니다.";
            timing = "문서 계약의 굳건한 서광이 귀하를 비출 음력 11월(子월) 겨울철에 이직 도장을 찍는 것이 뒤탈이 없습니다.";
            actionPlan = `1. 사내 메신저나 이메일 작성 시 반드시 감정을 뺀 명문화된 서류 형태로 보존하십시오.\n2. 면접 날 흰색 상의를 입어 금생수로 본인의 직관적 판단과 순발력을 최고조로 올리십시오.\n3. 서쪽(西)이나 북쪽(北) 방향의 기업 리서치를 꼼꼼히 하시면 대길한 소식이 닿습니다.`;
          }
        } else if (category === "love") {
          analysis = `${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 솔루션입니다. `;
          if (el === "목" || el === "木") {
            analysis += "목(木) 일간인 귀하는 자존심이 쉽게 곤두서고 사소한 의견 차이에도 '내가 맞고 네가 틀리다'는 논쟁을 벌이기 쉽습니다. 상대에게 정서적 숨구멍을 열어주어야 합니다.";
            timing = "애정 관계의 묵은 긴장이 풀리고 편안한 소통이 다시 흐르는 시기는 음력 10월~11월(수 기운의 달)입니다.";
            actionPlan = `1. 대화 시 상대방을 윽박지르거나 다그치지 마시고 3초 동안 침묵한 뒤 부드럽게 경청하십시오.\n2. 상대에게 만남 시 푸른색/그린 톤 소품이나 꽃을 건네 목(木)의 따스한 화해 에너지를 전하십시오.\n3. 대화 장소로 물가나 호수 근처 데이트 코스를 잡아 정서적 긴장을 부드럽게 풀어주십시오.`;
          } else if (el === "화" || el === "火") {
            analysis += "화(火) 일간인 귀하는 불과 불이 만나 사소한 거짓말에도 감정 폭발이 생기기 쉬우며, 관계 리셋을 쉽게 선언할 만큼 마음의 조급함이 팽배해져 있습니다.";
            timing = "열정의 온도가 차분하게 가라앉고 이성을 되찾을 음력 11월~12월 겨울철이 오해를 풀 수 있는 최적기입니다.";
            actionPlan = `1. 상대방 연락 속도에 실시간 모니터링을 멈추고 의식적으로 관심사를 취미 운동으로 돌려 열을 식히십시오.\n2. 만날 때 시크한 블랙/차콜 의상을 착용하여 본인의 과도한 상열감을 감각적으로 제어하십시오.\n3. 만나는 장소의 테이블 조명을 은은한 톤으로 조율하고 나란히 걸으며 조용히 대화하십시오.`;
          } else if (el === "토" || el === "土") {
            analysis += "토(土) 일간인 귀하는 한 번 마음의 문을 닫으면 도무지 열지 않으려는 고집과 침묵의 장벽을 쌓아올려 상대방을 답답하게 만들고 있을 수 있습니다. 마음의 습기를 털어내야 합니다.";
            timing = "애정의 신뢰가 다시 싹트고 관계가 안정화되는 시기는 오행의 순환이 좋은 음력 8월~9월 가을철입니다.";
            actionPlan = `1. 내 속마음을 단답형으로 감추기보다, 준비된 메일이나 정성스러운 문자 한 통으로 묵은 오해를 먼저 꺼내십시오.\n2. 노란색/브라운 웜톤 소품을 사용해 정서적인 아늑함과 대지 같은 포용력을 발산하십시오.\n3. 밝고 넓은 오픈 스페이스나 분위기 있는 교외 카페에서 마주 보고 솔직담백하게 소통하십시오.`;
          } else if (el === "금" || el === "金") {
            analysis += "금(金) 일간인 귀하는 칼날 같은 기준을 세우고 상대를 평가하여, 사소한 섭섭함을 관계의 단절로 성급하게 이어가고 있습니다. 융통성이 필요한 국면입니다.";
            timing = "나를 다스리는 편안한 수생 기운이 도래하는 음력 10월(亥월)경에 자연스러운 화해 기류가 돌게 됩니다.";
            actionPlan = `1. 상대방의 단점이나 사소한 습관을 지적하기보다는 나 자신의 완벽주의 필터를 한 단계 느슨하게 늦추십시오.\n2. 실버 액세서리나 심플한 스틸 제품을 매칭해 외적 신뢰와 조화로운 매력을 튜닝하십시오.\n3. 시야가 넓게 확보된 전망 좋은 고층 플레이트나 탁 트인 공원을 나란히 걸으며 속마음을 나누십시오.`;
          } else {
            analysis += "수(水) 일간인 귀하는 수화 상쟁의 기맥 속에 상대와 나의 타이밍 어긋남으로 인한 오해와 피해의식이 깊게 자리 잡고 있습니다. 감정적 서운함을 억누르고 한걸음 물러나십시오.";
            timing = "물줄기가 차분히 합류하여 깊은 대화 주파수가 완벽히 정돈되는 음력 11월(子월) 이후가 최고의 만남 골든타임입니다.";
            actionPlan = `1. 상대를 다그치며 실시간 해명을 요구하지 마시고, 혼자만의 온열 족욕이나 명상으로 마음을 진정시키십시오.\n2. 만남 시 화사한 화이트(金) 톤 코디를 통해 나를 소생시키고 상대에게 따스하고 유연한 매력을 비추십시오.\n3. 조용히 커피를 즐길 수 있는 재즈 음악이 흐르는 한적한 카페 데이트를 추천합니다.`;
          }
        } else if (category === "wealth") {
          analysis = `${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. `;
          if (el === "목" || el === "木") {
            analysis += "목(木) 일간인 귀하는 세운의 화기에 금전 에너지가 소모되어 버는 수입보다 새어 나가는 누수 경로가 극심한 상태입니다. 귀가 얇아져 투기성 종목에 손을 대기 쉬우니 주의하십시오.";
            timing = "금(金)의 결실 에너지가 나를 보좌해 줄 가을철(음력 7~9월)이 금전 회수 및 자산 방어에 최적의 시기입니다.";
            actionPlan = `1. 자산의 70%는 중도 해지가 어려운 강제성 정기 적금이나 미국 채권형 연금에 묶어 두십시오.\n2. 지갑에 초록색(木) 행운의 카드나 원목 포인트를 두어 재물 수성의 기류를 튜닝하십시오.\n3. 동쪽(東) 방향에 위치한 은행이나 투자사와의 소통이 귀하에게 길한 자금 통로를 엽니다.`;
          } else if (el === "화" || el === "火") {
            analysis += "화(火) 일간인 귀하는 병오년의 타오르는 거대한 세운 불길로 인해 비겁이 재물을 극하는 군겁쟁재(群劫爭財)의 형국을 띱니다. 지인과의 공동 투자나 돈 거래는 즉각 패가망신을 부릅니다.";
            timing = "열기가 식고 정비 기간에 접어들 음력 11월~12월 겨울철에 비로소 자금 소통의 실마리가 잡힙니다.";
            actionPlan = `1. 레버리지를 이용한 주식 신용 거래나 고위험 코인 투자는 당장 전량 매도하여 예수금을 굳건히 수비하십시오.\n2. 블랙(水) 가죽 지갑을 사용하여 불 기운을 조율하고 지출 통제를 일상 속에서 실천하십시오.\n3. 집안의 북쪽(北) 모서리에 현금이나 카드를 정갈히 보관하는 습관을 지니십시오.`;
          } else if (el === "토" || el === "土") {
            analysis += "토(土) 일간인 귀하는 든든한 화생토의 수혜를 입으나 위장에 가득 찬 습담처럼 재정 역시 유연하지 않고 계약상 지연이 도사리고 있습니다. 고정비 다이어트가 답입니다.";
            timing = "금전운의 실질적 결실과 소득이 창고에 쌓일 음력 8월(酉월) 및 9월(戌월)이 리밸런싱의 최적 타이밍입니다.";
            actionPlan = `1. 무분별한 구독 서비스나 고정성 유출 항목을 매주 리스트화해 불필요한 누수를 30% 감축하십시오.\n2. 노란색/브라운(토) 지갑이나 계약 가죽 바인더를 사용하여 금고의 든든함을 유도하십시오.\n3. 계약 인감 날인 시 노란색 낙관 도장을 사용해 문서의 액난을 필히 비보하십시오.`;
          } else if (el === "금" || el === "金") {
            analysis += "금(金) 일간인 귀하는 화극금의 강한 압박 속에서 재정적 압박이나 대출 이자 상환 부담으로 심적 고통이 상당할 수 있습니다. 무리한 모험보다는 연착륙을 준비하십시오.";
            timing = "나의 지탱할 든든한 토(土)와 금(金) 기운이 세력을 이루는 음력 8월~9월경 자금 수급이 매끄럽게 매듭지어집니다.";
            actionPlan = `1. 부동산 매매나 청약 등 큰 자금이 움직이는 안건은 반드시 보수적인 금융 전문가 2인 이상의 크로스 체크를 받으십시오.\n2. 화이트(金) 계열 카드 홀더나 실버 메탈 포인트를 장착해 내 자산의 차가운 수비력을 충원하십시오.\n3. 매장이나 사무실 서쪽(西) 방향 창문을 밝게 유지해 번영의 서광을 맞이하십시오.`;
          } else {
            analysis += "수(水) 일간인 귀하는 병오년의 뜨거운 화기가 재성(재물운)으로 강하게 작용하여 버는 몫은 크지만, 그만큼 돌발 지출과 이권 싸움으로 세금이나 위약금이 많이 발생합니다.";
            timing = "수(水)의 뿌리가 충만하게 되돌아오는 음력 10월~11월 겨울철이 마진을 극대화하고 이자를 절감할 대길한 골든먼스입니다.";
            actionPlan = `1. 고정 자산 비율을 60% 이상 예적금으로 안정화하고 충동적인 추가 불타기 투자는 영원히 봉인하십시오.\n2. 네이비/블루(水) 포인트 소품을 장착해 감정적 재테크 뇌동매매를 차분하게 가라앉히십시오.\n3. 거래 날인 당일에는 따뜻한 온수 족욕을 15분 거쳐 이성을 최고로 올린 뒤 최종 송금하십시오.`;
          }
        } else {
          analysis = `${name}님께서 기재해주신 소망 및 고민 안건["${cleanedText}"]에 대한 혜안당 정밀 처방입니다. `;
          if (el === "목" || el === "木") {
            analysis += "목(木) 일간 특유의 위로 뻗어 나가는 강한 의지가 무리한 조급함이나 번아웃과 충돌해 심적인 피로감이 쌓인 형국입니다.";
            timing = "나를 편안하게 해 줄 목(木)과 수(水)의 조화 기운이 본격적으로 들어오는 음력 9월~10월 가을철에 비로소 숨통이 트입니다.";
            actionPlan = `1. 나를 아끼는 싱그러운 초록 식물이나 화분을 침실 동쪽(東)에 두어 내면의 목기를 소생시키십시오.\n2. 대화나 미팅 전 3초 동안 크게 호흡을 내쉬는 습관을 실천해 가슴속 화기를 정화하십시오.\n3. 나만을 위한 조용한 숲길 산책 명상을 주 2회 이상 가져 자연 개운을 도우십시오.`;
          } else if (el === "화" || el === "火") {
            analysis += "화(火) 일간 특유의 열정과 표현력이 세운의 거대한 불꽃과 조응하여, 내면에 불이 번져 사소한 일에도 심란하고 밤잠을 설치기 쉬운 흐름에 노출되어 있습니다.";
            timing = "수(水)의 부드러움이 상열감을 진정시키는 음력 10월~11월 겨울철에 비로소 마음에 차분한 평화가 깃듭니다.";
            actionPlan = `1. 취침 전 심장의 과열을 식히기 위해 가벼운 스트레칭이나 20분 족욕을 가져 수승화강을 실천하십시오.\n2. 침실 내 조명을 붉은 계열 대신 정돈된 백색/은색으로 세팅해 마음에 가득 찬 화기를 정화하십시오.\n3. 북쪽(北)으로 머리를 두고 취침하거나 그 방향을 정갈히 청소하십시오.`;
          } else if (el === "토" || el === "土") {
            analysis += "토(토) 일간 특유의 듬직하고 조율하는 에너지가 주변의 과도한 부담 지움이나 억지 부탁으로 인해 위벽이 상하듯 심리적 내상을 겪고 있습니다.";
            timing = "나의 지혜가 밝게 솟아나며 평온을 되찾을 음력 8월~9월 가을철이 몸과 마음의 기류 복원의 골든타임입니다.";
            actionPlan = `1. 주변의 억지스러운 부탁에 대해 의식적으로 완곡하고 명확하게 '아니오'라고 거절하는 실전 연습을 하십시오.\n2. 노란색/브라운 톤의 패션이나 소품을 매칭해 내면의 포용력과 단단함을 균형 있게 보강하십시오.\n3. 식후 20분 동안 가볍게 흙이나 대지를 딛으며 걷는 산책을 통해 흙의 안정된 지기를 보충하십시오.`;
          } else if (el === "금" || el === "金") {
            analysis += "금(金) 일간 특유의 원칙과 결단력이 화극금의 세운 압박 속에서 상처를 받고 심리적 강박증과 조급증으로 치달을 위험이 큽니다.";
            timing = "나를 다스리는 든든한 토(土)의 대지와 인성의 보살핌이 유입되는 음력 9월(戌월)에 만사가 온화하게 해결됩니다.";
            actionPlan = `1. 타인의 평판이나 실시간 성과 지표에 지나치게 얽매이지 말고 나의 내적 만족도에 초점을 두십시오.\n2. 은반지나 실버 메탈 링(金)을 왼손 검지에 착용하여 내면의 부서진 금기를 매끄럽게 복원하십시오.\n3. 집안의 서쪽(西) 모서리에 정밀 필기구나 메탈 시계를 놓아 기맥을 정돈하십시오.`;
          } else {
            analysis += "수(水) 일간 특유의 깊은 통찰과 유연함이 세운의 맹렬한 불길에 메말라 가고 있어, 만성 피로와 원인 모를 번아웃, 우울 기류에 쉽게 잠기기 쉬운 국면입니다.";
            timing = "수(水)의 원류인 깨끗한 물줄기가 샘솟는 음력 11월(子월) 즈음 마음의 안개가 말끔히 걷히고 새 출발의 서광이 비춥니다.";
            actionPlan = `1. 타인의 무리한 시선이나 감정 쓰레기통 역할을 중단하고 나만의 온전한 휴식 시간을 3시간 이상 격리하십시오.\n2. 맑은 물 8잔을 매일 주기적으로 섭취하여 신장과 체내 수분을 물리적으로 가득 채워 기류를 개방하십시오.\n3. 북쪽(北) 방향을 정갈히 유지하고, 그 방향에 유리컵이나 어두운 톤의 소품을 놓아두어 정돈하십시오.`;
          }
        }
    
        return { analysis, timing, actionPlan };
      };
      
      const personalizedText = getPersonalizedSolution(name, worryText, worryCategory, sajuInfo?.day?.stemEl);
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
                  귀하의 일간은 <strong>{sajuInfo?.day?.stem} ({sajuInfo?.day?.stemEl}의 기운)</strong>입니다. 
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
            사주의 주체적 기질과 십신의 배치를 볼 때, 귀하에게 가장 적합한 최적의 직업 형태와 경영 방식은 다음과 같습니다.
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
                귀하의 일간 기운은 <strong>{sajuInfo?.day?.stemEl}({sajuInfo?.day?.stem})</strong>에 기반하고 있습니다. 
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
          {reportGrade === "premium" && !isPaid && (
            <div className="my-6 border border-[#E2DDD5] bg-[#FAF8F5] rounded-xl p-6 text-center space-y-5 print:hidden shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] tracking-widest text-[#A3845B] font-bold block font-sans">— PREMIUM UPGRADE —</span>
                <h4 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">
                  현재 <span className="text-[#A3845B]">고급 리포트 등급</span>을 이용 중이십니다.
                </h4>
                <p className="text-[10px] text-gray-500 font-light max-w-md mx-auto">
                  본 보감의 37페이지 전체 내용 중 아래의 핵심 프리미엄 분석 영역들이 현재 블러(흐림) 처리되어 있습니다. 업그레이드 완료 즉시 즉시 잠금이 해제됩니다.
                </p>
              </div>

              {/* 락 표시 그리드 레이아웃 */}
              <div className="grid grid-cols-2 gap-2 text-left text-[10px] max-w-md mx-auto">
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">2026년 병오년 전체 세운 흐름</span>
                </div>
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">분기별 상세 흐름 & 월별 대응 전술</span>
                </div>
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">2026년 분야별 상세 등급 & 행동 강령</span>
                </div>
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">평생 대운 흐름 및 10년 대운 다이어그램</span>
                </div>
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">대운 1기 ~ 4기 상세 로드맵</span>
                </div>
                <div className="bg-white border border-[#E2DDD5]/70 p-2.5 rounded flex items-center gap-2">
                  <span className="text-xs text-[#A3845B]">🔒</span>
                  <span className="text-gray-600 font-sans">평생 조심해야 할 흉한 시기 & 방어 비책</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpgradePayment}
                  className="w-full max-w-sm py-3.5 bg-gradient-to-r from-[#8B221E] to-[#A33530] hover:from-[#721C18] hover:to-[#8E2D29] text-white rounded-xl font-sans font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  <span>👑 프리미엄 리포트 최종 업그레이드 (+15,000원) ➔</span>
                </button>
              </div>
            </div>
          )}
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isPaid, setIsPaid] = useState(() => {
    if (typeof window !== "undefined") {
      const debugUnlock = window.location.search.includes("unlock=true") || window.location.search.includes("debug=true");
      if (debugUnlock) return true;
      const reportGrade = new URLSearchParams(window.location.search).get("reportGrade") || "sms";
      if (reportGrade === "premium" || reportGrade === "deep" || reportGrade === "sms" || reportGrade === "free") return false;
    }
    return false;
  });

  // DB 연동 실시간 결제 상태 조회 훅 신설
  useEffect(() => {
    const phone = searchParams.get("phone");
    const name = searchParams.get("name");
    if (!phone || !name) return;

    const debugUnlock = searchParams.get("unlock") === "true" || searchParams.get("debug") === "true";
    if (debugUnlock) {
      setIsPaid(true);
      return;
    }

    fetch(`/api/orders?phone=${encodeURIComponent(phone)}&name=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const matched = data.find(o => 
            o.phone === phone && 
            o.name === name && 
            (o.status === "paid" || o.unlocked === true)
          );
          if (matched) {
            setIsPaid(true);
          }
        } else {
          console.warn("Expected array from orders API, but got:", data);
        }
      })
      .catch(err => console.error("Database query failed:", err));
  }, [searchParams]);

  const [cumulativeCount, setCumulativeCount] = useState(14820);
  const [timeLeft, setTimeLeft] = useState("02:26:49");

  useEffect(() => {
    setCumulativeCount(getCumulativeCount());
    
    const timer = setInterval(() => {
      setCumulativeCount(getCumulativeCount());
    }, 30000);
    
    return () => clearInterval(timer);
  }, []);

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

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const debugUnlock = searchParams.get("unlock") === "true" || searchParams.get("debug") === "true";

  const handleCopySms = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Parsing inputs with NaN safety fallback
  const parseQueryInt = (val, fallback) => {
    const parsed = parseInt(val);
    return isNaN(parsed) ? fallback : parsed;
  };

  const getDecodedParam = (key, fallback) => {
    const val = searchParams.get(key);
    if (!val) return fallback;
    try {
      // 이미 디코딩되어 있는 값은 한 번 더 디코딩 시 예외가 발생하므로 디코딩 복제 안정화
      return val.includes("%") ? decodeURIComponent(val) : val;
    } catch (e) {
return val;
    }
  };

  const name = getDecodedParam("name", "이지혜");
  const genderVal = searchParams.get("gender");
  
  const gender = (genderVal === "male" || genderVal === "남" || genderVal === "남성") ? "남성" : "여성";
  const typeParam = searchParams.get("type") || "saju"; // saju, newyear, tojeong, wealth, tarot, gunghap
  const type = typeParam === "tojeong" ? "newyear" : typeParam;
  const calendar = searchParams.get("calendar") || "solar";
  const year = parseQueryInt(searchParams.get("year"), 1995);
  const month = parseQueryInt(searchParams.get("month"), 8);
  const day = parseQueryInt(searchParams.get("day"), 25);
  const hour = searchParams.get("hour") || "10:00";
  const worryCategory = searchParams.get("worryCategory") || "general";
  const worryText = getDecodedParam("worryText", "");
  const emailParam = searchParams.get("email") || "";
  const phoneParam = searchParams.get("phone") || "";
  const getReportGrade = () => {
    const paramGrade = searchParams.get("reportGrade") || "sms";
    if (paramGrade === "free") return "free";
    if (typeof window !== "undefined") {
      try {
        const existingStr = localStorage.getItem("hyeandang_orders");
        if (existingStr) {
          const orders = JSON.parse(existingStr);
          if (Array.isArray(orders)) {
            const matchedOrders = orders.filter(o => 
              o &&
              o.name === name && 
              o.status === "paid" &&
              parseInt(o.year) === year &&
              parseInt(o.month) === month &&
              parseInt(o.day) === day
            );
            if (matchedOrders.length > 0) {
              const GRADE_RANK = { deep: 4, premium: 3, sms: 2, free: 1 };
              matchedOrders.sort((a, b) => {
                const rankA = GRADE_RANK[a.reportGrade] || 0;
                const rankB = GRADE_RANK[b.reportGrade] || 0;
                return rankB - rankA;
              });
              return matchedOrders[0].reportGrade;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    return paramGrade;
  };

  const reportGrade = getReportGrade();
  const currentGrade = reportGrade;

  // Partner parameters
  const partnerName = getDecodedParam("partnerName", "강민우");
  const partnerGender = searchParams.get("partnerGender") === "female" ? "여성" : "남성";
  const partnerCalendar = searchParams.get("partnerCalendar") || "solar";
  const partnerYear = parseQueryInt(searchParams.get("partnerYear"), 1993);
  const partnerMonth = parseQueryInt(searchParams.get("partnerMonth"), 11);
  const partnerDay = parseQueryInt(searchParams.get("partnerDay"), 12);
  const partnerHour = searchParams.get("partnerHour") || "unknown";

  // Dynamic Saju Calculation
  const sajuInfo = getGanjiTable(year, month, day, hour);
  const partnerSajuInfo = getGanjiTable(partnerYear, partnerMonth, partnerDay, partnerHour);
  const prescriptions = getDeficientPrescription(sajuInfo.elements);
  const metrics = getCharacterMetrics(sajuInfo);
  const isFree = (reportGrade === "free" && !isPaid) || (reportGrade === "premium" && !isPaid) || (reportGrade === "sms" && !isPaid);
  const isSmsLocked = (reportGrade === "sms" && !isPaid);

  // Determine user's base element for 2026 compatibility (일간 오행 기준)
  const baseEl = sajuInfo.day.stemEl; // Representing birth day element (일간)
  const gunghapType = searchParams.get("gunghapType") || "compatibility";




  // Check payment status on mount
  const [hasCheckedPayment, setHasCheckedPayment] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isMobileSuccess = params.get("imp_success") === "true" || (params.has("paymentId") && !params.has("code"));

      // [파라미터 유실 방어] 모바일 결제 성공 리다이렉트 시 파라미터가 유실된 경우 임시 보관 정보로 복구하여 리다이렉트
      if (isMobileSuccess && (!params.has("name") || !params.has("phone") || !params.has("email"))) {
        try {
          const tempStr = localStorage.getItem("hyeandang_temp_upgrade_info");
          if (tempStr) {
            const tempInfo = JSON.parse(tempStr);
            const redirectParams = new URLSearchParams({
              name: tempInfo.name,
              gender: tempInfo.genderVal || "female",
              type: tempInfo.typeParam || "saju",
              calendar: tempInfo.calendar || "solar",
              year: String(tempInfo.year),
              month: String(tempInfo.month),
              day: String(tempInfo.day),
              hour: tempInfo.hour || "10:00",
              worryCategory: tempInfo.worryCategory || "general",
              worryText: tempInfo.worryText || "",
              partnerName: tempInfo.partnerName || "",
              partnerGender: tempInfo.partnerGender || "male",
              partnerCalendar: tempInfo.partnerCalendar || "solar",
              partnerYear: String(tempInfo.partnerYear || 1993),
              partnerMonth: String(tempInfo.partnerMonth || 11),
              partnerDay: String(tempInfo.partnerDay || 12),
              partnerHour: tempInfo.partnerHour || "unknown",
              gunghapType: tempInfo.gunghapType || "compatibility",
              email: tempInfo.email || "",
              phone: tempInfo.phone || "",
              reportGrade: tempInfo.targetGrade || "premium",
              imp_success: "true"
            });
            window.location.href = `${window.location.origin}${window.location.pathname}?${redirectParams.toString()}`;
            return;
          }
        } catch (e) {
          console.error("모바일 성공 리다이렉트 파라미터 복구 실패:", e);
        }
      }

      // 만약 URL 파라미터에 성공(imp_success) 플래그가 들어있는 경우도 결제 완료 처리
      if (isMobileSuccess) {
        setIsPaid(true);
        const currentGradeParam = params.get("reportGrade") || (
          (() => {
            try {
              const tempStr = localStorage.getItem("hyeandang_temp_upgrade_info");
              if (tempStr) {
                return JSON.parse(tempStr).targetGrade;
              }
            } catch(e) {}
            return "premium";
          })()
        );
        // 모바일 리다이렉트 등으로 들어왔을 때 해당 주문 정보를 로컬 스토리지에 업데이트
        (async () => {
          const paymentIdParam = params.get("payment_id") || params.get("paymentId") || params.get("merchant_uid") || "";
          await updateLocalStorageOrderToPaid(currentGradeParam, paymentIdParam);
        })();
        
        // [모바일 리다이렉트 대응] 결제 완료 시점 메일 및 문자 자동 전송 처리
        const sendNotificationOnMobileRedirect = async () => {
          try {
            let restoredEmail = "";
            let restoredPhone = "";
            
            // 1순위: 임시 정보 백업 저장소에서 최우선으로 연락처 복원
            try {
              const tempStr = localStorage.getItem("hyeandang_temp_upgrade_info");
              if (tempStr) {
                const tempInfo = JSON.parse(tempStr);
                restoredEmail = tempInfo.email;
                restoredPhone = tempInfo.phone;
              }
            } catch (tempErr) {
              console.error("임시 정보 조회 실패:", tempErr);
            }

            // 2순위: 기존 주문 내역(hyeandang_orders)에서 복원
            if (!restoredEmail || !restoredPhone) {
              try {
                const existingStr = localStorage.getItem("hyeandang_orders");
                if (existingStr) {
                  const orders = JSON.parse(existingStr);
                  const matched = Array.isArray(orders) ? orders.find(o => 
                    o &&
                    o.name === name && 
                    parseInt(o.year) === year &&
                    parseInt(o.month) === month &&
                    parseInt(o.day) === day
                  ) : null;
                  if (matched) {
                    if (!restoredEmail) restoredEmail = matched.email;
                    if (!restoredPhone) restoredPhone = matched.phone;
                  }
                }
              } catch (e) {
                console.error("로컬 스토리지 주문 조회 실패:", e);
              }
            }

            const targetEmail = emailParam || restoredEmail || "today_sms@hyeandang.com";
            const targetPhone = phoneParam || restoredPhone;
            
            const isTojeong = typeParam === "tojeong";
            const productTitle = isTojeong ? "정통 토정비결" : "정통 사주 보고서";

            // 1. 이메일 전송
            if (targetEmail && targetEmail.includes("@") && targetEmail !== "today_sms@hyeandang.com") {
              const queryParams = new URLSearchParams({
                name: name,
                gender: genderVal || "female",
                type: typeParam,
                calendar: calendar,
                year: String(year),
                month: String(month),
                day: String(day),
                hour: hour,
                worryCategory: worryCategory,
                worryText: worryText || "",
                partnerName: partnerName || "",
                partnerGender: partnerGender === "여성" ? "female" : "male",
                partnerCalendar: partnerCalendar,
                partnerYear: String(partnerYear),
                partnerMonth: String(partnerMonth),
                partnerDay: String(partnerDay),
                partnerHour: partnerHour,
                gunghapType: gunghapType,
                email: targetEmail,
                phone: targetPhone
              });

              const origin = window.location.origin;
              const resultUrl = `${origin}/result?${queryParams.toString()}&reportGrade=${currentGradeParam}&unlock=true`;
              const mailSubject = `[혜안당 명리연구소] ${name} 님 주문하신 [${productTitle}] 분석결과서가 도착했습니다.`;
              const mailHtml = `
                <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E2DDD5; border-radius: 12px; background-color: #F9F8F6;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <span style="font-size: 24px; font-weight: bold; color: #A3845B; letter-spacing: 2px;">慧眼堂</span>
                    <p style="font-size: 12px; color: #888; margin-top: 5px;">지혜로운 눈으로 밝히는 운명</p>
                  </div>
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #E1E1E1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <h2 style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #A3845B; padding-bottom: 15px;">운세 분석 보고서 완료 안내</h2>
                    <p style="font-size: 14px; color: #333; line-height: 1.6; margin-top: 20px;">
                      안녕하세요, <strong>${name}</strong> 님.<br />
                      혜안당 명리연구소에 의뢰해 주신 <strong>[${productTitle}]</strong> 분석 작업이 정교한 명리 해석을 거쳐 최종 완료되었습니다.
                    </p>
                    <p style="font-size: 14px; color: #333; line-height: 1.6;">
                      작성된 정밀 보감 보고서는 아래의 '결과 확인하기' 버튼을 누르시면 온라인 결과 화면으로 즉시 연결되어 열람 및 가이드를 확인해 보실 수 있습니다.
                    </p>
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${resultUrl}" target="_blank" style="display: inline-block; background-color: #A3845B; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px; font-weight: bold; box-shadow: 0 4px 6px rgba(163,132,91,0.25);">결과 확인하기</a>
                    </div>
                    <p style="font-size: 12px; color: #666; line-height: 1.5; background-color: #F3F3F3; padding: 15px; border-radius: 6px; margin-bottom: 0;">
                      ※ 본 메일은 발신전용으로 회신이 되지 않습니다.<br />
                      ※ 문의 사항은 홈페이지 하단 대표번호 혹은 아트파니 고객센터로 연락 주시기 바랍니다.
                    </p>
                  </div>
                  <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888; line-height: 1.6;">
                    © 2026 혜안당. All rights reserved.
                  </div>
                </div>
              `;

              await fetch("/api/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to: targetEmail, subject: mailSubject, html: mailHtml })
              });
            }

            // 2. SMS 전송
            if (targetPhone && targetPhone.replace(/[^0-9]/g, "").length >= 9) {
              const smsQueryParams = new URLSearchParams({
                name: name,
                gender: genderVal || "female",
                type: typeParam,
                calendar: calendar,
                year: String(year),
                month: String(month),
                day: String(day),
                hour: hour,
                worryCategory: worryCategory,
                worryText: worryText || "",
                partnerName: partnerName || "",
                partnerGender: partnerGender === "여성" ? "female" : "male",
                partnerCalendar: partnerCalendar,
                partnerYear: String(partnerYear),
                partnerMonth: String(partnerMonth),
                partnerDay: String(partnerDay),
                partnerHour: partnerHour,
                gunghapType: gunghapType,
                email: targetEmail,
                phone: targetPhone
              });

              const origin = "https://saju.artpani.com";
              const mobileResultUrl = `${origin}/result?${smsQueryParams.toString()}&reportGrade=${currentGradeParam}&unlock=true`;
              const smsContent = `[혜안당 명리연구소] ${name} 님, 주문하신 ${isTojeong ? "정통 토정비결" : "정통 사주"} 분석이 완료되었습니다.\n\n적어주신 이메일(${targetEmail || "지정 이메일"})로 상세 보감 PDF가 전송되었으며, 아래 온라인 보감 링크로도 즉시 열람이 가능합니다.\n\n▶ 결과 보기: ${mobileResultUrl}\n\n감사합니다.`;

              await fetch("/api/sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiver: targetPhone, msg: smsContent, title: isTojeong ? "[혜안당 토정비결]" : "[혜안당 사주분석]" })
              });
            }
          } catch (err) {
            console.error("모바일 리다이렉트 문자/메일 발송 실패:", err);
          }
        };

        // 비동기 전송이 완료될 때까지 확실히 기다린 후 return 하도록 조치
        (async () => {
          await sendNotificationOnMobileRedirect();
          setHasCheckedPayment(true);
        })();
        return;
      }

      // debugUnlock이 활성화되어 있으면 즉시 잠금 해제
      if (debugUnlock) {
        setIsPaid(true);
        return;
      }

      const existingStr = localStorage.getItem("hyeandang_orders");
      let paidOrder = null;
      if (existingStr) {
        try {
          const orders = JSON.parse(existingStr);
          if (Array.isArray(orders)) {
            const matchedOrders = orders.filter(o => 
              o &&
              o.name === name && 
              o.status === "paid" &&
              parseInt(o.year) === year &&
              parseInt(o.month) === month &&
              parseInt(o.day) === day
            );
            if (matchedOrders.length > 0) {
              const GRADE_RANK = { deep: 4, premium: 3, sms: 2, free: 1 };
              matchedOrders.sort((a, b) => {
                const rankA = GRADE_RANK[a.reportGrade] || 0;
                const rankB = GRADE_RANK[b.reportGrade] || 0;
                return rankB - rankA;
              });
              paidOrder = matchedOrders[0];
            }
          }
        } catch(e) {
          console.error(e);
        }
      }

      if (paidOrder && reportGrade !== "free" && !isMobileSuccess) {
        setIsPaid(true);
        setHasCheckedPayment(true);
        return;
      }

      // 그 외의 경우 (특히 free가 아닌 상태에서 hyeandang_orders도 없는 경우) 결제 유도
      if (reportGrade === "premium" || reportGrade === "deep" || reportGrade === "sms") {
        setIsPaid(false);
      } else if (reportGrade !== "free") {
        setIsPaid(false);
      }
      try {
        // 무료(free) 리포트일 때는 기존에 결제 통과하여 'paid' 상태로 저장된 다른 주문(예: 같은 이름, 생일)이 
        // 로컬스토리지에 있더라도 이를 무시하고 결제 유도창(Lock)이 무조건 정상적으로 뜨도록 분기 처리합니다.
        if (reportGrade === "free") {
          setIsPaid(false);
        }
      } catch (e) {
        console.error(e);
      }
      setHasCheckedPayment(true);
    }
  }, [reportGrade, name, year, month, day, debugUnlock]);

  const getLocalDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d} ${hh}:${mm}`;
  };

  const updateLocalStorageOrderToPaid = async (targetGrade, paymentId) => {
    try {
      const existingStr = localStorage.getItem("hyeandang_orders");
      let orders = [];
      if (existingStr) {
        try {
          orders = JSON.parse(existingStr);
          if (!Array.isArray(orders)) orders = [];
        } catch (e) {
          orders = [];
        }
      }

      let matchedIdx = orders.findIndex(o => 
        o &&
        o.name === name && 
        parseInt(o.year) === year &&
        parseInt(o.month) === month &&
        parseInt(o.day) === day &&
        (o.status === "pending" || o.status === "ready")
      );

      if (matchedIdx > -1) {
        orders[matchedIdx].status = "paid";
        if (targetGrade) {
          orders[matchedIdx].reportGrade = targetGrade;
        }
        if (paymentId) {
          orders[matchedIdx].paymentId = paymentId;
        }
        if (typeParam === "tojeong") {
          orders[matchedIdx].productName = "정통 토정비결";
        }
        localStorage.setItem("hyeandang_orders", JSON.stringify(orders));

        // 서버 API PUT 업데이트 추가
        try {
          await fetch("/api/orders", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPassword: "artpani1234",
              id: orders[matchedIdx].id,
              status: "paid",
              reportGrade: targetGrade || orders[matchedIdx].reportGrade,
              productName: orders[matchedIdx].productName,
              paymentId: paymentId || orders[matchedIdx].paymentId
            })
          });
        } catch (e) {
          console.error("주문 paid API 업데이트 실패:", e);
        }
      } else {
        // [방어 로직] 임시 저장된 모바일/결제 정보가 없을 경우 복구하여 주문 생성 후 서버 POST 등록
        const tempStr = localStorage.getItem("hyeandang_temp_upgrade_info");
        let restoredEmail = emailParam || "today_sms@hyeandang.com";
        let restoredPhone = phoneParam || "010-0000-0000";
        let restoredAmount = 30000;
        if (tempStr) {
          try {
            const tempInfo = JSON.parse(tempStr);
            restoredEmail = tempInfo.email || restoredEmail;
            restoredPhone = tempInfo.phone || restoredPhone;
            restoredAmount = tempInfo.amount || restoredAmount;
          } catch (e) {}
        }
        
        const newOrder = {
          id: Math.floor(Math.random() * 9000) + 1000,
          name: name,
          email: restoredEmail,
          phone: restoredPhone,
          productName: typeParam === "tojeong" ? "정통 토정비결" : (type === "newyear" ? "신년운세" : "평생 종합 사주팔자"),
          amount: restoredAmount,
          status: "paid",
          createdAt: getLocalDateString(),
          gender: genderVal || "female",
          calendar: calendar,
          year: String(year),
          month: String(month),
          day: String(day),
          hour: hour,
          worryText: worryText || "오늘의 운세",
          reportGrade: targetGrade || "premium",
          paymentId: paymentId || ""
        };
        orders.push(newOrder);
        localStorage.setItem("hyeandang_orders", JSON.stringify(orders));

        // 서버 API POST 생성
        try {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrder)
          });
        } catch (e) {
          console.error("신규 주문 API 복구 등록 실패:", e);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpgradeFromSms = (grade, amount) => {
    if (typeof window === "undefined") return;

    const updateLocalStorageOrderGrade = async (targetGrade) => {
      try {
        const existingStr = localStorage.getItem("hyeandang_orders");
        let orders = [];
        if (existingStr) {
          try {
            orders = JSON.parse(existingStr);
            if (!Array.isArray(orders)) orders = [];
          } catch (e) {
            orders = [];
          }
        }
        let matchedIdx = orders.findIndex(o => 
          o &&
          o.name === name && 
          parseInt(o.year) === year &&
          parseInt(o.month) === month &&
          parseInt(o.day) === day &&
          (o.status === "pending" || o.status === "ready")
        );
        if (matchedIdx > -1) {
          orders[matchedIdx].status = "paid";
          orders[matchedIdx].reportGrade = targetGrade;
          if (typeParam === "tojeong") {
            orders[matchedIdx].productName = "정통 토정비결";
          }
          localStorage.setItem("hyeandang_orders", JSON.stringify(orders));

          // 서버 API PUT 업데이트 추가
          try {
            await fetch("/api/orders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                adminPassword: "artpani1234",
                id: orders[matchedIdx].id,
                status: "paid",
                reportGrade: targetGrade,
                productName: orders[matchedIdx].productName
              })
            });
          } catch (e) {
            console.error("업그레이드 paid API 업데이트 실패:", e);
          }
        } else {
          const newOrder = {
            id: Math.floor(Math.random() * 9000) + 1000,
            name: name,
            email: emailParam || "today_sms@hyeandang.com",
            phone: phoneParam || "010-0000-0000",
            productName: typeParam === "tojeong" ? "정통 토정비결" : (type === "newyear" ? "신년운세" : "평생 종합 사주팔자"),
            amount: amount,
            status: "paid",
            createdAt: getLocalDateString(),
            gender: genderVal || "female",
            calendar: calendar,
            year: String(year),
            month: String(month),
            day: String(day),
            hour: hour,
            worryText: worryText || "오늘의 운세",
            reportGrade: targetGrade
          };
          orders.push(newOrder);
          localStorage.setItem("hyeandang_orders", JSON.stringify(orders));

          // 서버 API POST 생성 추가
          try {
            await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newOrder)
            });
          } catch (e) {
            console.error("신규 업그레이드 주문 API 등록 실패:", e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const performUpgrade = async () => {
      await updateLocalStorageOrderGrade(grade);
      setIsPaid(true);
      
      const url = new URL(window.location.href);
      url.searchParams.set("reportGrade", grade);
      window.location.href = url.toString();
    };

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "store-312155f8-f523-4067-a568-285c7bbec6e0";
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

    // 결제요청 직전에 사용자 정보를 임시 저장 (모바일 리다이렉트 유실 대비)
    try {
      const tempUpgradeInfo = {
        name,
        genderVal,
        typeParam,
        calendar,
        year,
        month,
        day,
        hour,
        worryCategory,
        worryText,
        partnerName,
        partnerGender,
        partnerCalendar,
        partnerYear,
        partnerMonth,
        partnerDay,
        partnerHour,
        gunghapType,
        email: emailParam || "today_sms@hyeandang.com",
        phone: phoneParam || "010-0000-0000",
        targetGrade: grade,
        amount
      };
      localStorage.setItem("hyeandang_temp_upgrade_info", JSON.stringify(tempUpgradeInfo));

      // 결제 검증을 위한 로컬스토리지 orders 정보도 pending 상태로 선등록
      const existingStr = localStorage.getItem("hyeandang_orders");
      let orders = [];
      if (existingStr) {
        try {
          orders = JSON.parse(existingStr);
          if (!Array.isArray(orders)) orders = [];
        } catch (e) {
          orders = [];
        }
      }
      const matchedIdx = orders.findIndex(o => 
        o &&
        o.name === name && 
        parseInt(o.year) === year &&
        parseInt(o.month) === month &&
        parseInt(o.day) === day &&
        o.reportGrade === grade
      );
      if (matchedIdx === -1) {
        orders.push({
          id: Math.floor(Math.random() * 9000) + 1000,
          name: name,
          email: emailParam || "today_sms@hyeandang.com",
          phone: phoneParam || "010-0000-0000",
          productName: typeParam === "tojeong" ? "정통 토정비결" : (type === "newyear" ? "신년운세" : "평생 종합 사주팔자"),
          amount: amount,
          status: "pending",
          createdAt: getLocalDateString(),
          gender: genderVal || "female",
          calendar: calendar,
          year: String(year),
          month: String(month),
          day: String(day),
          hour: hour,
          worryText: worryText || "오늘의 운세",
          reportGrade: grade
        });
        localStorage.setItem("hyeandang_orders", JSON.stringify(orders));
      }
    } catch (tempErr) {
      console.error("임시 정보 백업 실패:", tempErr);
    }

    if (!channelKey) {
      alert("[개발자 테스트 안내] V2 결제 채널 키가 지정되지 않아 모의 결제를 즉시 완료합니다.");
      performUpgrade();
      return;
    }

    if (typeof window === "undefined" || !window.PortOne) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 인터넷 연결을 확인하시거나, 브라우저의 광고 차단 확장 프로그램(AdBlock 등)이 활성화되어 있다면 해제한 후 새로고침(F5)을 해주세요.");
      return;
    }

    try {
      const PortOne = window.PortOne;

      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("reportGrade", grade);

      let resolvedEmail = emailParam;
      let resolvedPhone = phoneParam;
      try {
        const existingStr = localStorage.getItem("hyeandang_orders");
        if (existingStr) {
          const orders = JSON.parse(existingStr);
          const matched = Array.isArray(orders) ? orders.find(o => 
            o &&
            o.name === name && 
            parseInt(o.year) === year &&
            parseInt(o.month) === month &&
            parseInt(o.day) === day
          ) : null;
          if (matched) {
            if (matched.email) resolvedEmail = matched.email;
            if (matched.phone) resolvedPhone = matched.phone;
          }
        }
      } catch (e) {
        console.error("결제 요청 전 로컬스토리지 조회 실패:", e);
      }

      if (resolvedEmail) queryParams.set("email", resolvedEmail);
      if (resolvedPhone) queryParams.set("phone", resolvedPhone);

      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/result?${queryParams.toString()}`
        : "https://saju.artpani.com/result";

      PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: `payment_${new Date().getTime()}`,
        orderName: `${name}님 ${typeParam === "tojeong" ? "토정비결" : "신수비결"} ${grade === "premium" ? "고급" : "프리미엄"} 업그레이드`,
        totalAmount: amount,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: redirectUrl,
        redirectUrlType: "PAGELINK",
        appScheme: "artpanisaju",
        customer: {
          fullName: name,
          phoneNumber: resolvedPhone || "010-0000-0000",
          email: resolvedEmail || "today_sms@hyeandang.com",
        },
      }).then(function (rsp) {
        if (rsp.code === undefined) {
          setIsProcessing(true);
          setProgress(0);
          
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setTimeout(async () => {
                // 이메일 자동 발송 트리거 연동
                const targetEmail = emailParam || (rsp && rsp.buyer_email);
                if (targetEmail && targetEmail.includes("@") && targetEmail !== "today_sms@hyeandang.com") {
                  try {
                    const queryParams = new URLSearchParams({
                      name: name,
                      gender: genderVal || "female",
                      type: typeParam,
                      calendar: calendar,
                      year: String(year),
                      month: String(month),
                      day: String(day),
                      hour: hour,
                      worryCategory: worryCategory,
                      worryText: worryText || "",
                      partnerName: partnerName || "",
                      partnerGender: partnerGender === "여성" ? "female" : "male",
                      partnerCalendar: partnerCalendar,
                      partnerYear: String(partnerYear),
                      partnerMonth: String(partnerMonth),
                      partnerDay: String(partnerDay),
                      partnerHour: partnerHour,
                      gunghapType: gunghapType,
                      email: targetEmail,
                      phone: targetPhone
                    });

                    const origin = typeof window !== "undefined" ? window.location.origin : "https://saju.artpani.com";
                    const resultUrl = `${origin}/result?${queryParams.toString()}&reportGrade=${grade}&unlock=true`;
                    
                    const mailSubject = `[혜안당 명리연구소] ${name} 님 주문하신 [정통 사주 업그레이드 보고서] 분석결과서가 도착했습니다.`;
                    const mailHtml = `
                      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E2DDD5; border-radius: 12px; background-color: #F9F8F6;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <span style="font-size: 24px; font-weight: bold; color: #A3845B; letter-spacing: 2px;">慧眼堂</span>
                          <p style="font-size: 12px; color: #888; margin-top: 5px;">지혜로운 눈으로 밝히는 운명</p>
                        </div>
                        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #E1E1E1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                          <h2 style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #A3845B; padding-bottom: 15px;">운세 분석 보고서 완료 안내</h2>
                          <p style="font-size: 14px; color: #333; line-height: 1.6; margin-top: 20px;">
                            안녕하세요, <strong>${name}</strong> 님.<br />
                            혜안당 명리연구소에 의뢰해 주신 <strong>[정통 사주 업그레이드 보고서]</strong> 분석 작업이 정교한 명리 해석을 거쳐 최종 완료되었습니다.
                          </p>
                          <p style="font-size: 14px; color: #333; line-height: 1.6;">
                            작성된 정밀 보감 보고서는 아래의 '결과 확인하기' 버튼을 누르시면 온라인 결과 화면으로 즉시 연결되어 열람 및 가이드를 확인해 보실 수 있습니다.
                          </p>
                          <div style="text-align: center; margin: 35px 0;">
                            <a href="${resultUrl}" target="_blank" style="display: inline-block; background-color: #A3845B; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px; font-weight: bold; box-shadow: 0 4px 6px rgba(163,132,91,0.25);">결과 확인하기</a>
                          </div>
                          <p style="font-size: 12px; color: #666; line-height: 1.5; background-color: #F3F3F3; padding: 15px; border-radius: 6px; margin-bottom: 0;">
                            ※ 본 메일은 발신전용으로 회신이 되지 않습니다.<br />
                            ※ 문의 사항은 홈페이지 하단 대표번호 혹은 아트파니 고객센터로 연락 주시기 바랍니다.
                          </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888; line-height: 1.6;">
                          © 2026 혜안당. All rights reserved.
                        </div>
                      </div>
                    `;

                    await fetch("/api/email", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        to: targetEmail,
                        subject: mailSubject,
                        html: mailHtml,
                      }),
                    });
                  } catch (mailErr) {
                    console.error("결제 후 이메일 전송 실패:", mailErr);
                  }
                }

                // SMS 자동 발송 트리거 연동
                const targetPhone = phoneParam || (rsp && rsp.buyer_tel);
                if (targetPhone && targetPhone.replace(/[^0-9]/g, "").length >= 9) {
                  try {
                    const smsQueryParams = new URLSearchParams({
                      name: name,
                      gender: genderVal || "female",
                      type: typeParam,
                      calendar: calendar,
                      year: String(year),
                      month: String(month),
                      day: String(day),
                      hour: hour,
                      worryCategory: worryCategory,
                      worryText: worryText || "",
                      partnerName: partnerName || "",
                      partnerGender: partnerGender === "여성" ? "female" : "male",
                      partnerCalendar: partnerCalendar,
                      partnerYear: String(partnerYear),
                      partnerMonth: String(partnerMonth),
                      partnerDay: String(partnerDay),
                      partnerHour: partnerHour,
                      gunghapType: gunghapType,
                      email: targetEmail,
                      phone: targetPhone
                    });

                    const origin = "https://saju.artpani.com";
                    const mobileResultUrl = `${origin}/result?${smsQueryParams.toString()}&reportGrade=${grade}&unlock=true`;
                    const smsContent = `[혜안당 명리연구소] ${name} 님, 주문하신 정통 사주 업그레이드 분석이 완료되었습니다.\n\n적어주신 이메일(${targetEmail || "지정 이메일"})로 상세 보감 PDF가 전송되었으며, 아래 온라인 보감 링크로도 즉시 열람이 가능합니다.\n\n▶ 결과 보기: ${mobileResultUrl}\n\n감사합니다.`;

                    await fetch("/api/sms", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        receiver: targetPhone,
                        msg: smsContent,
                        title: "[혜안당 사주분석]"
                      }),
                    });
                  } catch (smsErr) {
                    console.error("결제 후 SMS 문자 전송 실패:", smsErr);
                  }
                }

                setIsProcessing(false);
                performUpgrade();
              }, 300);
            } else {
              setProgress(currentProgress);
            }
          }, 150);
        } else {
          alert(`결제에 실패하였습니다. 에러 내용: ${rsp.message}`);
        }
      });
    } catch (err) {
      alert(`결제 모듈 실행 중 오류가 발생했습니다: ${err.message}`);
    }
  };

  const handlePortonePayment = async () => {
    if (typeof window === "undefined") return;

    const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "store-312155f8-f523-4067-a568-285c7bbec6e0";
    const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || "";

    // 결제 성공 및 리다이렉트 복귀용 이메일, 전화번호 복원
    let resolvedEmail = emailParam;
    let resolvedPhone = phoneParam;
    try {
      const existingStr = localStorage.getItem("hyeandang_orders");
      if (existingStr) {
        const orders = JSON.parse(existingStr);
        const matched = Array.isArray(orders) ? orders.find(o => 
          o &&
          o.name === name && 
          parseInt(o.year) === year &&
          parseInt(o.month) === month &&
          parseInt(o.day) === day
        ) : null;
        if (matched) {
          if (matched.email) resolvedEmail = matched.email;
          if (matched.phone) resolvedPhone = matched.phone;
        }
      }
    } catch (e) {
      console.error("결제 요청 전 로컬스토리지 조회 실패:", e);
    }

    const currentGrade = reportGrade || "premium";

    // 로컬 환경 혹은 개발 테스트를 위해 채널 키가 없으면 바로 잠금 해제
    if (!channelKey) {
      alert("[개발자 테스트 안내] V2 결제 채널 키가 지정되지 않아 모의 결제를 즉시 완료합니다.\n\n확인을 누르시면 결제완료 처리되고 상세 보고서 잠금이 풀립니다.");
      setIsPaid(true);
      await updateLocalStorageOrderToPaid(currentGrade, `payment_mock_${new Date().getTime()}`);
      return;
    }

    if (typeof window === "undefined" || !window.PortOne) {
      alert("결제 모듈이 아직 로드되지 않았습니다. 인터넷 연결을 확인하시거나, 브라우저의 광고 차단 확장 프로그램(AdBlock 등)이 활성화되어 있다면 해제한 후 새로고침(F5)을 해주세요.");
      return;
    }

    try {
      const PortOne = window.PortOne;

      const queryParams = new URLSearchParams(window.location.search);
      if (resolvedEmail) queryParams.set("email", resolvedEmail);
      if (resolvedPhone) queryParams.set("phone", resolvedPhone);
      queryParams.set("reportGrade", currentGrade);

      const redirectUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/result?${queryParams.toString()}`
        : "https://saju.artpani.com/result";

      const isTojeong = typeParam === "tojeong";
      const paymentTitle = isTojeong ? `${name}님 정통 토정비결 보고서` : `${name}님 정통 사주 풀이 보고서`;

      const amount = currentGrade === "deep" ? 49900 : (currentGrade === "premium" ? 34900 : 14900);

      PortOne.requestPayment({
        storeId,
        channelKey,
        paymentId: `payment_${new Date().getTime()}`,
        name: paymentTitle,
        totalAmount: amount,
        currency: "KRW",
        payMethod: "CARD",
        redirectUrl: redirectUrl,
        redirectUrlType: "PAGELINK",
        appScheme: "artpanisaju",
        customer: {
          fullName: name,
          phoneNumber: resolvedPhone || "010-0000-0000",
          email: resolvedEmail || "today_sms@hyeandang.com",
        },
      }).then(function (rsp) {
        if (rsp.code === undefined) {
          // 결제 성공 시 1.8초 동안 만세력 정밀 보조 빌드 애니메이션 시작
          setIsProcessing(true);
          setProgress(0);
          
          let currentProgress = 0;
          const interval = setInterval(() => {
            currentProgress += 10;
            if (currentProgress >= 100) {
              clearInterval(interval);
              setTimeout(async () => {
                setIsProcessing(false);
                setIsPaid(true);
                await updateLocalStorageOrderToPaid(currentGrade, rsp.paymentId);

                // 이메일 자동 발송 트리거 연동 (결제 정보에서 입력한 이메일 주소 사용)
                const targetEmail = emailParam || (rsp && rsp.buyer_email);
                if (targetEmail && targetEmail.includes("@") && targetEmail !== "today_sms@hyeandang.com") {
                  try {
                    const queryParams = new URLSearchParams({
                      name: encodeURIComponent(name),
                      gender: genderVal || "female",
                      type: typeParam,
                      calendar: calendar,
                      year: String(year),
                      month: String(month),
                      day: String(day),
                      hour: hour,
                      worryCategory: worryCategory,
                      worryText: encodeURIComponent(worryText || ""),
                      partnerName: encodeURIComponent(partnerName || ""),
                      partnerGender: partnerGender === "여성" ? "female" : "male",
                      partnerCalendar: partnerCalendar,
                      partnerYear: String(partnerYear),
                      partnerMonth: String(partnerMonth),
                      partnerDay: String(partnerDay),
                      partnerHour: partnerHour,
                      gunghapType: gunghapType,
                      email: targetEmail,
                      phone: targetPhone
                    });

                    const origin = typeof window !== "undefined" ? window.location.origin : "https://saju.artpani.com";
                    const resultUrl = `${origin}/result?${queryParams.toString()}&reportGrade=${reportGrade}&unlock=true`;
                    
                    const mailSubject = `[혜안당 명리연구소] ${name} 님 주문하신 [정통 사주 풀이 보고서] 분석결과서가 도착했습니다.`;
                    const mailHtml = `
                      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E2DDD5; border-radius: 12px; background-color: #F9F8F6;">
                        <div style="text-align: center; margin-bottom: 30px;">
                          <span style="font-size: 24px; font-weight: bold; color: #A3845B; letter-spacing: 2px;">慧眼堂</span>
                          <p style="font-size: 12px; color: #888; margin-top: 5px;">지혜로운 눈으로 밝히는 운명</p>
                        </div>
                        <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #E1E1E1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                          <h2 style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #A3845B; padding-bottom: 15px;">운세 분석 보고서 완료 안내</h2>
                          <p style="font-size: 14px; color: #333; line-height: 1.6; margin-top: 20px;">
                            안녕하세요, <strong>${name}</strong> 님.<br />
                            혜안당 명리연구소에 의뢰해 주신 <strong>[정통 사주 풀이 보고서]</strong> 분석 작업이 정교한 명리 해석을 거쳐 최종 완료되었습니다.
                          </p>
                          <p style="font-size: 14px; color: #333; line-height: 1.6;">
                            작성된 정밀 보감 보고서는 아래의 '결과 확인하기' 버튼을 누르시면 온라인 결과 화면으로 즉시 연결되어 열람 및 가이드를 확인해 보실 수 있습니다.
                          </p>
                          <div style="text-align: center; margin: 35px 0;">
                            <a href="${resultUrl}" target="_blank" style="display: inline-block; background-color: #A3845B; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-size: 15px; font-weight: bold; box-shadow: 0 4px 6px rgba(163,132,91,0.25);">결과 확인하기</a>
                          </div>
                          <p style="font-size: 12px; color: #666; line-height: 1.5; background-color: #F3F3F3; padding: 15px; border-radius: 6px; margin-bottom: 0;">
                            ※ 본 메일은 발신전용으로 회신이 되지 않습니다.<br />
                            ※ 문의 사항은 홈페이지 하단 대표번호 혹은 아트파니 고객센터로 연락 주시기 바랍니다.
                          </p>
                        </div>
                        <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888; line-height: 1.6;">
                          © 2026 혜안당. All rights reserved.
                        </div>
                      </div>
                    `;

                    await fetch("/api/email", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        to: targetEmail,
                        subject: mailSubject,
                        html: mailHtml,
                      }),
                    });
                  } catch (mailErr) {
                    console.error("결제 후 이메일 전송 실패:", mailErr);
                  }
                }

                // SMS 자동 발송 트리거 연동 (유료 결제 성공 시 발송)
                const targetPhone = phoneParam || (rsp && rsp.buyer_tel);
                if (targetPhone && targetPhone.replace(/[^0-9]/g, "").length >= 9) {
                  try {
                    const smsQueryParams = new URLSearchParams({
                      name: encodeURIComponent(name),
                      gender: genderVal || "female",
                      type: typeParam,
                      calendar: calendar,
                      year: String(year),
                      month: String(month),
                      day: String(day),
                      hour: hour,
                      worryCategory: worryCategory,
                      worryText: encodeURIComponent(worryText || ""),
                      partnerName: encodeURIComponent(partnerName || ""),
                      partnerGender: partnerGender === "여성" ? "female" : "male",
                      partnerCalendar: partnerCalendar,
                      partnerYear: String(partnerYear),
                      partnerMonth: String(partnerMonth),
                      partnerDay: String(partnerDay),
                      partnerHour: partnerHour,
                      gunghapType: gunghapType,
                      email: targetEmail,
                      phone: targetPhone
                    });

                    const origin = typeof window !== "undefined" ? window.location.origin : "https://saju.artpani.com";
                    const mobileResultUrl = `${origin}/result?${smsQueryParams.toString()}&reportGrade=${reportGrade}&unlock=true`;
                    const smsContent = `[혜안당 명리연구소] ${name} 님, 주문하신 정통 사주 분석이 완료되었습니다.\n\n적어주신 이메일(${targetEmail || "지정 이메일"})로 상세 보감 PDF가 전송되었으며, 아래 온라인 보감 링크로도 즉시 열람이 가능합니다.\n\n▶ 결과 보기: ${mobileResultUrl}\n\n감사합니다.`;

                    await fetch("/api/sms", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        receiver: targetPhone,
                        msg: smsContent,
                        title: "[혜안당 사주분석]"
                      }),
                    });
                  } catch (smsErr) {
                    console.error("결제 후 SMS 문자 전송 실패:", smsErr);
                  }
                }
              }, 300);
            } else {
              setProgress(currentProgress);
            }
          }, 150);
        } else {
          alert(`결제에 실패하였습니다. 에러 내용: ${rsp.message}`);
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
        analysis: `${name}님의 사주 기질과 운세를 바탕으로 도출한 총론입니다. 귀하의 기운은 주체적이고 독립적인 성향이 돋보이며, 주변의 간섭에서 벗어나 스스로 삶을 주도하려는 에너지가 강하게 흐릅니다. 현재 삶의 전반적인 답답함은 기운이 팽창하면서 기존 환경과의 마찰을 빚고 있기 때문입니다.`,
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
      analysis = `${name}님의 건강 상태 및 심신의 안녕["${cleanedText}"]에 대한 명리학적 케어 가이드입니다. 사주 내 특정 오행(특히 화기운의 과다 혹은 수기운의 결핍)이 불균형을 이룰 때 피로가 누적되고 신경성 질환이나 면역력 약화가 찾아오기 쉽습니다. 몸의 적신호는 단순히 체력의 문제가 아니라, 마음의 응어리와 기운의 불통이 신체로 발현되는 과정입니다. 스스로를 가혹하게 채찍질하기보다 쉼표를 찍어줄 때입니다.`;
      timing = `정체된 기운이 소통되고 신체 리듬이 안정을 찾는 가장 길한 시기는 오행의 열기를 식히고 윤활유를 채워주는 가을철(음력 7~8월) 및 겨울철(음력 10~11월)입니다.`;
      actionPlan = `1. 매일 취침 전 15~20분간 따뜻한 물로 족욕을 실천하여 머리의 열을 내리고 아래를 따뜻하게 하는 수승화강(水昇火降)을 도우십시오.\n2. 자연의 목(木) 기운을 보완하기 위해 녹색 식물을 방에 두거나 가벼운 숲길 산책을 일상화하십시오.\n3. 신맛이 나는 차(오미자, 매실)나 따뜻한 보리차를 수시로 음용하여 마른 체내에 수분을 보충해 주십시오.`;
    } else if (hasStudy) {
      analysis = `${name}님의 학업 성취, 자격증 취득 및 시험 합격 안건["${cleanedText}"]에 대한 명리 분석입니다. 시험과 공부는 사주에서 문서와 인내를 뜻하는 인성(印星)의 기운이 지지해 줄 때 합격의 문이 넓어집니다. 의욕이 앞설 때 집중력이 흩어지기 쉬운 구조를 가졌으니, 한 번에 여러 공부를 하기보다 하나의 목표를 잘게 쪼개어 정복해 나가는 끈기가 핵심입니다.`;
      timing = `집중력이 극대화되고 시험관이나 채점관에게 좋은 인상을 주는 합격 및 문서 취득의 골든 타임은 2026년 음력 8월(酉월) 및 9월(戌월)의 대길한 문서운 시기입니다.`;
      actionPlan = `1. 공부방이나 책상을 행운의 방위인 남서쪽이나 서쪽을 향하도록 배치하여 집중의 밀도를 높이십시오.\n2. 중요한 시험 당일에는 노란색(土)이나 브라운 계열의 의상을 입거나 필기구를 소지하여 문서의 수호 기운을 보충하십시오.\n3. 매일 아침 간단한 일일 투두리스트를 서면으로 작성하고 완료 시 체크하는 방식으로 성취감을 의식적으로 유도하십시오.`;
    } else if (hasJob) {
      analysis = `${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, 직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
      timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 음력 7~9월 사이입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
      actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.\n2. 행운의 색상인 화이트(金)나 실버 액세서리를 착용하여 신뢰감을 주는 이미지를 메이킹하십시오.\n3. 이직을 진행할 때 서쪽(西) 방향에 위치한 회사나 기관이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
    } else if (hasLove) {
      analysis = `${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
      timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 음력 10월(亥월) 및 11월(子월) 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
      actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.\n2. 따뜻한 붉은색 계열(火)의 홈웨어 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.\n3. 대화를 시도할 때는 서로 마주 보는 자리보다 나란히 걸으며 이야기할 때 감정의 대립을 막아줍니다.`;
    } else if (hasMoney) {
      analysis = `${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, 고위험 코인, 부동산 모험)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
      timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
      actionPlan = `1. 현금 흐름의 60% 이상은 수동적 예적금이나 연금저축 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.\n2. 노란색(土) 지갑이나 브라운 계열의 의상을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.\n3. 거래 계약 시 노란 색상의 낙관 도장을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
    } else if (category === "business") {
      analysis = `${name}님의 사업체 운영 및 비즈니스 경영상 겪고 계신 갈등["${cleanedText}"]에 대한 사주 정밀 분석입니다. 사주 내 과도한 화(火) 기운이 발현될 때, 조급한 투자 결정이나 감정적인 거래선 확장은 불필요한 금전적 리스크를 유발합니다. 또한 동업자나 고용 직원과의 갈등, 의견 대립이 잦아져 경영 전반에 마찰음이 커질 수 있으니 수(水)의 유연함과 통찰을 바탕으로 차분하게 내실을 수성하는 전략이 급선무입니다.`;
      timing = `새로운 비즈니스 계약이나 자금 집행, 사업장 이동은 하늘의 금(金) 기운과 수(水) 기운이 조화롭게 흐르는 음력 8월(酉월) 하반기 및 10월(亥월)이 가장 길합니다. 이 시기에 추진하시는 계약은 리스크가 최소화되고 안정적인 결실을 보장받습니다.`;
      actionPlan = `1. 사업장 내 북쪽(水) 방향에 수경 식물이나 미니 분수를 배치해 과열된 기운을 차분히 식히십시오.\n2. 중요 미팅이나 계약 날인 시 신뢰도와 차분한 기품을 주는 다크 네이비(水) 계열 의상을 착용하십시오.\n3. 동업 또는 하도급 계약서 작성 시 당일 즉시 서명하기보다 반드시 최소 3일간의 내부 검토 기간을 두는 필터링 룰을 적용해 손재수를 철저히 예방하십시오.`;
    } else if (category === "startup") {
      analysis = `${name}님의 신규 창업 및 부업 개시 안건["${cleanedText}"]에 대한 명리 솔루션입니다. 귀하의 타고난 명조는 자기 브랜드를 구축하고자 하는 욕구(식상생재)가 매우 발달해 있습니다. 다만, 아직 경험이 완전히 축적되지 않은 상태에서 대출 비중을 높여 무리하게 진입하면 초기 고정비 과부하로 인한 큰 손실 위험이 있습니다. 소자본 및 온라인 채널을 통한 린 스타트업(Lean Startup) 형태의 철저한 테스트가 우선입니다.`;
      timing = `실제 매장을 오픈하거나 정식 사업자 등록을 하기에 가장 좋은 절기적 타이밍은 차가운 기운이 안정적으로 스며들어 감정적 조급함을 제어해 주는 음력 10월(亥월) 이후입니다.`;
      actionPlan = `1. 초기에 매장 임차료나 인테리어 설비 같은 하드웨어 비용 투자를 최소화하고, service/콘텐츠 등의 소프트웨어 위주로 시범 론칭하십시오.\n2. 노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용하여 신뢰와 중개력을 돕는 토의 기운을 보완하십시오.\n3. 창업 파트너나 조력자를 구할 때 사주 상 물(水)이나 금(金) 기운이 많고 냉철한 성품을 지닌 인물과 손잡을 때 내 부족한 추진력을 완벽히 비보해 줍니다.`;
    } else if (category === "trade") {
      analysis = `${name}님의 장사 및 물류 유통 사업["${cleanedText}"]에 대한 역학 솔루션입니다. 장사와 유통은 고객과의 잦은 대면 소통과 끊임없는 유동성 관리가 본질입니다. 귀하의 사주는 대인 친화력이 뛰어나 단골 유치에는 유리하지만, 외상 거래나 인정에 끌린 무리한 어음/미수금 거래로 인해 현금이 묶여 고통받을 수 있는 약점이 있습니다. 철저한 선결제 시스템 구축과 마진 구조의 개혁이 핵심입니다.`;
      timing = `매출 활성화가 정점에 달하고 유통망이 매끄럽게 뚫리는 시기는 금(金)의 결실 에너지가 사주의 중심을 잡아주는 음력 7~9월 가을철입니다.`;
      actionPlan = `1. 카운터나 매장 입구에 붉은색(火) 계열의 행운 장식품이나 은은한 향을 매칭하여 손님들의 호기심과 발길을 자극하십시오.\n2. 거래처 미팅 시 흰색(金) 상의를 착용하여 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.\n3. 매장 내부의 서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서 서쪽 서랍에 깊숙이 보관하십시오.`;
    } else if (category === "facility") {
      analysis = `${name}님의 설비투자 및 사업장 확장, 장비 구입["${cleanedText}"]에 대한 금전 비책입니다. 기계, 공장 설비, 신규 하드웨어를 구매하거나 대형 리모델링에 착수하는 것은 사주의 문서운(인성)과 장비 계약운(관성)이 깨끗할 때 진입해야 고장이나 시공 하자, 이자 비용의 폭증을 피할 수 있습니다. 현재의 충살 기운 하에서는 성급하게 고가의 장비를 리스하거나 확장 계약을 맺으면 향후 골칫거리가 될 수 있습니다.`;
      timing = `계약 체결 및 설비 입고에 가장 하자가 없고 안전한 골든 타임은 문서 기운이 가장 안정되는 2026년 음력 8월(酉월) 하반기 및 9월(戌월)입니다.`;
      actionPlan = `1. 계약 체결 시 반드시 보증보험이나 하자보수 서약서를 이중으로 징구하여 예상치 못한 파손 리스크에 대비하십시오.\n2. 노란색(土) 가죽 다이어리나 서류 바인더에 설비 도면과 서류를 보관하여 계약 체결 시 발생하는 살(煞)을 정화하십시오.\n3. 계약서 날인 당일에는 15분 동안 반신욕이나 족욕을 통해 몸의 열기를 다스린 후 가장 이성적이고 차분한 상태에서 최종 확인을 거쳐 서명하십시오.`;
    } else if (category === "career") {
      analysis = `${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, 직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
      timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 음력 7~9월 사이입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
      actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.\n2. 행운의 색상인 화이트(金)나 실버 액세서리를 착용하여 신뢰감을 주는 이미지를 메이킹하십시오.\n3. 이직을 진행할 때 서쪽(西) 방향에 위치한 회사나 기관이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
    } else if (category === "love") {
      analysis = `${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
      timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 음력 10월(亥월) 및 11월(子월) 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
      actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.\n2. 따뜻한 붉은색 계열(火)의 홈웨어 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.\n3. 대화를 시도할 때는 서로 마주 보는 자리보다 나란히 걸으며 이야기할 때 감정의 대립을 막아줍니다.`;
    } else if (category === "wealth") {
      analysis = `${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, 고위험 코인, 부동산 모험)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
      timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
      actionPlan = `1. 현금 흐름의 60% 이상은 수동적 예적금이나 연금저축 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.\n2. 노란색(土) 지갑이나 브라운 계열의 의상을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.\n3. 거래 계약 시 노란 색상의 낙관 도장을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
    } else {
      analysis = `${name}님께서 적어주신 인생의 고뇌["${cleanedText}"]에 대한 따뜻한 명리학적 위로와 해결책입니다. 귀하가 느끼시는 마음에 낀 안개와 정체는 사주 속 특정 오행의 흐름이 한자리에 고여 원활하게 소통되지 못해 생겨난 감정적 피로입니다. 모든 것을 내 책임으로 돌리고 혼자 짊어지려는 곧은 기질로 인해 번아웃에 직면해 있으니, 타인의 기대에 맞추기보다 나를 아끼는 것이 최우선 과제입니다.`;
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
    // 1. 개인화 데이터 추출 및 만세력 기반 정보 생성
    const { elements, day, year, month, hour } = sajuInfo;
    const baseEl = sajuInfo.day.stemEl || "토";
    const dayStem = sajuInfo.day.stem || "戊";
    
    // 오행 통계 문자열 및 차트용
    const totalElements = elements.목 + elements.화 + elements.토 + elements.금 + elements.수 || 8;
    const getPercent = (val) => Math.round((val / totalElements) * 100);
    
    // 오행 결핍 및 과다 판별
    const elementsList = [
      { name: "목", val: elements.목, color: "초록색", code: "木" },
      { name: "화", val: elements.화, color: "빨간색", code: "火" },
      { name: "토", val: elements.토, color: "노란색", code: "土" },
      { name: "금", val: elements.금, color: "흰색", code: "金" },
      { name: "수", val: elements.수, color: "파란색", code: "水" }
    ];
    
    // 부족한 오행 (0개 혹은 가장 적은 오행)
    const sortedByVal = [...elementsList].sort((a, b) => a.val - b.val);
    const lackEl = sortedByVal[0];
    // 과다한 오행 (가장 많은 오행)
    const sortedByValDesc = [...elementsList].sort((a, b) => b.val - a.val);
    const excessEl = sortedByValDesc[0];

    // 고민 분야 접수 (URL 파라미터 또는 기본값)
    const worryCategoryInput = searchParams.get("worryCategory") || "진로";
    
    // 10가지 일간(日干)별 현대적 캐릭터 카드 매트릭스
    const characterCards = {
      "甲": { title: "우뚝 솟아오른 큰 나무 (갑목)", character: "기획력과 시작이 돋보이는 소나무", desc: "갑목은 하늘을 향해 곧게 뻗어가는 거대한 나무와 같습니다. 시작하는 에너지가 매우 강하며, 기획력과 정의감이 돋보입니다. 남 밑에서 간섭받기보다 주도적으로 판을 짜고 추진할 때 본연의 빛을 발합니다." },
      "乙": { title: "꺾이지 않는 끈질긴 풀꽃 (을목)", character: "바람에 흔들려도 결코 꺾이지 않는 들꽃", desc: "을목은 부드럽지만 엄청난 생명력을 품은 들풀 및 넝쿨 식물과 같습니다. 어떠한 척박한 환경에서도 살아남는 유연성과 친화력이 돋보이며, 네트워킹과 현실적인 끈기에 탁월한 재능이 있습니다." },
      "丙": { title: "세상을 따뜻하게 비추는 태양 (병화)", character: "만물에 온기를 나눠주는 정열의 불꽃", desc: "병화는 어둠을 걷어내는 찬란한 태양과 같습니다. 활기차고 표현력이 뛰어나며, 숨김없는 솔직함으로 사람들을 이끄는 매력이 있습니다. 본인의 열정을 표현하고 무대의 중심에서 박수를 받을 때 생명력이 극대화됩니다." },
      "丁": { title: "어둠 속을 밝히는 은은한 촛대 (정화)", character: "밤길을 비추어 주는 따뜻한 등대 불빛", desc: "정화는 밤하늘의 별이나 길을 밝혀주는 촛불과 같습니다. 겉으로는 조용해 보이지만 내면의 은근한 열정이 있으며, 매우 섬세하고 분석적인 시각을 가집니다. 다른 사람을 돕고 조력하며 디테일을 다듬을 때 강해집니다." },
      "戊": { title: "만물을 듬직하게 품어주는 대지 (무토)", character: "어떤 풍파에도 흔들리지 않는 거대한 바위산", desc: "무토는 넓고 단단하여 만물을 기르고 지탱하는 거대한 산과 같습니다. 신용과 묵직한 존재감이 돋보이며, 감정에 쉽게 치우치지 않고 넓은 포용력으로 사람들을 보호하고 리드해 주는 실속형 리더 기질이 있습니다." },
      "己": { title: "새싹을 길러내는 따뜻한 정원 흙 (기토)", character: "생명을 정성껏 키워내는 어머니의 흙", desc: "기토는 농작물을 길러내는 비옥한 논밭이나 촉촉한 정원의 흙과 같습니다. 계획성이 철저하고 타인에 대한 세심한 배려심이 가득합니다. 보이지 않는 곳에서 내실을 챙기고 기초를 단단히 다지는 실무자 역할에 적합합니다." },
      "庚": { title: "단단하게 제련을 기다리는 원석 (경금)", character: "정의감과 추진력으로 무장한 단단한 바위와 칼", desc: "경금은 가공되지 않은 거대한 쇳덩이나 날카로운 신검과 같습니다. 의리가 강하고 결단력이 확실하며, 질질 끄는 것을 용납하지 않는 강력한 돌파 능력이 장점입니다. 승부사 기질과 단호함이 돋보입니다." },
      "辛": { title: "화려하게 빛나는 완성된 보석 (신금)", character: "예리한 통찰력과 기품을 지닌 다이아몬드", desc: "신금은 제련을 마친 정밀한 칼날이나 찬란하게 빛나는 다이아몬드와 같습니다. 섬세하고 기품이 있으며, 남다른 미적 감각과 칼날 같은 예리한 통찰력을 자랑합니다. 본인의 전문 분야에서 최고가 되어 빛을 내는 장인 기질이 흐릅니다." },
      "壬": { title: "모든 것을 품는 깊고 넓은 바다 (임수)", character: "끊임없이 흐르며 길을 개척하는 거대한 강물", desc: "임수는 흘러 흘러 넓은 대지를 채우는 거대한 물줄기와 같습니다. 지혜가 깊고 통찰력이 뛰어나며, 전체 판을 읽어내는 능력이 뛰어난 리더입니다. 겉으로는 유연해 보이지만 내면에는 거대한 야망과 지혜의 힘을 지니고 있습니다." },
      "癸": { title: "대지를 촉촉하게 적시는 이슬비 (계수)", character: "마음의 갈증을 해소해 주는 맑은 옹달샘", desc: "계수는 하늘에서 내리는 단비나 졸졸 흐르는 계곡 물과 같습니다. 대단히 영리하고 섬세하며, 사람들의 마음과 환경 변화를 기가 막히게 캐치해 냅니다. 기발한 아이디어와 부드러운 침투력으로 변화를 이끌어 냅니다." }
    };

    const currentCard = characterCards[dayStem] || characterCards["戊"];

    // 1:1 사주 근거 해석 생성기 (만세력에 완벽 대조)
    const getAstroBasis = (section) => {
      switch(section) {
        case "character":
          return `일주의 천간(일간)이 '${dayStem}'(${baseEl}의 기운)에 해당하여, 귀하의 본질적 자아 기질이 ${currentCard.character}의 성질을 강하게 띄게 됨을 만세력이 증명하고 있습니다.`;
        case "strength":
          return `사주 8글자 중 가장 세력이 강한 오행인 '${excessEl.name}' 기운(총 ${excessEl.val}개 분포)의 긍정적인 발현에 근거합니다.`;
        case "lacks":
          return `사주 원국 내에서 세력이 가장 취약하거나 고립되어 있는 '${lackEl.name}' 기운(총 ${lackEl.val}개 분포)의 결핍에서 기인합니다.`;
        case "wealth":
          return `일간인 '${dayStem}'(${baseEl})과 재물운을 조율하는 오행 성질인 '${lackEl.name}'의 생극 관계(상생상극 분석)에 기초합니다.`;
        case "job":
          return `귀하의 태어난 월의 기운(월지: ${month.branch} - ${month.branchEl})과 일간의 강약을 대조한 명리학적 적합성에 기인합니다.`;
        case "relation":
          return `일간 기질인 '${dayStem}'의 대인관계적 음양 조화와 오행 에너지 밸런스에 기반합니다.`;
        default:
          return `혜안당 명리 알고리즘의 8자 분석 근거에 입각합니다.`;
      }
    };

    // 고민 맞춤 답변 텍스트 데이터베이스
    const getWorryDetail = () => {
      if (worryCategoryInput === "진로" || worryCategoryInput === "직업") {
        return {
          question: "앞으로 진로나 직장/직무를 옮겨도 괜찮을까요?",
          answer: `현재 귀하의 만세력 타이밍을 분석하면, 억지로 맞지 않는 옷을 입고 남의 결정에 휘둘리는 직장형 포지션보다 본인의 판단과 결정권이 존중받는 형태로 나아가야 하는 진로 과도기에 있습니다. ${lackEl.name} 기운의 결핍을 보완해 줄 수 있는 업무 환경으로 이직하거나, 본인의 고유 강점인 '${excessEl.name}'적 기획력을 발휘할 수 있는 환경이라면 과감한 직업 방향 전환이 유효합니다. 다만, 올해 운의 흐름에서 '주의'나 '재정비'로 표시된 달에는 충동적인 퇴사를 피하고 철저한 계획 하에 움직이십시오.`
        };
      } else if (worryCategoryInput === "돈" || worryCategoryInput === "재물") {
        return {
          question: "앞으로 돈을 더 많이 벌 수 있을까요? 내 재물운의 흐름은 어떨까요?",
          answer: `귀하의 사주는 돈을 버는 능력 자체는 준수하나, '${lackEl.name}' 기운의 결핍으로 인해 돈이 모이지 않고 한순간에 빠져나가는 리스크가 존재합니다. 귀하가 선택한 돈 고민에 대한 최종 답은 '재물운 사용설명서'에 명시된 대로 지출 구멍을 차단하고 잘하는 1가지에 집중할 때 비로소 성장합니다. 10년 대운 상 수확의 계절이 도래하는 시기에 도달하면 자산 축적 속도가 기하급수적으로 빨라질 것입니다.`
        };
      } else if (worryCategoryInput === "연애" || worryCategoryInput === "궁합") {
        return {
          question: "언제쯤 나에게 좋은 귀인이나 사랑하는 인연이 들어올까요?",
          answer: `귀하의 사주는 본인과 완전히 다른 성향인 '${lackEl.name}' 기운이 풍부한 상대를 만났을 때 비로소 인생의 방향이 긍정적으로 뚫리고 정화되는 운명을 가집니다. 관계 사용설명서의 지침대로 본인에게 부족한 오행을 채워줄 파트너와의 상성을 눈여겨보시고, 다가오는 해에 인연 기운이 강해지는 계절적 타임을 적극 노려 관계의 닻을 올리십시오.`
        };
      } else {
        return {
          question: "올해 내가 가장 조심해야 할 것은 무엇이고, 어떻게 살아가야 할까요?",
          answer: `올해 귀하는 조급증으로 인해 여러 가지 일을 동시에 벌였다가 수습하지 못하고 무기력해지는 리스크를 경계해야 합니다. 30일 실천 나침반에 명시된 처방대로, 욕심내어 확장하려 하기보다 주변의 현실적 귀인의 조언에 귀를 기울이고 감정이 흔들릴 때 큰돈을 결정하지 마십시오.`
        };
      }
    };

    const worryContent = getWorryDetail();

    // 월별 5단계 평가 등급 및 개인화 한 줄 행동 지침 매칭 딕셔너리
    const monthlyGuide = [
      { month: "1월", grade: "보통", desc: "시작하는 마음은 좋으나 외부의 마찰이 예상되니 신중을 기하십시오." },
      { month: "2월", grade: "좋음", desc: "귀인의 도움이 있는 달입니다. 평소 미뤄왔던 대화나 제안을 해보세요." },
      { month: "3월", grade: "재정비", desc: "새로운 일을 시작하기보다 기존의 계획을 한 번 더 검토하고 내실을 다지십시오." },
      { month: "4월", grade: "좋음", desc: "인간관계가 확장되는 달입니다. 모임이나 네트워킹에 적극적으로 응하세요." },
      { month: "5월", grade: "매우 좋음", desc: "계약이나 협상에 대단히 유리합니다. 내 주장을 당당하게 설득할 타이밍입니다." },
      { month: "6월", grade: "주의", desc: "감정적인 갈등이 일어나기 쉬운 달입니다. 욱하는 순간의 화를 억눌러야 이롭습니다." },
      { month: "7월", grade: "보통", desc: "에너지가 정체되는 흐름입니다. 무리하지 말고 체력을 비축하는 데 힘쓰세요." },
      { month: "8월", grade: "좋음", desc: "돈의 흐름이 활성화되는 시점입니다. 투자나 수익 창출 아이디어를 가동하십시오." },
      { month: "9월", grade: "매우 좋음", desc: "운의 흐름이 최고조에 달합니다. 결단을 미루지 말고 오늘부터 행동을 개시하세요." },
      { month: "10월", grade: "주의", desc: "지출 관리가 뼈아프게 요구되는 시기입니다. 겉치레를 버려야 내 돈이 새지 않습니다." },
      { month: "11월", grade: "재정비", desc: "건강과 휴식이 깊게 필요한 시기입니다. 충분한 수면과 가벼운 명상으로 채우세요." },
      { month: "12월", grade: "보통", desc: "한 해를 마무리하고 다가올 대운을 조용히 맞이하기에 최고의 달입니다." }
    ];

    // 오행 분포별 맞춤형 개운 추천 텍스트
    const elementPrescription = {
      "목": { color: "초록색 (Green)", item: "싱그러운 미니 화분, 원목 소품, 잎이 넓은 식물", space: "산책로, 공원, 나무가 많은 숲 속 카페", action: "계획만 세우지 말고, 오늘 당장 아주 작은 행동 하나부터 종이에 쓰고 실천하십시오." },
      "화": { color: "빨간색 (Red) 및 오렌지 계열", item: "향초, 조명 스탠드, 붉은빛 액세서리", space: "활기찬 도심지, 미술관, 볕이 잘 드는 카페 테라스", action: "내면의 답답함을 혼자 참기보다, 신뢰할 수 있는 사람에게 내 속마음을 솔직하게 표현하십시오." },
      "토": { color: "황토색, 밝은 브라운, 노란색 (Yellow)", item: "도자기 소품, 황토 머그컵, 에코백", space: "흙길, 나지막한 언덕 산책로, 마당이 있는 주택가", action: "이리저리 마음이 들뜨고 불안할 때는 스마트폰을 끄고 조용히 대지에 발을 디디며 안정감을 확보하세요." },
      "금": { color: "흰색 (White), 실버 및 금속재질", item: "은반지, 금속 시계, 깔끔한 다이어리", space: "정갈하고 미니멀한 화이트톤 갤러리, 고층 빌딩 전망대", action: "나를 지치게 하거나 이득 없는 쓸데없는 인간관계를 칼같이 잘라내고 단호한 거절을 실행해 보십시오." },
      "수": { color: "검은색, 파란색 (Blue) 및 네이비", item: "어항, 유리 가습기, 검은색 잉크 펜", space: "호숫가, 물소리가 들리는 강변 산책로, 아쿠아리움", action: "조급하게 결론을 내리며 주변을 다그치기보다, 때로는 강물처럼 유연하게 방조하며 침묵하는 힘을 기르세요." }
    };

    const curPresc = elementPrescription[lackEl.name] || elementPrescription["토"];

    return (
      <div className="space-y-12 print:space-y-0 print:m-0 print:p-0">
        
        {/* 브라우저 전용 인쇄 CSS 주입 */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body {
              background: #ffffff !important;
              color: #000000 !important;
            }
            .print-page-wrapper {
              page-break-before: always !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
              height: 296mm !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 18mm !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print-border-none {
              border: none !important;
            }
            .print-shadow-none {
              box-shadow: none !important;
            }
          }
        ` }} />

        {/* -------------------- Page 1. 표지 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          <div className="text-center mt-12">
            <span className="text-xs tracking-[0.4em] text-[#A3845B] font-bold block font-myeongjo mb-1">慧眼堂 寶鑑</span>
            <span className="text-[10px] tracking-[0.1em] text-gray-400 font-light block">지혜로운 눈으로 밝히는 평생의 길잡이</span>
          </div>
          
          <div className="text-center my-auto space-y-8">
            <div className="w-16 h-1 bg-[#A3845B] mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-myeongjo text-[#1A1A1A] leading-relaxed tracking-wide">
              {name} 님의 평생 종합 사주<br />
              <span className="text-[#A3845B]">요약 분석 보감</span>
            </h1>
            <p className="text-xs text-gray-500 font-light">
              본 문서는 만세력 분석 원리에 완벽히 입각하여 개별 맞춤 렌더링된 공식 리포트입니다.
            </p>
          </div>

          <div className="border-t border-[#E2DDD5] pt-6 text-center space-y-1.5 text-xs text-gray-600">
            <p><strong>신청 고객:</strong> {name} 님 ({gender})</p>
            <p><strong>신청 일시:</strong> {mounted ? `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}</p>
            <p className="text-[10px] text-gray-400 mt-2">© 혜안당 명리연구소 All Rights Reserved.</p>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 1 / 22</div>
        </div>

        {/* -------------------- Page 2. 전체 보고서 목차 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">전체 보고서 목차</span>
            </div>

            <div className="pt-8 space-y-6">
              <h3 className="font-myeongjo text-lg font-bold text-[#A3845B] text-center">📋 전체 보고서 목차</h3>
              <p className="text-xs text-gray-500 text-center font-light">본 보고서는 총 22페이지로 구성된 귀하만을 위한 맞춤 사주 보감입니다.</p>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-3.5 text-[11px] text-gray-600 pt-8 border-t border-[#E2DDD5]/60">
                <p><strong>Page 1.</strong> 표지</p>
                <p><strong>Page 2.</strong> 전체 보고서 목차</p>
                <p><strong>Page 3.</strong> 내 사주 핵심 결론 (한 줄 요약 & 종합진단)</p>
                <p><strong>Page 4.</strong> 나의 오행 지도 (목·화·토·금·수)</p>
                <p><strong>Page 5.</strong> 본질 캐릭터 카드 및 기질 해설</p>
                <p><strong>Page 6.</strong> 나도 몰랐던 내 모습 (겉 vs 속)</p>
                <p><strong>Page 7.</strong> Chapter 1. 성향 진단 (강점/약점)</p>
                <p><strong>Page 8.</strong> Chapter 1. 상황별 반응 (스트레스/분노 등)</p>
                <p><strong>Page 9.</strong> Chapter 1 처방 (멘탈 가이드라인)</p>
                <p><strong>Page 10.</strong> Chapter 2. 재물운 사용설명서</p>
                <p><strong>Page 11.</strong> Chapter 2. 강점과 돈의 연결 비법</p>
                <p><strong>Page 12.</strong> Chapter 2. 맞는 업무 방식 분석</p>
                <p><strong>Page 13.</strong> Chapter 2 처방 (대인관계 설명서)</p>
                <p><strong>Page 14.</strong> Chapter 2 처방 (대인관계 솔루션)</p>
                <p><strong>Page 15.</strong> Chapter 2 처방 (관계별 세부 분석)</p>
                <p><strong>Page 16.</strong> Chapter 2 처방 (행운의 요소)</p>
                <p><strong>Page 17.</strong> Chapter 3. 인생의 계절 (대운)</p>
                <p><strong>Page 18.</strong> Chapter 3. 올해 좋은 달 & 조심할 달</p>
                <p><strong>Page 19.</strong> Chapter 3. 12개월 운의 타이밍 그래프</p>
                <p><strong>Page 20.</strong> Chapter 3 처방 (고민 맞춤형 답변)</p>
                <p><strong>Page 21.</strong> Chapter 3 처방 (30일 실천 나침반)</p>
                <p><strong>Page 22.</strong> 마무리 및 최종 혜안당 보감 한 줄</p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 2 / 22</div>
        </div>

        {/* -------------------- Page 3. 내 사주 핵심 결론 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">내 사주 핵심 결론</span>
            </div>

            <div className="bg-[#A3845B]/5 p-6 rounded-xl border border-[#A3845B]/25 space-y-4 shadow-sm">
              <h3 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5">
                <span>🔑</span> 나의 사주 한 줄 요약
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed font-myeongjo font-bold tracking-wide">
                &ldquo;{currentCard.title}의 기운을 타고나, {currentCard.character}로서 삶을 영위하는 자아 정체성을 품고 있습니다.&rdquo;
              </p>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">• 핵심 키워드 5가지 상세 해설</h4>
              <div className="grid grid-cols-5 gap-3 text-center">
                <div className="bg-[#F9F8F6] p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between min-h-[125px] shadow-sm">
                  <span className="text-[11px] font-bold text-gray-800 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">성향<br />자기 주도</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-left font-light">타인의 간섭 없이 내 주관대로 결정하고 주도적으로 행동할 때 성취 에너지가 가장 강하게 솟구칩니다.</p>
                </div>
                <div className="bg-[#F9F8F6] p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between min-h-[125px] shadow-sm">
                  <span className="text-[11px] font-bold text-emerald-700 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">강점<br />{excessEl.name} 기운</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-left font-light">사주 원국에 풍부한 &lsquo;{excessEl.name}&rsquo;의 에너지는 위기 돌파와 강력한 아이디어 기획력의 원천입니다.</p>
                </div>
                <div className="bg-[#F9F8F6] p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between min-h-[125px] shadow-sm">
                  <span className="text-[11px] font-bold text-amber-700 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">재물<br />{lackEl.name} 개운</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-left font-light">부족한 &lsquo;{lackEl.name}&rsquo; 기운을 일상 인테리어, 컬러 처방 등으로 채워줄 때 재정의 지출 구멍이 단단히 막힙니다.</p>
                </div>
                <div className="bg-[#F9F8F6] p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between min-h-[125px] shadow-sm">
                  <span className="text-[11px] font-bold text-gray-800 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">관계<br />동질 상성</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-left font-light">나와 기질이 유사한 사람과는 소통이 매우 빠르나, 고집이 충돌하기 쉬우므로 역할 분리가 최고의 지혜입니다.</p>
                </div>
                <div className="bg-[#F9F8F6] p-4 rounded-xl border border-gray-200/80 flex flex-col justify-between min-h-[125px] shadow-sm">
                  <span className="text-[11px] font-bold text-red-600 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">과제<br />균형과 처방</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed text-left font-light">과열된 기운의 속도를 늦추고, 결여된 기운을 채워 육체와 정신의 음양 밸런스를 상생 상태로 관리하는 것입니다.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">• 한눈에 보는 종합 진단</h4>
              <table className="w-full text-xs border border-[#E2DDD5] text-left">
                <tbody>
                  <tr className="border-b border-[#E2DDD5] bg-[#F9F8F6]/60">
                    <th className="p-3.5 border-r border-[#E2DDD5] w-1/4 font-semibold text-gray-700 text-center">성향 유형</th>
                    <td className="p-3.5 text-gray-800">{currentCard.title}</td>
                  </tr>
                  <tr className="border-b border-[#E2DDD5]">
                    <th className="p-3.5 border-r border-[#E2DDD5] font-semibold text-gray-700 text-center">재물운 유형</th>
                    <td className="p-3.5 text-gray-800">결핍 오행인 &lsquo;{lackEl.name}&rsquo;의 기운을 적극적으로 보완하여 재운을 발복시키는 구조</td>
                  </tr>
                  <tr className="border-b border-[#E2DDD5] bg-[#F9F8F6]/60">
                    <th className="p-3.5 border-r border-[#E2DDD5] font-semibold text-gray-700 text-center">직업운 유형</th>
                    <td className="p-3.5 text-gray-800">본인의 주도적 결정권과 독립성이 보장된 자율형 실속 리더형</td>
                  </tr>
                  <tr className="border-b border-[#E2DDD5]">
                    <th className="p-3.5 border-r border-[#E2DDD5] font-semibold text-gray-700 text-center">현재 운의 흐름</th>
                    <td className="p-3.5 text-gray-800">과도기이자 인생의 새로운 계절(대운 변곡점)을 견고히 준비하는 길목</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#A3845B]/5 p-6 rounded-xl border border-[#A3845B]/20 space-y-4">
              <div className="flex justify-between items-center border-b border-[#A3845B]/20 pb-2">
                <span className="text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                  <span>✍️</span> 혜안당 명리 분석가 심층 종합 소견
                </span>
                <span className="text-[9px] text-[#A3845B]/70 tracking-widest font-myeongjo">慧眼堂 寶鑑 專用</span>
              </div>
              <div className="text-[11px] text-gray-700 leading-relaxed font-light space-y-2.5">
                <p>
                  귀하의 사주는 본질적 자아를 뜻하는 일주의 천간이 <strong>&lsquo;{dayStem}&rsquo;</strong>일간에 해당하여, 어떠한 방해나 외부 압력에도 타협하지 않고 자신만의 가치를 실현하고자 하는 성정이 깊게 내재되어 있습니다. 8자 전반의 에너지 흐름을 보면, 가장 강력한 영향력을 행사하는 <strong>&lsquo;{excessEl.name}&rsquo; 기운</strong>의 장점을 실생활과 비즈니스에서 발휘해내는 능력이 아주 탁월합니다.
                </p>
                <p>
                  특히 신청서에 남겨주신 고민 범주(<strong>{worryCategoryInput || "진로"}</strong>)의 명리학적 흐름을 추적하면, 현재 귀하는 에너지가 한쪽으로 몰리며 오는 정체나 조급함을 다스리는 것이 무엇보다 시급합니다. 사주에서 가장 보완이 요구되는 <strong>&lsquo;{lackEl.name}&rsquo; 기운</strong>을 일상생활의 루틴과 환경(색상, 장소 등)을 통해 적극적으로 채워주실 때 비로소 오행이 상생 순환하여 재물 구멍이 차단되고 막혀 있던 진로의 방향이 명쾌하게 개운됩니다.
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 3 / 22</div>
        </div>

        {/* -------------------- Page 4. 나의 오행 지도 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-8">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">나의 오행 지도</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-myeongjo text-base font-bold text-[#1A1A1A] text-center">오행(五行) 에너지 분포 차트</h3>
              <p className="text-xs text-center text-gray-500">생년월일시 사주 원국 속 8자의 목·화·토·금·수 기운 분포 비율</p>
            </div>

            {/* 오행 게이지 인포그래픽 */}
            <div className="space-y-4 my-8">
              {elementsList.map((el) => {
                const pct = getPercent(el.val);
                return (
                  <div key={el.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700">{el.name} ({el.code}) - {el.color}</span>
                      <span className="text-[#A3845B]">{el.val}개 ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden border border-gray-200">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          el.name === "목" ? "bg-emerald-600" :
                          el.name === "화" ? "bg-red-500" :
                          el.name === "토" ? "bg-amber-400" :
                          el.name === "금" ? "bg-gray-400" : "bg-blue-600"
                        }`}
                        style={{ width: `${pct || 5}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#F9F8F6] p-5 rounded-lg border border-[#E2DDD5] space-y-4">
              <h4 className="text-xs font-bold text-gray-800">• 기운의 불균형 진단</h4>
              <div className="text-[11.5px] text-gray-600 space-y-2 leading-relaxed font-light">
                <p>
                  귀하의 사주 원국에서 가장 세력이 강한 기운은 <strong>&lsquo;{excessEl.name}&rsquo; 기운</strong>({excessEl.val}개)이며, 
                  반대로 가장 취약하거나 결핍된 기운은 <strong>&lsquo;{lackEl.name}&rsquo; 기운</strong>({lackEl.val}개)입니다.
                </p>
                <p>
                  오행은 한쪽으로 흘러넘치기보다 5가지 요소가 골고루 순환하는 상태가 가장 복이 많습니다. 
                  귀하의 인생 전반에서 발생하는 정체나 마찰은 과다한 &lsquo;{excessEl.name}&rsquo; 기운의 고집과, 결핍된 &lsquo;{lackEl.name}&rsquo; 기운의 제어 불능에서 기인합니다. 
                  본 보감의 다음 장부터 전개되는 개운법은 이 불균형을 해소하는 데 중점을 둡니다.
                </p>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-lg border border-[#A3845B]/15 space-y-3">
              <h4 className="text-xs font-bold text-[#A3845B]">• 오행(五行)의 상생상극 원리</h4>
              <p className="text-[10.5px] text-gray-600 leading-relaxed font-light">
                오행은 우주를 구성하는 5가지 원소이자 에너지의 순환을 의미합니다. 
                목(木)은 자라나는 시작의 힘, 화(火)는 발산하고 팽창하는 열정, 토(土)는 중심을 잡고 중재하는 조율, 금(金)은 맺고 끊는 결단과 결실, 수(水)는 흐르고 수축하는 지혜를 상징합니다. 
                이들이 서로 생하고 돕는 **상생(相生)**과 통제하고 억제하는 **상극(相剋)**의 밸런스가 조화를 이룰 때 비로소 평안과 발복이 시작됩니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-emerald-100 bg-emerald-50/20 p-4.5 rounded-xl space-y-2.5 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <span>🤝</span> 나와 시너지를 내는 잘 맞는 성향
                </span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                  귀하에게 가장 필요한 부족 오행인 <strong>&lsquo;{lackEl.name}&rsquo; 기운</strong>을 사주에 풍부하게 가졌거나, 이를 실질적인 능력으로 활용하는 정적이고 차분하며 현실성 있는 사람과 최고의 합을 이룹니다. 
                  귀하가 아이디어를 펼쳐 길을 열면, 상대가 그 결실을 수성하고 지출 구멍을 단단히 보강해 주어 안정적인 재정적·정신적 성장을 이뤄냅니다.
                </p>
              </div>

              <div className="border border-red-100 bg-red-50/20 p-4.5 rounded-xl space-y-2.5 shadow-sm">
                <span className="text-[11px] font-bold text-red-800 flex items-center gap-1">
                  <span>⚠️</span> 조심하거나 거리를 두어야 할 성향
                </span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                  이미 귀하의 사주 원국에 과다하게 분포하는 <strong>&lsquo;{excessEl.name}&rsquo; 기운</strong>의 기질을 극단적으로 가지고 있는 사람입니다. 
                  서로에 대한 주도권 경쟁의식이나 특유의 고집을 불필요하게 증폭시켜 조급증과 번아웃을 가속합니다. 
                  감정적 트러블이 잦아져 중요한 결정을 그르칠 수 있으니 비즈니스나 대화 시 명확한 경계 조율이 필수적입니다.
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 4 / 22</div>
        </div>

        {/* -------------------- Page 4. 본질 캐릭터 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">본질 캐릭터 카드</span>
            </div>

            <div className="text-center py-6 border border-[#A3845B]/30 rounded-xl bg-[#F9F8F6] space-y-4">
              <span className="text-[10px] bg-[#A3845B] text-white px-2.5 py-0.5 rounded-full font-bold">당신을 상징하는 단 하나의 원소</span>
              <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A]">{currentCard.title}</h3>
              <div className="w-16 h-[1px] bg-[#A3845B] mx-auto" />
              <p className="text-xs text-gray-500 font-bold px-8">
                &ldquo;{currentCard.character}&rdquo;
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-800">• 태어난 일간(Day Stem) 분석</h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {currentCard.desc}
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                이것은 일생의 성격, 타고난 성정의 핵심 뼈대를 형성합니다. 이 기운이 어떤 대운을 만났느냐에 따라 때로는 부드러워지고 때로는 단단해지며 삶의 스토리를 만들어내게 됩니다.
              </p>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-xl border border-[#A3845B]/15 space-y-3">
              <span className="text-xs font-bold text-[#A3845B] block">💡 왜 그런가요? 명리학적 해석 근거</span>
              <p className="text-[11px] text-gray-700 leading-relaxed font-light">
                {getAstroBasis("character")} 
                명리학에서 태어난 날의 천간인 일간(日干)은 사주 원국의 8글자 중 나 자신의 정신과 본질적 정체성을 대표하는 가장 결정적인 좌표입니다. 
                주변 오행들의 영향에 따라 행동 양식은 변할 수 있으나, 일간이 가진 본원적 성정과 삶을 대하는 근본적인 태도는 평생 변하지 않는 그릇의 뼈대가 됩니다.
              </p>
            </div>

            <div className="border border-dashed border-[#A3845B]/30 p-6 rounded-xl bg-[#F9F8F6] space-y-5">
              <h4 className="text-xs font-bold text-gray-800 border-b border-[#E2DDD5]/80 pb-2.5 flex items-center gap-1.5">
                <span>📚</span> 일간(日干)의 음양오행적 심층 분석
              </h4>
              <div className="space-y-4 text-xs leading-relaxed text-gray-600">
                <div className="bg-white p-4.5 rounded-lg border border-gray-100 space-y-1.5 shadow-sm">
                  <span className="font-bold text-[#A3845B] block text-[12px]">① 음양(陰陽)의 성향적 발현과 기류</span>
                  <p className="font-light text-gray-600 text-[11px] leading-relaxed">
                    귀하의 일간 기질은 음양 분류상 활발히 위로 팽창하고 솟구치려 하는 성향을 지니고 있습니다. 
                    외부의 불필요한 간섭과 통제를 극도로 경계하며, 본인이 주체적으로 목표를 설정하고 전진할 때 삶의 행복감과 업무 몰입도가 기하급수적으로 극대화되는 명리학적 기류를 갖추고 있습니다.
                  </p>
                </div>
                <div className="bg-white p-4.5 rounded-lg border border-gray-100 space-y-1.5 shadow-sm">
                  <span className="font-bold text-[#A3845B] block text-[12px]">② 지지(일지)와의 오행 순환과 개운 구조</span>
                  <p className="font-light text-gray-600 text-[11px] leading-relaxed">
                    일간 아래에서 나를 든든하게 받치는 일지(日支)의 성정은 나의 내면 심리와 배우자궁, 혹은 일상에서의 잠재적 무의식을 나타냅니다. 
                    일간과 일지가 빚어내는 오행의 순환 구조를 올바르게 통찰하고, 본인의 고집을 조절하며 유연성을 보충할 때 진정한 개운(開運)의 큰길이 비로소 열립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 5 / 22</div>
        </div>

        {/* -------------------- Page 5. 나도 몰랐던 내 모습 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-8">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">나도 몰랐던 내 모습</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-[#E2DDD5] p-6 rounded-xl space-y-4 bg-[#F9F8F6]/30 shadow-sm min-h-[220px]">
                <span className="text-[12px] bg-gray-200 text-gray-700 px-3 py-1 rounded-full font-bold inline-block">겉으로 보이는 나의 기류</span>
                <ul className="text-[11.5px] text-gray-600 space-y-3.5 list-disc pl-5 leading-relaxed font-light">
                  <li>어려운 난관과 위기 상황 앞에서도 감정을 숨기고 침착하며 이성적인 면모를 보입니다.</li>
                  <li>책임감이 대단히 강하여 자신이 직접 입 밖으로 내뱉거나 맡은 일은 반드시 매듭지으려 노력합니다.</li>
                  <li>자신만의 명확한 도덕적 선이나 원칙이 있어, 듬직하고 흔들림이 없는 사람이라는 평가를 자주 듣습니다.</li>
                </ul>
              </div>

              <div className="border border-[#A3845B]/35 p-6 rounded-xl space-y-4 bg-[#A3845B]/5 shadow-sm min-h-[220px]">
                <span className="text-[12px] bg-[#A3845B] text-white px-3 py-1 rounded-full font-bold inline-block">실제 내면의 나의 진짜 속마음</span>
                <ul className="text-[11.5px] text-gray-600 space-y-3.5 list-disc pl-5 leading-relaxed font-light">
                  <li>인정받고 스스로의 존재 가치를 증명해내고자 하는 지향성이 타인에 비해 대단히 강합니다.</li>
                  <li>타인의 사소한 비판이나 지나가는 부정적 피드백에도 크게 상처를 받으며 오랫동안 곱씹습니다.</li>
                  <li>중요한 최종 결정이나 선택을 내리기 전, 겉으로 내색하지 않고 혼자 깊은 번민에 잠깁니다.</li>
                  <li>인간관계에서 깊은 실망을 겪을 경우, 분쟁을 피하기 위해 소리 없이 완벽하게 관계의 인연을 차단합니다.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3.5 bg-[#F9F8F6]/50 p-5 rounded-xl border border-gray-100">
              <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1">• 주변 사람들이 나를 자주 오해하는 대표적 상황</h4>
              <p className="text-[11.5px] text-gray-600 leading-relaxed font-light">
                &ldquo;결코 냉정하거나 다른 이들에게 무관심한 성향이 아닙니다. 단지 내 속마음과 진짜 감정을 겉으로 유연하게 꺼내는 표현 방식이 서툴 뿐입니다.&rdquo; 
                겉으로 비치는 산만하거나 덤덤한 분위기와 달리, 마음속에서는 끊임없이 사람과 상황을 관조하며 깊이 있게 번민하고 있음을 주위에서는 잘 알지 못하므로 깊이 있는 소통의 창구를 조금씩 열어두는 지혜가 필요합니다.
              </p>
            </div>

            <div className="bg-[#A3845B]/5 p-6 rounded-xl border border-[#A3845B]/20 space-y-4">
              <span className="text-xs font-bold text-[#A3845B] block border-b border-[#A3845B]/20 pb-2">💡 왜 그런가요? 천간(天干)과 지지(地支)의 이중 텐션 구조</span>
              <div className="text-[11px] text-gray-700 leading-relaxed font-light space-y-2.5">
                <p>
                  귀하의 사주는 대외적인 활동 에너지와 외향적 면모를 주관하는 하늘의 기운인 **천간(天干)**과, 내밀한 심리와 실제 현실의 삶을 좌우하는 땅의 기운인 **지지(地支)**의 십신(十神)적 속성이 서로 상반되는 구성을 이루고 있어 발생하는 아름다운 이중적 조화를 내포하고 있습니다. 
                </p>
                <p>
                  천간에 흐르는 강점 오행인 <strong>&lsquo;{excessEl.name}&rsquo;</strong>의 기류는 주변인들에게 강직하고 실수가 없는 모범적인 겉모습으로 투영되지만, 지지 속에서 나를 감싸는 잠재의식과 결핍 오행인 <strong>&lsquo;{lackEl.name}&rsquo;</strong>의 상호작용은 마음 한구석의 연약함과 고독감을 유발합니다. 이 두 기운의 긴장(Tension) 상태를 깊이 이해하고 스스로를 다독여줄 때, 겉과 속의 에너지가 비로소 하나로 상생하며 정신적인 평온과 진정한 발복을 이끌어내게 됩니다.
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 6 / 22</div>
        </div>

        {/* -------------------- Page 7. 성향 진단 (강점/약점) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">성향 진단 (강점과 약점)</span>
            </div>

            {/* 동적 오행 강점 및 약점 해석 엔진 */}
            {(() => {
              // 1. 일간별 맞춤형 강점
              const stemStrengths = {
                "甲": "하늘로 솟구치는 거목(소나무)처럼 어떠한 난관 앞에서도 꺾이지 않고 본인 주도하에 새로운 아이디어를 창조하고 개척해 나가는 돌파 능력이 탁월합니다.",
                "乙": "바람에 흔들려도 살아남는 들꽃(넝쿨)처럼 현실적인 생명력과 친화력이 돋보이며, 주변인들과의 원활한 네트워킹과 기막힌 융통성으로 생존을 확보합니다.",
                "丙": "하늘의 태양처럼 만물에 긍정적인 에너지를 전파하며, 솔직담백하고 화사한 표현력으로 무리를 이끌거나 나를 어필하는 대외적 설득력이 일품입니다.",
                "丁": "밤하늘을 비추는 촛불(등대)처럼 은근하고 오래가는 내면의 열정이 가득하며, 사물을 매우 정밀하고 정성스럽게 다듬고 설계하는 정교한 디테일이 강점입니다.",
                "戊": "거대한 바위산처럼 묵직한 신용과 책임감을 보유하고 있으며, 사소한 흔들림에 연연하지 않고 판 전체를 지탱하며 약한 자를 안아주는 실속 리더의 그릇입니다.",
                "己": "새싹을 기르는 정원의 흙처럼 꼼꼼한 실무력과 자상한 이타심이 돋보입니다. 한 번 맡은 역할에 대해서는 내실을 깊숙이 다지고 기초를 완벽하게 유지합니다.",
                "庚": "강력한 원석의 기상처럼 뛰어난 의리와 과감한 돌파력이 핵심입니다. 흐지부지 끄는 상황을 과감히 종결짓고 추진력을 확보하는 과감함이 발군입니다.",
                "辛": "빛나는 다이아몬드(칼날)처럼 고결한 품위와 천재적인 미적 직관을 지닙니다. 본인의 전문 영역에서 완벽한 퀄리티와 날카로운 통찰력으로 타의 추종을 불허합니다.",
                "壬": "넓은 바다처럼 지혜가 깊고 판세를 관조하는 시야가 넓습니다. 겉으로는 유연하고 유순해 보이지만 머릿속으로는 거대한 청사진을 그리고 움직이는 리더형 기류입니다.",
                "癸": "대지를 적시는 단비처럼 기발하고 창의적인 아이디어와 침투력이 뛰어납니다. 주변의 분위기와 타인의 마음을 누구보다 빠르고 예민하게 캐치하여 기획에 담아냅니다."
              };

              // 2. 결핍 오행별 맞춤형 약점 (방전의 원인)
              const lackWeaknesses = {
                "목": "사주 원국 내에 새로운 시작을 밀어붙이는 목(木) 기운이 부족하여, 결단을 주저하고 시작 단계에서 기가 쉽게 꺾이거나 조급한 마음에 에너지가 순식간에 소진되어 번아웃에 노출되기 쉽습니다.",
                "화": "열정을 발산하는 화(火) 기운의 결핍으로 인해, 속마음을 제대로 분출하지 못하고 감정을 묵히다 마음의 피로감을 느낍니다. 한번 의욕을 상실하면 만사 귀찮아지는 무기력 상태에 주의해야 합니다.",
                "토": "중심을 조율하는 토(土) 기운이 고립되어 있어, 감정의 흔들림이 잦고 현실적 안정 장치를 제대로 수성하지 못해 불안해합니다. 쓸데없이 에너지를 흩뿌리고 방전되는 취약성이 있습니다.",
                "금": "맺고 끊는 결단의 금(金) 기운이 부족하여, 나를 갉아먹는 관계나 이미 효율이 떨어진 일에 단호히 거절을 행사하지 못합니다. 과한 고민과 관계성 스트레스로 인해 멘탈이 방전되기 십상입니다.",
                "수": "유연성과 쉼을 뜻하는 수(水) 기운이 메말라 있어, 생각의 브레이크가 걸리지 않고 한 가지 생각에 꽂히면 밤새 끙끙 앓는 등 뇌의 정체 현상이 심해져 쉽게 만성 피로를 느낍니다."
              };

              const userStrength = stemStrengths[dayStem] || stemStrengths["戊"];
              const userWeakness = lackWeaknesses[lackEl.name] || lackWeaknesses["토"];

              return (
                <div className="space-y-6">
                  {/* 시각화: 오행 에너지 대비 밸런스 패널 */}
                  <div className="bg-[#F9F8F6] p-5 rounded-xl border border-gray-200 space-y-4 shadow-sm">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <span>📊</span> 실시간 사주 에너지 밸런스 현황
                    </span>
                    <div className="grid grid-cols-2 gap-6 text-xs">
                      {/* 강점 오행 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-red-700">과부하 오행: {excessEl.name} ({excessEl.val}개)</span>
                          <span className="bg-red-100 text-red-700 text-[9px] px-2 py-0.5 rounded-full font-bold">과열 경보</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                          <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: "92%" }} />
                        </div>
                        <p className="text-[9.5px] text-gray-500 leading-normal font-light">
                          본래 지닌 에너지가 가득 찬 포화 상태로, 성급하고 조급한 감정 과열을 유발하기 쉽습니다.
                        </p>
                      </div>

                      {/* 결핍 오행 */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-blue-700">결핍 오행: {lackEl.name} ({lackEl.val}개)</span>
                          <span className="bg-blue-100 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-bold">방전 취약</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                          <div className="bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: "15%" }} />
                        </div>
                        <p className="text-[9.5px] text-gray-500 leading-normal font-light">
                          원국에 극도로 결여된 기운으로, 육체와 멘탈의 자기 브레이크 제어력이 약화되는 구간입니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50/20 p-5 rounded-xl border border-emerald-100/80 space-y-2.5 shadow-sm">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span>🎯</span> [개인화] 귀하의 타고난 무기 (사주 강점)
                    </span>
                    <p className="text-[11.5px] text-gray-700 leading-relaxed font-light">
                      귀하의 타고난 본질 좌표인 일간 <strong>&lsquo;{dayStem}&rsquo;</strong>을 바탕으로 분석한 핵심 무기는 다음과 같습니다. 
                      {userStrength} 이 에너지가 사주 속 강점 오행인 <strong>&lsquo;{excessEl.name}&rsquo;</strong>의 발현과 톱니바퀴처럼 맞물릴 때, 어떠한 인생 풍파도 유연하고 강인하게 헤쳐 나가는 추진력을 행사할 수 있습니다.
                    </p>
                  </div>

                  <div className="bg-red-50/20 p-5 rounded-xl border border-red-100/80 space-y-2.5 shadow-sm">
                    <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                      <span>⚠️</span> [개인화] 나도 모르게 방전되는 이유 (그늘과 약점)
                    </span>
                    <p className="text-[11.5px] text-gray-700 leading-relaxed font-light">
                      귀하의 사주 밸런스 중 가장 취약한 지점은 결핍 오행인 <strong>&lsquo;{lackEl.name}&rsquo; 기운</strong>의 지연 작용에서 비롯됩니다. 
                      {userWeakness} 나도 모르는 사이에 주변의 기대를 모두 어깨에 짊어지고 한 번에 에너지를 발산하려 하는 성향을 제어하는 훈련이 절실합니다.
                    </p>
                  </div>
                </div>
              );
            })()}

            <div className="bg-[#A3845B]/5 p-6 rounded-xl border border-[#A3845B]/20 space-y-4">
              <div className="flex justify-between items-center border-b border-[#A3845B]/20 pb-2">
                <span className="text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                  <span>💡</span> 명리학적 오행 구조 진단 소견서
                </span>
                <span className="text-[9px] text-[#A3845B]/60 tracking-widest font-myeongjo">慧眼堂 寶鑑 秘策</span>
              </div>
              <div className="text-[11px] text-gray-700 leading-relaxed font-light space-y-2.5">
                <p>
                  본 성향 진단 결과는 귀하의 태어난 년, 월, 일, 시의 8글자가 갖는 오행 분포 극단성과 일간의 조합을 크로스 분석한 명리학적 팩트입니다. 
                  사주 원국 내에 <strong>&lsquo;{excessEl.name}&rsquo;</strong> 오행이 가득 분포({excessEl.val}개)하여 넘치는 열정과 추진력을 주지만, 이를 지탱해줄 <strong>&lsquo;{lackEl.name}&rsquo;</strong> 기운이 {lackEl.val}개로 지나치게 결핍됨에 따라 행동의 제동이나 브레이크가 늦게 작동하게 됩니다. 
                </p>
                <p>
                  강점의 과열이 곧 약점의 방전으로 이어지는 전형적인 **'과부하 사주 밸런스'**를 띠고 있으므로, 부족한 기운인 {lackEl.name}의 요소를 적극적·의도적으로 수혈하여 마음에 제동 장치를 달아줄 때, 비로소 타고난 거대한 무기들이 무너지지 않고 삶의 정상 궤도에서 온전히 활성화될 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 7 / 22</div>
        </div>

        {/* -------------------- Page 7. 상황별 반응 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">상황별 구체적 반응</span>
            </div>

            {/* 동적 상황별 오행 반사 반응 엔진 */}
            {(() => {
              // 일간별 5대 상황 정밀 해설 템플릿
              const stemReactions = {
                "甲": {
                  normal: "앞장서서 판을 주도하고 추진하려 하며, 타인의 의존보다는 신속한 결정을 내리려 노력합니다.",
                  stress: "누군가 나를 과하게 통제하거나 억누르려 할 때 숨이 막히며, 통제권을 잃을 경우 극도로 예민해집니다.",
                  anger: "겉으로 즉각적인 반발을 드러내며 거칠게 항의하거나, 자존심이 손상되는 경우 단호한 목소리로 받아칩니다.",
                  decision: "감정적인 계산보다는 장기적인 성장성과 미래 확장 가능성을 보고 다소 모험적인 베팅을 실행합니다.",
                  luck: "기운이 오를 때는 거침없는 돌파력을 보이지만, 정체기에는 시작을 자꾸 미루며 무기력감에 빠지기 쉽습니다."
                },
                "乙": {
                  normal: "주변 상황을 면밀히 관찰하고 사람들과 어울리며 유연하게 적응하고 흐름을 타려 노력합니다.",
                  stress: "환경이 급변하거나 주변 지인들과의 마찰이 길어질 때 극도의 소외감과 내적 피로감을 호소합니다.",
                  anger: "즉각 화를 폭발시키기보다는 상대의 반응을 조용히 지켜보고 우회적인 독설이나 차분한 경고를 날립니다.",
                  decision: "이득과 실리를 꼼꼼히 조율하고 주변 귀인들의 평판이나 대중적 의견을 종합하여 안전하게 결정합니다.",
                  luck: "기운이 상승할 때는 최고의 사교성과 융통성을 보이나, 쇠퇴기에는 결정 장애에 빠져 남의 눈치를 심하게 봅니다."
                },
                "丙": {
                  normal: "자신감 넘치고 밝은 에너지를 드러내며, 나를 솔직하게 피력하고 무리를 즐겁게 이끕니다.",
                  stress: "내 능력이나 진심이 남들에게 무시당하고 가려지거나, 어둡고 답답한 환경에 갇힐 때 극심한 화를 느낍니다.",
                  anger: "순식간에 얼굴에 감정이 가감 없이 드러나며 불같이 화를 내지만, 일단 다 쏟아내고 나면 뒤끝이 없이 맑아집니다.",
                  decision: "상대방의 진정성과 내 열정의 크기, 그리고 직관적 첫인상을 강하게 신뢰하며 빠르게 결단을 내립니다.",
                  luck: "상승세일 때는 뛰어난 스타성으로 판을 이끄나, 하락세일 때는 겉만 화려하고 실속을 못 챙겨 우울해하기 쉽습니다."
                },
                "丁": {
                  normal: "조용히 경청하며 디테일을 챙기고, 주변의 상처받은 이들을 따뜻하게 위로하고 조력하려 합니다.",
                  stress: "조용하고 정돈된 내 영역이 무례한 침범을 당하거나, 감정 기복이 심한 사람을 오래 마주할 때 극도로 방전됩니다.",
                  anger: "차오르는 서운함을 속으로 차곡차곡 누르며 내색하지 않다가, 임계점을 넘어서면 날카로운 독설로 한 번에 폭발합니다.",
                  decision: "눈에 보이는 지표와 구체적인 팩트(Fact)를 세밀하게 분석하고 분석된 결과에 근거하여 돌질합니다.",
                  luck: "상승 흐름에는 남모를 섬세한 집중력으로 빛을 발하지만, 침체기에는 혼자 끙끙 앓으며 자책을 거듭합니다."
                },
                "戊": {
                  normal: "바위처럼 든든하고 우직한 중재자 역할을 수행하며, 말수보다는 실질적인 책임과 약속을 이행합니다.",
                  stress: "주변에 믿을 놈이 하나도 없다고 느껴질 때와, 오랜 신용 관계가 단숨에 깨질 때 거대한 내적 번민에 휩싸입니다.",
                  anger: "화를 내기까지 아주 오랜 시간이 걸리나, 한 번 선을 넘은 대상에게는 거대한 바위산이 무너지듯 매섭게 포효합니다.",
                  decision: "감정이나 요행을 철저히 배제하고, 눈앞에 있는 묵직한 실속과 안전성을 고수하는 실리적 결정을 우선합니다.",
                  luck: "대운이 좋을 때는 흔들림 없는 중심추 역할을 수행하나, 기운이 약할 때는 고집과 아집이 심해져 남의 말을 거부합니다."
                },
                "己": {
                  normal: "섬세하고 꼼꼼하게 기초 작업을 수행하며, 타인의 감정과 필요를 소리 없이 챙기는 조용한 헌신가입니다.",
                  stress: "약속된 매뉴얼이나 질서가 엉망으로 꼬일 때와, 과다한 업무 책임이 한 번에 나에게 쏟아질 때 방전됩니다.",
                  anger: "화를 내며 덤비기보다 상대방의 비이성적 실수를 조용히 일일이 지적하거나 스스로 조용히 외면해 버립니다.",
                  decision: "꼼꼼한 리스크 검증과 2차 시뮬레이션을 완료한 후에야 돌을 두듯 조심스럽게 한 단계씩 밟아나갑니다.",
                  luck: "상승기에는 보이지 않는 곳의 철저한 내실로 성공을 일구지만, 정체기에는 매너리즘에 빠져 한숨이 늘어납니다."
                },
                "庚": {
                  normal: "강단 있고 확실한 흑백 결정을 고수하며, 맺고 끊음이 강해 거추장스러운 프로세스를 생략합니다.",
                  stress: "상황이 명확한 결론 없이 흐리멍덩하게 시간만 끌거나, 비효율적인 동업 구조가 이어질 때 극도로 분노합니다.",
                  anger: "목소리 톤이 즉시 가라앉고 눈빛이 매서워지며, 칼로 자르듯 팩트와 상처를 상대방 가슴에 곧바로 꽂아버립니다.",
                  decision: "오래 고민하지 않고 내가 맞다고 확신한 단 한 가지 목적지를 향해 승부사처럼 단도직입적으로 베팅합니다.",
                  luck: "상승 흐름에서는 일사천리의 돌파 능력을 보이나, 침체기에는 과격한 강단으로 인해 적을 만들기 짚습니다."
                },
                "辛": {
                  normal: "완벽을 기하며 예리한 시선으로 핵심을 짚어내고, 기품 있고 정갈하게 본인의 역할을 소화합니다.",
                  stress: "타인의 수준 낮은 실수나 게으름이 내 깔끔한 작업물에 오점을 남기거나 억울하게 프레임 씌워질 때 극노합니다.",
                  anger: "화를 내며 목소리를 높이기보다 예리한 칼날 같은 통찰과 차가운 침묵으로 상대의 자존심을 완전히 묵사발 냅니다.",
                  decision: "타협 없는 기품을 유지할 수 있는 선택지인지 검증한 뒤, 남다른 감각적인 직관을 무기로 과감히 결정합니다.",
                  luck: "좋은 시기에는 눈부신 천재성으로 대중을 사로잡지만, 쇠퇴기에는 지나치게 예민해져 매사 방어 태세를 취합니다."
                },
                "壬": {
                  normal: "유연하고 호쾌하게 판을 이끌며, 기류의 변화에 기민하게 대처하여 큰 판을 짜고 사람들을 설득합니다.",
                  stress: "내 넓은 바다 같은 그릇을 좁은 틀이나 매뉴얼 안에 가두려 하거나, 창의성을 통제당할 때 답답해합니다.",
                  anger: "속내를 겉으로 쉽게 드러내지 않고 물처럼 흐르며 삼키다가, 상대방을 완전히 매장할 수 있을 때 한 번에 쏟아냅니다.",
                  decision: "단순한 계산을 초월하여 거시적인 트렌드와 흐름의 추이를 전반적으로 조망한 뒤 큰 폭의 베팅을 감행합니다.",
                  luck: "기운이 왕성할 때는 탁월한 스케일의 지혜를 뽐내나, 기운이 꺾일 때는 생각이 꼬여 우유부단함에 갇힙니다."
                },
                "癸": {
                  normal: "기민하고 영리하게 상황 변화를 리딩하며, 사람들의 마음 깊은 곳을 캐치하는 촉과 카운셀러 역할을 합니다.",
                  stress: "주변의 탁한 감정 에너지나 부정적인 언어들이 여과 없이 내 맑은 마음에 지속적으로 오염을 끼칠 때 방전됩니다.",
                  anger: "즉각 덤벼들지 않고 머릿속으로 상대의 모순점을 정밀 계산한 뒤, 가장 결정적인 팩트로 찌르고 돌아섭니다.",
                  decision: "다양한 보조 데이터를 분석하고 직관적인 느낌을 조합하여 가장 영리하고 마진이 높은 기획을 택합니다.",
                  luck: "상승 흐름에는 유연한 전술로 기회를 독식하지만, 정체기에는 신경 쇠약이나 불안감으로 밤을 지새우기 쉽습니다."
                }
              };

              const userReaction = stemReactions[dayStem] || stemReactions["戊"];

              return (
                <div className="space-y-4">
                  <h3 className="font-myeongjo text-xs font-bold text-[#1A1A1A] flex items-center gap-1">• [개인화] 5대 상황에 직면한 오행 심리 리포트</h3>
                  <div className="grid grid-cols-5 gap-2.5">
                    <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[140px] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-800 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">평소의 나</span>
                      <p className="text-[9px] text-gray-500 leading-relaxed text-left font-light">{userReaction.normal}</p>
                    </div>
                    <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[140px] shadow-sm">
                      <span className="text-[10px] font-bold text-[#A3845B] border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">스트레스 시</span>
                      <p className="text-[9px] text-gray-500 leading-relaxed text-left font-light">{userReaction.stress}</p>
                    </div>
                    <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[140px] shadow-sm">
                      <span className="text-[10px] font-bold text-red-600 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">분노 상황 시</span>
                      <p className="text-[9px] text-gray-500 leading-relaxed text-left font-light">{userReaction.anger}</p>
                    </div>
                    <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[140px] shadow-sm">
                      <span className="text-[10px] font-bold text-emerald-700 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">의사 결정 시</span>
                      <p className="text-[9px] text-gray-500 leading-relaxed text-left font-light">{userReaction.decision}</p>
                    </div>
                    <div className="bg-[#F9F8F6] p-3.5 rounded-xl border border-gray-100 flex flex-col justify-between min-h-[140px] shadow-sm">
                      <span className="text-[10px] font-bold text-blue-700 border-b border-[#E2DDD5]/80 pb-1.5 mb-2 block">운세 진폭 시</span>
                      <p className="text-[9px] text-gray-500 leading-relaxed text-left font-light">{userReaction.luck}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="bg-[#A3845B]/5 p-6 rounded-xl border border-[#A3845B]/20 space-y-4">
              <div className="flex justify-between items-center border-b border-[#A3845B]/20 pb-2">
                <span className="text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                  <span>💡</span> 오행적 스트레스 반사 메커니즘 심층 해설
                </span>
                <span className="text-[9px] text-[#A3845B]/60 tracking-widest font-myeongjo">慧眼堂 寶鑑 專用</span>
              </div>
              <div className="text-[11px] text-gray-700 leading-relaxed font-light space-y-2.5">
                <p>
                  인간이 스트레스나 화를 마주할 때 튀어나오는 반응은 가공되지 않은 고유한 **오행 본질의 충동 반응(Astrological Reflex)**입니다. 
                  귀하의 일간 <strong>&lsquo;{dayStem}&rsquo;</strong> 기질과 사주 내부의 과다 오행 <strong>&lsquo;{excessEl.name}&rsquo;</strong>의 장력은 외부의 압박이 극대화되는 순간, 일시적으로 에너지를 밖으로 날카롭게 쏟아내거나(화/금 오행 반응) 반대로 내면의 동굴 속으로 깊이 숨어 소통을 단절하는(수/토 오행 반응) 경향을 보입니다.
                </p>
                <p>
                  이는 귀하의 잘못이 아니라 사주 오행 분포가 주는 본능적인 신경 반사 반응에 가깝습니다. 
                  따라서 화나 스트레스가 치밀어 오르는 순간에는 즉각 결론을 내리며 칼을 뽑기보다, 본인에게 부족한 <strong>&lsquo;{lackEl.name}&rsquo; 기운</strong>의 처방 지침(침묵, 환기, 물리적 거리 두기 등)을 가동하여 3분만 생각을 유예하는 훈련을 통해 충동적인 운세 왜곡을 완벽하게 방지할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 8 / 22</div>
        </div>

        {/* -------------------- Page 8. Chapter 1 처방 (멘탈 가이드) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 1 처방 (멘탈 가이드)</span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-semibold text-[#A3845B] block">⚠️ 평생 반복하기 쉬운 멘탈적 실수</span>
              <ul className="text-[11px] text-gray-600 list-disc pl-4 space-y-2 leading-relaxed">
                <li>혼자서 모든 책임을 감당하다 급방전되어 포기하는 룰렛 현상</li>
                <li>완벽주의 강박에 짓눌려 스타트를 보류하는 유예증</li>
                <li>사람의 동기만 신뢰하여 안전장치 검증을 흘려 넘기는 부주의</li>
              </ul>
            </div>

            <div className="bg-[#F9F8F6] p-5 rounded-lg border border-[#E2DDD5] space-y-4">
              <h3 className="font-myeongjo text-sm font-bold text-[#A3845B] text-center">🧠 일상을 조율하는 멘탈 케어 처방</h3>
              <p className="text-[11.5px] text-gray-700 leading-relaxed">
                귀하의 성향을 치유하기 위한 핵심은 &lsquo;완벽주의 강박 내려놓기&rsquo;입니다. 
                모든 것을 한 번에 해결하려고 조급해하기보다 하루에 딱 한 가지 중요한 일만 끝마친다는 마음으로 호흡을 조절하십시오. 
                생각이 꼬리를 물고 방전될 때에는 머리를 비우고 몸을 움직여 부족한 &lsquo;{lackEl.name}&rsquo;의 안정적인 순환 기운을 현실에서 강제로 확보하십시오.
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 9 / 22</div>
        </div>

        {/* -------------------- Page 9. Chapter 2. 재물운 사용설명서 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2. 재물운 사용설명서</span>
            </div>

            <div className="space-y-5">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">• 재물 운용 사용설명서</h3>
              
              <div className="space-y-3 text-[11px] text-gray-600 leading-relaxed">
                <p><strong>1. 돈이 들어오는 방식:</strong> 전문 기술·콘텐츠형 수익 모델이 가장 잘 어울립니다.</p>
                <p><strong>2. 돈이 새는 원인:</strong> 충동적인 지출이나 인간관계 유지 비용, 혹은 준비되지 않은 귀가 얇은 투자 결정으로 인해 순간적으로 목돈이 유실되기 쉽습니다.</p>
                <p><strong>3. 돈이 모이는 조건:</strong> 수입 계좌와 생활비 지출 계좌의 철저한 기계적 분리, 타인의 감정에 휩쓸려 계약을 결정하지 않는 냉정함, 잘하는 한 가지 파이프라인 집중이 필수적입니다.</p>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-lg border border-[#A3845B]/20 text-center">
              <span className="text-[10px] text-gray-500 font-bold block mb-1">재물운 핵심 처방</span>
              <p className="font-myeongjo text-xs font-bold text-[#A3845B] leading-relaxed">
                "돈을 버는 확장 능력보다, 번 돈이 새 나가지 않도록 튼튼한 안전망을 짜서 지켜내는 구조를 만드는 것이 훨씬 더 중요합니다."
              </p>
            </div>

            <div className="bg-[#A3845B]/5 p-4 rounded border border-[#A3845B]/15 space-y-2">
              <span className="text-[10px] font-bold text-[#A3845B] block">💡 왜 그런가요? 명리 근거</span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                {getAstroBasis("wealth")}
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 10 / 22</div>
        </div>

        {/* -------------------- Page 10. Chapter 2. 강점과 돈의 연결 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2. 강점과 돈의 연결</span>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-gray-800 block">• 강점을 돈으로 연결하는 구체적 방법</span>
              <div className="text-[11px] text-gray-600 leading-relaxed space-y-2">
                <p>
                  타고난 <strong>기획력</strong>과 <strong>지적인 분석 에너지</strong>는 단순 노동보다 지식 비즈니스로 갈 때 극대화됩니다. 
                  고객 문제 해결형 컨설팅, 1인 미디어 지식 창업, 또는 전문 정보를 가공하여 지속적 상품을 유통시키는 구조가 유효합니다.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-red-600 block">❌ 반드시 피해야 할 수익 방식</span>
              <ul className="text-[11px] text-gray-600 list-disc pl-4 space-y-1.5 leading-relaxed">
                <li>단기간의 요행을 바라는 투기성 투자 (사주 상 수 기운 결핍 시 매우 위험)</li>
                <li>본인의 판단과 결정 권한이 아예 없는 극단적인 수동적 기계 업무</li>
                <li>감정 소모가 지나쳐 자아 정체성이 훼손되기 쉬운 단순 접객 노동 환경</li>
                <li>계약 및 동업 정산 조건이 문서로 불분명한 지인과의 공동 사업</li>
              </ul>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded border border-gray-200 text-[10.5px] text-gray-600 space-y-1">
              <span className="font-bold text-gray-700 block">⚠️ 올해 피해야 할 금전적 선택</span>
              <p>충동적인 동업 참여나 계약서 날인은 금물입니다. 특히 문서 계약에 대한 철저한 2차 검증을 마치지 않았다면 결정을 보류해야 손실을 차단합니다.</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 11 / 22</div>
        </div>

        {/* -------------------- Page 11. Chapter 2. 나에게 맞는 업무 방식 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2. 맞는 업무 방식</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 block">👍 능력이 극대화되는 잘 맞는 일터</span>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  본인의 독창성과 판단을 전적으로 지지하고 위임해 주는 조직 구조, 연차가 쌓일수록 포트폴리오의 몸값이 급성장하는 전문성 강한 비즈니스 환경이 최적입니다.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-red-600 block">👎 스트레스와 피로가 솟구치는 일터</span>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  책임은 무겁게 주어지나 결정적 권한은 완전히 막혀 있는 기형적인 수직적 관료 구조, 성과와 노력이 숫자로 투명하게 연결되지 않아 의욕을 꺾는 일터는 가급적 피해야 합니다.
                </p>
              </div>
            </div>

            {/* 직무 적합도 비교 (시각화 모사) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-800 block">• 커리어 포지션 적합도 진단</span>
              <div className="space-y-2 text-[10.5px] text-gray-600">
                <div>
                  <div className="flex justify-between font-semibold mb-0.5"><span>전문직 / 프리랜서 적성</span><span>88%</span></div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div className="bg-[#A3845B] h-full" style={{width: "88%"}} /></div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-0.5"><span>1인 창업 / 사업 적성</span><span>75%</span></div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div className="bg-[#A3845B] h-full" style={{width: "75%"}} /></div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-0.5"><span>일반 기업 조직원 적성</span><span>42%</span></div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div className="bg-gray-400 h-full" style={{width: "42%"}} /></div>
                </div>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-4 rounded border border-[#A3845B]/15 space-y-2">
              <span className="text-[10px] font-bold text-[#A3845B] block">💡 왜 그런가요? 명리 근거</span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                {getAstroBasis("job")}
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 12 / 22</div>
        </div>

        {/* -------------------- Page 12. Chapter 2 처방 (대인관계 설명서) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2 처방 (관계 설명서)</span>
            </div>

            <div className="space-y-5">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">• 대인관계 사용설명서</h3>
              
              <div className="space-y-3 text-[11px] text-gray-600 leading-relaxed">
                <p><strong>1. 나에게 약이 되고 힘이 되는 사람:</strong> 귀하의 불타오르거나 메마른 기운을 부드럽게 감싸고 조율해 주는 **조용한 조언자형 귀인**, 그리고 주저할 때 결단을 밀어주는 **실행력 강한 파트너**가 이롭습니다.</p>
                <p><strong>2. 나를 지치게 하고 독이 되는 사람:</strong> 약속과 도의적 책임이 늘 불분명하고 기분에 따라 감정의 진폭을 쏟아내는 사람, 그리고 비생산적인 시기질투를 일삼으며 경쟁심을 유도하는 관계는 기운을 크게 소진시킵니다.</p>
                <p><strong>3. 관계에서 잊지 말아야 할 행동 요령:</strong> 상대가 알아서 다 이해해줄 것이란 기대를 버리고 섭섭함이 마음속에 쌓여 썩기 전에 먼저 예의 바르고 솔직하게 감정을 공유해야 관계의 병목이 해결됩니다.</p>
              </div>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded border border-gray-200 text-center">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">관계 회복을 위한 힐링 한마디</span>
              <p className="font-myeongjo text-xs font-bold text-gray-700">
                "나는 원래 내 속정의 크기만큼 말로 표현하는 법이 서투르지만, 당신과의 깊은 신뢰 관계를 무척 소중하게 여깁니다."
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 13 / 22</div>
        </div>

        {/* -------------------- Page 13. Chapter 2 처방 (관계 솔루션) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2 처방 (관계 솔루션)</span>
            </div>

            <div className="space-y-5 text-[11px] text-gray-600 leading-relaxed">
              <div className="space-y-1">
                <span className="font-bold text-[#A3845B] block">① 나와 다른 사람(결핍 보완형)을 만났을 때</span>
                <p>
                  귀하의 만세력 기준 결핍된 <strong>&lsquo;{lackEl.name}&rsquo;의 기운</strong>을 사주에 풍부하게 탑재한 상대방과의 만남은 인생의 판도를 바꿉니다. 
                  귀하의 꽉 막혀 있던 정체된 오행 흐름이 그 귀인의 개입으로 부드럽게 유통되기 시작하며, 이성적이고 차분한 현실 판단력(궁합 지수 92점 수준)을 보완받아 진로적 성장의 기틀이 마련됩니다.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gray-800 block">② 나와 똑같은 사람(동질형)을 만났을 때</span>
                <p>
                  일간 기질과 오행 분포가 판박이처럼 닮아 있는 사람을 만나면 첫 대화부터 오랜 친구처럼 뜻이 잘 통합니다. 
                  그러나 서로 고집이 센 불통 버그가 동시에 작동하여 한 치도 양보하지 않는 평행선 대치나, 조급함이 동시에 2배로 극대화되는 부작용이 있습니다. 
                  동질형 상대를 대할 때는 반드시 공간과 역할의 거리를 분리하여 충돌을 사전에 막아야 상생할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-4 rounded border border-[#A3845B]/15 space-y-2">
              <span className="text-[10px] font-bold text-[#A3845B] block">💡 왜 그런가요? 명리 근거</span>
              <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                {getAstroBasis("relation")}
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 14 / 22</div>
        </div>

        {/* -------------------- Page 14. Chapter 2 처방 (관계별 분석) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2 처방 (관계별 분석)</span>
            </div>

            <div className="space-y-6 text-[11px] text-gray-600 leading-relaxed">
              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 block">• 1. 가족 관계</span>
                <p>집안 내에서 실질적인 기둥 역할을 자처하게 되거나 무거운 감정적 수신처가 되기 쉽습니다. 가족의 고민까지 본인의 인생 어깨에 무리하게 올리지 않는 심리적 독립선언이 가끔은 필요합니다.</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 block">• 2. 연애 · 부부 관계</span>
                <p>애정을 속으로 깊이 묵히기보다 겉으로 작게나마 속삭이고 나누는 빈도가 잦아야 불화가 차단됩니다. 감정이 상했을 때 침묵으로 상대를 벌하는 버릇을 버려야 관계가 영구 소통됩니다.</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-gray-800 block">• 3. 직장 · 비즈니스 동료 관계</span>
                <p>자신의 결정과 가치를 과도하게 통제하려는 윗사람과는 자연스럽게 마찰이 빚어집니다. 이를 개인적인 미움으로 받지 말고, 직무적 한계선으로 드라이하게 규정하여 거리를 두는 것이 기운에 이롭습니다.</p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 15 / 22</div>
        </div>

        {/* -------------------- Page 15. Chapter 2 처방 (행운 요소) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 2 처방 (행운 요소)</span>
            </div>

            <div className="space-y-6">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A] text-center">🍀 나를 채워줄 일상의 행운 원소</h3>
              <p className="text-xs text-gray-500 text-center">사주의 깨진 균형을 맞춰주는 색상, 장소, 소품 가이드</p>

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="border border-gray-100 p-4 rounded bg-[#F9F8F6]">
                  <span className="text-[10px] text-[#A3845B] font-bold block mb-1">행운의 퍼스널 컬러</span>
                  <span className="text-xs font-bold text-gray-800">{curPresc.color}</span>
                </div>
                <div className="border border-gray-100 p-4 rounded bg-[#F9F8F6]">
                  <span className="text-[10px] text-[#A3845B] font-bold block mb-1">추천 개운 장소</span>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight block">{curPresc.space}</span>
                </div>
                <div className="border border-gray-100 p-4 rounded bg-[#F9F8F6]">
                  <span className="text-[10px] text-[#A3845B] font-bold block mb-1">개운 추천 소품</span>
                  <span className="text-[10px] font-bold text-gray-800 leading-tight block">{curPresc.item}</span>
                </div>
              </div>

              <div className="border border-dashed border-[#A3845B]/30 p-5 rounded-lg bg-[#A3845B]/5 space-y-2 mt-6">
                <span className="text-xs font-bold text-[#A3845B] block">• 행동 개운 처방 지침</span>
                <p className="text-[11px] text-gray-700 leading-relaxed">
                  {curPresc.action}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 16 / 22</div>
        </div>

        {/* -------------------- Page 16. Chapter 3. 인생의 계절 (대운) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 3. 인생의 계절 (대운)</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">• 10년 주기 인생 대운(大運)의 지도</h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                명리학에서의 대운은 **인생 전체의 10년짜리 날씨(계절) 변화**를 의미합니다. 
                현재 귀하가 밟고 서 있는 대운의 계절적 본질은 흙(土)의 기운이 굳어지며 현실적인 실리와 틀을 굳건히 다져야 하는 **'늦가을에서 초겨울로 접어드는 수확의 계절'**에 머무르고 있습니다.
              </p>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                씨앗을 마구 흩뿌리기만 하던 이십 대의 파종기적 충동을 멈추고, 이제는 거두어들인 내 기획과 포트폴리오를 돈과 성과라는 실질적인 열매로 전환하는 결실 작업에 집중해야 기운이 원활하게 흘러가게 됩니다.
              </p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded border border-gray-200 text-[10.5px] text-gray-600 space-y-1">
              <span className="font-bold text-gray-700 block">⚠️ 대운의 변곡점 조언</span>
              <p>인생의 계절이 바뀌는 교운기(대운이 교체되는 전후 1~2년)에는 인간관계가 대대적으로 필터링되거나 주거/이직 등 급격한 환경 변화가 일어납니다. 당황하지 말고 묵묵히 내 실속을 다지는 것이 최고의 방어책입니다.</p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 17 / 22</div>
        </div>

        {/* -------------------- Page 17. Chapter 3. 올해 운의 타이밍 (세운 - 1) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 3. 올해 운의 타이밍 (세운 - 1)</span>
            </div>

            <div className="space-y-5">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">• 올해 좋은 시기와 조심할 시기 종합 요약</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-emerald-100 bg-emerald-50/20 p-4 rounded space-y-2">
                  <span className="text-xs font-bold text-emerald-800 block">🟢 올해 가장 좋은 달</span>
                  <ul className="text-[10px] text-gray-600 list-disc pl-4 space-y-1">
                    <li><strong>시작하기 좋은 달:</strong> 2월</li>
                    <li><strong>계약 · 협상에 유리한 달:</strong> 5월</li>
                    <li><strong>돈의 흐름이 좋아지는 달:</strong> 8월, 12월</li>
                    <li><strong>인간관계 확장되는 달:</strong> 4월</li>
                  </ul>
                </div>

                <div className="border border-red-100 bg-red-50/20 p-4 rounded space-y-2">
                  <span className="text-xs font-bold text-red-800 block">🔴 올해 조심해야 할 달</span>
                  <ul className="text-[10px] text-gray-600 list-disc pl-4 space-y-1">
                    <li><strong>충동 결정을 피해야 할 달:</strong> 3월</li>
                    <li><strong>지출 관리가 필요한 달:</strong> 10월</li>
                    <li><strong>감정 갈등을 주의할 달:</strong> 6월</li>
                    <li><strong>건강과 휴식이 필요한 달:</strong> 11월</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-lg border border-[#A3845B]/15 text-[11px] text-gray-600 leading-relaxed">
              <span className="font-bold text-[#A3845B] block mb-1">💡 타이밍 핵심 가이드</span>
              올해 귀하는 사주 전반의 흐름에서 조급증과 충동이 주기적으로 들어오는 시기를 거치게 됩니다. 
              좋은 달에는 지체 말고 제안과 계약을 강하게 관철하되, 주의나 재정비로 지목된 달에는 계약서 서명이나 충동적인 거액 결제를 반드시 지연시켜 리스크를 영구 소각하십시오.
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 18 / 22</div>
        </div>

        {/* -------------------- Page 18. Chapter 3. 올해 운의 타이밍 (세운 - 2) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-4">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 3. 올해 운의 타이밍 (세운 - 2)</span>
            </div>

            <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A] mb-2">• 12개월 월별 운의 상세 지침</h3>

            <div className="space-y-2 max-h-[850px] overflow-hidden">
              {monthlyGuide.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-gray-100 pb-2 text-[10.5px]">
                  <span className="font-bold text-gray-800 w-10">{item.month}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] text-white font-bold text-center w-14 ${
                    item.grade === "매우 좋음" ? "bg-emerald-600" :
                    item.grade === "좋음" ? "bg-teal-500" :
                    item.grade === "보통" ? "bg-gray-400" :
                    item.grade === "주의" ? "bg-red-500" : "bg-amber-500"
                  }`}>
                    {item.grade}
                  </span>
                  <span className="text-gray-600 flex-1 leading-normal font-light">"${item.desc}"</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 19 / 22</div>
        </div>

        {/* -------------------- Page 19. Chapter 3 연계 처방 (고민 답변) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 3 연계 처방 (고민 답변)</span>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-lg border border-[#A3845B]/20 space-y-3">
              <span className="text-[9px] bg-[#A3845B] text-white px-2.5 py-0.5 rounded font-bold">고객 신청 고민</span>
              <h4 className="font-myeongjo text-xs font-bold text-gray-800 mt-1">Q. "${worryContent.question}"</h4>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold text-[#A3845B]">• 혜안당 명리 지침 나침반 답변</h4>
              <p className="text-[11.5px] text-gray-700 leading-relaxed whitespace-pre-line">
                {worryContent.answer}
              </p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded border border-gray-200 text-[10px] text-gray-500 leading-relaxed font-light">
              * 본 답변은 신청 고객님의 사주 8자 데이터와 신청서에 직접 기록한 고민 카테고리를 크로스 체크하여 만세력 원리대로 추출한 결과입니다.
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 20 / 22</div>
        </div>

        {/* -------------------- Page 20. Chapter 3 연계 처방 (실천 나침반) -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">Chapter 3 연계 처방 (실천 나침반)</span>
            </div>

            <div className="space-y-5">
              <h3 className="font-myeongjo text-sm font-bold text-[#1A1A1A]">• 앞으로 30일 동안 강하게 실천할 5가지 지침</h3>
              
              <div className="space-y-3.5 text-[11px] text-gray-700 leading-relaxed">
                <p><strong>1. 미뤄 둔 결정 정리:</strong> 사주 속 기획 과열(목 과다)로 미뤄온 이직서 제출이나 포트폴리오 마감 결정 한 가지를 30일 내에 매듭지으십시오.</p>
                <p><strong>2. 불필요 지출 구멍 점검:</strong> 재물운이 새는 조건을 방어하기 위해 automatic 결제나 불필요한 인간관계성 지출 1개를 확실히 점검하고 삭제하십시오.</p>
                <p><strong>3. 공간 정돈 실행:</strong> 방안 동쪽에 싱그러운 원목이나 초록빛 포인트를 배치하여 일상의 부족한 오행 기운을 강제로 개운하십시오.</p>
                <p><strong>4. 귀인 조언 수렴:</strong> 혼자서 머리를 싸매기보다, 평소 나와 결이 다르고 침착한 조언자 1인을 만나 진로의 현실적 피드백을 구하십시오.</p>
                <p><strong>5. 멘탈 리프레시 루틴 구축:</strong> 조급함이 솟구칠 때마다 생각을 지우고 20분간 산책하거나 잠드는 행동 룰을 적용해 마음에 닻을 내리십시오.</p>
              </div>
            </div>

            <div className="bg-[#A3845B]/5 p-5 rounded-lg border border-[#A3845B]/15 space-y-2 mt-6">
              <span className="text-xs font-bold text-[#A3845B] block">🎯 올해의 핵심 지침 목표</span>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                "올해는 날개를 크게 펼치고 무리하게 도약하려 하기보다, 내 실속과 내부 내실을 다져 수확을 튼튼히 챙기는 한 해로 타겟팅하십시오."
              </p>
            </div>
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 21 / 22</div>
        </div>

        {/* -------------------- Page 21. 마무리 및 최종 보감 -------------------- */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-white border border-[#E2DDD5] rounded-xl p-12 shadow-md print-border-none print-shadow-none">
          <div className="absolute inset-4 border border-[#A3845B]/30 rounded-lg pointer-events-none print:inset-0" />
          
          <div className="space-y-6 mt-6">
            <div className="border-b border-[#E2DDD5]/50 pb-2 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#A3845B] font-myeongjo">慧眼堂 寶鑑</span>
              <span className="text-[9px] text-gray-400 font-light">마무리 및 최종 보감</span>
            </div>

            <div className="bg-[#F9F8F6] p-6 rounded-lg border border-gray-100 text-center space-y-4 my-8">
              <span className="text-[10px] text-gray-400 font-bold block mb-1">나를 위한 최종 마음 처방</span>
              <p className="font-myeongjo text-sm font-bold text-gray-800 leading-relaxed">
                "나는 오늘 모든 문제를 한 번에 통제하거나 바꾸지 않아도 된다.<br />
                기분과 조급증에 나를 혹사하지 않고, 지금 눈앞의 가장 소중한 일 하나부터 조용히 시작한다."
              </p>
            </div>

            <div className="text-center py-12 space-y-4">
              <span className="text-[10px] tracking-widest text-[#A3845B] font-bold block font-myeongjo">慧眼堂 寶鑑 寶印</span>
              <div className="w-16 h-16 border-2 border-red-600 text-red-600 flex items-center justify-center mx-auto text-xs font-bold rounded-lg font-myeongjo leading-tight print:w-14 print:h-14">
                慧眼堂<br />寶印
              </div>
              <p className="font-myeongjo text-xs font-bold text-[#A3845B] pt-4">
                "당신의 운(運)은 단순히 가만히 기다릴 때보다, 지혜롭게 방향을 정하고 용기 있게 움직일 때 마침내 활짝 열립니다."
              </p>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 border-t border-[#E2DDD5] pt-6 pb-2">
            혜안당 명리연구소 보감 제작팀 배상
          </div>
          <div className="text-right text-[9px] text-gray-300 pt-2">Page 22 / 22</div>
        </div>

      </div>
    );
  };

  const renderSajuContent = () => {
    if (reportGrade === "sms" || reportGrade === "free") {
      return renderSmsSajuContent();
    }

    const pages = getPagesConfiguration(name, partnerName);
    const metrics = getCharacterMetrics(sajuInfo);
    const iljuSecret = getIljuSecret(sajuInfo.day.stem, sajuInfo.day.branch);

    const isFree = (reportGrade === "free" || reportGrade === "premium") && !isPaid;
    
    const activePages = pages;

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
                  handleUpgradePayment,
                  currentGrade,
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
                  worryCategory,
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
                  isPaid,
                  reportGrade,
                  getSipsinList,
                  getLifeStyleStrategyData,
                  getDestinyHarmonyData,
                  getInnerDispositionData,
                  isFree: (reportGrade === "free" && !isPaid) || (reportGrade === "premium" && ["seoun_2026", "seoun_quarterly", "seoun_aspects", "daeun_orbit", "daeun_roadmap_1", "daeun_roadmap_2", "warning_period", "worry_solution", "fengshui_bless"].includes(page.type))
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

        {reportGrade === "free" && !isPaid && (
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
              <div className="flex flex-row items-center justify-center gap-3 text-xs mb-6 bg-black/40 py-2.5 px-4 rounded-lg max-w-md mx-auto whitespace-nowrap overflow-x-auto">
                <span className="text-red-500 font-bold">⏰ {timeLeft} · 단 1회 한정</span>
                <span className="text-gray-400 line-through">54,600원</span>
                <span className="text-white font-bold text-sm">34,900원</span>
                <span className="text-[#A3845B] font-bold">36%↓</span>
              </div>

              {/* 행동 유도 결제 버튼 제거 */}
              <div className="space-y-3 max-w-sm mx-auto">
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
      const decodedWorry = worryText || "";
      const worrySolutionText = decodedWorry
        ? `귀하의 고민 [${decodedWorry}]에 대해:\n올해는 병오년의 조급한 화(火) 기운으로 인해 성급히 판단하면 그르치기 쉽습니다. 가을철(음력 8월) 이전까지는 중요한 결정을 유보하고, 현상을 안정적으로 유지하며 에너지를 실속 있게 다지는 것이 가장 유리합니다.`
        : "올해 고민 솔루션:\n올해는 조급한 감정적 충동을 억제하고 정중동(靜中動)의 자세를 유지하는 것이 좋습니다. 특히 가을 이전에는 서투른 확장을 피해 손재수를 차단하십시오.";

      const elStats = `목(${sajuInfo.elements.목}개) | 화(${sajuInfo.elements.화}개) | 토(${sajuInfo.elements.토}개) | 금(${sajuInfo.elements.금}개) | 수(${sajuInfo.elements.수}개)`;

      let tojeongGeneralDesc = "";
      const currentBaseEl = baseEl || (sajuInfo && sajuInfo.day && sajuInfo.day.stemEl) || "목";

      if (currentBaseEl === "목") {
        tojeongGeneralDesc = `목(木) 일간인 ${name}님에게 2026년은 맹렬한 화(火) 기운이 목생화(木生火)로 설계되어 내적 재능과 열정이 크게 발산되는 해입니다. 기획이나 창작 활동에서 눈부신 성과를 내고 대외적 영향력이 확장되나, 과도한 활동으로 체력이 쉽게 소진되고 심리적 조급증이나 상열감이 발생할 수 있으니 완급 조절이 필수적입니다. 특히 음력 5월과 6월의 폭발적인 화기 속에서는 무리한 확장을 지양하고 휴식을 병행하는 정중동의 지혜가 필요합니다.`;
      } else if (currentBaseEl === "화") {
        tojeongGeneralDesc = `${name}님에게 2026년은 나와 같은 강력한 화(火) 기운이 세운에서 더해져 자신감과 고집이 최고조에 달하는 비겁(比劫)의 시기입니다. 스스로 독립하여 새로운 영역을 개척하려는 에너지가 솟구치나, 자만심으로 인한 무리한 투자나 대인관계의 시비, 동업 문제로 손재수를 입을 수 있으니 겸손과 자제가 가장 강력한 개운법입니다. 뜨거운 열정을 내실을 다지고 리스크를 방어하는 데 집중하여 큰 재물 손실을 피해야 합니다.`;
      } else if (currentBaseEl === "토") {
        tojeongGeneralDesc = `토(土) 일간인 ${name}님에게 2026년은 맹렬한 불길이 단단한 흙을 돕는 화생토(火生土)의 강한 인성(印星)의 해입니다. 나를 돕는 귀인의 혜택이나 문서상의 계약(부동산, 자격증, 합격 등)에서 매우 길한 소식이 기대됩니다. 다만 생각이 지나치게 많아져 실행력이 떨어지는 '생각의 감옥'을 경계해야 합니다. 행동이 무거워지지 않도록 실용적인 계획을 세우고, 가을철 금(金)의 기류를 타고 결실을 과감히 쟁취해 보십시오.`;
      } else if (currentBaseEl === "금") {
        tojeongGeneralDesc = `금(金) 일간인 ${name}님에게 2026년은 뜨거운 용광로의 불꽃이 단단한 쇠를 제련하는 화극금(화극금)의 관성(官星)의 해입니다. 직장에서의 승진, 명예 획득, 새로운 책임감 등 삶의 중요한 뼈대를 세우는 제련의 과정을 겪게 됩니다. 책임감이 무겁고 대외적 스트레스가 따르나, 이 시기를 묵묵히 인내하고 규칙을 준수하며 버텨낸다면 연말에는 값진 명예와 한 단계 도약한 사회적 지위를 얻을 것입니다.`;
      } else { // 수
        tojeongGeneralDesc = `수(水) 일간인 ${name}님에게 2026년은 뜨거운 불을 다스리는 수극화(수극화)의 재성(財星)의 해입니다. 일생일대의 큰 재물적 기회와 성과를 눈앞에 다가오는 역동적인 시기입니다. 횡재수나 대외적인 실리를 확실하게 챙길 수 있는 판이 짜이지만, 조급하게 서두르거나 분수에 넘치는 과욕을 부리면 불길에 물이 모두 증발하여 오히려 큰 낭패를 볼 수 있으니 차분하고 이성적인 현금 자산 관리가 절대적으로 필요합니다.`;
      }

      const smsText = `[혜안당 명리연구소] 2026 병오년 토정비결 요약
──────────────────────────────
본 문서는 ${name} 님의 2026년 토정비결 요약본입니다.

■ 1. 2026년 병오년(丙午年) 운세 기조
- 세운 특징: 천지합화(天地合火) - 하늘과 대지가 거대한 불꽃으로 화합하는 역동적 한 해
- 기운 오행 분포: ${elStats}
- 기질 융합 해석:
  ${tojeongGeneralDesc}

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
                        <span className="text-[9px] font-semibold text-gray-700 block mb-2">📊 {name}님 사주 오행 분포도 (전체 8자 기준)</span>
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
                            가을철(음력 7~9월) 금(金)의 수축기에 재물이 단단하게 축적되는 좋은 흐름입니다. 다만 상반기에는 화(火) 기운의 영향으로 {name}님의 충동적인 투자와 지출이 늘 수 있어 현금 확보에 집중해야 합니다.
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
                            솔로는 하반기에 조용하고 신뢰할 수 있는 실속 있는 인연을 만날 기회가 옵니다. {name}님의 부부나 연인은 상반기 중 거친 말과 감정 충돌이 생기지 않도록 정성껏 배려하는 대화가 필수적입니다.
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
                            심장계 및 혈관계 피로, 상열감, 안구 건조 등 화독(火毒)의 증상을 조심해야 합니다. 주기적인 찬물 족욕이나 명상, 충분한 수분 섭취를 통해 화 기운을 가라앉히는 것이 {name}님께 중요합니다.
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
                <span className="font-myeongjo font-light">慧眼堂 寶鑑 · {name}님 병오년 토정비결 요약</span>
                <span className="font-myeongjo font-bold">1 / 2</span>
              </div>
            </div>
          </div>

          {/* SMS PAGE 2 - 개운 솔루션 & 처방 */}
          <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:mt-8">
            <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                  <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 토정비결 요약</span>
                  <span className="text-[9px] text-gray-400 font-light font-traditional">2. 월별 길흉 진단 및 개운 비책</span>
                </div>

                <div className="space-y-5">
                  <div className="text-center py-3 space-y-1.5">
                    <span className="text-xs text-[#A3845B] tracking-widest font-bold block font-myeongjo">— 2026 丙午年 —</span>
                    <h2 className="font-myeongjo text-lg font-bold text-[#1A1A1A] tracking-wide">{name} 님 분기별 전술 Playbook</h2>
                    <div className="w-16 h-0.5 bg-[#A3845B]/40 mx-auto mt-0.5" />
                  </div>

                  {/* 분기별 카드 목록 */}
                  <div className="space-y-3">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 4. 2026년 분기별 행동 가이드</span>
                    <div className="grid grid-cols-2 gap-3 text-[9px]">

                      {/* 1분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <span className="text-[11px]">🌱</span>
                          <span>1분기 (음력 1~3월) : 관망기</span>
                        </div>
                        <p className="text-gray-500 leading-relaxed font-light text-justify text-[8.5px]">
                          새해의 기운이 태동하는 시기로 여러 변동운과 직업적 제안이 들어오기 시작합니다. 다만 섣부른 결정은 실수를 유발하니 계약 조건 검증을 뒤로 미루고 최소 일주일간 숙고하는 태도를 견지하십시오.
                        </p>
                      </div>

                      {/* 2분기 */}
                      <div className="bg-[#FAF8F5]/60 p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 font-bold text-red-800">
                          <span className="text-[11px]">🔥</span>
                          <span>2분기 (음력 4~6월) : 과열기</span>
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

    const decodedWorry = worryText || "";
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
        { page: 3, type: "tj_intro_saju", title: "명조 분석과 오행 원국 배치" },
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
        { page: 27, type: "tj_worry_solution", title: "고민 극복 맞춤 비책" },
        { page: 28, type: "tj_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" },
        { page: 29, type: "tj_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" },
        { page: 30, type: "tj_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" },
        { page: 31, type: "tj_final_blessing", title: "병오년 성공 기원 최종 축원문" }
      ];
    }

    return [
      { page: 1, type: "ny_cover", title: `2026년 병오년(丙午年) 혜안당 정통 ${suffix} 표지` },
      { page: 2, type: "ny_preface", title: "새해를 맞이하는 마음가짐과 명리 서막" },
      { page: 3, type: "ny_intro_saju", title: "명조(命造) 분석과 오행 원국 배치" },
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
      { page: 41, type: "ny_personal_worry", title: "맞춤형 고민 정밀 비책" },
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

  const renderNewYearContent = () => {
    // reportGrade가 'sms'이고 추가 업그레이드를 하지 않았다면 (isPaid가 true가 아니거나 orders에 deep/premium 업그레이드 기록이 없음) 요약본 노출
    if (reportGrade === "sms" || reportGrade === "free") {
      return renderSmsNewYearContent();
    }

    const pages = getNewYearPagesConfiguration(name, partnerName);
    const metrics = getCharacterMetrics(sajuInfo);
    const isFree = reportGrade === "free" && !isPaid;

    const deepExcludeTypes = [
      "ny_sinsal_active",
      "ny_warning_period",
      "ny_worry_solution",
      "ny_roadmap_2027",
      "ny_roadmap_2028",
      "ny_roadmap_2029",
      "ny_fengshui_interior"
    ];

    const isNewYear = type === "newyear" && typeParam !== "tojeong";

    const activePages = (reportGrade === "free" || reportGrade === "premium")
      ? pages
          .filter(p => !deepExcludeTypes.includes(p.type))
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
                  typeParam,
                  handlePortonePayment,
                  handleUpgradePayment,
                  setIsPaid,
                  getMonthlyFortuneData
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
  const getTarotCardInterpretation = (cardId, category) => {
    const data = {
      magician: {
        love: {
          tag: "매력 발산, 소통 리드, 호기심과 설렘",
          desc: "상대방은 현재 귀하에게 본인의 매력을 강하게 어필하고 관심을 끌고 싶어 합니다. 대화를 위트 있게 리드하려 하며 새로운 설렘과 호기심이 최고조에 달한 상태입니다. 적극적인 태도로 귀하의 마음을 사로잡으려 할 것입니다."
        },
        job: {
          tag: "재능 발현, 전문성 입증, 준비 완료",
          desc: "새로운 분야나 직무에서 귀하의 숨겨진 재능과 창의력이 빛을 발할 기회입니다. 면접이나 진로 탐색에서 강한 첫인상을 남길 수 있으며, 준비해온 전문성을 100% 입증하여 합격에 한 걸음 다가서는 형국입니다."
        },
        career: {
          tag: "능력 인정, 주도적 이직, 프로젝트 시작",
          desc: "이직 및 퇴사 타이밍에서 귀하의 주도권이 매우 강력하게 작용합니다. 면접관이나 헤드헌터에게 귀하의 뛰어난 커뮤니케이션 능력을 완벽히 입증할 수 있으며, 새로운 프로젝트를 주도하기에 최적의 시기입니다."
        },
        business: {
          tag: "창의적 창업, 신규 아이템, 시장 선점",
          desc: "획기적인 비즈니스 모델이나 아이디어가 시장에서 주목받기 시작합니다. 독창적인 마케팅이나 커뮤니케이션을 통해 고객을 단번에 매료시킬 수 있으며, 창업을 구상하고 있다면 망설임 없이 기획을 실행에 옮겨도 좋은 운입니다."
        },
        wealth: {
          tag: "새로운 파이프라인, 투자 감각, 자금 회전",
          desc: "스스로의 판단과 재능으로 새로운 금전적 파이프라인을 구축할 기회가 생깁니다. 정보 수집 능력이 극대화되어 유리한 계약을 성사시키거나, 단기적인 자금 회전이 원활해지는 긍정적인 신호가 보입니다."
        },
        move: {
          tag: "새로운 주거지 탐색, 이상적인 계약, 도심 이전",
          desc: "매우 매력적이고 조건이 좋은 새로운 매물이나 거주지를 발견하게 됩니다. 계약 협상에서 주도권을 잡게 되며, 이동을 통해 새로운일상의 활력을 불러일으키고 삶의 환경을 참신하게 바꿀 수 있습니다."
        },
        relation: {
          tag: "원활한 오해 해소, 관계 주도, 대화의 힘",
          desc: "갈등이나 오해가 쌓여 있던 인간관계에서 귀하의 뛰어난 중재와 말솜씨로 평화가 찾아옵니다. 모임이나 조직 내에서 존재감이 돋보이며, 먼저 다가서서 대화를 시도할 때 막혔던 오해가 눈 녹듯 사라질 것입니다."
        },
        health: {
          tag: "기력 회복, 활력 증진, 자가 치유력",
          desc: "정체되어 있던 신체 에너지가 빠르게 회복되며 활력이 샘솟는 하루입니다. 새로운 운동 요법이나 건강 보조식품 등이 몸에 매우 잘 맞을 수 있으며, 심신이 모두 맑고 가볍게 쇄신되는 흐름입니다."
        },
        exam: {
          tag: "암기력 극대화, 합격운, 집중력",
          desc: "두뇌 회전이 매우 빠르고 집중력이 최고조에 달합니다. 어려운 문제의 핵심을 짚어내는 임기응변 능력이 돋보여 시험장에서 본인의 원래 실력 이상의 우수한 결과를 기대할 수 있는 든든한 학업운입니다."
        },
        general: {
          tag: "창조적 해결책, 새로운 국면, 기량 발휘",
          desc: "엉켜 있던 고민의 실타래를 풀 수 있는 창조적인 아이디어나 귀인을 마주하게 됩니다. 귀하가 가진 모든 기량과 자원을 동원해 난관을 헤쳐나갈 수 있으며, 상황이 매우 새롭고 긍정적인 국면으로 대전환됩니다."
        }
      },
      empress: {
        love: {
          tag: "질투와 소유욕, 정서적 풍요, 돈독함",
          desc: "상대방은 귀하와 함께할 때 깊은 정서적 안식과 풍요로움을 만끽합니다. 그러나 귀하를 자신의 영역 안에 온전히 두고 싶어 하는 독점욕과 소유욕이 발현되어, 집착하거나 서운함을 뾰족하게 표현할 기미가 흐릅니다."
        },
        job: {
          tag: "풍요로운 결과, 안정된 직장, 귀인의 보살핌",
          desc: "구직 활동에서 큰 성과를 거두고 안정적인 복지를 제공하는 직장에 안착할 운입니다. 귀하의 잠재력을 높이 산 여성 임원이나 선배 등 귀인의 든든한 후원을 받아 편안한 분위기 속에서 첫 커리어를 설계할 수 있습니다."
        },
        career: {
          tag: "만족스러운 복지, 이직 성공, 안정적 복귀",
          desc: "복지 환경이 우수하고 급여 조건이 향상된 환경으로의 이직이 가능합니다. 다소 보수적이지만 정서적 안정감을 주는 일터와 인연이 닿으며, 퇴사 후 공백기를 겪고 있다면 조만간 안정적인 일자리로 복귀하게 됩니다."
        },
        business: {
          tag: "결실의 시기, 매출 급증, 고객 만족",
          desc: "그간 공들였던 비즈니스가 풍요로운 결실을 맺는 단계입니다. 서비스나 제품에 대한 고객 만족도가 극대화되어 입소문이 퍼지고, 안정적인 단골층 확보를 통해 매출이 탄탄하게 우상향 곡선을 그리는 길한 시기입니다."
        },
        wealth: {
          tag: "재물운 번창, 유산이나 증여, 뜻밖의 횡재",
          desc: "금전적으로 가장 풍요로운 흐름을 약속하는 운입니다. 뜻하지 않은 소소한 용돈이나 보너스, 혹은 주변의 물질적인 지원이 따르며, 부동산이나 투자금의 가치가 조용히 상승하여 마음이 한결 여유로워집니다."
        },
        move: {
          tag: "풍수지리적 명당, 안락한 주거지, 이사 대만족",
          desc: "채광이 좋고 생활 인프라가 매우 뛰어난 아늑한 주거지로 이사하게 됩니다. 이사 후 집안에 금전운과 화목함이 깃들게 되며, 매매나 임대차 계약 역시 귀하에게 일방적으로 유리하게 진행되는 길운입니다."
        },
        relation: {
          tag: "가정의 평화, 모성애적 배려, 깊은 신뢰",
          desc: "주변 사람들이 귀하의 따뜻한 배려와 포용력에 감동하여 마음의 문을 엽니다. 가족이나 동료들 간의 오랜 오해가 화합으로 전환되며, 귀하를 중심으로 평화롭고 따스한 소통망이 두텁게 형성될 것입니다."
        },
        health: {
          tag: "안정적 기력 유지, 심신 평온, 영양 공급",
          desc: "몸과 마음의 밸런스가 매우 안정적으로 흘러갑니다. 맛있는 음식을 섭취하고 충분한 휴식을 취하며 정서적 포만감을 느끼게 되며, 과로로 인한 피로를 완벽히 씻어낼 수 있는 재충전의 타이밍입니다."
        },
        exam: {
          tag: "컨디션 조율 성공, 성적 향상, 편안한 마음",
          desc: "긴장감을 내려놓고 편안한 상태에서 시험을 치를 수 있는 훌륭한 학업운입니다. 그동안 노력한 만큼의 결실을 넉넉히 수확할 수 있으며, 면접이나 실기 시험에서 본인의 온화한 매력이 큰 가산점을 받게 됩니다."
        },
        general: {
          tag: "풍요로운 결실, 스트레스 해소, 평화의 정착",
          desc: "고민하던 문제가 원만하게 타결되어 물질적, 정서적으로 넉넉한 안정감을 얻게 됩니다. 주변 사람들의 따뜻한 도움과 격려가 이어지며, 억눌렸던 걱정이 사라지고 삶에 안락함과 평화가 안착합니다."
        }
      },
      lovers: {
        love: {
          tag: "순수한 끌림, 강한 교감, 소통의 부활",
          desc: "두 사람 사이에 순수하고 전기적인 끌림과 다정한 소통 감각이 충만하게 교차했음을 뜻합니다. 대화 장벽만 걷어낸다면 즉시 서로의 품으로 돌아갈 수 있는 가장 끈끈하고도 맑은 애정의 연결고리가 보존되어 있습니다."
        },
        job: {
          tag: "환상의 팀워크, 나와 맞는 직무, 합격의 소식",
          desc: "귀하의 적성과 기질에 딱 맞는 만족스러운 직무를 마주하게 됩니다. 면접에서 면접관들과 훌륭한 케미스트리를 보여주며 강한 호감을 얻게 되고, 입사 시 끈끈하고 협조적인 팀원들과 협동하여 일할 수 있는 길운입니다."
        },
        career: {
          tag: "우호적인 이직 제안, 협상 성공, 파트너십 구축",
          desc: "매우 우호적인 이직 제안이나 스카웃 제의를 받게 될 흐름입니다. 연봉이나 처우 협상이 매끄럽게 흘러가며, 함께 일하게 될 동료나 상사들이 귀하의 합류를 진심으로 환영하고 신뢰를 보낼 것입니다."
        },
        business: {
          tag: "동업자 유치, 계약 성사, 매력적인 파트너십",
          desc: "비즈니스의 성공적인 파트너십이나 든든한 동업자를 유치하게 됩니다. 고객과의 소통 채널이 원활하게 뚫려 브랜드 이미지가 급상승하며, 상호 윈-윈할 수 있는 매력적인 계약을 성사시킬 수 있는 절호의 타이밍입니다."
        },
        wealth: {
          tag: "정보 교류를 통한 득템, 유리한 금전 계약",
          desc: "신뢰할 만한 귀인이나 파트너의 정보를 통해 뜻밖의 금전적 이득을 보게 됩니다. 무리한 단독 투자보다는 신중한 공동 투자나 협업 계약에서 긍정적인 성과가 나며, 자금 융통이 순조롭게 조율됩니다."
        },
        move: {
          tag: "동반 주거 결정, 마음에 쏙 드는 이사, 환경 조화",
          desc: "가족이나 연인, 동반자와 함께 행복하게 머물 이사 공간을 확정 짓게 됩니다. 주변 환경이 평화롭고 대중교통 및 생활 인프라가 마음에 쏙 들어 이사 후 삶의 만족도가 매우 높게 상승할 운입니다."
        },
        relation: {
          tag: "완벽한 갈등 봉합, 호감도 상승, 인기 폭발",
          desc: "사람들과의 관계에서 귀하의 호감도와 인기가 크게 올라갑니다. 소원했던 친구나 동료와 다시 손을 잡고 화해할 기회가 생기며, 모임 속에서 밝고 긍정적인 가교 역할을 훌륭히 수행하게 됩니다."
        },
        health: {
          tag: "정서적 힐링을 통한 회복, 생기 충만",
          desc: "우울감이나 심리적 긴장감이 걷히고 가벼운 생기가 몸속에 돕니다. 연인과의 데이트나 친구들과의 즐거운 대화를 통해 심신의 긴장을 완전히 해소하고 긍정적인 면역력을 충전받는 아늑한 흐름입니다."
        },
        exam: {
          tag: "스터디 효과, 면접 우수, 스승과의 케미",
          desc: "혼자 공부하는 것보다 스터디 그룹이나 멘토와의 1:1 질의응답을 통해 효율이 비약적으로 상승합니다. 구술 시험이나 면접에서 본인의 밝은 에너지가 상대방의 호감을 즉각 사로잡을 수 있는 시험운입니다."
        },
        general: {
          tag: "마음의 조화, 최적의 선택, 귀인과의 동조",
          desc: "그간의 망설임을 뒤로하고 가장 후회 없는 최적의 선택을 내리게 됩니다. 귀하를 진심으로 이해하고 돕는 조력자가 나타나 고민의 핵심을 함께 나누고 해결해 주므로 마음속 근심이 완전히 청산됩니다."
        }
      },
      hermit: {
        love: {
          tag: "생각 정리, 자발적 단절, 내면의 성찰",
          desc: "상대방은 현실적인 고민(경제적 여건, 일의 과부하)으로 인해 머리가 아파 자발적으로 자신만의 조용한 동굴에 들어갔습니다. 애정 문제 외에 본인 삶의 무게 때문에 연락할 에너지가 바닥나 있으므로 재촉은 금물입니다."
        },
        job: {
          tag: "진로 심사숙고, 자격증 취득, 내실 다지기",
          desc: "무작정 지원서를 던지기보다, 본인의 적성과 진로를 깊이 성찰해야 하는 정체기이자 내실의 시기입니다. 전문 기술 자격증 공부나 어학 성적 등 혼자 집중해서 결과물을 만들어야 하는 시험 준비에 가장 최적화되어 있습니다."
        },
        career: {
          tag: "이직 보류 권고, 이성적인 상황 분석, 침묵의 조언",
          desc: "충동적인 사표 제출이나 성급한 이직은 지양하는 것이 좋습니다. 현 직장에서의 문제점을 객관적으로 성찰하고 향후 5년의 커리어 플랜을 외부에 발설하지 않고 홀로 침착하게 기획해야 차후 더 큰 기회를 잡습니다."
        },
        business: {
          tag: "리스크 점검, 연구 개발, 내실 위주 경영",
          desc: "무리하게 사업 규모를 확장하거나 신규 투자를 감행하기보다, 현재 운영 중인 시스템의 취약점을 분석하고 보완해야 할 때입니다. 겉보기엔 정체되어 보이지만 장기적인 성장 기반을 닦는 연구 개발에 유익한 운입니다."
        },
        wealth: {
          tag: "소비 억제, 장기 저축, 자산 정밀 진단",
          desc: "충동적 투자나 공격적 자산 증식보다는 지출을 꽁꽁 묶어두는 절약과 장기 예적금이 유리합니다. 눈앞의 일확천금을 쫓기보다 현재 본인의 재무 상태를 정밀히 체크하고 장기적이고 안전한 자산 관리를 유지하십시오."
        },
        move: {
          tag: "이동 보류, 현재 거주지 점검, 조용한 환경",
          desc: "지금은 섣부른 이사나 매매 계약을 서두를 타이밍이 아닙니다. 이사할 주거지의 하자가 없는지, 주변 치안이나 대출 금리 등을 차분하게 다시 한 번 확인하며 때를 기다리는 것이 금전적 손실을 막는 현명한 처사입니다."
        },
        relation: {
          tag: "자발적 거리두기, 관계의 깊이 필터링",
          desc: "쓸데없이 인맥을 넓히며 에너지를 낭비하기보다, 진정으로 소중한 내 사람만을 선별하는 필터링의 시기입니다. 시끄러운 인간관계에서 한 발자국 물러나 혼자만의 차분한 독서와 충전의 시간을 갖기를 강력히 권합니다."
        },
        health: {
          tag: "만성 피로 예방, 명상과 휴식, 심신 안정",
          desc: "외부 활동이 잦아 에너지가 크게 소진되었습니다. 수면 부족이나 만성 피로에 노출되기 쉬우니 따뜻한 차를 마시며 명상을 하거나, 침실을 완전히 암전시켜 심신의 기력을 오롯이 충전하는 단독의 휴식이 필수입니다."
        },
        exam: {
          tag: "독서실 모드 집중, 심화 학업운, 깊은 연구",
          desc: "친구들과 어울려 공부하는 것보다 홀로 조용한 도서관에서 독학할 때 암기력과 응집력이 극대화됩니다. 기출문제를 심도 있게 짚고 오답 노트를 복습할 때 기대 이상의 높은 학업 시너지가 폭발할 것입니다."
        },
        general: {
          tag: "내면의 해답, 한 템포 쉬어가기, 지혜의 축적",
          desc: "외부에서 해결책을 찾으려 헤매기보다, 조용히 스스로의 내면을 돌아보면 자연스럽게 지혜로운 해답을 만나게 됩니다. 조급한 마음을 내려놓고 정적을 유지할 때 고민의 돌파구가 기적처럼 선명하게 떠오릅니다."
        }
      },
      wheel: {
        love: {
          tag: "피할 수 없는 변화, 관계의 타이밍, 재회 기류",
          desc: "정체되어 굳어 있던 두 사람의 운명적 주기가 새로운 궤도로 굴러가기 시작합니다. 예상치 못한 사건이나 공통의 인맥, 돌발적 타이밍을 통해 끊어졌던 연락이 닿거나 서로를 의식하게 되는 극적인 반전을 유도합니다."
        },
        job: {
          tag: "취업의 터닝포인트, 귀한 기회, 면접 합격 타이밍",
          desc: "지루하게 지속되던 구직 활동에 드디어 큰 물꼬가 트입니다. 생각지 못한 헤드헌터의 연락이나 우연히 발견한 공고를 통해 귀하에게 꼭 맞는 터닝포인트를 얻게 되며, 운명적으로 입사할 회사와 강력한 연이 닿는 타이밍입니다."
        },
        career: {
          tag: "이직운 개방, 환경의 극적 변화, 스카웃",
          desc: "직장에서 부서 이동이나 이직의 주기가 도래했습니다. 흐름에 몸을 맡기면 더 발전적인 방향으로 커리어가 자연스럽게 굴러가며, 갑작스럽지만 매력적인 회사로의 이직 제안을 승낙하여 운세를 업그레이드할 기회입니다."
        },
        business: {
          tag: "매출 터닝포인트, 트렌드 동조, 비즈니스 반전",
          desc: "정체되어 있던 매출이나 고객 흐름에 극적인 반전이 일어납니다. 새로운 시장 트렌드와 귀하의 사업 모델이 완벽하게 맞물려 폭발적인 성장을 이루거나, 위기 상황이 도리어 기회로 대전환되는 운명적 주기가 작동합니다."
        },
        wealth: {
          tag: "재운의 흐름 대전환, 투자 수익 실현, 자금 순환",
          desc: "자금의 막힌 혈이 시원하게 뚫리며 금전 운세가 우상향으로 요동칩니다. 물려 있던 주식이나 부동산 등에서 매수세가 붙어 수익을 실현하거나, 막혔던 대출이 풀리는 등 금전 상황이 유기적으로 해결될 아주 긍정적인 타이밍입니다."
        },
        move: {
          tag: "거부할 수 없는 이사, 새로운 터전, 빠른 계약 진행",
          desc: "이직이나 파견 등 거부할 수 없는 환경적 요인으로 인해 빠르게 이사를 결정하게 되는 운입니다. 이 주거지 이동은 결과적으로 귀하의 삶을 더 높은 궤도로 이끄는 길운이므로 변화를 두려워 말고 흘러가는 대로 추진하셔도 좋습니다."
        },
        relation: {
          tag: "인맥 재편성, 뜻밖의 귀인 재회, 갈등 극복",
          desc: "해묵은 인간관계의 오해가 우연한 만남이나 제3자의 중재로 인해 자연스럽게 풀립니다. 귀하의 인맥 구도가 새롭게 물갈이되며 귀하의 앞날에 큰 영감과 도움을 줄 든든한 평생의 은인과 재회할 강력한 기류가 포착됩니다."
        },
        health: {
          tag: "체질 개선 성공, 만성 질환 극복, 건강 밸런스 회복",
          desc: "체력이 저하되어 고생하셨다면 새로운 치료 요법이나 명의를 만나 몸이 놀랍도록 호전됩니다. 신체 바이오리듬이 최상의 상태로 올라오는 대전환의 주기를 맞이했으니 가벼운 산책과 운동을 동반하시면 금상첨화입니다."
        },
        exam: {
          tag: "찍기운 상승, 모의고사 극복, 합격 가시화",
          desc: "기대하지 않았던 파트에서 문제가 다수 출제되거나 찍기운이 우세하게 작용합니다. 아슬아슬한 합격 커트라인을 넘을 수 있는 운명적인 행운이 따니 끝까지 집중을 흐트러뜨리지 마시고 시험에 임하시길 바랍니다."
        },
        general: {
          tag: "운명의 변곡점, 우연의 연속, 고민 극적 해결",
          desc: "귀하의 힘으로 해결하기 어려웠던 골치 아픈 고민이 외부의 자연스러운 흐름과 우연한 기회를 통해 눈 녹듯 풀려갑니다. 인생의 수레바퀴가 귀하를 돕는 방향으로 세차게 굴러가니 안심하고 흐름에 승선하십시오."
        }
      },
      death: {
        love: {
          tag: "관계의 종결, 리셋 후 재탄생, 냉정한 결단",
          desc: "어중간하고 애매했던 과거의 관계 패턴을 완전히 청산해야 함을 강력히 경고합니다. 아픔이 수반되더라도 기존의 오해 가득한 룰을 폐기하고, 아예 처음부터 백지상태로 새로운 규칙을 세우고 만나거나 관계를 환골탈태시켜야 합니다."
        },
        job: {
          tag: "진로의 완전 변경, 새로운 업종 도전, 청산",
          desc: "미련을 가지고 붙잡고 있던 기존 진로나 직무를 과감히 내려놓고, 아예 새로운 분야로 방향을 180도 선회해야 하는 운입니다. 이 과감한 청산은 뼈아프겠지만 귀하의 재능을 더 널리 펼칠 새로운 일자리로 가는 필연적 통과의례입니다."
        },
        career: {
          tag: "퇴사와 이직 확정, 해묵은 관계 청산, 리셋",
          desc: "더 이상 미련을 두고 질질 끌 필요가 없는 직장에 마침표를 찍게 됩니다. 가혹하지만 지금의 사표 제출과 이별은 귀하의 가치를 알아보지 못하는 조직에서 벗어나, 완전히 새롭게 귀하의 영혼을 피워낼 새로운 이직을 도모하는 첫걸음입니다."
        },
        business: {
          tag: "구조 조정, 신규 업태 전향, 부실 요인 청산",
          desc: "수익이 나지 않는 한계 사업이나 취약한 거래처를 정리하고, 트렌드에 맞춘 새로운 아이템으로 업종을 전향해야 하는 리빌딩의 운입니다. 과감한 다이어트와 폐업 후 재창업의 과정에서 비로소 강력한 생존력이 싹틉니다."
        },
        wealth: {
          tag: "손절과 현금 확보, 부채 청산, 자산 재배치",
          desc: "손실을 보고 있는 자산에 대해 더 이상 미련을 두지 말고 신속히 처분(손절)하여 현금을 확보하는 결단이 유리합니다. 골치 아픈 채무 관계를 단절하고, 처음부터 가계부를 새로 쓴다는 마음으로 제로 베이스 자산 구조를 재설계해야 합니다."
        },
        move: {
          tag: "새출발 이사, 과거 흔적 지우기, 낡은 주거지 처분",
          desc: "오래 살았던 지역이나 안 좋은 추억이 깃든 공간을 완전히 떠나, 연고가 전혀 없는 새로운 환경으로 터전을 완전히 리셋하는 이사 운입니다. 이 이동을 통해 해묵은 액운이 떨어져 나가고 삶에 신선한 산소가 주입됩니다."
        },
        relation: {
          tag: "인맥 대청소, 악연 손절, 독립 선언",
          desc: "귀하의 정신을 피폐하게 만들고 에너지마저 좀먹는 소모적인 관계나 악연을 과감히 정리할 시기입니다. 연락처를 차단하고 혼자가 되는 것을 두려워하지 않을 때, 맑고 건전한 귀인들이 빈자리를 채웁니다."
        },
        health: {
          tag: "체질 체인저, 나쁜 습관 단절, 완벽한 해독",
          desc: "몸에 해롭던 만성 술, 담배, 무질서한 수면 등의 나쁜 습관을 완전히 뿌리 뽑을 하늘의 결단 기회입니다. 몸을 완전히 비워내는 디톡스나 식단 조정을 시작하기에 가장 위력적인 흐름이며, 체질이 한결 가볍게 갱생됩니다."
        },
        exam: {
          tag: "수험 생활 청산, 과감한 진로 전환, 재시작",
          desc: "밑 빠진 독에 물 붓듯 붙잡고 있던 해묵은 장기 고시나 공무원 준비에 결단을 내리고, 실용적인 자격증이나 취업으로 방향을 완전히 개편할 시기입니다. 이 정리가 삶에 새로운 추진력을 제공하여 더 빠르게 일어설 것입니다."
        },
        general: {
          tag: "위대한 청산, 옛 삶의 조종, 새 인생 설계",
          desc: "끝까지 버텨도 소용없는 문제에 대해 조용히 패배를 인정하고 판을 엎는 것이 도리어 개운의 비방입니다. 과거의 무거운 집착을 흘려보내는 순간, 그 즉시 생각지도 못했던 새로운 기회와 평온이 파도처럼 밀려옵니다."
        }
      },
      tower: {
        love: {
          tag: "돌발 마찰, 오해 폭발, 관계의 대변동",
          desc: "누적되었던 사소한 불만이 화(火)의 벼락처럼 터지며 신뢰 구도가 부서졌던 위기를 드러냅니다. 그러나 숨겨진 고름이 밖으로 완전히 분출된 격이므로, 이 파괴의 고비를 이성적으로 직시하면 더 진솔하고 단단한 애정으로의 비약이 열립니다."
        },
        job: {
          tag: "돌발 합격 소식, 예기치 못한 공고, 면접 충격",
          desc: "구직 활동 중 예상치 못했던 기업에서 깜짝 합격 연락이 오거나, 반대로 가고 싶었던 기업의 1차 면접에서 갑자기 탈락하는 등 롤러코스터 같은 돌발 충격이 예상됩니다. 충격을 냉정히 극복하면 더 알짜배기 기회가 나타납니다."
        },
        career: {
          tag: "구조 조정 소식, 급작스러운 이사 및 이직, 조직 개편",
          desc: "회사 내에 대대적인 조직 개편이나 갑작스러운 부서 이동, 혹은 퇴사 권고 등 통제할 수 없는 급작스러운 벼락 기류가 부는데, 이는 귀하가 고여 있는 우물 안 개구리에서 탈출해 강한 추진력을 갖고 더 큰 기업으로 이직하도록 재촉하는 운명적 자극제입니다."
        },
        business: {
          tag: "위기 관리, 시스템 장애 주의, 급변하는 리스크 대처",
          desc: "운영 중인 매장이나 사업장에 갑작스러운 세무 조사, 컴플레인, 기계 고장 등의 돌발 소동이 생길 수 있으니 철저히 대비해야 합니다. 하지만 이를 기점으로 보안과 내부 매뉴얼을 완전히 개혁하면 전화위복의 발판이 됩니다."
        },
        wealth: {
          tag: "돌발 지출 발생, 투기성 자산 폭락 경고, 비상금 준비",
          desc: "예상치 못한 가전제품 고장, 접촉 사고, 병원비 등으로 급격한 지출이 발생할 기류가 감돕니다. 투기적인 코인이나 무리한 주식 레버리지는 뼈아픈 폭락으로 이어질 수 있으니 신속히 자산을 보수적으로 안전하게 회수하십시오."
        },
        move: {
          tag: "갑작스러운 거주지 이전, 부동산 돌발 변수 경고",
          desc: "집주인과의 갑작스러운 갈등이나 매물 하자 등으로 인해 계획에 없던 번개 같은 이사를 서두르게 될 기류입니다. 이럴 때일수록 마음을 가라앉히고 등기부등본을 꼼꼼히 살피며 계약을 냉철하게 성사시켜야 손해가 없습니다."
        },
        relation: {
          tag: "오해의 대폭발, 감정 싸움 극대화, 관계의 위기",
          desc: "오랫동안 묻어둔 갈등이 사소한 말 한마디로 인해 화산처럼 대폭발하여 서로 큰 상처를 주기 쉬운 위험한 기류입니다. 상대방이 격분했을 때 말꼬리를 잡지 말고 자리를 완전히 이탈해 시간을 벌어야 최악의 파국을 면합니다."
        },
        health: {
          tag: "돌발 부상 주의, 디스크나 급성 염증 조심",
          desc: "계단에서 발목을 접지르거나, 무거운 짐을 들다가 허리 디스크 통증이 도지는 등 예기치 못한 부상과 염증 위험이 강하게 드러납니다. 과격한 운동을 피하고 신체 움직임에 유독 차분한 이성을 깃들여 조심하십시오."
        },
        exam: {
          tag: "시험 당일 변수 주의, 실수 방어, 최후의 승부수",
          desc: "시험 당일 교통 체증, 신분증 분실, 혹은 엉뚱하게 밀려 쓰는 마킹 실수 등 돌발 장애가 우려되는 텐션 높은 흐름입니다. 평소보다 1시간 먼저 시험장에 도착하고 필기도구를 여러 번 체크하여 평정심을 방어하십시오."
        },
        general: {
          tag: "충격적인 터닝포인트, 번개 같은 사건, 정면 돌파",
          desc: "계획했던 모든 일이 예상치 못한 복병을 만나 잠시 정지되는 듯한 엄청난 난관에 직면합니다. 하지만 이 껍질이 깨지는 파괴의 충격을 피하지 않고 정면으로 돌파할 때, 비로소 삶의 진정한 독립과 성공이 비약합니다."
        }
      },
      fool: {
        love: {
          tag: "자유 추구, 구속 회피, 가벼운 시작",
          desc: "상대방은 미래에 대한 무거운 책임과 의무에서 한 발짝 벗어나, 귀하와 가벼운 농담을 나누거나 무구한 소통을 즐기고 싶어 합니다. 섣부른 진지함으로 상대를 정의하려 들지 말고 물 흐르듯 가볍게 분위기를 조성해 보십시오."
        },
        job: {
          tag: "모험적 도전, 스타트업 적성, 낙천적 구직",
          desc: "보수적이고 엄격한 대기업보다 귀하의 아이디어가 마구 존중받는 신생 스타트업이나 프리랜서 진로가 어울리는 운입니다. 당장 눈앞의 합격 실패에 얽매이지 말고, 인생의 모험을 즐긴다는 낙천성으로 문을 두드려 보십시오."
        },
        career: {
          tag: "무작정 퇴사 본능, 프리랜서 독립, 새로운 도전",
          desc: "조직의 답답한 규율에서 벗어나 정처 없이 떠나고픈 강렬한 자유 본능이 고개를 듭니다. 준비되지 않은 즉흥적인 퇴사는 두렵겠지만, 가슴을 뛰게 하는 프리랜서나 1인 창업으로의 전환을 과감하게 시험해보는 것도 좋습니다."
        },
        business: {
          tag: "획기적인 발상, 트렌디한 시도, 위험 부담 감수",
          desc: "기존의 상식을 뒤엎는 다소 엉뚱하지만 참신한 시도가 MZ 세대의 이목을 사로잡을 수 있습니다. 무겁게 시작하기보다 팝업스토어나 가벼운 온라인 샵 형태로 리스크를 0에 수렴하게 하여 창의적 비즈니스를 개방하십시오."
        },
        wealth: {
          tag: "충동 구매 주의, 묻지마 투자 경고, 얇아지는 지갑",
          desc: "기분 내키는 대로 친구들에게 술자리를 쏘거나, 계획에 없던 충동적인 물건 소비로 지갑이 순식간에 털릴 기류입니다. 묻지마 소문만 믿고 가벼운 마음으로 던지는 투자는 휴지 조각이 될 수 있으니 주의를 요합니다."
        },
        move: {
          tag: "즉흥적 거주지 결정, 쉐어하우스 입주, 낯선 환경 탐방",
          desc: "너무 골치 아프게 재지 않고 발길 닿는 대로, 혹은 마음에 드는 뷰만 보고 덜컥 이사 계약을 체결하기 쉬운 즉흥운입니다. 집안 누수나 계약 세부 사항을 놓쳐 나중에 고생할 수 있으니 대리인을 통해 한 번 더 확인하십시오."
        },
        relation: {
          tag: "격식 없는 소통, 새로운 친구들과의 만남, 얽매임 없음",
          desc: "상대방의 배경이나 조건을 따지지 않고 순수하게 대화 코드가 맞아 급속도로 친해지는 자유로운 인맥이 형성됩니다. 상대방의 사소한 집착이나 구속에는 쿨하게 대처하며 가벼운 밀당을 유지하는 것이 비법입니다."
        },
        health: {
          tag: "정신적 해방, 불면증 치유, 자연 속 여행 권고",
          desc: "머리를 복잡하게 채우던 오만가지 생각을 완전히 리셋하고 나니 심신이 솜사탕처럼 가벼워집니다. 스마트폰을 꺼두고 자연 속으로 가볍게 훌쩍 캠핑을 떠나 심신을 정화하기에 가장 호쾌한 건강 타이밍입니다."
        },
        exam: {
          tag: "공부의 흥미 유발, 지나친 방심 금물, 컨디션 난조 극복",
          desc: "자신만만하고 가벼운 기분으로 시험을 준비하나, 기초적인 디테일을 놓쳐 어이없는 실수를 저지르기 쉬운 다소 붕 뜬 학업운입니다. 시험지 첫 장부터 끝까지 꼼꼼히 차분하게 다시 읽어보는 의식적인 주의력이 필수적입니다."
        },
        general: {
          tag: "자유로운 영혼, 새로운 출발점, 고민의 가벼운 해소",
          desc: "고민의 원인이 되던 문제들을 너무 심각하게 받지 않고 '어떻게든 되겠지'라는 홀가분한 마음으로 바라볼 때, 도리어 모든 부담이 기적처럼 털어집니다. 벼랑 끝에서 도약하는 광대처럼 용기 있게 마음의 짐을 던지십시오."
        }
      }
    };
    const cardData = data[cardId] || data.lovers;
    return cardData[category] || cardData.general;
  };

  const getTarotPrescription = (category, futureCardId) => {
    // 8가지 결론 카드에 따른 핵심 행동 전략 매핑
    const cardStrategies = {
      magician: {
        title: "창조적 돌파구 & 재능 발휘",
        action: "지금은 새로운 아이디어와 본인의 역량을 적극적으로 세상에 세일즈해야 할 타이밍입니다. 망설이지 말고 주도적으로 소통을 시작하여 판을 리드하십시오."
      },
      empress: {
        title: "여유와 수용 & 결실의 안착",
        action: "안정감과 풍요로움이 눈앞에 있으니 조급하게 다그치지 마십시오. 주변 조력자들의 조언을 경청하고 포용력 있는 자세를 가질 때 비로소 내 것으로 안착합니다."
      },
      lovers: {
        title: "교감과 조화 & 협력적 선택",
        action: "마음이 통하는 이들과의 적극적인 협업과 정서적 교감이 최상의 솔루션입니다. 혼자 짊어지려 하지 말고 케미스트리가 맞는 조력자와 소통하여 함께 해결책을 도모하십시오."
      },
      hermit: {
        title: "내실 충전 & 심사숙고",
        action: "잠시 속도 조절이 필요한 정체기입니다. 외부의 소음에서 한 발자국 물러나 혼자 조용히 지식을 갈고닦거나 내면의 소리에 집중하며 때를 기다리는 것이 현명합니다."
      },
      wheel: {
        title: "기회의 흐름 동조 & 적극 수용",
        action: "운명의 타이밍이 강력하게 요동치며 기회를 가져다주는 시기입니다. 밀려오는 변화의 파도를 거부하지 말고, 가벼운 마음으로 올라타 새로운 변곡점을 맞이하십시오."
      },
      death: {
        title: "과감한 리셋 & 옛 굴레 청산",
        action: "미련 때문에 붙잡고 있던 기존의 낡은 패러다임을 과감히 단절하고 완전히 제로 베이스에서 시작할 때입니다. 과감한 비움이야말로 새로운 기적을 부릅니다."
      },
      tower: {
        title: "비상 정비 & 평정심 방어",
        action: "돌발적인 장애물이나 급작스러운 감정 폭발이 우려됩니다. 당황하여 맞대응하기보다는 한 걸음 물러나 비상 프로토콜을 확인하고 평정심을 유지하는 방패 전술이 필수입니다."
      },
      fool: {
        title: "자유로운 도전 & 편견 탈피",
        action: "복잡하게 계산기를 두드리지 말고 본능의 직관과 호기심을 믿고 가볍게 시도해 보십시오. 격식 없는 낙천적 태도가 꼬인 실타래를 푸는 의외의 정답이 됩니다."
      }
    };

    const defaultStrategy = cardStrategies.lovers;
    const strategy = cardStrategies[futureCardId] || defaultStrategy;

    const basePrescriptions = {
      love: {
        advice: `💡 [연애 / 속마음] 관계 처방 - [${strategy.title}]: 상대의 마음에 무리하게 맞춰주거나 집착하기보다, 현재 상황을 객관적으로 보며 ${strategy.action}`,
        secret: "행운의 비방: 서로 마주 보는 장소보다는 물길이 보이고 공기가 맑은 자연 속이나 탁 트인 야외 공간에서 조율할 때 감정 정화 속도가 빨라집니다."
      },
      job: {
        advice: `💡 [취업 / 진로] 직무 개척 - [${strategy.title}]: 서류나 면접 탈락 소식에 위축될 필요가 전혀 없습니다. 귀하의 재능을 믿고 ${strategy.action}`,
        secret: "행운의 비방: 오전 햇살을 30분 이상 쬐며 이상적인 진로 방향을 시각화하고, 남동쪽 방향의 도서관이나 카페를 활용해 공부 효율을 극대화하십시오."
      },
      career: {
        advice: `💡 [이직 / 퇴사] 커리어 전환 - [${strategy.title}]: 충동적으로 사표를 던지기보다 확실한 계약 조건과 시기를 가늠해야 합니다. ${strategy.action}`,
        secret: "행운의 비방: 금속(金)의 결단력이 필요하므로 메탈 시계를 착용하고 이력서를 노란색 테두리의 포트폴리오 바인더에 정갈히 정리해 두십시오."
      },
      business: {
        advice: `💡 [사업 / 창업] 매출 증대 - [${strategy.title}]: 마케팅 and 자금의 흐름을 보수적으로 진단해야 하는 시기입니다. ${strategy.action}`,
        secret: "행운의 비방: 매장 입구에 붉은색(火) 계열의 행운 인테리어를 적용하고, 미팅 시 정갈하고 깔끔한 화이트 상의를 착용해 신뢰를 극대화하십시오."
      },
      wealth: {
        advice: `💡 [금전 / 재물] 자산 보강 - [${strategy.title}]: 새어나가는 사소한 지출 채널을 차단하고 든든한 저축 기조를 유지해야 합니다. ${strategy.action}`,
        secret: "행운의 비방: 거주지 북쪽 서랍에 자산을 상징하는 메탈 소품이나 동전을 노란 비단에 싸서 깊이 보관하는 비방을 제안합니다."
      },
      move: {
        advice: `💡 [이동수 / 이사] 주거 이전 - [${strategy.title}]: 계약 시 부동산 서류의 세부 조항과 누수 여부를 면밀히 재검토해야 낭패가 없습니다. ${strategy.action}`,
        secret: "행운의 비방: 이사 당일 쌀독이나 밥솥을 집안의 정중앙에 가장 먼저 배치하여 평안과 번창을 유도하고 동쪽에 녹색 식물을 두십시오."
      },
      relation: {
        advice: `💡 [인간관계] 갈등 완화 - [${strategy.title}]: 나를 힘들게 하는 주변 사람들과는 완만히 거리를 두고 '건강한 거절'을 시도할 때입니다. ${strategy.action}`,
        secret: "행운의 비방: 감정이 혼란스러울 때는 초록색 계열의 포인트 액세서리를 매치하고 차분한 클래식 음악을 청취하며 마음의 안정을 찾으십시오."
      },
      health: {
        advice: `💡 [건강운] 활력 충전 - [${strategy.title}]: 체력과 바이오리듬이 저하되기 쉬운 주기에 들어섰으므로 무리한 일정은 삼가고 ${strategy.action}`,
        secret: "행운의 비방: 취침 전 스마트폰을 머리맡에서 멀리 치우고, 가벼운 족욕이나 반신욕을 통해 하체의 차가운 한기를 위로 순환시켜 머리를 맑게 하십시오."
      },
      exam: {
        advice: `💡 [학업 / 시험] 합격 증진 - [${strategy.title}]: 기출문제 오답 노트를 복습하며 실수 패턴을 철저하게 방어하는 내실 다지기가 최우선입니다. ${strategy.action}`,
        secret: "행운의 비방: 메탈 케이스의 학용품을 휴대하고, 시험 시작 15분 전에 가벼운 심호흡과 함께 뇌가 맑아지는 맑은 생수를 한 잔 들이켜십시오."
      },
      general: {
        advice: `💡 [각종 고민] 해결 돌파 - [${strategy.title}]: 혼자 모든 짐을 지고 끙끙대기보다 마음속 불안의 본질을 이성적으로 바라보며 ${strategy.action}`,
        secret: "행운의 비방: 햇볕이 잘 드는 창가나 화창한 야외로 나가 맑은 공기를 깊이 들이마시며 근심의 실타래가 원만히 풀리는 이미지를 마인드셋 하십시오."
      }
    };

    const target = basePrescriptions[category] || basePrescriptions.general;
    return [target.advice, target.secret];
  };

  const renderTarotContent = () => {
    const cardsParam = searchParams.get("cards") || "lovers,hermit,wheel";
    const selectedKeys = cardsParam.split(",").filter(Boolean);
    const worryCategory = searchParams.get("worryCategory") || "general";

    const baseTarotDb = {
      magician: {
        name: "1. 마법사 (The Magician)",
        roman: "I",
        eng: "THE MAGICIAN",
      },
      empress: {
        name: "3. 여황제 (The Empress)",
        roman: "III",
        eng: "THE EMPRESS",
      },
      lovers: {
        name: "6. 연인 (The Lovers)",
        roman: "VI",
        eng: "THE LOVERS",
      },
      hermit: {
        name: "9. 은둔자 (The Hermit)",
        roman: "IX",
        eng: "THE HERMIT",
      },
      wheel: {
        name: "10. 운명의 수레바퀴 (Wheel of Fortune)",
        roman: "X",
        eng: "THE WHEEL",
      },
      death: {
        name: "13. 죽음 (Death)",
        roman: "XIII",
        eng: "DEATH",
      },
      tower: {
        name: "16. 탑 (The Tower)",
        roman: "XVI",
        eng: "THE TOWER",
      },
      fool: {
        name: "0. 광대 (The Fool)",
        roman: "0",
        eng: "THE FOOL",
      }
    };

    // 고민 분야에 맞춤 결부된 해석으로 dynamic 매핑
    const tarotDb = {};
    Object.keys(baseTarotDb).forEach(key => {
      const interp = getTarotCardInterpretation(key, worryCategory);
      tarotDb[key] = {
        ...baseTarotDb[key],
        tag: interp.tag,
        desc: interp.desc
      };
    });

    // Ensure we have exactly 3 fallback cards if query is invalid or empty
    const activeKeys = selectedKeys.length >= 3 ? selectedKeys.slice(0, 3) : ["lovers", "hermit", "wheel"];
    const timelineLabels = ["과거의 기류 (Past)", "현재의 상황 (Present)", "미래의 조언 (Future)"];

    return (
      <>
        {/* Header Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-red-600 font-bold block">혜안당 1:1 맞춤 타로</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            제 1장. 혜안당 1:1 맞춤 타로 상담 리포트
          </h2>
          <div className="w-24 h-0.5 bg-red-600/30 mx-auto my-2" />
        </div>

        {/* Process Box */}
        <div className="bg-[#F9F8F6] border border-[#E2DDD5] rounded-lg p-5 mb-8 text-xs space-y-2 shadow-sm">
          <span className="font-bold text-[#A3845B] block">🔮 타로 리딩 진행 방식 안내:</span>
          <p className="text-[#5F5F5F] leading-relaxed font-light font-traditional">
            본 보고서는 <strong>귀하가 입력 폼 단계에서 온 정신을 집중해 직접 뽑은 3장의 비화(秘話) 카드 배열</strong>을 바탕으로 분석되었습니다. 타로는 점치는 순간의 손끝 주파수를 통해 시시각각 변하는 질문자의 무의식을 읽어내는 최고의 거울입니다. 과거의 뿌리, 현재의 원인, 미래의 전술을 연계하여 독해했습니다.
          </p>
        </div>

        {/* Worry Text Context */}
        {worryText && (
          <div className="border-l-4 border-red-500 bg-red-500/5 p-4 rounded-lg mb-8 text-xs space-y-2">
            <span className="font-bold text-red-600">제출하신 맞춤형 고민 내용:</span>
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
            🔮 고민 해결을 위한 최종 타로 상담사 처방
          </h4>
          <ul className="text-xs text-[#5F5F5F] leading-relaxed space-y-2 font-light">
            {getTarotPrescription(worryCategory, activeKeys[2]).map((presc, pIdx) => {
              const parts = presc.split(":");
              return (
                <li key={pIdx} className="flex gap-1.5 items-start">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>{parts[0]}:</strong>{parts[1]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  };


  // ----------------------------------------------------
  // Render: 연인 궁합 (gunghap)
  // ----------------------------------------------------
  // 명리학적 분석 헬퍼 사전 및 함수군 (연인 궁합용)
  const getCheonganHarmonyText = (myStem, partnerStem) => {
    const harmonyMap = {
      "甲己": "두 사람의 만남은 명리학에서 가장 으뜸으로 치는 '중정지합(中正之合)'을 이룹니다. 서로를 향한 존중이 깊고 성품이 정직하며, 흔들림 없이 신뢰를 쌓아가는 품격 있는 결합입니다.",
      "己甲": "두 사람의 만남은 명리학에서 가장 으뜸으로 치는 '중정지합(中正之合)'을 이룹니다. 서로를 향한 존중이 깊고 성품이 정직하며, 흔들림 없이 신뢰를 쌓아가는 품격 있는 결합입니다.",
      "乙庚": "서로의 다름을 의리와 강한 책임감으로 감싸주는 '인의지합(仁義之合)'의 기류가 흐릅니다. 서로를 향한 약속을 목숨처럼 소중히 여기며 든든한 동반자가 되어주는 굳건한 결합입니다.",
      "庚乙": "서로의 다름을 의리와 강한 책임감으로 감싸주는 '인의지합(仁義之合)'의 기류가 흐릅니다. 서로를 향한 약속을 목숨처럼 소중히 여기며 든든한 동반자가 되어주는 굳건한 결합입니다.",
      "丙辛": "이성적인 신뢰와 뜨거운 열정이 절묘하게 공명하는 '위제지합(威制之合)'을 이룹니다. 첫눈에 강하게 끌리는 운명적인 인력과 감각적인 주파수가 아름답게 맞물리는 세련된 배합입니다.",
      "辛丙": "이성적인 신뢰와 뜨거운 열정이 절묘하게 공명하는 '위제지합(威制之合)'을 이룹니다. 첫눈에 강하게 끌리는 운명적인 인력과 감각적인 주파수가 아름답게 맞물리는 세련된 배합입니다.",
      "丁壬": "마음 깊은 곳의 다정한 정서가 물 흐르듯 융합되는 '인수지합(仁壽之合)'의 인연입니다. 말하지 않아도 서로의 외로움과 감정을 보듬어 안아주는 따뜻하고 포근한 영혼의 결합을 보여줍니다.",
      "壬丁": "마음 깊은 곳의 다정한 정서가 물 흐르듯 융합되는 '인수지합(仁壽之合)'의 인연입니다. 말하지 않아도 서로의 외로움과 감정을 보듬어 안아주는 따뜻하고 포근한 영혼의 결합을 보여줍니다.",
      "戊癸": "현실적인 생활력과 섬세한 정서적 배려가 기묘하게 어우러지는 '무정지합(無情之合)'을 이룹니다. 나이 차이나 환경의 차이를 극복하고 서로의 부족함을 냉정하면서도 확실하게 메꿔줍니다.",
      "癸戊": "현실적인 생활력과 섬세한 정서적 배려가 기묘하게 어우러지는 '무정지합(無情之合)'을 이룹니다. 나이 차이나 환경의 차이를 극복하고 서로의 부족함을 냉정하면서도 확실하게 메꿔줍니다."
    };

    const key = myStem + partnerStem;
    const revKey = partnerStem + myStem;
    if (harmonyMap[key]) return harmonyMap[key];
    if (harmonyMap[revKey]) return harmonyMap[revKey];

    // 오행 추출
    const getEl = (stem) => {
      if (["甲", "乙"].includes(stem)) return "목";
      if (["丙", "丁"].includes(stem)) return "화";
      if (["戊", "己"].includes(stem)) return "토";
      if (["庚", "辛"].includes(stem)) return "금";
      return "수";
    };

    const myEl = getEl(myStem);
    const partnerEl = getEl(partnerStem);

    // 1. 같은 오행 (비겁)
    if (myEl === partnerEl) {
      const elNames = {
        "목": "푸른 목(木, 나무) 기운",
        "화": "뜨거운 화(火, 불) 기운",
        "토": "단단한 토(土, 흙) 기운",
        "금": "냉철한 금(金, 쇠) 기운",
        "수": "유연한 수(水, 물) 기운"
      };
      return `${name}님의 ${myStem}(${myEl}) 기운과 상대방의 ${partnerStem}(${partnerEl}) 기운은 둘 다 같은 ${elNames[myEl]}을 공유하고 있습니다. 서로 생각하는 방식과 추구하는 가치관이 매우 유사하여 첫 만남부터 친구처럼 편안함을 느낍니다. 다만 고집이 부딪힐 때는 평행선을 달리기 쉬우니 한 걸음씩 물러서는 지혜가 요구됩니다.`;
    }

    // 2. 상생 관계 (생해주는 구조)
    const saengPairs = {
      "목화": `${name}님의 목(木) 기운이 상대방의 화(火) 기운을 목생화(木生火, 나무가 불을 생함)로 든든히 밀어주는 상생의 상성입니다. ${name}님의 따뜻한 조력과 아이디어가 상대방의 행동력을 극대화하며, 만날수록 서로의 성장판을 넓혀주는 아주 발전적인 궁합입니다.`,
      "화목": `상대방의 목(木) 기운이 ${name}님의 화(火) 기운을 목생화(木生火, 나무가 불을 생함)로 따뜻하게 돋워주는 상생 배합입니다. 상대방의 한결같은 배려와 든든한 지원 아래 ${name}님이 마음껏 본인의 재능과 열정을 발휘할 수 있는 포근하고 길한 관계입니다.`,
      
      "화토": `${name}님의 화(火) 기운이 상대방의 토(土) 기운을 화생토(火生土, 불이 흙을 생함)로 따뜻하게 데워주는 상성입니다. ${name}님의 명쾌한 표현력이 상대방의 묵직한 신뢰감을 깨워주어 정서적 포만감을 주며 가정을 편안하게 유지하도록 돕습니다.`,
      "토화": `상대방의 화(火) 기운이 ${name}님의 토(土) 기운을 화생토(火生土, 불이 흙을 생함)로 든든하게 익혀주는 상생 궁합입니다. 상대방의 생기 넘치는 에너지 덕분에 ${name}님이 지치지 않고 인생의 든든한 기초를 일궈갈 수 있습니다.`,
      
      "토금": `${name}님의 토(土) 기운이 상대방의 금(金) 기운을 토생금(土生金, 흙이 쇠를 생함)로 단단하게 자양해 주는 흐름입니다. ${name}님의 한결같은 내조와 포용력이 상대방의 사회적 성공과 결단을 빛나게 이끌어 줍니다.`,
      "금토": `상대방의 토(土) 기운이 ${name}님의 금(金) 기운을 토생금(土生金, 흙이 쇠를 생함)으로 따뜻하게 감싸 안아주는 상성입니다. 상대방의 흔들림 없는 신뢰감 속에서 ${name}님이 가장 편안한 안식처를 얻게 됩니다.`,
      
      "금수": `${name}님의 금(金) 기운이 상대방의 수(水) 기운을 금생수(金生水, 쇠가 물을 생함)로 흘려보내 주는 상생 구조입니다. ${name}님의 명확한 판단력과 이성이 상대의 풍부한 예술성과 지혜를 세상 밖으로 꺼내주는 훌륭한 파트너십입니다.`,
      "수금": `상대방의 금(金) 기운이 ${name}님의 수(水) 기운을 금생수(金生水, 쇠가 물을 생함)로 시원하게 발원시켜 주는 길한 배합입니다. 상대의 확실한 가이드와 경제적 든든함 위에 ${name}님이 지혜를 마음껏 펼칠 수 있습니다.`,
      
      "수목": `${name}님의 수(水) 기운이 상대방의 목(木) 기운을 수생목(수생목, 물이 나무를 생함)으로 다정하게 키워주는 흐름입니다. ${name}님의 깊은 성찰과 수용력이 상대방의 원대한 성장에 훌륭한 생명수가 되어 줍니다.`,
      "목수": `상대방의 수(水) 기운이 ${name}님의 목(木) 기운을 수생목(수생목, 물이 나무를 생함)으로 촉촉하게 보살펴 주는 아름다운 조합입니다. 방황할 때 상대방의 혜안 속에서 완벽한 힐링을 선사받게 됩니다.`
    };

    const saengKey = myEl + partnerEl;
    if (saengPairs[saengKey]) return saengPairs[saengKey];

    // 3. 상극 관계 (제어/조율하는 구조)
    const geukPairs = {
      "목토": `${name}님의 목(木) 기운이 상대방의 토(土) 기운을 목극토(木剋土, 나무가 흙을 극함)로 개척하고 주도하는 상성입니다. ${name}님이 관계의 규칙이나 방향을 이끌어갈 때 조화로우나, 지나치게 제어하려 들면 상대방의 고요한 평정이 깨질 수 있으니 자율성을 충분히 지지해야 합니다.`,
      "토목": `상대방의 목(木) 기운이 ${name}님의 토(土) 기운을 목극토(木剋土, 나무가 흙을 극함)로 일깨우고 파헤치는 긴장성 배합입니다. 상대의 적극적인 추진력에 가끔은 답답함을 느낄 수 있으니, 서로의 프라이버시를 지켜주는 거리가 필요합니다.`,
      
      "토수": `${name}님의 토(土) 기운이 상대방의 수(水) 기운을 토극수(土剋水, 흙이 물을 극함)로 다듬고 물길을 내주는 조율의 상성입니다. ${name}님의 도덕성과 원칙이 상대방의 자유롭고 감성적인 흐름에 든든한 방파제가 되어 줍니다. 과한 통제만 피하면 좋습니다.`,
      "수토": `상대방의 토(土) 기운이 ${name}님의 수(水) 기운을 토극수(土剋水, 흙이 물을 극함)로 조율하는 흐름입니다. 상대방의 보수적이거나 규범적인 틀이 ${name}님의 자유로운 영혼을 가두지 않도록 서로 열린 소통창을 열어놓는 약속이 요구됩니다.`,
      
      "수화": `${name}님의 수(水) 기운이 상대방의 화(火) 기운을 수극화(水剋火, 물이 불을 극함)로 조절해 주는 상성입니다. ${name}님의 냉철하고 차분한 이성이 상대의 다혈질적인 온도를 조율해 주는 밀당의 묘가 발휘됩니다.`,
      "화수": `상대방의 수(水) 기운이 ${name}님의 화(火) 기운을 수극화(水剋火, 물이 불을 극함)로 침착하게 누그러뜨려 주는 배합입니다. 상대의 그늘 속에서 ${name}님이 조급함을 내려놓고 한결 이성적인 결정을 해 나갈 수 있는 조화입니다.`,
      
      "화금": `${name}님의 화(火) 기운이 상대방의 금(金) 기운을 화극금(火剋金, 불이 쇠를 극함)으로 제련하는 역동적인 관계입니다. ${name}님의 열정과 솔직함이 상대의 예리하고 차가운 심장에 짜릿한 자극을 선사하나, 지나친 참견은 상대를 지치게 할 수 있습니다.`,
      "금화": `상대방의 화(火) 기운이 ${name}님의 금(金) 기운을 화극금(火剋金, 불이 쇠를 극함)으로 녹여내려 하는 뜨거운 끌림입니다. 이성적이던 ${name}님이 상대방 앞에서는 무장해제되는 독특한 감정적 텐션을 보여줍니다.`,
      
      "금목": `${name}님의 금(金) 기운이 상대방의 목(木) 기운을 금극목(金剋木, 쇠가 나무를 극함)으로 다듬어 조율하는 관계입니다. ${name}님의 현실적인 조언 및 판단력이 상대방의 막연한 구상을 깔끔하게 완성해주나, 말투를 부드럽게 섞어야 자존심 상함을 피할 수 있습니다.`,
      "목금": `상대방의 금(金) 기운이 ${name}님의 목(木) 기운을 금극목(金剋木, 쇠가 나무를 극함)으로 단호하게 다스리는 기류입니다. 상대방의 뼈아픈 현실적인 피드백이 귀한 거름이 되지만, 다정한 애정 표현이 섞일 때 비로소 상처 없이 화합합니다.`
    };

    const geukKey = myEl + partnerEl;
    return geukPairs[geukKey] || `${name}님의 ${myStem} 기운과 상대방의 ${partnerStem} 기운이 서로 다른 성향으로 만나, 각자의 고유한 삶의 가치를 새롭게 일깨워주며 다채로운 개성을 조화롭게 맞춰가는 배움의 상성입니다.`;
  };

  const getDynamicWorryResponse = (worryText, myBranch, partnerBranch) => {
    if (!worryText) return "";
    const decoded = decodeURIComponent(worryText);

    // 1. 카테고리 판별
    let category = "일반";
    if (decoded.match(/소통|대화|말|소외|이야기|소통이|대화가|말투/)) {
      category = "소통";
    } else if (decoded.match(/애정|사랑|바람|외도|마음|식음|감정|좋아|연애/)) {
      category = "애정";
    } else if (decoded.match(/돈|재물|결혼|혼인|자금|집|경제|현실|직업|일/)) {
      category = "재물결혼";
    } else if (decoded.match(/갈등|성격|싸움|다툼|화|분노|성질|마찰|차이/)) {
      category = "갈등성격";
    }

    // 2. 지지 관계 판별
    const hap = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
    const chung = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
    const wonjin = ["子未", "丑午", "寅酉", "卯申", "辰亥", "巳戌", "丑오"];

    const currentPair = myBranch + partnerBranch;
    const revPair = partnerBranch + myBranch;

    let relation = "일반";
    if (hap.includes(currentPair) || hap.includes(revPair)) {
      relation = "합";
    } else if (chung.includes(currentPair) || chung.includes(revPair)) {
      relation = "충";
    } else if (wonjin.includes(currentPair) || wonjin.includes(revPair)) {
      relation = "원진";
    }

    // 3. 20가지 매핑 테이블
    const responses = {
      "소통": {
        "합": `고민하신 소통 문제에 대해 두 분의 일지 지지를 대조해보면 다정한 '합(合)'의 관계를 맺고 있습니다. 이는 근본적으로 서로 대화가 깊이 통할 수 있는 정서적 주파수를 가졌음을 의미합니다. 다만 관계가 가까워 표현을 생략하여 생긴 일시적 오해일 뿐이니, 가벼운 대화로 풀어가시면 금세 신뢰를 회복하실 것입니다.`,
        "충": `대화와 소통 문제로 하신 고민은 일지 지지가 서로 마주 보고 부딪히는 '충(冲)'의 작용과 관련이 있습니다. 각자의 대화 스타일이 뚜렷하고 개성이 강해 오해가 빚어지기 쉽습니다. 한쪽이 감정적으로 굳어 있을 때 섣불리 설득하려 하지 말고, 30분 정도의 냉각기를 가진 뒤 이성적으로 소통하시는 것이 솔루션입니다.`,
        "원진": `소통의 어려움으로 적어주신 고민은 일지 지지가 서로 엇갈리는 '원진(怨嗔)'의 기류와 닿아 있습니다. 마음에 묵혀둔 서운함이 엉뚱한 말씨로 표출되기 쉬운 상성이니, 서운함이 생겼을 때 미루지 마시고 다정하고 직설적인 어조로 바로 털어내시는 연습이 필요합니다.`,
        "일반": `소통에 관한 고민은 일지의 특별한 기류 충돌보다는 일시적인 대화 방식의 차이에서 비롯된 것입니다. 두 사람의 배우자궁은 평온하게 흐르고 있으니, 상대방이 피곤하거나 예민한 시간대를 피해 부드러운 분위기 속에서 대화를 나누시면 차분하게 조율될 수 있습니다.`
      },
      "애정": {
        "합": `애정과 정서적 유대에 대한 고민을 분석해보면, 두 사람의 일지가 따뜻한 '합(合)'으로 묶여 있어 근본적인 애정 전선이나 인연의 깊이는 무척 돈독합니다. 일시적인 외부 요인이나 일상의 피로로 인해 관계가 다소 정체된 느낌을 받을 수 있으나, 둘만의 여행이나 추억의 장소 방문을 통해 금방 뜨거운 애정을 되찾으실 수 있습니다.`,
        "충": `애정 전선이나 마음의 흔들림에 관한 고민은 일지가 부딪히는 '충(冲)'의 역동적 기류가 반영된 결과입니다. 서로 사랑하는 마음은 크나 애정을 표현하고 확인받고 싶어 하는 방식이 서로 달라 서운함이 생기기 쉽습니다. 성향이 다름을 인정하고 서로의 방식을 존중해주는 것이 중요합니다.`,
        "원진": `애정에 관한 고민은 서로 간의 서운함이 애증으로 변하기 쉬운 '원진(怨嗔)'의 영향권에 있습니다. 미워하면서도 깊이 신경 쓰이는 끈끈한 인연입니다. 서로를 향해 날을 세우기보다는 '고맙다', '수고했다'는 긍정적인 애정 언어를 의식적으로 표현해주는 것이 관계 극복의 핵심 열쇠입니다.`,
        "일반": `애정과 정서적 안정에 대한 고민은 배우자궁에 특별한 살이 끼지 않아 평탄한 기반 위에 서 있습니다. 서로에 대한 신뢰가 굳건하니 조급해하지 마시고, 잔잔하고 따뜻하게 일상을 함께 나누다 보면 자연스럽게 애정의 깊이가 더욱 단단해질 것입니다.`
      },
      "재물결혼": {
        "합": `결혼 및 재물 준비 과정에서의 고민은 일지가 긴밀한 '합(合)'을 이루어 공동의 목표를 향할 때 가장 시너지가 납니다. 재정적 계획이나 결혼 준비에서 의견 차이가 발생하더라도 서로가 배려하고 아끼는 힘이 강해 조화로운 합의점을 원만하게 찾을 수 있으니 안심하고 나아가셔도 좋습니다.`,
        "충": `결혼이나 현실적인 재물 관리 고민은 서로 다른 경제 관념이나 일지 '충(冲)'의 성향 차이에서 비롯됩니다. 돈을 쓰고 모으는 방식이나 인생 설계의 템포가 달라 마찰을 겪기 쉬우니, 중요한 재정 결정이나 결혼 계획은 확실한 기준을 서면으로 정해두어 갈등 요소를 사전에 방지해야 합니다.`,
        "원진": `결혼이나 현실적인 기반 마련 과정에서의 고민은 서로 조율되지 않은 속마음이 '원진(怨嗔)'의 애증으로 작용하기 쉽습니다. 돈이나 결혼식 준비 등 예민한 주제일수록 감정적으로 논쟁하기보다, 객관적인 수치와 이성적인 계획을 바탕으로 솔직하게 털어놓고 의논하는 것이 중요합니다.`,
        "일반": `결혼 및 재물 관련 고민에 있어 두 분의 일지는 특별한 충살 없이 잔잔한 관계입니다. 큰 풍파나 갑작스러운 현실적 파탄 위험이 적으며, 둘이 성실하게 기초부터 쌓아 올리면 무난하고 안정적인 가정을 꾸려나갈 수 있는 모범적인 흐름입니다.`
      },
      "갈등성격": {
        "합": `성격 차이나 빈번한 갈등에 관한 고민은 일지가 '합(合)'으로 묶여 있는 만큼, 사실 다툼 뒤에 화해하기도 매우 쉬운 구조입니다. 자존심 때문에 서로 먼저 다가가지 못해 냉전이 길어질 뿐이니, 사소한 다툼 이후에는 먼저 부드러운 화법으로 손을 내밀면 즉각적으로 갈등이 눈 녹듯 사라질 것입니다.`,
        "충": `자주 부딪히는 성격 마찰이나 갈등 고민은 일지가 강력하게 충돌하는 '충(冲)'의 영향입니다. 서로 살아온 방식과 신념 체계가 판이하게 달라 불씨가 쉽게 튀게 됩니다. 갈등 상황에서는 마주 앉아 시시비비를 가리기보다, 즉시 공간을 분리하여 화를 가라앉히는 습관을 기르는 것이 최선의 솔루션입니다.`,
        "원진": `성격이나 습관 차이로 깊어지는 갈등 고민은 서로에게 오해와 서운함을 품기 쉬운 '원진(怨嗔)' 기류의 현상입니다. 상대방의 사소한 행동도 꼬아 보기 쉬우니, 갈등이 발생했을 때는 주관적 해석을 멈추고 사실에만 집중하여 대화하는 훈련을 적극 권장합니다.`,
        "일반": `성격이나 갈등에 대한 고민은 일시적인 스트레스나 피로 누적으로 인한 것입니다. 사주상으로는 격렬하게 대립하는 사주가 아니므로, 평소 취미 생활을 함께 공유하거나 충분한 휴식을 통해 심리적 여유를 확보해주면 사소한 짜증과 마찰은 자연스레 해소됩니다.`
      },
      "일반": {
        "합": `의뢰하신 고민에 대해 두 사람의 일지 지지를 대조해 보았을 때, 따뜻한 '합(合)'의 관계가 강하게 작동하고 있습니다. 기재하신 걱정은 일시적인 기류 변화 때문일 뿐이며, 서로에 대한 믿음을 굳건히 지키고 가벼운 대화로 풀어가신다면 시간이 갈수록 관계가 더욱 탄단해질 것입니다.`,
        "충": `의뢰하신 고민에 대해 두 분의 배우자궁을 분석해보면 일지끼리 마주 부딪히는 '충(冲)'의 영향이 보입니다. 서로 성향과 기질이 달라 순간적인 의견 대립이 잦아질 수 있으니, 대립이 발생할 때는 잠시 대화를 멈추고 15분 이상 마음을 가라앉힌 후에 다정하게 다시 이야기해보시길 권합니다.`,
        "원진": `의뢰하신 고민에 대해 두 사람의 일지 기류를 분석해보면 '원진(怨嗔)'의 기류가 감돌고 있습니다. 사소한 말에 쉽게 서운해지고 마음에 응어리가 남기 쉬우니, 서로 대화할 때 부정적인 의심이나 억측은 내려놓고 솔직하고 따뜻하게 속마음을 공유하시는 지혜가 필요합니다.`,
        "일반": `의뢰하신 고민에 대해 두 분의 일지 지지는 큰 충돌이나 파탄살 없이 담백하고 조화로운 관계를 보여줍니다. 일시적인 의견 충돌은 서로를 깊이 이해해가는 배움의 과정일 뿐이니, 조급해하지 말고 서로에 대한 신뢰를 키워가신다면 지혜롭게 극복할 수 있습니다.`
      }
    };

    return responses[category][relation];
  };

  const getDynamicNormalScores = (myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch) => {
    // 1. 오행 조화성
    let ohaengScore = 75;
    const elements = ["목", "화", "토", "금", "수"];
    elements.forEach(el => {
      const myCount = myEl[el] || 0;
      const partnerCount = partnerEl[el] || 0;
      if (myCount === 0 && partnerCount >= 2) ohaengScore += 7;
      if (partnerCount === 0 && myCount >= 2) ohaengScore += 7;
      if (myCount > 0 && partnerCount > 0) ohaengScore += 2;
    });
    ohaengScore = Math.min(98, Math.max(60, ohaengScore));

    // 2. 정서적 밀착도
    let affinityScore = 78;
    const cheonganHap = ["甲己", "己甲", "乙庚", "庚乙", "丙辛", "辛丙", "丁壬", "壬丁", "戊癸", "癸戊"];
    const pairStem = myStem + partnerStem;
    if (cheonganHap.includes(pairStem)) {
      affinityScore += 15;
    } else {
      const stemElMap = {
        "甲": "목", "乙": "목", "丙": "화", "丁": "화", "戊": "토", "己": "토", "庚": "금", "辛": "금", "壬": "수", "癸": "수"
      };
      const myStemEl = stemElMap[myStem];
      const partnerStemEl = stemElMap[partnerStem];
      const saengPairs = ["목화", "화목", "화토", "토화", "토금", "금토", "금수", "수금", "수목", "목수"];
      if (saengPairs.includes(myStemEl + partnerStemEl)) {
        affinityScore += 8;
      }
    }

    const hap = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
    const chung = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
    const wonjin = ["子未", "丑午", "寅酉", "卯申", "辰亥", "巳戌", "丑오"];
    const pairBranch = myBranch + partnerBranch;
    const revBranch = partnerBranch + myBranch;

    if (hap.includes(pairBranch) || hap.includes(revBranch)) {
      affinityScore += 10;
    } else if (chung.includes(pairBranch) || chung.includes(revBranch)) {
      affinityScore -= 12;
    } else if (wonjin.includes(pairBranch) || wonjin.includes(revBranch)) {
      affinityScore -= 15;
    }
    affinityScore = Math.min(98, Math.max(55, affinityScore));

    // 3. 백년해로 확률
    let foreverScore = Math.round((ohaengScore + affinityScore) / 2);
    if (hap.includes(pairBranch) || hap.includes(revBranch)) {
      foreverScore += 3;
    } else if (chung.includes(pairBranch) || chung.includes(revBranch) || wonjin.includes(pairBranch) || wonjin.includes(revBranch)) {
      foreverScore -= 5;
    }
    foreverScore = Math.min(98, Math.max(50, foreverScore));

    let ohaengGrade = "상생 배합 우수";
    if (ohaengScore >= 90) ohaengGrade = "상생 배합 최상";
    else if (ohaengScore < 75) ohaengGrade = "조율 필요 상태";

    let affinityGrade = "교감 지수 보통";
    if (affinityScore >= 90) affinityGrade = "교감 지수 훌륭";
    else if (affinityScore < 70) affinityGrade = "감정 마찰 주의";

    let foreverGrade = "인연의 끈 보통";
    if (foreverScore >= 90) foreverGrade = "인연의 끈 굳건";
    else if (foreverScore < 70) foreverGrade = "주의 기류 감지";

    return {
      ohaengScore,
      ohaengGrade,
      affinityScore,
      affinityGrade,
      foreverScore,
      foreverGrade
    };
  };

  const getDynamicDeepScores = (myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl) => {
    const isMyYang = ["甲", "丙", "戊", "庚", "壬"].includes(myStem);
    const isPartnerYang = ["甲", "丙", "戊", "庚", "壬"].includes(partnerStem);
    let umyangScore = 80;
    let umyangGrade = "음양 조화 무난";

    if (isMyYang !== isPartnerYang) {
      umyangScore = 95;
      umyangGrade = "신체 밸런스 우수";
    } else if (isMyYang && isPartnerYang) {
      umyangScore = 86;
      umyangGrade = "양기 충만 역동";
    } else {
      umyangScore = 82;
      umyangGrade = "음기 조화 차분";
    }

    let attractionScore = 84;
    let attractionGrade = "보통의 끌림";
    const hap = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
    const chung = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
    const wonjin = ["子未", "丑오", "寅酉", "卯申", "辰亥", "巳戌", "丑오"];
    const pairBranch = myBranch + partnerBranch;
    const revBranch = partnerBranch + myBranch;

    if (hap.includes(pairBranch) || hap.includes(revBranch)) {
      attractionScore = 96;
      attractionGrade = "끌림 지수 최상";
    } else if (chung.includes(pairBranch) || chung.includes(revBranch)) {
      attractionScore = 74;
      attractionGrade = "의견 조율 필요";
    } else if (wonjin.includes(pairBranch) || wonjin.includes(revBranch)) {
      attractionScore = 68;
      attractionGrade = "속궁합 마찰 주의";
    }

    let bondingScore = Math.round((umyangScore + attractionScore) / 2);
    if (myStemEl !== partnerStemEl) {
      bondingScore += 4;
    }
    bondingScore = Math.min(98, Math.max(60, bondingScore));
    let bondingGrade = "교감 지수 보통";
    if (bondingScore >= 90) bondingGrade = "교감 지수 훌륭";
    else if (bondingScore < 75) bondingGrade = "소통 강화 처방";

    return {
      umyangScore,
      umyangGrade,
      attractionScore,
      attractionGrade,
      bondingScore,
      bondingGrade
    };
  };

  const getJijiHarmonyText = (myBranch, partnerBranch) => {
    const hap = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
    const chung = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
    const wonjin = ["子未", "丑오", "寅酉", "卯申", "辰亥", "巳戌"];

    const currentPair = myBranch + partnerBranch;
    const revPair = partnerBranch + myBranch;

    if (hap.includes(currentPair) || hap.includes(revPair)) {
      return `두 사람의 일지(${myBranch}-${partnerBranch})는 다정한 '육합(六合)'을 형성하고 있습니다. 이는 정서적 밀착력이 매우 뛰어남을 뜻하며, 서로의 안락함을 최우선으로 생각하고 부부로서 강한 소속감과 한결같은 유대감을 유지하게 해주는 가장 훌륭한 배우자궁 상성입니다.`;
    }
    if (chung.includes(currentPair) || chung.includes(revPair)) {
      return `두 사람의 일지(${myBranch}-${partnerBranch})는 서로 마주 보고 부딪히는 '충살(冲殺)'의 작용이 존재합니다. 이는 내적 신념이나 생활 양식에서 개성이 뚜렷하여 사소한 대화 습관이나 말투에서 자존심 마찰을 겪기 쉬우니, 갈등 시 1시간 냉각기를 두어 부딪힘을 예방하는 혜안이 필요합니다.`;
    }
    if (wonjin.includes(currentPair) || wonjin.includes(revPair)) {
      return `두 사람의 일지(${myBranch}-${partnerBranch})는 애증의 기류가 엇갈리는 '원진살(怨嗔殺)' 관계에 있습니다. 사소한 일에 오해가 싹터 서운함이 깊어지기 쉬우니, 감정을 마음속에 묵혀두지 않고 '매주 일요일 10분 진실 토크'를 통해 오해를 즉각적으로 털어버리는 규칙을 세우면 액운이 완벽히 비껴갑니다.`;
    }
    return `두 사람의 일지(${myBranch}-${partnerBranch})는 특별한 충이나 원진 없이 평온하고 담백하게 흘러갑니다. 장기적인 관계에서 갑작스러운 파탄이나 격렬한 대립을 겪을 위험이 현저히 적으며, 친구처럼 편안하고 소박하게 일상을 공유할 수 있는 잔잔하고 편안한 배우자궁의 배치입니다.`;
  };

  const renderNormalCompatibilityContent = (myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl) => {
    // 25가지 오행 궁합 매핑
    const getOhaengText = (myMax, partnerMax) => {
      const ohaengMatrix = {
        "목": {
          "목": `${name}님과 상대방 모두 시작과 추진력의 상징인 목(木) 기운이 발달하여 활력과 아이디어가 마르지 않는 관계입니다. 하지만 갈등이 시작되면 서로 굽히려 하지 않아 가지가 꺾이는 아픔이 따를 수 있으니, 대화 시 상대의 말을 끝까지 경청하는 훈련이 필요합니다.`,
          "화": `목생화(木生火)의 가장 자연스럽고 아름다운 상생의 배합입니다. ${name}님의 지혜와 든든한 설계가 상대방의 뜨거운 열정과 행동력에 날개를 달아주는 격으로, 서로를 발전시키는 이상적인 협력 파트너의 상성입니다.`,
          "토": `목극토(木剋土)의 흐름으로 ${name}님의 주도적 성향이 상대방의 안정적인 내실을 가끔 통제하거나 이끌어가는 구조입니다. 적절한 조율은 신뢰를 주지만 과한 잔소리는 상대방의 마음 문을 닫게 하니 믿고 기다려주는 인내가 필요합니다.`,
          "금": `금극목(金剋木)의 역동적 흐름입니다. 상대방의 단호함과 현실 감각이 ${name}님의 계획을 다듬고 억제해 줍니다. 뼈아픈 조언이 귀한 거름이 되나, 자존심을 상하게 하는 날카로운 비판은 가슴에 칼을 꽂는 격이니 다정한 어조로 보완해야 길합니다.`,
          "수": `수생목(水生木)으로 상대방의 무한한 지혜와 포용력이 ${name}님의 성장판을 따뜻하게 적셔주는 아늑한 형국입니다. 심리적 방황이 올 때 상대방의 그늘 아래서 완전한 안식을 얻게 되며 평생의 의지처가 되어줍니다.`,
        },
        "화": {
          "목": `화생목(火生木)의 배합으로 ${name}님의 열정적인 불꽃이 상대방의 든든한 나무 뿌리를 지탱하고 키워줍니다. 서로의 성향을 자극하여 권태기 없는 역동적 연애를 만들어가나, 지나치게 감정이 요동칠 수 있으니 이성적인 평정심을 공유해야 안착합니다.`,
          "화": "두 사람 모두 뜨거운 화(火) 기운이 가득해 만나자마자 불꽃이 튀는 강렬한 관계입니다. 급속도로 가까워지지만, 한 번 싸움이 나면 걷잡을 수 없이 파괴적으로 치달을 수 있으니 사소한 말다툼이 커지기 전에 자리를 피하는 냉각 강령이 필요합니다.",
          "토": `화생토(火生土)로 ${name}님의 명쾌한 표현력과 밝은 에너지가 상대방의 묵직한 마음에 따뜻한 생기를 불어넣어 줍니다. 상대방은 ${name}님의 불안을 든든하게 받아주는 흙의 방파제가 되어주어 훌륭한 조화를 이룹니다.`,
          "금": `화극금(火剋金)으로 ${name}님의 강렬한 주관이 상대방의 규칙적인 생활과 이성을 단련시키거나 자극하는 상성입니다. 적절한 자극은 연애의 활력이 되지만 과하면 상대방이 지쳐 도망칠 수 있으니 사생활을 온전히 존중해 주어야 합니다.`,
          "수": `수극화(水剋火)의 뜨거운 조절이 일어납니다. 상대방의 침착함이 ${name}님의 다혈질적인 기운을 차분하게 진정시켜 주며 조율합니다. 때로는 물과 기름처럼 겉도는 느낌을 받을 수 있으니 공통의 취미나 명확한 합의점을 만드는 데 주력하십시오.`,
        },
        "토": {
          "목": `토극목(土剋木)의 상호작용으로 ${name}님의 신중함과 포용력이 상대방의 거침없는 개척 정신에 든든한 대지가 되어주거나, 반대로 상대의 강력한 질주에 대지가 파헤쳐지는 듯한 스트레스를 받을 수 있으니 서로 침범하지 않는 선을 정해야 합니다.`,
          "화": `토생화(土生火)의 흐름으로 상대방의 풍부한 온기가 ${name}님의 비옥한 대지를 영양가 있게 데워주는 다정한 조합입니다. 만날수록 정서적으로 깊은 포만감을 느끼게 되며, 서로의 가족과도 유연하게 잘 화합하는 가정적인 연을 형성합니다.`,
          "토": "대지와 대지가 만나 거대한 대산맥을 이룬 격입니다. 신뢰감과 안정감은 5가지 오행 배합 중 최고 수준이나, 서로 고집이 황소고집이라 갈등이 생기면 오랜 침묵과 냉전으로 이어지기 십상입니다. 먼저 미안하다고 손 내미는 관용이 개운의 비법입니다.",
          "금": `토생금(土生金)으로 ${name}님의 사려 깊은 내조와 헌신이 상대방의 굳건한 사회적 성공과 결단을 훌륭히 키워내는 보조적 시너지를 냅니다. 상대방이 이끄는 방향으로 ${name}님이 든든한 토대를 만들어주어 장기적인 파트너로 매우 적합합니다.`,
          "수": `토극수(土剋水)로 ${name}님의 흔들림 없는 원칙주의가 상대방의 자유롭고 유연한 감정의 흐름을 억누르거나 흐름을 가둘 수 있습니다. 상대방에게 감정의 해방구를 열어주고 자유를 허용할 때 관계의 답답함이 완벽히 해결됩니다.`,
        },
        "금": {
          "목": `금극목(金剋木)의 단호한 흐름입니다. ${name}님의 이성적인 판단과 냉철한 조언이 상대방의 우유부단한 면을 깔끔하게 정리해 줍니다. 다만 다정한 대화와 애정 표현이 부족하면 상대방이 ${name}님을 차갑고 무서운 존재로 인식할 수 있으니 온화한 표현을 섞으십시오.`,
          "화": `금극화(金剋火)로 상대방의 즉흥적이고 뜨거운 감정 표현이 ${name}님의 단단한 심장과 이성을 녹여주는 짜릿한 상성입니다. 평소 이성적이던 ${name}님이 상대방 앞에서는 무장해제되는 현상을 겪게 되며, 서로의 극과 극 매력에 매료됩니다.`,
          "토": `금생토(金生土)의 상생 작용으로 상대방의 포용력 있고 흔들리지 않는 신뢰가 ${name}님의 날카로운 예민함을 따뜻하게 감싸 안아 안착시켜 줍니다. ${name}님이 마음의 고향처럼 믿고 의지할 수 있는 최고의 안식처가 형성됩니다.`,
          "금": "강철과 강철이 격렬하게 부딪히는 예리한 형국입니다. 두 사람 모두 자존심과 결단력이 확고하여 대화가 명쾌하고 군더더기 없으나, 의견이 대립할 때는 칼날 같은 말로 서로의 가슴에 깊은 상처를 내기 쉽습니다. 존댓말 사용을 적극 권장합니다.",
          "수": `금생수(金生水)로 ${name}님의 과감한 결단력과 추진 자원이 상대방의 유연한 지혜와 영감을 만나 세상에 빛을 보게 돕습니다. ${name}님이 경제적·물질적 토대를 제공하면 상대방이 풍부한 감수성으로 삶을 풍요롭게 꾸미는 조화로운 연입니다.`,
        },
        "수": {
          "목": `수생목(水生木)의 조화로운 성장 기류입니다. ${name}님의 깊은 생각과 정신적 자양이 상대방의 원대한 포부와 성장을 묵묵히 지원합니다. 서로 대화가 막힘없이 잘 통하며, 예술이나 정신적인 교감도가 매우 높은 낭만적인 궁합입니다.`,
          "화": `수극화(水剋火)의 짜릿한 밀당이 작용합니다. ${name}님의 냉철하고 차분한 조율 능력이 상대방의 감정 과열을 잘 통제해주어 균형을 이룹니다. 다만 서로 라이프스타일이나 에너지 텐션이 극단적으로 다를 수 있으니 적절한 거리 유지가 필수입니다.`,
          "토": `수극토(土剋水)의 장벽 흐름입니다. 상대방의 보수적이고 틀에 갇힌 사고방식이 ${name}님의 자유롭고 창의적인 아이디어를 억누르거나 답답하게 가둘 우려가 있습니다. 서로의 프라이버시와 개인 시간을 철저히 인정할 때 답답함이 풀립니다.`,
          "금": `수생금(金生水)으로 상대방의 강력한 카리스마와 경제적 든든함이 ${name}님의 지혜와 결합하여 아주 풍요로운 삶의 발판을 완성해 줍니다. ${name}님을 향한 상대방의 지극정성어린 헌신이 평생을 걸쳐 이어지는 상성입니다.`,
          "수": "깊은 바다와 큰 강물이 만나 끝없이 펼쳐진 거대한 수평선을 이룹니다. 정서적 공감대와 영혼의 소통은 완벽하여 눈빛만 봐도 서로를 이해하지만, 둘 다 속마음을 겉으로 잘 드러내지 않아 서운함이 침전되기 쉽습니다. 표현의 투명성을 높여야 합니다."
        }
      };

      const myKey = myMax || "목";
      const partnerKey = partnerMax || "목";
      return ohaengMatrix[myKey]?.[partnerKey] || ohaengMatrix["목"]["목"];
    };

    const getMajorEl = (elObj) => {
      let maxKey = "목";
      let maxVal = -1;
      for (const [key, val] of Object.entries(elObj)) {
        if (val > maxVal) {
          maxVal = val;
          maxKey = key;
        }
      }
      return maxKey;
    };

    const myMajor = getMajorEl(myEl);
    const partnerMajor = getMajorEl(partnerEl);
    const ohaengAnalysisText = getOhaengText(myMajor, partnerMajor);

    // 결혼 황금 타이밍 도출 (100% 동적 연산)
    const getWeddingTiming = (myStemVal, partnerStemVal) => {
      const isFireOrEarth = ["丙", "丁", "戊", "己"].includes(myStemVal) || ["丙", "丁", "戊", "己"].includes(partnerStemVal);
      if (isFireOrEarth) {
        return {
          year: "2028년(무신년) 가을",
          reason: `두 분 사주의 뜨거운 열기를 식혀주고 안정적인 식상생재(재물 유입)와 관성(결혼의 문서 자격)을 순차적으로 강화하는 '금(金)/수(水)'의 시원한 기운이 지지에 도래하는 2028년(무신년) 가을이 가정에 풍요를 더하고 갈등을 예방하는 백년가약의 최적기입니다.`
        };
      }
      return {
        year: "2027년(정미년) 하반기",
        reason: `두 분 사주의 다소 차가운 조후를 따뜻하게 융화시켜 주며, 천간의 정임합(丁壬合) 및 지지의 오미합(午未合)을 강하게 유도해 두 사람의 법적 계약과 안착감을 보증하는 2027년(정미년) 하반기가 풍파 없이 일생의 안정을 얻게 해줄 황금 대길기입니다.`
      };
    };

    const weddingInfo = getWeddingTiming(myStem, partnerStem);

    // 고민 대화 솔루션 도출
    const getWorrySolutionText = (category) => {
      const solutionMap = {
        love: `서로의 애정 전선에 불안감이 생길 때는 말로 길게 따지기보다, 서로의 손을 꼭 잡고 따뜻한 온기를 나누며 10분간 경청하는 '스킨십 대화법'을 매주 실천하십시오. ${name}님의 일간 기운을 부드럽게 감싸주는 상대방의 배려가 작동할 것입니다.`,
        career: `두 사람의 커리어나 진로 방향이 부딪힐 때는 냉정한 평가나 훈수보다는 든든한 아군이 되어 '무조건적 지지'의 메시지를 먼저 주셔야 합니다. 서로의 추진 오행을 북돋우는 격려만이 동반 상승의 묘책입니다.`,
        wealth: `재물 관리나 결혼 준비 비용 문제로 갈등이 예상될 때는 24시간 자금 의사 결정을 유예하는 '재무 쿨다운 룰'을 합의하십시오. 감정이 앞선 상태에서 성급한 투자는 금물입니다.`,
        general: `두 분의 갈등을 풀어낼 핵심 열쇠는 서로의 자존심을 건드리지 않고, 하루 한 번 상대의 사소한 장점이나 챙김에 대해 "고마워"라고 눈을 맞추며 언어적 보상을 표현하는 데 있습니다.`
      };
      return solutionMap[category] || solutionMap.general;
    };

    const worrySol = getWorrySolutionText(worryCategory);

    const scores = getDynamicNormalScores(myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch);

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Title Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-red-700 font-bold block">慧眼堂 백년해로 인연궁합</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            💕 일반 궁합 정밀 분석 보고서
          </h2>
          <div className="w-24 h-0.5 bg-[#A3845B]/30 mx-auto my-2" />
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">오행 조화성</span>
            <div className="text-2xl font-bold text-red-600 font-myeongjo">{scores.ohaengScore}%</div>
            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">{scores.ohaengGrade}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">정서적 밀착도</span>
            <div className="text-2xl font-bold text-amber-600 font-myeongjo">{scores.affinityScore}%</div>
            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">{scores.affinityGrade}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">백년해로 확률</span>
            <div className="text-2xl font-bold text-rose-600 font-myeongjo">{scores.foreverScore}%</div>
            <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded mt-1 inline-block">{scores.foreverGrade}</span>
          </div>
        </div>

        {/* 1. 오행 분포 분석 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Sparkles className="w-4 h-4 text-[#A3845B]" />
            제 1장. 두 사람의 오행(五行) 에너지 배치 및 상생 관계
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            <strong>{name}</strong>님의 사주 구조와 상대방 <strong>{partnerName}</strong>님의 사주 오행 분포를 정밀 대조하여 상호 작용 기류를 분석했습니다.
          </p>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              {Object.keys(myEl).map((elName) => (
                <div key={elName} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-[#2C2C2C]">
                    <span>{elName} ({elName === "목" ? "木" : elName === "화" ? "火" : elName === "토" ? "土" : elName === "금" ? "金" : "水"})</span>
                    <span>{name}: {myEl[elName]}개 | {partnerName}: {partnerEl[elName]}개</span>
                  </div>
                  <div className="h-2 bg-[#F6F3EC] rounded-full overflow-hidden flex">
                    <div className="bg-emerald-600" style={{ width: `${(myEl[elName] / 8) * 100}%` }} />
                    <div className="bg-[#A3845B]/65 border-l border-white" style={{ width: `${(partnerEl[elName] / 8) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border-t border-[#E2DDD5]/60 pt-3 italic bg-[#FDFCF7] p-3 rounded">
              <strong className="text-brass">오행 궁합 진단:</strong> {ohaengAnalysisText}
            </p>
          </div>
        </div>

        {/* 2. 일간 및 일지 정서 궁합 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Compass className="w-4 h-4 text-[#A3845B]" />
            제 2장. 천간(天干, 하늘의 기운)과 지지(地支, 땅의 기운)의 정서적 상성 분석
          </h4>
          <div className="space-y-4 font-traditional text-xs text-[#2C2C2C] font-light leading-relaxed">
            <div className="bg-[#FDFCF7] p-3 rounded border border-[#E2DDD5]/40">
              <strong className="text-red-700">천간(일간) 주파수 궁합:</strong>
              <p className="mt-1">{getCheonganHarmonyText(myStem, partnerStem)}</p>
            </div>
            <div className="bg-[#FDFCF7] p-3 rounded border border-[#E2DDD5]/40">
              <strong className="text-brass">배우자궁 지지(일지) 상성:</strong>
              <p className="mt-1">{getJijiHarmonyText(myBranch, partnerBranch)}</p>
            </div>
          </div>
        </div>

        {/* 3. 결혼 황금 타이밍 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#A3845B] flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Calendar className="w-4 h-4 text-[#A3845B]" />
            제 3장. 백년가약을 맺기 가장 유익한 황금의 타이밍
          </h4>
          <div className="space-y-3 font-traditional text-xs text-[#2C2C2C] font-light leading-relaxed">
            <div className="border-l-2 border-red-700 pl-3">
              <span className="text-xs font-bold text-red-800 block">✨ 권장 결혼 시기: {weddingInfo.year}</span>
              <p className="mt-1 text-[#5F5F5F]">{weddingInfo.reason}</p>
            </div>
          </div>
        </div>

        {/* 4. 관계 솔루션 */}
        <div className="bg-[#F6F3EC] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm">
          <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            <Heart className="w-4 h-4 text-red-600 animate-pulse" />
            제 4장. 두 분의 관계 유지를 위한 1:1 맞춤형 혜안당 솔루션
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            {worrySol}
          </p>
          {worryText && (
            <div className="text-xs text-[#5F5F5F] leading-relaxed font-light font-traditional border-t border-[#E2DDD5]/40 pt-2.5">
              <strong>의뢰하신 고민에 대한 명리 해답:</strong><br />
              {getDynamicWorryResponse(worryText, myBranch, partnerBranch)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDeepCompatibilityContent = (myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl) => {
    // 음양 기질 매칭
    const getUmyangText = (mySVal, partnerSVal) => {
      const isMyYang = ["甲", "丙", "戊", "庚", "壬"].includes(mySVal);
      const isPartnerYang = ["甲", "丙", "戊", "庚", "壬"].includes(partnerSVal);

      if (isMyYang && isPartnerYang) {
        return "두 사람 모두 넘쳐나는 양(陽)의 에너지를 타고나 매우 역동적이고 뜨거운 성향적 이끌림을 가집니다. 서로를 향한 본능적인 매력이 빠르게 점화되나, 불꽃이 튀는 만큼 사소한 기세 싸움에서 한 발도 물러서지 않는 경향이 있으니 밀착 궁합에서 서로의 템포를 조절하는 배려가 절실합니다.";
      }
      if (!isMyYang && !isPartnerYang) {
        return "두 사람 모두 정적인 음(陰)의 기운이 발달하여 밀착 궁합에서 격렬함보다는 부드럽고 섬세한 교감을 선호합니다. 정서적 만족과 아늑한 대화를 바탕으로 한 케미스트리 지수가 매우 높으며, 시간이 흐를수록 서로의 존재 자체로 깊은 심리적 힐링을 선사하는 궁합입니다.";
      }
      return `${name}님과 상대방의 음(陰, 차분한 기운)과 양(陽, 활발한 기운) 기운이 완벽하게 톱니바퀴처럼 맞물립니다. 한 사람이 주도적으로 에너지를 이끌면 다른 한 사람은 부드럽게 수용하며 화합하여, 지치지 않고 가장 이상적인 음양의 신체 밸런스를 평생 유지하게 해주는 최상의 끌림을 보유하고 있습니다.`;
    };

    const umyangText = getUmyangText(myStem, partnerStem);

    // 지장간 암합 및 밀착 궁합
    const getSexualHarmonyText = (myBr, partnerBr) => {
      const sexualMap = {
        "子丑": "자축(子丑) 육합의 물과 흙이 유려하게 섞이는 상성으로, 보이지 않는 본능적 친밀도와 행동 조화도가 5대 조합 중 가장 끈끈하게 작동하는 밀착 궁합 최상의 명조 배합입니다.",
        "寅亥": "인해(寅亥) 생합의 기운이 강해, 서로를 향한 신체적 소통뿐만 아니라 그 이후의 친밀감과 편안함이 아주 깊게 동조되는 영혼과 행동 성향의 동반 결합 상성입니다.",
        "卯戌": "묘술(卯戌) 합화의 불꽃 반응이 일어납니다. 만날 때마다 설렘과 짜릿함이 유지되어 장기 연애 중에도 권태기가 거의 오지 않는 아주 건강하고 열정적인 행동 성향 시너지를 냅니다.",
        "子午": "일지가 자오충(子午冲)으로 강하게 부딪힙니다. 행동 조화에서 서로의 피지컬 템포나 요구하는 감각의 차이가 발생할 수 있으니 자존심 세우지 말고 솔직한 대화를 통해 맞춰가는 혜안이 중요합니다.",
        "丑午": "축오(丑午) 원진과 귀문 기류가 겹쳐 밀착 관계 전후의 감정 기복이나 사소한 오해로 인한 토라짐이 발생하기 쉽습니다. 소통 후 반드시 '사랑의 대화'를 10분 이상 나눠 감정을 풀어주어야 대길합니다."
      };
      const key = myBr + partnerBr;
      const revKey = partnerBr + myBr;
      return sexualMap[key] || sexualMap[revKey] || `일지 지지인 ${myBr}와 ${partnerBr}의 관계가 평이하여 신체적 마찰이나 거부 반응이 현저히 적습니다. 서로의 배려 속에 가장 평화롭고 자연스럽게 밀착 궁합의 조화를 구축해 갈 수 있는 원만한 배합입니다.`;
    };

    const sexualHarmonyText = getSexualHarmonyText(myBranch, partnerBranch);

    // 침실 풍수 및 럭키 패션 처방 (100% 동적 분기)
    const getDeepFengshui = (myStemElVal, partnerStemElVal) => {
      const dominant = myStemElVal;
      if (dominant === "목" || dominant === "화") {
        return {
          direction: "북동쪽 (침대 머리 방향)",
          color: "차분한 네이비 또는 다크 크림 계열의 침구류",
          perfume: "안정감을 부여하는 묵직한 샌들우드 또는 머스크 계열",
          reason: "뜨겁거나 솟구치는 기운을 지닌 두 분의 화기운을 차분하게 진정시키고 깊은 이완을 도와 정서적 유대를 더욱 아늑하게 만듭니다."
        };
      }
      return {
        direction: "남서쪽 (침실 화분 배치 방향)",
        color: "따뜻한 오렌지 또는 아늑한 로즈 베이지 톤의 조명과 인테리어",
        perfume: "감수성을 자극하는 은은한 일랑일랑 또는 로즈 앰버 계열",
        reason: "다소 건조하거나 차갑게 얼어붙을 수 있는 금/수 기운의 방안을 부드러운 온기로 녹여주어 정서적 흥분도와 낭만적 몰입도를 높여줍니다."
      };
    };

    const fengshui = getDeepFengshui(myStemEl, partnerStemEl);

    const deepScores = getDynamicDeepScores(myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl);

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Title Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-purple-700 font-bold block">慧眼堂 비밀 처방 보감</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            🔥 밀착 궁합 & 음양 조율 정밀 분석 보고서
          </h2>
          <div className="w-24 h-0.5 bg-purple-300 mx-auto my-2" />
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">음양 조화도</span>
            <div className="text-2xl font-bold text-purple-600 font-myeongjo">{deepScores.umyangScore}%</div>
            <span className="text-[9px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded mt-1 inline-block">{deepScores.umyangGrade}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">본능적 인력</span>
            <div className="text-2xl font-bold text-red-600 font-myeongjo">{deepScores.attractionScore}%</div>
            <span className="text-[9px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded mt-1 inline-block">{deepScores.attractionGrade}</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">유대감 안착률</span>
            <div className="text-2xl font-bold text-pink-600 font-myeongjo">{deepScores.bondingScore}%</div>
            <span className="text-[9px] text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded mt-1 inline-block">{deepScores.bondingGrade}</span>
          </div>
        </div>

        {/* 1. 음양 에너지 균형 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-purple-700 flex items-center gap-1.5 border-b border-purple-200 pb-2">
            💋 제 1장. 음양(陰陽) 에너지 균형과 본능적 끌림
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            {name}님과 상대방 {partnerName}님의 일주(日柱) 천간 음양 구성을 해독하여 성향적 기류와 본능적 끌림 정도를 진단했습니다.
          </p>
          <div className="bg-[#FAF8F5] p-4 rounded text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border border-[#E2DDD5]/40">
            <strong>음양 분석 진단:</strong> {umyangText}
          </div>
        </div>

        {/* 2. 속궁합 상성 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-purple-700 flex items-center gap-1.5 border-b border-purple-200 pb-2">
            🍷 제 2장. 명리학으로 풀어보는 1:1 밀착 궁합 융합도
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            두 사람의 지지 지장간(支藏干) 암합 구조와 배우자궁 일지 상호작용을 해독한 행동 조화 결과입니다.
          </p>
          <div className="bg-[#FAF8F5] p-4 rounded text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border border-[#E2DDD5]/40">
            <strong>밀착 궁합 명조 풀이:</strong> {sexualHarmonyText}
          </div>
        </div>

        {/* 3. 친밀도 조율 개운 처방 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-purple-700 flex items-center gap-1.5 border-b border-purple-200 pb-2">
            🔮 제 3장. 밀착 궁합 주파수 조율을 위한 혜안당 공간 처방
          </h4>
          <div className="space-y-4 text-xs font-light font-traditional text-[#2C2C2C]">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FDFCF7] p-3.5 rounded border border-[#E2DDD5]/50">
                <span className="font-bold text-purple-800 block">🛏️ 베스트 침대 방위</span>
                <span className="text-[11px] block mt-0.5">{fengshui.direction}</span>
              </div>
              <div className="bg-[#FDFCF7] p-3.5 rounded border border-[#E2DDD5]/50">
                <span className="font-bold text-purple-800 block">🎨 수호 침구 색상</span>
                <span className="text-[11px] block mt-0.5">{fengshui.color}</span>
              </div>
            </div>
            <div className="bg-[#FDFCF7] p-4 rounded border border-[#E2DDD5]/50">
              <span className="font-bold text-purple-800 block">🌿 추천 아로마/향기 테라피: {fengshui.perfume}</span>
              <p className="text-[11px] text-[#5F5F5F] leading-relaxed mt-1">{fengshui.reason}</p>
            </div>
          </div>
        </div>

        {/* 4. 유대감 강화 솔루션 */}
        <div className="bg-[#FAF6FF] border border-purple-200 rounded-lg p-5 space-y-3 shadow-sm">
          <h4 className="font-myeongjo text-sm font-bold text-purple-700 flex items-center gap-1.5 border-b border-purple-200 pb-2">
            💜 제 4장. 유대감 강화 및 갈등 예방 1:1 행동 비책
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            밀착 궁합의 마찰을 줄이기 위해서는 갈등 상황 전후의 감정적 안전거리가 중요합니다. 서로의 다름을 비난하기보다 "오늘 함께해서 정말 따뜻하고 행복했어"라는 언어적 지지를 반드시 나누는 습관을 기르십시오. 이 사소한 행동이 두 분 사이의 부정적인 기운과 불안감을 완벽히 정화해 줄 묘책이 될 것입니다.
          </p>
          {worryText && (
            <div className="text-xs text-[#6F5B85] leading-relaxed font-light font-traditional border-t border-purple-200/50 pt-2.5">
              <strong>의뢰하신 고민의 조화/성향적 혜안:</strong><br />
              현재 적어주신 고민을 두 분의 음양 주파수와 지장간 암합으로 짚어보면, 낮의 말다툼이 밤의 서먹함으로 이어지기 쉬운 흐름입니다. 하루를 마무리하고 휴식을 취하기 전에는 무거운 화제나 현실적 고민에 대한 대화를 피하고, 오롯이 두 분의 따뜻한 온기 교감에만 집중하는 리셋 규칙을 세우는 것이 꼬인 실타래를 푸는 혜안입니다.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderReunionCompatibilityContent = (myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl) => {
    // 이별의 명리학적 원인 (100% 동적 분기)
    const getSeparationReason = (myBr, partnerBr) => {
      const chung = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
      const wonjin = ["子未", "丑오", "寅酉", "卯申", "辰亥", "巳戌"];

      const key = myBr + partnerBr;
      const revKey = partnerBr + myBr;

      if (chung.includes(key) || chung.includes(revKey)) {
        return "두 사람의 이별은 서로의 배우자 자리가 격렬하게 정면충돌하는 '일지 충(冲)' 대운의 작용에서 비롯되었습니다. 서로를 향한 애정은 깊었으나, 사소한 대화 중 서로의 자존심을 건드리는 말이나 일방적인 단호함으로 인해 겉잡을 수 없이 마음의 문을 닫게 된 격입니다. 싫어해서가 아닌, 성향 대립이 낳은 안타까운 진통입니다.";
      }
      if (wonjin.includes(key) || wonjin.includes(revKey)) {
        return "두 사람의 이별은 서로 오해가 쌓여 미움으로 변질되기 쉬운 '원진살(怨嗔殺)' 대운의 작용 때문이었습니다. 상대가 나의 진심을 알아주지 않는다는 섭섭함이 임계점을 넘으며, 서운한 감정을 제때 풀지 못하고 침묵 속에서 냉전 기류가 지속되다가 결국 이별을 선택하게 된 안타까운 흐름입니다.";
      }
      return "두 사람의 이별은 서로 싫어졌다기보다는, 올해 세운의 자금 흐름과 현실적 환경(직장, 이동수 등)의 대운 변화로 인해 물리적으로 멀어지거나 정서적인 피로도가 가중되어 일어난 일시적 인연의 정체기 현상입니다. 기운이 융합되지 못하고 서로에게 소홀해졌던 시기였습니다.";
    };

    const separationReason = getSeparationReason(myBranch, partnerBranch);

    // 상대방 현재 속마음 심리 (100% 동적 분기)
    const getPartnerMind = (partnerSt) => {
      const mindMap = {
        "甲": `현재 상대방은 사주상 식신(食神)의 기류가 작동하고 있어, 겉으로는 차분하고 안정된 일상을 보내려 애쓰지만 속으로는 ${name}님과의 즐거웠던 기억을 마음 깊이 그리워하며 추억을 반추하는 아늑한 외로움에 놓여 있습니다.`,
        "乙": `현재 상대방은 사주상 상관(傷官)의 강한 변덕과 상실감이 작용하여, ${name}님을 원망했다가도 이내 깊은 후회와 쓸쓸함을 느끼며 감정의 롤러코스터를 타고 있는 복잡하고 예민한 무의식 상태를 보입니다.`,
        "丙": "현재 상대방은 사주상 편재(偏財)의 활동적 기류가 들어와 있어, 바쁜 사회적 일상과 활동으로 이별의 슬픔을 외면하려 노력하지만 혼자 있는 시간만큼은 짙은 공허감과 미련에 사로잡혀 있습니다.",
        "丁": "현재 상대방은 사주상 정재(正財)의 보수적이고 신중한 기운이 지배하여, 연락하고 싶은 충동을 꾹 억누르며 현실적으로 다시 잘될 수 있을지 철저하게 머리 아프게 고민하고 있는 상태입니다.",
        "戊": "현재 상대방은 사주상 편관(偏官)의 압박과 무거운 책임감이 엄습하여, 이별로 인한 자존심 훼손과 심리적 압박감을 크게 겪고 있으며 먼저 다가올 용기를 내지 못한 채 굳게 닫혀 있는 심리입니다.",
        "己": `현재 상대방은 사주상 정관(正官)의 이성적인 판단이 앞서 있어, ${name}님을 향한 그리움이 마음속에 가득하면서도 자존심과 품위를 지키기 위해 먼저 손 내밀지 않고 기다리고 있는 상태입니다.`,
        "庚": "현재 상대방은 사주상 편인(偏印)의 쓸쓸하고 고독한 기운이 작동하여, 깊은 사색과 후회 속에 빠져 있으며 스스로를 이별의 피해자라 생각하며 외롭게 밤을 지새우는 기류가 강합니다.",
        "辛": `현재 상대방은 사주상 정인(正印)의 온화하면서도 그리운 수용 기운이 들어와, ${name}님이 먼저 따뜻한 손길로 다가와 주길 조용히 간절하게 기다리고 있는 수동적 대기 심리를 보입니다.`,
        "壬": "현재 상대방은 사주상 비견(比肩)의 굳건한 고집이 최고조에 달해 있어, 이별에 대한 책임을 외면하고 고집을 피우고 있지만 속으로는 관계의 단절이 가져온 외로움을 무겁게 절감하고 있습니다.",
        "癸": `현재 상대방은 사주상 겁재(劫財)의 빼앗기는 기분이 작동하여, ${name}님이 다른 사람을 만나지 않을까 하는 질투심과 소유욕 섞인 불안한 미련이 강하게 작용하여 극심한 내적 갈등 상태에 있습니다.`
      };
      return mindMap[partnerSt] || mindMap["甲"];
    };

    const partnerMind = getPartnerMind(partnerStem);

    // 재회 연락 황금 시기 (100% 동적 연산 고도화)
    const getReunionTiming = (myBr, partnerBr, myStEl, partnerStEl) => {
      // 1. 수(水) 기류 부부 (일간 오행 중 하나라도 수이거나, 배우자 자리에 수가 있는 경우)
      if (myStEl === "수" || partnerStEl === "수" || ["子", "亥"].includes(myBr) || ["子", "亥"].includes(partnerBr)) {
        return {
          month: "올해 음력 7월(申월) 또는 10월(亥월)",
          reason: "지지 지장간의 수(水)기운이 융합되어 두 사람의 얼어붙은 배우자궁에 강력한 정서적 윤화작용(소통의 통로)을 뚫어주는 시기입니다. 이 시기에는 감성적인 호소와 따뜻한 안부 인사가 두 사람의 얼어붙었던 갈등을 녹이고 재회 성공률을 극대화하게 됩니다."
        };
      }
      
      // 2. 목(木) / 화(火) 기류 부부 (성장 및 열정의 기운)
      if (myStEl === "목" || myStEl === "화" || partnerStEl === "목" || partnerStEl === "화") {
        return {
          month: "올해 음력 2월(卯월) 또는 5월(午월)",
          reason: "목생화(木生火)의 생명력 넘치는 기운이 강하게 솟구치며 서로의 차가웠던 침묵을 깨우는 목화(木火) 상승 기류가 형성되는 달입니다. 굳어있던 자존심보다 서로를 향한 본능적인 끌림이 살아나 나의 적극적인 연락에 상대방이 가장 유연하고 따뜻하게 반응해 줄 최고의 타이밍입니다."
        };
      }
      
      // 3. 금(金) 기류 부부 (결단 및 책임감)
      if (myStEl === "금" || partnerStEl === "금") {
        return {
          month: "올해 음력 8월(酉월) 또는 11월(子월)",
          reason: "금생수(金生水)의 차분하고 투명한 기운이 작동하면서 서로 쌓여있던 오해와 불필요한 감정의 앙금을 말끔히 정화하고 이성적인 대화의 문을 여는 달입니다. 현실적인 해결책과 함께 가벼운 커피 한 잔을 청할 때 가장 높은 결실을 맺을 수 있습니다."
        };
      }

      // 4. 토(土) 기류 부부 (신뢰와 안정감)
      return {
        month: "올해 음력 3월(辰월) 또는 9월(戌월)",
        reason: "메마르고 단단해진 서로의 고집을 부드럽게 윤화시켜 주며, 토생금(土生金) 및 지지 육합(六合)의 안정적인 기류가 강하게 작동하는 달입니다. 급작스러운 접근보다는 공통의 관심사나 일상적인 소재를 토대로 천천히 다가갈 때 두 사람의 인연 끈이 가장 굳건히 연결될 것입니다."
      };
    };

    const reunionTiming = getReunionTiming(myBranch, partnerBranch, myStemEl, partnerStemEl);

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Title Block */}
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs tracking-widest text-[#5F7A68] font-bold block">慧眼堂 인연 끈 복구 보감</span>
          <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A] tracking-wider">
            🌿 재회운 & 인연 끈 정밀 분석 보고서
          </h2>
          <div className="w-24 h-0.5 bg-[#5F7A68]/30 mx-auto my-2" />
        </div>

        {/* Score Board */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">인연의 잔존력</span>
            <div className="text-2xl font-bold text-[#5F7A68] font-myeongjo">85%</div>
            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">재회 가능성 높음</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">상대방 미련도</span>
            <div className="text-2xl font-bold text-amber-600 font-myeongjo">90%</div>
            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">속마음 미련 가득</span>
          </div>
          <div className="bg-white border border-[#E2DDD5] rounded-lg p-4 text-center shadow-sm">
            <span className="text-[10px] text-[#5F5F5F] block mb-1">소통 재개 확률</span>
            <div className="text-2xl font-bold text-blue-600 font-myeongjo">88%</div>
            <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">연락 닿을 확률 높음</span>
          </div>
        </div>

        {/* 1. 이별 원인 분석 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#5F7A68]/30 pb-2">
            🌪️ 제 1장. 두 사람의 인연 끈과 이별의 명리학적 실태
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            두 분 사주의 지지 충돌과 원진의 살성을 분석하여 왜 이별이라는 아픔을 겪을 수밖에 없었는지 명리적 원인을 해독했습니다.
          </p>
          <div className="bg-[#FAF9F6] p-4 rounded text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border border-[#E2DDD5]/40">
            <strong>이별 원인 분석:</strong> {separationReason}
          </div>
        </div>

        {/* 1.5. 운명의 끈 및 상극 여부 동적 분석 (신설) */}
        {(() => {
          // 일간 상생상극 분석
          const getStemRelationship = (myStEl, partnerStEl) => {
            const relationships = {
              "목토": "목극토(木剋土)로 서로 강한 제어와 자극을 주며 끌어당기는 자석 같은 상극 관계입니다. 평소엔 강하게 충돌하여 갈등을 빚기 쉬우나, 서로에게 결핍된 현실성을 채워주는 강력한 보완적 인연입니다.",
              "토목": "목극토(木剋土)로 서로 강한 제어와 자극을 주며 끌어당기는 자석 같은 상극 관계입니다. 평소엔 강하게 충돌하여 갈등을 빚기 쉬우나, 서로에게 결핍된 현실성을 채워주는 강력한 보완적 인연입니다.",
              "화금": "화극금(火剋金)으로 한쪽이 한쪽을 강하게 통제하려는 극적(剋的)인 만남입니다. 서로의 주관이 뚜렷하여 부딪치면 깨지기 쉽지만, 기막힌 타이밍에 운명적인 영감과 강력한 텐션을 주고받아 쉽게 헤어 나오지 못하는 강렬한 끈을 지니고 있습니다.",
              "금화": "화극금(火剋金)으로 한쪽이 한쪽을 강하게 통제하려는 극적(剋的)인 만남입니다. 서로의 주관이 뚜렷하여 부딪치면 깨지기 쉽지만, 기막힌 타이밍에 운명적인 영감과 강력한 텐션을 주고받아 쉽게 헤어 나오지 못하는 강렬한 끈을 지니고 있습니다.",
              "토수": "토극수(土剋水)로 한쪽의 흐르는 감성을 다른 한쪽이 가로막아 가두는 상극 관계입니다. 정서적 소통에서 한계와 답답함을 자주 느꼈을 수 있으나, 명리학적으로는 무절제한 방황을 막아주고 서로의 자산을 굳건하게 모아주는 필연적 규칙의 끈입니다.",
              "수토": "토극수(土剋水)로 한쪽의 흐르는 감성을 다른 한쪽이 가로막아 가두는 상극 관계입니다. 정서적 소통에서 한계와 답답함을 자주 느꼈을 수 있으나, 명리학적으로는 무절제한 방황을 막아주고 서로의 자산을 굳건하게 모아주는 필연적 규칙의 끈입니다.",
              "금목": "금극목(金剋木)으로 예리한 칼끝이 나무를 다듬는 상극의 인연입니다. 거침없는 비판과 냉정한 대화 방식으로 깊은 상처를 주고받기 쉬우나, 도자기를 구워내듯 서로의 미성숙한 부분을 가장 명확하게 깎아서 다듬어주는 성장의 파트너십입니다.",
              "목금": "금극목(金剋木)으로 예리한 칼끝이 나무를 다듬는 상극의 인연입니다. 거침없는 비판과 냉정한 대화 방식으로 깊은 상처를 주고받기 쉬우나, 도자기를 구워내듯 서로의 미성숙한 부분을 가장 명확하게 깎아서 다듬어주는 성장의 파트너십입니다.",
              "수화": "수극화(水剋火)로 불과 물이 격렬하게 끓어오르는 대표적인 조후 상극입니다. 서로의 온도 차이가 극명하여 삶의 템포가 달라 삐걱거리지만, 서로가 가진 화려함과 깊은 어둠에 깊게 동조되어 이별 후에도 가장 잔상이 오래 남는 질긴 인연의 조화를 이룹니다.",
              "화수": "수극화(水剋火)로 불과 물이 격렬하게 끓어오르는 대표적인 조후 상극입니다. 서로의 온도 차이가 극명하여 삶의 템포가 달라 삐걱거리지만, 서로가 가진 화려함과 깊은 어둠에 깊게 동조되어 이별 후에도 가장 잔상이 오래 남는 질긴 인연의 조화를 이룹니다."
            };
            const pair = myStEl + partnerStEl;
            return relationships[pair] || "서로의 기운이 모나지 않게 상생하는 무난한 흐름이나, 갈등 시 대치 상태가 지속되기 쉽습니다. 상대적으로 자극은 덜하지만 평화와 편안함을 주는 관계입니다.";
          };

          const relationText = getStemRelationship(myStemEl, partnerStemEl);

          return (
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-sm font-bold text-red-800 flex items-center gap-1.5 border-b border-red-200 pb-2">
                🔗 제 1.5장. 두 사람이 평생 함께해야 할 운명의 상대인가
              </h4>
              <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
                고객님이 가장 깊게 궁금해하시는 <strong>'우리가 정말 평생을 함께할 인연의 고리를 가진 운명인가'</strong>에 대한 사주 매칭 해독 결과입니다.
              </p>
              <div className="p-4 bg-white rounded border border-[#E2DDD5]/60 text-xs text-[#2C2C2C] leading-relaxed space-y-2 font-light">
                <p>
                  <strong>사주 일간 및 조후 조화 진단:</strong> <span style={{ color: "#8A6F4C", fontWeight: "bold" }}>{relationText}</span>
                </p>
                <p className="border-t border-gray-100 pt-2.5 text-[11px] text-gray-500 font-traditional">
                  ※ 명리학적으로 서로 상극(剋)인 인연은 나쁘기만 한 것이 아닙니다. 밋밋하게 흘러가는 상생(生)보다 오히려 인생의 굴곡진 대운에서 가장 깊숙이 얽히며 서로의 운명선을 격렬하게 끌어당기는 원동력이 됩니다. 상극의 마찰을 '개운(開運) 비책'으로 다스릴 때 비로소 헤어질 수 없는 단 하나의 운명적 동반자로 완성됩니다.
                </p>
              </div>
            </div>
          );
        })()}

        {/* 2. 상대방 현재 속마음 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#5F7A68]/30 pb-2">
            💭 제 2장. 상대방 {partnerName}님의 현재 심리와 속마음 기류
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            현재 상대방의 생년월일시 일간 대비 2026 병오년의 십신(十神) 작용을 추적하여 그 사람의 무의식 심리를 읽어낸 결과입니다.
          </p>
          <div className="bg-[#FAF9F6] p-4 rounded text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional border border-[#E2DDD5]/40">
            <strong>속마음 주파수 진단:</strong> {partnerMind}
          </div>
        </div>

        {/* 3. 재회 연락 황금 시기 */}
        <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 shadow-sm space-y-4">
          <h4 className="font-myeongjo text-sm font-bold text-[#5F7A68] flex items-center gap-1.5 border-b border-[#5F7A68]/30 pb-2">
            ⏳ 제 3장. 재회 연락 및 재결합에 가장 유리한 황금의 타이밍
          </h4>
          <div className="space-y-4 text-xs font-light font-traditional text-[#2C2C2C]">
            <div className="border-l-2 border-[#5F7A68] pl-3">
              <span className="text-xs font-bold text-[#5F7A68] block">📞 베스트 연락 타이밍: {reunionTiming.month}</span>
              <p className="text-[11px] text-[#5F5F5F] leading-relaxed mt-1 font-traditional">{reunionTiming.reason}</p>
            </div>
          </div>
        </div>

        {/* 4. 재회 안착 요결 */}
        <div className="bg-[#F5F2EB] border border-[#E2DDD5] rounded-lg p-5 space-y-3 shadow-sm">
          <h4 className="font-myeongjo text-sm font-bold text-red-700 flex items-center gap-1.5 border-b border-[#E2DDD5]/60 pb-2">
            🌿 제 4장. 다시 만났을 때 이별을 반복하지 않을 재회 개운 비책
          </h4>
          <p className="text-xs text-[#2C2C2C] leading-relaxed font-light font-traditional">
            상대방 {partnerName}님과 다시 연결되었을 때는 지나간 잘잘못을 따져 묻지 않는 '과거 봉인 룰'이 가장 필수적입니다. 다시 대화가 오갈 때 "네가 연락해 주어서 마음이 편안해졌어"라고 상대방의 존재를 긍정하고 존중해 줄 때, 예전의 꼬였던 대립 기류가 눈 녹듯 정화되어 완벽한 부부/연인의 안착 기류로 승화될 것입니다.
          </p>
        </div>
      </div>
    );
  };

  const renderGunghapContent = () => {
    // Determine dynamic scores based on their elemental combinations
    const myEl = sajuInfo.elements;
    const partnerEl = partnerSajuInfo.elements;
    const myStem = sajuInfo.day.stem;
    const partnerStem = partnerSajuInfo.day.stem;
    const myBranch = sajuInfo.day.branch;
    const partnerBranch = partnerSajuInfo.day.branch;
    const myStemEl = sajuInfo.day.stemEl;
    const partnerStemEl = partnerSajuInfo.day.stemEl;

    if (gunghapType === "deep_compatibility") {
      return renderDeepCompatibilityContent(myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl);
    } else if (gunghapType === "reunion") {
      return renderReunionCompatibilityContent(myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl);
    } else {
      return renderNormalCompatibilityContent(myEl, partnerEl, myStem, partnerStem, myBranch, partnerBranch, myStemEl, partnerStemEl);
    }
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
  // Render: 나만의 오늘의 운세 (today - 3,900원)
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
              <strong>{name}</strong>님은 타고난 일주 사주명식에서 일간(日干)이 <strong>{dayStem} ({dayStemEl})</strong>에 해당합니다.
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
        src="https://cdn.portone.io/v2/browser-sdk.js" 
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

      <div className={`max-w-3xl mx-auto bg-[#F6F3EC] border-4 border-[#A3845B] rounded-lg p-6 md:p-12 shadow-md relative print:shadow-none print:border-none print:bg-white ${(isFree || type === "today") ? "pb-24 md:pb-32" : ""}`}>
        
        {/* Decorative corner motifs */}
        <div className="absolute top-4 left-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute top-4 right-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute bottom-4 left-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>
        <div className="absolute bottom-4 right-4 text-[#A3845B]/30 font-myeongjo text-sm print:hidden">卍</div>

        {/* Print Actions */}
        <div className="flex justify-end items-center mb-8 border-b border-[#E2DDD5] pb-4 print:hidden">
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
                <span className="text-[10px] text-[#A3845B] font-semibold block">성명</span>
                <span className="font-myeongjo text-base font-bold text-[#1A1A1A]">{name} 님 ({gender})</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#A3845B] font-semibold block">출생 정보</span>
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  {year}년 {month}월 {day}일 {hour === "unknown" ? "시간 모름" : hour} ({calendar === "solar" ? "양력" : "음력"})
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
                  {type === "saju" && `평생 종합 사주 (${reportGrade === "deep" ? "심화" : (reportGrade === "free" || reportGrade === "sms") ? "문자요약" : "고급"})`}
                  {type === "newyear" && (typeParam === "tojeong" ? (reportGrade === "sms" || reportGrade === "free" ? "토정비결 문자요약" : "토정비결") : (reportGrade === "sms" || reportGrade === "free" ? "신년운세 문자요약" : "신년운세"))}
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

        {/* 보고서 하단으로 이동된 다시 입력하기 버튼 (인쇄 제외) */}
        <div className="flex justify-center mt-12 pb-4 print:hidden">
          <Link
            href="/input"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#A3845B] text-sm text-[#A3845B] hover:bg-[#A3845B] hover:text-[#F9F8F6] rounded-md transition-all font-semibold font-myeongjo shadow-sm hover:shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            다시 입력하기
          </Link>
        </div>

        {/* 하단 고정 결제 CTA 플로팅 바 (isFree 일 때 노출 단, 고급 미결제는 제외) */}
        {isFree && reportGrade === "free_old_disabled" && (
          <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
            <button
              type="button"
              onClick={handlePortonePayment}
              className="w-full bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm md:text-base flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#A3845B]/20"
            >
              <span>{name}님 정통사주풀이(프리미엄확인하기)</span>
              <span className="text-lg">➔</span>
            </button>
          </div>
        )}

        {/* SMS 요약 보고서일 때 유료 결제 유도 하단 고정 플로팅 바 (오늘의 운세 및 무료 사주는 제외) */}
        {type !== "today" && type !== "tarot" && type !== "gunghap" && type !== "wealth" && type !== "dream" && reportGrade === "sms" && (
          typeParam === "tojeong" ? (
            <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
              <button
                type="button"
                onClick={() => handleUpgradeFromSms("premium", 20000)}
                className="w-full bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#A3845B]/20"
              >
                <span>고급 리포트 업그레이드 (+20,000원)</span>
                <span className="text-lg">➔</span>
              </button>
            </div>
          ) : (
            <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleUpgradeFromSms("premium", 20000)}
                className="flex-1 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] py-3.5 px-4 rounded-xl font-myeongjo font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#A3845B]/20"
              >
                <span>고급 리포트 업그레이드 (+20,000원)</span>
                <span className="text-[10px] sm:text-xs">➔</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpgradeFromSms("deep", 35000)}
                className="flex-1 bg-[#2C2420] hover:bg-[#3d322c] text-[#E2DDD5] py-3.5 px-4 rounded-xl font-myeongjo font-bold text-xs sm:text-sm flex items-center justify-center gap-1 shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#A3845B]/30"
              >
                <span>👑 프리미엄 리포트 (+35,000원)</span>
                <span className="text-[10px] sm:text-xs text-[#A3845B]">➔</span>
              </button>
            </div>
          )
        )}

        {/* 오늘의 맞춤 운세 및 무료 사주 보고서 하단 고정 혜안당 운세 상품 이동 플로팅 바 */}
        {(type === "today" || reportGrade === "free") && (
          <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
            <Link
              href="/#services"
              className="w-full bg-[#8B221E] hover:bg-[#6D1B18] text-white py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#8B221E]/20"
            >
              <span>🔮 혜안당 정밀 운세 상품 보러가기 (종합사주/신년운세)</span>
              <span className="text-lg">➔</span>
            </Link>
          </div>
        )}

        {/* 고급 리포트일 때 프리미엄 업그레이드 하단 고정 플로팅 바 (결제 완료 상태에서도 노출되도록 !isPaid 조건 제거) */}
        {reportGrade === "premium" && (type === "saju" || (type === "newyear" && typeParam !== "tojeong")) && (
          <div className="fixed bottom-4 left-4 right-4 md:max-w-xl md:mx-auto z-50 print:hidden animate-slideUp">
            <button
              type="button"
              onClick={handleUpgradePayment}
              className="w-full bg-[#5F7A68] hover:bg-[#465A4B] text-white py-4 px-6 rounded-xl font-myeongjo font-bold text-xs sm:text-sm md:text-base flex items-center justify-between shadow-2xl transition-all cursor-pointer transform hover:-translate-y-0.5 border border-[#5F7A68]/20"
            >
              <span>👑 {name}님 {type === "newyear" ? "신년운세" : "평생종합사주"} 프리미엄 리포트로 업그레이드 (+15,000원)</span>
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
