export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatRating = (rating) => {
  const num = parseFloat(rating);
  if (isNaN(num) || num === 0) return '0.0';
  return num.toFixed(1);
};

export const formatRole = (role) => {
  switch (role) {
    case 'admin':
      return 'System Administrator';
    case 'owner':
      return 'Store Owner';
    case 'user':
      return 'Normal User';
    default:
      return role;
  }
};
