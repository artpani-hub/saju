const Stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const Branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const StemElements = {
  "甲": "목", "乙": "목", "丙": "화", "丁": "화", "戊": "토", "己": "토", "庚": "금", "辛": "금", "壬": "수", "癸": "수"
};
const BranchElements = {
  "寅": "목", "卯": "목", "巳": "화", "午": "화", "辰": "토", "戌": "토", "丑": "토", "未": "토", "申": "금", "酉": "금", "亥": "수", "子": "수"
};

const getGanjiTable = (yearNum, monthNum, dayNum, hourString) => {
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
  if (hourString) {
    const hourNum = parseInt(hourString.split(":")[0]) || 0;
    const bIdx = Math.floor(((hourNum + 1) % 24) / 2);
    hBranch = Branches[bIdx];
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
    dayStemEl: StemElements[dStem],
    elements
  };
};

console.log("=== Finding Case A: DayStem=목, Hwa>=3, Geum=0 ===");
let foundA = false;
for (let y = 1970; y <= 2010 && !foundA; y++) {
  for (let m = 1; m <= 12 && !foundA; m++) {
    for (let d = 1; d <= 28 && !foundA; d++) {
      for (let h = 0; h < 24 && !foundA; h += 2) {
        const hourStr = String(h).padStart(2, '0') + ":00";
        const result = getGanjiTable(y, m, d, hourStr);
        if (result.dayStemEl === "목" && (result.elements["화"] || 0) >= 3 && (result.elements["금"] || 0) === 0) {
          console.log(`CASE A FOUND: year=${y}, month=${m}, day=${d}, hour=${hourStr}`);
          console.log("Elements:", result.elements);
          foundA = true;
        }
      }
    }
  }
}

console.log("=== Finding Case B: DayStem=수, Su>=3, Geum>=1 && Geum<=2 ===");
let foundB = false;
for (let y = 1970; y <= 2010 && !foundB; y++) {
  for (let m = 1; m <= 12 && !foundB; m++) {
    for (let d = 1; d <= 28 && !foundB; d++) {
      for (let h = 0; h < 24 && !foundB; h += 2) {
        const hourStr = String(h).padStart(2, '0') + ":00";
        const result = getGanjiTable(y, m, d, hourStr);
        if (result.dayStemEl === "수" && (result.elements["수"] || 0) >= 3 && (result.elements["금"] || 0) >= 1 && (result.elements["금"] || 0) <= 2) {
          console.log(`CASE B FOUND: year=${y}, month=${m}, day=${d}, hour=${hourStr}`);
          console.log("Elements:", result.elements);
          foundB = true;
        }
      }
    }
  }
}
