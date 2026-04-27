'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. 현재 사용자 세션 확인
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // 로그인 안 되어 있으면 로그인 페이지로 강제 이동
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  // 유저 정보가 로딩 중일 때 잠깐 보여줄 화면
  if (!user) return <div className="h-screen flex items-center justify-center">로딩 중...</div>;

  return (
    // ... 기존 강사님의 원래 페이지 코드 ...
  );
}
