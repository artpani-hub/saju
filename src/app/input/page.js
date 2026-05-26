"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, AlertCircle, Calendar, Clock, User, Phone, Mail, Scroll, ShieldCheck, Heart } from "lucide-react";

// Product information dictionary
const products = {
  saju: {
    title: "평생 종합 사주팔자",
    category: "사주팔자",
    price: 30000,
    desc: "타고난 오행 분포, 대운의 흐름, 전반적인 라이프사이클 솔루션 제공",
  },
  newyear: {
    title: "신년 운세 / 토정비결",
    category: "시즌 한정",
    price: 35000,
    desc: "한 해의 전체적인 기운과 방향성, 월별 상세 운세 가이드",
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
    desc: "어젯밤 꿈의 길흕 해몽과 내 사주 오행의 동조 현상 분석. 꿈이 현실과 어떤 관계인지 명리학으로 풀어드립니다.",
  },
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
    if (!formData.email.trim() || !formData.email.includes("@")) return "올바른 이메일 주소를 입력해 주세요.";
    if (!formData.phone.trim() || formData.phone.length < 9) return "올바른 연락처를 입력해 주세요.";
    if (productKey === "tarot" && selectedCards.length < 3) return "속마음 타로 카드를 3장 선택해 주세요.";
    if (productKey === "gunghap" && !formData.partnerName.trim()) return "상대방의 성명을 입력해 주세요.";
    if (!formData.worryText.trim()) return "고민하고 계시는 구체적인 내용을 적어주세요.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }
    
    // Transition to payment step
    setStep("paying");
  };

  const startAnalysis = () => {
    setStep("processing");
    
    // Simulate manseoryok derivation and AI generation
    setTimeout(() => {
      setStep("success");
    }, 5000);
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
    <div className="flex flex-col min-h-screen bg-background">
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
                  className="w-full py-4 bg-jade text-background rounded-lg font-myeongjo text-lg font-bold shadow-md hover:bg-jade-dark hover:shadow-lg transition-all"
                >
                  기입 완료 및 결제 진행
                </button>
              </form>
            </div>

            {/* Right side: Product selection and invoice */}
            <div className="space-y-6">
              <div className="border border-border-custom bg-background rounded-lg p-6 sticky top-24">
                <h3 className="font-myeongjo text-lg font-bold text-foreground mb-4 pb-2 border-b border-border-custom">
                  선택된 상품 보감
                </h3>

                {/* Micro selector */}
                <div className="space-y-2.5 mb-6">
                  {Object.entries(products).map(([key, value]) => {
                    const isSelected = productKey === key;
                    const showGradeSelector = isSelected && (key === "saju" || key === "newyear");
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
                          <span className="text-sm font-bold text-brass">
                            {value.price.toLocaleString()}원
                          </span>
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
                                <span className="text-[10px] font-bold text-red-500">-10,000원</span>
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
                    {(productKey === "saju" || productKey === "newyear")
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
                      {(productKey === "saju" || productKey === "newyear") && reportGrade === "sms" 
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
                  const finalPrice = (productKey === "saju" || productKey === "newyear")
                    ? (reportGrade === "deep" 
                      ? base + 15000 
                      : reportGrade === "sms" 
                      ? Math.max(5000, base - 10000) 
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
                  const finalPrice = (productKey === "saju" || productKey === "newyear")
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
                          {activeProduct.title} {(productKey === "saju" || productKey === "newyear") && `(${reportGrade === "premium" ? "고급 리포트" : reportGrade === "deep" ? "심화 리포트" : "문자 요약"})`}
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
                onClick={startAnalysis}
                className="flex-1 py-3 bg-jade text-background rounded text-sm font-semibold hover:bg-jade-dark shadow-sm transition-all"
              >
                테스트 결제 승인
              </button>
            </div>
          </div>
        )}

        {/* Step: Processing (DERIVING MANSEORYOK & AI REASONING SCREEN) */}
        {step === "processing" && (
          <div className="max-w-xl mx-auto border border-border-custom bg-background rounded-lg p-10 text-center my-12 relative overflow-hidden">
            {/* Spinning decorative medallion */}
            <div className="relative w-28 h-28 mx-auto mb-8 animate-spin" style={{ animationDuration: "12s" }}>
              <svg viewBox="0 0 100 100" className="text-brass/30 absolute inset-0">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <svg viewBox="0 0 100 100" className="text-brass absolute inset-0 transform rotate-45">
                <rect x="25" y="25" width="50" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M50 0 L50 100 M0 50 L100 50" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="10" fill="var(--background)" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="50" r="3" fill="currentColor" />
              </svg>
            </div>

            <h2 className="font-myeongjo text-2xl font-bold text-foreground mb-4 animate-pulse">
              만세력 도출 및 사주 보감 작성 중...
            </h2>
            
            {/* Dynamic steps showing AI is generating */}
            <div className="max-w-sm mx-auto text-left space-y-3 bg-background-secondary/40 border border-border-custom/50 rounded-lg p-6">
              <div className="flex items-center gap-3 text-xs">
                <span className="w-5 h-5 bg-jade text-background rounded-full flex items-center justify-center font-bold text-[10px]">1</span>
                <span className="text-foreground font-medium">출생 정보 음양력 변환 완료</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                        <span className="w-5 h-5 bg-jade text-background rounded-full flex items-center justify-center font-bold text-[10px]">2</span>
                <span className="text-foreground font-medium">사주팔자(四柱八字) 육친 배치 완료</span>
              </div>
              <div className="flex items-center gap-3 text-xs animate-pulse">
                <span className="w-5 h-5 bg-brass text-background rounded-full flex items-center justify-center font-bold text-[10px]">3</span>
                <span className="text-brass font-bold">오행(목화토금수) 배합과 대운 흐름 분석 중...</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-foreground-muted/60">
                <span className="w-5 h-5 bg-border-custom text-foreground-muted rounded-full flex items-center justify-center font-bold text-[10px]">4</span>
                <span>고민 맞춤형 조언서 작성 및 이메일 인프라 전송 대기</span>
              </div>
            </div>
            
            <p className="text-xs text-foreground-muted mt-8 font-light italic">
              * 기획 검증용 모의 시뮬레이션입니다. (약 5초 소요)
            </p>
          </div>
        )}

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
                  {activeProduct.title} {(productKey === "saju" || productKey === "newyear") && `(${reportGrade === "premium" ? "고급 리포트" : reportGrade === "deep" ? "심화 리포트" : "문자 요약"})`}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-foreground-muted">수신 방식</span>
                <span className="font-semibold text-foreground">
                  {(productKey === "saju" || productKey === "newyear") && reportGrade === "sms" ? `문자메시지 (${formData.phone})` : `이메일 (${formData.email})`}
                </span>
              </div>
              <div className="flex justify-between text-xs border-t border-border-custom/40 pt-2 mt-2">
                <span className="text-foreground-muted">사주 간지</span>
                <span className="font-bold text-foreground">己亥年 己巳月 甲子日 (예시)</span>
              </div>
            </div>

            <p className="text-sm text-foreground-muted leading-relaxed font-light mb-8">
              입력하신 고민 상황에 대한 역학 풀이와 이메일 템플릿 렌더링이 완료되었습니다. 실제 운영 시 <strong>{formData.email}</strong>로 자동 발송 처리됩니다.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/result?name=${encodeURIComponent(formData.name || "이지혜")}&gender=${formData.gender}&type=${productKey}&calendar=${formData.calendarType}&year=${formData.birthYear}&month=${formData.birthMonth}&day=${formData.birthDay}&hour=${encodeURIComponent(formData.birthHour)}&worryCategory=${formData.worryCategory}&worryText=${encodeURIComponent(formData.worryText)}&cards=${selectedCards.join(",")}&partnerName=${encodeURIComponent(formData.partnerName)}&partnerGender=${formData.partnerGender}&partnerCalendar=${formData.partnerCalendarType}&partnerYear=${formData.partnerBirthYear}&partnerMonth=${formData.partnerBirthMonth}&partnerDay=${formData.partnerBirthDay}&partnerHour=${encodeURIComponent(formData.partnerBirthHour)}&reportGrade=${(productKey === "saju" || productKey === "newyear") ? reportGrade : "premium"}`}
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
