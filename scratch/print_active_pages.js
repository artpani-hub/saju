const pages = [
  { page: 1, type: "ny_cover" },
  { page: 2, type: "ny_preface" },
  { page: 3, type: "ny_intro_saju" },
  { page: 4, type: "ny_daewun_flow" },
  { page: 5, type: "ny_seoun_analysis" },
  { page: 6, type: "ny_stem_harmony" },
  { page: 7, type: "ny_ilju_harmony" },
  { page: 8, type: "ny_elements_balance" },
  { page: 9, type: "ny_elements_supplement" },
  { page: 10, type: "ny_health_presc" },
  { page: 11, type: "ny_mind_meditation" },
  { page: 12, type: "ny_lucky_secrets" },
  { page: 13, type: "ny_season_spring" },
  { page: 14, type: "ny_monthly", monthNum: 1 },
  { page: 15, type: "ny_monthly", monthNum: 2 },
  { page: 16, type: "ny_monthly", monthNum: 3 },
  { page: 17, type: "ny_season_summer" },
  { page: 18, type: "ny_monthly", monthNum: 4 },
  { page: 19, type: "ny_monthly", monthNum: 5 },
  { page: 20, type: "ny_monthly", monthNum: 6 },
  { page: 21, type: "ny_season_autumn" },
  { page: 22, type: "ny_monthly", monthNum: 7 },
  { page: 23, type: "ny_monthly", monthNum: 8 },
  { page: 24, type: "ny_monthly", monthNum: 9 },
  { page: 25, type: "ny_season_winter" },
  { page: 26, type: "ny_monthly", monthNum: 10 },
  { page: 27, type: "ny_monthly", monthNum: 11 },
  { page: 28, type: "ny_monthly", monthNum: 12 },
  { page: 29, type: "ny_wealth_fortune" },
  { page: 30, type: "ny_wealth_portfolio" },
  { page: 31, type: "ny_career_fortune" },
  { page: 32, type: "ny_career_detailed" },
  { page: 33, type: "ny_love_fortune" },
  { page: 34, type: "ny_social_life" },
  { page: 35, type: "ny_study_fortune" },
  { page: 36, type: "ny_gossip_defense" },
  { page: 37, type: "ny_sinsal_active" },
  { page: 38, type: "ny_gwiin_harmony" },
  { page: 39, type: "ny_warning_period" },
  { page: 40, type: "ny_worry_solution" },
  { page: 41, type: "ny_personal_worry" },
  { page: 42, type: "ny_roadmap_2027" },
  { page: 43, type: "ny_roadmap_2028" },
  { page: 44, type: "ny_roadmap_2029" },
  { page: 45, type: "ny_roadmap_2030" },
  { page: 46, type: "ny_roadmap_2031" },
  { page: 47, type: "ny_action_rules" },
  { page: 48, type: "ny_fengshui_interior" },
  { page: 49, type: "ny_lucky_items" },
  { page: 50, type: "ny_lucky_fashion" },
  { page: 51, type: "ny_diet_presc" },
  { page: 52, type: "ny_final_blessing" }
];

const deepExcludeTypes = [
  "ny_sinsal_active",
  "ny_warning_period",
  "ny_worry_solution",
  "ny_roadmap_2027",
  "ny_roadmap_2028",
  "ny_roadmap_2029",
  "ny_fengshui_interior"
];

// YookHap/고수 등 newyear 타입의 premium 등급일 때 activePages 구성
const activePagesPremium = pages
  .filter(p => !deepExcludeTypes.includes(p.type))
  .map((p, idx) => ({ ...p, displayPage: idx + 1 }));

console.log("=== Active Pages under Premium Grade (filtered) ===");
activePagesPremium.forEach(p => {
  console.log(`Display Page ${p.displayPage} (Original Page ${p.page}): type = ${p.type}`);
});
