import { ComponentProps, forwardRef } from 'react'

type Props = ComponentProps<'input'> & { label?: string; hint?: string }

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = '', label, hint, ...rest },
  ref
) {
  return (
    <label className="grid gap-1 text-sm">
      {label && <span>{label}</span>}
      <input
        ref={ref}
        className={['border rounded-md px-3 py-2', className].join(' ')}
        {...rest}
      />
      {hint && <span className="text-gray-500">{hint}</span>}
    </label>
  )
})

export default Input
