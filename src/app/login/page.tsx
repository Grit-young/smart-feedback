'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('가입 확인 이메일을 확인해주세요!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF] font-sans px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-2xl shadow-blue-100 border border-white/50 relative overflow-hidden">
        
        {/* 상단 브랜드 데코레이션 (메인 페이지의 부드러운 감각 반영) */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#00A3FF] to-[#0066FF]"></div>

        <div className="text-center mb-10">
          {/* 로고 아이콘 재현 */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A3FF] rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <span className="text-white text-3xl font-black">S</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">
            스마트 학부모 피드백 리포트
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            AI 기반 개인별 맞춤 학습 분석 서비스
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              이메일 주소
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#00A3FF] transition-all outline-none text-slate-700 placeholder-slate-300 shadow-inner"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#00A3FF] transition-all outline-none text-slate-700 placeholder-slate-300 shadow-inner"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00A3FF] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#008CDB] transition-all shadow-xl shadow-blue-200 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                처리 중...
              </span>
            ) : (
              isSignUp ? '무료로 시작하기' : '로그인'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-400 hover:text-[#00A3FF] text-sm font-semibold transition-colors border-b border-transparent hover:border-[#00A3FF] pb-1"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
      
      {/* 하단 카피라이트 */}
      <p className="absolute bottom-8 text-slate-400 text-xs">
        © 2026 Smart Feedback Report. All rights reserved.
      </p>
    </div>
  );
}
