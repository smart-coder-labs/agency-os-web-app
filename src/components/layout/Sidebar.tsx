"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/user-stories", label: "Stories" },
  { href: "/users", label: "Users" },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex md:flex-col md:w-[240px] h-full border-r border-[var(--color-border)] bg-white">
      <div className="px-4 py-4 border-b">
        <Link href="/" className="font-semibold">Agency OS</Link>
      </div>
      <nav className="flex-1 overflow-auto p-2">
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
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
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
  )
}
