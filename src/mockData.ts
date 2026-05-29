// 더미 데이터 모음 (추후 FastAPI 응답으로 대체)

export type Category = "스낵" | "음료" | "초콜릿" | "젤리/캔디";

export interface Product {
  id: number;
  name: string;
  category: Category;
  quantity: number; // 추천 수량 (카탈로그 기본값 0)
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

// MY PICK 에 담긴 항목
export interface PickItem {
  id: number;
  quantity: number;
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/80/80`;

const tier1: Product[] = [
  { id: 1, name: "빈츠", category: "스낵", quantity: 30, unitPrice: 5000, taste: "단 맛", sugarLevel: "보통", satietyLevel: "보통", image: img("binch") },
  { id: 2, name: "추억의 도나쓰", category: "스낵", quantity: 45, unitPrice: 2000, taste: "단 맛", sugarLevel: "보통", satietyLevel: "보통", image: img("donut") },
  { id: 3, name: "닥터유 단백질바", category: "초콜릿", quantity: 55, unitPrice: 2000, taste: "고소한 맛", sugarLevel: "보통", satietyLevel: "보통", image: img("bar") },
  { id: 4, name: "마이쮸 스틱 애플망고", category: "젤리/캔디", quantity: 20, unitPrice: 1000, taste: "단 맛", sugarLevel: "높음", satietyLevel: "낮음", image: img("mychew") },
  { id: 5, name: "더단백 드링크 멜론맛", category: "음료", quantity: 15, unitPrice: 2000, taste: "단 맛", sugarLevel: "낮음", satietyLevel: "보통", image: img("drink") },
];

const tier2: Product[] = [
  { id: 11, name: "초코파이", category: "스낵", quantity: 60, unitPrice: 3000, taste: "단 맛", sugarLevel: "높음", satietyLevel: "보통", image: img("choco") },
  { id: 12, name: "오예스", category: "스낵", quantity: 40, unitPrice: 2500, taste: "단 맛", sugarLevel: "보통", satietyLevel: "보통", image: img("oyes") },
  { id: 13, name: "포카리스웨트", category: "음료", quantity: 30, unitPrice: 1500, taste: "상큼한 맛", sugarLevel: "낮음", satietyLevel: "낮음", image: img("poca") },
];

const tier3: Product[] = [
  { id: 21, name: "꼬북칩 콘스프", category: "스낵", quantity: 25, unitPrice: 2500, taste: "고소한 맛", sugarLevel: "낮음", satietyLevel: "높음", image: img("kkobuk") },
  { id: 22, name: "허니버터칩", category: "스낵", quantity: 30, unitPrice: 2000, taste: "단 맛", sugarLevel: "보통", satietyLevel: "보통", image: img("honey") },
  { id: 23, name: "광천원두 콜드브루", category: "음료", quantity: 15, unitPrice: 3500, taste: "고소한 맛", sugarLevel: "낮음", satietyLevel: "낮음", image: img("coffee") },
];

const catalogExtra: Product[] = [
  { id: 31, name: "새우깡", category: "스낵", quantity: 0, unitPrice: 1500, taste: "고소한 맛", sugarLevel: "낮음", satietyLevel: "보통", image: img("shrimp") },
  { id: 32, name: "오레오 오리지널", category: "스낵", quantity: 0, unitPrice: 2200, taste: "단 맛", sugarLevel: "높음", satietyLevel: "보통", image: img("oreo") },
  { id: 33, name: "킷캣", category: "초콜릿", quantity: 0, unitPrice: 1800, taste: "단 맛", sugarLevel: "높음", satietyLevel: "낮음", image: img("kitkat") },
  { id: 34, name: "허쉬 다크초콜릿", category: "초콜릿", quantity: 0, unitPrice: 2500, taste: "쓴 맛", sugarLevel: "보통", satietyLevel: "낮음", image: img("hershey") },
  { id: 35, name: "젤리벨리", category: "젤리/캔디", quantity: 0, unitPrice: 3000, taste: "단 맛", sugarLevel: "높음", satietyLevel: "낮음", image: img("jelly") },
  { id: 36, name: "삼다수 500ml", category: "음료", quantity: 0, unitPrice: 800, taste: "담백한 맛", sugarLevel: "낮음", satietyLevel: "낮음", image: img("water") },
  { id: 37, name: "코카콜라 제로", category: "음료", quantity: 0, unitPrice: 1500, taste: "상큼한 맛", sugarLevel: "낮음", satietyLevel: "낮음", image: img("coke") },
  { id: 38, name: "스타벅스 더블샷", category: "음료", quantity: 0, unitPrice: 3500, taste: "쓴 맛", sugarLevel: "낮음", satietyLevel: "낮음", image: img("sbux") },
  { id: 39, name: "프링글스 오리지널", category: "스낵", quantity: 0, unitPrice: 3000, taste: "고소한 맛", sugarLevel: "낮음", satietyLevel: "높음", image: img("pringles") },
  { id: 40, name: "아몬드브리즈", category: "음료", quantity: 0, unitPrice: 1800, taste: "고소한 맛", sugarLevel: "낮음", satietyLevel: "보통", image: img("almond") },
];

export const mockCurationResults: CurationResult[] = [
  { rank: 1, label: "1순위(취향 저격)", products: tier1, keywords: ["#당 충전", "#스낵류 위주"], ratio: "8:2" },
  { rank: 2, label: "2순위(가성비)", products: tier2, keywords: ["#가성비", "#대용량"], ratio: "7:3" },
  { rank: 3, label: "3순위(숨은 조합)", products: tier3, keywords: ["#새로움", "#트렌드"], ratio: "6:4" },
];

export const mockCatalog: Product[] = [...tier1, ...tier2, ...tier3, ...catalogExtra];

export const mockAnalysisSummary = {
  customer: "코인원",
  period: "최근 한 달",
  saleRows: "36,673건",
  receipts: "21,040건",
  totalQty: "3,563개",
  totalRevenue: "56,246,565원",
  externalItems: "20개",
  warehouseData: "2,123개",
  homeData: "3,563건",
  snackRequests: "3,563건",
  remainingItems: "20개",
  remainingQty: "20개",
};

export const mockDiscussion = {
  chatgpt:
    "40만원 예산에 맞춰 MZ세대의 선호도를 반영한 간식과 음료수를 구성했습니다. 제로 칼로리 음료, 단백질 보충 간식, 건강한 견과류 등 트렌드를 고려했으며, 실제 판매 데이터와 고객 요청이 많았던 인기 상품 위주로 균형 있게 선정했습니다.",
  gemini:
    "40만원 예산에 맞춰 MZ세대의 선호도를 반영한 간식과 음료수를 구성했습니다. 제로 칼로리 음료, 단백질 보충 간식, 건강한 견과류 등 트렌드를 고려했으며, 실제 판매 데이터와 고객 요청이 많았던 인기 상품 위주로 균형 있게 선정했습니다.",
  conclusion:
    "두 제안의 장점을 통합하여 데이터와 사용자 요청을 기반으로 MZ세대 선호도를 반영한 최종 간식만을 구성합니다.",
  assumptions: [
    "MZ세대는 제로 칼로리, 단백질 등 건강 트렌드에 관심이 많다.",
    "데이터상 판매 및 요청이 많은 상품은 선호도가 검증된 상품이다.",
    "다양한 품목 구성이 만족도를 높인다.",
  ],
};
