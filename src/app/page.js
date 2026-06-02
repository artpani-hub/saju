"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Sparkles, Mail, ArrowRight, Scroll, HelpCircle, Calendar, User, Phone, Clock, Heart, Coins, Activity } from "lucide-react";
import { getCumulativeCount, getTodayCount, getActiveUsers } from "../utils/counter";

const ZODIAC_LIST = [
  { name: "쥐띠", hanja: "子", emoji: "🐭" },
  { name: "소띠", hanja: "丑", emoji: "🐮" },
  { name: "호랑이띠", hanja: "寅", emoji: "🐯" },
  { name: "토끼띠", hanja: "卯", emoji: "🐰" },
  { name: "용띠", hanja: "辰", emoji: "🐲" },
  { name: "뱀띠", hanja: "巳", emoji: "🐍" },
  { name: "말띠", hanja: "午", emoji: "🐴" },
  { name: "양띠", hanja: "未", emoji: "🐑" },
  { name: "원숭이띠", hanja: "申", emoji: "🐵" },
  { name: "닭띠", hanja: "酉", emoji: "🐔" },
  { name: "개띠", hanja: "戌", emoji: "🐶" },
  { name: "돼지띠", hanja: "亥", emoji: "🐷" }
];

const YEARS = Array.from({ length: 97 }, (_, i) => 2026 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = [
  "모름",
  "子 (23:30 ~ 01:29)",
  "丑 (01:30 ~ 03:29)",
  "寅 (03:30 ~ 05:29)",
  "卯 (05:30 ~ 07:29)",
  "辰 (07:30 ~ 09:29)",
  "巳 (09:30 ~ 11:29)",
  "午 (11:30 ~ 13:29)",
  "未 (13:30 ~ 15:29)",
  "申 (15:30 ~ 17:29)",
  "酉 (17:30 ~ 19:29)",
  "戌 (19:30 ~ 21:29)",
  "亥 (21:30 ~ 23:29)"
];

const getZodiacFortune = (zodiacName, index) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const seed = (year * 13 + month * 7 + day * 3 + index * 17) % 10;
  const scoreSeed = (year * 7 + month * 13 + day * 5 + index * 23) % 5;
  const moneySeed = (year * 9 + month * 11 + day * 7 + index * 19) % 5;
  const loveSeed = (year * 11 + month * 3 + day * 13 + index * 29) % 5;
  
  const fortunes = [
    "노력해 온 일이 서서히 결실을 맺는 하루입니다. 주변 사람들의 도움으로 원하던 결과를 얻게 되니 감사한 마음을 표현해 보세요.",
    "사소한 오해로 갈등이 생길 수 있으니 감정적인 대립은 피하는 것이 좋습니다. 한 발 물러서서 생각하면 지혜로운 해법이 보입니다.",
    "예상치 못한 기쁜 소식이 찾아옵니다. 금전이나 일자리 면에서 긍정적인 제안을 받게 되니 적극적으로 검토해 보세요.",
    "기운이 솟구치고 자신감이 넘치는 날입니다. 미뤄왔던 계획이나 어려운 과제를 오늘 시작하면 수월하게 풀릴 것입니다.",
    "몸과 마음이 다소 지칠 수 있으니 휴식이 필요한 때입니다. 무리한 약속이나 과도한 업무는 피하고 내실을 다지세요.",
    "새로운 인연과의 만남이 기대되는 하루입니다. 대인관계 운이 상승하니 모임이나 사교 활동에 활발히 참여해 보세요.",
    "선택의 기로에서 고민이 깊어지는 날입니다. 서두르지 말고 신뢰할 수 있는 멘토나 가족에게 조언을 구하면 큰 도움이 됩니다.",
    "금전 운이 상승하는 좋은 흐름입니다. 뜻밖의 이익이 생기거나 투자한 곳에서 좋은 소식이 들려올 수 있습니다.",
    "가까운 사람과의 소통이 중요한 날입니다. 오해가 있었다면 오늘 대화로 풀어보세요. 진심은 언제나 통하게 되어 있습니다.",
    "창의적인 아이디어가 번뜩이는 날입니다. 직장이나 학업에서 본인의 능력을 인정받을 기회가 오니 자신 있게 의견을 개시하세요."
  ];

  const colors = ["청색", "황색", "백색", "흑색", "적색", "보라색", "녹색", "금색", "은색", "주황색"];
  const tips = [
    "동쪽 방향으로 가벼운 산책을 해보세요.",
    "따뜻한 차 한 잔을 마시며 생각을 정리하세요.",
    "약속 시간보다 10분 먼저 도착하도록 하세요.",
    "밝은 톤의 옷을 입으면 긍정적인 에너지를 줍니다.",
    "오늘만큼은 SNS 사용 시간을 줄여보세요.",
    "주변 자리를 깨끗이 정리 정돈하는 것이 좋습니다.",
    "오랜만에 지인에게 안부 전화를 걸어보세요.",
    "중요한 결정을 하기 전에 심호흡을 크게 세 번 하세요.",
    "견과류나 건강한 간식을 챙겨 먹으며 에너지를 보충하세요.",
    "길에서 마주치는 사람들에게 가벼운 미소를 건네보세요."
  ];

  const overallScore = 60 + scoreSeed * 10;
  const moneyScore = 60 + moneySeed * 10;
  const loveScore = 60 + loveSeed * 10;
  
  return {
    overallScore,
    moneyScore,
    loveScore,
    desc: fortunes[seed],
    color: colors[(seed + index) % colors.length],
    number: (seed * 3 + index * 7) % 10,
    tip: tips[(seed + index * 2) % tips.length]
  };
};

const getZodiacColorHex = (colorName) => {
  const mapping = {
    "청색": "#2b6cb0",
    "황색": "#d69e2e",
    "백색": "#e2e8f0",
    "흑색": "#1a202c",
    "적색": "#c53030",
    "보라색": "#6b46c1",
    "녹색": "#2f855a",
    "금색": "#ecc94b",
    "은색": "#cbd5e0",
    "주황색": "#dd6b20"
  };
  return mapping[colorName] || "#cbd5e0";
};

const renderStars = (score) => {
  const rating = score / 20;
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  
  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={i} className="text-sm">★</span>
      ))}
      {hasHalf && <span className="text-sm">☆</span>}
      {Array.from({ length: 5 - Math.ceil(rating) }).map((_, i) => (
        <span key={i} className="text-sm text-gray-300">★</span>
      ))}
      <span className="ml-1.5 text-xs text-foreground-muted font-medium">{score}점</span>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("free");
  const [selectedZodiacIndex, setSelectedZodiacIndex] = useState(null);
  const [zodiacFortune, setZodiacFortune] = useState(null);
  const [cumulativeCount, setCumulativeCount] = useState(14820);
  const [todayCount, setTodayCount] = useState(412);
  const [activeUsers, setActiveUsers] = useState(18);

  useEffect(() => {
    setCumulativeCount(getCumulativeCount());
    setTodayCount(getTodayCount());
    setActiveUsers(getActiveUsers());
    
    const timer = setInterval(() => {
      setCumulativeCount(getCumulativeCount());
      setTodayCount(getTodayCount());
      setActiveUsers(getActiveUsers());
    }, 10000);
    
    return () => clearInterval(timer);
  }, []);
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "male",
    calendarType: "solar",
    birthYear: "1995",
    birthMonth: "5",
    birthDay: "15",
    birthHour: "모름",
    phone: ""
  });
  
  const [formError, setFormError] = useState("");

  const handleSubmitPremium = () => {
    if (!formData.name.trim()) {
      setFormError("이름을 입력해 주세요.");
      return;
    }
    if (formData.name.trim().length < 2) {
      setFormError("이름은 최소 2자 이상 입력해 주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("휴대폰 번호를 입력해 주세요.");
      return;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setFormError("올바른 휴대폰 번호를 입력해 주세요.");
      return;
    }
    
    setFormError("");
    
    const query = new URLSearchParams({
      product: "today",
      name: formData.name,
      gender: formData.gender,
      calendar: formData.calendarType,
      year: formData.birthYear,
      month: formData.birthMonth,
      day: formData.birthDay,
      hour: formData.birthHour,
      phone: formData.phone
    }).toString();
    
    router.push(`/input?${query}`);
  };

  return (
    <div className="flex flex-col min-h-screen hyeandang-traditional-bg">
      {/* Header */}
      <header className="border-b border-border-custom bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* Logo Medallion (SVG) */}
            <svg width="32" height="32" viewBox="0 0 100 100" className="text-brass">
              <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
              <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="4" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="5" />
              <path d="M38 50 Q50 30 62 50 Q50 70 38 50" fill="none" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="6" fill="currentColor" />
            </svg>
            <span className="font-myeongjo text-xl font-bold tracking-widest text-foreground">
              慧眼堂 <span className="text-brass font-normal text-lg">혜안당</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground-muted">
            <a href="#services" className="hover:text-brass transition-colors">운세 상품</a>
            <a href="#features" className="hover:text-brass transition-colors">혜안당의 지혜</a>
            <a href="#faq" className="hover:text-brass transition-colors">자주 묻는 질문</a>
            <Link href="/admin" className="hover:text-brass transition-colors border-l border-border-custom pl-4">관리자</Link>
          </nav>
          <div>
            <Link
              href="/input?product=saju&reportGrade=free"
              className="inline-flex items-center gap-2 bg-[#8B221E] hover:bg-[#6D1B18] text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-all font-traditional"
            >
              무료 사주 보기
              <ArrowRight className="w-4 h-4 text-brass-light" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 border-b border-border-custom overflow-hidden">
        {/* Subtle traditional pattern background overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle, var(--foreground-muted) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <div className="inline-flex items-center gap-2 border border-brass/30 bg-brass/5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brass uppercase mb-6 font-gothic">
            <Sparkles className="w-3.5 h-3.5" />
            현대적으로 재해석한 전통 사주/운세 리포트
          </div>
          
          <h1 className="font-myeongjo text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.3] mb-6">
            하늘이 내린 귀하의 평생 사주첩 속<br />
            <span className="text-brass">5가지 운명의 비밀은?</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10 font-light font-traditional">
            평생의 자산 흐름과 위기의 타이밍 등, 혜안당 보감에 잠겨 있는 귀하만의 5가지 비밀 중 첫 장을 즉시 열어드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/input?product=saju&reportGrade=free"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#8B221E] hover:bg-[#6D1B18] text-white px-8 py-4 rounded-md text-base font-medium shadow-md transition-all duration-300 transform hover:-translate-y-0.5 font-traditional tracking-wider"
            >
              <Scroll className="w-5 h-5 text-brass-light" />
              내 사주 등급 확인하기 ➔
            </Link>
            <a
              href="#services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-brass/50 text-brass bg-background-secondary/50 px-8 py-4 rounded-md text-base font-medium hover:bg-background-secondary transition-all"
            >
              운세 상품 보기
            </a>
          </div>

          {/* 실시간 혜안당 보감 열람 현황 */}
          <div className="mt-12 pt-8 border-t border-border-custom/50 max-w-2xl mx-auto space-y-6">
            {/* 누적 수치 */}
            <div className="flex justify-center items-center gap-8 md:gap-16 text-center">
              <div>
                <span className="text-brass text-lg md:text-xl font-bold font-myeongjo">{activeUsers}</span>
                <span className="text-[10px] text-foreground-muted block mt-0.5">지금 열람 중</span>
              </div>
              <div className="w-px h-8 bg-border-custom/80" />
              <div>
                <span className="text-brass text-lg md:text-xl font-bold font-myeongjo">{todayCount.toLocaleString()}</span>
                <span className="text-[10px] text-foreground-muted block mt-0.5">오늘 발행</span>
              </div>
              <div className="w-px h-8 bg-border-custom/80" />
              <div>
                <span className="text-brass text-lg md:text-xl font-bold font-myeongjo">{cumulativeCount.toLocaleString()}</span>
                <span className="text-[10px] text-foreground-muted block mt-0.5">누적 보감 발행</span>
              </div>
            </div>

            {/* 실시간 리스트 (수동 스크롤 리스트) */}
            <div className="bg-background-secondary/35 border border-border-custom/50 rounded-xl p-4.5 text-left space-y-3 relative h-[155px]">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-jade border-b border-border-custom/30 pb-2 bg-[#F9F8F6]/10 z-10 relative">
                <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
                지금 보감을 열람 중인 분들
              </div>
              <div className="h-[95px] overflow-y-auto pr-1">
                <div className="space-y-2.5 w-full">
                  {[
                    { name: "김O현", title: "단비 머금은 푸른 대나무", rarity: "12.5%" },
                    { name: "박O아", title: "태산을 비추는 밤하늘의 등불", rarity: "18.2%" },
                    { name: "정O우", title: "안개 낀 강물 위의 돛배", rarity: "22.1%" },
                    { name: "이O은", title: "계곡물에 씻긴 눈부신 보석", rarity: "6.4%" },
                    { name: "송O우", title: "포근한 이불 속 공상가", rarity: "28.2%" },
                    { name: "홍O은", title: "구름 위의 산책자", rarity: "26.2%" },
                    { name: "송O린", title: "아침 안개 속 정원사", rarity: "28.5%" },
                    { name: "류O호", title: "광야를 수호하는 은빛 사자", rarity: "37.7%" },
                    { name: "최O원", title: "어둠을 가르는 푸른 깃털", rarity: "15.4%" },
                    { name: "강O호", title: "천년의 안개를 비추는 거목", rarity: "9.2%" },
                    { name: "임O서", title: "새벽 이슬 머금은 붉은 장미", rarity: "21.0%" },
                    { name: "윤O빈", title: "맑은 시냇가의 영롱한 조약돌", rarity: "14.3%" },
                    { name: "조O진", title: "대지를 품어 안은 황금빛 언덕", rarity: "17.8%" },
                    { name: "배O우", title: "거친 파도를 가르는 돛단배", rarity: "24.5%" },
                    { name: "고O아", title: "밤하늘을 수놓는 별무리", rarity: "11.1%" },
                    { name: "신O민", title: "서리 내린 강가의 흰 두루미", rarity: "8.7%" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-traditional py-1 border-b border-border-custom/10 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-foreground-muted font-medium">{item.name}</span>
                        <span className="font-bold text-foreground">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="text-[10px] text-brass bg-brass/5 px-2 py-0.5 rounded-full font-semibold border border-brass/10">희소성 {item.rarity}</span>
                        <span className="text-[10px] text-jade font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-jade" />
                          열람 중
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional Korean Frame Visual Element */}
        <div className="mt-16 max-w-lg mx-auto px-6 relative">
          <div className="border border-border-custom p-8 rounded-lg bg-background-secondary/40 shadow-sm relative">
            {/* Corner traditional decoration icons */}
            <div className="absolute top-2 left-2 text-brass/40 font-myeongjo text-xs">卍</div>
            <div className="absolute top-2 right-2 text-brass/40 font-myeongjo text-xs">卍</div>
            <div className="absolute bottom-2 left-2 text-brass/40 font-myeongjo text-xs">卍</div>
            <div className="absolute bottom-2 right-2 text-brass/40 font-myeongjo text-xs">卍</div>
            
            <div className="text-center font-myeongjo">
              <span className="text-xs text-brass tracking-widest block mb-1">慧眼堂 寶鑑</span>
              <h3 className="text-lg font-bold text-foreground mb-4">혜안당 인생 보감 예시</h3>
              <p className="text-sm text-foreground-muted leading-relaxed italic">
                &ldquo;올해 기토(己土) 일간인 귀하에게는 마른 땅에 단비가 내리는 격입니다. 그간 미뤄둔 학업이나 이직을 행하면 반드시 비취색 푸른 기운의 혜택을 볼 것입니다...&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Fortune Lead Magnet Section */}
      <section id="today-fortune" className="py-20 border-b border-border-custom bg-background-secondary/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-brass font-semibold tracking-wider text-xs uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              오늘의 운세 寶鑑
            </div>
            <h2 className="font-myeongjo text-3xl font-bold text-foreground mb-4">오늘의 운세를 확인해보세요</h2>
            <p className="text-sm text-foreground-muted leading-relaxed font-light">
              가벼운 무료 띠별 운세부터 하루의 행운을 극대화해 줄 5,000원의 정밀 맞춤 운세까지, 오늘 하루의 흐름을 미리 확인하세요.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border-custom mb-10 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("free")}
              className={`flex-1 text-center py-3.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === "free"
                  ? "border-brass text-brass font-bold"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              무료 띠별 운세
            </button>
            <button
              onClick={() => setActiveTab("premium")}
              className={`flex-1 text-center py-3.5 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer relative ${
                activeTab === "premium"
                  ? "border-brass text-brass font-bold"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              나만의 맞춤 운세
              <span className="absolute -top-1.5 -right-2 bg-jade text-background text-[9px] font-bold px-1.5 py-0.5 rounded-full scale-90">
                5,000원
              </span>
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === "free" ? (
            <div className="space-y-8">
              {/* 12 Zodiac Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3.5">
                {ZODIAC_LIST.map((zodiac, idx) => (
                  <button
                    key={zodiac.name}
                    onClick={() => {
                      setSelectedZodiacIndex(idx);
                      setZodiacFortune(getZodiacFortune(zodiac.name, idx));
                    }}
                    className={`border rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 ${
                      selectedZodiacIndex === idx
                        ? "border-brass bg-brass/5 shadow-sm scale-105"
                        : "border-border-custom/60 bg-background/50 hover:border-brass/40"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl filter drop-shadow-sm">{zodiac.emoji}</span>
                    <span className="text-xs font-semibold text-foreground mt-1">{zodiac.name}</span>
                    <span className="text-[10px] text-brass-dark/70 font-myeongjo font-bold">{zodiac.hanja}</span>
                  </button>
                ))}
              </div>

              {/* Zodiac Fortune Result Card */}
              {zodiacFortune && selectedZodiacIndex !== null && (
                <div className="border-2 border-brass/35 rounded-xl bg-background p-6 sm:p-8 shadow-sm transition-all duration-500 animate-fadeIn relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-[0.03] text-brass text-9xl font-myeongjo select-none translate-x-12 translate-y-12 pointer-events-none">
                    {ZODIAC_LIST[selectedZodiacIndex].hanja}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-custom pb-5 mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-2xl">{ZODIAC_LIST[selectedZodiacIndex].emoji}</span>
                        <h3 className="font-myeongjo text-xl font-bold text-foreground">
                          {ZODIAC_LIST[selectedZodiacIndex].name} 오늘의 운세
                        </h3>
                      </div>
                      <p className="text-xs text-foreground-muted font-light">
                        기준일: {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-brass/5 border border-brass/20 px-3.5 py-1.5 rounded-lg">
                      <span className="text-xs font-bold text-brass">오늘의 총운</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-brass" />
                      <span className="text-sm font-bold text-brass-dark">{zodiacFortune.overallScore}점</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-background-secondary/40 border border-border-custom/50 rounded-xl p-4.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-medium mb-2">
                        <Coins className="w-4 h-4 text-[#A3845B]" />
                        금전 및 성공운
                      </div>
                      <div>
                        {renderStars(zodiacFortune.moneyScore)}
                      </div>
                    </div>
                    
                    <div className="bg-background-secondary/40 border border-border-custom/50 rounded-xl p-4.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-medium mb-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        인연 및 대인운
                      </div>
                      <div>
                        {renderStars(zodiacFortune.loveScore)}
                      </div>
                    </div>

                    <div className="bg-background-secondary/40 border border-border-custom/50 rounded-xl p-4.5 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-foreground-muted font-medium mb-2">
                        <Activity className="w-4 h-4 text-jade" />
                        오늘의 행동 팁
                      </div>
                      <p className="text-xs font-medium text-foreground leading-relaxed">
                        {zodiacFortune.tip}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border-custom pt-5 space-y-4">
                    <div>
                      <h4 className="font-myeongjo text-sm font-bold text-foreground mb-1.5">운세 해설</h4>
                      <p className="text-sm text-foreground-muted leading-relaxed font-light">
                        {zodiacFortune.desc}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="inline-flex items-center gap-2 border border-red-800/20 bg-red-50/50 px-3 py-1.5 rounded-lg text-xs">
                        <span className="font-bold text-red-800">행운의 색상</span>
                        <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: getZodiacColorHex(zodiacFortune.color) }} />
                        <span className="font-semibold text-foreground-muted">{zodiacFortune.color}</span>
                      </div>
                      
                      <div className="inline-flex items-center gap-2 border border-red-800/20 bg-red-50/50 px-3 py-1.5 rounded-lg text-xs">
                        <span className="font-bold text-red-800">행운의 숫자</span>
                        <span className="font-bold text-foreground">{zodiacFortune.number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-border-custom bg-background rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="font-myeongjo text-lg font-bold text-foreground mb-2">오늘 하루, 나만을 위한 맞춤형 행운의 열쇠는?</h3>
                  <p className="text-xs text-foreground-muted font-light">
                    개인 출생 정보(생년월일시)를 정밀 분석하여 오늘의 오행 기운과 조율된 1:1 맞춤 일일 운세를 도출하고,<br />
                    아침에 가장 먼저 확인하실 수 있도록 <strong>휴대폰 문자메시지(SMS)</strong>로 전송해 드립니다.
                  </p>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-lg mb-6 text-center font-medium">
                    ⚠️ {formError}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Name and Gender Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-brass" /> 이름
                      </label>
                      <input
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">성별</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: "male" })}
                          className={`py-2.5 text-sm rounded-lg border font-medium cursor-pointer transition-colors ${
                            formData.gender === "male"
                              ? "border-brass bg-brass/5 text-brass font-semibold"
                              : "border-border-custom/60 bg-transparent text-foreground-muted hover:border-brass/35"
                          }`}
                        >
                          남성
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: "female" })}
                          className={`py-2.5 text-sm rounded-lg border font-medium cursor-pointer transition-colors ${
                            formData.gender === "female"
                              ? "border-brass bg-brass/5 text-brass font-semibold"
                              : "border-border-custom/60 bg-transparent text-foreground-muted hover:border-brass/35"
                          }`}
                        >
                          여성
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calendar and Phone Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brass" /> 역법 선택
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { key: "solar", label: "양력" },
                          { key: "lunar", label: "음력 평달" },
                          { key: "lunar_leap", label: "음력 윤달" }
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFormData({ ...formData, calendarType: item.key })}
                            className={`py-2.5 text-xs rounded-lg border font-medium cursor-pointer transition-colors ${
                              formData.calendarType === item.key
                                ? "border-brass bg-brass/5 text-brass font-semibold"
                                : "border-border-custom/60 bg-transparent text-foreground-muted hover:border-brass/35"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-brass" /> 휴대폰 번호 (문자 전송용)
                      </label>
                      <input
                        type="text"
                        placeholder="예: 010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-sm focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      />
                    </div>
                  </div>

                  {/* Birth Date Grid */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brass" /> 출생정보 (년/월/일/시)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <select
                        value={formData.birthYear}
                        onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                        className="border border-border-custom bg-background-secondary/30 px-2 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}년</option>
                        ))}
                      </select>
                      <select
                        value={formData.birthMonth}
                        onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                        className="border border-border-custom bg-background-secondary/30 px-2 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                      <select
                        value={formData.birthDay}
                        onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                        className="border border-border-custom bg-background-secondary/30 px-2 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      >
                        {DAYS.map((d) => (
                          <option key={d} value={d}>{d}일</option>
                        ))}
                      </select>
                      <select
                        value={formData.birthHour}
                        onChange={(e) => setFormData({ ...formData, birthHour: e.target.value })}
                        className="border border-border-custom bg-background-secondary/30 px-1 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                      >
                        {HOURS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitPremium}
                    className="w-full inline-flex items-center justify-center gap-2 bg-brass text-background py-3.5 rounded-lg text-sm font-bold hover:bg-brass-dark shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer mt-2"
                  >
                    오늘의 맞춤 운세 신청하기 (5,000원 결제)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28 border-b border-border-custom bg-background-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-myeongjo text-3xl md:text-4xl font-bold text-foreground mb-4">혜안당 운세 상품</h2>
            <p className="text-foreground-muted font-light">
              마음속 깊은 고민과 생년월일을 바탕으로 분석하는 여섯 가지 전통 비법 리포트입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product Card 1 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-jade text-background text-[10px] font-semibold px-3 py-1 rounded-bl-lg tracking-wider">
                대표 상품
              </div>
              <div>
                <span className="text-xs font-semibold text-jade tracking-wider uppercase block mb-1">사주팔자</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">평생 종합 사주팔자</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-4 font-light">
                  타고난 오행 분포, 평생의 흐름을 짚어주는 10년 주기 대운, 인생의 황금기와 솔루션을 포함한 종합 보고서.
                </p>

                {/* 등급별 요금 안내 박스 */}
                <div className="bg-background-secondary/50 rounded-lg p-3.5 mb-6 border border-border-custom/50 text-[11px] space-y-2 font-light text-foreground-muted">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">✨ 고급 리포트 <span className="text-[8px] bg-brass/10 text-brass px-1.5 py-0.5 rounded font-normal">기본</span></span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">55,000원</span>
                      <span className="font-bold text-brass">34,900원</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-[#5F7A68] font-medium">👑 심화 리포트 <span className="text-[8px] bg-[#5F7A68]/15 text-[#5F7A68] px-1.5 py-0.5 rounded font-normal">추천</span></span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">70,000원</span>
                      <span className="font-bold text-[#5F7A68]">49,900원</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">💬 문자메시지 요약</span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">35,000원</span>
                      <span className="font-bold text-gray-700">14,900원</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">55,000원~</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">37% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">34,900</span>
                    <span className="text-xs text-foreground-muted">원~</span>
                  </div>
                </div>
                <Link
                  href="/input?product=saju"
                  className="w-full inline-flex items-center justify-center gap-1 bg-brass text-background py-2 rounded text-sm font-medium hover:bg-brass-dark transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 2 - 신년운세 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div>
                <span className="text-xs font-semibold text-brass tracking-wider uppercase block mb-1">시즌 한정</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">신년운세</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-4 font-light">
                  새해에 가장 많이 찾는 상품으로, 한 해의 총체적인 흐름, 오행의 상생상극 융합 및 신수비결 분석.
                </p>

                {/* 등급별 요금 안내 박스 */}
                <div className="bg-background-secondary/50 rounded-lg p-3.5 mb-6 border border-border-custom/50 text-[11px] space-y-2 font-light text-foreground-muted">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">✨ 고급 리포트 <span className="text-[8px] bg-brass/10 text-brass px-1.5 py-0.5 rounded font-normal">기본</span></span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">55,000원</span>
                      <span className="font-bold text-brass">34,900원</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-[#5F7A68] font-medium">👑 심화 리포트 <span className="text-[8px] bg-[#5F7A68]/15 text-[#5F7A68] px-1.5 py-0.5 rounded font-normal">추천</span></span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">70,000원</span>
                      <span className="font-bold text-[#5F7A68]">49,900원</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">💬 문자메시지용</span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">40,000원</span>
                      <span className="font-bold text-gray-700">14,900원</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">55,000원~</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">37% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">34,900</span>
                    <span className="text-xs text-foreground-muted">원~</span>
                  </div>
                </div>
                <Link
                  href="/input?product=newyear"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 2-2 - 토정비결 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div>
                <span className="text-xs font-semibold text-brass tracking-wider uppercase block mb-1">시즌 한정</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">토정비결</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-4 font-light">
                  조선 정통 토정 이지함 선생의 원본 해석에 따른 1년 신수비결과 생존 전략.
                </p>

                {/* 등급별 요금 안내 박스 */}
                <div className="bg-background-secondary/50 rounded-lg p-3.5 mb-6 border border-border-custom/50 text-[11px] space-y-2 font-light text-foreground-muted">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-foreground font-medium">✨ 고급 리포트 <span className="text-[8px] bg-brass/10 text-brass px-1.5 py-0.5 rounded font-normal">기본</span></span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">36,900원</span>
                      <span className="font-bold text-brass">29,900원</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-medium text-gray-700">💬 문자메시지 요약</span>
                    <div className="text-right">
                      <span className="line-through text-foreground-muted/60 text-[10px] block">25,000원</span>
                      <span className="font-bold text-gray-700">9,900원</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">36,900원~</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">19% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">29,900</span>
                    <span className="text-xs text-foreground-muted">원~</span>
                  </div>
                </div>
                <Link
                  href="/input?product=tojeong"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div>
                <span className="text-xs font-semibold text-jade tracking-wider uppercase block mb-1">비즈니스</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">재물 & 비즈니스운</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  평생의 재물 성향(안정 vs 투자), 재물이 들어오는 최적의 타이밍, 이직 및 사업 확장 적합 시기 집중 분석.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">30,000원</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">33% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">20,000</span>
                    <span className="text-xs text-foreground-muted">원</span>
                  </div>
                </div>
                <Link
                  href="/input?product=wealth"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 4 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div>
                <span className="text-xs font-semibold text-brass tracking-wider uppercase block mb-1">퀵 타로</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">그 사람의 속마음</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  "그 사람은 지금 나를 어떻게 생각할까?", 헤어진 연인, 짝사랑, 비즈니스 파트너의 심리를 타로 카드로 분석.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">15,000원</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">33% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">10,000</span>
                    <span className="text-xs text-foreground-muted">원</span>
                  </div>
                </div>
                <Link
                  href="/input?product=tarot"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 5 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-[#A3845B] text-background text-[10px] font-semibold px-3 py-1 rounded-bl-lg tracking-wider">
                인기 상승
              </div>
              <div>
                <span className="text-xs font-semibold text-brass tracking-wider uppercase block mb-1">연인 궁합</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">연인 궁합</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-4 font-light">
                  두 사람의 타고난 오행 분포 조화, 속궁합/정서적 궁합, 백년해로 타이밍 및 관계 유지 솔루션 제공.
                </p>

                {/* 카테고리별 요금 안내 박스 */}
                <div className="bg-background-secondary/50 rounded-lg p-3.5 mb-6 border border-border-custom/50 text-[11px] space-y-2 font-light text-foreground-muted">
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1.5 text-foreground font-medium whitespace-nowrap">💕 궁합 <span className="text-[8px] bg-brass/10 text-brass px-1.5 py-0.5 rounded font-normal">기본</span></span>
                    <span className="font-semibold text-brass whitespace-nowrap flex-shrink-0">30,000원</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[#C2185B] font-medium whitespace-nowrap">🔥 속궁합 <span className="text-[8px] bg-[#C2185B]/15 text-[#C2185B] px-1.5 py-0.5 rounded font-normal">인기</span></span>
                    <span className="font-semibold text-[#C2185B] whitespace-nowrap flex-shrink-0">30,000원</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1.5 text-[#5F7A68] font-medium whitespace-nowrap">🌿 재회운</span>
                    <span className="font-semibold text-[#5F7A68] whitespace-nowrap flex-shrink-0">30,000원</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">45,000원</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">33% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">30,000</span>
                    <span className="text-xs text-foreground-muted">원</span>
                  </div>
                </div>
                <Link
                  href="/input?product=gunghap"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Product Card 6 - Dream */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-[#6B5B8B] text-background text-[10px] font-semibold px-3 py-1 rounded-bl-lg tracking-wider">
                신규
              </div>
              <div>
                <span className="text-xs font-semibold text-[#6B5B8B] tracking-wider uppercase block mb-1">꿈해몽</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">꿈해몽 & 사주 조율</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  어젯밤 꿈의 길흉 해몽과 내 사주 오행의 동조 현상 분석. 꿈이 현실과 어떤 관계인지 명리학으로 풀어드립니다.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-foreground-muted line-through">30,000원</span>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">33% 할인</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-foreground">20,000</span>
                    <span className="text-xs text-foreground-muted">원</span>
                  </div>
                </div>
                <Link
                  href="/input?product=dream"
                  className="w-full inline-flex items-center justify-center gap-1 bg-background-secondary border border-border-custom text-foreground py-2 rounded text-sm font-medium hover:border-brass hover:text-brass transition-colors"
                >
                  신청하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 border-b border-border-custom">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-brass block mb-1 uppercase">WHY HYEANDANG</span>
            <h2 className="font-myeongjo text-3xl font-bold text-foreground mb-4">혜안당 리포트의 특별함</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-brass/10 text-brass rounded-full flex items-center justify-center mx-auto mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="font-myeongjo text-lg font-bold text-foreground mb-2">전통 역학 기반의 정밀성</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                가벼운 오락형 운세가 아닙니다. 공인된 만세력 알고리즘을 사용해 음양오행의 분포와 육친(六親) 관계를 정밀 분석합니다.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-jade/10 text-jade rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-myeongjo text-lg font-bold text-foreground mb-2">고민 맞춤형 개인화</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                고객님이 겪고 계신 현실 상황(직장 스트레스, 연애 갈등 등)을 오행의 기운과 조화시켜 한 편의 완성도 높은 에세이 형식의 솔루션을 제공합니다.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-brass/10 text-brass rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-myeongjo text-lg font-bold text-foreground mb-2">이메일 자동 발송</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                복잡한 상담 예약과 일정 조율 필요 없이, 결제가 끝난 직후 시스템이 분석을 시작하여 10분 내에 이메일 보관함으로 리포트가 전송됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 border-b border-border-custom bg-background-secondary/20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <HelpCircle className="w-8 h-8 text-brass mx-auto mb-2" />
            <h2 className="font-myeongjo text-3xl font-bold text-foreground">자주 묻는 질문</h2>
          </div>

          <div className="space-y-6">
            <div className="border border-border-custom bg-background rounded-lg p-5">
              <h3 className="font-myeongjo font-bold text-base text-foreground mb-2">Q. 생년월일을 양력으로 적어야 하나요, 음력으로 적어야 하나요?</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                입력 화면에서 음력과 양력을 선택하여 기입하실 수 있습니다. 또한, 윤달 여부와 정확한 탄생 시를 추가하면 더욱 세밀한 분석이 가능합니다.
              </p>
            </div>

            <div className="border border-border-custom bg-background rounded-lg p-5">
              <h3 className="font-myeongjo font-bold text-base text-foreground mb-2">Q. 리포트는 언제 이메일로 받아볼 수 있나요?</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                결제 완료 즉시 만세력 산출 및 AI 맞춤 분석 엔진이 작동합니다. 대기자 수에 따라 다르나 보통 결제 완료 후 5분에서 최대 15분 내에 입력하신 이메일 주소로 전송됩니다.
              </p>
            </div>

            <div className="border border-border-custom bg-background rounded-lg p-5">
              <h3 className="font-myeongjo font-bold text-base text-foreground mb-2">Q. AI가 생성한 결과는 신뢰할 수 있나요?</h3>
              <p className="text-sm text-foreground-muted leading-relaxed font-light">
                혜안당은 검증된 사주 명리학의 연주, 월주, 일주, 시주 계산 공식을 데이터화하여 1차 분석을 한 뒤, AI의 정교한 자연어 처리 기술을 더하여 읽기 편안하고 풍부한 문맥을 완성합니다. 정밀 프롬프트 튜닝을 통해 타 역학 이론과의 마찰을 방지하고 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border-custom py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-myeongjo text-lg font-bold tracking-widest text-foreground">慧眼堂</span>
            <span className="text-xs text-foreground-muted">© 2026 혜안당. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-xs text-foreground-muted">
            <Link href="/admin" className="hover:text-brass transition-colors font-bold text-brass">관리자 페이지</Link>
            <a href="#" className="hover:text-brass transition-colors">이용약관</a>
            <a href="#" className="hover:text-brass transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-brass transition-colors">고객지원</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
