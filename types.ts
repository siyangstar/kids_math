export enum Operation {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE'
}

export interface MathProblem {
  id: string;
  num1: number;
  num2: number;
  num3?: number;
  operation: Operation;
  operation2?: Operation;
  parentheses?: 'left' | 'right' | 'none';
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface RangeSettings {
  min: number;
  max: number;
}

export interface AppSettings {
  operations: Operation[];
  // Specific ranges for each operation type
  addRange: RangeSettings; // Controls the Sum (Answer)
  subRange: RangeSettings; // Controls the Minuend (num1)
  mulRange: RangeSettings; // Controls the Factors (num1, num2)
  divRange: RangeSettings; // Controls the Divisor and Quotient
  
  allowRegrouping: boolean; // Carrying/Borrowing
  allowNegatives: boolean;
  allowRemainders: boolean;
  problemCount: number; // Number of problems per session
  
  numberCount: 2 | 3; // 2 or 3 numbers
  allowParentheses: boolean; // Whether to allow parentheses in 3-number mode
}

export interface UserStats {
  streak: number;
  totalCorrect: number;
  problemsSolved: number;
  badges: string[];
}

export type ViewState = 'HOME' | 'QUIZ' | 'SETTINGS' | 'REWARDS' | 'SUMMARY';