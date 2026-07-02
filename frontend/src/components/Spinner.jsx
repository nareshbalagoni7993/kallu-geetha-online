export default function Spinner({ size = 'md', text = '' }) {
  const imgSize = { sm: 48, md: 72, lg: 100 }[size];
  const ring    = imgSize + 24;

  return (
    <div className="flex flex-col justify-center items-center py-10 gap-3 select-none">
      <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>

        {/* Spinning green arc ring */}
        <svg
          className="animate-spin absolute inset-0"
          viewBox="0 0 100 100"
          style={{ width: ring, height: ring, animationDuration: '1.2s' }}
        >
          <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="6" fill="none" />
          <circle
            cx="50" cy="50" r="45"
            stroke="#2d7a2d" strokeWidth="6" fill="none"
            strokeDasharray="80 202" strokeLinecap="round" strokeDashoffset="20"
          />
        </svg>

        {/* Palm tree image in centre */}
        <div
          className="rounded-full overflow-hidden border-2 border-white shadow-md"
          style={{ width: imgSize, height: imgSize }}
        >
          <img
            src="/palm-tree.jpg"
            alt="Loading"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <p className="text-sm text-gray-400 font-medium">{text || 'Loading...'}</p>
    </div>
  );
}
