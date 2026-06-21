import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAtom } from 'jotai';
import { sessionAtom } from '../jotai/authAtom';

const Top: React.FC = () => {
  const navigate = useNavigate();
  const [session] = useAtom(sessionAtom);

  // 初回表示処理
  useEffect(() => {
    if (session) {
      navigate('/mypage');
    }
  }, [session, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-7xl font-black ">AniTier</p>
      <span className="mt-5 space-x-5">
        <button className="bg-gray-300 h-10 w-30 rounded-lg border" onClick={() => navigate('/login')}>ログイン</button>
        <button className="bg-white h-10 w-30 rounded-lg border" onClick={() => navigate('/signup')}>新規登録</button>
      </span>
    </div>
  );
};

export default Top;

