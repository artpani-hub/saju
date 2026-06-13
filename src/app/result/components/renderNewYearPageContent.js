"use client";

import Link from "next/link";
import { Scroll, Printer, ArrowLeft, Heart, Compass, Shield, Sparkles, DollarSign, CalendarDays, Award, CheckSquare, AlertCircle } from "lucide-react";
import JobTable from "./JobTable";
import { getJobMatches } from "../utils";

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

const getPersonalizedSolution = (name, text, category) => {
  if (!text || text.trim() === "") {
    return {
      analysis: `의뢰인 ${name}님의 <span style=\"color: #8A6F4C; font-weight: bold;\">사주 기질과 운세</span>를 바탕으로 도출한 총론입니다. 귀하의 기운은 주체적이고 독립적인 성향이 돋보이며, 주변의 간섭에서 벗어나 스스로 삶을 주도하려는 에너지가 강하게 흐릅니다. 현재 삶의 전반적인 답답함은 기운이 팽창하면서 기존 환경과의 마찰을 빚고 있기 때문입니다.`,
      timing: `조급하게 답을 내리려 하기보다, <span style=\"color: #8A6F4C; font-weight: bold;\">음력 8월(酉월) 이후</span> 흩어진 토(土) 기운이 찾아와 현실적인 자리를 잡아줄 때 구체적인 선택을 하는 것이 길합니다.`,
      actionPlan: `1. 노란색이나 밝은 브라운 계열의 소품을 가까이 두어 부족한 안정을 도우십시오.
2. 매사에 완벽을 추구하여 나를 혹사시키지 말고, 하루 20분 명상이나 가벼운 산책으로 생각을 비우십시오.
3. 동쪽 방향과의 상성이 좋으니 답답할 땐 동쪽 교외로 나들이를 떠나보시길 권합니다.`
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

  if (hasHealth) {
    analysis = `의뢰인 ${name}님의 건강 상태 및 심신의 안녕["${cleanedText}"]에 대한 명리학적 케어 가이드입니다. 사주 내 특정 오행(특히 <span style=\"color: #8A6F4C; font-weight: bold;\">화기운의 과다 혹은 수기운의 결핍</span>)이 불균형을 이룰 때 피로가 누적되고 신경성 질환이나 면역력 약화가 찾아오기 쉽습니다. 몸의 적신호는 단순히 체력의 문제가 아니라, 마음의 응어리와 기운의 불통이 신체로 발현되는 과정입니다. 스스로를 가혹하게 채찍질하기보다 쉼표를 찍어줄 때입니다.`;
    timing = `정체된 기운이 소통되고 신체 리듬이 안정을 찾는 가장 길한 시기는 오행의 열기를 식히고 윤활유를 채워주는 <span style=\"color: #8A6F4C; font-weight: bold;\">가을철(음력 7~8월) 및 겨울철(음력 10~11월)</span>입니다.`;
    actionPlan = `1. 매일 취침 전 15~20분간 <span style=\"color: #8A6F4C; font-weight: bold;\">따뜻한 물로 족욕을 실천</span>하여 머리의 열을 내리고 아래를 따뜻하게 하는 <span style=\"color: #8A6F4C; font-weight: bold;\">수승화강(水昇火降)</span>을 도우십시오.
2. 자연의 목(木) 기운을 보완하기 위해 <span style=\"color: #8A6F4C; font-weight: bold;\">녹색 식물을 방에 두거나 가벼운 숲길 산책</span>을 일상화하십시오.
3. 신맛이 나는 차(오미자, 매실)나 따뜻한 보리차를 수시로 음용하여 마른 체내에 수분을 보충해 주십시오.`;
  } else if (hasStudy) {
    analysis = `의뢰인 ${name}님의 학업 성취, 자격증 취득 및 시험 합격 안건["${cleanedText}"]에 대한 명리 분석입니다. 시험과 공부는 사주에서 문서와 인내를 뜻하는 <span style=\"color: #8A6F4C; font-weight: bold;\">인성(印星)의 기운</span>이 지지해 줄 때 합격의 문이 넓어집니다. 의욕이 앞설 때 집중력이 흩어지기 쉬운 구조를 가졌으니, 한 번에 여러 공부를 하기보다 하나의 목표를 잘게 쪼개어 정복해 나가는 끈기가 핵심입니다.`;
    timing = `집중력이 극대화되고 시험관이나 채점관에게 좋은 인상을 주는 합격 및 문서 취득의 골든 타임은 <span style=\"color: #8A6F4C; font-weight: bold;\">2026년 음력 8월(酉월) 및 9월(戌월)</span>의 대길한 문서운 시기입니다.`;
    actionPlan = `1. 공부방이나 책상을 행운의 방위인 <span style=\"color: #8A6F4C; font-weight: bold;\">남서쪽이나 서쪽을 향하도록 배치</span>하여 집중의 밀도를 높이십시오.
2. 중요한 시험 당일에는 <span style=\"color: #8A6F4C; font-weight: bold;\">노란색(土)이나 브라운 계열의 의상</span>을 입거나 필기구를 소지하여 문서의 수호 기운을 보충하십시오.
3. 매일 아침 간단한 일일 투두리스트를 서면으로 작성하고 완료 시 체크하는 방식으로 성취감을 의식적으로 유도하십시오.`;
  } else if (hasJob) {
    analysis = `의뢰인 ${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, <span style=\"color: #8A6F4C; font-weight: bold;\">직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)</span>에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
    timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 7~9월 사이</span>입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
    actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.
2. 행운의 색상인 <span style=\"color: #8A6F4C; font-weight: bold;\">화이트(金)나 실버 액세서리를 착용</span>하여 신뢰감을 주는 이미지를 메이킹하십시오.
3. 이직을 진행할 때 <span style=\"color: #8A6F4C; font-weight: bold;\">서쪽(西) 방향에 위치한 회사나 기관</span>이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
  } else if (hasLove) {
    analysis = `의뢰인 ${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
    timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 10월(亥월) 및 11월(子월)</span> 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
    actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">따뜻한 붉은색 계열(火)의 홈웨어</span> 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.
3. 대화를 시도할 때는 서로 마주 보는 자리보다 <span style=\"color: #8A6F4C; font-weight: bold;\">나란히 걸으며 이야기할 때</span> 감정의 대립을 막아줍니다.`;
  } else if (hasMoney) {
    analysis = `의뢰인 ${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, <span style=\"color: #8A6F4C; font-weight: bold;\">고위험 코인, 부동산 모험</span>)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
    timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
    actionPlan = `1. 현금 흐름의 60% 이상은 <span style=\"color: #8A6F4C; font-weight: bold;\">수동적 예적금이나 연금저축</span> 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">노란색(土) 지갑이나 브라운 계열의 의상</span>을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.
3. 거래 계약 시 <span style=\"color: #8A6F4C; font-weight: bold;\">노란 색상의 낙관 도장</span>을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
  } else if (category === "business") {
    analysis = `의뢰인 ${name}님의 사업체 운영 및 비즈니스 경영상 겪고 계신 갈등["${cleanedText}"]에 대한 사주 정밀 분석입니다. 사주 내 <span style=\"color: #8A6F4C; font-weight: bold;\">과도한 화(火) 기운</span>이 발현될 때, 조급한 투자 결정이나 감정적인 거래선 확장은 불필요한 금전적 리스크를 유발합니다. 또한 동업자나 고용 직원과의 갈등, 의견 대립이 잦아져 경영 전반에 마찰음이 커질 수 있으니 수(水)의 유연함과 통찰을 바탕으로 차분하게 내실을 수성하는 전략이 급선무입니다.`;
    timing = `새로운 비즈니스 계약이나 자금 집행, 사업장 이동은 하늘의 금(金) 기운과 수(水) 기운이 조화롭게 흐르는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 8월(酉월) 하반기 및 10월(亥월)</span>이 가장 길합니다. 이 시기에 추진하시는 계약은 리스크가 최소화되고 안정적인 결실을 보장받습니다.`;
    actionPlan = `1. 사업장 내 <span style=\"color: #8A6F4C; font-weight: bold;\">북쪽(水) 방향에 수경 식물이나 미니 분수를 배치</span>해 과열된 기운을 차분히 식히십시오.
2. 중요 미팅이나 계약 날인 시 신뢰도와 차분한 기품을 주는 <span style=\"color: #8A6F4C; font-weight: bold;\">다크 네이비(水) 계열 의상을 착용</span>하십시오.
3. 동업 또는 하도급 계약서 작성 시 당일 즉시 서명하기보다 반드시 최소 3일간의 내부 검토 기간을 두는 필터링 룰을 적용해 손재수를 철저히 예방하십시오.`;
  } else if (category === "startup") {
    analysis = `의뢰인 ${name}님의 신규 창업 및 부업 개시 안건["${cleanedText}"]에 대한 명리 솔루션입니다. 귀하의 타고난 명조는 자기 브랜드를 구축하고자 하는 욕구(<span style=\"color: #8A6F4C; font-weight: bold;\">식상생재</span>)가 매우 발달해 있습니다. 다만, 아직 경험이 완전히 축적되지 않은 상태에서 대출 비중을 높여 무리하게 진입하면 초기 고정비 과부하로 인한 큰 손실 위험이 있습니다. 소자본 및 온라인 채널을 통한 린 스타트업(Lean Startup) 형태의 철저한 테스트가 우선입니다.`;
    timing = `실제 매장을 오픈하거나 정식 사업자 등록을 하기에 가장 좋은 절기적 타이밍은 차가운 기운이 안정적으로 스며들어 감정적 조급함을 제어해 주는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 10월(亥월) 이후</span>입니다.`;
    actionPlan = `1. 초기에 매장 임차료나 인테리어 설비 같은 하드웨어 비용 투자를 최소화하고, service/콘텐츠 등의 소프트웨어 위주로 시범 론칭하십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용</span>하여 신뢰와 중개력을 돕는 토의 기운을 보완하십시오.
3. 창업 파트너나 조력자를 구할 때 사주 상 물(水)이나 금(金) 기운이 많고 냉철한 성품을 지닌 인물과 손잡을 때 내 부족한 추진력을 완벽히 비보해 줍니다.`;
  } else if (category === "trade") {
    analysis = `의뢰인 ${name}님의장사 및 물류 유통 사업["${cleanedText}"]에 대한 역학 솔루션입니다. 장사와 유통은 고객과의 잦은 대면 소통과 끊임없는 유동성 관리가 본질입니다. 귀하의 사주는 대인 친화력이 뛰어나 단골 유치에는 유리하지만, 외상 거래나 인정에 끌린 무리한 어음/미수금 거래로 인해 현금이 묶여 고통받을 수 있는 약점이 있습니다. 철저한 선결제 시스템 구축과 마진 구조의 개혁이 핵심입니다.`;
    timing = `매출 활성화가 정점에 달하고 유통망이 매끄럽게 뚫리는 시기는 금(金)의 결실 에너지가 사주의 중심을 잡아주는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 7~9월 가을철</span>입니다.`;
    actionPlan = `1. 카운터나 매장 입구에 <span style=\"color: #8A6F4C; font-weight: bold;\">붉은색(火) 계열의 행운 장식품</span>이나 은은한 향을 매칭하여 손님들의 호기심과 발길을 자극하십시오.
2. 거래처 미팅 시 <span style=\"color: #8A6F4C; font-weight: bold;\">흰색(金) 상의를 착용</span>하여 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.
3. 매장 내부의 <span style=\"color: #8A6F4C; font-weight: bold;\">서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서</span> 서쪽 서랍에 깊숙이 보관하십시오.`;
  } else if (category === "facility") {
    analysis = `의뢰인 ${name}님의 설비투자 및 사업장 확장, 장비 구입["${cleanedText}"]에 대한 금전 비책입니다. 기계, 공장 설비, 신규 하드웨어를 구매하거나 대형 리모델링에 착수하는 것은 사주의 <span style=\"color: #8A6F4C; font-weight: bold;\">문서운(인성)과 장비 계약운(관성)</span>이 깨끗할 때 진입해야 고장이나 시공 하자, 이자 비용의 폭증을 피할 수 있습니다. 현재의 충살 기운 하에서는 성급하게 고가의 장비를 리스하거나 확장 계약을 맺으면 향후 골칫거리가 될 수 있습니다.`;
    timing = `계약 체결 및 설비 입고에 가장 하자가 없고 안전한 골든 타임은 문서 기운이 가장 안정되는 2026년 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 8월(酉월) 하반기 및 9월(戌월)</span>입니다.`;
    actionPlan = `1. 계약 체결 시 반드시 보증보험이나 하자보수 서약서를 이중으로 징구하여 예상치 못한 파손 리스크에 대비하십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">노란색(土) 가죽 다이어리나 서류 바인더</span>에 설비 도면과 서류를 보관하여 계약 체결 시 발생하는 살(煞)을 정화하십시오.
3. 계약서 날인 당일에는 15분 동안 반신욕이나 족욕을 통해 몸의 열기를 다스린 후 가장 이성적이고 차분한 상태에서 최종 확인을 거쳐 서명하십시오.`;
  } else if (category === "career") {
    analysis = `의뢰인 ${name}님께서 고민하고 계신 직장 생활 및 이직/퇴사 안건["${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. 귀하의 명식은 강한 주체성과 식상(표현 및 행동력)이 발달해 있어, <span style=\"color: #8A6F4C; font-weight: bold;\">직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)</span>에 억눌릴 때 강한 이직 충동을 느낍니다. 이는 한때의 권태기가 아니며, 내 안의 에너지가 스스로 통제권을 쥐고 일어서려 하는 변화의 흐름과 맞닿아 있습니다.`;
    timing = `가장 유리한 구직 및 이동의 타이밍은 나를 지탱하고 도와줄 관성(직장운)과 인성(문서/합격운)이 견고하게 들어오는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 7~9월 사이</span>입니다. 상반기에 무작정 퇴사하기보다는 재직 중 이직처를 확정하고 가을경 이동하시는 것을 추천합니다.`;
    actionPlan = `1. 회사에서는 나만의 고유 영역을 확실히 나누고 감정적 논쟁은 일체 차단하여 에너지를 절약하십시오.
2. 행운의 색상인 <span style=\"color: #8A6F4C; font-weight: bold;\">화이트(金)나 실버 액세서리를 착용</span>하여 신뢰감을 주는 이미지를 메이킹하십시오.
3. 이직을 진행할 때 <span style=\"color: #8A6F4C; font-weight: bold;\">서쪽(西) 방향에 위치한 회사나 기관</span>이 귀하에게 훨씬 유리한 기운을 제공합니다.`;
  } else if (category === "love") {
    analysis = `의뢰인 ${name}님께서 겪고 계신 인연 및 연애/관계 갈등["${cleanedText}"]에 대한 명리학적 대답입니다. 명식상 귀하는 한 번 마음을 준 인연에게 신뢰를 아끼지 않으나, 기대치에 어긋나거나 관계의 불확실성이 지속되면 극심한 마음고생을 겪으며 문을 닫아버리는 섬세한 성향을 가졌습니다. 현재 겪는 고착 상태는 상대방과의 기운의 온도 차이로 인해 대화 주파수가 맞지 않아 발생한 일시적 흐름입니다.`;
    timing = `서로의 오해가 풀리고 막혔던 소통의 흐름이 물꼬를 트는 시기는 <span style=\"color: #8A6F4C; font-weight: bold;\">음력 10월(亥월) 및 11월(子월)</span> 즈음입니다. 이 시기에 수(水) 기운의 융합이 자연스럽게 일어나 오해가 눈 녹듯 풀릴 수 있으니, 그전까지는 감정적인 다그침을 거두고 기다리셔야 합니다.`;
    actionPlan = `1. 상대방의 연락 속도에 예민하게 반응하지 말고 의식적으로 나의 관심사를 다른 취미로 돌리십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">따뜻한 붉은색 계열(火)의 홈웨어</span> 또는 포인트 조명을 활용하면 서로의 긴장을 누그러뜨리는 효과가 있습니다.
3. 대화를 시도할 때는 서로 마주 보는 자리보다 <span style=\"color: #8A6F4C; font-weight: bold;\">나란히 걸으며 이야기할 때</span> 감정의 대립을 막아줍니다.`;
  } else if (category === "wealth") {
    analysis = `의뢰인 ${name}님의 재정적 고민 및 재물/투자 갈등["${cleanedText}"]에 대한 정밀 비책입니다. 귀하의 명조는 버는 능력(식상)에 비해 나가는 누수 경로(재성 결합력 부족)를 제어하는 제어판이 약해, 목돈이 생기면 주변의 솔깃한 투자 권유(주식 단타, <span style=\"color: #8A6F4C; font-weight: bold;\">고위험 코인, 부동산 모험</span>)에 휩쓸려 예상 밖의 손실을 입기 쉬운 체질입니다. 무분별한 베팅은 절대 피해야 합니다.`;
    timing = `목돈이 묶이거나 자금난이 해소되는 시기는 대지(土)의 기운이 굳건하게 작용하는 가을~겨울 철입니다. 상반기의 무리한 신규 투자는 절대 피하시고 하반기(음력 9월 이후)에 안정성을 담보한 장기 채권이나 실물 위주로 분산투자 하시는 것이 최선입니다.`;
    actionPlan = `1. 현금 흐름의 60% 이상은 <span style=\"color: #8A6F4C; font-weight: bold;\">수동적 예적금이나 연금저축</span> 같이 임의 출금이 불가능한 금융 바구니에 고정시키십시오.
2. <span style=\"color: #8A6F4C; font-weight: bold;\">노란색(土) 지갑이나 브라운 계열의 의상</span>을 입으면 재물이 밖으로 누수되는 기운을 비보(裨補)해 줍니다.
3. 거래 계약 시 <span style=\"color: #8A6F4C; font-weight: bold;\">노란 색상의 낙관 도장</span>을 사용하면 문수의 흉한 기운을 막아주는 힘이 생깁니다.`;
  } else {
    analysis = `의뢰인 ${name}님께서 적어주신 인생의 고뇌["${cleanedText}"]에 대한 따뜻한 명리학적 위로와 해결책입니다. 귀하가 느끼시는 마음에 낀 안개와 정체는 사주 속 특정 오행의 흐름이 한자리에 고여 원활하게 소통되지 못해 생겨난 감정적 피로입니다. 모든 것을 내 책임으로 돌리고 혼자 짊어지려는 곧은 기질로 인해 번아웃에 직면해 있으니, 타인의 기대에 맞추기보다 나를 아끼는 것이 최우선 과제입니다.`;
    timing = `정체된 흐름이 풀려 마음의 안정을 찾을 수 있는 시기는 귀하의 기운을 다정하게 감싸줄 목(木)과 화(火)의 생동하는 에너지가 들어오는 음력 6~7월 사이입니다.`;
    actionPlan = `1. 타인의 무리한 부탁이나 기대에 대해 '아니오'라고 단호하고 완곡하게 거절하는 연습을 시작하십시오.
2. 침실 내 싱그러운 초록 식물이나 화분을 배치하여 정체된 감정을 순화시키는 자연 개운을 도우십시오.
3. 취침 전 하루의 스트레스를 땀으로 내보내는 20분간의 족욕을 통해 위는 차갑고 아래는 따뜻한 수승화강을 실천하십시오.`;
  }

  return { analysis, timing, actionPlan };
};

export const renderNewYearPageContent = (page, ctx) => {
    const {
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
      setIsPaid
    } = ctx;

    const renderLockOverlayFallback = (sectionTitle) => {
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
              className="w-full py-2.5 bg-[#8B221E] hover:bg-[#6D1B18] text-white rounded text-xs font-semibold shadow-md transition-all font-traditional cursor-pointer"
            >
              전체 리포트 잠금 해제하기 (9,900원) →
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof setIsPaid === 'function') setIsPaid(true);
              }}
              className="w-full py-1.5 bg-[#5F7A68] hover:bg-[#38493D] text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all mt-1"
            >
              ⚙️ [개발자 테스트] 즉시 잠금해제 확인하기
            </button>
          </div>
        </div>
      );
    };

    const renderUpgradeOverlayFallback = (sectionTitle) => {
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
                if (typeof setIsPaid === 'function') {
                  setIsPaid(true);
                  const url = new URL(window.location.href);
                  url.searchParams.delete("reportGrade");
                  window.location.href = url.toString();
                }
              }}
              className="w-full py-1.5 bg-[#5F7A68] hover:bg-[#38493D] text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all mt-1"
            >
              ⚙️ [개발자 테스트] 즉시 업그레이드 확인하기
            </button>
          </div>
        </div>
      );
    };

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
          {isFree && renderLockOverlayFallback(sectionTitle)}
          {!isFree && isUpgradeLocked && renderUpgradeOverlayFallback(sectionTitle)}
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
                      <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${metalNeed}%` }} />
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
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${cardioRisk}%` }} />
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
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pulmonaryRisk}%` }} />
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

      case "ny_preface": {
        const dayStemEl = sajuInfo?.day?.stemEl || baseEl || "목";
        const mVal = parseInt(month) || 1;
        let seasonText = "새로운 생명이 움트는 봄";
        if (mVal >= 3 && mVal <= 5) seasonText = "새로운 생명이 움트는 봄";
        else if (mVal >= 6 && mVal <= 8) seasonText = "정열적인 생명력이 팽창하는 여름";
        else if (mVal >= 9 && mVal <= 11) seasonText = "풍요로운 결실을 수확하고 준비하는 가을";
        else seasonText = "만물을 품고 조용히 갈무리하는 겨울";

        let dynamicAdvice = null;
        if (dayStemEl === "목") {
          dynamicAdvice = (
            <span>
              특히 의뢰인 <span style={{ color: "#8A6F4C" }} className="font-semibold">{name}</span>님은 <span style={{ color: "#8A6F4C" }} className="font-semibold">싱그러운 목(木) 기운</span>을 본질로 품고 태어나셨습니다. 2026년 병오년의 타오르는 불꽃(火)은 <span style={{ color: "#8A6F4C" }} className="font-semibold">목생화(木生火)의 흐름</span>으로 귀하의 에너지를 밖으로 넓게 팽창시키고 재능을 펼치게 만듭니다. 그러나 나무의 수분이 메말라 번아웃되기 쉬운 기류를 내재하고 있으므로, 올 한 해는 무조건적인 돌진보다 <span style={{ color: "#8A6F4C" }} className="font-semibold">내면의 수기를 수혈하는 현명한 완급 조절</span>이 최고의 신년 등대가 될 것입니다.
            </span>
          );
        } else if (dayStemEl === "화") {
          dynamicAdvice = (
            <span>
              특히 의뢰인 <span style={{ color: "#8A6F4C" }} className="font-semibold">{name}</span>님은 <span style={{ color: "#8A6F4C" }} className="font-semibold">정열적인 화(火) 기운</span>을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 내 사주와 세운이 불로 하나되어 타오르는 <span style={{ color: "#8A6F4C" }} className="font-semibold">비겁(比劫)의 강한 에너지</span>를 만듭니다. 주체성과 독립심이 극대화되어 판을 주도적으로 흔드는 힘이 있으나, 불필요한 고집이나 과열된 자존심으로 인해 재물 누수나 대인 마찰을 부를 수 있으니, 올 한 해는 <span style={{ color: "#8A6F4C" }} className="font-semibold">차분하게 불꽃을 제어하는 보수적 방어와 신중함</span>이 최고의 신년 등대가 될 것입니다.
            </span>
          );
        } else if (dayStemEl === "토") {
          dynamicAdvice = (
            <span>
              특히 의뢰인 <span style={{ color: "#8A6F4C" }} className="font-semibold">{name}</span>님은 <span style={{ color: "#8A6F4C" }} className="font-semibold">묵직하고 따뜻한 토(土) 기운</span>을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 흙을 든든하게 생조해주는 <span style={{ color: "#8A6F4C" }} className="font-semibold">화생토(火生土)의 인성(印星) 에너지</span>를 만듭니다. 귀인과 문서 계약의 길함이 크게 돋보여 새로운 기반을 탄탄히 다지기에 적합한 조건입니다. 다만, 들어오는 에너지가 무거워 생각에만 잠겨 실천을 미루는 '생각의 감옥'에 갇힐 위험이 있으니, 올 한 해는 <span style={{ color: "#8A6F4C" }} className="font-semibold">맑은 직관과 과감한 기동력</span>이 최고의 신년 등대가 될 것입니다.
            </span>
          );
        } else if (dayStemEl === "금") {
          dynamicAdvice = (
            <span>
              특히 의뢰인 <span style={{ color: "#8A6F4C" }} className="font-semibold">{name}</span>님은 <span style={{ color: "#8A6F4C" }} className="font-semibold">결단력 있는 금(金) 기운</span>을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 단단한 원석이나 무쇠를 제련하는 <span style={{ color: "#8A6F4C" }} className="font-semibold">화극금(화극금)의 관성(官星) 기류</span>를 이끌어냅니다. 직장에서의 승진, 명예의 획득, 큰 책임감이 주어져 한 단계 높은 사회적 위상을 다질 수 있는 시험대에 서게 됩니다. 다만, 과도한 책임 지움과 제련 스트레스로 인해 신체가 쉽게 건조해질 수 있으니, 올 한 해는 <span style={{ color: "#8A6F4C" }} className="font-semibold">유연한 마음가짐과 규칙적인 휴식</span>이 최고의 신년 등대가 될 것입니다.
            </span>
          );
        } else {
          dynamicAdvice = (
            <span>
              특히 의뢰인 <span style={{ color: "#8A6F4C" }} className="font-semibold">{name}</span>님은 <span style={{ color: "#8A6F4C" }} className="font-semibold">지혜로운 수(수) 기운</span>을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(화)은 물이 불을 통제하며 성과를 거두는 <span style={{ color: "#8A6F4C" }} className="font-semibold">수극화(수극화)의 재성(재성) 활력</span>을 불어넣습니다. 막혔던 자금 흐름이 풀리고 경제적 실리를 확실하게 거둘 수 있는 역동적인 재물 기회가 주어지게 됩니다. 다만, 조급하게 서둘러 분수에 넘치는 투자를 감행하면 불길에 물이 모두 증발하여 오히려 패를 볼 수 있으니, 올 한 해는 <span style={{ color: "#8A6F4C" }} className="font-semibold">이성적이고 차분한 자산 수성</span>이 최고의 신년 등대가 될 것입니다.
            </span>
          );
        }
 
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
                 의뢰인 <strong style={{ color: "#8A6F4C" }} className="font-semibold">{name}</strong>님은 <strong style={{ color: "#8A6F4C" }} className="font-semibold">{seasonText}철</strong>에 태어나 사주 원국의 독자적인 우주 에너지를 품으셨기에, 올해 병오년의 불꽃 날씨와 만나는 양상이 매우 입체적이고 다각적입니다.
               </p>
               <p>
                 {dynamicAdvice}
               </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center space-y-1">
                <span className="text-[10px] text-[#A3845B] font-bold block tracking-wider">— 명언 (名言) —</span>
                <p className="text-amber-900 font-semibold leading-relaxed">
                  "우매한 자는 닥쳐올 길흉에 일희일비하지만, 지혜로운 자는 다가올 흐름을 미리 파악해 스스로의 기운을 튜닝한다(趨吉避凶)."
                </p>
              </div>
              <p>
                신년의 강렬한 화(火)의 팽창력은 우리에게 활발한 대외 성장의 기회를 주는 동시에 감정 과열과 충동이라는 어두운 그림자를 함께 던집니다. 올 한 해 수많은 선택의 갈림길에서 본 보감을 항상 곁에 두시고, 삶의 든든한 등대이자 최고의 전략적 플레이북으로 삼아 대길한 성취를 이루시길 간절히 기원합니다.
              </p>
            </div>
          </div>
        );
      }

      case "ny_intro_saju": {
        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const earthCount = sajuInfo?.elements?.토 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;
        
        const counts = { "목": woodCount, "화": fireCount, "토": earthCount, "금": metalCount, "수": waterCount };
        
        let dominantEl = "목";
        let maxCount = -1;
        Object.entries(counts).forEach(([el, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            dominantEl = el;
          }
        });

        let deficientEl = "목";
        let minCount = 99;
        Object.entries(counts).forEach(([el, cnt]) => {
          if (cnt < minCount) {
            minCount = cnt;
            deficientEl = el;
          }
        });

        let dominantDesc = "";
        if (dominantEl === "목") {
          dominantDesc = "나무(木)의 위로 솟구치며 새로운 일을 과감하게 추진하고 시작하려는 진취적인 성장 에너지입니다. 기획이나 창의적 시작점의 개척 능력이 매우 발달해 있습니다.";
        } else if (dominantEl === "화") {
          dominantDesc = "불(火)의 팽창하고 밝게 드러내는 화려한 표현성과 대외적 소통력입니다. 대중 중심에 서거나 자신의 재능을 화사하게 어필하는 매력의 기운이 뛰어납니다.";
        } else if (dominantEl === "토") {
          dominantDesc = "흙(土)의 중심을 잡아주고 모든 기운을 중재하는 포용력과 신뢰도입니다. 타인에게 신망을 두터이 얻으며, 묵묵하고 듬직하게 안정과 경제적 안정을 이뤄내는 기틀이 됩니다.";
        } else if (dominantEl === "금") {
          dominantDesc = "쇠(金)의 맺고 끊음이 확실한 단호한 절제와 이성적 판단력입니다. 복잡한 미련이나 군더더기 없이 확실하고 실리적인 결과를 이끌어내는 결단력이 강력합니다.";
        } else {
          dominantDesc = "물(水)의 깊고 유연하게 스며드는 뛰어난 통찰력과 지혜입니다. 한 치 앞이 아닌 대세를 멀리 내다보며 전략을 세우고 마음의 안정을 유도하는 내실이 탄탄합니다.";
        }

        let deficientDesc = "";
        if (minCount === 0) {
          if (deficientEl === "목") {
            deficientDesc = "나무(木)의 개척 에너지가 0개로 결핍되어 시작 단계에서 주저하거나 과도한 계획에만 에너지를 쏟아 첫발을 떼지 못하는 아쉬움이 있습니다. 실행 본능을 적극 깨워야 합니다.";
          } else if (deficientEl === "화") {
            deficientDesc = "불(火)의 에너지 분출력이 0개로 결핍되어 본인의 훌륭한 실력이나 가치보다 과소평가받거나 낯을 많이 가리기 쉽습니다. 의식적으로 환하게 미소 짓고 자신감을 드러내야 발복합니다.";
          } else if (deficientEl === "토") {
            deficientDesc = "흙(土)의 보관 및 매립 에너지가 0개로 결핍되어 자산이 고이지 못하고 흩어지는 위험이 있습니다. 2026년 버는 수익은 부동산이나 장기 적금 등 문서 형태로 바로 잠가 지켜야 합니다.";
          } else if (deficientEl === "금") {
            deficientDesc = "쇠(金)의 차단 및 거절력이 0개로 결핍되어 거절하지 못하고 질질 끌려다니다 상처를 받거나 손실을 보기 쉽습니다. 세련되게 차단하고 거절하는 연습이 최고의 개운법입니다.";
          } else {
            deficientDesc = "물(水)의 흐름 및 정화 기운이 0개로 결핍되어 한 번 상처받거나 앙금이 생기면 마음에 오래 담아두고 고립되는 경향이 있습니다. 가볍게 털어내고 물 흐르듯 유연해져야 합니다.";
          }
        } else {
          if (deficientEl === "목") {
            deficientDesc = "나무(木) 기운이 가장 약하므로 추진과 과감성 측면에서 보강이 요구됩니다. 규칙적인 아침 활동을 습관화하십시오.";
          } else if (deficientEl === "화") {
            deficientDesc = "불(火) 기운이 가장 부족하여 열정과 자기표현의 기운을 보강해야 합니다. 밝은 색상 코디와 대외 네트워킹에 참여해보십시오.";
          } else if (deficientEl === "토") {
            deficientDesc = "흙(土) 기운이 상대적으로 약해 자산의 안전한 수성에 주안점을 둬야 합니다. 충동적 분산 투자보다 저축형 금고를 다지십시오.";
          } else if (deficientEl === "금") {
            deficientDesc = "쇠(金) 기운이 가장 부족하므로 결단과 공사 구분을 명확히 하는 연습을 실천하여 리스크를 예방하십시오.";
          } else {
            deficientDesc = "물(水) 기운이 가장 약하므로 생각을 종이에 써서 정돈하고 매일 온수 족욕을 통해 긴장을 푸는 수기 충원이 필요합니다.";
          }
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 <strong>{name}</strong>님이 탄생하는 그 순간, 우주 공간을 채웠던 여덟 글자의 명조(命造: 사주 원국) 배치입니다. 명리학에서 사주 원국은 평생에 걸쳐 귀하를 구성하는 <strong>정신적 뼈대이자 유전적인 기질의 기본형</strong>을 상징합니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.hour.stem}{sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.hour.stemEl}/{sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">{sajuInfo.day.stem}{sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">{sajuInfo.day.stemEl}/{sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.month.stem}{sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.month.stemEl}/{sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.year.stem}{sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.year.stemEl}/{sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p>
                  네 개의 기둥 중에서도 나 자신을 대변하는 <strong>일간(日干: {sajuInfo.day.stem})</strong>은 나의 정신적 자아와 핵심 가치관을 주도하는 최고 결정권자입니다. 일주(日柱)의 지지({sajuInfo.day.branch})는 내가 지향하는 내면의 안전지대이자 배우자와 정서적 교감을 나누는 주거 환경입니다.
                </p>
                <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-2.5">
                  <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ {name}님의 사주 원국 오행 분석</span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    의뢰인님의 사주 원국에서 가장 왕성한 기맥을 형성하고 있는 주도 오행은 <strong>{dominantEl}({dominantEl === "목" ? "木" : dominantEl === "화" ? "火" : dominantEl === "토" ? "土" : dominantEl === "금" ? "金" : "水"})</strong> 기운으로, <strong>{dominantDesc}</strong>
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-700 border-t border-gray-200/40 pt-2">
                    반면, 기맥의 보완이 가장 시급한 보완 대상 오행은 <strong>{deficientEl}({deficientEl === "목" ? "木" : deficientEl === "화" ? "火" : deficientEl === "토" ? "土" : deficientEl === "금" ? "金" : "水"})</strong> 기운으로, <strong>{deficientDesc}</strong>
                  </p>
                </div>
                <p>
                  올해 병오년의 불꽃은 이 여덟 글자의 유기적 관계와 마주하여 천간의 합과 지지의 충을 정밀하게 일으킵니다. 내 원국에 어떤 글자들이 있고, 그 글자들이 세운의 글자와 어떻게 융합하는지 명확하게 인지하고 대처할 때 나쁜 액운을 지혜롭게 비껴가고 인생의 큰 복록을 온전히 취하게 될 것입니다.
                </p>
              </div>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );
      }

      case "ny_daewun_flow": {
        const dayStemElVal = sajuInfo?.day?.stemEl;
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

        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;

        let daewunAnalysis = "";
        if (fireCount >= 3 || (fireCount + woodCount) >= 5) {
          daewunAnalysis = `의뢰인 ${name}님의 사주 원국은 이미 목(木)과 화(火)의 에너지가 강성하여 내적인 열기와 양기가 매우 높은 구조를 나타냅니다. 여기에 2026년 병오년의 천지합화 불꽃이 가세하게 되면 사주 전체의 온도가 임계점 이상으로 치솟아 쉽게 조급해지고 성급하게 확장을 결정하거나 홧김에 직장을 이탈할 리스크가 짙어집니다. 따라서 대운의 순행 흐름 속에서 귀하가 수립해야 할 최고의 전략은 무리한 신규 판 벌이기를 철저히 지양하고, 감정을 제어하며 리스크 방어에 올인하는 보수적 수성 전술입니다.`;
        } else if (waterCount >= 2) {
          daewunAnalysis = `의뢰인 ${name}님의 사주 원국에는 세운의 뜨거운 불길을 다스리고 냉철하게 조율해 줄 맑고 깊은 수(水) 기운이 든든하게 자리 잡고 있습니다. 이는 2026년의 거대한 용광로 불씨가 다가오더라도 귀하의 내적인 수기가 이를 수화기제(수화기제: 물과 불의 조화로운 안착)의 흐름으로 매끄럽게 통제하여, 혼란 속에서도 확실한 이익 마진을 선점하고 장기적인 문서 자산으로 치환해내는 인생의 실질적 번영과 도약의 무대가 열리게 됨을 뜻합니다. 자신감 있게 주도권을 쥐고 나아가십시오.`;
        } else if (metalCount >= 2) {
          daewunAnalysis = `의뢰인 ${name}님의 사주 원국에는 단단하고 이성적인 금(金) 기운이 뼈대를 이루고 있습니다. 병오년의 맹렬한 불꽃은 귀하의 원석을 용광로에 넣어 명검으로 완성해나가는 관성(관성)의 제련 작용을 강력하게 시작합니다. 공적인 지위 획득, 책임의 막중함, 혹은 커리어 압박이 매우 거세게 주어지겠지만, 이 제련 기간을 끈기 있게 견디고 원칙을 지켜 버텨낸다면 연말에는 누구도 부정할 수 없는 찬란한 지위와 명예를 탈환하게 되는 대운의 통과의례입니다. 명검이 되는 고통을 즐기며 뚝심 있게 나아가십시오.`;
        } else {
          daewunAnalysis = `의뢰인 ${name}님의 사주 원국은 어느 한 기운이 무리하게 쏠리지 않고 음양오행의 에너지가 비교적 부드럽고 균형 있게 순환하는 명조입니다. 2026년의 거센 천지합화 불길이 찾아오더라도 사주 원국의 흙(土) 기운과 상생 기맥이 불길의 세기를 차분하게 흡수하여(화생토, 토생금), 일시적인 마찰이나 환경 변화가 유도되더라도 빠르게 원래의 안정을 되찾는 복원력을 유감없이 보여줄 것입니다. 큰 도박을 피하고 자신의 본업에 집중하면 가장 순탄한 성장을 이룰 것입니다.`;
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
                    <span className="text-emerald-700">${harmonyVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${harmonyVal}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>신년 기회 포착률</span>
                    <span className="text-blue-700">${opportunityVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${opportunityVal}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>기류 과열 스트레스</span>
                    <span className="text-red-600">${stressVal}%</span>
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
                {daewunAnalysis}
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

        const dayStemElVal = sajuInfo?.day?.stemEl;
        let seounPersonalizedDesc = "";
        
        if (dayStemElVal === "목") {
          seounPersonalizedDesc = `이 천지합화의 불꽃 기맥은 목(木) 일간인 ${name}님에게는 내면에 품은 재능과 언어, 기획력을 힘차게 뿜어내는 식상(食傷)의 활성화를 이끕니다. 오랫동안 준비해온 전문 지식을 마케팅하거나 독자적 아이디어를 상용화하기에 대단히 유리한 해입니다. 다만, 불길이 내 뿌리와 수분을 과도하게 말려버릴 수 있으므로 감정적 조급증이나 상열감(번아웃)을 슬기롭게 차단해야 합니다. 상반기(음력 4~6월)에는 말을 아끼고 내실을 기하는 브레이크 장치가 최고의 개운 비방입니다.`;
        } else if (dayStemElVal === "화") {
          seounPersonalizedDesc = `이 천지합화의 불꽃 기맥은 화(火) 일간인 ${name}님에게는 나와 같은 불이 거대하게 동행하는 비겁(比劫)의 과열을 이끕니다. 자아 강도가 우주 끝까지 팽창하여 누군가의 간섭을 차단하고 1인 창업이나 독립을 꾀하려는 에너지가 폭발합니다. 단독 선두로 나서는 성취도에는 대길하나, 극도로 곤두선 자존심 때문에 가장 소중한 귀인이나 배우자를 밀어내고, 동업 또는 모험 투자를 감행해 큰 손재수를 입는 군겁쟁재(群劫爭財)의 리스크를 단호하게 통제하셔야 합니다.`;
        } else if (dayStemElVal === "토") {
          seounPersonalizedDesc = `이 천지합화의 불꽃 기맥은 토(土) 일간인 ${name}님에게는 거대한 대지를 따뜻하게 굳혀주는 인성(印星)의 막강한 생조로 작용합니다. 학위 취득, 승진 시험 합격, 혹은 아주 우량한 계약 문서를 안정적으로 취득하여 평생의 기반을 닦는 상서로운 흐름입니다. 다만, 내 영혼이 너무 편안하고 든든하여 행동을 미루거나 생각의 함정에 갇혀 관망만 하다 골든타임을 놓칠 수 있으니, 확실한 계획을 수립했다면 망설이지 않고 즉각 몸을 움직이는 돌파력을 병행하십시오.`;
        } else if (dayStemElVal === "금") {
          seounPersonalizedDesc = `이 천지합화의 불꽃 기맥은 금(金) 일간인 ${name}님에게는 거친 불길로 무쇠를 완벽한 명검으로 제련해 내는 관성(官星)의 시험대로 작동합니다. 직위 상승, 공적 책임의 확대, 가문의 명예 등 삶의 뼈대를 굳건히 세우는 찬란한 기회가 옵니다. 단, 제련 과정에서의 관성 스트레스와 정신적 건조증이 상당하므로 뼈, 관절, 기관지 건강을 철저히 사수해야 합니다. 무리한 자금 조달이나 이자 대출을 지양하고 내적인 연착륙을 지향하는 것이 명검이 되는 지름길입니다.`;
        } else {
          seounPersonalizedDesc = `이 천지합화의 불꽃 기맥은 수(水) 일간인 ${name}님에게는 물이 불을 가두고 성과를 낚아채는 재성(財星)의 보물 창고가 열림을 뜻합니다. 평생 중 가장 큰 재물적 파동 och 투자 회수, 금전 계약 성취의 역동적인 판이 짜이게 됩니다. 단, 병오년의 불꽃은 산 전체를 태울 만큼 거대하므로, 내 이성적인 통제력과 확실한 현금 잔고 수비가 병행되지 않은 채 성급히 불타기 투자를 시작하면 불길에 내 물줄기가 전부 증발하는 낭패를 보니, 단계적으로 이익을 현금 자산으로 수성하십시오.`;
        }

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
                2026년 병오년은 하늘의 환하고 눈부신 태양이자 만물을 비추는 순수 불꽃인 <strong>병화(丙火)</strong>와 지상의 거대한 용광로이자 쉬지 않고 거칠게 질주하는 준마인 <strong>오화(午火)</strong>가 위아래로 하나를 이루며 다가오는 격정적인 해입니다. 명리학에서는 이처럼 천간과 지지가 모두 화(火) 기운으로 강력하게 결합한 형세를 <strong>천지합화(天地合火)</strong>라 칭하며, 우주의 팽창력 och 열정이 극한에 다다르는 시기로 정의합니다.
              </p>
              <p className="text-justify font-light">
                {seounPersonalizedDesc}
              </p>
              <p className="text-justify font-light">
                이 맹렬한 기맥 하에서는 온 세상의 라이프사이클 속도가 무서우리만치 빨라집니다. 감추어졌던 어두운 위선이나 묵은 조직의 모순들이 태양 아래 적나라하게 폭로되며 강제적인 개혁과 정리가 단행되고, 문화, 기술, IT 산업에서는 기존 패러다임을 뒤흔드는 파괴적 혁신이 불길처럼 번집니다. 개인 역시 그간 억눌러 왔던 자립심과 열망이 폭발하여 이직, 독립, 새로운 공부나 비즈니스에 도전하고자 하는 마음의 역동성이 최대로 상승하게 됩니다.
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

      case "ny_elements_supplement": {
        const waterCountVal = sajuInfo.elements?.수 || 0;
        const metalCountVal = sajuInfo.elements?.금 || 0;
        const waterNeed = Math.min(95, Math.max(50, 95 - waterCountVal * 15));
        const metalNeed = Math.min(95, Math.max(50, 95 - metalCountVal * 15));
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
                      <span>{waterNeed}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E6EFEA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D5A27] rounded-full" style={{ width: `${waterNeed}%` }} />
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
                      <span>{metalNeed}%</span>
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
      }

      case "ny_health_presc": {
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const waterCountVal = sajuInfo.elements?.수 || 0;
        const metalCountVal = sajuInfo.elements?.금 || 0;
        const cardioRisk = Math.min(99, Math.max(40, 50 + fireCountVal * 10));
        const pulmonaryRisk = Math.min(95, Math.max(30, 85 - metalCountVal * 10 + fireCountVal * 5));
        const renalRisk = Math.min(95, Math.max(30, 85 - waterCountVal * 10 + fireCountVal * 5));
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
                      <span>{cardioRisk}% ({cardioRisk >= 80 ? "위험" : "주의"})</span>
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
                      <span>{pulmonaryRisk}% ({pulmonaryRisk >= 80 ? "위험" : pulmonaryRisk >= 60 ? "주의" : "약화"})</span>
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
                      <span>{renalRisk}% ({renalRisk >= 80 ? "위험" : renalRisk >= 60 ? "주의" : "약화"})</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${renalRisk}%` }} />
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
      }
            case "ny_mind_meditation": {
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const mindCalmRate = Math.min(99, Math.max(70, 95 - fireCountVal * 5));
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">정신 수양 보감 (精神 修養 寶鑑)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조급함을 다스리는 마음가짐</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)의 거대한 불꽃 기운은 우리 내면에서 깊은 조급함과 불만족, 충동적인 감정 과열을 쉽게 자극합니다. 스트레스를 방치하면 그간 이룩한 평판과 중요한 인간관계를 순식간에 불태워 버릴 수 있으므로 혜안의 감정 쿨다운 요법이 절대적으로 요구됩니다.
              </p>
              
              {/* 명상 명리 가이드 카드 */}
              <div className="bg-[#FAF7F0] p-5 rounded-xl border border-[#E2DDD5]/60 space-y-4 shadow-inner">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/40 pb-2">
                  <span className="font-bold text-[#8B221E] flex items-center gap-1.5">🧘 3분 냉각 호흡 명상법</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">감정 과열 {mindCalmRate}% 진정</span>
                </div>
                
                {/* 시각화: 3단계 프로세스 */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-light">
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">1단계: 이완</span>
                    <p className="text-[9px] text-gray-500 leading-normal">스마트폰을 끄고 편안히 척추를 세워 앉기</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">2단계: 수용</span>
                    <p className="text-[9px] text-gray-500 leading-normal">코로 시원한 공기를 가만히 마시기</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">3단계: 정화</span>
                    <p className="text-[9px] text-gray-500 leading-normal">타오르는 불꽃이 식는 호수 시각화</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-600 font-light text-justify pt-1 border-t border-[#E2DDD5]/30">
                  매일 분노가 머리끝까지 솟구치거나 불안감이 들 때, 의식적으로 10초간 호흡을 멈춘 뒤 차가운 물 한 모금을 마시고 이 세 가지 이완 요법을 차분히 따라 하십시오. 날뛰는 교감신경을 정돈하고 맑은 수기를 회복해 줍니다.
                </p>
              </div>
            </div>
          </div>,
          "스트레스 조율 및 정신 건강 명상 처방"
        );
      }

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
                2026년 병오년의 타오르는 불꽃 속에서 의뢰인 {name}님의 기운을 온전히 수호하고 재물운과 명예운을 팽창시켜 줄 행운 비방입니다. 일상 속에서 적극 활용하여 개운을 유도하십시오.
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

            case "ny_season_spring": {
        const woodCountVal = sajuInfo.elements?.목 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        
        const springInnerScore = Math.min(95, Math.max(50, 65 + woodCountVal * 8 + earthCountVal * 4));
        const springOuterScore = Math.min(90, Math.max(30, 40 + fireCountVal * 10));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">봄철 기류 전략 (음력 1~3월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">동트기 전, 차분하게 기초 설계를 다듬는 기간</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                봄철(음력 1월~3월)은 나무(木)의 새싹 기운이 솟구치며 병오년의 불씨를 지피기 위해 땔감을 모으는 시기입니다. 섣불리 밖으로 에너지를 과하게 발산하여 대규모 투자를 단행하거나 성급한 이직 계약을 맺는 것은 운의 저항을 불러옵니다.
              </p>
              
              {/* 시각화: 봄철 기류 지수 */}
              <div className="bg-[#FCF9F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#A3845B] block">📊 봄철 기류 전략 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>내적 내실/기획 안정도</span>
                      <span className="text-[#A3845B]">{springInnerScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${springInnerScore}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>외적 확장/모험 지표</span>
                      <span className="text-gray-400">{springOuterScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${springOuterScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#E2DDD5]/70 rounded-xl p-4 bg-[#FAF8F5] text-justify space-y-2">
                <span className="font-bold text-xs text-[#1A1A1A] block">🧭 봄철 3대 핵심 실천 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-500 font-light">
                  <li>• <strong>1월 (경인월):</strong> 신규 비즈니스의 세부 기획 수립 및 자료 조사 매진</li>
                  <li>• <strong>2월 (신묘월):</strong> 무리한 창업 충동을 억제하고 사소한 말실수 조절 철저</li>
                  <li>• <strong>3월 (임진월):</strong> 귀인의 협력을 받아 문서 및 행정 서류 문제를 해결할 기회 활용</li>
                </ul>
              </div>
            </div>
          </div>,
          "봄철 계절적 세부 기운과 전략"
        );
      }

            case "ny_season_summer": {
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const waterCountVal = sajuInfo.elements?.수 || 0;
        
        const summerImpulsiveness = Math.min(99, Math.max(50, 60 + fireCountVal * 10));
        const summerStability = Math.min(95, Math.max(20, 90 - fireCountVal * 10 + waterCountVal * 5));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">여름철 기류 전략 (음력 4~6월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">최대의 고비, 과열된 가마솥을 피해야 할 시기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                여름철(음력 4월~6월)은 병오년의 불기운이 절정에 달하여 대지가 펄펄 끓는 격동의 시기입니다. 자존심 대립이 극에 달해 상사와의 마찰이 우려되거나 홧김에 직장을 이탈하려는 흉조(午午 자형)가 강해집니다. 이 시기에는 철저한 수비가 최고의 전략입니다.
              </p>
              
              {/* 시각화: 여름철 기류 지수 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-900 block">📊 여름철 기류 위험 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-700">
                      <span>감정 기복 & 충동 위험도</span>
                      <span className="text-red-700">{summerImpulsiveness}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${summerImpulsiveness}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 성정 조율도</span>
                      <span className="text-gray-400">{summerStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${summerStability}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-red-100 rounded-xl p-4 bg-[#FFFBFB]/50 text-justify space-y-2">
                <span className="font-bold text-xs text-red-950 block">🧭 여름철 3대 생존 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-red-900 font-light">
                  <li>• <strong>4월 (계사월):</strong> 탈수 방지 및 심혈관계 만성 피로와 상열감 완화 집중</li>
                  <li>• <strong>5월 (갑오월):</strong> 사직서 제출, 뇌동 투자 절대 엄금. 중대 결정을 가을로 유보</li>
                  <li>• <strong>6월 (을미월):</strong> 뜬소문에 의한 투자 금지. 통장 현금 잔고 50% 이상 보수적 잠금</li>
                </ul>
              </div>
            </div>
          </div>,
          "여름철 계절적 세부 기운과 전략"
        );
      }

            case "ny_season_autumn": {
        const metalCountVal = sajuInfo.elements?.금 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        
        const autumnHarvest = Math.min(95, Math.max(50, 60 + metalCountVal * 10));
        const autumnDocument = Math.min(95, Math.max(50, 55 + earthCountVal * 8 + metalCountVal * 5));
        const autumnInvestment = Math.min(95, Math.max(40, 50 + earthCountVal * 10));
        const autumnControl = Math.min(95, Math.max(30, 90 - fireCountVal * 10 + metalCountVal * 5));
        
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
                      <span className="text-[#8A6F4C]">{autumnHarvest}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${autumnHarvest}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 및 계약 성취도</span>
                      <span className="text-[#8A6F4C]">{autumnDocument}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: `${autumnDocument}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 투자 지향성</span>
                      <span className="text-[#A3845B]">{autumnInvestment}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: `${autumnInvestment}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>과열 기류 제어도</span>
                      <span className="text-[#A3845B]">{autumnControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: `${autumnControl}%` }} />
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
      }

      case "ny_season_winter": {
        const waterCountVal = sajuInfo.elements?.수 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const metalCountVal = sajuInfo.elements?.금 || 0;
        
        const winterStability = Math.min(95, Math.max(40, 60 + waterCountVal * 8 + earthCountVal * 5));
        const winterRecharge = Math.min(95, Math.max(50, 55 + waterCountVal * 10 + metalCountVal * 5));
        const winterRisk = Math.min(90, Math.max(10, 15 + fireCountVal * 10 - waterCountVal * 5));
        const winterLanding = Math.min(95, Math.max(40, 50 + earthCountVal * 8 + waterCountVal * 6));
        
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
                      <span className="text-[#2A4B7C]">{winterStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: `${winterStability}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#2A4B7C]">
                      <span>정신적·육체적 재충전 효율</span>
                      <span className="text-[#2A4B7C]">{winterRecharge}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: `${winterRecharge}%` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-500">
                      <span>무리한 투자 위험 노출도</span>
                      <span className="text-red-700">{winterRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: `${winterRisk}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>차기 대운 기류 안착률</span>
                      <span className="text-gray-700">{winterLanding}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: `${winterLanding}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 실천 가이드 */}
              <div className="border border-blue-100 rounded-xl p-4 bg-[#FAFBFD]/50 text-justify space-y-2">
                <span className="font-bold text-xs text-[#2A4B7C] block">🧭 겨울철 3대 생존 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-650 font-light">
                  <li>• <strong>음력 10월 (을해월):</strong> 자산 수성에 만전을 기할 시기입니다. 겉보기만 그럴싸한 지인의 동업 제안이나 신규 투자를 단호히 거절하십시오.</li>
                  <li>• <strong>음력 11월 (병자월):</strong> 자오충(子午沖)의 수화 마찰 기류가 강해집니다. 주거지 이전이나 급작스러운 계약은 피하고, 심장과 신장 건강을 회복하십시오.</li>
                  <li>• <strong>음력 12월 (정축월):</strong> 2026년의 전체적인 성과와 자산을 안전하게 정산하고, 2027년 정미년(丁未年)의 새로운 세운 로드맵을 기획하기 좋은 갈무리 적기입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "겨울철 계절적 세부 기운과 전략"
        );
      }

      case "ny_monthly":
        const m = page.monthNum;
        const monthTitles = {
          1: "입춘(立春)과 우수(雨水)가 교차하며 얼어붙었던 대지가 녹고 새로운 나무의 기운이 싹트는 경인월(庚寅月)입니다. 올해 병오년의 불씨를 지피기 위해 땔감을 모으고 기초 설계를 다듬는 명리 서막의 시기입니다. 섣부른 계약이나 대규모 자금 투자는 운명적 마찰력을 높이므로 피하십시오. 직장 내에서는 새로운 기획서 작성, 시장 분석, 물밑 협상에 주력하는 것이 최고의 생존 전략입니다. 성급히 나섰다가는 경쟁자들에게 내 패를 읽혀 도중에 기류가 꺾일 수 있으니 주의해야 합니다.",
          2: "경칩(驚蟄)과 춘분(春分)이 지나며 초목에 푸른 생명력이 가득 차오르는 신묘월(辛묘月)입니다. 목(木) 기운이 활성화되어 병오년의 화기(火氣)를 부채질하는 국면으로 진입합니다. 내면에서 강한 독립 의지와 이직, 창업 욕구가 샘솟아 마음이 웅장해지기 쉽습니다. 하지만 아직 지상의 온도가 충분치 않으므로 겉보기식 확장은 금물입니다. 특히 가까운 동료나 가족과의 사소한 대화 중 자존심을 건드리는 말실수로 인해 묵은 갈등이 폭발할 수 있으니 10초 묵언 수행을 철저히 실천하십시오.",
          3: "청명(淸明)과 곡우(穀雨)를 거치며 비옥한 습토가 뜨거워지는 기류를 부드럽게 흡수해 주는 임진월(壬辰月)입니다. 물기를 머금은 흙(濕土)이 유입되어 운세 전반에 단비가 내리는 격입니다. 문서운, 계약운, 시험운이 대단히 안정을 찾게 되며 오랫동안 꼬여있던 복잡한 행정적 난제나 소송 시비가 조용히 타결되는 상서로운 흐름입니다. 평소 어려워했던 인맥에게 가벼운 안부를 전하며 도움을 요청하면 기대 이상의 든든한 백업을 받아 문제를 매끄럽게 처리할 수 있습니다.",
          4: "입하(立夏)와 소만(小滿)이 도래하며 초여름의 뜨거운 사화(巳火) 기운이 세상을 뒤덮는 계사월(癸巳月)입니다. 공중의 수분이 빠르게 증발하여 기류가 건조해지고 심리적 피로도가 급격하게 증가하는 타이밍입니다. 의욕은 앞서지만 쉽게 지치고 만성 피로나 두통, 안구건조증이 나를 괴롭히기 쉽습니다. 무리한 장거리 이동이나 과도한 밤샘 업무는 신체 밸런스를 붕괴시키니 서늘한 실내에서 주기적으로 수분을 보충하고 머리를 식히는 습관을 기르십시오.",
          5: "망종(芒종)과 하지(夏至)를 지나며 하늘과 땅에 가장 뜨거운 용광로의 불길이 중첩되는 갑오월(甲午月)입니다. 세운의 오화(午火)와 이번 달의 오화가 겹치며 스스로를 옭아매는 오오자형(午午自刑)의 흉조가 도사립니다. 사소한 일에 욱하고 감정이 폭발하여 오랫동안 쌓아온 평판을 한순간에 날려버리거나, 홧김에 중요한 직장에 사직서를 던지는 충동성이 극대화됩니다. 중대한 도장 찍기나 감정적 대화는 뒤로 미루고, 침착한 타협책을 찾는 것만이 액운을 피하는 방법입니다.",
          6: "소서(小暑)와 대서(大暑)를 통과하며 대지가 한낮의 열기로 가득 차 숨이 턱턱 막히는 을미월(乙未月)입니다. 메마른 흙(燥土)이 화기를 가두어 팽창력이 극대화되므로 경제적 손재의 위험(군겁쟁재)이 도처에 깔려 있습니다. 남들의 솔깃한 투자 권유나 대박 루머에 휩쓸려 큰돈을 베팅했다가는 묶이거나 증발해 버리기 십상입니다. 지갑을 단단히 닫고 보수적인 적금 형태 위주로 자산을 갈무리하며 현상을 유지하는 수비적 전략이 백번 안전합니다.",
          7: "입추(立秋)와 처서(處暑)를 맞이하며 마침내 서늘한 가을 바람이 불어와 타오르는 잔열을 정화해 주는 병신월(丙申月)입니다. 금(金)의 결실 에너지가 유입되어 나를 가두고 짓눌렀던 답답한 기류가 한순간에 트이는 극적인 터닝 포인트입니다. 막혔던 비즈니스 자금 흐름이 매끄럽게 정산되거나, 나에게 든든한 제안을 건네는 귀인이 서쪽 방면에서 찾아오는 상서로운 달입니다. 적극적으로 명함을 돌리고 내 아이디어를 공개 발표하여 운의 서광을 움켜쥐십시오.",
          8: "백로(白露)와 추분(秋分)을 지나며 맑고 깨끗한 서리가 내려 알찬 오행의 열매를 완성해 주는 정유월(丁酉月)입니다. 금(金)의 기운이 최절정에 달하여 명예 상승, 승진 영전, 계약 체결 등 실질적인 보상과 경제적 이권이 주머니에 쓸어 담기는 최고의 달입니다. 평소 도전하고 싶었던 연봉 협상이나 중요한 문서상의 취득은 이번 달의 기운을 활용하여 과감하게 추진하십시오. 기대 이상의 매끄럽고 압도적인 성과가 보장됩니다.",
          9: "한로(寒露)와 상강(霜降)을 거치며 수확을 끝낸 들판을 단단히 정리정돈하고 창고의 자물쇠를 채우는 무술월(戊戌月)입니다. 건조한 흙의 기운이 들어와 한 해 동안 거두었던 자산을 안전하게 갈무리하도록 유도합니다. 지출 관리에 만전을 기하고 충동적인 쇼핑이나 사치성 비용을 억제하며 내실을 다지십시오. 차분하게 통장 잔고를 확인하고 장기 자산 포트폴리오를 다각화하기에 최적의 이성적 타이밍입니다.",
          10: "입동(立冬)과 소설(小雪)이 찾아와 지상의 모든 타오르던 불기를 흔적 없이 잠재우는 기해월(己亥月)입니다. 차갑고 깊은 해수(亥水)의 물줄기가 유입되어 그간 나를 피로하게 만들었던 구설수나 대인관계의 얽힌 실타래들이 시원하게 씻겨 내려갑니다. 그동안 나를 외롭게 만들거나 대립했던 상사, 동료들과의 오해가 눈 녹듯 풀리고, 편안한 대화의 물꼬가 열려 아늑한 정신적 평온을 되찾게 되는 귀한 시기입니다.",
          11: "대설(大雪)과 동지(冬至)를 관통하며 차가운 한겨울의 강물이 세운의 불꽃과 격렬하게 마주치는 경자월(庚子月)입니다. 자오충(子午沖)의 충돌 기류가 월운에서도 중첩되므로 갑작스러운 이사, 해외 출장, 혹은 부서 재배치 등 급격한 물리적 공간의 변동수가 발생합니다. 급작스러운 변화를 두려워하지 말고 흐름을 즐기되, 빙판길 안전사고나 신체 급격한 온도차로 인한 면역력 저하에 특히 유의하며 스케줄을 조율하십시오.",
          12: "소한(小寒)과 대한(大寒)을 통과하며 얼어붙은 겨울 흙이 온기를 품은 채 다가오는 정미년 새해의 서광을 준비하는 신축월(辛丑月)입니다. 1년간의 땀 방울과 성패를 엄숙히 정돈하고 마음의 휴식을 취하는 정돈의 계절입니다. 무리한 외부 활동을 전면 통제하고, 나만의 침실 조명을 낮춰 명상하며 다가올 새해의 3대 계획을 선명하게 다이어리에 적어 정리정돈하는 것이 가장 상서로운 액막이 행동입니다."
        };
        const monthDetailsEnriched = {
          1: {
            wealth: "재정적으로는 지출 통제가 최우선 과제입니다. 겉보기에는 신규 거래나 수입 기회가 도래하는 듯 보이지만, 실질적인 입금까지는 마찰이 예상됩니다. 예산을 20% 보수적으로 잡으십시오.",
            love: "연인 관계에서는 감정 조절이 조율의 핵심입니다. 내면의 조급함이 겉으로 표출되어 상대방을 다그치기 쉬우니 한 템포 물러서서 배려 어린 침묵을 유지하는 것이 사랑을 지키는 비법입니다.",
            health: "겨울철 정체되었던 기혈 순환을 돕는 가벼운 스트레칭이 필수적입니다. 찬바람을 쐬며 기관지가 약해지기 쉬우니 외출 시 스카프나 목도리로 목을 보호하십시오.",
            wealthVal: 2, loveVal: 3, healthVal: 2
          },
          2: {
            wealth: "독립적인 투자나 주식 투기에 손을 뻗기 쉬운 달이나 낙심할 우려가 큽니다. 확실한 전문가의 서류 검증 없이 지인의 말만 믿고 돈을 빌려주거나 투자하는 행위는 절대 엄금입니다.",
            love: "연인 간의 데이트 시 자존심을 건드리는 농담이 큰 싸움으로 번집니다. '내가 맞고 네가 틀리다'는 식의 논쟁을 멈추고 부드러운 눈빛과 경청의 대화법을 실천하십시오.",
            health: "목 기운의 팽창으로 간에 피로가 쉽게 누적됩니다. 늦은 시간의 불필요한 과음을 완전 차단하고, 녹색 채소와 수분이 풍부한 식단을 가까이 하십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 3
          },
          3: {
            wealth: "문서와 계약으로 인한 재물적 이득이 보장되는 달입니다. 묶여 있던 전세금 반환, 계약금 입금 등 기분 좋은 목돈의 소식이 도래합니다. 부동산 계약이나 자격증 관련 비즈니스를 추진하기에 대단히 좋습니다.",
            love: "싱글의 경우, 조력자의 주선이나 소개팅을 통해 나에게 편안한 정서적 지지를 건넬 진중한 인연을 만나게 될 운명의 서광이 강력하게 비춥니다. 적극적으로 나서십시오.",
            health: "위장 장애와 소화 불량이 발생할 우려가 있으니 규칙적인 식사 시간을 유지하고, 식후 20분 동안 가볍게 대지를 딛으며 걷는 행동을 추천합니다.",
            wealthVal: 5, loveVal: 4, healthVal: 3
          },
          4: {
            wealth: "매출 증대나 보너스 기류가 잠시 보이지만 그만큼 품위 유지비나 돌발 지출이 함께 폭증하여 실속이 떨어집니다. 가계부를 꼼꼼히 적으며 불필요한 고정비를 과감히 다이어트하십시오.",
            love: "연인의 사소한 거짓말이나 감춤으로 인해 내면의 예민함이 증폭될 수 있습니다. 윽박지르기보다는 차분히 대화를 유도하여 상대의 진짜 속마음을 조용히 확인해 보십시오.",
            health: "체내 수분이 급격히 메말라 안구 건조 및 피부 가려움증이 심해집니다. 하루 8잔 이상의 맑은 물을 주기적으로 음용하여 세포에 수분을 공급하십시오.",
            wealthVal: 3, loveVal: 2, healthVal: 2
          },
          5: {
            wealth: "손재수와 관재 구설의 위험이 도처에 깔린 가장 위험한 달입니다. 동업이나 신규 확장 투자는 절대 파탄에 이르니 기존 자산을 완전히 잠금 계좌에 대피시켜 수비하십시오.",
            love: "부부나 연인 사이에 홧김에 이별을 통보하거나 돌이킬 수 없는 상처를 주기 쉽습니다. 갈등 발생 시 즉시 자리를 피해 30분 동안 혼자만의 침묵 명상 시간을 가지십시오.",
            health: "심혈관 질환이나 갑작스러운 가슴 두근거림, 혈압 상승에 각별히 유의해야 합니다. 땀을 뻘뻘 흘리는 격렬한 운동보다는 차분한 스트레칭과 요가를 권장합니다.",
            wealthVal: 1, loveVal: 1, healthVal: 1
          },
          6: {
            wealth: "부동산 청약이나 주식 시장의 뜬소문에 속아 재산을 탕진할 위험이 높습니다. 공격적인 재테크 대신 적금 비율을 15% 이상 높이고 내 자산의 실질적 잔고를 방어하는 데 올인하십시오.",
            love: "상대방에 대한 집착이나 불필요한 의심이 깊어져 숨통을 조이게 만들기 쉽습니다. 서로에게 혼자만의 여유 시간을 허락하여 정서적 신뢰의 균형을 되찾으십시오.",
            health: "만성 체증과 더위로 인한 탈수 증상이 요동치니 야외 활동 시 반드시 이온음료나 물병을 소지하시고, 기름지고 매운 식단을 최대한 멀리하십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 2
          },
          7: {
            wealth: "기다리던 금전의 혈맥이 시원하게 뚫리며 사업적 파트너로부터 대대적인 투자를 받거나 미수금이 말끔히 입금되는 경사스러운 달입니다. 적극적으로 영업력을 발휘하십시오.",
            love: "오랫동안 어긋났던 연인 관계의 갈등이 마법처럼 자연스럽게 풀려 애정이 다시 불타오릅니다. 연인에게 정성 가득한 손 편지나 작은 실버 선물을 건네보십시오.",
            health: "그간 누적되었던 만성 피로가 해소되고 컨디션이 대대적으로 회복되는 시기입니다. 가벼운 유산소 운동으로 기초 근력을 한 단계 단단히 다져두기에 최적입니다.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          8: {
            wealth: "직장인은 연봉 대폭 인상이나 상여금 수령, 비즈니스 사업가는 고수익 계약 성사가 완벽하게 담보됩니다. 2026년 중 자산을 가장 크게 불릴 수 있는 골든 먼스이므로 집중하십시오.",
            love: "싱글은 나의 지적이고 고급스러운 매력에 반한 훌륭한 인성이 나에게 다가와 다정하게 고백할 흐름입니다. 연인은 양가 부모님께 인사를 드리거나 미래를 약속하기 좋습니다.",
            health: "호흡기가 건조해지며 마른기침이나 환절기 감기가 찾아올 수 있으니, 도라지청이나 따뜻한 둥굴레차를 수시로 마셔 목을 촉촉하게 코팅해주십시오.",
            wealthVal: 5, loveVal: 5, healthVal: 3
          },
          9: {
            wealth: "수익을 수확하고 보관하는 창고 마감의 기간입니다. 충동적인 쇼핑이나 사치스러운 기분 내기용 소비를 억제하고 통장에 자금을 잠가 현명하게 내실을 지키십시오.",
            love: "연인 간의 관계가 다소 정체되어 권태감을 느끼기 쉬운 시기입니다. 겉보기 화려한 장소 대신 조용하고 깊은 대화를 나눌 수 있는 호젓한 교외 데이트를 추천합니다.",
            health: "관절과 뼈마디가 굳거나 근육이 경직되기 쉬운 시기이니 아침저녁으로 온열 찜질이나 가벼운 폼롤러 스트레칭을 생활화하여 부상을 미연에 예방하십시오.",
            wealthVal: 4, loveVal: 3, healthVal: 2
          },
          10: {
            wealth: "돈의 누수가 멈추고 자금 흐름이 대단히 안정화됩니다. 무리한 대출을 상환하거나 포트폴리오를 저위험 자산 위주로 리밸런싱하여 재정적 기초 체력을 다지기에 최고입니다.",
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
        
        const activeDetail = monthDetailsEnriched[m] || { wealth: "", love: "", health: "", wealthVal: 3, loveVal: 3, healthVal: 3 };
        
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
      case "ny_wealth_fortune":
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
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-500">
                      <span>일시적 자산 누수 위험</span>
                      <span className="text-red-700">70%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: "70%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 재물 수호 수칙 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 2026년 재물 수호 안전 수칙</span>
                <ul className="space-y-2.5 text-[10px] text-gray-600 font-light">
                  <li>• <strong>투기성 고위험 자산 진입 금지:</strong> 올해의 기류는 변동 속도가 상상을 초월하여 뇌동 매매에 취약합니다. 상반기(음력 4~6월)에 순간적인 욕심으로 진입한 투자는 큰 손실로 이어질 확률이 높으니 보수적으로 가십시오.</li>
                  <li>• <strong>공동 투자 및 보증 절대 금지:</strong> 사주 내 비견/겁재가 세운의 화기를 만나면 동업자 간의 불화와 수익 분배 갈등이 촉발됩니다. 돈도 잃고 사람도 잃을 운이니 독자적 운영이나 현금 수성에 매진하십시오.</li>
                  <li>• <strong>재물 수렴 골든타임 활용:</strong> 음력 8월(계유월)은 금(金) 기운이 극에 달해 가장 유리한 재무 성과나 보상 합의가 가능하므로, 계약 도장은 이 시기에 찍는 것이 가장 길합니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 재물 및 사업운"
        )

      case "ny_career_fortune":
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
                      <span className="text-[#5F7A68]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>조직 내 조화 및 소통성</span>
                      <span className="text-[#5F7A68]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 성급한 이직 변동성</span>
                      <span className="text-gray-600">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 커리어 전략 카드 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">💡 커리어 조율 개운 비방</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  상반기(음력 4~6월)에는 내부 정비와 핵심 문서 관리에 전념하십시오. 만약 부서 이동이나 이력서 제출 등 적극적인 커리어 변동을 원한다면, 금(金) 기운의 조력이 본격화되는 <strong>하반기(음력 7월 이후)</strong>에 실행해야 후회 없는 완벽한 결정을 이끌어낼 수 있습니다.
                </p>
              </div>
            </div>
          </div>,
          "신년 직장 및 커리어"
        )

      case "ny_love_fortune":
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
                      <span className="text-[#B26E8D]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#B26E8D]">
                      <span>소통 및 경청 원활도</span>
                      <span className="text-[#B26E8D]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 소통 가이드 */}
              <div className="border border-pink-100 rounded-xl p-4 bg-[#FCF6F9]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#B26E8D] block">❤️ 혜안당 애정 개운 솔루션</span>
                <ul className="space-y-2 text-[10px] text-gray-600 font-light">
                  <li>• <strong>솔로:</strong> 대외적인 모임이나 사교 활동 시 화려한 차림보다는 네이비/차콜 계열의 이성적 매력을 드러낼 때 안정적이고 품격 있는 상대가 매칭됩니다.</li>
                  <li>• <strong>기혼/커플:</strong> 음력 5월과 11월의 감정 대립 국면에서 10초만 눈을 감고 미소를 지으십시오. 화기가 가라앉은 뒤 차분하게 이성적으로 대화하는 것이 좋습니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 연애 및 가정운"
        )

      case "ny_study_fortune":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 학업 및 시험운 (新年 學業運)</span>
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
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>논리적 추론 및 분석 암기력</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>두뇌 집중력 유지도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>슬럼프 극복 회복탄력성</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 학습 환경 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🏠 합격운을 부르는 학습 환경 처방</span>
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
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">북향 (北向)</td>
                      <td className="p-2">수(水) 기운을 향해 앉음으로써 상열감을 내리고 정신을 정갈하게 안정시킴</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🎨 환경 색상</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">블루, 네이비, 블랙</td>
                      <td className="p-2">붉은 계열의 소품을 피하고 차가운 보색 배치를 통해 조급증과 불안 유입 방지</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💡 조명 및 소품</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">메탈 조명, 가습기</td>
                      <td className="p-2">스틸 프레임의 LED 스탠드와 책상 위 미니 수경 식물 배치로 합격 기운 보완</td>
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
        )

      case "ny_gossip_defense":
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
                      <span className="text-red-700">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>섭섭함 & 감정 조율도</span>
                      <span className="text-gray-600">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 구설 예방 강령 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-3">
                <span className="font-bold text-xs text-red-950 block">🧭 혜안당 구설 예방 3대 강령</span>
                <ul className="space-y-2 text-[10px] text-red-900 font-light">
                  <li>• <strong>1단계 (10분 보류):</strong> 단체 채팅방이나 회의석상에서 화가 나거나 불만이 끓어오를 때는 즉각 의견을 개진하지 말고, 최소 10분간 심호흡을 하며 자리를 피하십시오.</li>
                  <li>• <strong>2단계 (소셜 미디어 차단):</strong> 홧김에 적는 SNS 글이나 메신저 하소연이 캡처되어 내 등에 칼이 되어 돌아올 수 있으니 사적인 속마음 표출은 극구 제한하십시오.</li>
                  <li>• <strong>3단계 (음력 5월 극도 경계):</strong> 자오충과 오오자형이 겹치는 한여름에는 계약이나 구두 확답 시 반드시 두 번 확인하고 서면 기록을 남겨야 안전합니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 구설 및 시비수 예방 수칙"
        )

      case "ny_sinsal_active":
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
                    <div className="text-xs font-bold text-[#A3845B]">85%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">역마살 (이동·변화)</span>
                    <div className="text-xs font-bold text-[#A3845B]">70%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: "70%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">화개살 (예술·학문)</span>
                    <div className="text-xs font-bold text-[#A3845B]">80%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 신살 상세 정보 */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E2DDD5]/50 pb-2">
                  <span className="font-bold text-[#A3845B] text-[11px]">✨ 도화살 활성 (인기/신용의 골든키):</span>
                  <p className="text-[10px] text-gray-500 mt-1 font-light leading-relaxed">
                    타인에게 나를 노출하고 신뢰감을 주는 힘이 강해집니다. 영업, 마케팅, 연봉 협상 등 타인을 설득하는 안건에서 최상의 무기로 작용합니다.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-[#8A6F4C] text-[11px]">🕯️ 화개살 유입 (독창성과 지혜의 시간):</span>
                  <p className="text-[10px] text-gray-500 mt-1 font-light leading-relaxed">
                    내면의 지혜와 예술적 감각이 최고조로 영글어갑니다. 아이디어를 문서나 기획서, 자격증 취득으로 가공해 무형의 가치로 축적하는 데 탁월합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 3대 신살 작동 현황 분석"
        )

      case "ny_gwiin_harmony":
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
                      <td className="p-2.5">말띠, 개띠 (삼합 조화)</td>
                      <td className="p-2.5">업무의 분산과 프로젝트 성과 가속화</td>
                    </tr>
                    <tr className="border-b border-emerald-100/50">
                      <td className="p-2.5 font-semibold text-emerald-950">👑 직장 상사 귀인</td>
                      <td className="p-2.5">양띠 (오미육합 상생)</td>
                      <td className="p-2.5">부서 갈등 조율 및 연봉 상승 추천</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-emerald-950">🗺️ 방위 및 공간</td>
                      <td className="p-2.5">북쪽 (수 기운 충만)</td>
                      <td className="p-2.5">계약서 조율 및 사무용 책상 배치 권장</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100 text-[10px] text-emerald-900 leading-relaxed font-light">
                💡 <strong>귀인 유인책:</strong> 올해 나에게 부족한 기운인 메탈 시계나 실버 주얼리를 매치하고, 북쪽에서 전달되는 조언에 마음의 빗장을 열 때 귀인의 협조가 극대화됩니다.
              </div>
            </div>
          </div>,
          "신년 인연 및 귀인 조화 분석"
        )

      case "ny_warning_period":
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
                      <span>95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🌊 음력 11월 (경자월: 자오충 대립)</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 액난 방어 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-2">
                <span className="font-bold text-xs text-red-950 block">🛡️ 액막이 및 안전 방어 비책</span>
                <ul className="space-y-1 text-[10px] text-red-900 font-light">
                  <li>• 음력 5월에는 무조건 투자를 유예하고 사직서 제출 등 충동적 결정을 보류하십시오.</li>
                  <li>• 음력 11월에는 장거리 야간 운전을 자제하고, 계약 서명 시 세무 검토를 두 번 하십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "치명적인 액난 경보 및 방어 비책"
        )

      case "ny_worry_solution":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 솔루션 (苦悶 解決)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인의 현실적인 고민에 대한 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님이 제출하신 현실적인 고민 안건에 대하여 명리 연구소의 정밀 운기 분석을 바탕으로 도출한 대안 및 행동 실천 로드맵입니다. 마음의 조급함과 불필요한 생각의 감옥(과다 인성)을 해제하고 선선한 가을철 금(金) 기운을 기점으로 자금과 계약서를 철저히 설계 및 조율해 나간다면, 리스크를 완벽하게 차단하고 원하는 결실의 대부분을 쟁취할 수 있습니다.
              </p>

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 (3열) */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">⏳ 1단계: 수성 & 보류</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 계약이나 변동을 일체 금하고 내실을 다지십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📑 2단계: 법적 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    음력 8월의 선선한 금 기운을 기점으로 자금 설계 확인 및 전문 서류 계약의 법적 검토를 단행하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3단계: 성과 안착</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    연말 음력 10월 이후, 상사 귀인의 조력을 득해 최종 계약서에 서명함으로써 고민을 원만히 갈무리하십시오.
                  </p>
                </div>
              </div>

              {/* 추가 개운 비책 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 실천 요결</span>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                  성급한 출발보다 안전장치를 두 겹으로 두르고 시작할 때 85%의 성취율을 쟁취합니다. 동요하지 말고 계획된 단계에 맞추어 움직이십시오.
                </p>
              </div>
            </div>
          </div>,
          "고민 해결 맞춤형 솔루션"
        );

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

        let metricsData = { success: 85, negotiation: 80, control: 75, synergy: 90 };
        if (worryCategory === "love") {
          metricsData = { success: 88, negotiation: 72, control: 68, synergy: 85 };
        } else if (worryCategory === "career") {
          metricsData = { success: 82, negotiation: 78, control: 72, synergy: 90 };
        } else if (["wealth", "business", "startup", "trade", "facility"].includes(worryCategory)) {
          metricsData = { success: 80, negotiation: 85, control: 70, synergy: 82 };
        } else if (worryCategory === "exam") {
          metricsData = { success: 85, negotiation: 65, control: 80, synergy: 75 };
        }

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

              {/* 1. 작성하신 안건 분석 대답 (텍스트 우선) */}
              {textSolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">✍️ 작성하신 고민 안건 정밀 처방</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 안건의 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.analysis }} />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.timing }} />
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

              {/* 2. 체크하신 고민 분야 조언 (다음 답변) */}
              {categorySolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">🏷️ 선택하신 [{currentCategoryLabel}] 분야 조언</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 분야별 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.analysis }} />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.timing }} />
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

              {/* 고민 해결 3단계 카드 (3열) */}
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

      case "ny_roadmap_2027":
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
                      <span>자산 안정도 & 굳히기</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 커리어 정착성</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 마찰 조율도</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>건강 및 마인드 안정 지표</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 정미년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 정미년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🔒 1. 자산 굳히기</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">고위험 투자를 정리하고 보수적 정기 예적금이나 부동산 문서 굳히기에 매진하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📂 2. 문서 정비</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">계약서의 만기나 임대차 조건 등을 조기에 재검토하여 숨은 지출 누수를 차단하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🧘 3. 마음 안착</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">과열되었던 경쟁 구도에서 한 걸음 물러나 가족 관계와 건강의 기틀을 정비할 때입니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "2027년 정미년(丁未年) 세운 로드맵"
        )

      case "ny_roadmap_2028":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2028 무신년(戊申年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2028년 무신년(戊申年)은 거대한 황토 대지 무토(戊土)와 단단한 가을 금속 신금(申金)이 상생하는 토생금(土生金)의 해입니다. 지난 2년간 수성하고 정제했던 가치가 마침내 명확한 무형의 무기와 황금으로 제련되어 나타나는 강한 재물 결실기입니다. 투자 성과가 현금화되거나 직장 내 명예 지위가 굳건히 다져지는 인생의 실질적인 번창기 기류를 탑니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 무신년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>실질적 재물 결실 지수</span>
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
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>신규 비즈니스 활성도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대외 평판 & 지위 상승도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 무신년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 무신년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🪙 1. 재물 현금화</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수익이 난 투자 지분이나 부동산 문서를 정갈히 매도해 실질적인 현금 성과를 축적하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🤝 2. 파트너십 구축</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">신용이 검증된 동업자나 조력자 인연을 확보하여 장기 공동 프로젝트를 안착시키십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3. 입격 및 명예</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">조직 내 중추적인 권위를 장악하는 해이니, 책임감을 발휘해 리더십을 입증하십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "2028년 무신년(戊申年) 세운 로드맵"
        )

      case "ny_roadmap_2029":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2029 기유년(己酉年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2029년 기유년(己酉年)은 하늘의 정원 흙 기토(己土)와 땅의 순수한 보석 유금(酉金)이 조우하여 금 기운이 극도에 달하는 결실의 해입니다. 지난 3년간 땀 흘려 가꾼 재력과 명예가 최고의 시너지를 내어 명확한 가치로 영그는 시기입니다. 엉켜 있던 문서 얽힘이 풀리고 장기 투자 성과와 가정의 복록이 한 번에 안착되는 풍성한 수확을 향유하게 됩니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 기유년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물 수확 완성도</span>
                      <span className="text-[#8A6F4C]">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안락성 및 안착률</span>
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
                      <span>전문성/학술적 지위</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>장기 자산 안전성</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 기유년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 기유년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌾 1. 수확의 완성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수년간 축적된 재물 권리와 가치를 명확히 회수하고 통장에 안전하게 적립하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏡 2. 가정의 화합</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">부부 및 가족 관계에 따뜻한 안정이 찾아오니, 주거지를 확정하고 내실을 축원하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🎓 3. 전문권 획득</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">자신의 이름으로 된 공식 자격, 저작권, 특허 등 강력한 지적 재산을 확보하기 길한 해입니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "2029년 기유년(己酉年) 세운 로드맵"
        )

      case "ny_action_rules":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">신년 실천 행동 강령 (新年 行動綱領)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">운명의 흐름을 바꾸는 3대 실천 개운 강령</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                명리학적 흐름을 인위적으로 통제하고 이로운 개운 주파수를 유도하기 위해 일상에서 매일 실천해야 할 3대 행동 규칙입니다.
              </p>

              {/* 강령 카드화 */}
              <div className="space-y-3.5">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#8A6F4C] text-[11px] block mb-1">⚖️ 1. 의사결정의 10분 지연화</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    상반기의 강렬한 불꽃 기운은 성급한 판단과 말실수를 유발합니다. 이메일 전송, 계약 확인, 감정 섞인 대화 시 반드시 10분간의 생각 정리를 거친 후 전달하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#8A6F4C] text-[11px] block mb-1">🌊 2. 차가운 음용수(水) 습관화</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    상열감을 다스리기 위해 매일 오전 미지근한 물 1L 이상을 규칙적으로 섭취하고 반신욕이나 족욕을 생활화하십시오. 체내의 열기를 아래로 내려주는 개운 비결입니다.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#8A6F4C] text-[11px] block mb-1">🪙 3. 금(金) 기운의 외적 튜닝</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    메탈 소재의 안경테, 스틸 시계, 실버 계열 주얼리를 항시 착용하여 대외적인 신뢰도를 구축하고 구설을 방어하는 보호 주파수를 유지하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 개운 실천 3대 행동 강령"
        )

      case "ny_fengshui_interior":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">공간 풍수 처방 (空間 風水)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기류를 조율하는 5대 공간 풍수 설계</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)은 천간과 지지가 모두 강력한 화(火) 기운으로 채워져 가택 내의 수(水) 기운을 증발시키고 금(金) 기운을 녹여 정서적 과열과 재물 누수를 유발하기 쉽습니다. 내가 머무는 주거 및 사무 공간의 오행 배치를 조율하여, 날카로운 살기를 방어하고 조화로운 번영의 기류를 이끌어내십시오.
              </p>

              {/* 시각화 1: 5방위 개운 나침반 (SVG + Interactive Layout) */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-6 space-y-4">
                <span className="font-bold text-xs text-[#5F7A68] block text-center">🧭 병오년 가택 오방(五方) 개운 배치도</span>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  {/* 왼쪽: 오방 나침반 SVG */}
                  <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-md border border-emerald-100/50">
                    <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
                      {/* 외곽 원 */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#5F7A68" strokeWidth="1" strokeDasharray="2,2" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E2DDD5" strokeWidth="0.5" />
                      {/* 십자 가이드선 */}
                      <line x1="50" y1="10" x2="50" y2="90" stroke="#E2DDD5" strokeWidth="0.5" />
                      <line x1="10" y1="50" x2="90" y2="50" stroke="#E2DDD5" strokeWidth="0.5" />
                      
                      {/* 각 오행 영역 색상 반원/호 */}
                      {/* 북 (수): 하단 */}
                      <circle cx="50" cy="82" r="6" fill="#1A2E40" opacity="0.85" />
                      {/* 남 (화): 상단 */}
                      <circle cx="50" cy="18" r="6" fill="#8B221E" opacity="0.85" />
                      {/* 동 (목): 좌측 */}
                      <circle cx="18" cy="50" r="6" fill="#2E5A44" opacity="0.85" />
                      {/* 서 (금): 우측 */}
                      <circle cx="82" cy="50" r="6" fill="#7F8C8D" opacity="0.85" />
                      {/* 중앙 (토): 중앙 */}
                      <circle cx="50" cy="50" r="8" fill="#D4AC0D" opacity="0.9" />

                      {/* 중앙 한자 '土' */}
                      <text x="50" y="52" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">土</text>
                      
                      {/* 방위 텍스트 */}
                      {/* 북(수) */}
                      <text x="50" y="84" transform="rotate(45, 50, 82)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">水</text>
                      {/* 남(화) */}
                      <text x="50" y="20" transform="rotate(45, 50, 18)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">火</text>
                      {/* 동(목) */}
                      <text x="18" y="52" transform="rotate(45, 18, 50)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">木</text>
                      {/* 서(금) */}
                      <text x="82" y="52" transform="rotate(45, 82, 50)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">金</text>
                    </svg>
                    {/* 나침반 바늘 장식 */}
                    <div className="absolute w-1 h-20 bg-gradient-to-b from-[#8B221E] via-[#5F7A68] to-[#1A2E40] rounded-full transform rotate-12 shadow-sm pointer-events-none" />
                    <div className="absolute w-3 h-3 bg-white border-2 border-[#5F7A68] rounded-full" />
                  </div>

                  {/* 오른쪽: 방위별 간략 설명 */}
                  <div className="flex-1 space-y-2 text-[10px] w-full">
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#1A2E40]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">북쪽 (水)</span>
                      <span className="text-gray-500">침실 배치. 상열감 해소, 면역 및 숙면 유도</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#7F8C8D]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">서쪽 (金)</span>
                      <span className="text-gray-500">서재/책상. 금속 소품 매칭, 집중력 및 의지 강화</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#2E5A44]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">동쪽 (木)</span>
                      <span className="text-gray-500">거실 배치. 관엽식물 도입, 생기 및 기류 순환</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#8B221E]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">남쪽 (火)</span>
                      <span className="text-gray-500">주방/환기. 붉은 조율, 과열 방지 및 에너지 안정</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#D4AC0D]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">중앙 (土)</span>
                      <span className="text-gray-500">현관/중심. 노란 매트 및 청결 유지, 재물운 방어</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 시각화 2: 풍수 기류 활성화 게이지 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 신년 가택 풍수 기류 안정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>주거 환경 정서 안정도</span>
                      <span className="text-[#5F7A68]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사무 공간 집중 효율도</span>
                      <span className="text-[#5F7A68]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>현관문 외부 탁기 차단율</span>
                      <span className="text-[#5F7A68]">88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>가택 재물 창고 활성화</span>
                      <span className="text-[#5F7A68]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 개선된 풍수 조견표 */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">🔑 공간별 상세 풍수 가이드</span>
              <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                      <th className="p-2">대상 공간</th>
                      <th className="p-2 text-center">풍수 처방 및 배치</th>
                      <th className="p-2 text-center">권장 컬러</th>
                      <th className="p-2">풍수 조율 및 개운 효과</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🛏️ 침실 (수면방)</td>
                      <td className="p-2 text-center font-medium">북쪽 베개 배치</td>
                      <td className="p-2 text-center text-[#1A2E40] font-semibold">네이비, 딥그레이</td>
                      <td className="p-2">뇌의 상열감을 내리고 깊은 숙면과 면역력을 회복함</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🖥️ 업무 책상 (서재)</td>
                      <td className="p-2 text-center font-medium">우측 메탈 펜꽂이 배치</td>
                      <td className="p-2 text-center text-[#7F8C8D] font-semibold">실버, 화이트</td>
                      <td className="p-2">금(金)의 기류를 활성화해 고도의 판단력 and 아이디어 제고</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🚪 현관 (출입구)</td>
                      <td className="p-2 text-center font-medium">맑은 종 배치, 청결 매트</td>
                      <td className="p-2 text-center text-[#D4AC0D] font-semibold">베이지, 옐로우</td>
                      <td className="p-2">외부의 탁기와 마찰 살기를 맑은 소리로 방어하고 재물 흡수</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🛋️ 거실 (생기 순환)</td>
                      <td className="p-2 text-center font-medium">동쪽 잎 넓은 관엽식물</td>
                      <td className="p-2 text-center text-[#2E5A44] font-semibold">그린, 아이보리</td>
                      <td className="p-2">목(木)의 생기를 통해 정체된 집안의 기류를 순환시키고 가화만사성 유도</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">🍳 주방 (화기 조율)</td>
                      <td className="p-2 text-center font-medium">식칼 숨김 보관, 청결 유지</td>
                      <td className="p-2 text-center text-[#8B221E] font-semibold">브라운, 화이트</td>
                      <td className="p-2">불과 물이 대립하는 공간으로 칼을 숨겨 살기를 억제하고 재물 안정을 꾀함</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🚪</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">현관 정돈</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">출입구에 쓰레기 및 신발 방치를 금해 운기 순환을 기름</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🛌</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">침실 안온</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">창문 쪽에 식물을 두어 외부의 과도한 빛 기류를 차단함</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🖥️</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">서재 메탈화</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">스틸 안경이나 조명 등 쇠의 기운을 학습 공간에 도입</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 공간 풍수 인테리어 처방"
        )

      case "ny_lucky_items":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">행운의 수호 소품 (吉祥 物品)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">사주 결핍을 보완하는 3대 수호 아이템</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 사주 내의 화(火) 기운이 극도에 달하여 주변의 물 기운이 쉽게 증발하고 금속 기운이 녹아내리는 성향을 보입니다. 이러한 오행의 격렬한 쏠림을 보정하고 부족한 기운을 자연스럽게 보완하기 위해 일상에서 늘 지니거나 공간에 배치해야 할 3대 수호 아이템입니다. 파동 에너지를 결합한 풍수 인테리어 소품을 가까이 두어 가택의 탁기를 털어내고 재물과 신용을 수호하십시오.
              </p>

              {/* 시각화: 소품 기류 활성화 게이지 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 수호 소품 에너지 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물운 수호 & 누수 방어율</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>액난 차단 & 가택 평화도</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>심리적 안정 및 집중 보정률</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대외 평판 & 신뢰 상승률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 수호 소품 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 수호 소품 처방 조견표</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">소품 항목</th>
                      <th className="p-2 text-center">관련 오행</th>
                      <th className="p-2 text-center">배치/사용 위치</th>
                      <th className="p-2">기류 개선 효과</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💼 블랙 가죽 지갑</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">수(水)</td>
                      <td className="p-2 text-center">가방 내부 (북쪽 보관)</td>
                      <td className="p-2">물 기운을 모아 화기로 인한 재물 누수 방어</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🔔 황동제 미니 종</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">금(金)</td>
                      <td className="p-2 text-center">현관문 안쪽 고리</td>
                      <td className="p-2">청명한 쇳소리 파동으로 외부 나쁜 탁기를 중화</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💍 실버 메탈 링/주얼리</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">금(金)</td>
                      <td className="p-2 text-center">왼손 검지 또는 약지</td>
                      <td className="p-2">금의 카리스마를 보해 직무 협상 및 대외 신뢰 제고</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 디테일 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🐈</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">검은 가죽 지갑</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수(水)의 기류를 머금어 지출 통제와 금전 수성을 유도합니다.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🔔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">황동제 종</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">문을 여닫을 때의 종소리가 집안 내부로 번영의 울림을 전합니다.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">실버 주얼리</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">강건한 결단 기운을 보하여 구설수로부터 나를 수호합니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 추천 수호 소품 리스트"
        )

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