export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[400px]">
        {children}
        <button className="mt-4 text-red-500" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
