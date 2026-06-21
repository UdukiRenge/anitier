import { useAtom } from 'jotai';
import { spinnerAtom } from '../jotai/spinnerAtom';

const GlobalSpinner = () => {
  const [isSpinning] = useAtom(spinnerAtom);

  if (!isSpinning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-spin h-10 w-10 rounded-full border-4 border-white border-t-transparent" />
    </div>
  );
};

export default GlobalSpinner;