import { AppSettings, MathProblem, Operation } from '../types';

// Helper to check for regrouping (carrying/borrowing)
const hasRegrouping = (n1: number, n2: number, op: Operation): boolean => {
  const digits1 = n1.toString().split('').map(Number).reverse();
  const digits2 = n2.toString().split('').map(Number).reverse();
  const len = Math.max(digits1.length, digits2.length);

  if (op === Operation.ADD) {
    for (let i = 0; i < len; i++) {
      const d1 = digits1[i] || 0;
      const d2 = digits2[i] || 0;
      if (d1 + d2 >= 10) return true;
    }
  } else if (op === Operation.SUBTRACT) {
    for (let i = 0; i < len; i++) {
      const d1 = digits1[i] || 0;
      const d2 = digits2[i] || 0;
      if (d1 < d2) return true;
    }
  }
  return false;
};

// Helper to create a problem object
const createProblem = (n1: number, n2: number, op: Operation, ans: number): MathProblem => ({
    id: `${op}-${n1}-${n2}-${Date.now()}-${Math.random()}`,
    num1: n1,
    num2: n2,
    operation: op,
    answer: ans,
});

// Helper to identify "Trivial" problems (Too easy/boring)
const isTrivialProblem = (n1: number, n2: number, op: Operation): boolean => {
    switch (op) {
        case Operation.ADD:
            return n1 === 0 || n2 === 0;
        case Operation.SUBTRACT:
            return n2 === 0;
        case Operation.MULTIPLY:
            return n1 === 0 || n2 === 0 || n1 === 1 || n2 === 1;
        case Operation.DIVIDE:
            return n2 === 1;
        default:
            return false;
    }
};

const getValid2NumberProblems = (op: Operation, settings: AppSettings): MathProblem[] => {
  const validProblems: MathProblem[] = [];
  
  switch (op) {
    case Operation.ADD: {
        const { min, max } = settings.addRange;
        const safeMin = Math.min(min, max);
        const safeMax = Math.max(min, max);

        for (let sum = safeMin; sum <= safeMax; sum++) {
            for (let n1 = 0; n1 <= sum; n1++) {
                const n2 = sum - n1;
                if (!settings.allowRegrouping && hasRegrouping(n1, n2, Operation.ADD)) continue;
                validProblems.push(createProblem(n1, n2, Operation.ADD, sum));
            }
        }
        break;
    }
    case Operation.SUBTRACT: {
        const { min, max } = settings.subRange;
        const safeMin = Math.min(min, max);
        const safeMax = Math.max(min, max);

        for (let n1 = safeMin; n1 <= safeMax; n1++) {
            const maxN2 = settings.allowNegatives ? n1 + 10 : n1;
            for (let n2 = 0; n2 <= maxN2; n2++) {
                const ans = n1 - n2;
                if (!settings.allowRegrouping && hasRegrouping(n1, n2, Operation.SUBTRACT)) continue;
                validProblems.push(createProblem(n1, n2, Operation.SUBTRACT, ans));
            }
        }
        break;
    }
    case Operation.MULTIPLY: {
        const { min, max } = settings.mulRange;
        const safeMin = Math.min(min, max);
        const safeMax = Math.max(min, max);

        for (let n1 = safeMin; n1 <= safeMax; n1++) {
            for (let n2 = safeMin; n2 <= safeMax; n2++) {
                validProblems.push(createProblem(n1, n2, Operation.MULTIPLY, n1 * n2));
            }
        }
        break;
    }
    case Operation.DIVIDE: {
        const { min, max } = settings.divRange;
        const safeMin = Math.min(min, max);
        const safeMax = Math.max(min, max);

        const start = safeMin === 0 ? 1 : safeMin;
        for (let divisor = start; divisor <= safeMax; divisor++) {
            for (let quotient = start; quotient <= safeMax; quotient++) {
                const dividend = divisor * quotient;
                validProblems.push(createProblem(dividend, divisor, Operation.DIVIDE, quotient));
            }
        }
        break;
    }
  }
  
  return validProblems;
};

const pickRandomProblem = (pool: MathProblem[], op: Operation): MathProblem | null => {
    if (pool.length === 0) return null;
    const interesting = pool.filter(p => !isTrivialProblem(p.num1, p.num2, op));
    const finalPool = interesting.length > 0 ? interesting : pool;
    return finalPool[Math.floor(Math.random() * finalPool.length)];
};

export const generateProblem = (settings: AppSettings): MathProblem => {
  const ops = settings.operations;
  
  if (settings.numberCount === 3) {
      let attempts = 0;
      while (attempts < 2000) {
          attempts++;
          const op1 = ops[Math.floor(Math.random() * ops.length)];
          const op2 = ops[Math.floor(Math.random() * ops.length)];
          
          const prec1 = (op1 === Operation.MULTIPLY || op1 === Operation.DIVIDE) ? 2 : 1;
          const prec2 = (op2 === Operation.MULTIPLY || op2 === Operation.DIVIDE) ? 2 : 1;
          
          let structure: 'left' | 'right' = 'left';
          let parens: 'left' | 'right' | 'none' = 'none';
          
          if (settings.allowParentheses) {
              structure = Math.random() < 0.5 ? 'left' : 'right';
              if (structure === 'left' && prec1 < prec2) parens = 'left';
              if (structure === 'right' && prec1 >= prec2) parens = 'right';
              
              // Randomly add unnecessary parentheses for variety
              if (parens === 'none' && Math.random() < 0.3) {
                  parens = structure;
              }
          } else {
              if (prec1 >= prec2) structure = 'left';
              else structure = 'right';
          }

          // Generate numbers dynamically based on operations
          let num1 = 0, num2 = 0, num3 = 0, innerAns = 0, outerAns = 0;
          let valid = false;

          if (structure === 'left') {
              // (num1 op1 num2) op2 num3
              const innerPool = getValid2NumberProblems(op1, settings);
              const inner = pickRandomProblem(innerPool, op1);
              if (!inner) continue;
              
              num1 = inner.num1;
              num2 = inner.num2;
              innerAns = inner.answer;

              // Now generate num3 such that innerAns op2 num3 is valid
              const outerPool = getValid2NumberProblems(op2, settings).filter(p => p.num1 === innerAns);
              const outer = pickRandomProblem(outerPool, op2);
              if (!outer) continue;

              num3 = outer.num2;
              outerAns = outer.answer;
              valid = true;

          } else {
              // num1 op1 (num2 op2 num3)
              const innerPool = getValid2NumberProblems(op2, settings);
              const inner = pickRandomProblem(innerPool, op2);
              if (!inner) continue;

              num2 = inner.num1;
              num3 = inner.num2;
              innerAns = inner.answer;

              // Now generate num1 such that num1 op1 innerAns is valid
              const outerPool = getValid2NumberProblems(op1, settings).filter(p => p.num2 === innerAns);
              const outer = pickRandomProblem(outerPool, op1);
              if (!outer) continue;

              num1 = outer.num1;
              outerAns = outer.answer;
              valid = true;
          }

          if (valid) {
              return {
                  id: `3num-${Date.now()}-${Math.random()}`,
                  num1,
                  num2,
                  num3,
                  operation: op1,
                  operation2: op2,
                  parentheses: parens,
                  answer: outerAns
              };
          }
      }
  }

  // Fallback to 2-number logic
  const op = ops[Math.floor(Math.random() * ops.length)];
  const pool = getValid2NumberProblems(op, settings);
  const problem = pickRandomProblem(pool, op);
  
  if (problem) return problem;
  
  return createProblem(1, 1, Operation.ADD, 2);
};