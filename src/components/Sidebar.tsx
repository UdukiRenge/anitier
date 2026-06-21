import { useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { isSideAtom } from '../jotai/sideAtom';
import { logout } from '../supabase/logout';
import useDialog from '../hooks/useDialog';
import Dialog from './Dialog';
import { MESSAGE } from '../constants/message';
import { spinnerAtom } from '../jotai/spinnerAtom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate(); 

  const [isSideOpen, setIsSideOpen] = useAtom(isSideAtom);
  const dialog = useDialog();

  const setSpinner = useSetAtom(spinnerAtom);

  if (!isSideOpen) return null;

  const navigateClose = async (path: string) => {
    if (path === "/") {
      try {
        setSpinner(true);
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
        dialog.showDialog(MESSAGE.error.LOGOUT_ERROR);
        return;
      } finally {
        setSpinner(false);
      }
    }

    navigate(path);
    setIsSideOpen(false);
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed top-14 right-0 bottom-0 left-0 bg-black/30 z-40"
        onClick={() => setIsSideOpen(!isSideOpen)}
      />

      {/* Sidebar */}
      <aside className="fixed right-0 top-14 h-full w-64 bg-white shadow-lg z-50">
        <nav className="p-2">
          <Dialog
            message={dialog.message}
            isOpen={dialog.isOpen}
            onClose={dialog.closeDialog}
            type={dialog.type}
            onCancel={dialog.closeCancel}
          />
          <SidebarItem label="アカウント" click={() => navigateClose("/acount")}/>
          {/* <SidebarItem label="リリースノート" click={() => navigateClose("/release")}/>
          <SidebarItem label="お問い合わせ" click={() => navigateClose("/contact")}/> */}
          <SidebarItem label="ログアウト" click={() => navigateClose("/")}/>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

type SidebarItemProps = {
  label: string;
  click: () => void;
};

function SidebarItem({ label, click }: SidebarItemProps) {
  return (
    <div
      className="
        gap-3
        px-4 py-3
        text-slate-700
        hover:bg-slate-100
        transition-colors
        border-b border-slate-300
        last:border-b-0
      "
      onClick={() => click()}
    >
      <span className="text-sm font-medium">
        {label}
      </span>
    </div>
  );
}