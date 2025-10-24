'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
}: ModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    info: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      icon: '💡',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
    warning: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/30',
      icon: '⚠️',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    error: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      icon: '❌',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      icon: '✅',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
  };

  const style = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`${style.bg} border-b ${style.border} p-6`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{style.icon}</span>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 whitespace-pre-line">{message}</p>
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-6 flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className={`px-6 py-3 ${style.buttonBg} text-white rounded-lg font-semibold transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
