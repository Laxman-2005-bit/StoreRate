import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo', // indigo, emerald, amber
}) => {
  return (
    <div className="stat-card">
      <div className="stat-meta">
        <span className="stat-title">{title}</span>
        <span className="stat-value">
          {value !== undefined && value !== null ? value : '-'}
        </span>
        {subtitle && (
          <span className="stat-subtitle">{subtitle}</span>
        )}
      </div>

      {Icon && (
        <div className={`stat-icon-wrapper stat-icon-${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
