// DUJJONKO · AI 스낵 큐레이션 - 단일 App 파일
// 모든 UI 컴포넌트
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  runCuration,
  fetchAllProducts,
  type PickItem,
  type Product,
  type CurationResponse,
} from "./curationApi";

// ---------- 유틸 ----------
const formatKRW = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const COMPANIES = ["우리자산운용(37층)", "우리자산운용(44층)", "KB자산운용(18층)", "KB자산운용(32층)", "KB자산운용(40층)", "KB자산운용(41층)", "코인원", "파크원"];

// =====================================================================
// Header
// =====================================================================
function Header() {
  return (
    <header className="bg-black text-white">
      <div className="mx-auto flex max-w-375 items-center justify-between px-6 py-3">
        <h1 className="text-base font-bold tracking-wider">DUJJONKO</h1>
        <div className="flex items-center gap-4 text-xs">
          <span>박서현 님 환영합니다.</span>
          <button
            type="button"
            aria-label="로그아웃"
            className="rounded bg-white/10 p-2 transition hover:bg-white/20"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

// =====================================================================
// DateRangePicker
// =====================================================================
function fmt(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function buildCells(month: Date): (string | null)[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const cells: (string | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    cells.push(fmt(new Date(month.getFullYear(), month.getMonth(), d)));
  }
  return cells;
}

function MonthGrid({
  month,
  start,
  end,
  onPick,
}: {
  month: Date;
  start: string;
  end: string;
  onPick: (d: string) => void;
}) {
  const cells = useMemo(() => buildCells(month), [month]);
  return (
    <div>
      <p className="mb-2 text-center text-xs font-medium text-gray-700">
        {month.getFullYear()}년 {month.getMonth() + 1}월
      </p>
      <div className="grid grid-cols-7 text-center text-[11px] text-gray-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-xs">
        {cells.map((c, i) => {
          if (!c) return <span key={i} className="py-1.5" />;
          const inRange = start && end && c >= start && c <= end;
          const isEdge = c === start || c === end;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(c)}
              className={`mx-auto my-0.5 flex h-7 w-7 items-center justify-center rounded-full transition ${
                isEdge
                  ? "bg-black text-white"
                  : inRange
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {parseInt(c.slice(-2), 10)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (s: string, e: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => new Date((startDate || fmt(new Date())) + "T00:00:00"));
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const handlePick = (d: string) => {
    if (!startDate || (startDate && endDate)) onChange(d, "");
    else if (d < startDate) onChange(d, startDate);
    else onChange(startDate, d);
  };

  const reset = () => onChange("", "");
  const setQuick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    onChange(fmt(start), fmt(end));
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm hover:border-gray-300"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="flex-1 text-left">
          {startDate || "시작일"} ~ {endDate || "종료일"}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-[640px] max-w-[92vw] rounded-xl border border-gray-100 bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">기간 선택</span>
            <div className="flex items-center gap-2 text-gray-500">
              <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, -1))} className="rounded p-1 hover:bg-gray-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="rounded p-1 hover:bg-gray-100">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button type="button" onClick={reset} className="ml-2 flex items-center gap-1 text-xs hover:text-black">
                <RotateCcw className="h-3 w-3" />
                초기화
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <MonthGrid month={viewMonth} start={startDate} end={endDate} onPick={handlePick} />
            <MonthGrid month={addMonths(viewMonth, 1)} start={startDate} end={endDate} onPick={handlePick} />
          </div>

          <div className="mt-4 flex gap-2">
            {[
              { label: "이번 달", days: new Date().getDate() },
              { label: "최근 7일", days: 7 },
              { label: "최근 30일", days: 30 },
            ].map((q) => (
              <button key={q.label} type="button" onClick={() => setQuick(q.days)} className="rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50">
                {q.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">시작일을 선택한 뒤 종료일을 선택하세요.</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// InputSection
// =====================================================================
function InputSection({
  onRun,
  loading,
}: {
  onRun: (data: { requirement: string; startDate: string; endDate: string; company: string }) => void;
  loading?: boolean;
}) {
  const [requirement, setRequirement] = useState("");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-04-01");
  const [company, setCompany] = useState("");

  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold">AI 큐레이션 입력</h2>
      <p className="text-sm text-gray-500">
        판매 데이터를 기반으로 우선 후보를 선정한 뒤, 외부 가격 정보(쿠팡 / 네이버스토어 / 마켓컬리 / 11번가 / G마켓 등)를 참고해
        ChatGPT와 Gemini가 비교·검토한 최종 스낵 및 음료 리스트를 추천합니다.
      </p>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold">큐레이션 조건</h3>
        <p className="mt-1 text-xs text-gray-500">
          예산, 상품 구성 비율 같은 자연어 조건을 입력하면 판매 데이터와 외부 시세를 함께 반영해 더욱 현실적인 큐레이션 결과를 제공합니다.
        </p>

        <div className="mt-5 grid gap-5 md:grid-cols-[1fr_320px]">
          <div>
            <label className="text-xs font-medium text-gray-700">자연어 요구사항</label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              rows={5}
              placeholder="예 : 야근이 많은 개발팀을 위해 당 충전용 간식 위주로 예산 40만 원 맞춰줘."
              className="mt-2 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm text-[#000000] placeholder:text-[#949494] focus:border-black focus:outline-none"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              모델 : ChatGPT 'gpt-5.2' / Gemini 'gemini-2.5-pro' / 외부 참조: 쿠팡, 네이버스토어, 마켓컬리, 11번가, G마켓
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700">고객사</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 p-3 text-sm text-gray-700 focus:border-black focus:outline-none"
              >
                <option value="">고객사를 선택하세요</option>
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">기간</label>
              <div className="mt-2">
                <DateRangePicker startDate={startDate} endDate={endDate} onChange={(s, e) => { setStartDate(s); setEndDate(e); }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!requirement.trim()) {
                alert("자연어 요구사항을 입력해주세요.");
                return;
              }
              if (!company) {
                alert("고객사를 선택해주세요.");
                return;
              }
              onRun({ requirement, startDate, endDate, company });
            }}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "실행 중..." : "AI 큐레이션 실행"}
          </button>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// AnalysisSummary
// =====================================================================
function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7) return `약 ${days}일`;
  if (days < 28) return `약 ${Math.round(days / 7)}주일`;
  return `약 ${Math.round(days / 30)}개월`;
}

function AnalysisSummary({
  company,
  startDate,
  endDate,
  requirement,
  budgetUsagePct,
}: {
  company: string;
  startDate: string;
  endDate: string;
  requirement: string;
  budgetUsagePct?: number;
})
{
  const period = formatPeriod(startDate, endDate);
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-bold">큐레이션 분석 결과</h2>
      <p className="text-sm text-gray-500">
        입력하신 정보들을 바탕으로 분석된 큐레이션 결과입니다.
      </p>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm">
        <div className="grid gap-8 md:grid-cols-2">
          {/* 왼쪽: AI 분석 */}
          <div>
            <h3 className="text-lg font-bold text-black">
              AI 분석 요약
            </h3>

            <p className="mt-3 text-base leading-relaxed text-gray-700">
              <span className="font-semibold">{company}</span>
              의 최근 <span className="font-semibold">{period}</span> 판매 데이터를 분석하였으며,
              자연어 요구사항과 외부 상품 정보를 기반으로 맞춤형 AI 큐레이션을 수행했습니다.
            </p>

            <h3 className="mt-5 text-lg font-bold text-black">
              AI 토론 결과
            </h3>

            <p className="mt-2 text-base leading-relaxed text-gray-700">
              ChatGPT가 사용자 요청과 과거 요청 벡터 검색 결과를 바탕으로 후보 상품을 선정하고,
              Gemini가 상품 가격·재고·마진 및 카테고리 조건을 반영하여 예산 최적화를 진행했습니다.
            </p>
          </div>

          {/* 오른쪽: 분석 조건 */}
          <div className="border-l border-gray-200 pl-8">
            <h3 className="text-lg font-bold text-black">
              분석 조건 및 결과
            </h3>

            <div className="mt-4 space-y-5">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  검색 엔진
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  BAAI/bge-m3 + ChromaDB/BM25 Hybrid Search
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  사용자 요청
                </p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {requirement}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">
                  예산 사용률
                </p>
                {/* 추후 백엔드 budgetUsagePct 연결 */}
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {budgetUsagePct ?? 99.9}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// CurationTabs (버튼 크기 키움)
// =====================================================================
const TABS: { rank: 1 | 2 | 3; label: string }[] = [
  { rank: 1, label: "1순위(취향 저격)" },
  { rank: 2, label: "2순위(가성비)" },
  { rank: 3, label: "3순위(숨은 조합)" },
];

function CurationTabs({ active, onChange }: { active: 1 | 2 | 3; onChange: (r: 1 | 2 | 3) => void }) {
  return (
    <div className="flex flex-wrap gap-3">
      {TABS.map((t) => (
        <button
          key={t.rank}
          type="button"
          onClick={() => onChange(t.rank)}
          className={`rounded-lg px-6 py-3 text-sm font-semibold transition ${
            active === t.rank ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// =====================================================================
// SummaryCards
// =====================================================================
function SummaryCards({
  total,
  budget,
  ratio,
  keywords,
}: {
  total: number;
  
  budget: number;
  ratio: string;
  keywords: string[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">예상 총액</p>
        <p className="mt-2 text-2xl font-bold">
          {formatKRW(total)}{" "}
          <span className="text-xs font-normal text-gray-400">/ {formatKRW(budget)}</span>
        </p>
      </div>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">스낵 : 음료 비율 (비용 기준)</p>
        <p className="mt-2 text-2xl font-bold">{ratio}</p>
      </div>
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="text-xs text-gray-500">연관 키워드</p>
        <p className="mt-2 text-lg font-semibold">{keywords.join(", ")}</p>
      </div>
    </div>
  );
}

// =====================================================================
// Pill + ProductRow
// =====================================================================
function Pill({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-700">{text}</span>
  );
}

function ProductRow({ product, index, checked, onToggle }: {
  product: Product; index: number; checked: boolean; onToggle: (p: Product) => void;
}) {
  return (
    <tr className="border-b border-gray-100 text-sm">
      <td className="px-3 py-4">
        <input type="checkbox" checked={checked} onChange={() => onToggle(product)} className="h-4 w-4 accent-black" />
      </td>
      <td className="px-3 py-4 text-gray-500">{index}</td>
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
          <span className="font-medium">{product.name}</span>
        </div>
      </td>
      <td className="px-3 py-4">
        <span className="inline-block rounded bg-black px-2 py-0.5 text-[11px] text-white">{product.category}</span>
      </td>
      <td className="px-3 py-4 text-gray-700">{product.quantity}개</td>
      <td className="px-3 py-4 text-gray-700">{formatKRW(product.unitPrice)}</td>
      <td className="px-3 py-4 font-medium">{formatKRW(product.subtotal)}</td>
      <td className="px-3 py-4"><Pill text={product.taste} /></td>
      <td className="px-3 py-4"><Pill text={product.sugarLevel} /></td>
      <td className="px-3 py-4"><Pill text={product.satietyLevel} /></td>
    </tr>
  );
}

// =====================================================================
// ProductTable - 옆 버튼을 "전체선택"으로 변경
// =====================================================================
const COLS = ["MYPICK", "번호", "상품명", "분류", "수량", "단가", "합계", "맛", "당류 수준", "포만감 수준"];

function ProductTable({
  products,
  pickedIds,
  onToggle,
  onSelectAll,
  onOpenSearch,
}: {
  products: Product[];
  pickedIds: number[];
  onToggle: (p: Product) => void;
  onSelectAll: () => void;
  onOpenSearch: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-400 hover:border-gray-300"
        >
          <Search className="h-4 w-4" />
          품목/키워드 검색 (전체 품목에서 찾기)
        </button>
        {/* 기존 '삭제' → '전체선택' */}
        <button
          type="button"
          onClick={onSelectAll}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
        >
          <CheckSquare className="h-3.5 w-3.5" />
          전체선택
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white p-2 shadow-sm">
        <table className="w-full min-w-[900px] table-auto">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500">
              {COLS.map((c) => (
                <th key={c} className="px-3 py-3 text-left font-medium">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <ProductRow key={p.id} product={p} index={i + 1} checked={pickedIds.includes(p.id)} onToggle={onToggle} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================================
// MyPickSection - 헤더 우측에 '전체삭제', 합계는 하단 버튼 옆으로 이동
// =====================================================================
function PickRow({
  product,
  quantity,
  onChangeQty,
  onRemove,
}: {
  product: Product;
  quantity: number;
  onChangeQty: (id: number, q: number) => void;
  onRemove: (id: number) => void;
}) {
  const [draft, setDraft] = useState(String(quantity));

  // 외부에서 수량이 바뀌면 동기화
  useEffect(() => setDraft(String(quantity)), [quantity]);

  const commit = () => {
    const next = Math.max(1, parseInt(draft, 10) || 1);
    setDraft(String(next));
    if (next !== quantity) onChangeQty(product.id, next);
  };

  return (
    <li className="flex items-center gap-3 py-3 text-sm">
      <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
      <div className="flex-1">
        <p className="font-medium">{product.name}</p>
        <p className="text-xs text-gray-500">
          {product.category} · {formatKRW(product.unitPrice)}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <input
          type="number"
          min={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
          className="w-16 rounded border border-gray-200 px-2 py-1 text-right text-sm focus:border-black focus:outline-none"
        />
        개
      </div>
      <p className="w-24 text-right font-semibold">{formatKRW(quantity * product.unitPrice)}</p>
      <button
        type="button"
        onClick={() => onRemove(product.id)}
        aria-label="선택 해제"
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

function MyPickSection({
  items,
  onChangeQty,
  onRemove,
  onClearAll,
  shipDate,
}: {
  items: { product: Product; quantity: number }[];
  onChangeQty: (id: number, q: number) => void;
  onRemove: (id: number) => void;
  onClearAll: () => void;
  shipDate?: string;
}) {
  const total = items.reduce((acc, it) => acc + it.quantity * it.product.unitPrice, 0);

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">MY PICK</h3>
          <p className="mt-1 text-xs text-gray-500">
            추천 / 검색에서 체크한 상품이 여기에 모입니다. 수량을 자유롭게 조정할 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          전체삭제
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          아직 선택한 상품이 없습니다.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100">
          {items.map(({ product, quantity }) => (
            <PickRow key={product.id} product={product} quantity={quantity} onChangeQty={onChangeQty} onRemove={onRemove} />
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between">
        {items.length > 0 && shipDate ? (
          <p className="text-sm text-gray-600">
            평균 <span className="font-bold">{Math.ceil((new Date(shipDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 60 * 60 * 24))}일</span> 안에 배송됩니다.
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-xs text-gray-500">총 {items.reduce((acc, it) => acc + it.quantity, 0)}개</p>
            <p className="text-xl font-bold">{formatKRW(total)}</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            주문하기
          </button>
        </div>
      </div>
    </section>
  );
}

// =====================================================================
// SearchModal
// =====================================================================
function SearchModal({
  open,
  onClose,
  picks,
  onAdd,
  onRemove,
  onCatalogLoad,
}: {
  open: boolean;
  onClose: () => void;
  picks: PickItem[];
  onAdd: (id: number, q: number) => void;
  onRemove: (id: number) => void;
  onCatalogLoad?: (products: Product[]) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [draftQty, setDraftQty] = useState<Record<number, string>>({});
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // 모달이 열릴 때만 초기화 & 카탈로그 로드
  useEffect(() => {
    if (!open) return;
    setKeyword("");
    setDraftQty({});
    setCatalogLoading(true);
    fetchAllProducts()
      .then((products) => {
        setCatalog(products);
        onCatalogLoad?.(products);
      })
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoading(false));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC 키 리스너 (onClose 변경에만 반응)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.category.toLowerCase().includes(keyword.toLowerCase()),
  );
  const pickedMap = new Map(picks.map((p) => [p.id, p.quantity]));

  const handleToggle = (p: Product) => {
    if (pickedMap.has(p.id)) {
      onRemove(p.id);
      return;
    }
    const qty = parseInt(draftQty[p.id] ?? "", 10);
    if (!qty || qty <= 0) {
      alert("수량을 먼저 입력해주세요.");
      return;
    }
    onAdd(p.id, qty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 sm:p-8">
      <div className="relative flex max-h-[85vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold">전체 품목 검색</h3>
            <p className="text-xs text-gray-500">수량을 입력한 뒤 체크하면 MY PICK 에 추가됩니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="품목 / 분류 키워드 검색"
              className="w-full bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-3 overflow-auto px-2 pb-6">
          <table className="w-full min-w-[640px] table-auto text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500">
                {["선택", "상품명", "분류", "수량 입력", "단가", "합계"].map((c) => (
                  <th key={c} className="px-3 py-3 text-left font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catalogLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">품목 목록 불러오는 중...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-10 text-center text-sm text-gray-400">검색 결과가 없습니다.</td></tr>
              ) : filtered.map((p) => {
                const checked = pickedMap.has(p.id);
                const qty = checked ? pickedMap.get(p.id)! : parseInt(draftQty[p.id] ?? "", 10) || 0;
                return (
                  <tr key={p.id} className="border-b border-gray-100">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={checked} onChange={() => handleToggle(p)} className="h-4 w-4 accent-black" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-9 w-9 rounded object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block rounded bg-black px-2 py-0.5 text-[11px] text-white">{p.category}</span>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        disabled={checked}
                        value={checked ? qty : draftQty[p.id] ?? ""}
                        onChange={(e) => setDraftQty((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        placeholder="수량 입력"
                        className="w-24 rounded border border-gray-200 px-2 py-1 text-sm focus:border-black focus:outline-none disabled:bg-gray-50"
                      />
                    </td>
                    <td className="px-3 py-3 text-gray-700">{formatKRW(p.unitPrice)}</td>
                    <td className="px-3 py-3 font-medium">{qty > 0 ? formatKRW(qty * p.unitPrice) : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
          <span>현재 MY PICK: {picks.length}개</span>
          <button type="button" onClick={onClose} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            완료
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// App (Home)
// =====================================================================
export default function App() {
  const [data, setData] = useState<CurationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [picks, setPicks] = useState<PickItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCatalog, setSearchCatalog] = useState<Product[]>([]);
  const [lastInput, setLastInput] = useState<{
    requirement: string;
    startDate: string;
    endDate: string;
    company: string;
  } | null>(null);

  const handleRun = async (input: { requirement: string; startDate: string; endDate: string; company: string }) => {
    setLastInput(input);
    setLoading(true);
    setError(null);
    try {
      const res = await runCuration(input);
      setData(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      console.error("[큐레이션 API 오류]", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const activeResult = data?.results.find((r) => r.rank === activeTab);
  const tabTotal = useMemo(
    () => activeResult?.products.reduce((a, p) => a + p.quantity * p.unitPrice, 0) ?? 0,
    [activeResult],
  );

  // id -> Product 조회 (전체 품목 검색 결과 + 큐레이션 결과)
  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    searchCatalog.forEach((p) => map.set(p.id, p));
    data?.results.flatMap((r) => r.products).forEach((p) => map.set(p.id, p));
    return map;
  }, [data, searchCatalog]);

  const pickedIds = picks.map((p) => p.id);
  const pickedItems = picks
    .map((it) => ({ product: productMap.get(it.id)!, quantity: it.quantity }))
    .filter((it) => it.product);

  // pick 조작
  const addPick = (id: number, quantity: number) =>
    setPicks((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, { id, quantity }]));
  const removePick = (id: number) => setPicks((prev) => prev.filter((p) => p.id !== id));
  const changeQty = (id: number, quantity: number) =>
    setPicks((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p)));

  const toggleRecommended = (product: Product) =>
    picks.some((p) => p.id === product.id)
      ? removePick(product.id)
      : addPick(product.id, product.quantity);

  // 현재 탭 상품 전체 선택 (이미 있는 항목은 그대로 두고 새 항목만 추가)
  const selectAllInTab = () => {
    if (!activeResult) return;
    setPicks((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const additions = activeResult.products
        .filter((p) => !ids.has(p.id))
        .map((p) => ({ id: p.id, quantity: p.quantity }));
      return [...prev, ...additions];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-375 space-y-10 px-6 py-10">
        <InputSection onRun={handleRun} loading={loading} />

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            오류: {error}
          </p>
        )}

        {data && (
          <>
            {lastInput && (
              <AnalysisSummary
                company={lastInput.company}
                startDate={lastInput.startDate}
                endDate={lastInput.endDate}
                requirement={lastInput.requirement}
              />
            )}

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">최종 큐레이션 리스트</h2>
                <p className="text-sm text-gray-500">
                  판매/입출고/간식신청서 데이터와 자연어 요구조건을 함께 반영한 큐레이션 결과입니다.
                </p>
              </div>

              <CurationTabs active={activeTab} onChange={setActiveTab} />

              {activeResult && (
                <>
                  <SummaryCards total={tabTotal} budget={data.budget} ratio={activeResult.ratio} keywords={activeResult.keywords} />
                  <ProductTable
                    products={activeResult.products}
                    pickedIds={pickedIds}
                    onToggle={toggleRecommended}
                    onSelectAll={selectAllInTab}
                    onOpenSearch={() => setSearchOpen(true)}
                  />
                </>
              )}
            </section>

            <MyPickSection
              items={pickedItems}
              onChangeQty={changeQty}
              onRemove={removePick}
              onClearAll={() => setPicks([])}
              shipDate={data.expectedShipDate}
            />
          </>
        )}
      </main>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        picks={picks}
        onAdd={addPick}
        onCatalogLoad={setSearchCatalog}
        onRemove={removePick}
      />
    </div>
  );
}
