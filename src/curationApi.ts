// 추후 FastAPI 연동 지점.
// 지금은 mockData 를 반환하는 형태로 함수 시그니처만 정의해 둡니다.
import {
  mockAnalysisSummary,
  mockCurationResults,
  mockDiscussion,
  type CurationResult,
} from "./mockData";

export interface CurationRequest {
  requirement: string;
  startDate: string;
  endDate: string;
}

export interface CurationResponse {
  summary: typeof mockAnalysisSummary;
  discussion: typeof mockDiscussion;
  results: CurationResult[];
}

// TODO: 실제 API 연동 시 fetch("/api/curation", ...) 로 교체
export async function runCuration(_req: CurationRequest): Promise<CurationResponse> {
  await new Promise((r) => setTimeout(r, 400));
  return {
    summary: mockAnalysisSummary,
    discussion: mockDiscussion,
    results: mockCurationResults,
  };
}
