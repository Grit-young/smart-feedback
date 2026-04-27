'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase'; // 경로 주의 (src/lib/supabase.ts 기준)

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('가입 확인 이메일을 확인해주세요!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      // 🌟 router.push('/') 코드를 삭제했습니다. 
      // Supabase 세션이 바뀌면 App.tsx가 알아서 메인 화면을 보여줍니다.
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">스마트 학부모 피드백 리포트</h1>
          <p className="text-gray-500 mt-2">{isSignUp ? '새로운 계정 만들기' : '서비스 이용을 위해 로그인하세요'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F26522] text-white p-3 rounded-xl font-bold hover:bg-[#d9561c] transition shadow-lg disabled:opacity-50"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-500 hover:underline text-sm"
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 계정이 없으신가요? 회원가입'}
          </button>
        </div>
      </div>
    </div>
  );
}
