import { useEffect } from 'react';

interface DialogProps {
  message: string;
  isOpen: boolean;
  onClose: () => void | Promise<void>;
  type?: 'alert' | 'confirm' | 'info';
  onCancel?: () => void | Promise<void>;
}

const Dialog: React.FC<DialogProps> = ({
  message,
  isOpen,
  onClose,
  type = 'alert',
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isOpen) {
        onClose();
      }
      if (e.key === 'Escape' && isOpen && onCancel) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-96 max-w-[90vw] text-center">
        <p className="text-gray-800 whitespace-normal mb-5">{message}</p>
        <div className="mt-5 flex justify-center gap-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 max-w-30 flex-1 rounded-lg font-bold transition ${
              type === 'info'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            OK
          </button>
          {type === 'confirm' && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 max-w-30 flex-1 bg-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-500 hover:text-white transition"
            >
              キャンセル
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dialog;
