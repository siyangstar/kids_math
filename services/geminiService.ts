import { GoogleGenAI } from "@google/genai";
import { MathProblem, Operation } from '../types';
import { OPERATOR_SYMBOLS } from '../constants';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Fallback messages for when API is exhausted or offline
const FALLBACK_EXPLANATIONS = [
  "让我们用实物数一数吧！",
  "试着画图来解决这个问题。",
  "相信自己，再仔细想一想！",
  "仔细观察数字之间的关系。",
  "你可以试着把大问题拆成小问题。"
];

const FALLBACK_PRAISE = ["太棒了！", "真聪明！", "继续保持！", "你真厉害！", "给你一颗小星星！"];
const FALLBACK_ENCOURAGE = ["没关系，再试一次！", "失败是成功之母。", "加油，你能行！", "仔细看一看，哪里算错了？"];

const handleGeminiError = (error: any, context: string) => {
    // Check for rate limiting or quota exhaustion in various error formats
    const isQuotaError = 
        error?.status === 429 || 
        error?.code === 429 ||
        error?.error?.code === 429 ||
        error?.status === 'RESOURCE_EXHAUSTED' ||
        error?.message?.includes('quota') ||
        error?.message?.includes('429');
    
    if (isQuotaError) {
        console.warn(`Gemini API Quota Exceeded [${context}]. Using offline fallback.`);
    } else {
        console.error(`Gemini API Error [${context}]:`, error);
    }
};

export const getMathExplanation = async (problem: MathProblem): Promise<string> => {
  const ai = getClient();
  if (!ai) return "我需要API密钥来帮助你！";

  const symbol = OPERATOR_SYMBOLS[problem.operation];
  const prompt = `
    你是一位友好热情的小学数学老师。
    请用中文解释如何解决这个数学题：${problem.num1} ${symbol} ${problem.num2} = ?。
    
    答案是 ${problem.answer}。
    
    规则：
    1. 保持简短（最多3句话）。
    2. 使用emoji表情符号。
    3. 使用具体的比喻（如苹果、汽车、星星）。
    4. 不要直接给出答案，而是简单解释计算*过程*。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || FALLBACK_EXPLANATIONS[0];
  } catch (error: any) {
    handleGeminiError(error, 'Explanation');
    // Return a random fallback to keep it feeling dynamic even if offline/limited
    return FALLBACK_EXPLANATIONS[Math.floor(Math.random() * FALLBACK_EXPLANATIONS.length)];
  }
};

export const getEncouragement = async (isCorrect: boolean): Promise<string> => {
  const ai = getClient();
  // Static fallback immediately if no key, but here strictly handle error
  if (!ai) return isCorrect ? "做得好！" : "继续加油！";

  const prompt = isCorrect 
    ? "用中文给刚才做对数学题的孩子一句简短有趣的夸奖（1句话）。使用emoji。"
    : "用中文给刚才做错数学题的孩子一句温柔的鼓励（1句话），告诉他们从错误中学习。使用emoji。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (isCorrect ? "太棒了！" : "你能做到的！");
  } catch (error: any) {
    handleGeminiError(error, 'Encouragement');
    // Fallback logic for rate limits or errors
    const list = isCorrect ? FALLBACK_PRAISE : FALLBACK_ENCOURAGE;
    return list[Math.floor(Math.random() * list.length)];
  }
};