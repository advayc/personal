export type Expression = {
  value: number;
  text: string;
  left?: Expression;
  right?: Expression;
  operation?: "+" | "−" | "×" | "÷";
};

/** Every subset is represented by a bit mask. Each integer is stored once. */
export function solveCardPuzzle(cards: number[], target: number): Expression | null {
  if (cards.length < 2 || cards.length > 5 || !Number.isSafeInteger(target)) return null;
  const all = (1 << cards.length) - 1;
  const reachable: Map<number, Expression>[] = Array.from({ length: all + 1 }, () => new Map());

  cards.forEach((value, index) => {
    reachable[1 << index].set(value, { value, text: String(value) });
  });

  for (let mask = 1; mask <= all; mask++) {
    if ((mask & (mask - 1)) === 0) continue;
    for (let leftMask = (mask - 1) & mask; leftMask; leftMask = (leftMask - 1) & mask) {
      const rightMask = mask ^ leftMask;
      if (leftMask > rightMask) continue;
      for (const left of reachable[leftMask].values()) {
        for (const right of reachable[rightMask].values()) {
          const candidates: [number, Expression, Expression, Expression["operation"]][] = [
            [left.value + right.value, left, right, "+"],
            [left.value * right.value, left, right, "×"],
            [left.value - right.value, left, right, "−"],
            [right.value - left.value, right, left, "−"],
          ];
          if (right.value !== 0 && left.value % right.value === 0) {
            candidates.push([left.value / right.value, left, right, "÷"]);
          }
          if (left.value !== 0 && right.value % left.value === 0) {
            candidates.push([right.value / left.value, right, left, "÷"]);
          }
          for (const [value, a, b, operation] of candidates) {
            if (!Number.isSafeInteger(value) || reachable[mask].has(value)) continue;
            reachable[mask].set(value, {
              value,
              left: a,
              right: b,
              operation,
              text: `(${a.text} ${operation} ${b.text})`,
            });
          }
        }
      }
    }
  }
  return reachable[all].get(target) || null;
}

export function expressionSteps(expression: Expression): string[] {
  if (!expression.left || !expression.right || !expression.operation) return [];
  return [
    ...expressionSteps(expression.left),
    ...expressionSteps(expression.right),
    `${expression.left.value} ${expression.operation} ${expression.right.value} = ${expression.value}`,
  ];
}

const dealCache = new Map<number, number[][]>();

/** Find value sets that the exact-integer solver can actually use. */
function solvableDeals(target: number): number[][] {
  const cached = dealCache.get(target);
  if (cached) return cached;
  const deals: number[][] = [];
  if (Number.isSafeInteger(target)) {
    for (let a = 1; a <= 13; a++) {
      for (let b = a; b <= 13; b++) {
        for (let c = b; c <= 13; c++) {
          for (let d = c; d <= 13; d++) {
            const values = [a, b, c, d];
            if (solveCardPuzzle(values, target)) deals.push(values);
          }
        }
      }
    }
  }
  if (dealCache.size >= 8) dealCache.delete(dealCache.keys().next().value!);
  dealCache.set(target, deals);
  return deals;
}

/** Deal a different solvable set when possible, then randomize its order. */
export function dealSolvableCards(target: number, previous: number[]): { cards: number[]; target: number; adjusted: boolean } {
  const possible = solvableDeals(target);
  const adjusted = possible.length === 0;
  const goal = adjusted ? 24 : target;
  const deals = adjusted ? solvableDeals(goal) : possible;
  const previousValues = [...previous].sort((a, b) => a - b).join(",");
  const alternatives = deals.filter((deal) => deal.join(",") !== previousValues);
  const choices = alternatives.length ? alternatives : deals;
  const cards = [...choices[Math.floor(Math.random() * choices.length)]];
  for (let index = cards.length - 1; index > 0; index--) {
    const swap = Math.floor(Math.random() * (index + 1));
    [cards[index], cards[swap]] = [cards[swap], cards[index]];
  }
  return { cards, target: goal, adjusted };
}
