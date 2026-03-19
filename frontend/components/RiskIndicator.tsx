import { cn } from "@/lib/utils";

interface Props {
  level: "low" | "medium" | "high";
  zone?: string;
}

export default function RiskIndicator({ level, zone }: Props) {
  const config = {
    low: {
      color: "bg-green-500",
      text: "Low Risk",
      textColor: "text-green-700",
      bg: "bg-green-50 border-green-200",
    },
    medium: {
      color: "bg-yellow-500",
      text: "Medium Risk",
      textColor: "text-yellow-700",
      bg: "bg-yellow-50 border-yellow-200",
    },
    high: {
      color: "bg-red-500",
      text: "High Risk",
      textColor: "text-red-700",
      bg: "bg-red-50 border-red-200",
    },
  };
  const c = config[level];

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border", c.bg)}>
      <div className={cn("w-3 h-3 rounded-full animate-pulse", c.color)} />
      <div>
        <p className={cn("text-sm font-semibold", c.textColor)}>{c.text}</p>
        {zone && <p className="text-xs text-gray-500">Zone: {zone}</p>}
      </div>
    </div>
  );
}
