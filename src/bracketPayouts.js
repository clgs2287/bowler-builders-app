export function getBracketPayout(entryPrice = 5, byes = 0) {
  const price = Number(entryPrice);
  const validPrice = Number.isFinite(price) && price > 0 ? price : 5;
  if (!Number.isInteger(byes) || byes < 0 || byes > 2) return null;
  if (byes === 2) return price === 5 ? { first: 15, second: 10 } : null;
  return {
    first: Math.round(validPrice * (byes > 0 ? 4 : 5) * 100) / 100,
    second: Math.round(validPrice * 2 * 100) / 100,
  };
}
