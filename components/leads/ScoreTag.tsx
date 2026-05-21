import { cn } from "@/lib/utils"
import type { LeadScore } from "@/lib/types"

export function ScoreTag({ score }: { score: LeadScore }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
      score === "high" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      score === "medium" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      score === "low" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    )}>
      {score}
    </span>
  )
}
