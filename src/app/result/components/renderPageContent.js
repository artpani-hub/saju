"use client";

import Link from "next/link";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Award, CheckSquare, AlertCircle } from "lucide-react";
import JobTable from "./JobTable";
import { getJobMatches } from "../utils";

export const renderPageContent = (page, ctx) => {
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