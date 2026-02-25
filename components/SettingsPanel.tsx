import React from 'react';
import { AppSettings, Operation, RangeSettings } from '../types';
import { Settings, CheckSquare, Square, X, Calculator, Hash } from 'lucide-react';

interface Props {
  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, updateSettings, onClose }) => {
  
  const toggleOp = (op: Operation) => {
    const current = settings.operations;
    const isSelected = current.includes(op);
    let newOps = isSelected ? current.filter(o => o !== op) : [...current, op];
    if (newOps.length === 0) newOps = [Operation.ADD]; // Prevent empty
    updateSettings({ ...settings, operations: newOps });
  };

  const updateRange = (op: Operation, type: 'min' | 'max', value: number) => {
    let key: keyof AppSettings;
    switch (op) {
        case Operation.ADD: key = 'addRange'; break;
        case Operation.SUBTRACT: key = 'subRange'; break;
        case Operation.MULTIPLY: key = 'mulRange'; break;
        case Operation.DIVIDE: key = 'divRange'; break;
        default: return;
    }
    
    const currentRange = settings[key] as RangeSettings;
    const newRange = { ...currentRange, [type]: value };
    
    // Simple validation constraint
    if (type === 'min' && value > currentRange.max) newRange.max = value;
    if (type === 'max' && value < currentRange.min) newRange.min = value;

    updateSettings({ ...settings, [key]: newRange });
  };

  const renderRangeConfig = (op: Operation, label: string, description: string) => {
      // Only show if operation is enabled
      if (!settings.operations.includes(op)) return null;

      let range: RangeSettings;
      switch (op) {
          case Operation.ADD: range = settings.addRange; break;
          case Operation.SUBTRACT: range = settings.subRange; break;
          case Operation.MULTIPLY: range = settings.mulRange; break;
          case Operation.DIVIDE: range = settings.divRange; break;
          default: return null;
      }
      
      // Determine max scale for sliders based on operation type
      const sliderMax = (op === Operation.MULTIPLY || op === Operation.DIVIDE) ? 20 : 100;

      return (
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-fade-in">
            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                <Hash size={18} />
                <span>{label}</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{description}</p>
            
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                        <span>最小值: {range.min}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max={sliderMax}
                        value={range.min} 
                        onChange={(e) => updateRange(op, 'min', parseInt(e.target.value))}
                        className="w-full h-2 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                    />
                </div>
                <div>
                    <div className="flex justify-between text-xs font-medium text-indigo-600 mb-1">
                        <span>最大值: {range.max}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max={sliderMax}
                        value={range.max} 
                        onChange={(e) => updateRange(op, 'max', parseInt(e.target.value))}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
            </div>
        </div>
      );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} /> 家长中心
          </h2>
          <button onClick={onClose} className="hover:bg-indigo-700 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          
          {/* Operations Selection */}
          <section>
            <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
                <Calculator size={20} className="text-indigo-500"/> 运算类型
            </h3>
            <div className="flex gap-3 justify-between">
              {[Operation.ADD, Operation.SUBTRACT, Operation.MULTIPLY, Operation.DIVIDE].map(op => {
                const active = settings.operations.includes(op);
                return (
                  <button
                    key={op}
                    onClick={() => toggleOp(op)}
                    className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all ${
                      active 
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 shadow-sm' 
                        : 'bg-white border-gray-100 text-gray-300'
                    }`}
                  >
                    {op === Operation.ADD && '+'}
                    {op === Operation.SUBTRACT && '−'}
                    {op === Operation.MULTIPLY && '×'}
                    {op === Operation.DIVIDE && '÷'}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Dynamic Range Settings */}
          <section className="space-y-4">
            <h3 className="text-gray-800 font-bold flex items-center gap-2">
                <Settings size={20} className="text-indigo-500"/> 难度规则
            </h3>
            
            {renderRangeConfig(Operation.ADD, "加法范围", "设置“和”的最大值 (如：20以内加法)")}
            {renderRangeConfig(Operation.SUBTRACT, "减法范围", "设置“被减数”的最大值 (如：20以内减法)")}
            {renderRangeConfig(Operation.MULTIPLY, "乘法范围", "设置乘数的大小 (如：2到9)")}
            {renderRangeConfig(Operation.DIVIDE, "除法范围", "设置除数和商的大小 (如：2到9)")}
            
            {settings.operations.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">请先选择一种运算类型</p>
            )}
          </section>

          {/* Common Toggles */}
          <section className="space-y-3">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-800 font-bold">其他选项</h3>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">每次 {settings.problemCount} 题</span>
             </div>

            <input 
              type="range" 
              min="5" 
              max="50" 
              step="5"
              value={settings.problemCount} 
              onChange={(e) => updateSettings({...settings, problemCount: parseInt(e.target.value)})}
              className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-4"
            />
            
            <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                <button 
                    onClick={() => updateSettings({...settings, numberCount: settings.numberCount === 2 ? 3 : 2})}
                    className={`transition-colors ${settings.numberCount === 3 ? 'text-indigo-600' : 'text-gray-300'}`}
                >
                    {settings.numberCount === 3 ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>
                <div>
                    <span className="block font-medium text-gray-700 text-sm">3个数混合运算</span>
                </div>
                </label>

                {settings.numberCount === 3 && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ml-6">
                    <button 
                        onClick={() => updateSettings({...settings, allowParentheses: !settings.allowParentheses})}
                        className={`transition-colors ${settings.allowParentheses ? 'text-indigo-600' : 'text-gray-300'}`}
                    >
                        {settings.allowParentheses ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <div>
                        <span className="block font-medium text-gray-700 text-sm">允许使用括号</span>
                    </div>
                    </label>
                )}

                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                <button 
                    onClick={() => updateSettings({...settings, allowRegrouping: !settings.allowRegrouping})}
                    className={`transition-colors ${settings.allowRegrouping ? 'text-indigo-600' : 'text-gray-300'}`}
                >
                    {settings.allowRegrouping ? <CheckSquare size={24} /> : <Square size={24} />}
                </button>
                <div>
                    <span className="block font-medium text-gray-700 text-sm">允许进位/借位</span>
                </div>
                </label>

                {settings.operations.includes(Operation.SUBTRACT) && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-all">
                    <button 
                        onClick={() => updateSettings({...settings, allowNegatives: !settings.allowNegatives})}
                        className={`transition-colors ${settings.allowNegatives ? 'text-indigo-600' : 'text-gray-300'}`}
                    >
                        {settings.allowNegatives ? <CheckSquare size={24} /> : <Square size={24} />}
                    </button>
                    <div>
                        <span className="block font-medium text-gray-700 text-sm">允许负数结果</span>
                    </div>
                    </label>
                )}
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-transform active:scale-95"
          >
            完成设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;