import imgNut from "./image/견과건과.png";
import imgEgg from "./image/계란.png";
import imgRamenKw from "./image/라면.png";
import imgRice from "./image/밥.png";
import imgStrawKw from "./image/빨대.png";
import imgSausageKw from "./image/소시지.png";
import imgSnack from "./image/스낵.png";
import imgDrink from "./image/음료.png";
import imgCandy from "./image/젤리캔디.png";
import imgChocolate from "./image/초콜릿.png";
import imgCan from "./image/캔.png";
import imgTissueKw from "./image/티슈.png";
import imgPack from "./image/팩.png";
import imgEtc from "./image/기타.png";


// ── 타입 정의 ─────────────────────────────────────────────────────────
export type Category = "스낵" | "음료" | "초콜릿" | "젤리/캔디" | "견과/건과" | "기타" | "라면/식사";

export interface Product {
  id: number;
  name: string;
  category: Category;
  quantity: number;
  unitPrice: number;
  subtotal: number;
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
  total: number;
  naturalSummary?: string;
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
  deliveryMessage?: string;
}

// ── API 응답 내부 타입 ─────────────────────────────────────────────────
interface ApiRecommendItem {
  product_name?: string;
  search_name?: string;
  category?: string;
  price?: number;
  stock?: number;
  quantity?: number;
  subtotal?: number;
  taste?: string;
  sugar_level?: string;
  satiety_level?: string;
  reason?: string;
}

interface ApiSectionSummary {
  total?: number;
  item_count?: number;
  budget?: number;
  remaining_budget?: number;
  budget_usage_pct?: number;
  category_summary?: Record<string, { product_count?: number; amount?: number; ratio?: number }>;
  applied_ratio?: {
    target_counts?: Record<string, number>;
    display_ratio?: Record<string, number>;
    display_ratio_text?: string;
  } | null;
  related_keywords?: string[];
  natural_summary?: string;
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

interface ApiResponse {
  query?: string;
  company?: string;
  engine?: string;
  section_order?: string[];
  recommendations?: Record<string, ApiRecommendItem[]>;
  category_grouped_recommendations?: Record<string, ApiRecommendItem[]>;
  display_recommendations?: Record<string, ApiRecommendItem[]>;
  section_summaries?: Record<string, ApiSectionSummary>;
  section_related_keywords?: Record<string, string[]>;
  section_keywords?: Record<string, string[]>;
  related_keywords?: string[];
  natural_summary?: string;
  order?: ApiOrder;
  expected_ship_date?: string;
  shipping?: { expected_ship_date?: string; delivery_message?: string };
  budget_boost?: unknown;
  error?: string;
}

// ── 카테고리 이미지 매핑 ──────────────────────────────────────────────
const CATEGORY_IMAGE: Record<string, string> = {
  "견과/건과": imgNut,
  "계란": imgEgg,
  "라면/식사": imgRamenKw,
  "스낵": imgSnack,
  "음료": imgDrink,
  "젤리/캔디": imgCandy,
  "초콜릿": imgChocolate,
  "기타": imgEtc
};

// ── 상품명 키워드 이미지 매핑 (순서대로 검색, 먼저 매칭되는 것 사용) ──────
const NAME_KEYWORD_IMAGE: Array<{ keyword: string; image: string }> = [
  { keyword: "견과건과", image: imgNut },
  { keyword: "란", image: imgEgg },
  { keyword: "달걀", image: imgEgg },
  { keyword: "라면", image: imgRamenKw },
  { keyword: "면", image: imgRamenKw },
  { keyword: "시리얼", image: imgRice },
  { keyword: "빨대", image: imgStrawKw },
  { keyword: "소시지", image: imgSausageKw },
  { keyword: "삼양]랩노쉬슬림쉐이크딸기쿠키크럼블45g", image: imgPack },
  { keyword: "드링크", image: imgDrink },
  { keyword: "스낵", image: imgSnack },
  { keyword: "쿠키", image: imgSnack },
  { keyword: "젤리캔디", image: imgCandy },
  { keyword: "젤리", image: imgCandy },
  { keyword: "캔디", image: imgCandy },
  { keyword: "사탕", image: imgCandy },
  { keyword: "캔", image: imgCan },
  { keyword: "고래밥", image: imgSnack },
  { keyword: "밥", image: imgRice },
  { keyword: "티슈", image: imgTissueKw },
  { keyword: "화장", image: imgTissueKw },
  { keyword: "봉투", image: imgTissueKw },
  { keyword: "팩", image: imgPack },
  { keyword: "프로틴", image: imgPack },
  { keyword: "초콜릿", image: imgChocolate },
  { keyword: "페트", image: imgDrink },
  { keyword: "음료", image: imgDrink },
];

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

function toProductImage(name: string, category: string): string {
  for (const { keyword, image } of NAME_KEYWORD_IMAGE) {
    if (name.includes(keyword)) return image;
  }
  return CATEGORY_IMAGE[category] ?? imgEtc;
}

function toFallbackId(value: string, offset: number): number {
  let hash = offset;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const CATEGORY_ORDER: Record<string, number> = {
  "스낵": 0, "초콜릿": 1, "젤리/캔디": 2,
  "견과/건과": 3, "라면/식사": 4, "음료": 5, "기타": 6,
};

function normalizeCategory(raw: string | undefined): Category {
  if (!raw) return "기타";
  const s = raw.trim();
  const exact: Category[] = ["스낵", "음료", "초콜릿", "젤리/캔디", "견과/건과", "기타", "라면/식사"];
  if (exact.includes(s as Category)) return s as Category;
  if (/과자/.test(s)) return "스낵";
  if (/초콜릿/.test(s)) return "초콜릿";
  if (/젤리|캔디/.test(s)) return "젤리/캔디";
  if (/견과|건과/.test(s)) return "견과/건과";
  if (/라면|식사/.test(s)) return "라면/식사";
  if (/음료/.test(s)) return "음료";
  if (/스낵/.test(s)) return "스낵";
  return "기타";
}

function toProduct(item: ApiRecommendItem, index: number): Product {
  const key = item.search_name || item.product_name || `item-${index}`;
  const sugarRaw = item.sugar_level?.trim();
  const satietyRaw = item.satiety_level?.trim();
  const qty = item.quantity ?? 0;
  const price = item.price ?? 0;
  const category = normalizeCategory(item.category);
  return {
    id: toFallbackId(key, index + 1),
    name: item.product_name || key,
    category,
    quantity: qty,
    unitPrice: price,
    subtotal: item.subtotal ?? qty * price,
    taste: item.taste?.trim() || item.reason || "추천 API 매칭",
    sugarLevel: (sugarRaw as Product["sugarLevel"]) || "보통",
    satietyLevel: (satietyRaw as Product["satietyLevel"]) || "보통",
    image: toProductImage(item.product_name ?? "", category),
  };
}

function toRatioFromSection(ss?: ApiSectionSummary): string {
  if (ss?.applied_ratio?.display_ratio_text) {
    return ss.applied_ratio.display_ratio_text;
  }
  if (ss?.applied_ratio?.display_ratio) {
    return Object.entries(ss.applied_ratio.display_ratio).map(([k, v]) => `${k} ${v}`).join(" : ");
  }
  if (ss?.applied_ratio?.target_counts) {
    const counts = ss.applied_ratio.target_counts;
    return Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(" : ");
  }
  const cs = ss?.category_summary;
  if (!cs) return "-";
  const snack = cs["스낵"]?.product_count ?? 0;
  const drink = cs["음료"]?.product_count ?? 0;
  if (!snack && !drink) return "-";
  return `스낵 ${snack} : 음료 ${drink}`;
}

function mapApiResponse(data: ApiResponse): CurationResponse {
  const sections = (data.section_order ?? Object.keys(data.recommendations ?? {})).slice(0, 3);
  const sectionSummaries = data.section_summaries ?? {};

  return {
    budget: data.order?.budget ?? 0,
    expectedShipDate: data.expected_ship_date ?? data.shipping?.expected_ship_date,
    deliveryMessage: data.shipping?.delivery_message,
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
    results: sections.map((section, idx) => {
      const ss = sectionSummaries[section];
      return {
        rank: (idx + 1) as 1 | 2 | 3,
        label: SECTION_LABELS[section] ?? `${idx + 1}순위(${section})`,
        products: (data.display_recommendations?.[section] ?? data.category_grouped_recommendations?.[section] ?? data.recommendations?.[section] ?? [])
          .map((item, itemIdx) => toProduct(item, idx * 100 + itemIdx))
          .sort((a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)),
        keywords: ss?.related_keywords ?? data.section_related_keywords?.[section] ?? data.section_keywords?.[section] ?? data.related_keywords ?? [],
        ratio: toRatioFromSection(ss),
        total: ss?.total ?? 0,
        naturalSummary: ss?.natural_summary ?? data.natural_summary,
      };
    }),
  };
}

// ── 전체 품목 조회 (검색 모달용) ─────────────────────────────────────
interface ApiProduct {
  row_id: number;
  search_name: string;
  product_name: string;
  category: string;
  price: number;
  taste?: string;
  sugar_level?: string;
  satiety_level?: string;
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
    subtotal: 0,
    taste: p.taste?.trim() || "데이터 미제공",
    sugarLevel: ((p.sugar_level?.trim() || "보통") as Product["sugarLevel"]),
    satietyLevel: ((p.satiety_level?.trim() || "보통") as Product["satietyLevel"]),
    image: toProductImage(p.product_name, p.category),
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
      top_k: 10,
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
