const fs = require('fs');
const path = require('path');

const targetFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(targetFilePath, 'utf8');

console.log("=== STEP 1: RESTORING CLEAN NEWYEAR PAGE CONTENT ===");

// 1. 기존 getPersonalizedSolution 구버전(837라인 부근) 찾아서 완벽 제거
// 시작 부분: const getPersonalizedSolution = (name, text, category) => {
// 끝 부분: return { analysis, timing, actionPlan };\n};
const oldFuncStart = content.indexOf('const getPersonalizedSolution = (name, text, category) => {');
if (oldFuncStart !== -1) {
  const marker = 'return { analysis, timing, actionPlan };\n};';
  const oldFuncEnd = content.indexOf(marker, oldFuncStart);
  if (oldFuncEnd !== -1) {
    const totalEnd = oldFuncEnd + marker.length;
    content = content.slice(0, oldFuncStart) + "\n// Old getPersonalizedSolution purged\n" + content.slice(totalEnd);
    console.log("Successfully purged old getPersonalizedSolution");
  } else {
    throw new Error("Could not find the end of old getPersonalizedSolution");
  }
} else {
  console.log("Old getPersonalizedSolution not found, maybe already clean");
}

// 2. 신버전 getPersonalizedSolution (강화 및 일간별 강조) 정의
const newPersonalizedSolution = `
const getPersonalizedSolution = (name, text, category, dayStemEl) => {
  const cleanedText = text ? decodeURIComponent(text).replace(new RegExp("<\\\\/?[^>]+(>|$)", "g"), "") : "";
  const el = dayStemEl || "목";

  let analysis = "";
  let timing = "";
  let actionPlan = "";

  if (category === "business" || category === "startup" || category === "trade") {
    analysis = \`의뢰인 \${name}님의 신년 사업 및 창업 안건["\${cleanedText}"]에 대한 정밀 비책입니다. 병오년의 타오르는 화(火) 기운 속에서 사업을 전개할 때는 내 사주의 불 기운과 물 기운의 균형이 가장 큰 성패를 가릅니다. \`;
    if (el === "목" || el === "木") {
      analysis += "귀하의 목(木) 기운은 목생화로 에너지를 과도하게 빼앗기기 쉬운 흐름에 처해 있습니다. 따라서 무리한 사업 확장이나 공격적인 설비 투자는 자금 갈증을 부르니 내실을 기하는 자산 수비가 먼저입니다.";
      timing = "금(金)의 결실 에너지가 조력해 흐름을 잡아주는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 7~9월 가을철</span>이 사업의 숨통이 트이는 골든타임입니다.";
      actionPlan = \`1. 카운터나 매장 입구에 싱그러운 초록색(木) 식물을 배치하여 내면의 주체적인 생명 에너지를 보강하십시오.\\n2. 거래처 미팅 시 네이비(水) 계열 상의를 착용해 물 흐르듯 유연한 계약 체결을 도모하십시오.\\n3. 매장 동쪽(東) 방향에 원목 소품이나 책을 두어 사업 기운을 보강하십시오.\`;
    } else if (el === "화" || el === "火") {
      analysis += "귀하의 화(火) 기운은 병오년의 불꽃 세운과 결합하여 투기적이거나 조급한 성향을 증폭시킬 우려가 큽니다. 동업이나 신규 확장은 필히 억제하고 리스크 수성에 주력하십시오.";
      timing = "열기가 서서히 누그러지고 이성적 판단이 돌아오는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~12월 겨울철</span>이 가장 대길합니다.";
      actionPlan = \`1. 매장 입구에 투명한 유리로 된 작은 실내 분수나 수조(水)를 두어 불필요한 화기를 가라앉히십시오.\\n2. 중요 미팅 시 블랙이나 네이비 의상을 매칭해 이성적이고 차분한 신뢰감을 전하십시오.\\n3. 매장 북쪽(北) 방향을 정갈히 청소하고, 북쪽 서랍에 자금을 보관하십시오.\`;
    } else if (el === "토" || el === "土") {
      analysis += "귀하의 토(土) 기운은 화생토로 든든한 학문과 인프라의 기맥을 수혈받는 좋은 상태입니다. 다만, 신규 투자는 과다한 습담(노폐물)이 낄 수 있으니 꼼꼼한 마진 수치 관리가 필수적입니다.";
      timing = "나의 결실인 금(金) 기운이 발산되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월(酉월) 하반기 및 9월(戌월)</span>이 계약 적기입니다.";
      actionPlan = \`1. 계약 서류 바인더를 노란색(土)이나 베이지 톤으로 정리하여 비즈니스 문서 살(煞)을 예방하십시오.\\n2. 미팅 시 메탈 시계나 실버 주얼리(金)를 착용해 공사 구분이 확실하고 결단력 있는 이미지를 보여주십시오.\\n3. 매장 중앙(中央) 또는 서쪽 서랍에 계약 인감을 깊숙이 보관하십시오.\`;
    } else if (el === "금" || el === "金") {
      analysis += "귀하의 금(金) 기운은 뜨거운 불꽃 세운에 제련되는 형국으로 팽팽한 긴장감이 감도는 상태입니다. 기획이나 제품의 핵심 완성도를 높여야 비로소 빛을 보게 됩니다.";
      timing = "나를 단단히 지탱해줄 토(土)와 금(金) 기운이 함께 동행하는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 7~9월 가을철</span>이 가장 유리합니다.";
      actionPlan = \`1. 사업장 내에 백색(金)이나 실버 포인트 인테리어를 가미해 차가운 제련력을 충원하십시오.\\n2. 미팅 시 황토색/베이지(土) 톤 의상을 매칭해 신뢰성과 탄탄한 중용을 전달하십시오.\\n3. 매장 서쪽(西) 창문을 자주 환기하고 밝은 조명을 두어 재물 누수를 방어하십시오.\`;
    } else {
      analysis += "귀하의 수(水) 기운은 솟구치는 불길과 대립하는 수화상쟁의 세력을 형성하고 있습니다. 자금 흐름의 일시적인 동결이나 수금 지연이 도사리고 있으니 현금 시재를 넉넉히 확보하십시오.";
      timing = "수(水)의 본질적 생명력이 살아나는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~11월 겨울철</span>이 유통망 확보 및 매출 활성화의 골든타임입니다.";
      actionPlan = \`1. 카운터에 검은 가죽 지갑(水)이나 어두운 톤의 포인트를 주어 재정적 안착을 도우십시오.\\n2. 미팅 시 깔끔한 화이트(金) 상의를 조화시켜 금생수로 내 지혜를 든든히 보완해 주십시오.\\n3. 매장 북쪽(北)을 깨끗이 정돈하고 정수기나 물병을 그 방향에 두십시오.\`;
    }
  } else if (category === "facility") {
    analysis = \`의뢰인 \${name}님의 설비투자 및 사업장 확장 안건["\${cleanedText}"]에 대한 처방입니다. 장비 구입이나 대형 리모델링은 사주의 <span style=\\"color: #8A6F4C; font-weight: bold;\\">문서운(인성)과 장비 계약운(관성)</span>의 흐름이 편안할 때 진행해야 고장이나 하자, 금융 비용의 폭증을 예방할 수 있습니다. \`;
    if (el === "목" || el === "木") {
      analysis += "목(木) 일간인 귀하의 경우 세운의 화 기운에 기운이 지나치게 방출되어 성급한 확장 결정을 내릴 리스크가 큽니다. 한 템포 조율이 필요합니다.";
      timing = "문서 기운이 탄탄해지고 계약의 길함이 도래하는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 9월~10월</span>이 최적의 골든타임입니다.";
      actionPlan = \`1. 설비 계약서 보관 시 반드시 초록색이나 청색 바인더를 써서 목기를 충원하십시오.\\n2. 계약 날인 당일에는 차가운 녹차를 음용하며 마인드 컨트롤을 실천해 충동적 사인을 막으십시오.\\n3. 사무실 동쪽(東) 벽면에 원목 프레임의 액자를 두어 개운을 유도하십시오.\`;
    } else if (el === "화" || el === "火") {
      analysis += "화(火) 일간인 귀하는 세운의 타오르는 불길과 만나 급격한 열정이 솟구치므로 리스크 검토를 건너뛸 위험이 있습니다. 설비 견적을 이중으로 교차 검증하십시오.";
      timing = "수(水) 기운의 조율이 본격화되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월(子월) 즈음</span>이 하자 없는 입고의 적기입니다.";
      actionPlan = \`1. 계약서 서명 전 20분간 산책이나 호흡 조율을 통해 머리를 차갑게 식히십시오.\\n2. 어두운 톤(블랙/네이비)의 펜을 써서 날인함으로써 이성적이고 차분한 서명을 도우십시오.\\n3. 사업장 북쪽(北) 방향의 조명을 교체해 정돈된 기류를 충만케 하십시오.\`;
    } else if (el === "토" || el === "土") {
      analysis += "토(土) 일간인 귀하는 주변의 달콤한 확장 권유나 과장된 설비 마케팅에 휘둘릴 여지가 있습니다. 실리적인 평당 단가와 이자 효율을 칼같이 계산하십시오.";
      timing = "금(金) 기운이 탄탄히 기틀을 잡는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월(酉월) 하반기</span>가 시공 하자를 예방하는 최상의 타이밍입니다.";
      actionPlan = \`1. 설비 도면 서류 위에 노란 원석이나 황토색 돌(土)을 얹어두어 나쁜 살(煞)을 억누르십시오.\\n2. 날인 시 실버 링이나 메탈릭 볼펜을 사용해 결단력 있는 계약 도장을 남기십시오.\\n3. 계약을 맺는 미팅 룸의 테이블을 베이지나 브라운 천으로 세팅해 기맥을 고르게 하십시오.\`;
    } else if (el === "금" || el === "金") {
      analysis += "금(金) 일간인 귀하는 화극금의 강한 압박으로 자칫 무리한 레버리지 차입이나 고금리 대출로 자금줄이 경색될 우려가 도사리고 있습니다.";
      timing = "나의 쇠 기운을 탄탄히 보호해 줄 토(土)의 절기인 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 9월(戌월) 가을철</span>이 적절한 자금 융통 시기입니다.";
      actionPlan = \`1. 계약 체결 시 보증보험 및 하자보수 이중 확약서를 반드시 요구해 서류로 철벽 방어막을 치십시오.\\n2. 날인 시 흰색 봉투에 계약서를 고이 담아 보관하여 금기의 상서로움을 튜닝하십시오.\\n3. 사업장의 서쪽(西) 공간에 메탈 수납장을 배치해 안정적인 기류를 완성하십시오.\`;
    } else {
      analysis += "수(수) 일간인 귀하는 물이 불에 부딪쳐 증발하는 형세이므로 대형 설비투자 시 자금 조달 단계에서 뜻밖의 누수나 지연이 생길 수 있습니다.";
      timing = "수 기운의 생조를 수혈받는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월(亥월) 및 11월(子월) 겨울철</span>이 자금 소통과 설치에 가장 상서로운 달입니다.";
      actionPlan = \`1. 계약서 사인 당일 흰색이나 실버(金) 톤 의상을 입어 금생수의 지혜를 발휘하십시오.\\n2. 푸른 빛이 도는 잉크 펜으로 서명해 물의 기류를 자연스레 유통하십시오.\\n3. 확장 대상 공간의 북쪽(北) 모서리에 정갈한 유리 물병을 두어 탁기를 정화하십시오.\`;
    }
  } else if (category === "career") {
    analysis = \`의뢰인 \${name}님께서 고민 중이신 직장 생활 및 이직 안건["\${cleanedText}"]에 대한 사주 매칭 정밀 처방입니다. \`;
    if (el === "목" || el === "木") {
      analysis += "목(木) 일간인 귀하는 세운의 강한 화기 탓에 현 직장에서 자존심 상하는 일로 홧김에 사표를 던질 이직 충동이 대단히 강합니다. 충동적 사직은 필히 삼가십시오.";
      timing = "직장운(관성)과 문서합격운이 편안하게 동행해 안정적인 문을 열어줄 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월(酉월) 하반기 이후</span>가 최고의 골든타임입니다.";
      actionPlan = \`1. 회사 책상 우측에 싱그러운 허브 화분(木)을 두어 일상 스트레스의 열을 흘려보내십시오.\\n2. 이직용 포트폴리오를 정리할 때 파란색/초록색 포인트 디자인을 사용해 에너지를 정돈하십시오.\\n3. 동쪽(東) 방향에 위치한 회사나 기관 위주로 원서를 서류 접수하십시오.\`;
    } else if (el === "화" || el === "火") {
      analysis += "화(火) 일간인 귀하는 세운의 타오르는 불 기류와 융합되어 감정의 진폭이 극대화된 상태입니다. 상사의 지시나 동료 간의 사소한 눈길도 크게 받아들이기 쉽습니다.";
      timing = "열기가 식고 대화 주파수가 차분하게 조율되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~11월 겨울철</span>에 비로소 상생의 문이 열립니다.";
      actionPlan = \`1. 출근 시 블랙이나 차콜 계열의 모노톤 비즈니스 캐주얼을 착용해 나를 차분하게 방어하십시오.\\n2. 책상 위에 투명한 물컵이나 미니 가습기(水)를 두어 불필요한 직장 내 화기를 수시로 다스리십시오.\\n3. 북쪽(北)에 위치한 기업과의 소통이 귀하의 마음에 깊은 정서적 안정을 선사할 것입니다.\`;
    } else if (el === "토" || el === "土") {
      analysis += "토(土) 일간인 귀하는 조직 속에서 묵묵히 버텨내고 있으나, 내적인 소화 효율과 스트레스 습기가 차서 만성 피로를 겪고 있습니다. 이직은 내 재능을 보증하는 문서를 확보할 때 길합니다.";
      timing = "승진 기맥이 깨끗하고 상사 귀인의 밀어줌이 본격화되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 7월~9월 사이</span>가 이동의 대길한 골든먼스입니다.";
      actionPlan = \`1. 면접 미팅 시 옐로우/베이지 계열이나 메탈 장식 시계를 착용해 확실한 신용을 연출하십시오.\\n2. 나만의 고유 직무 영역을 정갈히 매뉴얼화하고, 감정적인 구두 반박은 완전 차단하십시오.\\n3. 서쪽(西) 방향에 자리한 직무가 귀하에게 경제적으로 탄탄한 마진을 보장해 줍니다.\`;
    } else if (el === "금" || el === "金") {
      analysis += "금(金) 일간인 귀하는 화극금의 매서운 칼날 위에 서 있는 상태입니다. 직무에 대한 과도한 책임 지움이나 조직 개편으로 인한 압박이 극에 달해 이직이 불가피해 보일 수 있습니다.";
      timing = "나를 지탱할 기틀과 뿌리가 채워지는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 9월(戌월) 가을철</span>에 비로소 연봉을 높여 유리하게 이동할 수 있습니다.";
      actionPlan = \`1. 이직 포트폴리오를 철저히 숫자로 계량화(金)하여 이성적 성과를 입증하도록 준비하십시오.\\n2. 은색 실버 링이나 메탈 안경테를 활용하여 내적인 신뢰 장벽을 견고히 세우십시오.\\n3. 서북쪽(西北)에 귀하의 잠재력을 높이 평가해 줄 강력한 귀인이 기다리고 있습니다.\`;
    } else {
      analysis += "수(水) 일간인 귀하는 2026년 병오년의 불과 충돌하는 형세라, 업무 실적에 비해 평판이 왜곡되거나 억울한 구설에 오르내릴 소지가 다분합니다. 섣부른 이직 시도보다는 기반 수성이 우선입니다.";
      timing = "문서 계약의 굳건한 서광이 귀하를 비출 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월(子월) 겨울철</span>에 이직 도장을 찍는 것이 뒤탈이 없습니다.";
      actionPlan = \`1. 사내 메신저나 이메일 작성 시 반드시 감정을 뺀 명문화된 서류 형태로 보존하십시오.\\n2. 면접 날 흰색 상의를 입어 금생수로 본인의 직관적 판단과 순발력을 최고조로 올리십시오.\\n3. 서쪽(西)이나 북쪽(北) 방향의 기업 리서치를 꼼꼼히 하시면 대길한 소식이 닿습니다.\`;
    }
  } else if (category === "love") {
    analysis = \`의뢰인 \${name}님께서 겪고 계신 인연 및 연애/관계 갈등["\${cleanedText}"]에 대한 명리학적 솔루션입니다. \`;
    if (el === "목" || el === "木") {
      analysis += "목(木) 일간인 귀하는 자존심이 쉽게 곤두서고 사소한 의견 차이에도 '내가 맞고 네가 틀리다'는 논쟁을 벌이기 쉽습니다. 상대에게 정서적 숨구멍을 열어주어야 합니다.";
      timing = "애정 관계의 묵은 긴장이 풀리고 편안한 소통이 다시 흐르는 시기는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~11월(수 기운의 달)</span>입니다.";
      actionPlan = \`1. 대화 시 상대방을 윽박지르거나 다그치지 마시고 3초 동안 침묵한 뒤 부드럽게 경청하십시오.\\n2. 상대에게 만남 시 푸른색/그린 톤 소품이나 꽃을 건네 목(木)의 따스한 화해 에너지를 전하십시오.\\n3. 대화 장소로 물가나 호수 근처 데이트 코스를 잡아 정서적 긴장을 부드럽게 풀어주십시오.\`;
    } else if (el === "화" || el === "火") {
      analysis += "화(火) 일간인 귀하는 불과 불이 만나 사소한 거짓말에도 감정 폭발이 생기기 쉬우며, 관계 리셋을 쉽게 선언할 만큼 마음의 조급함이 팽배해져 있습니다.";
      timing = "열정의 온도가 차분하게 가라앉고 이성을 되찾을 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월~12월 겨울철</span>이 오해를 풀 수 있는 최적기입니다.";
      actionPlan = \`1. 상대방 연락 속도에 실시간 모니터링을 멈추고 의식적으로 관심사를 취미 운동으로 돌려 열을 식히십시오.\\n2. 만날 때 시크한 블랙/차콜 의상을 착용하여 본인의 과도한 상열감을 감각적으로 제어하십시오.\\n3. 만나는 장소의 테이블 조명을 은은한 톤으로 조율하고 나란히 걸으며 조용히 대화하십시오.\`;
    } else if (el === "토" || el === "土") {
      analysis += "토(土) 일간인 귀하는 한 번 마음의 문을 닫으면 도무지 열지 않으려는 고집과 침묵의 장벽을 쌓아올려 상대방을 답답하게 만들고 있을 수 있습니다. 마음의 습기를 털어내야 합니다.";
      timing = "애정의 신뢰가 다시 싹트고 관계가 안정화되는 시기는 오행의 순환이 좋은 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월~9월 가을철</span>입니다.";
      actionPlan = \`1. 내 속마음을 단답형으로 감추기보다, 준비된 메일이나 정성스러운 문자 한 통으로 묵은 오해를 먼저 꺼내십시오.\\n2. 노란색/브라운 웜톤 소품을 사용해 정서적인 아늑함과 대지 같은 포용력을 발산하십시오.\\n3. 밝고 넓은 오픈 스페이스나 분위기 있는 교외 카페에서 마주 보고 솔직담백하게 소통하십시오.\`;
    } else if (el === "금" || el === "金") {
      analysis += "금(金) 일간인 귀하는 칼날 같은 기준을 세우고 상대를 평가하여, 사소한 섭섭함을 관계의 단절로 성급하게 이어가고 있습니다. 융통성이 필요한 국면입니다.";
      timing = "나를 다스리는 편안한 수생 기운이 도래하는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월(亥월)경</span>에 자연스러운 화해 기류가 돌게 됩니다.";
      actionPlan = \`1. 상대방의 단점이나 사소한 습관을 지적하기보다는 나 자신의 완벽주의 필터를 한 단계 느슨하게 늦추십시오.\\n2. 실버 액세서리나 심플한 스틸 제품을 매칭해 외적 신뢰와 조화로운 매력을 튜닝하십시오.\\n3. 시야가 넓게 확보된 전망 좋은 고층 플레이트나 탁 트인 공원을 나란히 걸으며 속마음을 나누십시오.\`;
    } else {
      analysis += "수(水) 일간인 귀하는 수화 상쟁의 기맥 속에 상대와 나의 타이밍 어긋남으로 인한 오해와 피해의식이 깊게 자리 잡고 있습니다. 감정적 서운함을 억누르고 한걸음 물러나십시오.";
      timing = "물줄기가 차분히 합류하여 깊은 대화 주파수가 완벽히 정돈되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월(子월) 이후</span>가 최고의 만남 골든타임입니다.";
      actionPlan = \`1. 상대를 다그치며 실시간 해명을 요구하지 마시고, 혼자만의 온열 족욕이나 명상으로 마음을 진정시키십시오.\\n2. 만남 시 화사한 화이트(金) 톤 코디를 통해 나를 소생시키고 상대에게 따스하고 유연한 매력을 비추십시오.\\n3. 조용히 커피를 즐길 수 있는 재즈 음악이 흐르는 한적한 카페 데이트를 추천합니다.\`;
    }
  } else if (category === "wealth") {
    analysis = \`의뢰인 \${name}님의 재정적 안건 및 자산 수성["\${cleanedText}"]에 대한 정밀 비책입니다. \`;
    if (el === "목" || el === "木") {
      analysis += "목(木) 일간인 귀하는 세운의 화기에 금전 에너지가 소모되어 버는 수입보다 새어 나가는 누수 경로가 극심한 상태입니다. 귀가 얇아져 투기성 종목에 손을 대기 쉬우니 주의하십시오.";
      timing = "금(金)의 결실 에너지가 나를 보좌해 줄 <span style=\\"color: #8A6F4C; font-weight: bold;\\">가을철(음력 7~9월)</span>이 금전 회수 및 자산 방어에 최적의 시기입니다.";
      actionPlan = \`1. 자산의 70%는 중도 해지가 어려운 강제성 정기 적금이나 미국 채권형 연금에 묶어 두십시오.\\n2. 지갑에 초록색(木) 행운의 카드나 원목 포인트를 두어 재물 수성의 기류를 튜닝하십시오.\\n3. 동쪽(東) 방향에 위치한 은행이나 투자사와의 소통이 귀하에게 길한 자금 통로를 엽니다.\`;
    } else if (el === "화" || el === "火") {
      analysis += "화(火) 일간인 귀하는 병오년의 타오르는 거대한 세운 불길로 인해 비겁이 재물을 극하는 군겁쟁재(群劫爭財)의 형국을 띱니다. 지인과의 공동 투자나 돈 거래는 즉각 패가망신을 부릅니다.";
      timing = "열기가 식고 정비 기간에 접어들 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월~12월 겨울철</span>에 비로소 자금 소통의 실마리가 잡힙니다.";
      actionPlan = \`1. 레버리지를 이용한 주식 신용 거래나 고위험 코인 투자는 당장 전량 매도하여 예수금을 굳건히 수비하십시오.\\n2. 블랙(水) 가죽 지갑을 사용하여 불 기운을 조율하고 지출 통제를 일상 속에서 실천하십시오.\\n3. 집안의 북쪽(North) 모서리에 현금이나 카드를 정갈히 보관하는 습관을 지니십시오.\`;
    } else if (el === "토" || el === "土") {
      analysis += "토(土) 일간인 귀하는 든든한 화생토의 수혜를 입으나 위장에 가득 찬 습담처럼 재정 역시 유연하지 않고 계약상 지연이 도사리고 있습니다. 고정비 다이어트가 답입니다.";
      timing = "금전운의 실질적 결실과 소득이 창고에 쌓일 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월(酉월) 및 9월(戌월)</span>이 리밸런싱의 최적 타이밍입니다.";
      actionPlan = \`1. 무분별한 구독 서비스나 고정성 유출 항목을 매주 리스트화해 불필요한 누수를 30% 감축하십시오.\\n2. 노란색/브라운(土) 지갑이나 계약 가죽 바인더를 사용하여 금고의 든든함을 유도하십시오.\\n3. 계약 인감 날인 시 노란색 낙관 도장을 사용해 문서의 액난을 필히 비보하십시오.\`;
    } else if (el === "금" || el === "金") {
      analysis += "금(金) 일간인 귀하는 화극금의 강한 압박 속에서 재정적 압박이나 대출 이자 상환 부담으로 심적 고통이 상당할 수 있습니다. 무무리한 모험보다는 연착륙을 준비하십시오.";
      timing = "나를 지탱할 든든한 토(土)와 금(金) 기운이 세력을 이루는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월~9월경</span> 자금 수급이 매끄럽게 매듭지어집니다.";
      actionPlan = \`1. 부동산 매매나 청약 등 큰 자금이 움직이는 안건은 반드시 보수적인 금융 전문가 2인 이상의 크로스 체크를 받으십시오.\\n2. 화이트(金) 계열 카드 홀더나 실버 메탈 포인트를 장착해 내 자산의 차가운 수비력을 충원하십시오.\\n3. 매장이나 사무실 서쪽(西) 방향 창문을 밝게 유지해 번영의 서광을 맞이하십시오.\`;
    } else {
      analysis += "수(水) 일간인 귀하는 병오년의 뜨거운 화기가 재성(재물운)으로 강하게 작용하여 버는 몫은 크지만, 그만큼 돌발 지출과 이권 싸움으로 세금이나 위약금이 많이 발생합니다.";
      timing = "수(水)의 뿌리가 충만하게 되돌아오는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~11월 겨울철</span>이 마진을 극대화하고 이자를 절감할 대길한 골든먼스입니다.";
      actionPlan = \`1. 고정 자산 비율을 60% 이상 예적금으로 안정화하고 충동적인 추가 불타기 투자는 영원히 봉인하십시오.\\n2. 네이비/블루(水) 포인트 소품을 장착해 감정적 재테크 뇌동매매를 차분하게 가라앉히십시오.\\n3. 거래 날인 당일에는 따뜻한 온수 족욕을 15분 거쳐 이성을 최고로 올린 뒤 최종 송금하십시오.\`;
    }
  } else {
    analysis = \`의뢰인 \${name}님께서 기재해주신 소망 및 고민 안건["\${cleanedText}"]에 대한 혜안당 정밀 처방입니다. \`;
    if (el === "목" || el === "木") {
      analysis += "목(木) 일간 특유의 위로 뻗어 나가는 강한 의지가 무리한 조급함이나 번아웃과 충돌해 심적인 피로감이 쌓인 형국입니다.";
      timing = "나를 편안하게 해 줄 목(木)과 수(水)의 조화 기운이 본격적으로 들어오는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 9월~10월 가을철</span>에 비로소 숨통이 트입니다.";
      actionPlan = \`1. 나를 아끼는 싱그러운 초록 식물이나 화분을 침실 동쪽(東)에 두어 내면의 목기를 소생시키십시오.\\n2. 대화나 미팅 전 3초 동안 크게 호흡을 내쉬는 습관을 실천해 가슴속 화기를 정화하십시오.\\n3. 나만을 위한 조용한 숲길 산책 명상을 주 2회 이상 가져 자연 개운을 도우십시오.\`;
    } else if (el === "화" || el === "火") {
      analysis += "화(火) 일간 특유의 열정과 표현력이 세운의 거대한 불꽃과 조응하여, 내면에 불이 번져 사소한 일에도 심란하고 밤잠을 설치기 쉬운 흐름에 노출되어 있습니다.";
      timing = "수(水)의 부드러움이 상열감을 진정시키는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 10월~11월 겨울철</span>에 비로소 마음에 차분한 평화가 깃듭니다.";
      actionPlan = \`1. 취침 전 심장의 과열을 식히기 위해 가벼운 스트레칭이나 20분 족욕을 가져 수승화강을 실천하십시오.\\n2. 침실 내 조명을 붉은 계열 대신 정돈된 백색/은색으로 세팅해 마음에 가득 찬 화기를 정화하십시오.\\n3. 북쪽(北)으로 머리를 두고 취침하거나 그 방향을 정갈히 청소하십시오.\`;
    } else if (el === "토" || el === "土") {
      analysis += "토(土) 일간 특유의 듬직하고 조율하는 에너지가 주변의 과도한 부담 지움이나 억지 부탁으로 인해 위벽이 상하듯 심리적 내상을 겪고 있습니다.";
      timing = "나의 지혜가 밝게 솟아나며 평온을 되찾을 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 8월~9월 가을철</span>이 몸과 마음의 기류 복원의 골든타임입니다.";
      actionPlan = \`1. 주변의 억지스러운 부탁에 대해 의식적으로 완곡하고 명확하게 '아니오'라고 거절하는 실전 연습을 하십시오.\\n2. 노란색/브라운 톤의 패션이나 소품을 매칭해 내면의 포용력과 단단함을 균형 있게 보강하십시오.\\n3. 식후 20분 동안 가벼게 흙이나 대지를 딛으며 걷는 산책을 통해 흙의 안정된 지기를 보충하십시오.\`;
    } else if (el === "금" || el === "金") {
      analysis += "금(金) 일간 특유의 원칙과 결단력이 화극금의 세운 압박 속에서 상처를 받고 심리적 강박증과 조급증으로 치달을 위험이 큽니다.";
      timing = "나를 다스리는 든든한 토(土)의 대지와 인성의 보살핌이 유입되는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 9월(戌월)</span>에 만사가 온화하게 해결됩니다.";
      actionPlan = \`1. 타인의 평판이나 실시간 성과 지표에 지나치게 얽매이지 말고 나의 내적 만족도에 초점을 두십시오.\\n2. 은반지나 실버 메탈 링(金)을 왼손 검지에 착용하여 내면의 부서진 금기를 매끄럽게 복원하십시오.\\n3. 집안의 서쪽(西) 모서리에 정밀 필기구나 메탈 시계를 놓아 기맥을 정돈하십시오.\`;
    } else {
      analysis += "수(水) 일간 특유의 깊은 통찰과 유연함이 세운의 맹렬한 불길에 메말라 가고 있어, 만성 피로와 원인 모를 번아웃, 우울 기류에 쉽게 잠기기 쉬운 국면입니다.";
      timing = "수(水)의 원류인 깨끗한 물줄기가 샘솟는 <span style=\\"color: #8A6F4C; font-weight: bold;\\">음력 11월(子월) 즈음</span>마음의 안개가 말끔히 걷히고 새 출발의 서광이 비춥니다.";
      actionPlan = \`1. 타인의 무리한 시선이나 감정 쓰레기통 역할을 중단하고 나만의 온전한 휴식 시간을 3시간 이상 격리하십시오.\\n2. 맑은 물 8잔을 매일 주기적으로 섭취하여 신장과 체내 수분을 물리적으로 가득 채워 기류를 개방하십시오.\\n3. 북쪽(北) 방향을 정갈히 유지하고, 그 방향에 유리컵이나 어두운 톤의 소품을 놓아두어 정돈하십시오.\`;
    }
  }

  return { analysis, timing, actionPlan };
};
`;

// getPersonalizedSolution을 export const renderNewYearPageContent 바로 위에 삽입
const importIdx = content.indexOf('export const renderNewYearPageContent =');
content = content.slice(0, importIdx) + newPersonalizedSolution + "\n" + content.slice(importIdx);

console.log("Successfully inserted new getPersonalizedSolution definition");

// 3. 월별 종합 운세 (ny_monthly) 교체
// case "ny_monthly": 에서 case "ny_wealth_fortune": 사이의 영역을 동적 지형보정 버전으로 교체
const caseNyMonthlyMarker = 'case "ny_monthly":';
const nextCaseMarker = 'case "ny_wealth_fortune":';
const startIdx = content.indexOf(caseNyMonthlyMarker);
const endIdx = content.indexOf(nextCaseMarker);

const dynamicNyMonthlyCase = `
      case "ny_monthly": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const getMonthBonus = (monthNum) => {
          let monthEl = "";
          if ([1, 2].includes(monthNum)) monthEl = "목";
          else if ([4, 5].includes(monthNum)) monthEl = "화";
          else if ([7, 8].includes(monthNum)) monthEl = "금";
          else if ([10, 11].includes(monthNum)) monthEl = "수";
          else monthEl = "토";
          
          let bonusText = "";
          let scoreModifiers = { wealth: 0, love: 0, health: 0 };
          
          if (dayStemEl === "목") {
            if (monthEl === "목") {
              bonusText = "동일한 목(木) 기운이 중첩되어 비겁의 독립심이 요동치는 달입니다. 동업보다는 단독 행동이 유리하나 고집을 꺾어야 합니다.";
              scoreModifiers.wealth = -1; scoreModifiers.love = -1; scoreModifiers.health = 1;
            } else if (monthEl === "화") {
              bonusText = "목생화(木生火)의 흐름으로 나의 재능을 세상에 널리 알리고 표현하는 식상 활동이 대단히 길한 흐름을 탑니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "토") {
              bonusText = "목극토(木剋土)로 내가 통제할 수 있는 재물 영역이 넓어지니 적극적인 이권 개입이나 투자 검토에 힘이 실립니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 0; scoreModifiers.health = 0;
            } else if (monthEl === "금") {
              bonusText = "금극목(金剋木)으로 나를 극하는 관성의 긴장감이 도래하므로 법적인 시비나 무리한 피로 축적을 철저히 경계해야 합니다.";
              scoreModifiers.wealth = -1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "수") {
              bonusText = "수생목(水생목)으로 나를 생해주는 인성 기류가 충만하여 계약 체결이나 든든한 조력자의 자금 원조가 확실해집니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 1;
            }
          } else if (dayStemEl === "화") {
            if (monthEl === "목") {
              bonusText = "목생화(木生火)로 땔감이 보충되는 시기이니, 그간 밀렸던 문서 계약이나 장기적 자격증 취득에 최적의 시너지를 냅니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 0; scoreModifiers.health = 1;
            } else if (monthEl === "화") {
              bonusText = "화(火) 기운이 극에 달해 화려함과 조급함이 충돌하니, 충동 소비를 통제하고 심장 및 혈압 건강을 정밀 관리하십시오.";
              scoreModifiers.wealth = -1; scoreModifiers.love = -1; scoreModifiers.health = -1;
            } else if (monthEl === "토") {
              bonusText = "화생토(화생토)의 방출 에너지가 활발하니, 새로운 아이디어가 창출되나 체력 소모가 극심하므로 영양 섭취에 유의하십시오.";
              scoreModifiers.wealth = 0; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "금") {
              bonusText = "화극금(火剋金)으로 결실을 맺는 재성운의 달이므로 투자금 회수나 예상치 못한 상여금 획득으로 주머니가 두둑해집니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 0;
            } else if (monthEl === "수") {
              bonusText = "수극화(水剋火)로 화기를 조율하는 관성 조력운이 들어와 직장에서 능력을 인정받고 승진이나 명예 상승을 누리게 됩니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 0;
            }
          } else if (dayStemEl === "토") {
            if (monthEl === "목") {
              bonusText = "목극토(木剋土)의 관살 압박이 거세지니, 윗사람과의 의견 충돌이나 무리한 업무 가중으로 과부하가 올 수 있어 휴식이 답입니다.";
              scoreModifiers.wealth = -1; scoreModifiers.love = 0; scoreModifiers.health = -1;
            } else if (monthEl === "화") {
              bonusText = "화생토(火生土)로 든든한 학문과 계약의 뒷배가 서는 형국이니, 부동산 거래나 상속, 투자 양수도 계약에서 절대적 우위를 점합니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 1;
            } else if (monthEl === "토") {
              bonusText = "토(土) 기운이 중첩되어 신뢰와 고집이 동시에 상승하니, 독자적인 고립을 피하고 파트너와의 소통 비중을 늘리십시오.";
              scoreModifiers.wealth = -1; scoreModifiers.love = -1; scoreModifiers.health = 1;
            } else if (monthEl === "금") {
              bonusText = "토생금(土生金)의 탄탄한 성과 도출이 예상되므로, 내 재능이 인정받고 외부에 큰 가치를 증명하여 성취감을 맛봅니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "수") {
              bonusText = "토극수(土剋水)로 재물을 내 금고로 굳건히 수렴하는 달이니 안정적 배당 소득이나 사업 매출이 큰 폭으로 향상됩니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 0;
            }
          } else if (dayStemEl === "금") {
            if (monthEl === "목") {
              bonusText = "금극목(金剋木)으로 재물의 이권을 획득하기 위해 바쁘게 뛰어다니는 달입니다. 활동한 만큼 충분한 보상이 확실히 따릅니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "화") {
              bonusText = "화극금(火剋金)으로 바위가 제련되는 혹독한 달이니, 직장 내 부서 이동이나 중대한 책임 부여로 긴장감이 최고조에 달합니다.";
              scoreModifiers.wealth = -1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "토") {
              bonusText = "토생금(土生金)의 탄탄한 보살핌을 받는 시기이므로 스승이나 선배의 보이지 않는 도움으로 문서를 쥐는 이득이 큽니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 0; scoreModifiers.health = 1;
            } else if (monthEl === "금") {
              bonusText = "동일한 금(金)의 기운이 깃들어 주관이 굳세지고 칼날 같은 결단력이 생기나, 가까운 동료와의 금전 거래는 파국을 부르니 자제하십시오.";
              scoreModifiers.wealth = -1; scoreModifiers.love = -1; scoreModifiers.health = 1;
            } else if (monthEl === "수") {
              bonusText = "금생수(金生수)로 차가운 지혜가 샘솟는 달이므로 학술 연구, 투자 분석, 혹은 난해한 갈등을 해결하는 데 탁월한 두각을 보입니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 0;
            }
          } else if (dayStemEl === "수") {
            if (monthEl === "목") {
              bonusText = "수생목(수생목)의 활동 영역이 전개되어 추진해오던 신규 프로젝트나 창업 기획의 성과가 활짝 개화하는 운세입니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "화") {
              bonusText = "수극화(水剋火)로 재정적 기회를 조율하고 실리를 추구하는 흐름이니 알짜배기 재물 취득이나 성과급 합의가 길하게 매듭지어집니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 0; scoreModifiers.health = 0;
            } else if (monthEl === "토") {
              bonusText = "토극수(土剋水)로 나의 흘러감을 통제하는 관성 규칙이 작동하여 규율을 지켜야 하니 건강이나 수면 관리에 힘쓰십시오.";
              scoreModifiers.wealth = -1; scoreModifiers.love = 1; scoreModifiers.health = -1;
            } else if (monthEl === "금") {
              bonusText = "금생수(金生水)로 깨끗한 마르지 않는 샘물이 공급되는 흐름이니 지적 자산 취득이나 상속, 권리 계약에서 대길합니다.";
              scoreModifiers.wealth = 1; scoreModifiers.love = 1; scoreModifiers.health = 1;
            } else if (monthEl === "수") {
              bonusText = "동일한 물줄기가 합류하여 지혜와 고집이 범람하는 시기이니, 감정 과잉에 의한 섣부른 투자나 충동 이직은 필히 보류하십시오.";
              scoreModifiers.wealth = -1; scoreModifiers.love = -1; scoreModifiers.health = 1;
            }
          }
          return { bonusText, scoreModifiers };
        };

        const baseMonthlyDetails = {
          1: {
            wealth: "신년 초반 자금 유동성이 일시적으로 얼어붙을 수 있으나 섣부른 레버리지 투자는 금물입니다. 지출 통제를 타이트하게 실행하십시오.",
            love: "가족이나 연인과의 사소한 언쟁이 자존심 싸움으로 비화되어 냉기류가 지속될 수 있습니다. 대화 시 한 템포 부드러운 화법을 지향하십시오.",
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
            health: "위장 장애 및 소화 불량이 발생할 우려가 있으니 규칙적인 식사 시간을 유지하고, 식후 20분 동안 가볍게 대지를 딛으며 걷는 행동을 추천합니다.",
            wealthVal: 5, loveVal: 4, healthVal: 3
          },
          4: {
            wealth: "매출 증대나 보너스 기류가 잠시 보이지만 그만큼 품위 유지비나 돌발 지출이 함께 폭증하여 실속이 떨어집니다. 가계부를 꼼꼼히 적으며 불필요한 고정비를 과감히 다이어트하십시오.",
            love: "연인의 사소한 거짓말이나 감춤으로 인해 내면의 예민함이 증폭될 수 있습니다. 윽박지르기보다는 차분히 대화를 유도하여 상대의 진짜 속마음을 조용히 확인해 보십시오.",
            health: "체내 수분이 급격히 메말라 안구 건조 및 피부 가려움증이 심해집니다. 하루 8잔 이상의 맑은 물을 주기적으로 음용하여 세포에 수분을 공급하십시오.",
            wealthVal: 3, loveVal: 2, healthVal: 2
          },
          5: {
            wealth: "손재수와 관재 구설의 위험이 도처에 깔린 가장 위험한 달입니다. 동업나 신규 확장 투자는 절대 파탄에 이르니 기존 자산을 완전히 잠금 계좌에 대피시켜 수비하십시오.",
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
            wealth: "자산의 이동이나 신규 사업 투자는 조율이 매끄럽게 흐르나 섣부른 충동 거래는 금물입니다. 안정 지향 예적금을 필두로 재무 주관을 단단히 세워두십시오.",
            love: "배우자나 깊은 인연과 마음속 속사정을 공유하며 겨울철 아늑한 온기를 쌓아갑니다. 서운한 점은 가벼운 산책으로 흘려보내십시오.",
            health: "체온 보호에 집중하고 따뜻한 어묵탕이나 온수를 자주 섭취하여 수분을 유지하는 약선 습관을 들이십시오.",
            wealthVal: 3, loveVal: 4, healthVal: 3
          },
          12: {
            wealth: "연말 정산과 한 해 자산 정리를 매끄럽게 수행하며 내년 자금 융통 계획을 공고히 닫아 매듭짓는 창고 잠금의 달입니다.",
            love: "가까운 친구나 지인과의 조촐한 모임에서 따스한 안부를 나누며 한 해의 인간적 감사를 고이 정돈하기에 최적입니다.",
            health: "신장 기운의 위축이 오기 쉬운 한겨울이니 족욕과 허리 보온을 생활화하여 기맥의 순환이 정체되지 않도록 세심히 관리하십시오.",
            wealthVal: 3, loveVal: 3, healthVal: 2
          }
        };

        const renderStar = (score) => {
          return "★".repeat(score) + "☆".repeat(5 - score);
        };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">월별 종합 운세 (月別 運勢)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026 병오년 음력 1월~12월 정밀 세부 흐름</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                const bonusData = getMonthBonus(m);
                const base = baseMonthlyDetails[m];
                const wealthScore = Math.max(1, Math.min(5, base.wealthVal + bonusData.scoreModifiers.wealth));
                const loveScore = Math.max(1, Math.min(5, base.loveVal + bonusData.scoreModifiers.love));
                const healthScore = Math.max(1, Math.min(5, base.healthVal + bonusData.scoreModifiers.health));

                return (
                  <div key={m} className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                      <span className="font-myeongjo text-sm font-bold text-gray-800">☯ 음력 {m}월 세부 기류</span>
                      <div className="flex gap-3 text-[10px] text-gray-500 font-semibold">
                        <span className="text-amber-600">재물 {renderStar(wealthScore)}</span>
                        <span className="text-rose-600">애정 {renderStar(loveScore)}</span>
                        <span className="text-emerald-600">건강 {renderStar(healthScore)}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-1.5 font-light leading-relaxed text-justify">
                      <p>• <strong>재물운:</strong> {base.wealth}</p>
                      <p>• <strong>애정운:</strong> {base.love}</p>
                      <p>• <strong>건강운:</strong> {base.health}</p>
                      <p className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E2DDD5]/40 text-[#8A6F4C] font-semibold mt-2">
                        💡 [오행 맞춤 비책] {bonusData.bonusText}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>,
          "병오년 음력 월별 정밀 지침 보고서"
        );
      }
`;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + dynamicNyMonthlyCase + '\n      ' + content.slice(endIdx);
  console.log("Replaced ny_monthly with dynamicMonthly Case");
} else {
  throw new Error("Could not find ny_monthly or ny_wealth_fortune markers in switch");
}

// 4. 누락된 7가지 개인화 케이스들 (30, 32, 34, 45, 46, 50, 51 등) switch 문 내부의 'default:' 바로 직전에 한 번에 정밀 주입
// extend_pages.js or merge_and_enrich.js 내의 텍스트 콘텐츠들 로드
const nyCareerDetailed = fs.readFileSync(path.join(__dirname, 'ny_career_detailed.txt'), 'utf8');
const nySocialLife = fs.readFileSync(path.join(__dirname, 'ny_social_life.txt'), 'utf8');
const nyRoadmap2030 = fs.readFileSync(path.join(__dirname, 'ny_roadmap_2030.txt'), 'utf8');
const nyRoadmap2031 = fs.readFileSync(path.join(__dirname, 'ny_roadmap_2031.txt'), 'utf8');
const nyDietPresc = fs.readFileSync(path.join(__dirname, 'ny_diet_presc.txt'), 'utf8');

const nyWealthPortfolioDynamicCase = `
      case "ny_wealth_portfolio": {
        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const earthCount = sajuInfo?.elements?.토 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;

        let safeRatio = 60;
        let incomeRatio = 30;
        let growthRatio = 10;
        let portfolioAnalysis = "";

        if (waterCount <= 1) {
          safeRatio = 70; incomeRatio = 20; growthRatio = 10;
          portfolioAnalysis = \`의뢰인 \${name}님의 사주에는 흘러가는 유연성과 자산 수성을 상징하는 수(水) 기운이 부족(\${waterCount}개)합니다. 따라서 2026년에는 무리하게 투자금을 넓히기보다는 원금을 굳건히 지키는 안전성 보존 자산(예적금)을 70% 수준으로 크게 상향하는 자산 수성 전략이 최우선입니다.\`;
        } else if (woodCount <= 1) {
          safeRatio = 50; incomeRatio = 30; growthRatio = 20;
          portfolioAnalysis = \`의뢰인 \${name}님의 사주는 기획력과 결단을 상징하는 목(木) 기운이 약한 편(\${woodCount}개)입니다. 지나치게 보수적인 성향으로 인플레이션을 방어하지 못할 위험이 있으니, 글로벌 지수 추종 ETF나 대형 우량 가치주 비중을 20%까지 늘려 성장의 끈을 놓지 않는 것이 중요합니다.\`;
        } else if (fireCount >= 3) {
          safeRatio = 65; incomeRatio = 25; growthRatio = 10;
          portfolioAnalysis = \`의뢰인 \${name}님의 사주에는 화(火) 기운이 과다(\${fireCount}개)하여 일시적인 감정이나 충동에 따른 투기성 자산 배분 위험이 도사리고 있습니다. 안전자산 비중을 65%로 가져가며, 월배당 채권이나 리츠를 25% 확보해 원천적으로 현금이 묶이도록 통제하는 방어막을 구축하십시오.\`;
        } else {
          safeRatio = 60; incomeRatio = 30; growthRatio = 10;
          portfolioAnalysis = \`의뢰인 \${name}님의 오행 밸런스를 고려한 자산 방어형 전략입니다. 2026년 병오년 세운의 열기가 사주 전체를 자극하는 시기이므로, 안전자산 60%를 기본 뼈대로 잡고 배당 채권 30%, 우량 성장 가치주 10%로 유연한 현금 흐름을 창출하는 정석 자산 배분을 추천합니다.\`;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">재무 포트폴리오 (財務 指針)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">오행 성향 맞춤형 신년 재테크 조언</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                {portfolioAnalysis}
              </p>

              {/* 시각화: 자산 포트폴리오 비중 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 제안 자산 구성 비율</span>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex text-[8px] font-bold text-white text-center leading-4">
                  <div className="bg-[#8A6F4C]" style={{ width: \`\${safeRatio}%\` }}>안전자산 \${safeRatio}%</div>
                  <div className="bg-[#A3845B]" style={{ width: \`\${incomeRatio}%\` }}>배당/채권 \${incomeRatio}%</div>
                  <div className="bg-[#5F7A68]" style={{ width: \`\${growthRatio}%\` }}>우량가치주 \${growthRatio}%</div>
                </div>
                <p className="text-[9px] text-gray-400 font-light leading-snug">
                  * 무리한 성장주 레버리지 투자는 70% 이상의 손실 확률을 가지므로 금지하며, 원금 보장형 예적금이나 미국 단기 채권 ETF에 \${safeRatio}% 이상 집중하십시오.
                </p>
              </div>

              {/* 추가: 오행 맞춤형 3대 투자 원칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌊</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">수(水) 기운: 수성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">예적금과 금 실물에 \${safeRatio}%를 배분하여 원금을 굳건히 지킴</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🪙</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">금(金) 기운: 흐름</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">미국 단기 채권 및 월배당 리츠 \${incomeRatio}%로 안정적 이자 획득</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌲</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">목(木) 기운: 성장</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">글로벌 지수 ETF 및 대형 우량 가치주 \${growthRatio}%로 방어적 투자</p>
                </div>
              </div>

              {/* 추가: 포트폴리오 자산 배분 조견표 */}
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm pt-2">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">자산 분류</th>
                      <th className="p-2">추천 오행</th>
                      <th className="p-2 text-center">권장 비중</th>
                      <th className="p-2">투자 실행 가이드</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🔒 안전성 보존 자산</td>
                      <td className="p-2 text-center">수(水) / 토(土)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">\${safeRatio}%</td>
                      <td className="p-2">고금리 정기 예적금, 금(Gold) 현물 수성</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💵 고정 배당 자산</td>
                      <td className="p-2 text-center">금(金)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">\${incomeRatio}%</td>
                      <td className="p-2">월배당 인컴형 리츠, 미국 하이일드/단기채 ETF</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">📈 우량 가치 자산</td>
                      <td className="p-2 text-center">목(木)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">\${growthRatio}%</td>
                      <td className="p-2">글로벌 지수 추종 ETF, 초우량 빅테크 가치 분할매수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>,
          "오행별 추천 투자 스타일 및 재무 가이드"
        );
      }
`;

const nyLuckyFashionDynamicCase = `
      case "ny_lucky_fashion": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";

        let recommendLook = "";
        let recommendLookDesc = "";
        let recommendAcc = "";
        let recommendAccDesc = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          recommendLook = "👔 네추럴 리넨 코디 / 그린 포인트 룩";
          recommendLookDesc = "지나치게 인위적이거나 붉은색 계열의 의상은 피하십시오. 편안한 카키, 베이지, 초록색 포인트를 준 리넨 소재 룩을 매치할 때, 타고난 목(木) 기운의 신선한 추진력과 생기를 주위에 전달하기에 최적입니다.";
          recommendAcc = "💍 원목 소품 및 천연 가죽 밴드";
          recommendAccDesc = "금속 시계보다는 갈색 가죽 스트랩 시계나 원목 비즈 액세서리를 활용하십시오. 내면의 목 기운을 부드럽게 활성화하여 대인관계의 매끄러운 화합을 유도하고 스트레스를 상쇄하는 든든한 방어막이 됩니다.";
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          recommendLook = "👔 세련된 블랙 / 차콜 모노톤 코디";
          recommendLookDesc = "병오년의 타오르는 불 기운 속에 휩쓸리지 않도록 붉은색 의상은 완전 배제하십시오. 이성적인 지혜와 수렴을 상징하는 깊은 블랙, 다크 네이비 위주의 모노톤을 매칭하여 신중함과 품위를 연출하십시오.";
          recommendAcc = "💍 실버 체인 또는 심플 메탈 안경테";
          recommendAccDesc = "스틸/실버 주얼리나 깔끔한 실버 안경테를 활용하여 넘치는 화기를 차갑게 억제하는 금(金) 기운을 튜닝하십시오. 구설을 전면 차단하고 대인관계의 격을 높여줍니다.";
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          recommendLook = "👔 웜톤 베이지 & 카멜 레이어드 룩";
          recommendLookDesc = "안정감과 신뢰를 풍기는 옐로우 푸드 계열의 브라운, 베이지, 크림 톤 의상을 조화롭게 코디하십시오. 의뢰인님의 듬직한 중용과 포용의 아우라를 크게 상승시킵니다.";
          recommendAcc = "💍 천연 원석 펜던트 & 가죽 주얼리";
          recommendAccDesc = "천연 마노나 호안석 등 황토색 원석 펜던트, 혹은 브라운 가죽 소품을 장착하여 사주 대지의 튼튼함을 강화하십시오. 계약 협상이나 중요한 도장 날인 시 운의 안정감을 부여합니다.";
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          recommendLook = "👔 모던 포멀 수트 & 화이트 코디";
          recommendLookDesc = "화이트, 실버, 밝은 그레이 톤의 정돈된 포멀 스타일을 추천합니다. 정돈되고 칼날 같은 예리한 바위의 깔끔함이 타인에게 극강의 공적 신뢰도와 카리스마를 각인시킵니다.";
          recommendAcc = "💍 스틸 메탈 시계 & 은반지";
          recommendAccDesc = "왼손 검지나 약지에 심플한 실버 링을 착용하거나 차가운 메탈 시계를 착용해 내면의 부서진 금(金) 기운을 충전하십시오. 불필요한 직장 내 시비와 액난을 차단하는 부적이 됩니다.";
        } else {
          recommendLook = "👔 다크 블루 / 네이비 포멀 캐주얼";
          recommendLookDesc = "지혜로움과 유연함을 풍기는 딥 네이비, 블루 계열의 의상을 믹스매치 하십시오. 화기를 제어하고 내면의 마인드 주관을 맑고 깨끗하게 지켜주는 수(水) 기맥을 흐르게 돕습니다.";
          recommendAcc = "💍 투명 크리스탈 또는 오닉스 액세서리";
          recommendAccDesc = "투명한 유리, 크리스탈 주얼리나 검은색 오닉스 팔찌를 착용하여 신장과 방광의 기류를 간접 보완하고 차분한 판단력을 최고조로 끌어올리십시오.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 의뢰인님의 사주 오행 맞춤형 럭키 코디 제안입니다.
              </p>

              {/* 스타일 팁 카드 */}
              <div className="space-y-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#5F7A68] text-[11px] block mb-1">{recommendLook}</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    {recommendLookDesc}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block mb-1">{recommendAcc}</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    {recommendAccDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        );
      }
`;

const allNewCases = [
  nyWealthPortfolioDynamicCase,
  nyCareerDetailed,
  nySocialLife,
  nyRoadmap2030,
  nyRoadmap2031,
  nyLuckyFashionDynamicCase,
  nyDietPresc
].join('\n\n');

const defaultCaseMarker = 'default:';
const defaultIdx = content.indexOf(defaultCaseMarker);

if (defaultIdx !== -1) {
  content = content.slice(0, defaultIdx) + allNewCases + '\n\n      ' + content.slice(defaultIdx);
  console.log("Successfully inserted all 7 missing cases before default:");
} else {
  throw new Error("Could not find default: marker in switch");
}

// 5. 가독성 강조 스타일링 치환
content = content.replace(
  /<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.timing }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.timing }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.analysis\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.analysis }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.timing }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.analysis\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.analysis }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.timing }} />`
);

console.log("Successfully applied dangerouslySetInnerHTML for styling variables");

// 6. 결과 쓰기
fs.writeFileSync(targetFilePath, content, 'utf8');
console.log("=== clean_recovery.js finished successfully! ===");
