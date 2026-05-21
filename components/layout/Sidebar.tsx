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
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setOpen(false)
  }, [pathname, isMobile])

  const NavLinks = () => (
    <nav className="flex flex-1 flex-col gap-1 p-2">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => isMobile && setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        )
      })}
    </nav>
  )

  // ── Mobile: hamburger + overlay drawer ────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Hamburger button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="fixed top-3 left-3 z-50 flex h-9 w-9 items-center justify-center rounded-md bg-background border shadow-sm"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Overlay */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-56 flex-col border-r bg-background transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <span className="text-lg font-bold text-primary">⚡</span>
            <span className="text-sm font-bold">LeadCRM</span>
          </div>
          <NavLinks />
        </aside>
      </>
    )
  }

  // ── Desktop: icon-only sidebar with toggle button ─────────────────────────
  return (
    <aside className={cn(
      "flex h-screen flex-col border-r bg-background transition-all duration-300 overflow-hidden shrink-0",
      open ? "w-52" : "w-14"
    )}>
      {/* Toggle button */}
      <div className="flex h-14 items-center border-b px-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-accent transition-colors"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        {open && (
          <span className="ml-1 whitespace-nowrap text-sm font-bold text-primary">
            LeadCRM
          </span>
        )}
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
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                !open && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
