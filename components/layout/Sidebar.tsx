"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Megaphone, Mail, Bot, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/leads",     icon: Users,           label: "Leads" },
  { href: "/campaigns", icon: Megaphone,       label: "Campaigns" },
  { href: "/outreach",  icon: Mail,            label: "Outreach" },
  { href: "/scraping",  icon: Bot,             label: "Scraping" },
  { href: "/settings",  icon: Settings,        label: "Settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="group flex h-screen w-14 flex-col border-r bg-background transition-all duration-300 hover:w-52 overflow-hidden">
      <div className="flex h-14 items-center justify-center border-b px-3">
        <span className="text-lg font-bold text-primary">⚡</span>
        <span className="ml-2 whitespace-nowrap text-sm font-bold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          LeadCRM
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
