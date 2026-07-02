export default function ConfirmModal({ title, message, confirmLabel = 'Confirm', confirmColor = 'red', onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">
        {/* Top accent */}
        <div className={`h-1.5 w-full ${confirmColor === 'red' ? 'bg-gradient-to-r from-red-400 to-rose-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`} />

        <div className="p-6">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 ${confirmColor === 'red' ? 'bg-red-50' : 'bg-amber-50'}`}>
            {confirmColor === 'red' ? '🗑️' : '⚠️'}
          </div>

          <h3 className="text-lg font-bold text-gray-800 text-center mb-2">{title}</h3>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">{message}</p>

          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50">
              No, Keep It
            </button>
            <button onClick={onConfirm} disabled={loading}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 ${
                confirmColor === 'red'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}>
              {loading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modalIn 0.2s cubic-bezier(0.34,1.56,0.64,1); }
      `}</style>
    </div>
  );
}
