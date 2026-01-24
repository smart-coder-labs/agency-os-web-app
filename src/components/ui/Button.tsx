import { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({ className = '', variant = 'primary', ...rest }: Props) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm px-4 py-2 transition-colors'
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  }[variant]
  return <button className={[base, styles, className].join(' ')} {...rest} />
}
