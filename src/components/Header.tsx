import { useNavigate } from 'react-router-dom';

import { BiBarChartAlt2 } from "react-icons/bi";
import { IoSearch } from "react-icons/io5";
import { IoMenuSharp } from "react-icons/io5";
import { RiAccountCircleFill } from "react-icons/ri";

import { useAtom } from 'jotai';
import { sessionAtom } from '../jotai/authAtom';
import { isSideAtom } from '../jotai/sideAtom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const [sideOpen, setSideOpen] = useAtom(isSideAtom);
  const [session] = useAtom(sessionAtom);

  const HeaderButton = () => {
    return (
      <div className="flex flex-row gap-3 md:gap-5 text-white text-4xl">
        <button
          onClick={() => navigate('/tierlist')}
        >
          <BiBarChartAlt2 />
        </button>
        <button
          onClick={() => navigate('/search')}
        >
          <IoSearch />
        </button>
        <button
          onClick={() => navigate('/mypage')}
        >
          <RiAccountCircleFill />
        </button>
        <button
          onClick={() => setSideOpen(!sideOpen)}
        >
          <IoMenuSharp />
        </button>
      </div>
    );
  }

  
  return (
    <header className="fixed top-0 left-0 w-full h-14 flex items-center bg-blue-400">
      <h1 className="ml-5 text-white text-4xl font-black">AniTier</h1>
      <div className="fixed top-3 right-5 md:right-10">
        {session && <HeaderButton />}
      </div>
    </header>
  );
};

export default Header;