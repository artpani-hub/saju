import { Nanum_Myeongjo, Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const myeongjo = Nanum_Myeongjo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-myeongjo",
  display: "swap",
});

const gothic = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-gothic",
  display: "swap",
});

export const metadata = {
  title: "혜안당 (慧眼堂) - 지혜로운 눈으로 밝히는 운명",
  description: "개인 맞춤형 사주, 운세, 타로 분석 리포트 서비스. 혜안당에서 삶의 지혜와 다가올 운명을 만나보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ko"
      className={`${myeongjo.variable} ${gothic.variable} h-full antialiased`}
    >
      <head>
        <Script src="https://cdn.iamport.kr/v1/iamport.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-gothic">
        {children}
      </body>
    </html>
  );
}

