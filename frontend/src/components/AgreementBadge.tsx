import { CircleCheck, TriangleAlert, CircleX } from 'lucide-react';
import type { AgreementLevel } from '../types/comparison';

interface AgreementBadgeProps {
  level: AgreementLevel;
  score: number;
  compact?: boolean;
}

export default function AgreementBadge({ level, score, compact = false }: AgreementBadgeProps) {
  let bgColor = '';
  let textColor = '';
  let borderColor = '';
  let label = '';
  let Icon = CircleCheck;

  if (level === 'high') {
    bgColor = 'bg-[#22C55E]/20';
    textColor = 'text-[#22C55E]';
    borderColor = 'border-[#22C55E]/50';
    label = 'High Agreement';
    Icon = CircleCheck;
  } else if (level === 'moderate') {
    bgColor = 'bg-[#F59E0B]/20';
    textColor = 'text-[#F59E0B]';
    borderColor = 'border-[#F59E0B]/50';
    label = 'Moderate Agreement';
    Icon = TriangleAlert;
  } else {
    bgColor = 'bg-[#EF4444]/20';
    textColor = 'text-[#EF4444]';
    borderColor = 'border-[#EF4444]/50';
    label = 'Low Agreement';
    Icon = CircleX;
  }

  const ariaLabel = `Model agreement: ${label}, score ${score} out of 100.`;

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs font-semibold ${bgColor} ${textColor} ${borderColor}`}
        aria-label={ariaLabel}
      >
        <span className="capitalize">{level}</span>
        <span className="opacity-60 text-[10px]">•</span>
        <span>{score}</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold ${bgColor} ${textColor} ${borderColor}`}
      aria-label={ariaLabel}
    >
      <Icon size={14} />
      <span>{label}</span>
      <span className="opacity-60 text-[10px] mx-0.5">•</span>
      <span>{score}/100</span>
    </div>
  );
}
