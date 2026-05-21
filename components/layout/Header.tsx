"use client"
import { Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"

export function Header({ title }: { title: string }) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b px-6">
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <span className="text-sm text-muted-foreground">{user?.username}</span>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
