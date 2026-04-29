import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-2 py-4 sm:items-center sm:px-4">
        <div
          className="fixed inset-0 bg-black opacity-30"
          onClick={onClose}
        ></div>
        <div className="relative w-full max-w-[95vw] overflow-hidden rounded-lg bg-white shadow-xl sm:max-w-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
