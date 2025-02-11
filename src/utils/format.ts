export const formatBearing = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round(numValue).toString().padStart(3, '0');
};

export const formatDistance = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round(numValue).toString();
}; 