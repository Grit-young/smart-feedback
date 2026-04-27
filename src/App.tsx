import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { ReportData, StudentInfo } from './types';
import { generateFeedbackReport } from './services/aiService';
import { SAMPLE_DATA } from './constants/sampleData';

// 수파베이스 및 로그인 페이지 임포트
import { supabase } from './lib/supabase';
import LoginPage from './app/login/page'; 

type ViewMode = 'input' | 'result' | 'history';

export default function App() {
  // --- 1. 상태 관리 ---
  const [session, setSession] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true); // 승인 확인 중 로딩 상태
  const [view, setView] = useState<ViewMode>('input');
  const [currentData, setCurrentData] = useState<ReportData | null>(null);
  const [history, setHistory] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. 인증 및 승인 체크 로직 (핵심) ---
  useEffect(() => {
    // 승인 여부를 DB에서 직접 확인하는 함수
    const checkApproval = async (userSession: any) => {
      if (!userSession) {
        setSession(null);
        setIsChecking(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', userSession.user.id)
        .single();

      if (profile?.is_approved) {
        setSession(userSession);
      } else {
        // 미승인 사용자는 알림 후 강제 로그아웃
        alert("🛡️ 관리자의 승인이 필요한 계정입니다. 가입 승인 완료 후 이용 가능합니다.");
        await supabase.auth.signOut();
        setSession(null);
      }
      setIsChecking(false);
    };

    // 최초 로드 시 세션 확인
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      checkApproval(initialSession);
    });

    // 로그인/로그아웃 상태 변화 실시간 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (_event === 'SIGNED_IN') {
        checkApproval(currentSession);
      } else if (_event === 'SIGNED_OUT') {
        setSession(null);
        setIsChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 3. 기존 분석 및 히스토리 로직 ---
  useEffect(() => {
    if (session) {
      const saved = localStorage.getItem('smartFeedbackHistory');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (e) {
          console.error("Storage parse error", e);
        }
      }
    }
  }, [session]);

  const saveToHistory = (data: ReportData) => {
    const newData = { ...data, created_at: new Date().toLocaleDateString() };
    const newHistory = [newData, ...history.filter(h => h.id !== data.id)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('smartFeedbackHistory', JSON.stringify(newHistory));
    alert("기록에 저장되었습니다.");
  };

  const handleAnalyze = async (info: StudentInfo, files: { data: string; mimeType: string; name: string }[]) => {
    setIsLoading(true);
    try {
      const result = await generateFeedbackReport(info, files);
      setCurrentData({ ...result, id: Math.random().toString(36).substring(2, 9) });
      setView('result');
    } catch (e) {
      console.error(e);
      alert("분석 중 오류가 발생했습니다. 환경 변수 설정을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleData = () => {
    setCurrentData({ ...SAMPLE_DATA, id: Math.random().toString(36).substring(2, 9) });
    setView('result');
  };

  // --- 4. 조건부 렌더링 ---

  // 권한 확인 중일 때 보여줄 화면 (깜빡임 방지)
  if (isChecking) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F0F7FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A3FF] mb-4"></div>
        <p className="text-slate-500 font-medium">계정 권한 확인 중...</p>
      </div>
    );
  }

  // 로그인이 안 되어 있거나 미승인 상태일 때
  if (!session) {
    return <LoginPage />;
  }

  // 로그인 및 승인 완료 시 보여줄 메인 서비스 화면
  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#333] font-sans selection:bg-sky-100 selection:text-sky-900">
      <Header view={view} setView={setView} />
      
      <main className="w-full">
        {view === 'input' && (
          <InputForm 
            onAnalyze={handleAnalyze} 
            onSampleData={handleSampleData} 
            isLoading={isLoading} 
          />
        )}
        
        {view === 'result' && currentData && (
          <ResultView 
            data={currentData} 
            onUpdate={setCurrentData} 
            onSave={() => saveToHistory(currentData)} 
          />
        )}

        {view === 'history' && (
          <HistoryView 
            history={history} 
            onSelect={(data) => {
              setCurrentData(data);
              setView('result');
            }} 
          />
        )}
      </main>

      {/* 우측 하단 로그아웃 버튼 */}
      <button 
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-sm text-slate-400 text-xs px-3 py-2 rounded-full hover:bg-white hover:text-red-500 transition-all shadow-sm border border-slate-100"
      >
        <i className="fa-solid fa-right-from-bracket mr-1"></i> 로그아웃
      </button>
    </div>
  );
}
