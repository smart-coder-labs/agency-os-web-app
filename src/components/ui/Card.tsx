import { ReactNode } from 'react'

export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={[
      'bg-white border border-[var(--color-border)] rounded-lg',
      className,
    ].join(' ')}>
      {children}
    </div>
  )
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="px-4 py-3 border-b">{children}</div>
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="p-4">{children}</div>
}
