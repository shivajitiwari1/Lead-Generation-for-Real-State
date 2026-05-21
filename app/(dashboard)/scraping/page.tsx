import { Header } from "@/components/layout/Header"

export default function ScrapingPage() {
  const sources = [
    { icon: "🗺️", name: "Google Maps",  status: "Plan 3" },
    { icon: "🏭", name: "IndiaMART",    status: "Plan 3" },
    { icon: "📋", name: "JustDial",     status: "Plan 3" },
    { icon: "🔗", name: "LinkedIn",     status: "Plan 3" },
    { icon: "📱", name: "Instagram",    status: "Plan 3" },
    { icon: "🛒", name: "TradeIndia",   status: "Plan 3" },
  ]
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Scraping" />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 text-3xl">🤖</div>
          <h2 className="text-2xl font-bold mb-2">Web Scraping</h2>
          <p className="text-muted-foreground mb-8">Automated lead discovery from top Indian business directories and social platforms.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-8">
            {sources.map(s => (
              <div key={s.name} className="rounded-xl border bg-card p-4 text-left flex items-center gap-3">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.status}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mb-4">Currently using smart lead generation. Real-time scraping with Playwright coming in Plan 3.</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-sm text-yellow-400 font-medium">🚧 Coming in Plan 3</span>
        </div>
      </main>
    </div>
  )
}
