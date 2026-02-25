import React from 'react';
import { Delete, Check } from 'lucide-react';

interface KeypadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled?: boolean;
}

const Keypad: React.FC<KeypadProps> = ({ onInput, onDelete, onSubmit, disabled }) => {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '0'];

  return (
    <div className="w-full max-w-xs md:max-w-sm">
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => onInput(btn)}
            disabled={disabled}
            className="bg-white hover:bg-indigo-50 active:bg-indigo-100 text-indigo-600 font-bold text-2xl md:text-3xl p-3 md:p-4 rounded-xl shadow-sm border-b-4 border-indigo-100 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 touch-manipulation"
          >
            {btn}
          </button>
        ))}
        <button
          onClick={onDelete}
          disabled={disabled}
          className="bg-red-50 hover:bg-red-100 text-red-500 font-bold p-3 md:p-4 rounded-xl shadow-sm border-b-4 border-red-100 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center touch-manipulation"
        >
          <Delete size={28} />
        </button>
        
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="col-span-3 bg-green-500 hover:bg-green-600 text-white font-bold text-xl md:text-2xl p-3 md:p-4 rounded-xl shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-1 touch-manipulation"
        >
          提交答案 <Check size={28} />
        </button>
      </div>
    </div>
  );
};

export default Keypad;