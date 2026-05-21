"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Megaphone, Mail, Bot, Settings, Menu, X } from "lucide-react"
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
  const [open, setOpen] = useState(true)          // desktop default open
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Hydrate from localStorage after mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("sidebar-open")
    if (saved !== null) setOpen(saved === "true")
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Persist desktop open state
  const toggleDesktop = () => {
    const next = !open
    setOpen(next)
    localStorage.setItem("sidebar-open", String(next))
  }

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  if (!mounted) return null   // prevent SSR mismatch

  // ── Mobile ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-background border shadow-sm"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
        )}

        <aside className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-56 flex-col border-r bg-background transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <span className="text-lg font-bold text-primary">⚡</span>
            <span className="text-sm font-bold">LeadCRM</span>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}>
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
      </>
    )
  }

  // ── Desktop ───────────────────────────────────────────────────────────────
  return (
    <aside className={cn(
      "flex h-screen flex-col border-r bg-background transition-all duration-300 overflow-hidden shrink-0",
      open ? "w-52" : "w-14"
    )}>
      {/* Logo + toggle */}
      <div className={cn("flex h-14 items-center border-b", open ? "px-4 gap-2" : "justify-center px-2")}>
        {open ? (
          <>
            <span className="text-lg font-bold text-primary">⚡</span>
            <span className={cn("flex-1 text-sm font-bold whitespace-nowrap transition-all duration-200", open ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>LeadCRM</span>
            <button onClick={toggleDesktop}
              className="flex h-7 w-7 items-center justify-center rounded hover:bg-accent transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </>
        ) : (
          <button onClick={toggleDesktop}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <Menu className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-2 pt-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              title={!open ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !open && "justify-center"
              )}>
              <Icon className="h-5 w-5 shrink-0" />
              <span className={cn(
                "whitespace-nowrap transition-all duration-200",
                open ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
              )}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
