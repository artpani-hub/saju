"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CreditCard, RefreshCw, Mail, CheckCircle2, AlertTriangle, Play, Sparkles, Search, Calendar } from "lucide-react";

// Mock database orders
const initialOrders = [];

// ========================================================
// [Aligo SMS 연동용 헬퍼 함수군]
// ========================================================
const getGanjiTable = (yearNum, monthNum, dayNum, hourString) => {
  const Stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const Branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const StemElements = {
    "甲": "목", "乙": "목", "丙": "화", "丁": "화", "戊": "토", "己": "토", "庚": "금", "辛": "금", "壬": "수", "癸": "수"
  };
  const BranchElements = {
    "寅": "목", "卯": "목", "巳": "화", "午": "화", "辰": "토", "戌": "토", "丑": "토", "未": "토", "申": "금", "酉": "금", "亥": "수", "子": "수"
  };

  const yIdx = Math.abs(yearNum - 4) % 60;
  const yStem = Stems[yIdx % 10];
  const yBranch = Branches[yIdx % 12];

  const mIdx = Math.abs((monthNum || 1) + 2) % 60;
  const mStem = Stems[mIdx % 10];
  const mBranch = Branches[mIdx % 12];

  const dIdx = Math.abs((dayNum || 1) + 15) % 60;
  const dStem = Stems[dIdx % 10];
  const dBranch = Branches[dIdx % 12];

  let hBranch = "子";
  let hStem = "甲";
  let hName = "자시";
  if (hourString) {
    const hourNum = parseInt(hourString.split(":")[0]) || 0;
    const bIdx = Math.floor(((hourNum + 1) % 24) / 2);
    hBranch = Branches[bIdx];
    hName = ["자시", "축시", "인시", "묘시", "진시", "사시", "오시", "미시", "신시", "유시", "술시", "해시"][bIdx];
    hStem = Stems[((dIdx % 5) * 2 + bIdx) % 10];
  }

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

const buildTodaySmsText = (name, gender, year, month, day, hour) => {
  const sajuInfo = getGanjiTable(parseInt(year), parseInt(month), parseInt(day), hour);
  const dayStem = sajuInfo.day.stem;
  const dayBranch = sajuInfo.day.branch;
  const dayStemEl = sajuInfo.day.stemEl;
  
  const today = new Date();
  const formattedToday = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

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
      advice: "몸이 찌꿈둥할 수 있으니 가벼운 등산이나 야외 어싱 요법을 통해 신체 기운을 순환시키십시오."
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

  const elementPrescriptions = {
    "목": { color: "초록색 (Olive, Emerald)", number: "3, 8", direction: "동쪽 (숲길, 공원)", advice: "원목 소품이나 식물 화분을 눈에 보이는 곳에 두면 기운이 원활해집니다." },
    "화": { color: "붉은색 (Coral, Scarlet)", number: "2, 7", direction: "남쪽 (채광이 잘 드는 곳)", advice: "스탠드 조명을 켜거나 가벼운 족욕을 통해 몸에 따뜻한 활력을 순환시키십시오." },
    "토": { color: "노란색 (Sand, Beige)", number: "5, 10", direction: "중앙 (평야, 거실)", advice: "흙길을 맨발로 걷거나 도자기 그릇을 사용하는 습관이 기운의 중심을 잡아줍니다." },
    "금": { color: "흰색 (Silver, Grey)", number: "4, 9", direction: "서쪽 (바위산, 서재)", advice: "은 반지나 메탈 시계를 착용하고 일일 목표를 명확히 다이어리에 기록하십시오." },
    "수": { color: "검은색 (Charcoal, Indigo)", number: "1, 6", direction: "북쪽 (물가, 강변)", advice: "가습기를 틀거나 가벼운 반신욕을 하고 침실을 완전 차단하여 숙면하십시오." }
  };

  const analysis = stemAnalysis[dayStem] || stemAnalysis["甲"];
  const myPresc = elementPrescriptions[dayStemEl] || elementPrescriptions["목"];

  const origin = "https://saju.artpani.com";

  return `[혜안당 명리연구소] ${name} 님 오늘의 수호 보감\n오늘의 일진: ${formattedToday} (${dayStem}${dayBranch}일 - ${dayStemEl}의 기운)\n\n● 총운: ${analysis.summary}\n● 금전운: ${analysis.wealth.score}% (${analysis.wealth.desc})\n● 연애운: ${analysis.love.score}% (${analysis.love.desc})\n● 대인관계: ${analysis.social.score}% (${analysis.social.desc})\n\n행운의 개운 비법:\n- 수호 색상: ${myPresc.color}\n- 수호 숫자: ${myPresc.number}\n- 수호 방향: ${myPresc.direction}\n- 조언: ${analysis.advice}\n\n상세한 분석 및 만세력 결과는 아래 링크에서 확인하실 수 있습니다.\n▶ 결과 보기: ${origin}/result?name=${name}&gender=${gender === "female" ? "female" : "male"}&type=today&year=${year}&month=${month}&day=${day}&hour=${hour}&reportGrade=sms`;
};

const buildGeneralSmsTextFromOrder = (order) => {
  const queryParams = new URLSearchParams({
    name: order.name,
    gender: order.gender || "female",
    type: order.productName.includes("오늘") || order.productName.includes("오늘의") ? "today" :
          order.productName.includes("사주") ? "saju" : 
          order.productName.includes("재물") ? "wealth" : 
          order.productName.includes("신년") ? "newyear" : 
          order.productName.includes("궁합") ? "gunghap" : "tarot",
    calendar: order.calendar || "solar",
    year: order.year || "1995",
    month: order.month || "8",
    day: order.day || "25",
    hour: order.hour || "10:00",
    worryText: order.worryText || "",
    gunghapType: order.productName.includes("속궁합") ? "deep_compatibility" :
                 order.productName.includes("재회") ? "reunion" : "compatibility",
    reportGrade: order.reportGrade === "premium" && order.status === "paid" ? "deep" :
                 (order.reportGrade || (order.productName.includes("문자메시지") ? "sms" : order.productName.includes("심화") ? "deep" : order.productName.includes("무료") ? "free" : "premium"))
  });

  const origin = "https://saju.artpani.com";

  return `[혜안당 명리연구소] ${order.name} 님, 주문하신 [${order.productName}] 분석이 무사히 완료되었습니다.\n\n적어주신 이메일(${order.email})로 상세 보고서 PDF 가이드를 재전송해 드렸습니다. 혹은 아래의 온라인 결과 보감 링크를 통해 즉시 확인해 보실 수 있습니다.\n\n▶ 모바일 결과 보기: ${origin}/result?${queryParams.toString()}\n\n귀하의 앞날에 늘 지혜의 빛이 함께하기를 기원합니다. 감사합니다.`;
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, 7days, 30days, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshingId, setRefreshingId] = useState(null);

  // 날짜 포맷팅 헬퍼 (YYYY-MM-DD)
  const getFormattedDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // 로컬 타임존 기준으로 안전하게 날짜 파싱
  const parseLocalDate = (dateStr, isEnd = false) => {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    if (isEnd) {
      return new Date(year, month, day, 23, 59, 59, 999);
    }
    return new Date(year, month, day, 0, 0, 0, 0);
  };

  // 직접 지정(custom) 선택 시 기본 범위(최근 7일) 설정
  useEffect(() => {
    if (dateFilter === "custom" && (!startDate || !endDate)) {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      setStartDate(getFormattedDateString(sevenDaysAgo));
      setEndDate(getFormattedDateString(today));
    }
  }, [dateFilter]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  // 1. 로그인 인증 체크 (sessionStorage 활용)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("hyeandang_admin_auth");
      if (auth === "true") {
        setIsLoggedIn(true);
      }
    }
  }, []);

  // 2. 주문 데이터 로드
  useEffect(() => {
    try {
      const existingStr = localStorage.getItem("hyeandang_orders");
      if (existingStr) {
        setOrders(JSON.parse(existingStr));
      } else {
        const defaultOrders = [
          {
            id: 1004,
            name: "이지혜",
            email: "jihye@example.com",
            phone: "010-1234-5678",
            productName: "평생 종합 사주팔자",
            amount: 30000,
            status: "paid",
            sajuGanji: "己亥年 己巳月 甲子일 (사시)",
            emailStatus: "sent",
            createdAt: "2026-05-23 17:15",
            gender: "female",
            calendar: "solar",
            year: "1995",
            month: "8",
            day: "25",
            hour: "10:00",
            worryText: "이번 가을에 다니던 IT 회사를 퇴사하고 다른 회사 서비스 기획팀으로 이직을 준비하고 있는데 무사히 합격할 수 있을지 고민입니다."
          },
          {
            id: 1003,
            name: "김민우",
            email: "minwoo@test.com",
            phone: "010-9876-5432",
            productName: "재물 & 비즈니스운",
            amount: 20000,
            status: "paid",
            sajuGanji: "庚午년 戊子월 丙寅일 (오시)",
            emailStatus: "sent",
            createdAt: "2026-05-23 16:02",
            gender: "male",
            calendar: "solar",
            year: "1990",
            month: "6",
            day: "15",
            hour: "12:00",
            worryText: "최근에 동업 제안을 받아 쇼핑몰 창업을 계획하고 있는데, 지금 시기에 돈을 대출받아 투자해도 괜찮을지 알고 싶습니다."
          },
          {
            id: 1002,
            name: "박서연",
            email: "seoyeon@example.net",
            phone: "010-5555-4444",
            productName: "신년 운세 / 토정비결",
            amount: 35000,
            status: "paid",
            sajuGanji: "癸酉년 乙丑월 己未일 (묘시)",
            emailStatus: "failed",
            createdAt: "2026-05-23 14:45",
            gender: "female",
            calendar: "solar",
            year: "1993",
            month: "1",
            day: "20",
            hour: "08:30",
            worryText: "올해 유독 회사 일이 안 풀려서 스트레스가 많고 이직 준비를 하려는데 자격증 합격이나 다른 곳으로의 기운이 따를지 조언을 부탁드립니다."
          },
          {
            id: 1001,
            name: "최준혁",
            email: "junhyuk@mail.com",
            phone: "010-8888-9999",
            productName: "그 사람의 속마음 (타로)",
            amount: 10000,
            status: "failed",
            sajuGanji: "-",
            emailStatus: "pending",
            createdAt: "2026-05-23 11:20",
            gender: "male",
            calendar: "solar",
            year: "1994",
            month: "5",
            day: "12",
            hour: "unknown",
            worryText: "그 사람이 요즘 저한테 연락이 뜸한데 도대체 속마음이 무엇인지 알고 싶습니다."
          },
        ];
        setOrders(defaultOrders);
        localStorage.setItem("hyeandang_orders", JSON.stringify(defaultOrders));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogin = () => {
    if (passwordInput === "artpani1234") {
      setIsLoggedIn(true);
      setLoginError("");
      sessionStorage.setItem("hyeandang_admin_auth", "true");
    } else {
      setLoginError("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("hyeandang_admin_auth");
  };

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditForm({ name: order.name, email: order.email, phone: order.phone });
  };

  const saveEdit = (id) => {
    setOrders(prev => {
      const updated = prev.map(order =>
        order.id === id ? { ...order, ...editForm } : order
      );
      try {
        localStorage.setItem("hyeandang_orders", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleResend = async (id) => {
    setRefreshingId(id);
    
    const targetOrder = orders.find(o => o.id === id);
    if (!targetOrder) {
      alert("주문 정보를 찾을 수 없습니다.");
      setRefreshingId(null);
      return;
    }

    try {
      // 메일 전송 대상 여부 체크
      const isEmailProduct = 
        (targetOrder.productName.includes("사주") || targetOrder.productName.includes("신년") || targetOrder.productName.includes("토정")) &&
        (targetOrder.productName.includes("고급") || targetOrder.productName.includes("프리미엄"));

      if (isEmailProduct) {
        const queryParams = new URLSearchParams({
          name: targetOrder.name,
          gender: targetOrder.gender || "female",
          type: targetOrder.productName.includes("사주") ? "saju" : 
                targetOrder.productName.includes("신년") ? "newyear" : "tojeong",
          calendar: targetOrder.calendar || "solar",
          year: targetOrder.year || "1995",
          month: targetOrder.month || "8",
          day: targetOrder.day || "25",
          hour: targetOrder.hour || "10:00",
          worryText: targetOrder.worryText || "",
          gunghapType: targetOrder.productName.includes("속궁합") ? "deep_compatibility" :
                       targetOrder.productName.includes("재회") ? "reunion" : "compatibility"
        });

        const origin = typeof window !== "undefined" ? window.location.origin : "https://saju.artpani.com";
        const resultUrl = `${origin}/result?${queryParams.toString()}&reportGrade=${targetOrder.reportGrade || (targetOrder.productName.includes("문자메시지") ? "sms" : targetOrder.productName.includes("심화") ? "deep" : targetOrder.productName.includes("무료") ? "free" : "premium")}`;
        
        const mailSubject = `[혜안당 명리연구소] ${targetOrder.name} 님 주문하신 [${targetOrder.productName}] 분석결과서가 재도착했습니다.`;
        const mailHtml = `
          <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #E2DDD5; border-radius: 12px; background-color: #F9F8F6;">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 24px; font-weight: bold; color: #A3845B; letter-spacing: 2px;">慧眼堂</span>
              <p style="font-size: 12px; color: #888; margin-top: 5px;">지혜로운 눈으로 밝히는 운명</p>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #E1E1E1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <h2 style="font-size: 18px; font-weight: bold; color: #1A1A1A; margin-top: 0; border-bottom: 2px solid #A3845B; padding-bottom: 15px;">운세 분석 보고서 재전송 안내</h2>
              <p style="font-size: 14px; color: #333; line-height: 1.6; margin-top: 20px;">
                안녕하세요, <strong>${targetOrder.name}</strong> 님.<br />
                요청하신 <strong>[${targetOrder.productName}]</strong> 분석결과서 보고서를 재전송해 드립니다.
              </p>
              <p style="font-size: 14px; color: #333; line-height: 1.6;">
                아래의 '결과 확인하기' 버튼을 누르시면 온라인 결과 화면으로 즉시 연결되어 열람 및 가이드를 확인해 보실 수 있습니다.
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

        const response = await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: targetOrder.email,
            subject: mailSubject,
            html: mailHtml,
          }),
        });

        const resData = await response.json();
        
        if (resData.success) {
          setOrders(prev => {
            const updated = prev.map(order =>
              order.id === id ? { ...order, emailStatus: "sent" } : order
            );
            try {
              localStorage.setItem("hyeandang_orders", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          alert(`[주문번호 ${id}] 고객 이메일(${targetOrder.email})로 분석 결과 보고서 메일을 성공적으로 재발송하였습니다.`);
        } else {
          throw new Error(resData.message || "메일 발송에 실패했습니다.");
        }
      } else {
        // 문자 전송 진행
        let smsContent = "";
        const isTodayProduct = targetOrder.productName.includes("오늘") || targetOrder.productName.includes("오늘의");
        
        if (isTodayProduct) {
          smsContent = buildTodaySmsText(
            targetOrder.name,
            targetOrder.gender || "female",
            targetOrder.year || "1995",
            targetOrder.month || "8",
            targetOrder.day || "25",
            targetOrder.hour || "10:00"
          );
        } else {
          smsContent = buildGeneralSmsTextFromOrder(targetOrder);
        }

        const response = await fetch("/api/sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver: targetOrder.phone,
            msg: smsContent,
            title: isTodayProduct ? "[혜안당 오늘의운세]" : "[혜안당 사주분석]"
          }),
        });

        const resData = await response.json();
        
        if (resData.success) {
          setOrders(prev => {
            const updated = prev.map(order =>
              order.id === id ? { ...order, emailStatus: "sent" } : order
            );
            try {
              localStorage.setItem("hyeandang_orders", JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
          alert(`[주문번호 ${id}] 고객 휴대폰(${targetOrder.phone})으로 분석 결과 문자메시지를 성공적으로 재발송하였습니다.`);
        } else {
          throw new Error(resData.message || "문자 발송에 실패했습니다.");
        }
      }
    } catch (error) {
      console.error("재전송 오류:", error);
      setOrders(prev => {
        const updated = prev.map(order =>
          order.id === id ? { ...order, emailStatus: "failed" } : order
        );
        try {
          localStorage.setItem("hyeandang_orders", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      alert(`[주문번호 ${id}] 발송 실패: ${error.message || "서버 통신 오류가 발생했습니다."}`);
    } finally {
      setRefreshingId(null);
    }
  };

  // 3. 필터링된 주문 계산 (검색 필터 + 기간 필터 교집합)
  const getFilteredOrders = () => {
    return orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt.replace(/-/g, "/"));
      const now = new Date();
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const orderDayStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      const diffTime = todayStart - orderDayStart;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today") {
        const isToday = orderDate.getFullYear() === now.getFullYear() &&
                        orderDate.getMonth() === now.getMonth() &&
                        orderDate.getDate() === now.getDate();
        if (!isToday) return false;
      } else if (dateFilter === "7days") {
        if (diffDays < 0 || diffDays > 6) return false;
      } else if (dateFilter === "30days") {
        if (diffDays < 0 || diffDays > 29) return false;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = parseLocalDate(startDate, false);
          if (start && orderDate.getTime() < start.getTime()) return false;
        }
        if (endDate) {
          const end = parseLocalDate(endDate, true);
          if (end && orderDate.getTime() > end.getTime()) return false;
        }
      }
      
      return (
        order.name.includes(searchTerm) ||
        order.email.includes(searchTerm) ||
        order.productName.includes(searchTerm)
      );
    });
  };

  const filteredOrders = getFilteredOrders();

  // 4. 기간별 매출 및 건수 통계 계산 (검색 필터를 배제한 순수 기간 데이터 기준)
  const getPeriodStats = () => {
    const periodOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt.replace(/-/g, "/"));
      const now = new Date();
      
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const orderDayStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      const diffTime = todayStart - orderDayStart;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "today") {
        return orderDate.getFullYear() === now.getFullYear() &&
               orderDate.getMonth() === now.getMonth() &&
               orderDate.getDate() === now.getDate();
      } else if (dateFilter === "7days") {
        return diffDays >= 0 && diffDays <= 6;
      } else if (dateFilter === "30days") {
        return diffDays >= 0 && diffDays <= 29;
      } else if (dateFilter === "custom") {
        if (startDate) {
          const start = parseLocalDate(startDate, false);
          if (start && orderDate.getTime() < start.getTime()) return false;
        }
        if (endDate) {
          const end = parseLocalDate(endDate, true);
          if (end && orderDate.getTime() > end.getTime()) return false;
        }
        return true;
      }
      return true; // all
    });

    const paidOrders = periodOrders.filter(o => o.status === "paid");
    const totalAmount = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const totalCount = periodOrders.length;
    const paidCount = paidOrders.length;
    const failedCount = periodOrders.filter(o => o.status === "failed").length;
    const sentEmailCount = paidOrders.filter(o => o.emailStatus === "sent").length;

    return {
      totalAmount,
      totalCount,
      paidCount,
      failedCount,
      sentEmailCount
    };
  };

  const stats = getPeriodStats();

  // 5. 로그인 화면 렌더링
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-gothic px-6">
        <div className="max-w-md w-full border-2 border-brass/35 rounded-2xl bg-white p-8 shadow-md relative overflow-hidden">
          <div className="absolute top-3 left-3 text-brass/30 font-myeongjo text-xs">卍</div>
          <div className="absolute top-3 right-3 text-brass/30 font-myeongjo text-xs">卍</div>
          <div className="absolute bottom-3 left-3 text-brass/30 font-myeongjo text-xs">卍</div>
          <div className="absolute bottom-3 right-3 text-brass/30 font-myeongjo text-xs">卍</div>

          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-brass/5 border border-brass/25">
              <svg width="40" height="40" viewBox="0 0 100 100" className="text-brass">
                <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
                <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="4" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="5" />
                <circle cx="50" cy="50" r="6" fill="currentColor" />
              </svg>
            </div>
            
            <h2 className="font-myeongjo text-xl font-bold text-foreground">慧眼堂 관리자 로그인</h2>
            <p className="text-xs text-foreground-muted font-light leading-relaxed">
              본 페이지는 혜안당 플랫폼 관리 권한을 가진 분만 접근 가능합니다.<br />
              보안을 위해 관리자 비밀번호를 입력해 주십시오.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg text-center font-medium">
                ⚠️ {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">관리자 비밀번호</label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-brass focus:bg-background transition-colors text-center animate-none"
              />
            </div>

            <button
              onClick={handleLogin}
              className="w-full inline-flex items-center justify-center bg-brass text-background py-3 rounded-lg text-sm font-bold hover:bg-brass-dark shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer mt-2"
            >
              로그인하기
            </button>
            
            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-foreground-muted hover:text-brass transition-colors">
                메인 화면으로 가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. 어드민 대시보드 메인 화면 렌더링
  return (
    <div className="flex flex-col min-h-screen bg-background font-gothic">
      {/* Header */}
      <header className="border-b border-border-custom bg-background px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-brass">
              <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="8" />
              <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="4" strokeDasharray="2 2" />
            </svg>
            <span className="font-myeongjo text-lg font-bold tracking-widest text-foreground">慧眼堂 어드민</span>
          </Link>
          <span className="text-xs bg-brass/10 text-brass px-2 py-0.5 rounded font-medium">관리자 대시보드</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="text-xs border border-border-custom hover:border-red-500 hover:text-red-500 px-3 py-1.5 rounded transition-colors cursor-pointer text-foreground-muted"
          >
            로그아웃
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-brass transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            메인 페이지로
          </Link>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-myeongjo text-2xl font-bold text-foreground mb-1">실시간 운영 현황</h2>
            <p className="text-xs text-foreground-muted font-light">혜안당 플랫폼의 주문 결제 내역과 AI 분석 상태를 모니터링합니다.</p>
          </div>
          <div className="text-xs text-brass font-semibold">
            조회 범위: {
              dateFilter === "all" ? "전체 기간" : 
              dateFilter === "today" ? "오늘" : 
              dateFilter === "7days" ? "최근 7일" : 
              dateFilter === "30days" ? "최근 30일" : 
              `직접 지정 (${startDate || "시작일 미지정"} ~ ${endDate || "종료일 미지정"})`
            }
          </div>
        </div>

        {/* Status Stat Cards (필터 기간 반영) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">선택 기간 결제액</span>
              <CreditCard className="w-4 h-4 text-brass" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">{stats.totalAmount.toLocaleString()}원</span>
            <span className="text-[10px] text-jade block mt-1">완료 {stats.paidCount}건 기준</span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">선택 기간 주문 수</span>
              <Users className="w-4 h-4 text-jade" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">{stats.totalCount}건</span>
            <span className="text-[10px] text-foreground-muted block mt-1">결제 완료 {stats.paidCount}건 / 실패 {stats.failedCount}건</span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">메일 발송 상태</span>
              <Mail className="w-4 h-4 text-brass" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">{stats.sentEmailCount} / {stats.paidCount}건 완료</span>
            <span className="text-[10px] text-brass block mt-1">
              {stats.paidCount - stats.sentEmailCount > 0 ? `⚠️ 미발송 및 실패 ${stats.paidCount - stats.sentEmailCount}건 처리 요망` : "✓ 발송 누락 없음"}
            </span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">AI 연산 가동율</span>
              <Sparkles className="w-4 h-4 text-jade" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">100%</span>
            <span className="text-[10px] text-jade block mt-1">API 서버 정상 가동 중</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-background-secondary/30 border border-border-custom p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground-muted">조회 기간 필터:</span>
              <div className="inline-flex rounded-lg border border-border-custom bg-background p-1 gap-1">
                {[
                  { key: "all", label: "전체 기간" },
                  { key: "today", label: "오늘" },
                  { key: "7days", label: "최근 7일" },
                  { key: "30days", label: "최근 30일" },
                  { key: "custom", label: "직접 지정" }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setDateFilter(filter.key)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      dateFilter === filter.key
                        ? "bg-brass text-background font-bold shadow-sm"
                        : "text-foreground-muted hover:text-foreground hover:bg-background-secondary"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            {dateFilter === "custom" && (
              <div className="flex flex-wrap items-center gap-2 bg-background border border-brass/35 rounded-lg px-2.5 py-1 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-brass font-semibold font-myeongjo">시작</span>
                  <div className="relative flex items-center bg-background-secondary/30 rounded border border-border-custom px-2 py-1">
                    <Calendar className="w-3.5 h-3.5 text-brass mr-1 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent border-none text-xs focus:outline-none text-foreground cursor-pointer select-none font-sans font-medium w-[105px]"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
                <span className="text-xs text-brass font-bold mx-0.5">~</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-brass font-semibold font-myeongjo">종료</span>
                  <div className="relative flex items-center bg-background-secondary/30 rounded border border-border-custom px-2 py-1">
                    <Calendar className="w-3.5 h-3.5 text-brass mr-1 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent border-none text-xs focus:outline-none text-foreground cursor-pointer select-none font-sans font-medium w-[105px]"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="고객명, 이메일, 상품명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border-custom rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brass"
            />
          </div>
        </div>

        {/* Info label */}
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          <div>
            조회 범위 내 필터링된 주문: <strong className="text-foreground">{filteredOrders.length}</strong>건
          </div>
          <div>
            * 신청된 테스트 데이터는 브라우저의 localStorage를 통해 로컬에서 동기화 유지됩니다.
          </div>
        </div>

        {/* Table of Orders */}
        <div className="border border-border-custom rounded-lg bg-background overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-background-secondary border-b border-border-custom text-foreground font-semibold">
                  <th className="p-4">주문번호</th>
                  <th className="p-4">주문일시</th>
                  <th className="p-4">고객 정보</th>
                  <th className="p-4">상품명</th>
                  <th className="p-4 text-right">금액</th>
                  <th className="p-4">결제 상태</th>
                  <th className="p-4">만세력 정보</th>
                  <th className="p-4">결과 발송</th>
                  <th className="p-4 text-center">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-background-secondary/30 transition-colors">
                      <td className="p-4 font-bold text-foreground">{order.id}</td>
                      <td className="p-4 text-foreground-muted">{order.createdAt}</td>
                      <td className="p-4">
                        {editingId === order.id ? (
                          <div className="space-y-1.5 min-w-[150px]">
                            <input
                              type="text"
                              name="name"
                              value={editForm.name}
                              onChange={handleEditChange}
                              className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                              placeholder="성명"
                            />
                            <input
                              type="email"
                              name="email"
                              value={editForm.email}
                              onChange={handleEditChange}
                              className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                              placeholder="이메일"
                            />
                            <input
                              type="text"
                              name="phone"
                              value={editForm.phone}
                              onChange={handleEditChange}
                              className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                              placeholder="연락처"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-semibold text-foreground">{order.name}</div>
                            <div className="text-[10px] text-foreground-muted">{order.email}</div>
                            <div className="text-[10px] text-foreground-muted">{order.phone}</div>
                          </>
                        )}
                      </td>
                      <td className="p-4 font-medium text-foreground">{order.productName}</td>
                      <td className="p-4 text-right font-bold text-foreground">
                        {order.amount.toLocaleString()}원
                      </td>
                      <td className="p-4">
                        {order.status === "paid" && (
                          <span className="inline-flex items-center gap-1 bg-jade/10 text-jade px-2 py-0.5 rounded font-medium text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> 결제 완료
                          </span>
                        )}
                        {order.status === "failed" && (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> 결제 실패
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-foreground-muted font-traditional">
                        {order.sajuGanji}
                      </td>
                      <td className="p-4">
                        {order.emailStatus === "sent" && (
                          <span className="inline-flex items-center gap-1 text-jade font-medium">
                            발송 성공
                          </span>
                        )}
                        {order.emailStatus === "pending" && (
                          <span className="inline-flex items-center gap-1 text-foreground-muted italic">
                            대기 중
                          </span>
                        )}
                        {order.emailStatus === "failed" && (
                          <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                            ⚠️ 발송 실패
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {editingId === order.id ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => saveEdit(order.id)}
                              className="bg-jade text-background px-2.5 py-1 rounded hover:bg-jade-dark text-[10px] font-semibold cursor-pointer"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="border border-border-custom text-foreground-muted px-2.5 py-1 rounded hover:bg-background-secondary text-[10px] font-semibold cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            {order.status === "paid" && (
                              <>
                                <Link
                                  href={`/result?name=${encodeURIComponent(order.name)}&gender=${order.gender || (order.id === 1003 ? "male" : "female")}&type=${
                                    order.productName.includes("오늘") || order.productName.includes("오늘의") ? "today" :
                                    order.productName.includes("사주") ? "saju" : 
                                    order.productName.includes("재물") ? "wealth" : 
                                    order.productName.includes("신년") ? "newyear" : 
                                    order.productName.includes("궁합") ? "gunghap" : "tarot"
                                  }&year=${
                                    order.year || (order.id === 1004 ? "1995" : order.id === 1003 ? "1990" : "1993")
                                  }&month=${
                                    order.month || (order.id === 1004 ? "8" : order.id === 1003 ? "6" : "1")
                                  }&day=${
                                    order.day || (order.id === 1004 ? "25" : order.id === 1003 ? "15" : "20")
                                  }&hour=${encodeURIComponent(
                                    order.hour || (order.id === 1004 ? "10:00" : order.id === 1003 ? "12:00" : "08:30")
                                  )}&worryText=${encodeURIComponent(
                                    order.worryText || (
                                      order.id === 1004 ? "이번 가을에 다니던 IT 회사를 퇴사하고 다른 회사 서비스 기획팀으로 이직을 준비하고 있는데 무사히 합격할 수 있을지 고민입니다." :
                                      order.id === 1003 ? "최근에 동업 제안을 받아 쇼핑몰 창업을 계획하고 있는데, 지금 시기에 돈을 대출받아 투자해도 괜찮을지 알고 싶습니다." :
                                      "올해 유독 회사 일이 안 풀려서 스트레스가 많고 이직 준비를 하려는데 자격증 합격이나 다른 곳으로의 기운이 따를지 조언을 부탁드립니다."
                                    )
                                  )}&gunghapType=${
                                    order.productName.includes("속궁합") ? "deep_compatibility" :
                                    order.productName.includes("재회") ? "reunion" : "compatibility"
                                  }&reportGrade=${
                                    order.reportGrade === "premium" && order.status === "paid" ? "deep" :
                                    (order.reportGrade || (order.productName.includes("문자메시지") ? "sms" : order.productName.includes("심화") ? "deep" : order.productName.includes("무료") ? "free" : "premium"))
                                  }`}
                                  className="inline-flex items-center gap-1 border border-jade/50 text-jade px-2 py-1 rounded hover:bg-jade hover:text-background transition-all text-[10px] font-medium cursor-pointer"
                                >
                                  결과 보기
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleResend(order.id)}
                                  disabled={refreshingId === order.id}
                                  className="inline-flex items-center gap-1 border border-brass/50 text-brass px-2 py-1 rounded hover:bg-brass hover:text-background transition-all disabled:opacity-50 text-[10px] font-medium cursor-pointer"
                                >
                                  <RefreshCw className={`w-3 h-3 ${refreshingId === order.id ? 'animate-spin' : ''}`} />
                                  {order.emailStatus === "failed" ? "재시도" : "재전송"}
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => startEdit(order)}
                              className="inline-flex items-center gap-1 border border-border-custom text-foreground-muted px-2 py-1 rounded hover:bg-background-secondary transition-all text-[10px] font-medium cursor-pointer"
                            >
                              수정
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-foreground-muted font-light">
                      선택한 조회 기간 조건에 부합하는 주문 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
