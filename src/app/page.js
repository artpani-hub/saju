import Link from "next/link";
import { Compass, Sparkles, Mail, ArrowRight, Scroll, HelpCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
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
              href="/input"
              className="inline-flex items-center gap-2 bg-brass text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-brass-dark shadow-sm transition-all"
            >
              사주 분석하기
              <ArrowRight className="w-4 height-4" />
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
          
          <h1 className="font-myeongjo text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.2] mb-6">
            지혜로운 눈으로<br />
            <span className="text-brass">내 인생의 길</span>을 밝히다
          </h1>
          
          <p className="text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto leading-relaxed mb-10 font-light">
            전통 만세력 알고리즘을 통한 오행 분석과<br className="hidden sm:inline" />
            고객님의 구체적인 고민 상황을 연동하여, 인공지능이 서술하는<br className="hidden sm:inline" />
            단 하나의 **개인 맞춤형 운세 분석서**를 메일로 보내드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/input"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-jade text-background px-8 py-4 rounded-md text-base font-medium hover:bg-jade-dark shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Scroll className="w-5 h-5" />
              지금 사주 상담 신청하기
            </Link>
            <a
              href="#services"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-brass/50 text-brass bg-background-secondary/50 px-8 py-4 rounded-md text-base font-medium hover:bg-background-secondary transition-all"
            >
              운세 상품 보기
            </a>
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
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  타고난 오행 분포, 평생의 흐름을 짚어주는 10년 주기 대운, 인생의 황금기와 솔루션을 포함한 종합 보고서.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">30,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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

            {/* Product Card 2 */}
            <div className="border border-border-custom bg-background rounded-lg p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div>
                <span className="text-xs font-semibold text-brass tracking-wider uppercase block mb-1">시즌 한정</span>
                <h3 className="font-myeongjo text-xl font-bold text-foreground mb-2 group-hover:text-brass transition-colors">신년 운세 / 토정비결</h3>
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  새해에 가장 많이 찾는 상품으로, 한 해의 총체적인 흐름, 월별 상세 운세와 나아갈 행동 지침 제안.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">35,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">20,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">10,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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
                <p className="text-sm text-foreground-muted leading-relaxed mb-6 font-light">
                  두 사람의 타고난 오행 분포 조화, 속궁합/정서적 궁합, 백년해로 타이밍 및 관계 유지 솔루션 제공.
                </p>
              </div>
              <div>
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">30,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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
                <div className="border-t border-border-custom pt-4 mb-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">20,000</span>
                  <span className="text-xs text-foreground-muted">원</span>
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
