import "./globals.css";

const myeongjo = {
  variable: "font-myeongjo",
};

const gothic = {
  variable: "font-gothic",
};

export const metadata = {
  title: "혜안당 (慧眼堂) - 정통 사주, 무료 운세, 토정비결, 궁합 맞춤 분석",
  description: "정통 사주 풀이, 신년 운세, 무료 일진, 연인 궁합 및 타로 분석까지 제공하는 개인 맞춤형 리포트 서비스. 재물운, 건강운, 가족운, 자녀운, 인간관계, 사업운, 이직운, 재회운 등 다가올 운명을 혜안당에서 확인해 보세요.",
  keywords: [
    "사주", "무료사주", "운세", "토정비결", "신년운세", "궁합", "타로", "혜안당",
    "재물운", "건강운", "가족운", "자녀운", "인간관계", "사업운", "이직운", "재회운"
  ],
  verification: {
    other: {
      "naver-site-verification": "4838bc51a3b91311e7208beb6ff31f823342088d",
      "google-site-verification": "mVuCicZ6nEokaGMkmtv9r_3lF_xMjqd3Qr2-CBh2Bb4",
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${myeongjo.variable} ${gothic.variable} h-full antialiased`}
    >
      <head />
      <body className="min-h-full flex flex-col bg-background text-foreground font-gothic">
        {children}
      </body>
    </html>
  );
}

