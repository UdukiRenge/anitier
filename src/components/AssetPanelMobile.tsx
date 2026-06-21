import { AssetPanel } from './AssetPanel';

type AssetPanelMobileProps = {
  isOpen: boolean;
  toggle: () => void;
};

export const AssetPanelMobile = ({ isOpen, toggle }: AssetPanelMobileProps) => {
  return (
    <div
      className="
        lg:hidden fixed bottom-0 left-0 right-0
        bg-white rounded-t-2xl shadow-2xl z-50
        overflow-hidden
      "
      style={{
        height: isOpen ? '40vh' : '12vh',
        transition: 'height 0.3s ease',
      }}
    >
      {/* ハンドル */}
      <div
        className="h-1.5 w-12 bg-gray-300 rounded-full mx-auto my-2 cursor-pointer"
        onClick={toggle}
      />

      {/* 中身 */}
      <div className="h-full overflow-y-auto px-4 pb-20">
        <AssetPanel />
      </div>
    </div>
  );
};
