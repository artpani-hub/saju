const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Definition of Lock and Upgrade Overlay functions
const overlayFunctions = `
const renderLockOverlay = (sectionTitle, handlePortonePayment, setIsPaid, type, typeParam) => {
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
          정통 {typeParam === "tojeong" ? "토정비결" : (type === "newyear" ? "신년운세" : "사주 풀이")}로 잠금 해제 (34,900원)
        </button>
        <button
          type="button"
          onClick={() => setIsPaid(true)}
          className="w-full py-1.5 bg-[#5F7A68] hover:bg-[#38493D] text-[#FAF7F0] rounded text-[10px] font-semibold tracking-wider transition-all mt-1 cursor-pointer"
        >
          ⚙️ [개발자 테스트] 즉시 잠금해제 확인하기
        </button>
      </div>
    </div>
  );
};

const renderUpgradeOverlay = (sectionTitle, handleUpgradePayment, setIsPaid) => {
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
`;

// 2. Insert overlay functions before renderNewYearPageContent definition
const targetDef = 'export const renderNewYearPageContent =';
const defIndex = content.indexOf(targetDef);

if (defIndex !== -1) {
  content = content.slice(0, defIndex) + overlayFunctions + '\n' + content.slice(defIndex);
  console.log('Inserted overlay functions definition.');
}

// 3. Update the destructuring block to include payment handlers
const targetDestruct = `      type,
      typeParam
    } = ctx;`;

const newDestruct = `      type,
      typeParam,
      handlePortonePayment,
      handleUpgradePayment,
      setIsPaid
    } = ctx;`;

if (content.includes(targetDestruct)) {
  content = content.replace(targetDestruct, newDestruct);
  console.log('Updated destructuring block.');
} else {
  // Try with spaces variations
  const regexDestruct = /type,\s*typeParam\s*\}\s*=\s*ctx;/;
  content = content.replace(regexDestruct, `type,\n      typeParam,\n      handlePortonePayment,\n      handleUpgradePayment,\n      setIsPaid\n    } = ctx;`);
  console.log('Updated destructuring block via regex.');
}

// 4. Update wrapLock overlays call
const lockCallTarget = 'isFree && renderLockOverlay(sectionTitle)';
const lockCallReplacement = 'isFree && renderLockOverlay(sectionTitle, handlePortonePayment, setIsPaid, type, typeParam)';

const upgradeCallTarget = 'isUpgradeLocked && renderUpgradeOverlay(sectionTitle)';
const upgradeCallReplacement = 'isUpgradeLocked && renderUpgradeOverlay(sectionTitle, handleUpgradePayment, setIsPaid)';

content = content.replace(lockCallTarget, lockCallReplacement);
content = content.replace(upgradeCallTarget, upgradeCallReplacement);
console.log('Updated wrapLock overlay calls.');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully saved changes to renderNewYearPageContent.js');
