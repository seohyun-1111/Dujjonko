import imgSnack from "./image/스낵.png";
import imgDrink from "./image/음료.png";
import imgChocolate from "./image/초콜릿.png";
import imgJelly from "./image/젤리캔디.png";
import imgNuts from "./image/견과건과.png";
import imgEtc from "./image/기타.png";
import imgRamen from "./image/라면식사.png";

// ── 타입 정의 ─────────────────────────────────────────────────────────
export type Category = "스낵" | "음료" | "초콜릿" | "젤리/캔디" | "견과/건과" | "기타" | "라면/식사";

export interface Product {
  id: number;
  name: string;
  category: Category;
  quantity: number;
  unitPrice: number;
  taste: string;
  sugarLevel: "낮음" | "보통" | "높음";
  satietyLevel: "낮음" | "보통" | "높음";
  image: string;
}

export interface CurationResult {
  rank: 1 | 2 | 3;
  label: string;
  products: Product[];
  keywords: string[];
  ratio: string;
}

export interface PickItem {
  id: number;
  quantity: number;
}

interface AnalysisSummary {
  customer: string;
  period: string;
  saleRows: string;
  receipts: string;
  totalQty: string;
  totalRevenue: string;
  externalItems: string;
  warehouseData: string;
  homeData: string;
  snackRequests: string;
  remainingItems: string;
  remainingQty: string;
}

interface Discussion {
  chatgpt: string;
  gemini: string;
  conclusion: string;
  assumptions: string[];
}

// ────────────────────────────────────────────────────────────────────
// ✅ API 주소 설정 방법 (팀원 공유용)
// 프로젝트 루트(package.json 있는 위치)에 .env.local 파일을 새로 만들고
// 아래 한 줄을 입력하세요.
//
//   VITE_API_BASE_URL=http://3.34.165.158:8000
//
// .env.local 은 .gitignore 에 의해 git에 올라가지 않습니다.
// ────────────────────────────────────────────────────────────────────

const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

// ── 공개 인터페이스 ────────────────────────────────────────────────────
export interface CurationRequest {
  requirement: string;
  startDate: string;
  endDate: string;
  company?: string;
  budget?: number;
}

export interface CurationResponse {
  summary: AnalysisSummary;
  discussion: Discussion;
  results: CurationResult[];
  budget: number;
  expectedShipDate?: string;
}

// ── API 응답 내부 타입 ─────────────────────────────────────────────────
interface ApiRecommendItem {
  product_name?: string;
  search_name?: string;
  category?: string;
  price?: number;
  stock?: number;
  quantity?: number;
  taste?: string;
  sugar_level?: string;
  satiety_level?: string;
  reason?: string;
}

interface ApiOrderItem {
  search_name?: string;
  product_name?: string;
  quantity?: number;
  price?: number;
}

interface ApiOrder {
  budget?: number;
  total?: number;
  budget_usage_pct?: number;
  remaining_budget?: number;
  items?: ApiOrderItem[];
  category_summary?: Record<string, { product_count?: number; amount?: number; ratio?: number }>;
}

interface ApiShipping {
  expected_ship_date?: string;
}

interface ApiResponse {
  query?: string;
  company?: string;
  engine?: string;
  section_order?: string[];
  recommendations?: Record<string, ApiRecommendItem[]>;
  order?: ApiOrder;
  expected_ship_date?: string;
  shipping?: ApiShipping;
  error?: string;
}

// ── 카테고리 이미지 매핑 ──────────────────────────────────────────────
const CATEGORY_IMAGE: Record<string, string> = {
  "스낵": imgSnack,
  "음료": imgDrink,
  "초콜릿": imgChocolate,
  "젤리/캔디": imgJelly,
  "견과/건과": imgNuts,
  "기타": imgEtc,
  "라면/식사": imgRamen,
};

// ── 자연어 예산 파싱 ──────────────────────────────────────────────────
const KO_NUMBERS: Record<string, number> = {
  일: 1, 이: 2, 삼: 3, 사: 4, 오: 5,
  육: 6, 칠: 7, 팔: 8, 구: 9, 십: 10,
};

export function parseBudgetFromText(text: string): number | undefined {
  // "400,000원" / "400000원"
  const rawMatch = text.match(/(\d[\d,]*)\s*원/);
  if (rawMatch) {
    const val = parseInt(rawMatch[1].replace(/,/g, ""), 10);
    if (val >= 1000) return val;
  }
  // "40만원" / "40만"
  const manDigitMatch = text.match(/(\d+)\s*만\s*원?/);
  if (manDigitMatch) return parseInt(manDigitMatch[1], 10) * 10000;
  // "오십만원" / "사십만" 등 한글 숫자
  const koManMatch = text.match(/([일이삼사오육칠팔구십]+)\s*만\s*원?/);
  if (koManMatch) {
    const chars = koManMatch[1];
    let value = 0;
    let tmp = 0;
    for (const ch of chars) {
      const n = KO_NUMBERS[ch];
      if (ch === "십") { value += (tmp || 1) * 10; tmp = 0; }
      else tmp = n ?? tmp;
    }
    value += tmp;
    if (value > 0) return value * 10000;
  }
  return undefined;
}

// ── 어댑터 내부 함수 ──────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
  취향저격: "1순위(취향 저격)",
  가성비: "2순위(가성비)",
  숨은조합: "3순위(숨은 조합)",
};

function toProductImage(category: string): string {
  return CATEGORY_IMAGE[category] ?? CATEGORY_IMAGE["기타"];
}

function toFallbackId(value: string, offset: number): number {
  let hash = offset;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildOrderLookup(order?: ApiOrder): Map<string, ApiOrderItem> {
  const map = new Map<string, ApiOrderItem>();
  for (const item of order?.items ?? []) {
    const key = item.search_name || item.product_name;
    if (key) map.set(key, item);
  }
  return map;
}

function toProduct(
  item: ApiRecommendItem,
  index: number,
  orderLookup: Map<string, ApiOrderItem>,
): Product {
  const key = item.search_name || item.product_name || `item-${index}`;
  const orderItem = orderLookup.get(key);
  const sugarRaw = item.sugar_level?.trim();
  const satietyRaw = item.satiety_level?.trim();
  return {
    id: toFallbackId(key, index + 1),
    name: item.product_name || key,
    category: (item.category as Product["category"]) ?? "스낵",
    quantity: orderItem?.quantity ?? 0,
    unitPrice: orderItem?.price ?? item.price ?? 0,
    taste: item.taste?.trim() || item.reason || "추천 API 매칭",
    sugarLevel: (sugarRaw as Product["sugarLevel"]) || "보통",
    satietyLevel: (satietyRaw as Product["satietyLevel"]) || "보통",
    image: toProductImage(item.category ?? "기타"),
  };
}

function toRatio(order?: ApiOrder): string {
  const summary = order?.category_summary ?? {};
  const snack = summary["스낵"]?.amount ?? 0;
  const drink = summary["음료"]?.amount ?? 0;
  if (!snack && !drink) return "API 응답 기준";
  const total = snack + drink;
  return `${Math.round((snack / total) * 10)}:${Math.round((drink / total) * 10)}`;
}

function mapApiResponse(data: ApiResponse): CurationResponse {
  const orderLookup = buildOrderLookup(data.order);
  const sections = (data.section_order ?? Object.keys(data.recommendations ?? {})).slice(0, 3);

  return {
    budget: data.order?.budget ?? 0,
    expectedShipDate: data.expected_ship_date ?? data.shipping?.expected_ship_date,
    summary: {
      customer: data.company ?? "미입력",
      period: "사용자 선택 기간",
      saleRows: "번들 데이터 기준",
      receipts: `${sections.length}개 추천 섹션`,
      totalQty: `${data.order?.items?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0}개`,
      totalRevenue: `${(data.order?.total ?? 0).toLocaleString("ko-KR")}원`,
      externalItems: `${data.order?.items?.length ?? 0}개`,
      warehouseData: data.engine ?? "추천 API",
      homeData: data.query ?? "",
      snackRequests: data.query ?? "",
      remainingItems: `${(data.order?.remaining_budget ?? 0).toLocaleString("ko-KR")}원`,
      remainingQty: `${
        data.order?.budget_usage_pct ??
        (data.order?.budget && data.order.total
          ? Math.round((data.order.total / data.order.budget) * 100)
          : 0)
      }%`,
    },
    discussion: {
      chatgpt:
        "사용자 요청과 과거 요청 벡터 검색 결과를 바탕으로 우선 후보를 구성했습니다.",
      gemini:
        "상품 가격, 재고, 마진, 카테고리 조건을 함께 반영해 예산 주문 리스트를 보정했습니다.",
      conclusion:
        "현재 입력 조건 기준으로 추천 상품별 리스트와 예산 기반 주문 리스트를 동시에 작성했습니다.",
      assumptions: [
        `검색 엔진: ${data.engine ?? "recommender API"}`,
        `요청문: ${data.query ?? ""}`,
        `예산 사용률: ${
          data.order?.budget_usage_pct ??
          (data.order?.budget && data.order.total
            ? Math.round((data.order.total / data.order.budget) * 100)
            : 0)
        }%`,
      ],
    },
    results: sections.map((section, idx) => ({
      rank: (idx + 1) as 1 | 2 | 3,
      label: SECTION_LABELS[section] ?? `${idx + 1}순위(${section})`,
      products: (data.recommendations?.[section] ?? []).map((item, itemIdx) =>
        toProduct(item, idx * 100 + itemIdx, orderLookup),
      ),
      keywords: [`#${data.query ?? "요청"}`, `#${section}`],
      ratio: toRatio(data.order),
    })),
  };
}

// ── 전체 품목 조회 (검색 모달용) ─────────────────────────────────────
interface ApiProduct {
  row_id: number;
  search_name: string;
  product_name: string;
  category: string;
  price: number;
}

interface ApiProductsResponse {
  count: number;
  products: ApiProduct[];
}

export async function fetchAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products?limit=500`);
  const data = (await res.json()) as ApiProductsResponse;
  if (!res.ok) throw new Error("품목 목록 조회에 실패했습니다.");
  return data.products.map((p) => ({
    id: p.row_id,
    name: p.product_name,
    category: (p.category as Product["category"]) ?? "스낵",
    quantity: 0,
    unitPrice: p.price,
    taste: "데이터 미제공",
    sugarLevel: "보통" as const,
    satietyLevel: "보통" as const,
    image: toProductImage(p.category),
  }));
}

// ── 공개 함수 ─────────────────────────────────────────────────────────
export async function runCuration(req: CurationRequest): Promise<CurationResponse> {
  const parsedBudget = parseBudgetFromText(req.requirement) ?? req.budget ?? 400000;

  const res = await fetch(`${API_BASE}/api/recommend-ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company: req.company ?? "",
      request_text: req.requirement,
      budget: parsedBudget,
      start_date: req.startDate,
      end_date: req.endDate,
      top_k: 5,
      min_qty: 10,
      max_qty: 50,
    }),
  });

  const data: ApiResponse = (await res.json()) as ApiResponse;
  if (!res.ok) {
    throw new Error(data.error ?? "추천 API 호출에 실패했습니다.");
  }
  return mapApiResponse(data);
}
