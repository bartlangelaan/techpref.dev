import type { Influencer } from "./types"

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <div className="flex items-start gap-3 mb-3">
        <img
          src={influencer.avatar || "/placeholder.svg"}
          alt={influencer.name}
          className="w-10 h-10 rounded-full object-cover border border-border"
        />
        <div>
          <h4 className="font-semibold text-foreground text-sm">{influencer.name}</h4>
          <p className="text-xs text-primary">{influencer.role}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground italic leading-relaxed">"{influencer.quote}"</p>
    </div>
  )
}
