import { Header } from "@/components/layout/Header"


export default function CampaignsPage() {
  const features = [
    { icon: "🎯", title: "Smart Targeting",         desc: "Target by business type, location, industry, and company size" },
    { icon: "📢", title: "Multi-Channel Campaigns", desc: "Run campaigns across Google Maps, LinkedIn, JustDial simultaneously" },
    { icon: "📊", title: "Campaign Analytics",      desc: "Track opens, replies, conversion rates, and ROI per campaign" },
    { icon: "⏰", title: "Scheduled Automation",    desc: "Set campaigns to run automatically at optimal times" },
  ]
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Campaigns" />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-3xl">📢</div>
          <h2 className="text-2xl font-bold mb-2">Campaigns</h2>
          <p className="text-muted-foreground mb-8">Create and manage lead generation campaigns. Run automated outreach across multiple sources and track performance.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border bg-card p-4 text-left">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-sm text-yellow-400 font-medium">🚧 Coming in Plan 3</span>
        </div>
      </main>
    </div>
  )
}
