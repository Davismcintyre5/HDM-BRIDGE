export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCurrency = (amount, currency = 'USD') => {
  const symbols = { USD: '$', KES: 'KSh', EUR: '€', GBP: '£' };
  const symbol = symbols[currency] || currency;
  return `${symbol} ${formatNumber(amount)}`;
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#4F46E5', '#7C3AED', '#059669', '#DC2626', '#D97706', '#2563EB', '#9333EA'];
  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};