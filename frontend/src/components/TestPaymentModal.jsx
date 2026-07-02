import { useState, useEffect } from 'react';
import API from '../api/axios';

/* ─── Shared UI pieces ─────────────────────────────────────── */
const Field = ({ label, value, onChange, placeholder, maxLength, readOnly }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>
    <input
      className={`w-full px-3 py-2.5 rounded-xl border-2 text-sm font-mono transition-colors focus:outline-none ${
        readOnly ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-default' : 'border-gray-200 focus:border-blue-400 bg-white text-gray-800'
      }`}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
    />
  </div>
);

/* ─── Processing overlay ───────────────────────────────────── */
function Processing({ method }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-16 h-16">
        <svg className="animate-spin w-16 h-16" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="5" fill="none" />
          <circle cx="32" cy="32" r="28"
            stroke={method === 'online' ? '#2563eb' : '#7c3aed'}
            strokeWidth="5" fill="none"
            strokeDasharray="60 120" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {method === 'online' ? '💳' : '📱'}
        </div>
      </div>
      <p className="text-gray-600 font-semibold text-sm">Processing payment…</p>
      <p className="text-gray-400 text-xs">Please do not close this window</p>
    </div>
  );
}

/* ─── Success overlay ──────────────────────────────────────── */
function Success({ amount, method }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xl font-bold text-gray-800">Payment Successful!</p>
        <p className="text-3xl font-extrabold text-green-600 mt-1">₹{amount}</p>
        <p className="text-xs text-gray-400 mt-2">
          {method === 'online' ? 'Paid via Razorpay (Test)' : 'Paid via PhonePe (Test)'}
        </p>
      </div>
      <p className="text-xs text-gray-400 animate-pulse">Redirecting to your order…</p>
    </div>
  );
}

/* ─── Razorpay card form ───────────────────────────────────── */
function RazorpayForm({ amount, onPay, onCancel }) {
  const [card, setCard] = useState({
    number: '4111 1111 1111 1111',
    expiry: '12/27',
    cvv:    '123',
    name:   'Test User',
  });
  const set = (k) => (v) => setCard((c) => ({ ...c, [k]: v }));

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp  = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  };

  return (
    <div className="space-y-4">
      {/* Test badge */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
        <span className="text-xs">🔬</span>
        <p className="text-xs text-blue-600 font-medium">Test Mode — pre-filled with test card</p>
      </div>

      {/* Card visual */}
      <div className="rounded-2xl p-4 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e40af, #1d4ed8, #2563eb)' }}>
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
        <p className="text-xs text-blue-200 mb-3 font-medium tracking-widest">DEBIT / CREDIT CARD</p>
        <p className="text-lg font-mono tracking-widest mb-4">{card.number || '•••• •••• •••• ••••'}</p>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-blue-200">CARD HOLDER</p>
            <p className="font-semibold text-sm">{card.name || 'YOUR NAME'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">EXPIRES</p>
            <p className="font-semibold text-sm">{card.expiry || 'MM/YY'}</p>
          </div>
          <div className="text-2xl">💳</div>
        </div>
      </div>

      {/* Inputs */}
      <Field label="Card Number" value={card.number}
        onChange={(v) => set('number')(fmtCard(v))} placeholder="1234 5678 9012 3456" maxLength={19} />
      <Field label="Name on Card" value={card.name}
        onChange={set('name')} placeholder="Your Name" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Expiry (MM/YY)" value={card.expiry}
          onChange={(v) => set('expiry')(fmtExp(v))} placeholder="MM/YY" maxLength={5} />
        <Field label="CVV" value={card.cvv}
          onChange={set('cvv')} placeholder="123" maxLength={4} />
      </div>

      {/* Buttons */}
      <div className="pt-2 space-y-2">
        <button onClick={onPay}
          className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}>
          Pay ₹{amount} Securely
        </button>
        <button onClick={onCancel}
          className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── PhonePe UPI form ─────────────────────────────────────── */
function PhonePeForm({ amount, onPay, onCancel }) {
  const [upi, setUpi]       = useState('success@razorpay');
  const [method, setMethod] = useState('upi'); // upi | qr

  return (
    <div className="space-y-4">
      {/* Test badge */}
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2">
        <span className="text-xs">🔬</span>
        <p className="text-xs text-purple-600 font-medium">PhonePe Test Mode — use any UPI ID</p>
      </div>

      {/* PhonePe header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">📱</div>
        <div>
          <p className="font-bold text-sm">PhonePe</p>
          <p className="text-purple-200 text-xs">India's #1 Payment App</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-purple-200">Pay</p>
          <p className="font-bold">₹{amount}</p>
        </div>
      </div>

      {/* Method tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[{ id: 'upi', label: '🔗 UPI ID' }, { id: 'qr', label: '📷 QR Code' }].map((t) => (
          <button key={t.id} onClick={() => setMethod(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${method === t.id ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {method === 'upi' ? (
        <div className="space-y-3">
          <Field label="UPI ID / VPA" value={upi}
            onChange={setUpi} placeholder="yourname@upi" />
          <p className="text-xs text-gray-400 text-center">
            Test UPI: <strong className="text-purple-600">success@razorpay</strong> (always succeeds)
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-36 h-36 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-400">
              <p className="text-5xl mb-1">📷</p>
              <p className="text-xs">Test QR Code</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center">Open PhonePe app → Scan QR<br />(Test mode: QR is simulated)</p>
        </div>
      )}

      {/* Buttons */}
      <div className="pt-1 space-y-2">
        <button onClick={onPay}
          className="w-full py-3.5 rounded-xl font-bold text-white text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
          {method === 'upi' ? `Verify & Pay ₹${amount}` : `Paid via QR — Confirm ₹${amount}`}
        </button>
        <button onClick={onCancel}
          className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Main Modal ───────────────────────────────────────────── */
export default function TestPaymentModal({ method, amount, orderId, onCancel, onSuccess }) {
  const [step, setStep] = useState('form'); // form | processing | success

  // Auto-redirect after success animation
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(onSuccess, 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handlePay = async () => {
    setStep('processing');
    try {
      await new Promise((r) => setTimeout(r, 2000));
      await API.post('/payment/test/confirm', { orderId, method });
      setStep('success');
    } catch {
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[96dvh] flex flex-col">

        {/* Gateway Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            {method === 'online' ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs tracking-tight shadow">R</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Razorpay</p>
                  <p className="text-xs text-gray-400">Test Mode</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white text-xl shadow">📱</div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">PhonePe</p>
                  <p className="text-xs text-gray-400">Test Mode</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full font-semibold border border-green-200">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step === 'form' && method === 'online' && (
            <RazorpayForm amount={amount} onPay={handlePay} onCancel={onCancel} />
          )}
          {step === 'form' && method === 'phonepe' && (
            <PhonePeForm amount={amount} onPay={handlePay} onCancel={onCancel} />
          )}
          {step === 'processing' && <Processing method={method} />}
          {step === 'success'    && <Success amount={amount} method={method} />}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-center gap-1.5 bg-gray-50 flex-shrink-0">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-400">256-bit SSL encrypted · Test environment</p>
        </div>
      </div>
    </div>
  );
}
