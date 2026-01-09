
import React from 'react';

interface VitalCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
  status: 'normal' | 'warning' | 'critical';
}

const VitalCard: React.FC<VitalCardProps> = ({ title, value, unit, icon, color, status }) => {
  const statusColors = {
    normal: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    critical: 'text-rose-600 bg-rose-50',
  };

  const borderColors = {
    normal: 'border-emerald-100',
    warning: 'border-amber-100',
    critical: 'border-rose-100',
  };

  return (
    <div className={`p-6 bg-white rounded-2xl border ${borderColors[status]} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <i className={`fas ${icon} text-white text-xl`}></i>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-800">{value}</span>
          <span className="text-slate-400 text-sm font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default VitalCard;
