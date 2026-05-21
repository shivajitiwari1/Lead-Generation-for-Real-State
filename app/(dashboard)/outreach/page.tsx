import { Header } from "@/components/layout/Header"

export default function OutreachPage() {
  const features = [
    { icon: "🤖", title: "AI Email Generation",    desc: "Claude AI writes personalized outreach emails for each lead automatically" },
    { icon: "📬", title: "Resend + SMTP",          desc: "Send via Resend API with SMTP fallback, max 20 emails/day for safety" },
    { icon: "🔁", title: "Follow-up Automation",   desc: "Auto follow-up after 5 days, max 2 times per lead" },
    { icon: "📈", title: "Outreach History",        desc: "Full history of all sent emails, status, and replies per lead" },
  ]
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Outreach" />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-3xl">✉️</div>
          <h2 className="text-2xl font-bold mb-2">Outreach</h2>
          <p className="text-muted-foreground mb-8">AI-powered personalized email outreach for every lead. Generate, approve, and send with one click.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border bg-card p-4 text-left">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-sm text-yellow-400 font-medium">🚧 Coming in Plan 2</span>
        </div>
      </main>
    </div>
  )
}
