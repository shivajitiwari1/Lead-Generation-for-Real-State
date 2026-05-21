import { Header } from "@/components/layout/Header"

export default function SettingsPage() {
  const upcoming = [
    { icon: "🔑", title: "API Keys",         desc: "Manage Anthropic, Resend, and SMTP credentials" },
    { icon: "👤", title: "User Management",  desc: "Add team members and manage access levels" },
    { icon: "📧", title: "Email Settings",   desc: "Configure daily send limits, sender name, and signature" },
    { icon: "🎨", title: "Branding",         desc: "Customize your CRM with logo and company name" },
  ]
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <Header title="Settings" />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-500/10 border border-gray-500/20 text-3xl">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground mb-8">Configure your CRM preferences, API keys, and account settings.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
            {upcoming.map(f => (
              <div key={f.title} className="rounded-xl border bg-card p-4 text-left">
                <div className="text-2xl mb-2">{f.icon}</div>
                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 text-sm text-yellow-400 font-medium">🚧 Coming soon</span>
        </div>
      </main>
    </div>
  )
}
