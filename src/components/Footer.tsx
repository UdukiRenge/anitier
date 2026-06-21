import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="fixed bottom-0 left-0 w-full h-14 z-10 bg-gray-700 text-white flex items-center justify-center shadow-lg">
      <span className="flex gap-10">
        <button className="" onClick={() => navigate('/contact')}>お問い合わせ</button>
        <button className="" onClick={() => navigate('/release')}>リリースノート</button>
      </span>
    </footer>
  );
};

export default Footer;