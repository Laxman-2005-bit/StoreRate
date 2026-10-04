import React from 'react';
import { ShieldCheck, Store, UserCheck, Star } from 'lucide-react';

export const Badge = ({ children, variant = 'default', size = 'sm', icon = null }) => {
  const variantStyles = {
    admin: 'bg-purple-50 text-purple-700 border-purple-200/80',
    owner: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    user: 'bg-sky-50 text-sky-700 border-sky-200/80',
    rating: 'bg-amber-50 text-amber-800 border-amber-200/80 font-bold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[11px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const getRoleIcon = (v) => {
    if (v === 'admin') return <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />;
    if (v === 'owner') return <Store className="w-3.5 h-3.5 text-emerald-600" />;
    if (v === 'user') return <UserCheck className="w-3.5 h-3.5 text-sky-600" />;
    if (v === 'rating') return <Star className="w-3 h-3 text-amber-500 fill-amber-500" />;
    return null;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.sm}`}
    >
      {icon || getRoleIcon(variant)}
      {children}
    </span>
  );
};

export default Badge;
