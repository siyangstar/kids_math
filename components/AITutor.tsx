import React, { useState } from 'react';
import { MathProblem } from '../types';
import { getMathExplanation } from '../services/geminiService';
import { Sparkles, X, Brain } from 'lucide-react';

interface Props {
  problem: MathProblem;
}

const AITutor: React.FC<Props> = ({ problem }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleAsk = async () => {
    setIsOpen(true);
    if (!explanation) {
      setLoading(true);
      const text = await getMathExplanation(problem);
      setExplanation(text);
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleAsk}
        className="flex items-center gap-2 text-sm font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full transition-colors"
      >
        <Sparkles size={16} /> 需要提示吗？
      </button>
    );
  }

  return (
    <div className="relative bg-white border-2 border-purple-200 rounded-2xl p-4 shadow-lg w-full max-w-sm mx-auto mt-4 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-purple-700 font-bold flex items-center gap-2">
           <Brain size={20} /> 猫头鹰教授说：
        </h4>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      
      <div className="text-gray-700 text-sm leading-relaxed">
        {loading ? (
           <div className="flex gap-2 items-center justify-center py-4 text-gray-500">
             <span className="animate-bounce">●</span>
             <span className="animate-bounce delay-100">●</span>
             <span className="animate-bounce delay-200">●</span>
           </div>
        ) : (
          explanation
        )}
      </div>
    </div>
  );
};

export default AITutor;