import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { ReportData, StudentInfo } from "../types";

// 1. 환경 변수 호출 (Vite 표준)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

/**
 * [기능 1] 시험지 이미지에서 학생 정보를 자동으로 추출하는 함수
 * (추후 '자동 입력' 버튼 등에 활용하세요)
 */
export const extractStudentInfo = async (
  files: { data: string; mimeType: string }[]
): Promise<Partial<StudentInfo>> => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // 정보 추출은 속도가 빠른 플래시 모델 권장
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `업로드된 문서 이미지에서 학생 이름, 학년, 시험일, 단원명을 찾아 JSON으로 반환하세요.
    - 학년 형식: "초1", "초2" ... "중3"
    - 날짜 형식: "YYYY-MM-DD"
    - 모르는 정보는 "" 로 표시`;

    const imageParts = files.map(file => ({
      inlineData: { data: file.data.split(',')[1], mimeType: file.mimeType }
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    return JSON.parse(result.response.text());
  } catch (e) {
    console.error("정보 추출 에러:", e);
    return {};
  }
};

/**
 * [기능 2] 실제 분석 리포트를 생성하는 메인 함수
 * (강사님이 작성하신 페르소나와 스키마를 완벽하게 반영했습니다)
 */
export const generateFeedbackReport = async (
  studentInfo: StudentInfo,
  files: { data: string; mimeType: string }[]
): Promise<ReportData> => {
  
  try {
    // 구조화된 응답을 위해 모델 설정 (Pro 모델 사용 권장)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // 3.1 preview가 불안정할 경우 1.5 pro가 가장 정확합니다.
      generationConfig: {
        responseMimeType: "application/json",
        // 🌟 제미나이 전용 JSON 스키마 정의
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER, description: "예상 점수" },
            achievement_level: { type: SchemaType.STRING, description: "성취 수준" },
            strengths: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            weak_points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            error_causes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            next_unit_connection: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            academy_plan: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            home_support_points: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            kakao_short: { type: SchemaType.STRING },
            kakao_standard: { type: SchemaType.STRING },
            kakao_detailed: { type: SchemaType.STRING },
          },
          required: ["score", "achievement_level", "kakao_standard"]
        },
      },
    });

    const prompt = `당신은 20년 경력의 베테랑 수학학원 원장입니다.
    다음 학생의 정보를 바탕으로 이미지를 분석하여 학부모 상담용 리포트를 작성하세요.
    
    [학생 정보]
    이름: ${studentInfo.name}, 학년: ${studentInfo.grade}, 단원: ${studentInfo.unit}
    
    [작성 원칙]
    - 강점과 보완점의 균형을 맞출 것
    - 전문적이고 부드러운 톤 (학부모님 안심 중심)
    - 학년별/성취도별 맞춤 톤 적용`;

    const imageParts = files.map(file => ({
      inlineData: { data: file.data.split(',')[1], mimeType: file.mimeType }
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const aiResponse = JSON.parse(result.response.text());

    // 최종 데이터 병합하여 반환
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...studentInfo,
      ...aiResponse,
      created_at: new Date().toISOString()
    } as ReportData;

  } catch (error) {
    console.error("AI 리포트 생성 실패:", error);
    throw new Error("AI 분석 도중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
};
