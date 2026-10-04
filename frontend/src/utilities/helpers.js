export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

export const truncateHash = (hash, front = 6, back = 4) => {
  if (!hash || hash.length <= front + back) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
};

export const generateMockConfirmationId = () => {
  return `CONF-${Math.floor(100000 + Math.random() * 900000)}`;
};
