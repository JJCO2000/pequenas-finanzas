export const pesos = (amount: number) => Math.round(amount * 100);
export const formatMoney = (cents: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cents / 100);
export const clampMoney = (cents: number) => Math.max(0, Math.trunc(cents));
