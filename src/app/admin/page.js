"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CreditCard, RefreshCw, Mail, CheckCircle2, AlertTriangle, Play, Sparkles, Search } from "lucide-react";

// Mock database orders
const initialOrders = [
  {
    id: 1004,
    name: "이지혜",
    email: "jihye@example.com",
    phone: "010-1234-5678",
    productName: "평생 종합 사주팔자",
    amount: 30000,
    status: "paid", // paid, failed, ready
    sajuGanji: "己亥年 己巳月 甲子일 (사시)",
    emailStatus: "sent", // sent, pending, failed
    createdAt: "2026-05-23 17:15",
  },
  {
    id: 1003,
    name: "김민우",
    email: "minwoo@test.com",
    phone: "010-9876-5432",
    productName: "재물 & 비즈니스운",
    amount: 20000,
    status: "paid",
    sajuGanji: "庚午년 戊子월 丙寅일 (오시)",
    emailStatus: "sent",
    createdAt: "2026-05-23 16:02",
  },
  {
    id: 1002,
    name: "박서연",
    email: "seoyeon@example.net",
    phone: "010-5555-4444",
    productName: "신년 운세 / 토정비결",
    amount: 35000,
    status: "paid",
    sajuGanji: "癸酉년 乙丑월 己未일 (묘시)",
    emailStatus: "failed", // Failed email
    createdAt: "2026-05-23 14:45",
  },
  {
    id: 1001,
    name: "최준혁",
    email: "junhyuk@mail.com",
    phone: "010-8888-9999",
    productName: "그 사람의 속마음 (타로)",
    amount: 10000,
    status: "failed", // Failed payment
    sajuGanji: "-",
    emailStatus: "pending",
    createdAt: "2026-05-23 11:20",
  },
];

export default function AdminPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshingId, setRefreshingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  const startEdit = (order) => {
    setEditingId(order.id);
    setEditForm({ name: order.name, email: order.email, phone: order.phone });
  };

  const saveEdit = (id) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, ...editForm } : order
      )
    );
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Resend/re-run AI and email action
  const handleResend = (id) => {
    setRefreshingId(id);
    
    // Simulate API call to regenerate & resend email
    setTimeout(() => {
      setOrders(prev =>
        prev.map(order =>
          order.id === id ? { ...order, emailStatus: "sent" } : order
        )
      );
      setRefreshingId(null);
      alert(`[주문번호 ${id}] AI 사주 결과 분석 완료 및 이메일 재발송을 성공적으로 마쳤습니다.`);
    }, 2000);
  };

  const filteredOrders = orders.filter(
    order =>
      order.name.includes(searchTerm) ||
      order.email.includes(searchTerm) ||
      order.productName.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-gothic">
      {/* Header */}
      <header className="border-b border-border-custom bg-background px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-brass">
              <rect x="10" y="10" width="80" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="8" />
              <path d="M50 15 L50 85 M15 50 L85 50" stroke="currentColor" strokeWidth="4" strokeDasharray="2 2" />
            </svg>
            <span className="font-myeongjo text-lg font-bold tracking-widest text-foreground">慧眼堂 어드민</span>
          </Link>
          <span className="text-xs bg-brass/10 text-brass px-2 py-0.5 rounded font-medium">관리자 대시보드</span>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-brass transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          메인 페이지로
        </Link>
      </header>

      {/* Admin Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="font-myeongjo text-2xl font-bold text-foreground mb-1">실시간 운영 현황</h2>
          <p className="text-xs text-foreground-muted font-light">혜안당 플랫폼의 금일 주문 결제 내역과 AI 분석 상태를 모니터링합니다.</p>
        </div>

        {/* Status Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">금일 결제 총액</span>
              <CreditCard className="w-4 h-4 text-brass" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">85,000원</span>
            <span className="text-[10px] text-jade block mt-1">▲ 전일 대비 12% 상승</span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">총 주문 건수</span>
              <Users className="w-4 h-4 text-jade" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">4건</span>
            <span className="text-[10px] text-foreground-muted block mt-1">결제 완료 3건 / 실패 1건</span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">메일 발송 상태</span>
              <Mail className="w-4 h-4 text-brass" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">2 / 3건 완료</span>
            <span className="text-[10px] text-brass block mt-1">⚠️ 발송 실패 1건 처리 필요</span>
          </div>

          <div className="bg-background-secondary/50 border border-border-custom rounded-lg p-5">
            <div className="flex items-center justify-between text-foreground-muted mb-2">
              <span className="text-xs font-medium">AI 연산 가동율</span>
              <Sparkles className="w-4 h-4 text-jade" />
            </div>
            <span className="font-myeongjo text-xl font-bold text-foreground">100%</span>
            <span className="text-[10px] text-jade block mt-1">API 서버 정상 가동 중</span>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="고객명, 이메일, 상품명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border-custom rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brass"
            />
          </div>
          <div className="text-xs text-foreground-muted">
            조회된 주문: <strong className="text-foreground">{filteredOrders.length}</strong>건
          </div>
        </div>

        {/* Table of Orders */}
        <div className="border border-border-custom rounded-lg bg-background overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-background-secondary border-b border-border-custom text-foreground font-semibold">
                  <th className="p-4">주문번호</th>
                  <th className="p-4">주문일시</th>
                  <th className="p-4">고객 정보</th>
                  <th className="p-4">상품명</th>
                  <th className="p-4 text-right">금액</th>
                  <th className="p-4">결제 상태</th>
                  <th className="p-4">만세력 정보</th>
                  <th className="p-4">결과 발송</th>
                  <th className="p-4 text-center">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background-secondary/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">{order.id}</td>
                    <td className="p-4 text-foreground-muted">{order.createdAt}</td>
                    <td className="p-4">
                      {editingId === order.id ? (
                        <div className="space-y-1.5 min-w-[150px]">
                          <input
                            type="text"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                            placeholder="성명"
                          />
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                            placeholder="이메일"
                          />
                          <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            className="w-full bg-background border border-border-custom rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-brass"
                            placeholder="연락처"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-foreground">{order.name}</div>
                          <div className="text-[10px] text-foreground-muted">{order.email}</div>
                          <div className="text-[10px] text-foreground-muted">{order.phone}</div>
                        </>
                      )}
                    </td>
                    <td className="p-4 font-medium text-foreground">{order.productName}</td>
                    <td className="p-4 text-right font-bold text-foreground">
                      {order.amount.toLocaleString()}원
                    </td>
                    <td className="p-4">
                      {order.status === "paid" && (
                        <span className="inline-flex items-center gap-1 bg-jade/10 text-jade px-2 py-0.5 rounded font-medium text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> 결제 완료
                        </span>
                      )}
                      {order.status === "failed" && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium text-[10px]">
                          <AlertTriangle className="w-3 h-3" /> 결제 실패
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-foreground-muted font-traditional">
                      {order.sajuGanji}
                    </td>
                    <td className="p-4">
                      {order.emailStatus === "sent" && (
                        <span className="inline-flex items-center gap-1 text-jade font-medium">
                          발송 성공
                        </span>
                      )}
                      {order.emailStatus === "pending" && (
                        <span className="inline-flex items-center gap-1 text-foreground-muted italic">
                          대기 중
                        </span>
                      )}
                      {order.emailStatus === "failed" && (
                        <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                          ⚠️ 발송 실패
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingId === order.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => saveEdit(order.id)}
                            className="bg-jade text-background px-2.5 py-1 rounded hover:bg-jade-dark text-[10px] font-semibold"
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="border border-border-custom text-foreground-muted px-2.5 py-1 rounded hover:bg-background-secondary text-[10px] font-semibold"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          {order.status === "paid" && (
                            <>
                              <Link
                                href={`/result?name=${encodeURIComponent(order.name)}&gender=${order.id === 1003 ? "male" : "female"}&type=${
                                  order.productName.includes("사주") ? "saju" : 
                                  order.productName.includes("재물") ? "wealth" : 
                                  order.productName.includes("신년") ? "newyear" : "tarot"
                                }&year=${
                                  order.id === 1004 ? "1995" : order.id === 1003 ? "1990" : "1993"
                                }&month=${
                                  order.id === 1004 ? "8" : order.id === 1003 ? "6" : "1"
                                }&day=${
                                  order.id === 1004 ? "25" : order.id === 1003 ? "15" : "20"
                                }&hour=${encodeURIComponent(
                                  order.id === 1004 ? "10:00" : order.id === 1003 ? "12:00" : "08:30"
                                )}&worryText=${encodeURIComponent(
                                  order.id === 1004 ? "이번 가을에 다니던 IT 회사를 퇴사하고 다른 회사 서비스 기획팀으로 이직을 준비하고 있는데 무사히 합격할 수 있을지 고민입니다." :
                                  order.id === 1003 ? "최근에 동업 제안을 받아 쇼핑몰 창업을 계획하고 있는데, 지금 시기에 돈을 대출받아 투자해도 괜찮을지 알고 싶습니다." :
                                  "올해 유독 회사 일이 안 풀려서 스트레스가 많고 이직 준비를 하려는데 자격증 합격이나 다른 곳으로의 기운이 따를지 조언을 부탁드립니다."
                                )}`}
                                className="inline-flex items-center gap-1 border border-jade/50 text-jade px-2 py-1 rounded hover:bg-jade hover:text-background transition-all text-[10px] font-medium"
                              >
                                결과 보기
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleResend(order.id)}
                                disabled={refreshingId === order.id}
                                className="inline-flex items-center gap-1 border border-brass/50 text-brass px-2 py-1 rounded hover:bg-brass hover:text-background transition-all disabled:opacity-50 text-[10px] font-medium"
                              >
                                <RefreshCw className={`w-3 h-3 ${refreshingId === order.id ? 'animate-spin' : ''}`} />
                                {order.emailStatus === "failed" ? "재시도" : "재전송"}
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => startEdit(order)}
                            className="inline-flex items-center gap-1 border border-border-custom text-foreground-muted px-2 py-1 rounded hover:bg-background-secondary transition-all text-[10px] font-medium"
                          >
                            수정
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
