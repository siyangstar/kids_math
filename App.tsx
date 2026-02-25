import React, { useState, useEffect, useCallback } from 'react';
import { MathProblem, AppSettings, UserStats, ViewState } from './types';
import { DEFAULT_SETTINGS, OPERATOR_SYMBOLS, BADGES } from './constants';
import { generateProblem } from './services/mathGenerator';
import Keypad from './components/Keypad';
import SettingsPanel from './components/SettingsPanel';
import { Settings, Award, Home, Trophy, RefreshCcw, Star, CheckCircle, XCircle, RotateCcw, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCAL_PRAISE = ["太棒了！", "真聪明！", "继续保持！", "你真厉害！", "给你一颗小星星！", "算得真快！"];
const LOCAL_ENCOURAGE = ["没关系，再试一次！", "失败是成功之母。", "加油，你能行！", "仔细看一看，哪里算错了？", "再想一想！"];

const App: React.FC = () => {
  // --- State ---
  const [view, setView] = useState<ViewState>('HOME');
  
  // Safe Settings Initialization with Migration Logic
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedStr = localStorage.getItem('math_genius_settings');
      if (savedStr) {
          return JSON.parse(savedStr);
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [input, setInput] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Session State
  const [sessionHistory, setSessionHistory] = useState<MathProblem[]>([]);
  
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem('math_genius_stats');
      return saved ? JSON.parse(saved) : { streak: 0, totalCorrect: 0, problemsSolved: 0, badges: [] };
    } catch (e) {
      return { streak: 0, totalCorrect: 0, problemsSolved: 0, badges: [] };
    }
  });

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('math_genius_stats', JSON.stringify(stats));
  }, [stats]);
  
  useEffect(() => {
    localStorage.setItem('math_genius_settings', JSON.stringify(settings));
  }, [settings]);

  const checkBadges = useCallback((newStats: UserStats) => {
    const earnedBadges = [...newStats.badges];
    let newBadgeEarned = false;

    BADGES.forEach(badge => {
      if (!earnedBadges.includes(badge.id) && newStats.totalCorrect >= badge.limit) {
        earnedBadges.push(badge.id);
        newBadgeEarned = true;
      }
    });

    if (newBadgeEarned) {
      setStats(prev => ({ ...prev, badges: earnedBadges }));
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, []);

  // --- Actions ---
  const startQuiz = () => {
    setSessionHistory([]);
    nextProblem();
    setView('QUIZ');
  };

  const nextProblem = () => {
    const newProblem = generateProblem(settings);
    setProblem(newProblem);
    setInput('');
  };

  const finishSession = (history: MathProblem[]) => {
     setProblem(null);
     setView('SUMMARY');
     // Small celebration if score is good
     const correctCount = history.filter(p => p.isCorrect).length;
     if (correctCount === history.length && history.length > 0) {
         confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
     }
  };

  const handleInput = (val: string) => {
    if (input.length < 5) setInput(prev => prev + val);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (!problem || !input) return;

    const val = parseInt(input);
    const correct = val === problem.answer;
    
    // Record Result
    const resultProblem: MathProblem = {
        ...problem,
        userAnswer: val,
        isCorrect: correct
    };
    
    // Update local session history immediately
    const updatedHistory = [...sessionHistory, resultProblem];
    setSessionHistory(updatedHistory);

    if (correct) {
      const newStats = {
        ...stats,
        streak: stats.streak + 1,
        totalCorrect: stats.totalCorrect + 1,
        problemsSolved: stats.problemsSolved + 1,
      };
      setStats(newStats);
      checkBadges(newStats);
    } else {
      setStats(prev => ({ ...prev, streak: 0, problemsSolved: prev.problemsSolved + 1 }));
    }

    if (updatedHistory.length >= settings.problemCount) {
        finishSession(updatedHistory);
    } else {
        nextProblem();
    }
  };

  const confirmResetData = () => {
    const resetStats = { streak: 0, totalCorrect: 0, problemsSolved: 0, badges: [] };
    setStats(resetStats);
    localStorage.setItem('math_genius_stats', JSON.stringify(resetStats));
    setShowResetConfirm(false);
  };

  // --- Render Helpers ---

  const renderProblemExpression = (p: MathProblem, isSummary: boolean = false) => {
    if (p.num3 !== undefined && p.operation2) {
        if (p.parentheses === 'left') {
            return (
                <>
                    <span>
                        <span className={isSummary ? "" : "text-gray-400"}>(</span>
                        {p.num1}
                    </span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation]}</span>
                    <span>
                        {p.num2}
                        <span className={isSummary ? "" : "text-gray-400"}>)</span>
                    </span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation2]}</span>
                    <span>{p.num3}</span>
                </>
            );
        } else if (p.parentheses === 'right') {
            return (
                <>
                    <span>{p.num1}</span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation]}</span>
                    <span>
                        <span className={isSummary ? "" : "text-gray-400"}>(</span>
                        {p.num2}
                    </span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation2]}</span>
                    <span>
                        {p.num3}
                        <span className={isSummary ? "" : "text-gray-400"}>)</span>
                    </span>
                </>
            );
        } else {
            return (
                <>
                    <span>{p.num1}</span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation]}</span>
                    <span>{p.num2}</span>
                    <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation2]}</span>
                    <span>{p.num3}</span>
                </>
            );
        }
    }
    
    return (
        <>
            <span>{p.num1}</span>
            <span className={isSummary ? "" : "text-indigo-500"}>{OPERATOR_SYMBOLS[p.operation]}</span>
            <span>{p.num2}</span>
        </>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col landscape:flex-row items-center justify-center min-h-[100dvh] gap-8 p-4 landscape:gap-12">
      <div className="text-center space-y-4 landscape:text-left flex flex-col items-center landscape:items-start max-w-sm landscape:max-w-md w-full">
        <div className="animate-bounce-slow">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-600 tracking-tight drop-shadow-sm">
            数学小天才
          </h1>
          <p className="text-xl text-indigo-400 font-medium mt-2">准备好成为大师了吗？</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl w-full border border-indigo-50 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-bold uppercase text-xs tracking-wider">你的战绩</span>
            <Trophy className="text-yellow-500" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-orange-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-orange-500">{stats.streak}</div>
              <div className="text-xs text-orange-400 font-bold uppercase">连对</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-2xl">
              <div className="text-3xl font-bold text-blue-500">{stats.totalCorrect}</div>
              <div className="text-xs text-blue-400 font-bold uppercase">已解决</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        <button
          onClick={startQuiz}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-2xl font-bold py-5 rounded-2xl shadow-lg shadow-indigo-200 transform hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          开始挑战 ({settings.problemCount}题)
        </button>

        <div className="flex gap-4 w-full justify-center">
          <button 
            onClick={() => setView('SETTINGS')} 
            className="flex-1 bg-white p-4 rounded-2xl shadow-md text-gray-500 hover:text-indigo-600 transition-colors flex flex-col items-center gap-1"
          >
            <Settings size={24} />
            <span className="text-xs font-bold">设置</span>
          </button>
          <button 
            onClick={() => setView('REWARDS')} 
            className="flex-1 bg-white p-4 rounded-2xl shadow-md text-gray-500 hover:text-indigo-600 transition-colors flex flex-col items-center gap-1"
          >
            <Award size={24} />
            <span className="text-xs font-bold">荣誉</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderQuiz = () => (
    // Main Container: Locks height to viewport to prevent scrolling
    <div className="h-[100dvh] w-full flex flex-col p-4 overflow-hidden bg-sky-50">
      
      {/* Header (Top Bar) */}
      <div className="w-full flex justify-between items-center mb-2 shrink-0 max-w-5xl mx-auto">
        <button onClick={() => setView('HOME')} className="bg-white/80 p-2 rounded-full shadow-sm text-gray-400 hover:text-indigo-600 transition-colors backdrop-blur-sm z-20">
          <Home size={24} />
        </button>
      </div>

      {/* Content Area: Centered, max-width constrained to keep elements close */}
      <div className="flex-1 flex flex-col landscape:flex-row items-center justify-center w-full max-w-4xl mx-auto gap-4 landscape:gap-8 min-h-0">
        
        {/* Left Side: Problem Display & Progress */}
        <div className="w-full max-w-md flex flex-col justify-center landscape:items-end">
            
            {/* Progress Bar (Mobile: Top, Landscape: Above Card) */}
            <div className="flex flex-col items-center w-full mb-4 px-8 landscape:px-0">
                <div className="w-full flex justify-between text-xs font-bold text-indigo-400 mb-1">
                    <span>进度</span>
                    <span>{sessionHistory.length + 1} / {settings.problemCount}</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-indigo-50">
                    <div 
                    className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${((sessionHistory.length) / settings.problemCount) * 100}%` }}
                    ></div>
                </div>
            </div>

            {problem && (
                <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border-b-8 border-indigo-100 relative overflow-hidden w-full">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                    
                    <div className={`flex justify-center items-center flex-wrap ${problem.num3 !== undefined ? 'gap-1 sm:gap-2 text-3xl sm:text-4xl md:text-5xl' : 'gap-2 md:gap-4 text-5xl md:text-7xl'} font-bold text-gray-700 mb-6 font-mono py-4`}>
                        {renderProblemExpression(problem)}
                        <span>=</span>
                        <span className={`min-w-[50px] md:min-w-[80px] text-center border-b-4 ${input ? 'text-indigo-600 border-indigo-600' : 'text-gray-300 border-gray-200'}`}>
                            {input || '?'}
                        </span>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Keypad */}
        <div className="w-full max-w-xs landscape:max-w-sm flex items-center justify-center landscape:justify-start">
             <Keypad 
                onInput={handleInput} 
                onDelete={handleDelete} 
                onSubmit={handleSubmit}
            />
        </div>

      </div>
    </div>
  );

  const renderSummary = () => {
    const total = sessionHistory.length;
    const correct = sessionHistory.filter(p => p.isCorrect).length;
    const incorrectProblems = sessionHistory.filter(p => !p.isCorrect);
    
    return (
        <div className="h-[100dvh] flex flex-col items-center w-full pt-4 px-4 pb-4 overflow-hidden bg-sky-50">
            <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-4 shrink-0">练习完成！</h2>
            
            <div className="w-full max-w-4xl flex flex-col landscape:flex-row gap-6 overflow-hidden flex-1 items-center landscape:items-stretch landscape:justify-center">
                
                {/* Score Card Section */}
                <div className="w-full max-w-sm landscape:w-auto flex flex-col justify-center shrink-0">
                    <div className="bg-white p-6 rounded-3xl shadow-xl w-full border border-indigo-50 text-center">
                        <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">本次得分</div>
                        <div className="text-6xl font-extrabold text-indigo-600 mb-2">{Math.round((correct / total) * 100)}<span className="text-2xl">%</span></div>
                        <div className="flex justify-center gap-4 text-sm font-medium">
                            <span className="text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full"><CheckCircle size={16}/> 对 {correct}</span>
                            <span className="text-red-500 flex items-center gap-1 bg-red-50 px-3 py-1 rounded-full"><XCircle size={16}/> 错 {total - correct}</span>
                        </div>
                    </div>
                    
                     {/* Buttons (Desktop/Landscape placement) */}
                    <div className="hidden landscape:flex flex-col gap-3 mt-6">
                        <button 
                            onClick={startQuiz}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                        >
                            <RotateCcw size={20} /> 再练一次
                        </button>
                        <button 
                            onClick={() => setView('HOME')}
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl shadow border border-gray-100 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Home size={20} /> 返回主页
                        </button>
                    </div>
                </div>

                {/* List Section - Scrollable */}
                <div className="flex-1 overflow-y-auto min-h-0 w-full max-w-lg rounded-2xl">
                    {incorrectProblems.length > 0 ? (
                        <div className="space-y-3 pb-20 landscape:pb-0">
                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-sky-50/95 backdrop-blur py-2 z-10">
                                <XCircle className="text-red-400" size={20}/>
                                <h3 className="text-lg font-bold text-gray-700">错题回顾 ({incorrectProblems.length})</h3>
                            </div>
                            {incorrectProblems.map((p, idx) => (
                                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                                    <div className="text-lg sm:text-xl font-mono font-bold text-gray-800 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg flex flex-wrap items-center justify-center sm:justify-start gap-x-1">
                                        {renderProblemExpression(p, true)} <span>= ?</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="text-sm text-red-500 font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                                            你填了: {p.userAnswer} <X size={16} strokeWidth={3} />
                                        </div>
                                        <div className="text-sm text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded">
                                            正确答案: {p.answer} <Check size={16} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-green-50/50 rounded-3xl border-2 border-dashed border-green-200 p-8">
                            <CheckCircle size={64} className="text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold text-green-700">全对！太厉害了！</h3>
                            <p className="text-green-600">你完全掌握了这次的内容。</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Buttons (Mobile/Portrait placement) */}
            <div className="landscape:hidden flex gap-3 w-full mt-4 shrink-0">
                <button 
                    onClick={() => setView('HOME')}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                    <Home size={20} /> 主页
                </button>
                <button 
                    onClick={startQuiz}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                >
                    <RotateCcw size={20} /> 再练一次
                </button>
            </div>
        </div>
    );
  };

  const renderRewards = () => (
    <div className="h-[100dvh] flex flex-col max-w-2xl mx-auto pt-6 px-4 pb-6">
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={() => setView('HOME')} className="bg-white p-2 rounded-full shadow text-gray-500 hover:text-indigo-600">
           <Home size={24} />
        </button>
        <h2 className="text-3xl font-bold text-indigo-800">荣誉室</h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge) => {
            const unlocked = stats.badges.includes(badge.id);
            const Icon = badge.icon;
            return (
                <div key={badge.id} className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                unlocked ? 'bg-white border-yellow-300 shadow-md' : 'bg-gray-100 border-gray-200 opacity-60 grayscale'
                }`}>
                <div className={`p-3 rounded-full ${unlocked ? 'bg-yellow-50' : 'bg-gray-200'}`}>
                    <Icon size={32} className={unlocked ? badge.color : 'text-gray-400'} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{badge.name}</h3>
                    <p className="text-xs text-gray-500">解决 {badge.limit} 题</p>
                </div>
                {unlocked && <div className="mt-1 text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">已解锁</div>}
                </div>
            )
            })}
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <h3 className="text-xl font-bold text-gray-700 mb-2">重置进度？</h3>
            <p className="text-gray-500 text-sm mb-4">这将删除所有数据和徽章。</p>
            <button 
            onClick={() => setShowResetConfirm(true)}
            className="text-red-500 flex items-center justify-center gap-2 mx-auto hover:bg-red-50 px-4 py-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100"
            >
            <RefreshCcw size={16} /> 重置所有数据
            </button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">确定要重置吗？</h3>
            <p className="text-gray-500 mb-6">所有的星星和徽章都将消失，无法恢复。</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmResetData}
                className="px-6 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
              >
                确定重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-50 relative overflow-hidden font-fredoka">
      {/* Decorative Blobs */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-48 h-48 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      {view === 'HOME' && renderHome()}
      {view === 'QUIZ' && renderQuiz()}
      {view === 'REWARDS' && renderRewards()}
      {view === 'SUMMARY' && renderSummary()}
      
      {view === 'SETTINGS' && (
        <SettingsPanel 
          settings={settings} 
          updateSettings={setSettings} 
          onClose={() => setView('HOME')} 
        />
      )}
    </div>
  );
};

export default App;