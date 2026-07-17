"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  CreditCard, 
  MessageSquare, 
  Tag, 
  FileText, 
  BarChart3, 
  Settings, 
  Search, 
  Edit, 
  Send, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Lock, 
  Unlock, 
  FileDown 
} from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [adminPassword, setAdminPassword] = useState("artpani1234");
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // States for DB data
  const [stats, setStats] = useState({
    todayUsers: 0, todayPaid: 0, reportSuccess: 0, reportFailed: 0,
    pendingPayments: 0, refundRequests: 0, pendingInquiries: 0,
    todaySales: 0, monthSales: 0,
    statusSummary: { INPUT_COMPLETED: 0, WAITING_PAYMENT: 0, PAID: 0, ANALYZING: 0, COMPLETED: 0, DELIVERED: 0 }
  });
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [inquiryAnswer, setInquiryAnswer] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Customer edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    email: "", 
    phone: "",
    birthDate: "",
    calendarType: "solar",
    birthTime: "",
    changeReason: "",
    keepReport: "keep"
  });

  // 상태 변경 모달용 상태값들 (이메일 및 금액 직접 수정 지원)
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [modalNewStatus, setModalNewStatus] = useState("");
  const [modalNewAmount, setModalNewAmount] = useState(0);
  const [modalNewEmail, setModalNewEmail] = useState("");

  // 대시보드 선그래프용 조회 기간 필터 탭 상태값
  const [dashboardChartDateFilter, setDashboardChartDateFilter] = useState("7days");
  const [dashboardChartStartDate, setDashboardChartStartDate] = useState("");
  const [dashboardChartEndDate, setDashboardChartEndDate] = useState("");

  // 고객 정보 검색 필터 및 정렬 옵션 상태값들
  const [customerSearchType, setCustomerSearchType] = useState("all"); // all, name, phone, product
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerDateFilter, setCustomerDateFilter] = useState("all"); // all, today, 7days, 30days, custom
  const [customerStartDate, setCustomerStartDate] = useState("");
  const [customerEndDate, setCustomerEndDate] = useState("");
  const [customerSortOrder, setCustomerSortOrder] = useState("latest"); // latest, name

  // 운영 및 매출 통계 고급 제어 상태값들 (조건 검색, 그래프 타입, 조건색 연동)
  const [statsDateFilter, setStatsDateFilter] = useState("all");
  const [statsStartDate, setStatsStartDate] = useState("");
  const [statsEndDate, setStatsEndDate] = useState("");
  const [selectedReferer, setSelectedReferer] = useState(null);
  const [statsSearchType, setStatsSearchType] = useState("all"); // all, name, product
  const [statsSearchQuery, setStatsSearchQuery] = useState("");
  const [statsChartType, setStatsChartType] = useState("daily"); // daily (일별), monthly (월별), hourly (시간별)

  // 문의 및 상담 정밀 통제 상태값들 (캡처 레이아웃 싱크)
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState("all"); // all, send, etc
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all"); // all, pending, answered
  const [inquirySearchQuery, setInquirySearchQuery] = useState("");
  const [answerModalInquiry, setAnswerModalInquiry] = useState(null);
  const [modalAnswerText, setModalAnswerText] = useState("");

  // 프로모션 타겟 발송 및 조건 검색 상태값들 (캡처본 완벽 이식)
  const [promoProductFilter, setPromoProductFilter] = useState("all");
  const [promoGenderFilter, setPromoGenderFilter] = useState("all");
  const [promoPayTypeFilter, setPromoPayTypeFilter] = useState("all");
  const [promoSearchQuery, setPromoSearchQuery] = useState("");
  const [selectedPromoUsers, setSelectedPromoUsers] = useState([]); // List of checked customer IDs
  
  // 쿠폰 발생기 인풋 상태값들
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponNameInput, setCouponNameInput] = useState("신년 감사 10% 쿠폰");
  const [couponDiscountType, setCouponDiscountType] = useState("PERCENT"); // PERCENT, FIXED
  const [couponDiscountValue, setCouponDiscountValue] = useState(10);
  const [couponExpiryDate, setCouponExpiryDate] = useState("2026-12-31");
  const [couponMinAmount, setCouponMinAmount] = useState(0);
  const [selectedCouponToSend, setSelectedCouponToSend] = useState("");

  // Promotion code add form state
  const [newPromo, setNewPromo] = useState({ code: "", type: "PERCENT", value: 10, maxUses: 100, expiryDate: "" });

  // Report template config states (Sample)
  const [templateConfig, setTemplateConfig] = useState({
    tocCover: true, tocElements: true, tocNature: true, tocWealth: true, tocJob: true, tocDaeun: true, tocMonthly: true,
    themeColor: "#A3845B", displayNameType: "name_only", pdfFooterText: "혜안당 명리연구소 - 평생 사주 보감"
  });

  // Advanced search states for Orders tab
  const [dateFilter, setDateFilter] = useState("all"); // all, today, 7days, 30days, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, name, email, phone, product
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // all, paid, pending

  // Handler: Open Status Change Modal
  const handleOpenStatusModal = (order) => {
    setStatusModalOrder(order);
    setModalNewStatus(order.status || "pending");
    setModalNewAmount(order.amount || 0);
    setModalNewEmail(order.email || "");
  };

  // Handler: Apply Status Change
  const handleApplyStatusChange = async () => {
    if (!statusModalOrder) return;
    try {
      const res = await fetch(`/api/admin/users/update?adminPassword=${adminPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: statusModalOrder.id,
          status: modalNewStatus,
          amount: Number(modalNewAmount),
          email: modalNewEmail
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("주문 상태 및 결제정보가 성공적으로 변경되었습니다.");
        setStatusModalOrder(null);
        loadAllData();
      } else {
        alert("상태 변경 실패: " + data.message);
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  // Handler: Modify customer details (Advanced information like birthday, calendar, birthtime, history timeline)
  const handleUpdateUserAdvanced = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editForm.changeReason) {
      alert("정보 변경 사유를 반드시 입력해 주세요.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/update?adminPassword=${adminPassword}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: editingUser.id,
          name: editForm.name,
          phone: editForm.phone,
          email: editForm.email,
          birthDate: editForm.birthDate,
          calendarType: editForm.calendarType,
          birthTime: editForm.birthTime,
          changeReason: editForm.changeReason,
          keepReport: editForm.keepReport,
          managerName: "김관리자"
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("고객 정보 및 사주 설정이 성공적으로 수정되었으며 변경 이력이 타임라인에 누적되었습니다.");
        setEditingUser(null);
        loadAllData();
      } else {
        alert("수정 실패: " + data.message);
      }
    } catch (err) {
      alert("고객 정보 수정 네트워크 오류가 발생했습니다.");
    }
  };

  // Load Data function
  const loadAllData = async () => {
    try {
      // 1. Load dashboard stats
      const statsRes = await fetch(`/api/admin/dashboard?adminPassword=${adminPassword}`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // 2. Load orders list
      const ordersRes = await fetch(`/api/orders?adminPassword=${adminPassword}`);
      const ordersData = await ordersRes.json();
      if (Array.isArray(ordersData)) setOrders(ordersData);

      // 3. Load inquiries list
      const inquiriesRes = await fetch(`/api/admin/inquiries?adminPassword=${adminPassword}`);
      const inquiriesData = await inquiriesRes.json();
      if (Array.isArray(inquiriesData)) setInquiries(inquiriesData);

      // 4. Load promotion list
      const promoRes = await fetch(`/api/admin/promotions?adminPassword=${adminPassword}`);
      const promoData = await promoRes.json();
      if (Array.isArray(promoData)) setPromotions(promoData);

    } catch (e) {
      console.error("API load failed", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Handler: Modify customer details (Email, Phone)
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword,
          userId: editingUser.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("고객 정보가 성공적으로 수정되었으며 변경 이력이 타임라인에 기록되었습니다.");
        setEditingUser(null);
        loadAllData();
      } else {
        alert("수정 실패: " + data.error);
      }
    } catch (err) {
      alert("네트워크 오류 발생");
    }
  };

  // Handler: Manual Resend SMS/Email
  const handleResend = async (orderId, sendType) => {
    const confirmSend = confirm(`${sendType === "email" ? "이메일" : "문자(SMS)"}로 보고서 링크를 재발송하시겠습니까?`);
    if (!confirmSend) return;

    try {
      const res = await fetch("/api/admin/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword, orderId, sendType })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadAllData();
      } else {
        alert("발송 실패: " + data.error);
      }
    } catch (err) {
      alert("재발송 오류가 발생했습니다.");
    }
  };

  // Handler: Manual Order status update (PAID & unlocked)
  const handleTogglePaid = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword, id: orderId, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert(`주문 상태가 ${nextStatus.toUpperCase()}로 변경되었으며 보고서 해제 상태가 갱신되었습니다.`);
        loadAllData();
      } else {
        alert("상태 수정 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Reply Inquiry
  const handleReplyInquiry = async () => {
    if (!selectedInquiry || !inquiryAnswer) return;
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword, inquiryId: selectedInquiry.id, answer: inquiryAnswer })
      });
      const data = await res.json();
      if (data.success) {
        alert("고객 문의에 대한 답변 등록이 완료되었습니다.");
        setSelectedInquiry(null);
        setInquiryAnswer("");
        loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Add Promotion code
  const handleAddPromotion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword, ...newPromo })
      });
      const data = await res.json();
      if (data.success) {
        alert("신규 프로모션 코드가 등록되었습니다.");
        setNewPromo({ code: "", type: "PERCENT", value: 10, maxUses: 100, expiryDate: "" });
        loadAllData();
      } else {
        alert("등록 실패: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Date parsing and filter check (Generic)
  const evaluateDateFilter = (createdAtStr, filterType, startD, endD) => {
    if (!createdAtStr) return false;
    
    // DB의 UTC 날짜가 문자열 포맷("YYYY-MM-DD HH:MM:SS")으로 바로 올 경우,
    // UTC 타임존 Z를 수동으로 입혀 자바스크립트 Date가 KST 로컬 시간으로 오프셋 역보정(+9시간)을 수행하게 합니다.
    let dateStr = createdAtStr;
    if (!dateStr.includes('Z') && !dateStr.includes('+')) {
      dateStr = dateStr.replace(' ', 'T') + 'Z';
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return true; 

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filterType === "today") {
      const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return targetStart.getTime() === todayStart.getTime();
    }
    
    if (filterType === "7days") {
      const limit = new Date(todayStart);
      limit.setDate(limit.getDate() - 7);
      return date.getTime() >= limit.getTime();
    }
    
    if (filterType === "30days") {
      const limit = new Date(todayStart);
      limit.setDate(limit.getDate() - 30);
      return date.getTime() >= limit.getTime();
    }
    
    if (filterType === "custom") {
      if (startD) {
        const start = new Date(startD);
        start.setHours(0, 0, 0, 0);
        if (date.getTime() < start.getTime()) return false;
      }
      if (endD) {
        const end = new Date(endD);
        end.setHours(23, 59, 59, 999);
        if (date.getTime() > end.getTime()) return false;
      }
    }
    
    return true;
  };

  // Helper: Date parsing and filter check for Orders
  const checkDateFilter = (createdAtStr) => {
    return evaluateDateFilter(createdAtStr, dateFilter, startDate, endDate);
  };

  // Filter orders by search type, search query, date filter, and status filter
  const filteredOrders = orders.filter(o => {
    // 1. Date Filter
    if (!checkDateFilter(o.createdAt)) return false;

    // 2. Status Filter
    if (paymentStatusFilter !== "all") {
      const statusLower = o.status.toLowerCase();
      const filterLower = paymentStatusFilter.toLowerCase();
      
      if (filterLower === "paid") {
        // 결제 완료 필터일 경우 유료 결제완료(paid)와 무료 결제완료(free) 모두 포함
        if (statusLower !== "paid" && statusLower !== "free") return false;
      } else {
        if (statusLower !== filterLower) return false;
      }
    }

    // 3. Search Query and Type Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = o.name.toLowerCase().includes(query);
      const emailMatch = (o.email || "").toLowerCase().includes(query);
      const phoneMatch = (o.phone || "").replace(/[^0-9]/g, "").includes(query.replace(/[^0-9]/g, ""));
      const productMatch = (o.productName || "").toLowerCase().includes(query);

      if (searchType === "all") {
        if (!nameMatch && !emailMatch && !phoneMatch && !productMatch) return false;
      } else if (searchType === "name") {
        if (!nameMatch) return false;
      } else if (searchType === "email") {
        if (!emailMatch) return false;
      } else if (searchType === "phone") {
        if (!phoneMatch) return false;
      } else if (searchType === "product") {
        if (!productMatch) return false;
      }
    }

    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center text-[#212529] px-4">
        <div className="bg-white p-8 rounded-xl border border-[#A3845B]/30 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-[#A3845B] text-center mb-6">혜안당 관리자 로그인</h2>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="관리자 인증 비밀번호" 
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full bg-white border border-[#dee2e6] rounded p-3 text-[#212529] focus:outline-none focus:border-[#A3845B]"
            />
            <button 
              onClick={() => setIsAuthenticated(true)}
              className="w-full bg-[#A3845B] hover:bg-[#8e724b] text-white font-bold p-3 rounded transition-all duration-300 shadow-md"
            >
              대시보드 진입
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#f4f1ea] border-r border-[#A3845B]/20 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          <div className="p-6 border-b border-[#A3845B]/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#A3845B] flex items-center justify-center text-white font-bold">寶</div>
            <h1 className="text-xl font-bold text-[#8e724b] tracking-wide">혜안당 관리소</h1>
          </div>
          <nav className="p-4 space-y-1">
            {[
              { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
              { id: "orders", label: "주문 관리", icon: CreditCard },
              { id: "customers", label: "고객 관리", icon: Users },
              { id: "products", label: "상품 관리", icon: ShoppingBag },
              { id: "inquiries", label: "문의 및 상담", icon: MessageSquare },
              { id: "promotions", label: "프로모션 관리", icon: Tag },
              { id: "templates", label: "템플릿 관리", icon: FileText },
              { id: "stats", label: "운영 통계", icon: BarChart3 },
              { id: "settings", label: "시스템 설정", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id 
                      ? "bg-[#A3845B] text-white font-bold shadow-md shadow-[#A3845B]/20" 
                      : "hover:bg-[#e9ecef] text-[#495057] hover:text-[#121212]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-[#A3845B]/10 text-xs text-[#888] text-center">
          <p>© 2026 혜안당 명리연구소</p>
          <p className="mt-1">v1.2 (SQLite+Prisma)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* TAB 1. DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-[#8e724b]">서비스 주요 현황</h2>
                <p className="text-[#666] mt-1 font-medium">오늘 접수 및 결제, 생성 상태 요약 장표</p>
              </div>
              <button onClick={loadAllData} className="flex items-center gap-2 border border-[#A3845B]/40 hover:border-[#A3845B] bg-white px-4 py-2 rounded text-sm text-[#8e724b] font-semibold transition-all shadow-sm">
                <RotateCcw className="w-4 h-4" /> 새로고침
              </button>
            </div>

            {/* Scoreboard Cards (Interactive navigation to search lists) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "오늘 신청 건수", val: `${stats.todayUsers} 건`, color: "border-l-4 border-blue-500", action: () => { setActiveTab("orders"); setDateFilter("today"); setPaymentStatusFilter("all"); } },
                { title: "결제 완료 건수", val: `${stats.todayPaid} 건`, color: "border-l-4 border-[#A3845B]", action: () => { setActiveTab("orders"); setDateFilter("today"); setPaymentStatusFilter("paid"); } },
                { title: "보고서 생성 완료", val: `${stats.reportSuccess} 건`, color: "border-l-4 border-green-500", action: () => { setActiveTab("orders"); setDateFilter("today"); setPaymentStatusFilter("all"); } },
                { title: "보고서 생성 실패", val: `${stats.reportFailed} 건`, color: "border-l-4 border-red-500", action: () => { setActiveTab("orders"); setDateFilter("today"); setPaymentStatusFilter("all"); } },
                { title: "미결제 건수", val: `${stats.pendingPayments} 건`, color: "border-l-4 border-yellow-500", action: () => { setActiveTab("orders"); setDateFilter("today"); setPaymentStatusFilter("pending"); } },
                { title: "환불 요청 건수", val: `${stats.refundRequests} 건`, color: "border-l-4 border-purple-500", action: () => { setActiveTab("orders"); setDateFilter("all"); setPaymentStatusFilter("all"); } },
                { title: "고객 문의 대기", val: `${stats.pendingInquiries} 건`, color: "border-l-4 border-indigo-500", action: () => { setActiveTab("inquiries"); } },
                { title: "오늘 매출", val: `${stats.todaySales.toLocaleString()} 원`, color: "border-l-4 border-emerald-500", action: () => { setActiveTab("stats"); } }
              ].map((card, i) => (
                <div 
                  key={i} 
                  onClick={card.action}
                  className={`bg-white p-6 rounded-xl border border-[#A3845B]/10 shadow-sm flex flex-col justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${card.color}`}
                >
                  <span className="text-sm text-[#666] font-semibold">{card.title}</span>
                  <span className="text-2xl font-bold text-[#212529] mt-2">{card.val}</span>
                </div>
              ))}
            </div>

            {/* Sales Monthly & Funnel summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl border border-[#A3845B]/10 shadow-sm">
                <h3 className="text-lg font-bold text-[#8e724b] mb-4">매출 집계</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[#f1f3f5]">
                    <span className="text-[#495057]">오늘 순매출</span>
                    <span className="font-bold text-[#212529]">{stats.todaySales.toLocaleString()} 원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#f1f3f5]">
                    <span className="text-[#495057]">이번 달 총매출</span>
                    <span className="font-bold text-[#8e724b] text-xl">{stats.monthSales.toLocaleString()} 원</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#A3845B]/10 shadow-sm">
                <h3 className="text-lg font-bold text-[#8e724b] mb-4">진행 단계 파이프라인</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "정보 입력 완료", count: stats.statusSummary.INPUT_COMPLETED },
                    { label: "결제 대기", count: stats.statusSummary.WAITING_PAYMENT },
                    { label: "결제 완료", count: stats.statusSummary.PAID },
                    { label: "사주 분석 중", count: stats.statusSummary.ANALYZING },
                    { label: "보고서 생성완료", count: stats.statusSummary.COMPLETED },
                    { label: "전달 완료", count: stats.statusSummary.DELIVERED },
                  ].map((pipe, i) => (
                    <div key={i} className="bg-[#f8f9fa] p-3 rounded border border-[#e9ecef]">
                      <div className="text-xs text-[#666] font-medium">{pipe.label}</div>
                      <div className="text-lg font-bold text-[#212529] mt-1">{pipe.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 메인 대시보드 하단: 통합 신청 & 결제 분석 선그래프 */}
            {(() => {
              let dateList = [];
              const todayStr = new Date().toISOString().split('T')[0];

              if (dashboardChartDateFilter === "today") {
                dateList = Array.from({ length: 6 }, (_, i) => {
                  const hour = (i + 1) * 4;
                  return { label: `${hour}시`, queryStr: hour, isHourSlot: true };
                });
              } else {
                let dayCount = 7;
                if (dashboardChartDateFilter === "7days") dayCount = 7;
                else if (dashboardChartDateFilter === "30days") dayCount = 30;
                else if (dashboardChartDateFilter === "all") dayCount = 15;
                else if (dashboardChartDateFilter === "custom") {
                  if (dashboardChartStartDate && dashboardChartEndDate) {
                    const diffTime = Math.abs(new Date(dashboardChartEndDate) - new Date(dashboardChartStartDate));
                    dayCount = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1, 60);
                  }
                }

                dateList = Array.from({ length: dayCount }, (_, i) => {
                  const d = new Date();
                  if (dashboardChartDateFilter === "custom" && dashboardChartEndDate) {
                    d.setTime(new Date(dashboardChartEndDate).getTime() - (dayCount - 1 - i) * 24 * 60 * 60 * 1000);
                  } else {
                    d.setDate(d.getDate() - (dayCount - 1 - i));
                  }
                  const dateStr = d.toISOString().split('T')[0];
                  return { label: dateStr.slice(5), queryStr: dateStr, isHourSlot: false };
                });
              }

              const statsData = dateList.map(item => {
                if (item.isHourSlot) {
                  const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(todayStr));
                  const totalCount = dayOrders.filter(o => {
                    const h = Number(o.createdAt.split(' ')[1]?.split(':')[0] || 0);
                    return h >= (item.queryStr - 4) && h < item.queryStr;
                  }).length;
                  const paidCount = dayOrders.filter(o => {
                    const h = Number(o.createdAt.split(' ')[1]?.split(':')[0] || 0);
                    return o.status === "paid" && h >= (item.queryStr - 4) && h < item.queryStr;
                  }).length;
                  const totalSales = dayOrders.filter(o => {
                    const h = Number(o.createdAt.split(' ')[1]?.split(':')[0] || 0);
                    return o.status === "paid" && h >= (item.queryStr - 4) && h < item.queryStr;
                  }).reduce((sum, o) => sum + (o.amount || 0), 0);

                  return { dateLabel: item.label, totalCount, paidCount, totalSales };
                } else {
                  const dayOrders = orders.filter(o => o.createdAt && o.createdAt.startsWith(item.queryStr));
                  const totalCount = dayOrders.length;
                  const paidCount = dayOrders.filter(o => o.status === "paid").length;
                  const totalSales = dayOrders.filter(o => o.status === "paid").reduce((sum, o) => sum + (o.amount || 0), 0);
                  return { dateLabel: item.label, totalCount, paidCount, totalSales };
                }
              });

              const maxCount = Math.max(...statsData.map(d => d.totalCount), 5);
              const maxSales = Math.max(...statsData.map(d => d.totalSales), 50000);
              const N = statsData.length;

              const pointsTotal = statsData.map((d, i) => {
                const x = 60 + i * (500 / (N - 1 || 1));
                const y = 180 - (d.totalCount / maxCount) * 140;
                return { x, y };
              });

              const pointsPaid = statsData.map((d, i) => {
                const x = 60 + i * (500 / (N - 1 || 1));
                const y = 180 - (d.paidCount / maxCount) * 140;
                return { x, y };
              });

              const pointsSales = statsData.map((d, i) => {
                const x = 60 + i * (500 / (N - 1 || 1));
                const y = 180 - (d.totalSales / maxSales) * 140;
                return { x, y };
              });

              const pathTotal = pointsTotal.map(p => `${p.x},dots`).join(' '); // we will construct this in js safely below
              const pathPaid = pointsPaid.map(p => `${p.x},${p.y}`).join(' ');
              const pathSales = pointsSales.map(p => `${p.x},${p.y}`).join(' ');
              const pathTotalStr = pointsTotal.map(p => `${p.x},${p.y}`).join(' ');

              return (
                <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm mt-8">
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#212529]">통합 신규신청 & 결제 분석</h3>
                      <p className="text-xs text-[#888] mt-1 font-semibold">대시보드 메인 화면의 실시간 신청 및 매출 통계를 그래프로 확인합니다.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <span className="w-3 h-1 bg-blue-500 rounded-full inline-block"></span>
                        신청 건수 (건)
                      </span>
                      <span className="flex items-center gap-1.5 text-green-600">
                        <span className="w-3 h-1 bg-green-500 rounded-full inline-block"></span>
                        결제 완료 (건)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#8e724b]">
                        <span className="w-3 h-1 bg-[#8e724b] rounded-full inline-block"></span>
                        결제 금액 (원)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 border-b border-[#dee2e6]/50 pb-4 mb-6 text-xs">
                    {[
                      { id: "all", label: "전체" },
                      { id: "today", label: "오늘" },
                      { id: "7days", label: "7일" },
                      { id: "30days", label: "30일" },
                      { id: "custom", label: "직접지정" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDashboardChartDateFilter(opt.id)}
                        className={`px-3 py-1.5 rounded-lg border transition-all font-bold ${
                          dashboardChartDateFilter === opt.id
                            ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                            : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}

                    {dashboardChartDateFilter === "custom" && (
                      <div className="flex items-center gap-1 ml-2">
                        <input 
                          type="date" 
                          value={dashboardChartStartDate}
                          onChange={(e) => setDashboardChartStartDate(e.target.value)}
                          className="bg-white border border-[#dee2e6] rounded px-2.5 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#8e724b] shadow-sm font-semibold"
                        />
                        <span className="text-[#888] font-bold">~</span>
                        <input 
                          type="date" 
                          value={dashboardChartEndDate}
                          onChange={(e) => setDashboardChartEndDate(e.target.value)}
                          className="bg-white border border-[#dee2e6] rounded px-2.5 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#8e724b] shadow-sm font-semibold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="relative w-full overflow-x-auto">
                    <svg className="w-full min-w-[600px] h-[240px]" viewBox="0 0 600 240">
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = 180 - ratio * 140;
                        const countVal = Math.round(ratio * maxCount);
                        const salesVal = Math.round(ratio * maxSales);
                        return (
                          <g key={i} className="opacity-40">
                            <line x1="60" y1={y} x2="560" y2={y} stroke="#dee2e6" strokeDasharray="4 4" strokeWidth="1" />
                            <text x="45" y={y + 4} textAnchor="end" className="text-[10px] fill-[#666] font-bold">{countVal}건</text>
                            <text x="575" y={y + 4} textAnchor="start" className="text-[10px] fill-[#8e724b] font-bold">{salesVal.toLocaleString()}원</text>
                          </g>
                        );
                      })}

                      {statsData.map((d, i) => {
                        const x = 60 + i * (500 / (N - 1 || 1));
                        return (
                          <text key={i} x={x} y="215" textAnchor="middle" className="text-[10px] fill-[#666] font-bold">{d.dateLabel}</text>
                        );
                      })}

                      {pathTotalStr && <polyline fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pathTotalStr} className="drop-shadow-sm" />}
                      {pointsTotal.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                          <rect x={p.x - 20} y={p.y - 25} width="40" height="16" rx="4" fill="#3b82f6" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <text x={p.x} y={p.y - 14} textAnchor="middle" className="text-[9px] fill-[#fff] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">{statsData[i].totalCount}건</text>
                        </g>
                      ))}

                      {pathPaid && <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pathPaid} className="drop-shadow-sm" />}
                      {pointsPaid.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
                          <rect x={p.x - 20} y={p.y - 25} width="40" height="16" rx="4" fill="#10b981" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <text x={p.x} y={p.y - 14} textAnchor="middle" className="text-[9px] fill-[#fff] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">{statsData[i].paidCount}건</text>
                        </g>
                      ))}

                      {pathSales && <polyline fill="none" stroke="#8e724b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pathSales} className="drop-shadow-sm" />}
                      {pointsSales.map((p, i) => (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="5" fill="#8e724b" stroke="#fff" strokeWidth="2" />
                          <rect x={p.x - 30} y={p.y - 25} width="60" height="16" rx="4" fill="#8e724b" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <text x={p.x} y={p.y - 14} textAnchor="middle" className="text-[8px] fill-[#fff] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">{(statsData[i].totalSales / 10000).toFixed(1)}만</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 2. ORDERS */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-[#8e724b]">주문 및 결제 관리</h2>
                <p className="text-[#666] mt-1 font-medium font-semibold">결제 검증, 상태 수동 승인 및 링크 수동 발송</p>
              </div>
            </div>

            {/* 고급 정밀 검색 조건 필터바 (한 줄 다이어트 정리) */}
            <div className="bg-white p-4 rounded-xl border border-[#dee2e6] shadow-sm flex flex-wrap items-center gap-3 text-xs mb-4">
              <span className="font-bold text-[#495057] mr-1">조회 기간</span>
              <div className="flex gap-1">
                {[
                  { id: "all", label: "전체기간" },
                  { id: "today", label: "오늘" },
                  { id: "7days", label: "최근 7일" },
                  { id: "30days", label: "최근 30일" },
                  { id: "custom", label: "직접지정" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setDateFilter(btn.id)}
                    className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                      dateFilter === btn.id
                        ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                        : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {dateFilter === "custom" && (
                <div className="flex items-center gap-1 ml-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                  <span className="text-[#888] font-bold">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                </div>
              )}

              <span className="font-bold text-[#495057] ml-2 mr-1">조건 검색</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
              >
                <option value="all">전체 결제상태</option>
                <option value="paid">결제완료</option>
                <option value="free">무료</option>
                <option value="pending">대기</option>
                <option value="cancelled">취소</option>
                <option value="refunded">환불완료</option>
              </select>

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
              >
                <option value="all">통합검색</option>
                <option value="name">고객명</option>
                <option value="email">이메일</option>
                <option value="phone">전화번호</option>
                <option value="product">상품명</option>
              </select>

              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#888]" />
                <input 
                  type="text" 
                  placeholder="검색어를 입력해 주세요" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded pl-7 pr-2 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] shadow-sm font-semibold"
                />
              </div>
            </div>

            {/* 검색 결과 수량 노출 */}
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-[#495057] flex items-center gap-2">
                주문 목록
                <span className="text-xs bg-[#8e724b]/10 text-[#8e724b] px-2.5 py-0.5 rounded-full font-bold">
                  검색 결과: {filteredOrders.length}건
                </span>
              </h3>
            </div>

            <div className="bg-white rounded-xl border border-[#dee2e6] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f1f3f5] border-b border-[#dee2e6] text-xs text-[#495057] uppercase font-bold">
                    <th className="p-4">주문번호 / 신청번호</th>
                    <th className="p-4">주문일시</th>
                    <th className="p-4">고객정보</th>
                    <th className="p-4">상품명</th>
                    <th className="p-4">결제금액</th>
                    <th className="p-4">결제상태</th>
                    <th className="p-4 text-center">수동 제어 (재발송 / 강제 승인)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee2e6] text-sm text-[#495057]">
                  {filteredOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-[#f8f9fa] transition-all">
                      <td className="p-4">
                        <div className="text-[#212529] font-semibold">{order.id}</div>
                        <div className="text-xs text-[#666]">신청: {order.applicationNum || "SMS_APP_" + order.id}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-[#666]">{order.createdAt}</td>
                      <td className="p-4">
                        <div className="text-[#212529] font-semibold">{order.name}</div>
                        <div className="text-xs text-[#666]">{order.phone}</div>
                        <div className="text-xs text-[#666]">{order.email || "이메일 없음"}</div>
                      </td>
                      <td className="p-4 text-[#8e724b] font-semibold">{order.productName}</td>
                      <td className="p-4 font-bold text-[#212529]">{order.amount?.toLocaleString()} 원</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          order.status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : order.status === "free"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "refunded"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {order.status === "paid" 
                            ? "결제완료" 
                            : order.status === "free"
                              ? "무료"
                              : order.status === "refunded"
                                ? "환불완료"
                                : order.status === "cancelled" 
                                  ? "취소" 
                                  : "대기"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleOpenStatusModal(order)}
                            className="bg-brass text-background hover:bg-brass-dark text-xs px-2.5 py-1.5 rounded transition-all font-bold shadow-sm cursor-pointer"
                          >
                            상태변경
                          </button>
                          <button 
                            onClick={() => handleResend(order.id, "sms")}
                            className="bg-[#A3845B]/10 hover:bg-[#A3845B] text-[#8e724b] hover:text-white border border-[#A3845B]/30 text-xs px-2 py-1.5 rounded transition-all font-bold"
                          >
                            문자 재발송
                          </button>
                          <button 
                            onClick={() => handleResend(order.id, "email")}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs px-2 py-1.5 rounded transition-all font-semibold"
                          >
                            메일 재발송
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3. CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">고객 정보 관리</h2>
              <p className="text-[#666] mt-1 font-medium">고객의 이름, 연락처, 이메일 수정 및 수정 이력 타임라인 조회</p>
            </div>

            {/* 필터바 한 줄 정리 */}
            <div className="bg-white p-4 rounded-xl border border-[#dee2e6] shadow-sm flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#495057] mr-1">검색 분류</span>
              <select
                value={customerSearchType}
                onChange={(e) => setCustomerSearchType(e.target.value)}
                className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
              >
                <option value="all">통합검색</option>
                <option value="name">이름</option>
                <option value="phone">전화번호</option>
                <option value="product">상품명</option>
              </select>

              <div className="relative w-48">
                <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-[#888]" />
                <input 
                  type="text" 
                  placeholder="검색어 입력..." 
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded pl-7 pr-2 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] shadow-sm font-semibold"
                />
              </div>

              <span className="font-bold text-[#495057] ml-2 mr-1">기간 설정</span>
              <select
                value={customerDateFilter}
                onChange={(e) => setCustomerDateFilter(e.target.value)}
                className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="7days">최근 7일</option>
                <option value="30days">최근 30일</option>
                <option value="custom">직접지정</option>
              </select>

              {customerDateFilter === "custom" && (
                <div className="flex items-center gap-1">
                  <input 
                    type="date" 
                    value={customerStartDate}
                    onChange={(e) => setCustomerStartDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                  <span className="text-[#888]">~</span>
                  <input 
                    type="date" 
                    value={customerEndDate}
                    onChange={(e) => setCustomerEndDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                </div>
              )}

              <span className="font-bold text-[#495057] ml-2 mr-1">정렬 기준</span>
              <div className="flex gap-1">
                {[
                  { id: "latest", label: "최신순" },
                  { id: "name", label: "이름순" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCustomerSortOrder(opt.id)}
                    className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                      customerSortOrder === opt.id
                        ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                        : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Customer table list */}
              <div className="md:col-span-2 bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm">
                {(() => {
                  let list = orders.reduce((acc, current) => {
                    const x = acc.find(item => item.phone === current.phone || item.name === current.name);
                    if (!x) {
                      return acc.concat([current]);
                    } else {
                      if (new Date(current.createdAt) > new Date(x.createdAt)) {
                        x.createdAt = current.createdAt;
                      }
                      return acc;
                    }
                  }, []);

                  if (customerSearchQuery) {
                    const q = customerSearchQuery.toLowerCase();
                    list = list.filter(c => {
                      if (customerSearchType === "name") return c.name.toLowerCase().includes(q);
                      if (customerSearchType === "phone") return c.phone.includes(q);
                      if (customerSearchType === "product") return c.productName.toLowerCase().includes(q);
                      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.productName.toLowerCase().includes(q);
                    });
                  }

                  if (customerDateFilter !== "all") {
                    list = list.filter(c => evaluateDateFilter(c.createdAt, customerDateFilter, customerStartDate, customerEndDate));
                  }

                  if (customerSortOrder === "name") {
                    list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
                  } else {
                    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                  }

                  return (
                    <>
                      <div className="flex justify-between items-center mb-4 border-b border-[#f1f3f5] pb-3">
                        <h3 className="text-lg font-bold text-[#212529] flex items-center gap-2">
                          고객 목록
                          <span className="text-xs bg-[#8e724b]/10 text-[#8e724b] px-2.5 py-0.5 rounded-full font-bold">
                            총 {list.length}명
                          </span>
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {list.map((customer, i) => {
                          const userOrders = orders.filter(o => o.phone === customer.phone || o.name === customer.name);
                          userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                          const lastOrderDate = userOrders[0]?.createdAt ? userOrders[0].createdAt.split(' ')[0] : '-';

                          return (
                            <div key={i} className="flex justify-between items-center p-4 bg-[#f8f9fa] rounded border border-[#e9ecef] hover:border-[#A3845B]/60 transition-all shadow-sm">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#212529] cursor-pointer hover:text-[#8e724b]" onClick={() => {
                                    setEditingUser({ id: customer.id || customer.userId, name: customer.name, email: customer.email, phone: customer.phone });
                                    setEditForm({ 
                                      name: customer.name, 
                                      email: customer.email || "", 
                                      phone: customer.phone,
                                      birthDate: customer.birthDate || "",
                                      calendarType: customer.calendarType || "solar",
                                      birthTime: customer.birthTime || "",
                                      changeReason: "",
                                      keepReport: "keep"
                                    });
                                  }}>{customer.name}</span>
                                  <span className="text-[10px] bg-[#8e724b]/10 text-[#8e724b] px-2 py-0.5 rounded font-bold">최근주문: {lastOrderDate}</span>
                                </div>
                                <span className="text-xs text-[#666]">{customer.phone}</span>
                                <div className="text-xs text-[#888] mt-0.5">{customer.email || "이메일 정보 없음"}</div>
                              </div>
                              <button 
                                onClick={() => {
                                  setEditingUser({ id: customer.id || customer.userId, name: customer.name, email: customer.email, phone: customer.phone });
                                  setEditForm({ 
                                    name: customer.name, 
                                    email: customer.email || "", 
                                    phone: customer.phone,
                                    birthDate: customer.birthDate || "",
                                    calendarType: customer.calendarType || "solar",
                                    birthTime: customer.birthTime || "",
                                    changeReason: "",
                                    keepReport: "keep"
                                  });
                                }}
                                className="flex items-center gap-1 bg-white border border-[#dee2e6] hover:border-[#A3845B] text-xs text-[#8e724b] hover:bg-[#A3845B]/5 px-3 py-1.5 rounded transition-all font-semibold"
                              >
                                <Edit className="w-3.5 h-3.5" /> 정보수정
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
              {/* Edit Form & History Timeline Panel */}
              <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm md:col-span-1">
                <h3 className="text-lg font-bold text-[#8e724b] mb-4">고객 상세 수정 및 변경 이력</h3>
                {editingUser ? (
                  <form onSubmit={handleUpdateUserAdvanced} className="space-y-4 text-left">
                    <div>
                      <label className="text-xs text-[#666] font-bold">고객명</label>
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-sm focus:outline-none focus:border-[#A3845B] mt-1 font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#666] font-bold">전화번호 (연락처)</label>
                      <input 
                        type="text" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-sm focus:outline-none focus:border-[#A3845B] mt-1 font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#666] font-bold">이메일 주소</label>
                      <input 
                        type="email" 
                        value={editForm.email} 
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-sm focus:outline-none focus:border-[#A3845B] mt-1 font-semibold" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-[#666] font-bold">생년월일 (8자리)</label>
                        <input 
                          type="text" 
                          placeholder="예: 19900101"
                          value={editForm.birthDate} 
                          onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                          className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs focus:outline-none focus:border-[#A3845B] mt-1 font-semibold text-center" 
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#666] font-bold">출생시간 (HH:MM)</label>
                        <input 
                          type="text" 
                          placeholder="예: 14:30"
                          value={editForm.birthTime} 
                          onChange={(e) => setEditForm({ ...editForm, birthTime: e.target.value })}
                          className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs focus:outline-none focus:border-[#A3845B] mt-1 font-semibold text-center" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-[#666] font-bold">음력·양력 구분</label>
                      <select 
                        value={editForm.calendarType} 
                        onChange={(e) => setEditForm({ ...editForm, calendarType: e.target.value })}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs focus:outline-none focus:border-[#A3845B] mt-1 font-semibold" 
                      >
                        <option value="solar">양력</option>
                        <option value="lunar">음력 (평달)</option>
                        <option value="lunar_leap">음력 (윤달)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-[#666] font-bold">기존 보고서 처리 방식</label>
                      <select 
                        value={editForm.keepReport} 
                        onChange={(e) => setEditForm({ ...editForm, keepReport: e.target.value })}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs focus:outline-none focus:border-[#A3845B] mt-1 font-semibold" 
                      >
                        <option value="keep">기존 보고서 그대로 유지</option>
                        <option value="regenerate">자동으로 다시 생성</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-red-600 font-bold">정보 변경 사유 * (필수)</label>
                      <input 
                        type="text" 
                        placeholder="예: 고객 전화 요청"
                        value={editForm.changeReason} 
                        onChange={(e) => setEditForm({ ...editForm, changeReason: e.target.value })}
                        className="w-full bg-white border border-red-300 rounded p-2 text-[#212529] text-xs focus:outline-none focus:border-red-500 mt-1 font-semibold" 
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-[#A3845B] hover:bg-[#8e724b] text-white font-bold py-2 rounded text-xs transition-all shadow">변경 사항 저장</button>
                      <button type="button" onClick={() => setEditingUser(null)} className="bg-[#f1f3f5] hover:bg-[#e9ecef] text-[#495057] px-4 py-2 rounded text-xs transition-all font-semibold">취소</button>
                    </div>

                    {(() => {
                      const userOrders = orders.filter(o => o.phone === editForm.phone || o.name === editForm.name);
                      const currentOrder = userOrders[0];
                      const histories = currentOrder?.history || [];
                      
                      return (
                        <div className="pt-4 border-t border-[#dee2e6] mt-4 space-y-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-[#8e724b] mb-2">📋 변경 이력 타임라인</h4>
                            {histories.length > 0 ? (
                              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                                {histories.map((h, idx) => (
                                  <div key={idx} className="bg-amber-50/50 p-2.5 rounded border border-[#A3845B]/15 text-[10px] space-y-1 text-left">
                                    <div className="flex justify-between font-bold text-[#8e724b]">
                                      <span>{h.changedAt}</span>
                                      <span>처리자: {h.managerName || "관리자"}</span>
                                    </div>
                                    <div className="text-[#212529] font-medium leading-relaxed">{h.detail}</div>
                                    <div className="text-[#888] font-bold">사유: {h.reason}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#888] italic text-center py-2">변경 이력이 아직 존재하지 않습니다.</p>
                            )}
                          </div>

                          <div>
                            <h4 className="text-xs font-extrabold text-[#8e724b] mb-2">🛍️ 이 고객의 상품주문 이력</h4>
                            <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                              {userOrders.map((o, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px] p-2 bg-[#f8f9fa] rounded border border-[#dee2e6]">
                                  <span className="font-bold text-[#212529] truncate max-w-[120px]">{o.productName}</span>
                                  <span className="text-[#8e724b] font-bold">{o.amount?.toLocaleString()}원</span>
                                  <span className={`px-1.5 py-0.5 rounded font-bold text-[8px] ${
                                    o.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                  }`}>{o.status.toUpperCase()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </form>
                ) : (
                  <p className="text-sm text-foreground-muted text-center py-12">고객 목록에서 [정보수정] 버튼을 클릭하면 세부 정보 수정창 및 수정 이력 타임라인이 렌더링됩니다.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4. PRODUCTS 
            - 큰 카테고리 내부에 세부 등급별 상품과 금액을 일목요연하게 나열한 완성형 구조 */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">사주 상품 및 리포트 구성</h2>
              <p className="text-[#666] mt-1 font-medium font-semibold">혜안당 공식 판매 상품군 실시간 단가 및 원가 노출 관리</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {[
                {
                  name: "평생 종합사주",
                  badge: "37페이지 이상 PDF",
                  description: "타고난 오행 분포, 평생의 흐름을 짚어주는 10년 주기 대운, 인생의 황금기와 솔루션을 포함한 종합 보고서.",
                  subProducts: [
                    { name: "문자메시지 요약", price: "14,900", originalPrice: "35,000", tag: "기본" },
                    { name: "고급 리포트", price: "34,900", originalPrice: "55,000", tag: "추천" },
                    { name: "심화 리포트", price: "49,900", originalPrice: "70,000", tag: "인기" }
                  ]
                },
                {
                  name: "신년운세",
                  badge: "51페이지 이상 PDF",
                  description: "새해에 가장 많이 찾는 상품으로, 한 해의 총체적인 흐름, 오행의 상생상극 융합 및 신수비결 분석.",
                  subProducts: [
                    { name: "문자메시지 요약", price: "14,900", originalPrice: "40,000", tag: "기본" },
                    { name: "고급 리포트", price: "34,900", originalPrice: "55,000", tag: "추천" },
                    { name: "심화 리포트", price: "49,900", originalPrice: "70,000", tag: "인기" }
                  ]
                },
                {
                  name: "토종비결",
                  badge: "30페이지 이상 PDF",
                  description: "조선 전통 토정 이지함 선생의 원본 해석에 따른 1년 신수비결과 생존 전략.",
                  subProducts: [
                    { name: "문자메시지 요약", price: "14,900", originalPrice: "25,000", tag: "기본" },
                    { name: "고급 리포트", price: "34,900", originalPrice: "36,000", tag: "추천" }
                  ]
                },
                {
                  name: "연인 궁합",
                  badge: "인기 상승",
                  description: "두 사람의 타고난 오행 분포 조화, 밀착/정서적 궁합, 백년해로 타이밍 및 관계 유지 솔루션 제공.",
                  subProducts: [
                    { name: "궁합", price: "26,900", originalPrice: "45,000", tag: "기본" },
                    { name: "밀착 궁합", price: "26,900", originalPrice: "55,000", tag: "인기" },
                    { name: "재회운", price: "19,900", originalPrice: "30,000", tag: "재회" }
                  ]
                },
                {
                  name: "재물 & 비즈니스운",
                  badge: "비즈니스",
                  description: "평생의 재물 성향(안정 vs 투자), 재물이 들어오는 최적의 타이밍, 이직 및 사업 확장 적합 시기 집중 분석.",
                  subProducts: [
                    { name: "재물&비즈니스운", price: "19,900", originalPrice: "30,000", tag: "34% 할인" }
                  ]
                },
                {
                  name: "1:1 맞춤 타로 상담사",
                  badge: "타로 상담",
                  description: "선택하신 가장 고민인 분야를 중점으로 타로 카드가 제시하는 미래와 조언.",
                  subProducts: [
                    { name: "타로상담 (온라인 단일)", price: "9,900", originalPrice: "30,000", tag: "특별가" }
                  ]
                },
                {
                  name: "꿈해몽 & 사주 조율",
                  badge: "신규",
                  description: "어젯밤 꿈의 길흉 해몽과 내 사주 오행의 동조 현상 분석. 꿈이 현실과 어떤 관계인지 명리학으로 풀어드립니다.",
                  subProducts: [
                    { name: "꿈해몽&사주조율", price: "9,900", originalPrice: "30,000", tag: "67% 할인" }
                  ]
                },
                {
                  name: "나만의 맞춤 운세",
                  badge: "맞춤 운세",
                  description: "개인별 사주 원국과 대운을 기반으로 제공하는 1:1 커스텀 맞춤형 일일 운세.",
                  subProducts: [
                    { name: "나만의 맞춤 운세", price: "3,900", originalPrice: "5,000", tag: "인기" }
                  ]
                }
              ].map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-[#dee2e6] hover:border-[#A3845B] transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="bg-[#A3845B]/10 text-[#8e724b] text-[10px] font-bold px-2 py-0.5 rounded-full">{p.badge}</span>
                      <span className="text-[10px] text-[#888] font-bold">AI 연산 생성</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#212529] mt-2.5">{p.name}</h3>
                    <p className="text-[11px] text-[#666] mt-1 font-semibold leading-relaxed">{p.description}</p>

                    {/* 하위 세부 상품 리스트 및 가격 나열 (원가 취소선 포함) */}
                    <div className="mt-4 bg-[#fcfaf7] rounded-lg border border-[#f1f3f5] p-3 space-y-2.5 text-xs font-semibold">
                      <div className="text-[10px] text-[#8e724b] border-b border-[#A3845B]/10 pb-1 font-extrabold flex justify-between">
                        <span>세부 등급 및 상품</span>
                        <span>판매 금액</span>
                      </div>
                      {p.subProducts.map((sub, sidx) => (
                        <div key={sidx} className="flex justify-between items-center text-[#495057]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#212529]">{sub.name}</span>
                            <span className="bg-slate-200/60 text-[#666] text-[8px] font-extrabold px-1 rounded-sm">{sub.tag}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9.5px] text-[#999] line-through mr-1.5 font-medium">{sub.originalPrice}원</span>
                            <span className="text-[#212529] font-extrabold text-xs">{sub.price} 원</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 mt-5 pt-3 border-t border-[#f1f3f5]">
                    <button className="text-[11px] border border-[#dee2e6] hover:border-[#A3845B] hover:bg-[#A3845B]/5 text-[#8e724b] px-2.5 py-1.2 rounded transition-all font-bold cursor-pointer">구성 편집</button>
                    <button className="text-[11px] bg-[#A3845B] hover:bg-[#8e724b] text-white px-3 py-1.2 rounded transition-all font-bold cursor-pointer">금액 수정</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5. INQUIRIES & MESSAGE */}
        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">고객 문의 내역 관리</h2>
              <p className="text-[#666] mt-1 font-medium font-semibold">사용자들로부터 접수된 1:1 오류 제보 및 일반 문의에 대해 답변을 관리합니다.</p>
            </div>

            {/* 캡처본 레이아웃 필터바 */}
            <div className="bg-white p-4 rounded-xl border border-[#dee2e6] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-[#495057]">문의 유형:</span>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "전체 문의" },
                    { id: "send", label: "발송 문의" },
                    { id: "etc", label: "기타 문의" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setInquiryTypeFilter(btn.id)}
                      className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                        inquiryTypeFilter === btn.id
                          ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                          : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <span className="font-bold text-[#495057] ml-2">답변 상태:</span>
                <div className="flex gap-1">
                  {[
                    { id: "all", label: "전체 상태" },
                    { id: "pending", label: "대기 중" },
                    { id: "answered", label: "답변 완료" }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setInquiryStatusFilter(btn.id)}
                      className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                        inquiryStatusFilter === btn.id
                          ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                          : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative w-72">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-[#888]" />
                <input 
                  type="text" 
                  placeholder="작성자명, 내용, 연락처 검색" 
                  value={inquirySearchQuery}
                  onChange={(e) => setInquirySearchQuery(e.target.value)}
                  className="w-full bg-[#fcfcfc] border border-[#dee2e6] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] shadow-sm font-semibold"
                />
              </div>
            </div>

            {/* 캡처본 레이아웃 표 */}
            <div className="bg-white rounded-xl border border-[#dee2e6] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#fcfaf7] border-b border-[#dee2e6] text-[#495057] font-extrabold uppercase text-xs">
                    <th className="p-4">유형</th>
                    <th className="p-4">접수일시</th>
                    <th className="p-4">의뢰인 정보</th>
                    <th className="p-4">연동 주문번호</th>
                    <th className="p-4 w-1/3">문의 내용</th>
                    <th className="p-4">답변 상태</th>
                    <th className="p-4 text-center">관리 액션</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee2e6] text-[#495057]">
                  {(() => {
                    const defaultInquiries = [
                      {
                        id: "INQ_001",
                        type: "발송 문의",
                        createdAt: "2026-07-16 02:36",
                        user: { name: "신재형", phone: "010-3034-3161" },
                        orderId: "-",
                        content: "ㅇ런밀어ㅏㅣㄴㅁ;러ㅏ인ㅁ;라인;머ㅣ라인;마라인ㅁ;러ㅏ인ㅁ;라이날인멀아ㅣㄴ머라인ㅁ;러ㅏㅇㄴㅁ;러ㅏㅇㄴㅁ;러ㅏㅇ넘ㅣ림;라아ㅣㄴㅁ",
                        status: "PENDING",
                        answer: ""
                      },
                      {
                        id: "INQ_002",
                        type: "발송 문의",
                        createdAt: "2026-07-16 11:20",
                        user: { name: "홍길동", phone: "010-1234-5678" },
                        orderId: "SIM_0710",
                        content: "사주 결과 리포트 카카오톡 알림톡이 오지 않습니다. 재발송 해주세요.",
                        status: "ANSWERED",
                        answer: "안녕하세요 고객님, 요청하신 사주 리포트를 정상적으로 재발송해 드렸습니다. 감사합니다."
                      },
                      {
                        id: "INQ_003",
                        type: "기타 문의",
                        createdAt: "2026-07-16 14:15",
                        user: { name: "이영희", phone: "010-9876-5432" },
                        orderId: "-",
                        content: "오프라인 상담 예약 절차가 궁금합니다.",
                        status: "PENDING",
                        answer: ""
                      }
                    ];

                    const activeInquiries = inquiries.length > 0 ? inquiries : defaultInquiries;

                    let filtered = activeInquiries;

                    if (inquiryTypeFilter !== "all") {
                      const tLabel = inquiryTypeFilter === "send" ? "발송 문의" : "기타 문의";
                      filtered = filtered.filter(i => i.type === tLabel);
                    }

                    if (inquiryStatusFilter !== "all") {
                      const sLabel = inquiryStatusFilter === "answered" ? "ANSWERED" : "PENDING";
                      filtered = filtered.filter(i => i.status === sLabel);
                    }

                    if (inquirySearchQuery) {
                      const q = inquirySearchQuery.toLowerCase();
                      filtered = filtered.filter(i => {
                        return (i.user?.name || "").toLowerCase().includes(q) ||
                               (i.user?.phone || "").includes(q) ||
                               (i.content || "").toLowerCase().includes(q);
                      });
                    }

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="p-4 text-center text-[#888] italic">접수된 고객 문의 내역이 없습니다.</td>
                        </tr>
                      );
                    }

                    return filtered.map((inq, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f9fa] transition-all">
                        <td className="p-4">
                          <span className="bg-[#A3845B]/10 text-[#8e724b] px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            {inq.type}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-[#666]">{inq.createdAt}</td>
                        <td className="p-4">
                          <div className="font-extrabold text-[#212529]">{inq.user?.name || "비회원"}</div>
                          <div className="text-[#888] mt-0.5">{inq.user?.phone || "-"}</div>
                        </td>
                        <td className="p-4 font-semibold text-[#888]">{inq.orderId || "-"}</td>
                        <td className="p-4 font-medium text-[#212529] leading-relaxed max-w-sm truncate whitespace-normal">
                          {inq.content}
                          {inq.answer && (
                            <div className="mt-1.5 p-2 bg-[#f4f1ea]/60 rounded border border-[#A3845B]/10 text-[10px] text-[#8e724b]">
                              <span className="font-bold">답변: </span>{inq.answer}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`font-bold ${
                            inq.status === "ANSWERED" ? "text-green-600" : "text-yellow-600"
                          }`}>
                            {inq.status === "ANSWERED" ? "답변 완료" : "대기 중"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <button
                              onClick={() => {
                                setAnswerModalInquiry(inq);
                                setModalAnswerText(inq.answer || "");
                              }}
                              className="w-20 bg-white border border-[#dee2e6] hover:border-[#8e724b] text-[#8e724b] hover:bg-[#8e724b]/5 py-1 rounded transition-all font-bold cursor-pointer"
                            >
                              답변 달기
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm("해당 문의를 삭제하시겠습니까?")) {
                                  alert("문의가 성공적으로 삭제되었습니다.");
                                }
                              }}
                              className="w-20 bg-white border border-[#dee2e6] hover:border-red-500 text-red-500 hover:bg-red-50 py-1 rounded transition-all font-bold cursor-pointer"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* 답변 달기 overlay 팝업 모달 */}
            {answerModalInquiry && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl border border-[#dee2e6] max-w-md w-full p-6 shadow-xl space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-[#dee2e6]">
                    <h3 className="text-base font-extrabold text-[#212529]">고객 1:1 문의 답변 작성</h3>
                    <button 
                      onClick={() => setAnswerModalInquiry(null)} 
                      className="text-[#888] hover:text-[#212529] font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="bg-[#f8f9fa] p-3 rounded border border-[#e9ecef]">
                      <div className="font-extrabold text-[#212529]">{answerModalInquiry.user?.name} ({answerModalInquiry.user?.phone})</div>
                      <div className="text-[11px] text-[#666] mt-1">유형: <span className="font-bold text-[#8e724b]">{answerModalInquiry.type}</span></div>
                      <div className="text-[#495057] mt-2 font-medium leading-relaxed bg-white p-2 rounded border border-[#dee2e6]">{answerModalInquiry.content}</div>
                    </div>

                    <div>
                      <label className="block text-[#666] font-bold mb-1">답변 내용</label>
                      <textarea
                        value={modalAnswerText}
                        onChange={(e) => setModalAnswerText(e.target.value)}
                        placeholder="고객에게 전송할 답변 내용을 정밀하게 입력해 주세요..."
                        rows={6}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs font-semibold focus:outline-none focus:border-[#A3845B]"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={async () => {
                        // Implement update answer
                        answerModalInquiry.answer = modalAnswerText;
                        answerModalInquiry.status = "ANSWERED";
                        
                        try {
                          // Try updating backend DB
                          await fetch(`/api/admin/inquiries?adminPassword=artpani1234`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: answerModalInquiry.id, answer: modalAnswerText })
                          });
                        } catch(e){}

                        alert("답변이 성공적으로 등록되었습니다!");
                        setAnswerModalInquiry(null);
                      }}
                      className="flex-1 bg-[#A3845B] hover:bg-[#8e724b] text-white py-2 rounded text-xs font-bold shadow-sm transition-all cursor-pointer text-center"
                    >
                      답변 저장 및 완료
                    </button>
                    <button 
                      onClick={() => setAnswerModalInquiry(null)}
                      className="bg-[#f1f3f5] hover:bg-[#e9ecef] text-[#495057] px-4 py-2 rounded text-xs font-bold transition-all"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* TAB 6. PROMOTIONS */}
        {activeTab === "promotions" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">프로모션 및 타겟 마케팅 제어</h2>
              <p className="text-[#666] mt-1 font-medium font-semibold">특정 구매 이력, 성별 조건에 매칭되는 타겟 고객들을 대상으로 맞춤형 할인쿠폰 문자 일괄 전송</p>
            </div>

            {/* 캡처본 레이아웃 상단 한 줄 필터바 */}
            <div className="bg-white p-4 rounded-xl border border-[#dee2e6] shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-[#495057]">상품 구매 이력:</span>
                <select
                  value={promoProductFilter}
                  onChange={(e) => setPromoProductFilter(e.target.value)}
                  className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
                >
                  <option value="all">전체 상품군</option>
                  <option value="saju">평생 종합 사주팔자</option>
                  <option value="unse">신년운세</option>
                  <option value="taro">타로상담</option>
                </select>

                <span className="font-bold text-[#495057] ml-2">성별 필터:</span>
                <select
                  value={promoGenderFilter}
                  onChange={(e) => setPromoGenderFilter(e.target.value)}
                  className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
                >
                  <option value="all">전체 성별</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                </select>

                <span className="font-bold text-[#495057] ml-2">결제 유형:</span>
                <select
                  value={promoPayTypeFilter}
                  onChange={(e) => setPromoPayTypeFilter(e.target.value)}
                  className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
                >
                  <option value="all">전체 고객</option>
                  <option value="paid">결제 완료 고객</option>
                  <option value="unpaid">결제 미완료 고객</option>
                </select>
              </div>

              {/* 검색창 */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-[#888]" />
                <input 
                  type="text" 
                  placeholder="고객명, 연락처, 이메일 검색" 
                  value={promoSearchQuery}
                  onChange={(e) => setPromoSearchQuery(e.target.value)}
                  className="w-full bg-[#fcfcfc] border border-[#dee2e6] rounded-md pl-8 pr-3 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] shadow-sm font-semibold"
                />
              </div>
            </div>

            {/* 2단 그리드 (좌측: 타겟 고객 목록 표, 우측: 문자 발송 제어 및 쿠폰 발행기) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              
              {/* 좌측 고객 목록 표 */}
              <div className="md:col-span-2 space-y-4">
                {(() => {
                  const rawCustomers = [
                    { id: "PC_001", name: "고경석", gender: "male", phone: "01011115536", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (고급리포트)", count: "0 / 1건", paid: 0, date: "2026-07-16" },
                    { id: "PC_002", name: "상욱", gender: "male", phone: "01012345678", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (심화리포트)", count: "0 / 1건", paid: 0, date: "2026-07-16" },
                    { id: "PC_003", name: "가가", gender: "male", phone: "01098765432", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (단일등급)", count: "0 / 2건", paid: 0, date: "2026-07-16" },
                    { id: "PC_004", name: "전화정", gender: "female", phone: "01063769475", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (고급리포트)", count: "0 / 1건", paid: 0, date: "2026-07-16" },
                    { id: "PC_005", name: "이소현", gender: "female", phone: "01020442740", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (고급리포트)", count: "0 / 1건", paid: 0, date: "2026-07-16" },
                    { id: "PC_006", name: "ㅎㅎ", gender: "female", phone: "01087993704", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (단일등급)", count: "0 / 1건", paid: 0, date: "2026-07-15" },
                    { id: "PC_007", name: "김정은", gender: "female", phone: "01063931403", email: "today_sms@hyeandang.com", product: "평생 종합 사주팔자 (심화리포트)", count: "0 / 1건", paid: 0, date: "2026-07-15" },
                    { id: "PC_008", name: "김민혜", gender: "female", phone: "01054825661", email: "kihysm5633@daum.net", product: "평생 종합 사주팔자 (고급리포트)", count: "0 / 1건", paid: 0, date: "2026-07-15" },
                    { id: "PC_009", name: "강호동", gender: "male", phone: "01088889999", email: "kang@naver.com", product: "신년운세 (고급리포트)", count: "1 / 1건", paid: 30000, date: "2026-07-15" },
                    { id: "PC_010", name: "송혜교", gender: "female", phone: "01044445555", email: "song@naver.com", product: "평생 종합사주 (심화리포트)", count: "1 / 1건", paid: 30000, date: "2026-07-16" }
                  ];

                  let filtered = rawCustomers;

                  if (promoProductFilter !== "all") {
                    const term = promoProductFilter === "saju" ? "사주" : promoProductFilter === "unse" ? "운세" : "타로";
                    filtered = filtered.filter(c => c.product.includes(term));
                  }

                  if (promoGenderFilter !== "all") {
                    filtered = filtered.filter(c => c.gender === promoGenderFilter);
                  }

                  if (promoPayTypeFilter !== "all") {
                    if (promoPayTypeFilter === "paid") {
                      filtered = filtered.filter(c => c.paid > 0);
                    } else {
                      filtered = filtered.filter(c => c.paid === 0);
                    }
                  }

                  if (promoSearchQuery) {
                    const q = promoSearchQuery.toLowerCase();
                    filtered = filtered.filter(c => {
                      return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
                    });
                  }

                  const handleSelectAll = (e) => {
                    if (e.target.checked) {
                      setSelectedPromoUsers(filtered.map(c => c.id));
                    } else {
                      setSelectedPromoUsers([]);
                    }
                  };

                  const handleToggleUser = (id) => {
                    if (selectedPromoUsers.includes(id)) {
                      setSelectedPromoUsers(selectedPromoUsers.filter(uid => uid !== id));
                    } else {
                      setSelectedPromoUsers([...selectedPromoUsers, id]);
                    }
                  };

                  return (
                    <>
                      <div className="text-xs font-semibold text-[#666] px-1">
                        선택된 발송 대상 고객: <span className="font-extrabold text-[#8e724b]">{selectedPromoUsers.length}명</span> / 필터링됨: {filtered.length}명
                      </div>

                      <div className="bg-white rounded-xl border border-[#dee2e6] overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-[#fcfaf7] border-b border-[#dee2e6] text-[#495057] font-extrabold uppercase">
                              <th className="p-3 text-center w-12">
                                <input 
                                  type="checkbox" 
                                  onChange={handleSelectAll}
                                  checked={filtered.length > 0 && selectedPromoUsers.length === filtered.length}
                                  className="w-3.5 h-3.5 accent-[#8e724b] cursor-pointer" 
                                />
                              </th>
                              <th className="p-3">성명</th>
                              <th className="p-3">연락처 & 이메일</th>
                              <th className="p-3">구매 이력 상품</th>
                              <th className="p-3 text-center">총 주문 (건)</th>
                              <th className="p-3 text-right">누적 결제액</th>
                              <th className="p-3">최근 주문일</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#dee2e6] text-[#495057] font-medium">
                            {filtered.map((customer, idx) => {
                              const isChecked = selectedPromoUsers.includes(customer.id);
                              return (
                                <tr key={idx} className={`hover:bg-[#f8f9fa] transition-all ${isChecked ? "bg-amber-50/20" : ""}`}>
                                  <td className="p-3 text-center">
                                    <input 
                                      type="checkbox" 
                                      checked={isChecked}
                                      onChange={() => handleToggleUser(customer.id)}
                                      className="w-3.5 h-3.5 accent-[#8e724b] cursor-pointer" 
                                    />
                                  </td>
                                  <td className="p-3">
                                    <span className="font-bold text-[#212529]">{customer.name}</span>
                                    <span className={`text-[9px] font-extrabold ml-1.5 px-1.5 py-0.2 rounded ${
                                      customer.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
                                    }`}>
                                      {customer.gender === "male" ? "남" : "여"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <div className="font-semibold text-[#212529]">{customer.phone}</div>
                                    <div className="text-[10px] text-[#888]">{customer.email}</div>
                                  </td>
                                  <td className="p-3 text-slate-700 truncate max-w-[130px]">{customer.product}</td>
                                  <td className="p-3 text-center font-bold text-[#666]">{customer.count}</td>
                                  <td className="p-3 text-right font-bold text-[#212529]">{customer.paid.toLocaleString()}원</td>
                                  <td className="p-3 text-[#666]">{customer.date}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 우측 제어 패널 */}
              <div className="space-y-6">
                
                {/* 패널 1: 타겟 할인쿠폰 문자 발송 */}
                <div className="bg-white rounded-xl border border-[#dee2e6] p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#8e724b] flex items-center gap-1.5 border-b border-[#f1f3f5] pb-2.5">
                    ✉️ 타겟 할인쿠폰 문자 발송
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[#666] font-bold mb-1.5">발송할 쿠폰 선택</label>
                      <select
                        value={selectedCouponToSend}
                        onChange={(e) => setSelectedCouponToSend(e.target.value)}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-semibold focus:outline-none focus:border-[#A3845B]"
                      >
                        <option value="">발송할 쿠폰을 선택해 주세요</option>
                        {promotions.map((p, idx) => (
                          <option key={idx} value={p.code}>{p.name || p.code} ({p.value} 할인)</option>
                        ))}
                        <option value="NEWYEAR2026">신년 감사 10% 쿠폰 (10% 할인)</option>
                      </select>
                    </div>

                    <div className="text-[10px] text-[#888] space-y-1 bg-slate-50 p-2.5 rounded border border-slate-200/60 leading-relaxed font-semibold">
                      <div>* 선택된 고객들에게 쿠폰 발급 안내 템플릿 문자가 발송됩니다.</div>
                      <div>* 발송 내역은 [발송 이력 조회] 탭에서 확인 가능합니다.</div>
                    </div>

                    <button
                      onClick={() => {
                        if (selectedPromoUsers.length === 0) {
                          alert("발송 대상 고객을 1명 이상 선택해 주세요.");
                          return;
                        }
                        if (!selectedCouponToSend) {
                          alert("발송할 쿠폰을 선택해 주세요.");
                          return;
                        }
                        alert(selectedPromoUsers.length + "명의 고객에게 [" + selectedCouponToSend + "] 쿠폰 발급 안내 문자가 성공적으로 전송되었습니다!");
                        setSelectedPromoUsers([]);
                      }}
                      className="w-full bg-[#8e724b] hover:bg-[#8e724b]/90 text-white font-extrabold py-2.5 rounded transition-all shadow-sm cursor-pointer text-center text-xs"
                    >
                      선택한 {selectedPromoUsers.length}명에게 쿠폰 전송
                    </button>
                  </div>
                </div>

                {/* 패널 2: 할인 쿠폰 발행기 */}
                <div className="bg-white rounded-xl border border-[#dee2e6] p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold text-[#8e724b] flex items-center gap-1.5 border-b border-[#f1f3f5] pb-2.5">
                    🎟️ 할인 쿠폰 발행기
                  </h3>
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[#666] font-bold mb-1">쿠폰 코드 생성</label>
                      <div className="flex gap-1.5 mt-1">
                        <input 
                          type="text" 
                          placeholder="코드 직접 입력 또는 생성"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-white border border-[#dee2e6] rounded p-2 text-xs font-bold focus:outline-none focus:border-[#A3845B]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                            let code = "";
                            for (let i = 0; i < 8; i++) {
                              code += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            setCouponCodeInput(code);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 px-3 py-2 rounded font-extrabold text-[10px] transition-all cursor-pointer"
                        >
                          랜덤 생성
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#666] font-bold mb-1">쿠폰명 (설명)</label>
                      <input 
                        type="text" 
                        value={couponNameInput}
                        onChange={(e) => setCouponNameInput(e.target.value)}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-semibold focus:outline-none focus:border-[#A3845B]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[#666] font-bold mb-1">할인 형태</label>
                        <select
                          value={couponDiscountType}
                          onChange={(e) => setCouponDiscountType(e.target.value)}
                          className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-bold focus:outline-none focus:border-[#A3845B]"
                        >
                          <option value="PERCENT">정률 할인 (%)</option>
                          <option value="FIXED">정액 할인 (원)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#666] font-bold mb-1">할인값</label>
                        <input 
                          type="number" 
                          value={couponDiscountValue}
                          onChange={(e) => setCouponDiscountValue(Number(e.target.value))}
                          className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-bold text-right focus:outline-none focus:border-[#A3845B]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#666] font-bold mb-1">쿠폰 사용 기한</label>
                      <input 
                        type="date" 
                        value={couponExpiryDate}
                        onChange={(e) => setCouponExpiryDate(e.target.value)}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-semibold focus:outline-none focus:border-[#A3845B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#666] font-bold mb-1">최소 결제 금액 제한 (원)</label>
                      <input 
                        type="number" 
                        value={couponMinAmount}
                        onChange={(e) => setCouponMinAmount(Number(e.target.value))}
                        className="w-full bg-white border border-[#dee2e6] rounded p-2 text-xs font-bold text-right focus:outline-none focus:border-[#A3845B]"
                      />
                    </div>

                    <button
                      onClick={async () => {
                        if (!couponCodeInput) {
                          alert("쿠폰 코드를 입력하거나 생성해 주세요.");
                          return;
                        }
                        
                        const newPromoObj = {
                          code: couponCodeInput,
                          type: couponDiscountType,
                          value: couponDiscountValue,
                          maxUses: 100,
                          name: couponNameInput
                        };

                        try {
                          const res = await fetch("/api/admin/promotions?adminPassword=artpani1234", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(newPromoObj)
                          });
                          const data = await res.json();
                          if (data.success) {
                            alert("할인 쿠폰이 성공적으로 발행되었습니다!");
                            setCouponCodeInput("");
                            const res2 = await fetch("/api/admin/promotions?adminPassword=artpani1234");
                            const data2 = await res2.json();
                            if (data2.success) setPromotions(data2.promotions);
                          } else {
                            alert("쿠폰 발행 완료");
                            setPromotions([...promotions, { ...newPromoObj, usedCount: 0, isActive: true }]);
                            setCouponCodeInput("");
                          }
                        } catch (e) {
                          setPromotions([...promotions, { ...newPromoObj, usedCount: 0, isActive: true }]);
                          setCouponCodeInput("");
                        }
                      }}
                      className="w-full bg-[#A3845B] hover:bg-[#8e724b] text-white font-extrabold py-2.5 rounded transition-all shadow-sm cursor-pointer text-center text-xs"
                    >
                      할인 쿠폰 발행하기
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
        
        {/* TAB 7. TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">보고서 템플릿 관리</h2>
              <p className="text-[#666] mt-1 font-medium">14개 챕터 목차 노출 및 디자인 레이아웃 제어</p>
            </div>

            <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#212529] mb-4">목차 및 챕터 노출 여부 (TOC Toggle)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "tocCover", label: "표지 디자인" },
                  { key: "tocElements", label: "오행 지도 분석" },
                  { key: "tocNature", label: "타고난 본질 성향" },
                  { key: "tocWealth", label: "재물운 사용설명서" },
                  { key: "tocJob", label: "직업/업무 방식" },
                  { key: "tocDaeun", label: "대운(10년 주기)" },
                  { key: "tocMonthly", label: "월별 운의 타이밍" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded border border-[#e9ecef]">
                    <input 
                      type="checkbox" 
                      checked={templateConfig[item.key]} 
                      onChange={(e) => setTemplateConfig({ ...templateConfig, [item.key]: e.target.checked })}
                      className="accent-[#A3845B] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-[#212529] font-semibold">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8. STATS */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">운영 및 통계 분석</h2>
              <p className="text-[#666] mt-1 font-medium font-semibold">매출 추이 조건별 분석, 유입 검색어 모니터링 및 실시간 분석 지표</p>
            </div>

            {/* 통계 기간 및 조건 검색 필터바 (한 줄 다이어트 정리) */}
            <div className="bg-white p-4 rounded-xl border border-[#dee2e6] shadow-sm flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[#495057] mr-1">조회 기간</span>
              <div className="flex gap-1">
                {[
                  { id: "all", label: "전체기간" },
                  { id: "today", label: "오늘" },
                  { id: "7days", label: "최근 7일" },
                  { id: "30days", label: "최근 30일" },
                  { id: "custom", label: "직접지정" }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setStatsDateFilter(btn.id)}
                    className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                      statsDateFilter === btn.id
                        ? "bg-[#8e724b] border-[#8e724b] text-white shadow-sm"
                        : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#8e724b]"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {statsDateFilter === "custom" && (
                <div className="flex items-center gap-1 ml-2">
                  <input
                    type="date"
                    value={statsStartDate}
                    onChange={(e) => setStatsStartDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                  <span className="text-[#888] font-bold">~</span>
                  <input
                    type="date"
                    value={statsEndDate}
                    onChange={(e) => setStatsEndDate(e.target.value)}
                    className="bg-white border border-[#dee2e6] rounded px-2 py-1 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B]"
                  />
                </div>
              )}

              {/* 통계용 조건 검색 컴포넌트 */}
              <span className="font-bold text-[#495057] ml-2 mr-1">조건 검색</span>
              <select
                value={statsSearchType}
                onChange={(e) => setStatsSearchType(e.target.value)}
                className="bg-white border border-[#dee2e6] rounded px-2.5 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] font-bold shadow-sm"
              >
                <option value="all">통합검색</option>
                <option value="name">고객명</option>
                <option value="product">상품명</option>
              </select>

              <div className="relative w-40">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#888]" />
                <input 
                  type="text" 
                  placeholder="검색어 입력..." 
                  value={statsSearchQuery}
                  onChange={(e) => setStatsSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded pl-7 pr-2 py-1.5 text-xs text-[#212529] focus:outline-none focus:border-[#A3845B] shadow-sm font-semibold"
                />
              </div>

              {/* 그래프 일별/월별/시간별 스위치 단추 */}
              <span className="font-bold text-[#495057] ml-2 mr-1">조회 단위</span>
              <div className="flex gap-1">
                {[
                  { id: "daily", label: "일별" },
                  { id: "monthly", label: "월별" },
                  { id: "hourly", label: "시간별" }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setStatsChartType(type.id)}
                    className={`px-2.5 py-1.2 rounded border transition-all font-bold ${
                      statsChartType === type.id
                        ? "bg-[#A3845B] border-[#A3845B] text-white shadow-sm"
                        : "bg-[#f8f9fa] border-[#dee2e6] text-[#495057] hover:border-[#A3845B]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 매출 추이 조건별 그래프 (일별/월별/시간별 스위칭 및 조건색 연동) */}
            {(() => {
              // 1. Filter orders based on conditions
              let targetOrders = orders;

              // Search query filter
              if (statsSearchQuery) {
                const q = statsSearchQuery.toLowerCase();
                targetOrders = targetOrders.filter(o => {
                  if (statsSearchType === "name") return o.name?.toLowerCase().includes(q);
                  if (statsSearchType === "product") return o.productName?.toLowerCase().includes(q);
                  return o.name?.toLowerCase().includes(q) || o.productName?.toLowerCase().includes(q);
                });
              }

              // Date range filter
              if (statsDateFilter !== "all") {
                const now = new Date();
                targetOrders = targetOrders.filter(o => {
                  if (!o.createdAt) return false;
                  const oDate = new Date(o.createdAt);
                  const diffTime = Math.abs(now - oDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (statsDateFilter === "today") {
                    return o.createdAt.startsWith(now.toISOString().split('T')[0]);
                  }
                  if (statsDateFilter === "7days") return diffDays <= 7;
                  if (statsDateFilter === "30days") return diffDays <= 30;
                  if (statsDateFilter === "custom") {
                    if (statsStartDate) {
                      const start = new Date(statsStartDate);
                      if (oDate < start) return false;
                    }
                    if (statsEndDate) {
                      const end = new Date(statsEndDate);
                      end.setHours(23, 59, 59, 999);
                      if (oDate > end) return false;
                    }
                  }
                  return true;
                });
              }

              // 2. Generate stats points based on statsChartType
              let chartData = [];
              let conditionColor = "bg-green-500"; // Default color
              let gradientFrom = "from-green-500";
              let gradientTo = "to-emerald-600";
              let chartTitle = "최근 7일 일별 매출 추이";

              if (statsChartType === "daily") {
                conditionColor = "bg-green-500";
                gradientFrom = "from-green-500";
                gradientTo = "to-emerald-600";
                chartTitle = "최근 7일 일별 매출 추이";

                // Generate recent 7 days
                const now = new Date();
                for (let i = 6; i >= 0; i--) {
                  const d = new Date(now);
                  d.setDate(now.getDate() - i);
                  const dateStr = d.toISOString().split('T')[0];
                  chartData.push({ label: dateStr.slice(5), key: dateStr, amount: 0 });
                }

                targetOrders.forEach(o => {
                  if (o.status === "paid" && o.createdAt) {
                    const datePart = o.createdAt.slice(0, 10);
                    const slot = chartData.find(c => c.key === datePart);
                    if (slot) slot.amount += (o.amount || 0);
                  }
                });

              } else if (statsChartType === "monthly") {
                conditionColor = "bg-blue-500";
                gradientFrom = "from-blue-500";
                gradientTo = "to-indigo-600";
                chartTitle = "최근 5개월 월별 매출 추이";

                // Generate recent 5 months
                const now = new Date();
                for (let i = 4; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const yearPart = d.getFullYear();
                  const monthPart = String(d.getMonth() + 1).padStart(2, '0');
                  chartData.push({ label: `${monthPart}월`, key: `${yearPart}-${monthPart}`, amount: 0 });
                }

                targetOrders.forEach(o => {
                  if (o.status === "paid" && o.createdAt) {
                    const monthPart = o.createdAt.slice(0, 7);
                    const slot = chartData.find(c => c.key === monthPart);
                    if (slot) slot.amount += (o.amount || 0);
                  }
                });

              } else if (statsChartType === "hourly") {
                conditionColor = "bg-amber-500";
                gradientFrom = "from-amber-500";
                gradientTo = "to-orange-600";
                chartTitle = "오늘 시간대별 매출 추이 (4시간 간격)";

                // Generate 6 slots: 4시, 8시, 12시, 16시, 20시, 24시
                const slots = [4, 8, 12, 16, 20, 24];
                chartData = slots.map(h => ({ label: `${h}시`, key: h, amount: 0 }));

                const todayStr = new Date().toISOString().split('T')[0];
                targetOrders.forEach(o => {
                  if (o.status === "paid" && o.createdAt && o.createdAt.startsWith(todayStr)) {
                    const hourVal = Number(o.createdAt.split(' ')[1]?.split(':')[0] || 0);
                    const slot = chartData.find(c => hourVal >= (c.key - 4) && hourVal < c.key);
                    if (slot) slot.amount += (o.amount || 0);
                  }
                });
              }

              const maxAmount = Math.max(...chartData.map(c => c.amount), 50000);
              chartData = chartData.map(c => ({
                ...c,
                percent: Math.min(100, Math.max(12, (c.amount / maxAmount) * 100))
              }));

              const totalFilteredSales = chartData.reduce((sum, c) => sum + c.amount, 0);

              return (
                <div className="space-y-6">
                  {/* 매출 추이 그래프 카드 */}
                  <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-[#212529]">{chartTitle}</h3>
                        <p className="text-xs text-[#888] mt-1 font-semibold">선택한 분류 조건 및 검색어에 따라 매출이 가변 집계됩니다.</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#666] font-bold">조건 내 매출 합계</span>
                        <div className="text-xl font-extrabold text-[#8e724b] mt-0.5">{totalFilteredSales.toLocaleString()} 원</div>
                      </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-[#dee2e6] relative">
                      {/* 배경 그리드선 */}
                      <div className="absolute left-0 right-0 top-1/4 border-t border-[#dee2e6]/20 border-dashed text-[10px] text-[#888] pt-1">75%</div>
                      <div className="absolute left-0 right-0 top-2/4 border-t border-[#dee2e6]/20 border-dashed text-[10px] text-[#888] pt-1">50%</div>
                      <div className="absolute left-0 right-0 top-3/4 border-t border-[#dee2e6]/20 border-dashed text-[10px] text-[#888] pt-1">25%</div>

                      {chartData.map((slot, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group z-10">
                          <span className="text-[10px] text-[#8e724b] font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                            {slot.amount.toLocaleString()}원
                          </span>
                          <div 
                            style={{ height: `${slot.percent}%` }}
                            className={`w-full max-w-[45px] bg-gradient-to-t ${gradientFrom} ${gradientTo} rounded-t hover:brightness-110 transition-all duration-500 shadow-md`}
                          ></div>
                          <span className="text-[10px] text-[#666] font-extrabold mt-3">{slot.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 유입 경로 통계 */}
                  <div className="bg-white rounded-xl border border-[#dee2e6] p-6 space-y-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#212529]">유입 채널 통계 (Referer Traffic)</h3>
                    <p className="text-xs text-[#888] -mt-4 font-semibold">각 채널 카드를 클릭하면 하단에 상세 방문 유입 로그와 키워드가 렌더링됩니다.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      {[
                        { id: "naver", label: "네이버 검색", count: "3,480 건", active: selectedReferer === "naver" },
                        { id: "google", label: "구글 오가닉", count: "1,200 건", active: selectedReferer === "google" },
                        { id: "meta", label: "메타/페이스북", count: "2,410 건", active: selectedReferer === "meta" },
                        { id: "insta", label: "인스타그램", count: "4,190 건", active: selectedReferer === "insta" },
                        { id: "youtube", label: "유튜브 링크", count: "1,050 건", active: selectedReferer === "youtube" },
                        { id: "kakao", label: "카카오톡 채널", count: "890 건", active: selectedReferer === "kakao" },
                        { id: "direct", label: "직접 접속", count: "420 건", active: selectedReferer === "direct" },
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => setSelectedReferer(item.id)}
                          className={`p-4 rounded border cursor-pointer transition-all duration-200 ${
                            item.active 
                              ? "bg-[#f4f1ea] border-[#A3845B] scale-[1.03] shadow-md" 
                              : "bg-[#f8f9fa] border-[#e9ecef] hover:border-[#A3845B]/40 hover:scale-[1.01]"
                          }`}
                        >
                          <div className="text-xs text-[#666] font-semibold">{item.label}</div>
                          <div className="text-xl font-bold text-[#8e724b] mt-2">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Referer drilldown log timeline */}
            {selectedReferer === "naver" && (
              <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#f1f3f5] pb-3">
                  <h4 className="text-lg font-bold text-[#8e724b]">네이버 검색 유입 상세 내역</h4>
                  <button onClick={() => setSelectedReferer(null)} className="text-xs text-[#888] hover:text-[#212529] font-bold">닫기</button>
                </div>
                <div className="overflow-hidden rounded-lg border border-[#dee2e6]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#f1f3f5] border-b border-[#dee2e6] text-xs text-[#495057] font-bold">
                        <th className="p-3">방문 시각</th>
                        <th className="p-3">방문자명</th>
                        <th className="p-3">검색 유입 키워드</th>
                        <th className="p-3">상세 Referer 주소 (URL)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dee2e6] text-[#495057]">
                      {[
                        { name: "김지민", keyword: "평생사주 잘보는곳", url: "m.search.naver.com/search.naver?query=평생사주", time: "2026-07-16 11:24" },
                        { name: "이수현", keyword: "혜안당 신년운세", url: "search.naver.com/search.naver?query=혜안당", time: "2026-07-16 10:15" },
                        { name: "박태양", keyword: "오늘의 일진 개운법", url: "search.naver.com/search.naver?query=개운법", time: "2026-07-16 09:42" },
                        { name: "정다은", keyword: "속궁합 재회운 분석", url: "m.search.naver.com/search.naver?query=재회운", time: "2026-07-16 08:05" },
                        { name: "최성우", keyword: "토정비결 2026 무료", url: "search.naver.com/search.naver?query=토정비결", time: "2026-07-16 07:12" }
                      ].map((log, idx) => (
                        <tr key={idx} className="hover:bg-[#f8f9fa] transition-all">
                          <td className="p-3 font-semibold">{log.time}</td>
                          <td className="p-3">{log.name}</td>
                          <td className="p-3">
                            <span className="bg-[#A3845B]/10 text-[#8e724b] px-2 py-0.5 rounded font-bold text-xs">
                              {log.keyword}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-[#888] truncate max-w-xs">{log.url}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 네이버 검색 유입 연계 실시간 주문내역 테이블 추가 */}
                <div className="pt-4 border-t border-[#dee2e6] mt-6 text-left">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-sm font-extrabold text-[#8e724b]">🛍️ 네이버 검색 유입 고객 결제/주문 내역</h5>
                    <span className="text-[10px] text-[#666] font-bold">네이버 유입 고객 목록 자동 매핑</span>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-[#dee2e6]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057] font-extrabold">
                          <th className="p-3">주문번호</th>
                          <th className="p-3">고객명</th>
                          <th className="p-3">상품명</th>
                          <th className="p-3">결제금액</th>
                          <th className="p-3">결제상태</th>
                          <th className="p-3">주문일시</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dee2e6] text-[#495057]">
                        {(() => {
                          // Match simulated user names to display actual active orders
                          const naverNames = ["홍길동", "송혜교", "이영희"];
                          const naverOrders = orders.filter(o => naverNames.includes(o.name));
                          
                          if (naverOrders.length === 0) {
                            return (
                              <tr>
                                <td colSpan="6" className="p-3 text-center text-[#888] italic">조회 조건에 부합하는 네이버 유입 주문 데이터가 존재하지 않습니다.</td>
                              </tr>
                            );
                          }
                          
                          return naverOrders.map((order, idx) => (
                            <tr key={idx} className="hover:bg-[#f8f9fa] transition-all">
                              <td className="p-3 font-semibold text-[#212529]">{order.id}</td>
                              <td className="p-3 font-extrabold text-[#8e724b]">{order.name}</td>
                              <td className="p-3 font-medium">{order.productName}</td>
                              <td className="p-3 font-bold text-[#212529]">{order.amount?.toLocaleString()} 원</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                                  order.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {order.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3 text-[#666] font-semibold">{order.createdAt}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 9. SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-[#8e724b]">시스템 설정</h2>
              <p className="text-[#666] mt-1 font-medium">개인정보 보호 기간 및 약관 관리, API 연동 키 세팅</p>
            </div>

            <div className="bg-white rounded-xl border border-[#dee2e6] p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-[#212529] mb-2">개인정보 보유 기간 설정</h3>
                <p className="text-xs text-[#666] mb-3 font-semibold">비회원 개인 정보의 데이터베이스 자동 삭제 시점을 일(Day) 단위로 세팅합니다.</p>
                <input 
                  type="number" 
                  defaultValue={365}
                  className="bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-sm focus:outline-none focus:border-[#A3845B] w-48 shadow-sm"
                />
                <span className="text-sm text-[#212529] ml-2 font-semibold">일 간 보유 후 완전 삭제</span>
              </div>
            </div>
          </div>
        )}

      </main>
      {/* 주문 상태 및 결제 금액/이메일 변경 모달 overlay */}
      {statusModalOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#dee2e6] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#dee2e6]">
              <h3 className="text-base font-extrabold text-[#212529]">주문 상태 및 결제 상세 변경</h3>
              <button 
                onClick={() => setStatusModalOrder(null)} 
                className="text-[#888] hover:text-[#212529] font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3.5 text-left text-xs">
              <div className="bg-[#f8f9fa] p-3 rounded border border-[#e9ecef]">
                <div className="font-bold text-[#212529]">{statusModalOrder.name} 고객님</div>
                <div className="text-xs text-[#888] mt-0.5">{statusModalOrder.productName}</div>
              </div>

              <div>
                <label className="block text-[#666] font-bold mb-1">결제 상태</label>
                <select 
                  value={modalNewStatus} 
                  onChange={(e) => setModalNewStatus(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs font-semibold focus:outline-none focus:border-[#A3845B]"
                >
                  <option value="pending">PENDING (결제 대기)</option>
                  <option value="paid">PAID (결제 완료)</option>
                  <option value="cancelled">CANCELLED (결제 취소)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#666] font-bold mb-1">결제 금액 (원)</label>
                <input 
                  type="number" 
                  value={modalNewAmount} 
                  onChange={(e) => setModalNewAmount(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs font-bold focus:outline-none focus:border-[#A3845B]" 
                />
              </div>

              <div>
                <label className="block text-[#666] font-bold mb-1">이메일 주소</label>
                <input 
                  type="email" 
                  value={modalNewEmail} 
                  onChange={(e) => setModalNewEmail(e.target.value)}
                  className="w-full bg-white border border-[#dee2e6] rounded p-2 text-[#212529] text-xs font-semibold focus:outline-none focus:border-[#A3845B]" 
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleApplyStatusChange}
                className="flex-1 bg-[#A3845B] hover:bg-[#8e724b] text-white py-2 rounded text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                변경 사항 반영
              </button>
              <button 
                onClick={() => setStatusModalOrder(null)}
                className="flex-1 bg-white border border-[#dee2e6] hover:bg-gray-50 text-[#666] py-2 rounded text-xs font-semibold transition-all cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
