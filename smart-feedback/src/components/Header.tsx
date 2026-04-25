import { ArrowLeft, History } from "lucide-react";

interface HeaderProps {
  view: 'input' | 'result' | 'history';
  setView: (view: 'input' | 'result' | 'history') => void;
}

export function Header({ view, setView }: HeaderProps) {
  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-10 px-4 sm:px-8 py-4 shadow-sm shrink-0">
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'input' ? (
            <button
              onClick={() => setView('input')}
              className="p-2 -ml-2 text-gray-400 hover:text-sky-600 transition-colors"
              aria-label="뒤로 가기"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-sky-600 leading-tight">스마트 학부모 피드백 리포트</h1>
            <p className="text-xs text-gray-400 font-medium hidden sm:block">AI 기반 개인별 맞춤 학습 분석 서비스</p>
          </div>
        </div>
        
        {view === 'input' && (
          <div className="flex gap-2 items-center">
            <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-600 rounded-full border border-sky-100">해법수학 가맹점 전용</span>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100 rounded-full hover:bg-sky-100 transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">과거 기록</span>
            </button>
            <div className="hidden sm:block w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
          </div>
        )}
      </div>
    </header>
  );
}
