import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { ReportData, StudentInfo } from './types';
import { generateFeedbackReport } from './services/aiService';
import { SAMPLE_DATA } from './constants/sampleData';

// 🌟 추가된 임포트
import { supabase } from './lib/supabase';
import LoginPage from './app/login/page'; 

type ViewMode = 'input' | 'result' | 'history';

export default function App() {
  // 🌟 세션 상태 추가
  const [session, setSession] = useState<any>(null);
  
  const [view, setView] = useState<ViewMode>('input');
  const [currentData, setCurrentData] = useState<ReportData | null>(null);
  const [history, setHistory] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // App.tsx 내부의 useEffect 로직 수정
useEffect(() => {
  const checkUserStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // 🌟 로그인된 사용자의 승인 상태를 DB에서 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_approved')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_approved) {
        setSession(session); // 승인된 경우에만 세션 유지 (메인 화면 진입)
      } else {
        alert("관리자의 승인이 필요한 계정입니다. 잠시만 기다려주세요.");
        await supabase.auth.signOut(); // 미승인 사용자는 강제 로그아웃
        setSession(null);
      }
    }
  };

  checkUserStatus();
}, []);

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

  // 🌟 [핵심] 로그인 안 되어 있으면 로그인 페이지 리턴
  if (!session) {
    return <LoginPage />;
  }

  // 로그인 된 경우에만 아래 UI가 보입니다.
  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#333] font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* 로그아웃 버튼을 헤더에 넣거나 별도로 뺄 수 있습니다 */}
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

      {/* 테스트용 로그아웃 버튼 (나중에 헤더로 옮기세요) */}
      <button 
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-4 right-4 bg-white/50 text-xs p-1 rounded hover:bg-white"
      >
        로그아웃
      </button>
    </div>
  );
}
