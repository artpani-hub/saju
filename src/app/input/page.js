"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Check, Sparkles, AlertCircle, Calendar, Clock, User, Phone, Mail, Scroll, ShieldCheck, Heart } from "lucide-react";

// Product information dictionary
const products = {
  saju: {
    title: "평생 종합 사주팔자",
    category: "사주팔자",
    price: 34900,
    originalPrice: 55000,
    desc: "타고난 오행 분포, 대운의 흐름, 전반적인 라이프사이클 솔루션 제공",
  },
  newyear: {
    title: "신년운세",
    category: "시즌 한정",
    price: 34900,
    originalPrice: 55000,
    desc: "한 해의 전체적인 기운과 방향성, 월별 상세 운세 가이드",
  },
  tojeong: {
    title: "토정비결",
    category: "시즌 한정",
    price: 29900,
    originalPrice: 36900,
    desc: "조선 정통 토정 이지함의 비결로 풀어보는 한 해의 신수비결과 월별 지침",
  },
  wealth: {
    title: "재물 & 비즈니스운",
    category: "비즈니스",
    price: 20000,
    desc: "평생의 재물 성향, 재운이 도래하는 시기 및 커리어/투자 제언",
  },
  tarot: {
    title: "그 사람의 속마음 (타로)",
    category: "퀵 타로",
    price: 10000,
    desc: "타로 카드로 읽어내는 상대방의 심리와 향후 조언",
  },
  gunghap: {
    title: "연인 궁합",
    category: "연인 궁합",
    price: 30000,
    desc: "두 사람의 타고난 오행 분포 조화, 속궁합/정서적 궁합, 백년해로 타이밍 및 관계 유지 솔루션 제공",
  },
  dream: {
    title: "꿈해몽 & 사주 조율",
    category: "꿈해몽",
    price: 20000,
    desc: "어젯밤 꿈의 길흉 해몽과 내 사주 오행의 동조 현상 분석. 꿈이 현실과 어떤 관계인지 명리학으로 풀어드립니다.",
  },
  today: {
    title: "나만의 오늘의 운세",
    category: "오늘의 운세",
    price: 5000,
    desc: "개인 인적사항과 출생 정보를 정밀 분석하여 오늘의 운세 핵심 요약을 문자로 즉시 발송해 드립니다.",
  },
};

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

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return `[혜안당 명리연구소] ${name} 님 오늘의 수호 보감\n오늘의 일진: ${formattedToday} (${dayStem}${dayBranch}일 - ${dayStemEl}의 기운)\n\n● 총운: ${analysis.summary}\n● 금전운: ${analysis.wealth.score}% (${analysis.wealth.desc})\n● 연애운: ${analysis.love.score}% (${analysis.love.desc})\n● 대인관계: ${analysis.social.score}% (${analysis.social.desc})\n\n행운의 개운 비법:\n- 수호 색상: ${myPresc.color}\n- 수호 숫자: ${myPresc.number}\n- 수호 방향: ${myPresc.direction}\n- 조언: ${analysis.advice}\n\n상세한 분석 및 만세력 결과는 아래 링크에서 확인하실 수 있습니다.\n▶ 결과 보기: ${origin}/result?name=${encodeURIComponent(name)}&gender=${gender === "female" ? "female" : "male"}&type=today&year=${year}&month=${month}&day=${day}&hour=${encodeURIComponent(hour)}&reportGrade=sms`;
};

const buildGeneralSmsText = (name, productName, email, phone, productKey, formData) => {
  const queryParams = new URLSearchParams({
    name: formData.name,
    gender: formData.gender,
    type: productKey,
    calendar: formData.calendarType,
    year: formData.birthYear,
    month: formData.birthMonth,
    day: formData.birthDay,
    hour: formData.birthHour,
    worryCategory: formData.worryCategory,
    worryText: formData.worryText || "",
    partnerName: formData.partnerName || "",
    partnerGender: formData.partnerGender || "male",
    partnerCalendar: formData.partnerCalendarType || "solar",
    partnerYear: formData.partnerBirthYear || "1995",
    partnerMonth: formData.partnerBirthMonth || "08",
    partnerDay: formData.partnerBirthDay || "25",
    partnerHour: formData.partnerBirthHour || "unknown"
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return `[혜안당 명리연구소] ${name} 님, 주문하신 [${productName}] 분석이 무사히 완료되었습니다.\n\n적어주신 이메일(${email})로 상세 보고서 PDF 가이드를 전송해 드렸습니다. 혹은 아래의 온라인 결과 보감 링크를 통해 즉시 확인해 보실 수 있습니다.\n\n▶ 모바일 결과 보기: ${origin}/result?${queryParams.toString()}&reportGrade=premium\n\n귀하의 앞날에 늘 지혜의 빛이 함께하기를 기원합니다. 감사합니다.`;
};

function InputFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected product state
  const [productKey, setProductKey] = useState("saju");
  const [reportGrade, setReportGrade] = useState("premium"); // premium, deep, sms
  const [formData, setFormData] = useState({
    name: "",
    gender: "female",
    calendarType: "solar", // solar, lunar, lunar-leap
    birthYear: "1995",
    birthMonth: "05",
    birthDay: "15",
    birthHour: "unknown",
    email: "",
    phone: "",
    worryCategory: "love",
    worryText: "",
    // Partner details
    partnerName: "",
    partnerGender: "male",
    partnerCalendarType: "solar",
    partnerBirthYear: "1995",
    partnerBirthMonth: "08",
    partnerBirthDay: "25",
    partnerBirthHour: "unknown",
  });

  // Flow control states
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState("form"); // form, paying, processing, success
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [progress, setProgress] = useState(0);

  // step === "processing" 진행 상황 실시간 타이머
  useEffect(() => {
    if (step !== "processing") {
      setProgress(0);
      return;
    }
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (reportGrade === "free") {
              const queryParams = new URLSearchParams({
                name: formData.name,
                gender: formData.gender,
                type: productKey,
                calendar: formData.calendarType,
                year: formData.birthYear,
                month: formData.birthMonth,
                day: formData.birthDay,
                hour: formData.birthHour,
                worryCategory: formData.worryCategory,
                worryText: formData.worryText || "",
                partnerName: formData.partnerName || "",
                partnerGender: formData.partnerGender || "male",
                partnerCalendar: formData.partnerCalendarType || "solar",
                partnerYear: formData.partnerBirthYear || "1995",
                partnerMonth: formData.partnerBirthMonth || "08",
                partnerDay: formData.partnerBirthDay || "25",
                partnerHour: formData.partnerBirthHour || "unknown",
                reportGrade: "free"
              });
              router.push(`/result?${queryParams.toString()}`);
            } else {
              setStep("success");
            }
          }, 600);
          return 100;
        }
        const diff = Math.floor(Math.random() * 8) + 4;
        return Math.min(100, prev + diff);
      });
    }, 250);

    return () => clearInterval(interval);
  }, [step, reportGrade, formData, productKey, router]);

  const tarotDeck = [
    { id: "magician", name: "마법사", roman: "I", eng: "THE MAGICIAN" },
    { id: "empress", name: "여황제", roman: "III", eng: "THE EMPRESS" },
    { id: "lovers", name: "연인", roman: "VI", eng: "THE LOVERS" },
    { id: "hermit", name: "은둔자", roman: "IX", eng: "THE HERMIT" },
    { id: "wheel", name: "운명의 수레바퀴", roman: "X", eng: "THE WHEEL" },
    { id: "death", name: "죽음", roman: "XIII", eng: "DEATH" },
    { id: "tower", name: "탑", roman: "XVI", eng: "THE TOWER" },
    { id: "fool", name: "광대", roman: "0", eng: "THE FOOL" }
  ];

  useEffect(() => {
    const prod = searchParams.get("product");
    if (prod && products[prod]) {
      setProductKey(prod);
      if (prod === "tojeong" && reportGrade === "deep") {
        setReportGrade("premium");
      }
      if (prod === "wealth") {
        setFormData(prev => ({
          ...prev,
          worryCategory: ["business", "startup", "trade", "facility", "general"].includes(prev.worryCategory)
            ? prev.worryCategory
            : "business"
        }));
      } else if (prod === "dream") {
        setFormData(prev => ({
          ...prev,
          worryCategory: ["animal_plant", "people_family", "death_blood", "nature_weather", "wealth_jewel", "general"].includes(prev.worryCategory)
            ? prev.worryCategory
            : "animal_plant"
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          worryCategory: ["love", "career", "wealth", "exam", "general"].includes(prev.worryCategory)
            ? prev.worryCategory
            : "love"
        }));
      }
    }

    // URL 파라미터로 데이터를 받았을 때 폼 필드 자동 완성
    const nameParam = searchParams.get("name");
    const genderParam = searchParams.get("gender");
    const calendarParam = searchParams.get("calendar");
    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");
    const dayParam = searchParams.get("day");
    const hourParam = searchParams.get("hour");
    const phoneParam = searchParams.get("phone");
    const reportGradeParam = searchParams.get("reportGrade");

    if (nameParam || phoneParam) {
      setFormData(prev => ({
        ...prev,
        name: nameParam || prev.name,
        gender: genderParam || prev.gender,
        calendarType: calendarParam || prev.calendarType,
        birthYear: yearParam || prev.birthYear,
        birthMonth: monthParam || prev.birthMonth,
        birthDay: dayParam || prev.birthDay,
        birthHour: hourParam || prev.birthHour,
        phone: phoneParam || prev.phone,
        email: prev.email || "today_sms@hyeandang.com",
        worryText: prod === "today" ? "오늘의 운세" : prev.worryText
      }));

      // 필수 정보가 다 채워져서 들어온 오늘 운세(today) 상품은 즉각 결제 단계로 진입
      if (prod === "today" && nameParam && phoneParam) {
        setStep("paying");
      }
    }

    if (reportGradeParam) {
      setReportGrade(reportGradeParam);
    }
  }, [searchParams]);

  const activeProduct = products[productKey] || products.saju;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "worryText") {
      setCharCount(value.length);
    }
  };

  const handleSelectProduct = (key) => {
    setProductKey(key);
    if (key === "tojeong" && reportGrade === "deep") {
      setReportGrade("premium");
    }
    if (key === "wealth") {
      setFormData(prev => ({
        ...prev,
        worryCategory: ["business", "startup", "trade", "facility", "general"].includes(prev.worryCategory)
          ? prev.worryCategory
          : "business"
      }));
    } else if (key === "dream") {
      setFormData(prev => ({
        ...prev,
        worryCategory: ["animal_plant", "people_family", "death_blood", "nature_weather", "wealth_jewel", "general"].includes(prev.worryCategory)
          ? prev.worryCategory
          : "animal_plant"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        worryCategory: ["love", "career", "wealth", "exam", "general"].includes(prev.worryCategory)
          ? prev.worryCategory
          : "love"
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "성명을 입력해 주세요.";
    if (productKey !== "today" && reportGrade !== "free") {
      if (!formData.email.trim() || !formData.email.includes("@")) return "올바른 이메일 주소를 입력해 주세요.";
    }
    if (!formData.phone.trim() || formData.phone.length < 9) return "올바른 연락처를 입력해 주세요.";
    if (productKey === "tarot" && selectedCards.length < 3) return "속마음 타로 카드를 3장 선택해 주세요.";
    if (productKey === "gunghap" && !formData.partnerName.trim()) return "상대방의 성명을 입력해 주세요.";
    if (productKey !== "today" && reportGrade !== "free" && !formData.worryText.trim()) return "고민하고 계시는 구체적인 내용을 적어주세요.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    
    // If it's a free trial, bypass paying step and start analysis directly
    if (reportGrade === "free") {
      startAnalysis();
    } else {
      setStep("paying");
    }
  };

  const startAnalysis = () => {
    setStep("processing");
    
    try {
      const orderId = Math.floor(Math.random() * 9000) + 1000;
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const traditionalTime = getTraditionalTimeName(formData.birthHour);
      const sajuGanji = `${formData.birthYear}년 ${formData.birthMonth}월 ${formData.birthDay}일 (${traditionalTime})`;

      const base = products[productKey]?.price || 30000;
      const finalPrice = reportGrade === "free" ? 0 : ((productKey === "saju" || productKey === "newyear" || productKey === "tojeong")
        ? (reportGrade === "deep" 
          ? base + 15000 
          : reportGrade === "sms" 
          ? Math.max(5000, base - 20000) 
          : base)
        : base);

      const newOrder = {
        id: orderId,
        name: formData.name || "홍길동",
        email: formData.email || "today_sms@hyeandang.com",
        phone: formData.phone || "010-0000-0000",
        productName: `${products[productKey]?.title || "맞춤 사주"}${reportGrade === "free" ? " (무료 체험판)" : ""}`,
        amount: finalPrice,
        status: reportGrade === "free" ? "free" : "paid",
        sajuGanji: sajuGanji,
        emailStatus: "pending",
        createdAt: formattedDate,
        gender: formData.gender,
        calendar: formData.calendarType,
        year: formData.birthYear,
        month: formData.birthMonth,
        day: formData.birthDay,
        hour: formData.birthHour,
        worryText: formData.worryText || "오늘의 운세"
      };

        const existingStr = localStorage.getItem("hyeandang_orders");
        let currentOrders = [];
        if (existingStr) {
          currentOrders = JSON.parse(existingStr);
        } else {
          currentOrders = [
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
            }
          ];
        }
        currentOrders.unshift(newOrder);
        localStorage.setItem("hyeandang_orders", JSON.stringify(currentOrders));

        // 알리고 SMS 전송 비동기 호출
        const sendSmsMessage = async () => {
          try {
            let smsContent = "";
            if (productKey === "today") {
              smsContent = buildTodaySmsText(
                formData.name,
                formData.gender,
                formData.birthYear,
                formData.birthMonth,
                formData.birthDay,
                formData.birthHour
              );
            } else {
              smsContent = buildGeneralSmsText(
                formData.name,
                products[productKey]?.title || "혜안당 맞춤 사주",
                formData.email,
                formData.phone,
                productKey,
                formData
              );
            }

            const response = await fetch("/api/sms", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                receiver: formData.phone,
                msg: smsContent,
                title: productKey === "today" ? "[혜안당 오늘의운세]" : "[혜안당 사주분석]"
              }),
            });

            const resData = await response.json();
            console.log("알리고 발송 결과:", resData);
            
            if (resData.success) {
              newOrder.emailStatus = "sent";
            } else {
              newOrder.emailStatus = "failed";
            }
          } catch (e) {
            console.error("SMS 발송 실패:", e);
            newOrder.emailStatus = "failed";
          } finally {
            try {
              const updatedStr = localStorage.getItem("hyeandang_orders");
              if (updatedStr) {
                const ordersList = JSON.parse(updatedStr);
                const targetIdx = ordersList.findIndex(o => o.id === orderId);
                if (targetIdx > -1) {
                  ordersList[targetIdx].emailStatus = newOrder.emailStatus;
                  localStorage.setItem("hyeandang_orders", JSON.stringify(ordersList));
                }
              }
            } catch (err) {}
          }
        };

        sendSmsMessage();
      } catch (err) {
        console.error("Local storage/SMS error:", err);
      }
  };

  // 실제 포트원 결제창 호출 및 처리
  const handlePortonePayment = () => {
    if (typeof window === "undefined" || !window.IMP) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const IMP = window.IMP;
    const impCode = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE || "imp00000000";
    const pgChannel = process.env.NEXT_PUBLIC_PORTONE_PG || "html5_inicis";
    if (impCode === "imp00000000") {
      alert("[개발자 테스트 안내] 테스트 가맹점 코드(imp00000000)가 감지되어 모의 결제 성공 시뮬레이션을 즉시 실행합니다.\n\n확인을 누르시면 주문 정보가 관리자 페이지에 결제완료(paid) 상태로 즉시 등록되고 분석 화면으로 넘어갑니다.");
      startAnalysis();
      return;
    }

    IMP.init(impCode);

    const base = activeProduct.price;
    const finalPrice = (productKey === "saju" || productKey === "newyear" || productKey === "tojeong")
      ? (reportGrade === "deep" 
        ? base + 15000 
        : reportGrade === "sms" 
        ? Math.max(5000, base - 20000) 
        : base)
      : base;

    IMP.request_pay({
      pg: pgChannel,
      pay_method: "card",
      merchant_uid: `merchant_${new Date().getTime()}`,
      name: `${formData.name || "의뢰인"}님 ${activeProduct.title}`,
      amount: finalPrice,
      buyer_name: formData.name,
      buyer_tel: formData.phone,
      buyer_email: formData.email || "test@example.com",
    }, function (rsp) {
      if (rsp.success) {
        startAnalysis(); // 결제 완료 시 분석 진행
      } else {
        alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg} (가맹점코드: ${impCode}, PG: ${pgChannel})`);
      }
    });
  };

  const getTraditionalTimeName = (hourVal) => {
    if (hourVal === "unknown") return "시 모름";
    const hr = parseInt(hourVal);
    if (hr >= 23 || hr < 1) return "자시 (子時) - 23:30 ~ 01:29";
    if (hr >= 1 && hr < 3) return "축시 (丑時) - 01:30 ~ 03:29";
    if (hr >= 3 && hr < 5) return "인시 (寅時) - 03:30 ~ 05:29";
    if (hr >= 5 && hr < 7) return "묘시 (卯時) - 05:30 ~ 07:29";
    if (hr >= 7 && hr < 9) return "진시 (辰時) - 07:30 ~ 09:29";
    if (hr >= 9 && hr < 11) return "사시 (巳時) - 09:30 ~ 11:29";
    if (hr >= 11 && hr < 13) return "오시 (午時) - 11:30 ~ 13:29";
    if (hr >= 13 && hr < 15) return "미시 (未時) - 13:30 ~ 15:29";
    if (hr >= 15 && hr < 17) return "신시 (申時) - 15:30 ~ 17:29";
    if (hr >= 17 && hr < 19) return "유시 (酉時) - 17:30 ~ 19:29";
    if (hr >= 19 && hr < 21) return "술시 (戌時) - 19:30 ~ 21:29";
    return "해시 (亥時) - 21:30 ~ 23:29";
  };

  return (
    <div className="flex flex-col min-h-screen hyeandang-traditional-bg">
      <Script 
        src="https://cdn.iamport.kr/v1/iamport.js" 
        strategy="afterInteractive"
      />
      {/* Header */}
      <header className="border-b border-border-custom bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-brass">
              <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="8" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="6" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
            <span className="font-myeongjo text-lg font-bold tracking-widest text-foreground">慧眼堂</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-brass transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 md:py-16">
        {step === "form" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left side: Form (Takes 2 cols) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-myeongjo text-3xl font-bold text-foreground mb-2">운세 정보 입력</h1>
                <p className="text-sm text-foreground-muted font-light">
                  정밀한 만세력 산출과 고민 맞춤형 조언 작성을 위해 생년월일과 고민 내용을 정성껏 기입해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Name and Gender */}
                <div className="bg-background-secondary/30 border border-border-custom rounded-lg p-6 space-y-4">
                  <h3 className="font-myeongjo text-base font-bold text-foreground flex items-center gap-2 border-b border-border-custom/50 pb-2">
                    <User className="w-4 h-4 text-brass" />
                    기본 인적사항
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1.5">성명 (실명)</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="홍길동"
                        className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-brass transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-foreground mb-1.5">성별</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender: "female" }))}
                          className={`py-2 text-sm font-medium rounded border transition-colors ${
                            formData.gender === "female"
                              ? "bg-brass text-background border-brass"
                              : "bg-background text-foreground-muted border-border-custom hover:border-brass/50"
                          }`}
                        >
                          여성 (女性)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, gender: "male" }))}
                          className={`py-2 text-sm font-medium rounded border transition-colors ${
                            formData.gender === "male"
                              ? "bg-brass text-background border-brass"
                              : "bg-background text-foreground-muted border-border-custom hover:border-brass/50"
                          }`}
                        >
                          남성 (男性)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Birth Date and Time */}
                <div className="bg-background-secondary/30 border border-border-custom rounded-lg p-6 space-y-4">
                  <h3 className="font-myeongjo text-base font-bold text-foreground flex items-center gap-2 border-b border-border-custom/50 pb-2">
                    <Calendar className="w-4 h-4 text-jade" />
                    출생 정보 (생년월일시)
                  </h3>

                  <div className="space-y-4">
                    {/* Calendar Type */}
                    <div>
                      <span className="block text-xs font-semibold text-foreground mb-1.5">역법 종류</span>
                      <div className="grid grid-cols-3 gap-2">
                        {["solar", "lunar", "lunar-leap"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, calendarType: type }))}
                            className={`py-2 text-xs font-medium rounded border transition-colors ${
                              formData.calendarType === type
                                ? "bg-jade text-background border-jade"
                                : "bg-background text-foreground-muted border-border-custom hover:border-jade/50"
                            }`}
                          >
                            {type === "solar" && "양력 (陽曆)"}
                            {type === "lunar" && "음력 평달 (陰曆)"}
                            {type === "lunar-leap" && "음력 윤달 (閏月)"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selector Inputs */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-foreground-muted mb-1">출생년도</label>
                        <select
                          name="birthYear"
                          value={formData.birthYear}
                          onChange={handleInputChange}
                          className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                        >
                          {Array.from({ length: 90 }, (_, i) => 2026 - i).map((yr) => (
                            <option key={yr} value={yr}>{yr}년</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-foreground-muted mb-1">출생월</label>
                        <select
                          name="birthMonth"
                          value={formData.birthMonth}
                          onChange={handleInputChange}
                          className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                            <option key={m} value={m}>{m}월</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-foreground-muted mb-1">출생일</label>
                        <select
                          name="birthDay"
                          value={formData.birthDay}
                          onChange={handleInputChange}
                          className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                        >
                          {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                            <option key={d} value={d}>{d}일</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Birth Hour */}
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                        <span>태어난 시간</span>
                        <span className="text-[10px] text-brass-dark font-normal">
                          * {getTraditionalTimeName(formData.birthHour)}
                        </span>
                      </label>
                      <select
                        name="birthHour"
                        value={formData.birthHour}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-jade"
                      >
                        <option value="unknown">모름 / 입력하지 않음</option>
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                          <option key={h} value={h}>{h}시 (대략)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2.2 Partner Information (Only for gunghap) */}
                {productKey === "gunghap" && (
                  <div className="bg-background-secondary/30 border border-[#A3845B]/50 rounded-lg p-6 space-y-4">
                    <h3 className="font-myeongjo text-base font-bold text-[#A3845B] flex items-center gap-2 border-b border-[#A3845B]/30 pb-2">
                      <Heart className="w-4 h-4 text-red-600 animate-pulse" />
                      상대방 정보 (연인/배우자)
                    </h3>

                    <div className="space-y-4">
                      {/* Name & Gender */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">상대방 성명</label>
                          <input
                            type="text"
                            name="partnerName"
                            value={formData.partnerName}
                            onChange={handleInputChange}
                            placeholder="상대방 한글 실명 입력"
                            className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-brass"
                          />
                        </div>
                        <div>
                          <span className="block text-xs font-semibold text-foreground mb-1.5">상대방 성별</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, partnerGender: "female" }))}
                              className={`py-2 text-xs font-medium rounded border transition-colors ${
                                formData.partnerGender === "female"
                                  ? "bg-brass text-background border-brass"
                                  : "bg-background text-foreground-muted border-border-custom hover:border-brass/50"
                              }`}
                            >
                              여성 (女性)
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, partnerGender: "male" }))}
                              className={`py-2 text-xs font-medium rounded border transition-colors ${
                                formData.partnerGender === "male"
                                  ? "bg-brass text-background border-brass"
                                  : "bg-background text-foreground-muted border-border-custom hover:border-brass/50"
                              }`}
                            >
                              남성 (男性)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Type */}
                      <div>
                        <span className="block text-xs font-semibold text-foreground mb-1.5">상대방 역법 종류</span>
                        <div className="grid grid-cols-3 gap-2">
                          {["solar", "lunar", "lunar-leap"].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, partnerCalendarType: type }))}
                              className={`py-2 text-xs font-medium rounded border transition-colors ${
                                formData.partnerCalendarType === type
                                  ? "bg-jade text-background border-jade"
                                  : "bg-background text-foreground-muted border-border-custom hover:border-jade/50"
                              }`}
                            >
                              {type === "solar" && "양력 (陽曆)"}
                              {type === "lunar" && "음력 평달 (陰曆)"}
                              {type === "lunar-leap" && "음력 윤달 (閏月)"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date Selector Inputs */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] text-foreground-muted mb-1">상대방 출생년도</label>
                          <select
                            name="partnerBirthYear"
                            value={formData.partnerBirthYear}
                            onChange={handleInputChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                          >
                            {Array.from({ length: 90 }, (_, i) => 2026 - i).map((yr) => (
                              <option key={yr} value={yr}>{yr}년</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-foreground-muted mb-1">상대방 출생월</label>
                          <select
                            name="partnerBirthMonth"
                            value={formData.partnerBirthMonth}
                            onChange={handleInputChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                          >
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                              <option key={m} value={m}>{m}월</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-foreground-muted mb-1">상대방 출생일</label>
                          <select
                            name="partnerBirthDay"
                            value={formData.partnerBirthDay}
                            onChange={handleInputChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-2 text-sm focus:outline-none focus:border-jade"
                          >
                            {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
                              <option key={d} value={d}>{d}일</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Birth Hour */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
                          <span>상대방 태어난 시간</span>
                          <span className="text-[10px] text-brass-dark font-normal">
                            * {getTraditionalTimeName(formData.partnerBirthHour)}
                          </span>
                        </label>
                        <select
                          name="partnerBirthHour"
                          value={formData.partnerBirthHour}
                          onChange={handleInputChange}
                          className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-jade"
                        >
                          <option value="unknown">모름 / 입력하지 않음</option>
                          {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map((h) => (
                            <option key={h} value={h}>{h}시 (대략)</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2.5 Tarot Card Selector (Only for Tarot) */}
                {productKey === "tarot" && (
                  <div className="bg-background-secondary/30 border-2 border-brass/50 rounded-lg p-6 space-y-4">
                    <h3 className="font-myeongjo text-base font-bold text-[#A3845B] flex items-center gap-2 border-b border-border-custom/50 pb-2">
                      <Sparkles className="w-4 h-4 text-brass" />
                      🔮 [타로 카드 선택] 상대방의 속마음 읽기
                    </h3>
                    <p className="text-xs text-foreground-muted leading-relaxed font-light">
                      상대방의 얼굴이나 이름을 마음속으로 깊이 떠올리며, 아래 뒷면이 보이는 카드들 중 직관적으로 가장 끌리는 <strong>3장의 카드</strong>를 순서대로 하나씩 터치해 주세요.
                    </p>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-2">
                      {tarotDeck.map((card) => {
                        const isSelected = selectedCards.includes(card.id);
                        const order = selectedCards.indexOf(card.id) + 1;
                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCards(prev => prev.filter(c => c !== card.id));
                              } else {
                                if (selectedCards.length >= 3) {
                                  alert("이미 3장의 카드를 모두 선택하셨습니다.");
                                  return;
                                }
                                setSelectedCards(prev => [...prev, card.id]);
                              }
                            }}
                            style={!isSelected ? { backgroundImage: "url('/tarot/card_back.png')", backgroundSize: "cover", backgroundPosition: "center" } : {}}
                            className={`aspect-[2/3.5] border-2 rounded-lg flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                              isSelected 
                                ? "border-[#A3845B] bg-[#A3845B]/15 -translate-y-2 shadow-lg"
                                : "border-border-custom hover:border-[#A3845B]/50 hover:-translate-y-1"
                            }`}
                          >
                            <div className="absolute inset-1 border border-dashed border-[#A3845B]/25 rounded flex items-center justify-center">
                              {isSelected ? (
                                <span className="bg-[#A3845B] text-background text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                                  {order}
                                </span>
                              ) : (
                                <div className="absolute inset-0 bg-[#2C2621]/10 hover:bg-transparent transition-colors" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedCards.length > 0 && (
                      <div className="flex justify-between items-center text-xs pt-2">
                        <span className="text-foreground-muted">
                          선택 순서:{" "}
                          <strong className="text-[#A3845B]">
                            {selectedCards.map(c => tarotDeck.find(d => d.id === c)?.name).join(" → ")}
                          </strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCards([])}
                          className="text-red-500 hover:underline text-[11px]"
                        >
                          선택 초기화
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Delivery and Context */}
                <div className="bg-background-secondary/30 border border-border-custom rounded-lg p-6 space-y-4">
                  <h3 className="font-myeongjo text-base font-bold text-foreground flex items-center gap-2 border-b border-border-custom/50 pb-2">
                    <Mail className="w-4 h-4 text-brass" />
                    수신 정보 & 고민 작성
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1.5">결과 수신 이메일</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@hyeandang.com"
                        className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-brass"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-foreground mb-1.5">연락처 (안내 문자용)</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="010-0000-0000"
                        className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-brass"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      {productKey === "dream" ? "꿈의 핵심 주제" : "가장 고민인 분야"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(productKey === "wealth"
                        ? [
                            { key: "business", label: "사업 / 운영" },
                            { key: "startup", label: "창업 / 부업" },
                            { key: "trade", label: "장사 / 유통" },
                            { key: "facility", label: "설비투자 / 확장" },
                            { key: "general", label: "종합 / 기타" },
                          ]
                        : productKey === "dream"
                        ? [
                            { key: "animal_plant", label: "학동물 / 식물" },
                            { key: "people_family", label: "인물 / 가족" },
                            { key: "death_blood", label: "죽음 / 피" },
                            { key: "nature_weather", label: "자연 / 날씨" },
                            { key: "wealth_jewel", label: "재물 / 보석" },
                            { key: "general", label: "일반 / 기타" },
                          ]
                        : [
                            { key: "love", label: "연애 / 속마음" },
                            { key: "career", label: "직장 / 이직" },
                            { key: "wealth", label: "금전 / 투자" },
                            { key: "exam", label: "학업 / 시험" },
                            { key: "general", label: "종합 / 기타" },
                          ]
                      ).map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, worryCategory: cat.key }))}
                          className={`py-2 text-xs font-medium rounded border transition-colors ${
                            formData.worryCategory === cat.key
                              ? "bg-brass text-background border-brass"
                              : "bg-background text-foreground-muted border-border-custom hover:border-brass/50"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="worryText" className="block text-xs font-semibold text-foreground">
                        {productKey === "dream"
                          ? "꿈의 구체적인 내용 서술 (최대 500자)"
                          : "구체적인 고민이나 현재 겪고 계신 상태 (최대 500자)"}
                      </label>
                      <span className="text-[10px] text-foreground-muted font-normal">{charCount} / 500자</span>
                    </div>
                    <textarea
                      id="worryText"
                      name="worryText"
                      value={formData.worryText}
                      onChange={handleInputChange}
                      maxLength={500}
                      rows={5}
                      placeholder={productKey === "dream"
                        ? "예시: 어젯밤에 검은 덕치마가 나타나 나를 품어안는 꿈을 꽜었습니다. 덕치가 새끼하게 움직이지는 않았고 오히려 저를 감싸 안아주는 듯한 느낌이었습니다. 불로 타오르는 산과 수력이 보이는 꿈이었습니다. 이 꿈과 요즘 직장 이직 문제가 어떤 관계인지 알고 싶습니다..."
                        : "예시: 다니고 있는 회사에서 올해 이직을 준비하고 있는데, 언제가 좋을지, 제 사주에 어떤 기운이 도움이 되는지 알려주세요. 또한 대인관계로 인한 스트레스가 많습니다..."}
                      className="w-full bg-background border border-border-custom rounded px-3 py-2 text-sm focus:outline-none focus:border-brass font-light leading-relaxed resize-none"
                      required
                    ></textarea>
                  </div>
                </div>

                {/* Submitting button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-jade text-background rounded-lg font-myeongjo text-lg font-bold shadow-md hover:bg-jade-dark hover:shadow-lg transition-all cursor-pointer"
                >
                  {reportGrade === "free" ? "확인하기" : "기입 완료 및 결제 진행"}
                </button>
              </form>
            </div>

            {/* Right side: Product selection and invoice */}
            <div className="space-y-6">
              {reportGrade !== "free" ? (
                <div className="border border-border-custom bg-background rounded-lg p-6 sticky top-24">
                  <h3 className="font-myeongjo text-lg font-bold text-foreground mb-4 pb-2 border-b border-border-custom">
                    선택된 상품 보감
                  </h3>

                  {/* Micro selector */}
                  <div className="space-y-2.5 mb-6">
                    {Object.entries(products).map(([key, value]) => {
                      const isSelected = productKey === key;
                      const showGradeSelector = isSelected && (key === "saju" || key === "newyear" || key === "tojeong");
                      return (
                        <div key={key} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(key)}
                            className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                              isSelected
                                ? "border-brass bg-brass/5"
                                : "border-border-custom bg-background hover:bg-background-secondary/30"
                            }`}
                          >
                            <div>
                              <span className="text-[10px] text-foreground-muted block font-light">{value.category}</span>
                              <span className="text-sm font-bold text-foreground">{value.title}</span>
                            </div>
                            <div className="text-right">
                              {value.originalPrice && (
                                <span className="text-[10px] text-foreground-muted line-through block">
                                  {value.originalPrice.toLocaleString()}원
                                </span>
                              )}
                              <span className="text-sm font-bold text-brass">
                                {value.price.toLocaleString()}원
                              </span>
                            </div>
                          </button>

                          {/* Report Grade Selector inline under selected saju/newyear product */}
                          {showGradeSelector && (
                            <div className="p-3.5 bg-background-secondary/40 border border-border-custom/50 rounded-lg space-y-2.5 mt-1.5 transition-all">
                              <span className="text-[10px] font-semibold text-foreground block tracking-wider">리포트 등급 선택</span>
                              <div className="space-y-2">
                                <button
                                  type="button"
                                  onClick={() => setReportGrade("premium")}
                                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                                    reportGrade === "premium"
                                      ? "border-brass bg-brass/10"
                                      : "border-border-custom bg-background hover:bg-background-secondary/20"
                                  }`}
                                >
                                  <div>
                                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                      ✨ 고급 리포트 <span className="text-[8px] bg-brass/10 text-brass px-1.5 py-0.5 rounded font-normal">기본</span>
                                    </span>
                                    <span className="text-[9px] text-foreground-muted block mt-0.5 font-light">
                                      사주원국, 오행분석, 평생운 등 종합 분석
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-foreground-muted">추가금 없음</span>
                                </button>

                                {productKey !== "tojeong" && (
                                <button
                                  type="button"
                                  onClick={() => setReportGrade("deep")}
                                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                                    reportGrade === "deep"
                                      ? "border-[#5F7A68] bg-[#5F7A68]/10"
                                      : "border-border-custom bg-background hover:bg-background-secondary/20"
                                  }`}
                                >
                                  <div>
                                    <span className="text-[11px] font-bold text-[#5F7A68] flex items-center gap-1">
                                      👑 심화 리포트 <span className="text-[8px] bg-[#5F7A68]/15 text-[#5F7A68] px-1.5 py-0.5 rounded font-normal">추천</span>
                                    </span>
                                    <span className="text-[9px] text-foreground-muted block mt-0.5 font-light">
                                      고급 리포트 전체 + 신년운세 + 용신/대운 + 질문 심화 풀이
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-[#5F7A68]">+15,000원</span>
                                </button>
                              )}

                                <button
                                  type="button"
                                  onClick={() => setReportGrade("sms")}
                                  className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                                    reportGrade === "sms"
                                      ? "border-gray-500 bg-gray-500/10"
                                      : "border-border-custom bg-background hover:bg-background-secondary/20"
                                  }`}
                                >
                                  <div>
                                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                      💬 문자메시지 요약
                                    </span>
                                    <span className="text-[9px] text-foreground-muted block mt-0.5 font-light">
                                      핵심 요약본 모바일 문자/카카오톡 전송
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-red-500">-20,000원</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Info block */}
                  <div className="bg-background-secondary/60 rounded-lg p-4 mb-6 border border-border-custom/50">
                    <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Scroll className="w-3.5 h-3.5 text-brass" />
                      제공 품목 안내
                    </h4>
                    <p className="text-xs text-foreground-muted leading-relaxed font-light mb-2">
                      {productKey === "today"
                        ? "모바일 화면에 최적화된 맞춤형 오늘의 대길흉/오행 수호 비법 요약 문자 즉시 발송"
                        : (productKey === "saju" || productKey === "newyear" || productKey === "tojeong")
                        ? (reportGrade === "sms" 
                          ? "모바일 화면에 최적화된 핵심 한 줄 요약 및 핵심 개운 처방 문자 발송"
                          : reportGrade === "deep"
                          ? `${activeProduct.desc} 및 2026 신년운세 상세, 용신 해석, 대운 흐름 분석과 질문 3가지 심화 답변 제공`
                          : activeProduct.desc)
                        : activeProduct.desc}
                    </p>
                    <ul className="text-[10px] text-foreground-muted space-y-1 font-light border-t border-border-custom/50 pt-2">
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-jade" />{" "}
                        {productKey === "today" || ((productKey === "saju" || productKey === "newyear" || productKey === "tojeong") && reportGrade === "sms")
                          ? "모바일 알림톡/LMS로 즉시 발송" 
                          : "이메일로 HTML + PDF 발송"}
                      </li>
                      <li className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-jade" /> 5~15분 내외 초고속 분석 및 발송
                      </li>
                    </ul>
                  </div>

                  {/* Total invoice details */}
                  {(() => {
                    const base = activeProduct.price;
                    const finalPrice = (productKey === "saju" || productKey === "newyear" || productKey === "tojeong")
                      ? (reportGrade === "deep" 
                        ? base + 15000 
                        : reportGrade === "sms" 
                        ? Math.max(5000, base - 20000) 
                        : base)
                      : base;
                    return (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-xs text-foreground-muted">
                          <span>분석 대행 수수료</span>
                          <span>{Math.round(finalPrice * 0.9).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between text-xs text-foreground-muted">
                          <span>부가세(10%)</span>
                          <span>{Math.round(finalPrice * 0.1).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-border-custom pt-3 mt-1.5">
                          <span className="text-sm font-bold text-foreground font-myeongjo">최종 결제 금액</span>
                          <span className="text-lg font-bold text-brass">
                            {finalPrice.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted bg-background-secondary/30 p-2.5 rounded border border-border-custom/30">
                    <ShieldCheck className="w-4 h-4 text-jade shrink-0" />
                    <span>혜안당은 포트원 통합 결제 모듈을 통하여 암호화된 금융 보안 결제를 지원합니다.</span>
                  </div>
                </div>
              ) : (
                /* 무료 체험판 안내 카드 (전통적인 이탈 방지용 단아한 카드 디자인) */
                <div className="border-2 border-jade bg-[#F9F8F6] rounded-xl p-6 sticky top-24 animate-fadeIn space-y-6 relative overflow-hidden shadow-md">
                  {/* Decorative traditional motifs */}
                  <div className="absolute top-2 left-2 text-jade/25 text-xs">卍</div>
                  <div className="absolute top-2 right-2 text-jade/25 text-xs">卍</div>
                  <div className="absolute bottom-2 left-2 text-jade/25 text-xs">卍</div>
                  <div className="absolute bottom-2 right-2 text-jade/25 text-xs">卍</div>

                  <div className="text-center pb-2.5 border-b border-border-custom/60">
                    <span className="text-[10px] text-jade font-bold tracking-widest block mb-1">무료 분석</span>
                    <h3 className="font-myeongjo text-base font-bold text-foreground">
                      🎁 혜안당 무료 사주 보감
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs font-light leading-relaxed">
                    <p className="text-foreground-muted text-center font-traditional">
                      귀하의 타고난 생년월일시 오행 기류를 정밀 분석하여, 사주 원국과 등급 및 희소성 분석 결과를 <strong>일체의 카드 등록이나 비용 없이</strong> 즉시 공개해 드립니다.
                    </p>

                    <div className="border-t border-border-custom/60 pt-4 space-y-2.5">
                      <span className="font-bold text-foreground block">✔ 무료 제공 범위:</span>
                      <ul className="space-y-2 pl-1">
                        <li className="flex gap-2 items-start text-foreground-muted">
                          <span className="text-jade font-bold">1.</span>
                          <span><strong>사주 팔자 명식 원국 분석</strong></span>
                        </li>
                        <li className="flex gap-2 items-start text-foreground-muted">
                          <span className="text-jade font-bold">2.</span>
                          <span><strong>오행 에너지 분포 및 조화도</strong></span>
                        </li>
                        <li className="flex gap-2 items-start text-foreground-muted">
                          <span className="text-jade font-bold">3.</span>
                          <span><strong>내 사주 등급(1~7등급) 및 희소성 판정</strong></span>
                        </li>
                        <li className="flex gap-2 items-start text-foreground-muted">
                          <span className="text-jade font-bold">4.</span>
                          <span><strong>타고난 핵심 성향 해설</strong></span>
                        </li>
                      </ul>
                    </div>

                    <div className="border-t border-border-custom/60 pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setReportGrade("premium")}
                        className="text-xs text-brass font-bold hover:underline cursor-pointer"
                      >
                        ← 정통 정밀 사주 보감 신청하기
                      </button>
                    </div>

                    <div className="border-t border-border-custom/60 pt-4 text-center text-[10px] text-foreground-muted/70">
                      💡 정보 기입을 완료하고 하단의 <strong className="text-jade">"내 사주 등급 확인하기"</strong> 버튼을 누르면 즉시 사주 분석이 개시됩니다.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Paying (Mockup PortOne gateway interface) */}
        {step === "paying" && (
          <div className="max-w-md mx-auto border border-border-custom bg-background-secondary/50 rounded-lg p-8 shadow-md text-center my-12">
            {/* Mockup Traditional styled payment gateway frame */}
            <div className="border border-border-custom bg-background rounded-lg p-6 mb-6">
              <div className="bg-brass/10 border-b border-border-custom p-3 -mx-6 -mt-6 rounded-t-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-brass tracking-wider">포트원 통합 결제창</span>
                <span className="text-[10px] text-foreground-muted">PortOne Secure Pay</span>
              </div>

              <div className="py-6 space-y-4">
                <div>
                  <span className="text-[10px] text-foreground-muted block">가맹점명</span>
                  <span className="text-base font-bold text-foreground">혜안당 (慧眼堂)</span>
                </div>
                {(() => {
                  const base = activeProduct.price;
                  const finalPrice = (productKey === "saju" || productKey === "newyear" || productKey === "tojeong")
                    ? (reportGrade === "deep" 
                      ? base + 15000 
                      : reportGrade === "sms" 
                      ? Math.max(5000, base - 10000) 
                      : base)
                    : base;
                  return (
                    <>
                      <div>
                        <span className="text-[10px] text-foreground-muted block">상품명</span>
                        <span className="text-sm text-foreground">
                          {activeProduct.title} {(productKey === "saju" || productKey === "newyear" || productKey === "tojeong") && `(${reportGrade === "premium" ? "고급 리포트" : reportGrade === "deep" ? "심화 리포트" : (productKey === "tojeong" ? "문자메시지요약" : "문자 요약")})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-foreground-muted block">결제 금액</span>
                        <span className="text-xl font-bold text-brass">{finalPrice.toLocaleString()}원</span>
                      </div>
                    </>
                  );
                })()}

                {/* Options of paying */}
                <div className="border-t border-border-custom pt-4 text-left">
                  <span className="text-xs font-semibold text-foreground block mb-2">결제수단 선택</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="py-2.5 text-xs text-center border border-brass bg-brass/5 rounded hover:bg-brass/10 font-medium">
                      신용/체크카드
                    </button>
                    <button type="button" className="py-2.5 text-xs text-center border border-border-custom rounded hover:border-brass font-medium">
                      카카오페이
                    </button>
                    <button type="button" className="py-2.5 text-xs text-center border border-border-custom rounded hover:border-brass font-medium">
                      네이버페이
                    </button>
                    <button type="button" className="py-2.5 text-xs text-center border border-border-custom rounded hover:border-brass font-medium">
                      토스페이
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 py-3 border border-border-custom hover:bg-background rounded text-sm text-foreground-muted transition-colors"
              >
                취소하기
              </button>
              <button
                type="button"
                onClick={handlePortonePayment}
                className="flex-1 py-3 bg-jade text-background rounded text-sm font-semibold hover:bg-jade-dark shadow-sm transition-all"
              >
                결제 및 승인 진행
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (() => {
          const sajuInfo = getGanjiTable(
            parseInt(formData.birthYear) || 1995,
            parseInt(formData.birthMonth) || 5,
            parseInt(formData.birthDay) || 15,
            formData.birthHour
          );
          const dayStem = sajuInfo.day.stem;
          const dayBranch = sajuInfo.day.branch;
          const iljuHanja = dayStem + dayBranch;

          // 진행 단계에 따른 로테이션 텍스트
          let statusText = "일주 분석 중";
          if (progress > 85) {
            statusText = "신살 분석 중";
          } else if (progress > 65) {
            statusText = "대운 분석 중";
          } else if (progress > 35) {
            statusText = "격국 분석 중";
          }

          const logSteps = [
            { threshold: 8, text: `${formData.name || "의뢰인"}님의 사주팔자 8글자 해석 중...` },
            { threshold: 18, text: "타고난 성격과 기질 분석 중..." },
            { threshold: 28, text: "일간의 핵심 에너지 수집 완료" },
            { threshold: 38, text: "십성 구조에서 특이 패턴 감시..." },
            { threshold: 48, text: `${formData.name || "의뢰인"}님의 자산 구조 분석 중...` },
            { threshold: 58, text: "돈이 들어오는 경로 추적 중..." },
            { threshold: 68, text: "자산 조율 포인트 2건 포착" },
            { threshold: 76, text: `${formData.name || "의뢰인"}님의 감정 속성 계산 중...` },
            { threshold: 84, text: "감정 속성 8개 합성 완료" },
            { threshold: 90, text: "대운/세운 타이밍 교차 분석 중..." },
            { threshold: 95, text: "2026년 핵심 경고판 1건 포착" },
            { threshold: 99, text: "숨겨진 귀인 정보 수집 완료" }
          ];

          return (
            <div className="max-w-md mx-auto border border-[#E2DDD5] bg-[#F9F8F6] rounded-xl p-8 shadow-lg text-center my-8 font-traditional relative overflow-hidden">
              {/* Decorative corner borders */}
              <div className="absolute top-3 left-3 text-brass/30 text-xs">卍</div>
              <div className="absolute top-3 right-3 text-brass/30 text-xs">卍</div>
              <div className="absolute bottom-3 left-3 text-brass/30 text-xs">卍</div>
              <div className="absolute bottom-3 right-3 text-brass/30 text-xs">卍</div>

              {/* Title */}
              <div className="text-[11px] text-[#A3845B] tracking-[0.2em] font-medium block mb-8 font-myeongjo">
                전기운 · 정통사주
              </div>

              {/* Huge Ilju Hanja */}
              <div className="font-myeongjo text-7xl md:text-8xl font-bold tracking-widest text-[#1A1A1A] mb-2 select-none">
                {iljuHanja}
              </div>

              {/* Status text */}
              <div className="text-[11px] text-gray-500 font-light block tracking-widest animate-pulse mb-10">
                {statusText}
              </div>

              {/* Progress bar info */}
              <div className="space-y-2 mb-8">
                <div className="flex justify-between items-baseline text-xs text-[#2C2C2C] font-semibold">
                  <span className="font-myeongjo text-[11px] tracking-wider text-[#A3845B]">분석 진행도</span>
                  <span className="font-sans text-sm text-[#8B221E] font-bold">{progress}%</span>
                </div>
                {/* Custom Red Progress Bar */}
                <div className="w-full h-[2.5px] bg-[#E2DDD5] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8B221E] transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist logs */}
              <div className="space-y-3.5 text-left border-t border-[#E2DDD5]/60 pt-6 max-h-[360px] overflow-y-auto pr-1">
                {logSteps.map((item, idx) => {
                  const isDone = progress >= item.threshold;
                  const isCurrent = !isDone && (idx === 0 || progress >= logSteps[idx - 1].threshold);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-start gap-3.5 text-[11px] font-traditional transition-all duration-300 ${
                        isDone 
                          ? "text-[#A3845B]/60 font-medium line-through decoration-[#A3845B]/30" 
                          : isCurrent 
                          ? "text-[#8B221E] font-bold" 
                          : "text-gray-400 font-light"
                      }`}
                    >
                      {/* Check markers */}
                      {isDone ? (
                        <span className="text-[#A3845B] font-bold text-xs shrink-0 select-none">✓</span>
                      ) : isCurrent ? (
                        <span className="text-[#8B221E] animate-pulse shrink-0 select-none font-bold text-xs">●</span>
                      ) : (
                        <span className="text-gray-300 font-light text-xs shrink-0 select-none">○</span>
                      )}
                      
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Step: Success */}
        {step === "success" && (
          <div className="max-w-md mx-auto border border-border-custom bg-background rounded-lg p-8 text-center my-12 relative">
            <div className="w-16 h-16 bg-jade/10 text-jade rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>

            <h2 className="font-myeongjo text-2xl font-bold text-foreground mb-3">
              혜안당 보감 발송 준비 완료!
            </h2>
            
            <div className="bg-background-secondary/50 border border-border-custom/50 rounded-lg p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-foreground-muted">수신인</span>
                <span className="font-semibold text-foreground">{formData.name} 님 ({formData.gender === "female" ? "여" : "남"})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-foreground-muted">신청 상품</span>
                <span className="font-semibold text-foreground">
                  {activeProduct.title} {((productKey === "saju" || productKey === "newyear" || productKey === "tojeong") && reportGrade !== "sms") && `(${reportGrade === "premium" ? "고급 리포트" : "심화 리포트"})`}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-foreground-muted">수신 방식</span>
                <span className="font-semibold text-foreground">
                  {productKey === "today" || ((productKey === "saju" || productKey === "newyear" || productKey === "tojeong") && reportGrade === "sms") ? `문자메시지 (${formData.phone})` : `이메일 (${formData.email})`}
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-border-custom/40 pt-2 mt-2">
                <span className="text-foreground-muted">사주 간지</span>
                <span className="font-bold text-foreground">己亥年 己巳月 甲子日 (예시)</span>
              </div>
            </div>

            <p className="text-sm text-foreground-muted leading-relaxed font-light mb-8">
              입력하신 사주 명식에 대한 오늘의 역학 분석과 알림 문자 생성 완료되었습니다. 실제 운영 시 <strong>{productKey === "today" ? formData.phone : formData.email}</strong>로 자동 발송 처리됩니다.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/result?name=${encodeURIComponent(formData.name || "이지혜")}&gender=${formData.gender}&type=${productKey}&calendar=${formData.calendarType}&year=${formData.birthYear}&month=${formData.birthMonth}&day=${formData.birthDay}&hour=${encodeURIComponent(formData.birthHour)}&worryCategory=${formData.worryCategory}&worryText=${encodeURIComponent(formData.worryText || "오늘의 운세")}&cards=${selectedCards.join(",")}&partnerName=${encodeURIComponent(formData.partnerName)}&partnerGender=${formData.partnerGender}&partnerCalendar=${formData.partnerCalendarType}&partnerYear=${formData.partnerBirthYear}&partnerMonth=${formData.partnerBirthMonth}&partnerDay=${formData.partnerBirthDay}&partnerHour=${encodeURIComponent(formData.partnerBirthHour)}&reportGrade=${productKey === "today" ? "sms" : (productKey === "saju" || productKey === "newyear" || productKey === "tojeong") ? reportGrade : "premium"}`}
                className="w-full py-3 bg-jade text-background rounded font-semibold text-sm hover:bg-jade-dark transition-all block text-center"
              >
                생성된 결과서 미리보기 (샘플)
              </Link>



              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  // Reset worry text and name
                  setFormData(prev => ({ ...prev, name: "", worryText: "" }));
                  setCharCount(0);
                }}
                className="w-full py-3 bg-brass text-background rounded font-semibold text-sm hover:bg-brass-dark transition-all"
              >
                처음으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border-custom py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-foreground-muted font-light">
          © 2026 혜안당. All rights reserved. 본 프로젝트는 혜안당 사주/타로 서비스 개발을 위한 데모 페이지입니다.
        </div>
      </footer>
    </div>
  );
}

export default function InputPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-myeongjo text-lg text-brass animate-pulse">혜안당 불러오는 중...</div>
      </div>
    }>
      <InputFormContent />
    </Suspense>
  );
}
