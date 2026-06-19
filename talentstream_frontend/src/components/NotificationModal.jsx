import React from 'react';

export default function NotificationModal({ isOpen, type = 'error', title, message, onClose }) {
  if (!isOpen) return null;

  const isError = type === 'error';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center transform transition-all scale-100">
        
        <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${
          isError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {isError ? (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

        <button
          onClick={onClose}
          className={`w-full font-semibold text-sm py-2.5 px-4 rounded-xl shadow-xs transition ${
            isError 
              ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-4 focus:ring-red-100' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-4 focus:ring-indigo-100'
          }`}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}