import React from "react";

export interface BarProgresProps {
  current: number;
  total: number;
  label?: string;
  color?: string;
  className?: string;
}

export const BarProgres: React.FC<BarProgresProps> = ({
  current,
  total,
  label,
  color = "var(--accent)",
  className = "",
}) => {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={`w-full flex flex-col gap-1.5 select-none ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs text-text-muted">
          <span>{label}</span>
          <span className="font-tabular font-semibold text-text">
            {current} / {total} ({percent}%)
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-surface2 rounded-full overflow-hidden p-0.5 border border-border">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};
