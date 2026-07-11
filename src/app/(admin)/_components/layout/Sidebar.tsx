"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/Button"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/Avatar"
import { ScrollArea } from "@/shared/components/ui/ScrollArea"
import { LayoutDashboard, FolderKanban, ClipboardList, BookOpen, Bot, Users, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/user-stories", label: "Stories", icon: BookOpen },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/users", label: "Users", icon: Users },
]

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: LucideIcon; label: string; onClick?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
      style={{
        background: isActive ? 'var(--color-accent-muted)' : 'transparent',
        borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
        marginLeft: '0',
      }}
    >
      <Icon
        className="w-4 h-4 flex-shrink-0 transition-colors"
        style={{ color: isActive ? 'var(--color-accent-hover)' : 'var(--color-text-muted)' }}
      />
      <span
        className="text-sm font-medium transition-colors"
        style={{
          fontFamily: 'DM Sans, sans-serif',
          color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
      {isActive && (
        <span
          className="absolute right-2.5 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--color-accent)', boxShadow: '0 0 6px rgba(99,102,241,0.6)' }}
        />
      )}
    </Link>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data))
      .catch(() => setUser(null))
  }, [])

  const sidebarContent = (
    <>
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #818CF8)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
          }}
        >
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              display: 'block',
            }}
          >
            Agency OS
          </span>
          <div
            style={{
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: '1px',
            }}
          >
            v2.0 · command center
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onClick={() => setOpen(false)}
          />
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <Avatar size="sm">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${user?.full_name || user?.email || 'User'}&background=1E2D45&color=818CF8`}
              alt="User"
            />
            <AvatarFallback
              style={{ background: 'var(--color-border-subtle)', color: 'var(--color-accent-hover)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
            >
              {(user?.full_name || 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', fontFamily: 'DM Sans, sans-serif' }}
            >
              {user?.full_name || 'Loading...'}
            </p>
            <p
              className="truncate"
              style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all"
          style={{
            background: 'transparent',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.2)'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-subtle)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'
          }}
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/auth/signin'
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex md:flex-col md:w-[260px] h-full"
        style={{ background: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border-subtle)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center w-10 h-10 rounded-xl"
        style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-secondary)' }}
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="text-xl leading-none">☰</span>
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(5,8,16,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
          <aside
            className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col"
            style={{ background: 'var(--color-sidebar)', borderRight: '1px solid var(--color-border-subtle)' }}
          >
            <button
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
