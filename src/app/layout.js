import "./globals.css";

const myeongjo = {
  variable: "font-myeongjo",
};

const gothic = {
  variable: "font-gothic",
};

export const metadata = {
  title: "혜안당 (慧眼堂) - 지혜로운 눈으로 밝히는 운명",
  description: "개인 맞춤형 사주, 운세, 타로 분석 리포트 서비스. 혜안당에서 삶의 지혜와 다가올 운명을 만나보세요.",
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

