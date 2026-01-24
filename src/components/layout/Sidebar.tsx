"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/user-stories", label: "Stories" },
  { href: "/users", label: "Users" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const NavList = (
    <ul className="space-y-1">
      {nav.map((item) => {
        const active = pathname?.startsWith(item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={[
                "block px-3 py-2 rounded-md text-sm",
                active ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50",
              ].join(" ")}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-[240px] h-full border-r border-[var(--color-border)] bg-white">
        <div className="px-4 py-4 border-b">
          <Link href="/" className="font-semibold">Agency OS</Link>
        </div>
        <nav className="flex-1 overflow-auto p-2">{NavList}</nav>
        <div className="p-3 border-t">
          <button
            className="w-full inline-flex items-center justify-center rounded-md bg-gray-100 text-gray-900 px-3 py-2 text-sm hover:bg-gray-200"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/auth/signin'
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-3 left-3 z-40 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border shadow-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[260px] bg-white z-50 shadow-md flex flex-col">
            <div className="px-4 py-4 border-b flex items-center justify-between">
              <Link href="/" className="font-semibold" onClick={() => setOpen(false)}>Agency OS</Link>
              <button className="text-xl" onClick={() => setOpen(false)} aria-label="Close">×</button>
            </div>
            <nav className="flex-1 overflow-auto p-2">{NavList}</nav>
            <div className="p-3 border-t">
              <button
                className="w-full inline-flex items-center justify-center rounded-md bg-gray-100 text-gray-900 px-3 py-2 text-sm hover:bg-gray-200"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/auth/signin'
                }}
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
