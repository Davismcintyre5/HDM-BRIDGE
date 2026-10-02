export function formatMoney(amount, currencyCode, currencies = []) {
  const c = currencies.find((x) => x.code === currencyCode);
  const symbol = c?.symbol || currencyCode || '$';
  const decimals = c?.decimalPlaces ?? 2;
  const thousands = c?.thousandsSeparator ?? ',';
  const decimal = c?.decimalSeparator ?? '.';
  const num = Number(amount || 0);
  const parts = num.toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const formatted = parts.join(decimal);
  return c?.symbolPosition === 'after' ? `${formatted}${symbol}` : `${symbol}${formatted}`;
}

export function formatMoneyCode(amount, currencyCode) {
  const num = Number(amount || 0);
  return `${currencyCode || 'USD'} ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}