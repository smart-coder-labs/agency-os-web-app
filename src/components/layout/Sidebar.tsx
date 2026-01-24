"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar"
import { ScrollArea } from "@/components/ui/ScrollArea"

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "Layout" },
  { href: "/projects", label: "Projects", icon: "Folder" },
  { href: "/tasks", label: "Tasks", icon: "CheckSquare" },
  { href: "/user-stories", label: "Stories", icon: "BookOpen" },
  { href: "/users", label: "Users", icon: "Users" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const NavList = (
    <ul className="space-y-1 p-2">
      {nav.map((item) => {
        const active = pathname?.startsWith(item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                active 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              ].join(" ")}
              onClick={() => setOpen(false)}
            >
              {/* Simple icon placeholder until we have Lucide or similar */}
              <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-blue-600' : 'bg-gray-300'}`} />
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  const UserProfile = (
    <div className="p-4 border-t border-[var(--color-border)] mt-auto">
      <div className="flex items-center gap-3 mb-4">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
          <p className="text-xs text-gray-500 truncate">admin@agencyos.com</p>
        </div>
      </div>
      <Button 
        variant="subtle" 
        size="sm" 
        fullWidth
        onClick={async () => {
          await fetch('/api/auth/logout', { method: 'POST' })
          window.location.href = '/auth/signin'
        }}
      >
        Logout
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-[260px] h-full border-r border-[var(--color-border)] bg-white/50 backdrop-blur-xl">
        <div className="px-6 py-6 border-b border-[var(--color-border)]">
          <Link href="/" className="font-semibold text-lg tracking-tight">Agency OS</Link>
        </div>
        <ScrollArea className="flex-1">
          {NavList}
        </ScrollArea>
        {UserProfile}
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <Link href="/" className="font-semibold text-lg" onClick={() => setOpen(false)}>Agency OS</Link>
              <button className="text-xl p-2 text-gray-500" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="flex-1 overflow-auto">
               {NavList}
            </div>
            {UserProfile}
          </aside>
        </div>
      )}
    </>
  )
}
