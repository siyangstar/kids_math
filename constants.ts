import { Operation, AppSettings } from './types';
import { Star, Trophy, Zap, Crown, Heart } from 'lucide-react';

export const DEFAULT_SETTINGS: AppSettings = {
  operations: [Operation.ADD],
  // Addition: Sum between 1 and 20
  addRange: { min: 1, max: 20 },
  // Subtraction: Minuend between 1 and 20
  subRange: { min: 1, max: 20 },
  // Multiplication: Factors between 2 and 9 (Focus on times tables, avoids 0 and 1 by default)
  mulRange: { min: 2, max: 9 },
  // Division: Divisor and Quotient between 2 and 9
  divRange: { min: 2, max: 9 },
  
  allowRegrouping: true,
  allowNegatives: false,
  allowRemainders: false,
  problemCount: 20,
  numberCount: 2,
  allowParentheses: false,
};

export const BADGES = [
  { id: 'start', name: '初学者', icon: Star, limit: 5, color: 'text-yellow-400' },
  { id: 'streak10', name: '火力全开', icon: Zap, limit: 10, color: 'text-orange-500' },
  { id: 'master50', name: '数学大师', icon: Crown, limit: 50, color: 'text-purple-500' },
  { id: 'accuracy', name: '神射手', icon: Trophy, limit: 100, color: 'text-blue-500' },
  { id: 'love', name: '数学爱好者', icon: Heart, limit: 200, color: 'text-red-500' },
];

export const OPERATOR_SYMBOLS: Record<Operation, string> = {
  [Operation.ADD]: '+',
  [Operation.SUBTRACT]: '−',
  [Operation.MULTIPLY]: '×',
  [Operation.DIVIDE]: '÷',
};