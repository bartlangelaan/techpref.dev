import type { Influencer } from "./types";

export function InfluencerCard({ influencer }: { influencer: Influencer }) {
  return (
    <div className="border-border bg-card/50 rounded-lg border p-4">
      <div className="mb-3 flex items-start gap-3">
        <img
          src={influencer.avatar || "/placeholder.svg"}
          alt={influencer.name}
          className="border-border h-10 w-10 rounded-full border object-cover"
        />
        <div>
          <h4 className="text-foreground text-sm font-semibold">
            {influencer.name}
          </h4>
          <p className="text-primary text-xs">{influencer.role}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed italic">
        "{influencer.quote}"
      </p>
    </div>
  );
}
