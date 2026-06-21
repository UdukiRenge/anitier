import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
// import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import GlobalSpinner from './components/Spinner';

// 認可なしの画面
import Top from './pages/Top';
import Login from './pages/Login'; 
import Signup from './pages/Signup';
// import Contact from './pages/Contact';
// import Release from './pages/Release';

// 認可ありの画面
import Mypage from './pages/Mypage';
import Search from './pages/Search';
import Acount from './pages/Acount';
import TierList from './pages/TierList';
import TierEditer from './pages/TierEditer';

import { useSetAtom } from 'jotai';
import { sessionAtom } from './jotai/authAtom';
import { supabase } from './supabase/supabaseClient';


function App() {
  const setSession = useSetAtom(sessionAtom);

  useEffect(() => {
      // 初期セッション取得
      supabase.auth.getSession().then(({ data }) => {
        setSession(data.session);
      });

      // ログイン状態の監視
      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

      return () => {
        listener.subscription.unsubscribe();
      };
  }, []);

  return (
    <Router>
      <Header />
      <Sidebar />
      {/* <Footer /> */}
      <GlobalSpinner />
      <Routes>
        {/*ログイン前の画面*/}
        <Route path="/" element={<Top />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/contact" element={<Contact />} />
        <Route path="/release" element={<Release />} /> */}
        {/*ログイン後の画面*/}
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/acount" element={<Acount />} />
        <Route path="/tierlist" element={<TierList />} />
        <Route path="/tierediter/new" element={<TierEditer />} />
        <Route path="/tierediter/:tier_id" element={<TierEditer />} />
      </Routes>
    </Router>
  )
}

export default App