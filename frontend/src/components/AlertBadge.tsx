
import { AlertOctagon, TriangleAlert, Info } from "lucide-react";
import type { AlertSeverity } from "../types/alerts";

interface AlertBadgeProps {
  severity: AlertSeverity;
  compact?: boolean;
}

export function AlertBadge({ severity, compact = false }: AlertBadgeProps) {
  let bgColor = "";
  let textColor = "";
  let Icon = Info;
  let label = "Low";

  switch (severity) {
    case "high":
      bgColor = "bg-red-500/10";
      textColor = "text-red-500";
      Icon = AlertOctagon;
      label = "High";
      break;
    case "medium":
      bgColor = "bg-amber-500/10";
      textColor = "text-amber-500";
      Icon = TriangleAlert;
      label = "Medium";
      break;
    case "low":
      bgColor = "bg-sky-400/10";
      textColor = "text-sky-400";
      Icon = Info;
      label = "Low";
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full ${bgColor} ${textColor} font-semibold ${
        compact ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      aria-label={`Demo alert severity: ${label}.`}
    >
      <Icon className={compact ? "w-3 h-3" : "w-4 h-4"} />
      {!compact && <span>{label}</span>}
    </div>
  );
}
