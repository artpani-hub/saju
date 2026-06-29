"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Sparkles, AlertCircle, HelpCircle, Phone, Lock, MessageSquare, User, FileText, ClipboardList } from "lucide-react";

function InquiryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Tab State: 'write' or 'check'
  const [activeTab, setActiveTab] = useState("write");

  // Write Form State
  const [writeForm, setWriteForm] = useState({
    type: "delivery", // delivery (메일, 문자 발송 문의), general (기타문의)
    name: "",
    phone: "",
    orderId: "", // selected order ID from dropdown
    content: "",
    password: "", // 4-digit code
    agree: false
  });

  // Check Form State
  const [checkForm, setCheckForm] = useState({
    phone: "",
    password: ""
  });

  // Data States
  const [matchedOrders, setMatchedOrders] = useState([]); // orders matched by phone during writing
  const [myInquiries, setMyInquiries] = useState([]); // inquiries matched during checking
  const [hasChecked, setHasChecked] = useState(false); // whether checked inquiries at least once
  const [formError, setFormError] = useState("");
  const [checkError, setCheckError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Auto-load phone number if provided in URL params
  useEffect(() => {
    const urlPhone = searchParams.get("phone");
    const urlName = searchParams.get("name");
    const urlOrder = searchParams.get("orderId");
    
    if (urlPhone) {
      setWriteForm(prev => ({ ...prev, phone: urlPhone }));
      lookupOrdersByPhone(urlPhone);
    }
    if (urlName) {
      setWriteForm(prev => ({ ...prev, name: urlName }));
    }
    if (urlOrder) {
      setWriteForm(prev => ({ ...prev, orderId: urlOrder }));
    }
  }, [searchParams]);

  // Look up orders matching phone number in localStorage
  const lookupOrdersByPhone = (phoneNum) => {
    if (typeof window === "undefined") return;
    const cleanPhone = phoneNum.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) {
      setMatchedOrders([]);
      return;
    }

    try {
      const existingStr = localStorage.getItem("hyeandang_orders");
      if (existingStr) {
        const orders = JSON.parse(existingStr);
        if (Array.isArray(orders)) {
          const matched = orders.filter(o => {
            if (!o || !o.phone) return false;
            const oPhone = o.phone.replace(/[^0-9]/g, "");
            return oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone);
          });
          setMatchedOrders(matched);
          
          // Auto select first matched order if not already set
          if (matched.length > 0 && !writeForm.orderId) {
            setWriteForm(prev => ({ ...prev, orderId: String(matched[0].id) }));
          }
        }
      }
    } catch (e) {
      console.error("Order lookup error:", e);
    }
  };

  // Handle Input Changes for Write Form
  const handleWriteChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone") {
      // Auto hyphen formatting
      const digits = value.replace(/[^0-9]/g, "");
      let formatted = digits;
      if (digits.length > 3 && digits.length <= 7) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else if (digits.length > 7) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
      setWriteForm(prev => ({ ...prev, phone: formatted }));
      lookupOrdersByPhone(formatted);
    } else if (name === "password") {
      const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
      setWriteForm(prev => ({ ...prev, password: digits }));
    } else {
      setWriteForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Input Changes for Check Form
  const handleCheckChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/[^0-9]/g, "");
      let formatted = digits;
      if (digits.length > 3 && digits.length <= 7) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else if (digits.length > 7) {
        formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
      }
      setCheckForm(prev => ({ ...prev, phone: formatted }));
    } else if (name === "password") {
      const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
      setCheckForm(prev => ({ ...prev, password: digits }));
    }
  };

  // Submit Inquiry
  const handleWriteSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!writeForm.name.trim()) {
      setFormError("이름을 입력해 주세요.");
      return;
    }
    if (!writeForm.phone.trim()) {
      setFormError("전화번호를 입력해 주세요.");
      return;
    }
    if (!writeForm.content.trim()) {
      setFormError("문의 내용을 기재해 주세요.");
      return;
    }
    if (writeForm.password.length !== 4) {
      setFormError("비밀번호 4자리를 정확히 입력해 주세요.");
      return;
    }
    if (!writeForm.agree) {
      setFormError("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    try {
      const existingStr = localStorage.getItem("hyeandang_inquiries");
      let inquiries = [];
      if (existingStr) {
        inquiries = JSON.parse(existingStr);
        if (!Array.isArray(inquiries)) inquiries = [];
      }

      const newInquiry = {
        id: `inq_${new Date().getTime()}`,
        type: writeForm.type,
        name: writeForm.name.trim(),
        phone: writeForm.phone.trim(),
        orderId: writeForm.type === "delivery" && writeForm.orderId ? parseInt(writeForm.orderId) : null,
        content: writeForm.content.trim(),
        password: writeForm.password,
        status: "pending", // pending, answered
        reply: "",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      inquiries.unshift(newInquiry);
      localStorage.setItem("hyeandang_inquiries", JSON.stringify(inquiries));

      setSuccessMessage("고객 문의가 정상적으로 접수되었습니다. [내 문의 내역 확인] 탭에서 답변 상태를 확인해 보세요!");
      
      // Reset form (except phone/name for convenience)
      setWriteForm(prev => ({
        ...prev,
        content: "",
        password: "",
        agree: false
      }));
      setMatchedOrders([]);
    } catch (e) {
      setFormError("접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  // Check Inquiries
  const handleCheckInquiries = (e) => {
    e.preventDefault();
    setCheckError("");
    setMyInquiries([]);
    setHasChecked(true);

    if (!checkForm.phone.trim()) {
      setCheckError("전화번호를 입력해 주세요.");
      return;
    }
    if (checkForm.password.length !== 4) {
      setCheckError("비밀번호 4자리를 입력해 주세요.");
      return;
    }

    try {
      const existingStr = localStorage.getItem("hyeandang_inquiries");
      if (existingStr) {
        const inquiries = JSON.parse(existingStr);
        if (Array.isArray(inquiries)) {
          const cleanInputPhone = checkForm.phone.replace(/[^0-9]/g, "");
          const filtered = inquiries.filter(inq => {
            if (!inq) return false;
            const inqPhone = inq.phone.replace(/[^0-9]/g, "");
            return inqPhone === cleanInputPhone && inq.password === checkForm.password;
          });
          setMyInquiries(filtered);
          if (filtered.length === 0) {
            setCheckError("일치하는 문의 내역이 없습니다. 전화번호 또는 비밀번호를 다시 확인해 주세요.");
          }
        } else {
          setCheckError("등록된 문의 내역이 존재하지 않습니다.");
        }
      } else {
        setCheckError("등록된 문의 내역이 존재하지 않습니다.");
      }
    } catch (e) {
      setCheckError("조회 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 md:py-16">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 border border-brass/30 bg-brass/5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-brass uppercase mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          고객 센터
        </div>
        <h1 className="font-myeongjo text-3xl font-bold text-foreground mb-2">고객 문의 및 지원</h1>
        <p className="text-xs text-foreground-muted max-w-md mx-auto leading-relaxed font-light">
          이메일/문자 발송 실패에 대한 재발송 요청 및 시스템 이용 중의 각종 기타 문의 사항을 남겨주시면 정성껏 해결해 드립니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-custom mb-8 max-w-sm mx-auto">
        <button
          onClick={() => {
            setActiveTab("write");
            setFormError("");
            setSuccessMessage("");
          }}
          className={`flex-1 text-center py-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "write"
              ? "border-brass text-brass font-bold"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          <ClipboardList className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          문의 접수하기
        </button>
        <button
          onClick={() => {
            setActiveTab("check");
            setCheckError("");
            setHasChecked(false);
          }}
          className={`flex-1 text-center py-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
            activeTab === "check"
              ? "border-brass text-brass font-bold"
              : "border-transparent text-foreground-muted hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          내 문의 확인
        </button>
      </div>

      {/* Tab Contents: Write Inquiry */}
      {activeTab === "write" ? (
        <div className="border border-border-custom bg-background rounded-xl p-6 md:p-8 shadow-sm">
          <h2 className="font-myeongjo text-lg font-bold text-foreground mb-6 pb-2 border-b border-border-custom/50 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-brass" />
            1:1 고객 문의 작성
          </h2>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-lg mb-6 text-center font-medium">
              ⚠️ {formError}
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg mb-6 text-center font-semibold">
              ✓ {successMessage}
            </div>
          )}

          <form onSubmit={handleWriteSubmit} className="space-y-5">
            {/* 1. Inquiry Type */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">문의 유형</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWriteForm(prev => ({ ...prev, type: "delivery" }))}
                  className={`py-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    writeForm.type === "delivery"
                      ? "border-brass bg-brass/5 text-brass"
                      : "border-border-custom/60 bg-transparent text-foreground-muted hover:border-brass/35"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  메일, 문자 발송 문의
                </button>
                <button
                  type="button"
                  onClick={() => setWriteForm(prev => ({ ...prev, type: "general" }))}
                  className={`py-3 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    writeForm.type === "general"
                      ? "border-brass bg-brass/5 text-brass"
                      : "border-border-custom/60 bg-transparent text-foreground-muted hover:border-brass/35"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  기타문의
                </button>
              </div>
            </div>

            {/* 2. Personal Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brass" /> 성함
                </label>
                <input
                  type="text"
                  name="name"
                  value={writeForm.name}
                  onChange={handleWriteChange}
                  placeholder="의뢰인 성함을 기재해 주세요"
                  className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brass" /> 연락처
                </label>
                <input
                  type="text"
                  name="phone"
                  value={writeForm.phone}
                  onChange={handleWriteChange}
                  placeholder="예: 010-1234-5678"
                  className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                />
              </div>
            </div>

            {/* 3. Automatic Order Matching Dropdown (Only for delivery inquiries) */}
            {writeForm.type === "delivery" && (
              <div className="bg-[#FAF8F5] border border-border-custom p-4 rounded-lg space-y-2 animate-fadeIn">
                <label className="block text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brass" />
                  문의 대상 주문 선택 (자동 조회)
                </label>
                {writeForm.phone.replace(/[^0-9]/g, "").length < 9 ? (
                  <p className="text-[10px] text-gray-400 font-light">* 전화번호를 기재하시면 연동 주문이 여기에 자동 노출됩니다.</p>
                ) : matchedOrders.length > 0 ? (
                  <select
                    name="orderId"
                    value={writeForm.orderId}
                    onChange={handleWriteChange}
                    className="w-full border border-border-custom bg-white px-3 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass transition-colors font-medium text-gray-800"
                  >
                    {matchedOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        [{o.createdAt}] {o.productName} ({o.amount.toLocaleString()}원) - {o.status === "paid" ? "결제 완료" : "미결제"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-[10px] text-red-500 font-light">⚠️ 해당 연락처로 접수된 최근 주문건이 존재하지 않습니다. 번호를 다시 확인해 주세요.</p>
                )}
              </div>
            )}

            {/* 4. Inquiry Content */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">문의 내용</label>
              <textarea
                name="content"
                value={writeForm.content}
                onChange={handleWriteChange}
                rows={6}
                placeholder={
                  writeForm.type === "delivery"
                    ? "예시: 오늘 아침 결제를 정상 완료했으나 이메일 주소를 오타로 잘못 입력하여(예: test@naver.con) 보고서가 전달되지 않았습니다. 올바른 이메일(test@naver.com)로 재발송을 부탁드립니다."
                    : "이용 중 궁금하신 점이나 의견을 기재해 주시면 신속하게 답변해 드리겠습니다."
                }
                className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors leading-relaxed resize-none"
              />
            </div>

            {/* 5. 4-digit Password & Agreement Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-brass" /> 조회용 비밀번호 (숫자 4자리)
                </label>
                <input
                  type="password"
                  name="password"
                  value={writeForm.password}
                  onChange={handleWriteChange}
                  maxLength={4}
                  placeholder="****"
                  className="w-24 text-center border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background tracking-[0.25em] transition-colors"
                />
                <span className="text-[10px] text-foreground-muted ml-2 font-light">* 향후 문의 답변 확인 시 사용되니 기억해 주세요.</span>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={writeForm.agree}
                    onChange={(e) => setWriteForm(prev => ({ ...prev, agree: e.target.checked }))}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    writeForm.agree 
                      ? "bg-brass border-brass text-background" 
                      : "border-border-custom bg-background hover:border-brass"
                  }`}>
                    {writeForm.agree && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] text-foreground font-medium">개인정보 수집 및 동의에 동의합니다. <span className="text-red-500">(필수)</span></span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#8B221E] hover:bg-[#6D1B18] text-white rounded-lg font-myeongjo text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer mt-4"
            >
              1:1 문의 사항 접수하기
            </button>
          </form>
        </div>
      ) : (
        /* Tab Contents: Check Inquiries */
        <div className="space-y-6">
          <div className="border border-border-custom bg-background rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="font-myeongjo text-lg font-bold text-foreground mb-6 pb-2 border-b border-border-custom/50 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brass" />
              본인 작성 문의 목록 조회
            </h2>

            {checkError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-lg mb-6 text-center font-medium">
                ⚠️ {checkError}
              </div>
            )}

            <form onSubmit={handleCheckInquiries} className="grid sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">등록한 연락처</label>
                <input
                  type="text"
                  name="phone"
                  value={checkForm.phone}
                  onChange={handleCheckChange}
                  placeholder="010-1234-5678"
                  className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">조회 비밀번호 (4자리)</label>
                <input
                  type="password"
                  name="password"
                  value={checkForm.password}
                  onChange={handleCheckChange}
                  maxLength={4}
                  placeholder="****"
                  className="w-full border border-border-custom bg-background-secondary/30 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-brass focus:bg-background tracking-[0.25em] text-center transition-colors"
                />
              </div>
              <button
                type="submit"
                className="py-3 bg-brass text-background rounded-lg text-xs font-bold hover:bg-brass-dark shadow transition-colors cursor-pointer"
              >
                문의 내역 조회 ➔
              </button>
            </form>
          </div>

          {/* Results List */}
          {hasChecked && myInquiries.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-myeongjo text-sm font-bold text-gray-800 px-1">
                작성한 문의 내역 ({myInquiries.length}건)
              </h3>
              
              {myInquiries.map((inq) => (
                <div key={inq.id} className="border border-border-custom bg-white rounded-xl p-5 md:p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] text-brass bg-brass/5 px-2.5 py-0.5 rounded-full font-semibold border border-brass/10">
                        {inq.type === "delivery" ? "메일/문자 발송 문의" : "기타 문의"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-light ml-3">{inq.createdAt}</span>
                    </div>
                    <div>
                      {inq.status === "pending" ? (
                        <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded font-semibold">답변 대기 중</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-semibold">답변 완료</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-700 leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100 font-light whitespace-pre-wrap">
                    <strong className="block text-gray-800 mb-1.5">[문의 내용]</strong>
                    {inq.content}
                  </div>

                  {inq.status === "answered" && inq.reply && (
                    <div className="text-xs text-gray-800 leading-relaxed bg-[#FAF6EE] p-4 rounded-lg border border-[#A3845B]/20 relative">
                      <div className="absolute top-2.5 right-3 text-[#A3845B] text-[8px] font-bold">慧眼堂 寶印</div>
                      <strong className="block text-[#A3845B] mb-1.5">✍️ [혜안당 답변] ({inq.repliedAt || "답변완료"})</strong>
                      <p className="font-light whitespace-pre-wrap">{inq.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-brass transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default function InquiryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hyeandang-traditional-bg flex items-center justify-center">
        <div className="font-myeongjo text-lg text-[#A3845B] animate-pulse">혜안당 고객센터 불러오는 중...</div>
      </div>
    }>
      <InquiryContent />
    </Suspense>
  );
}
