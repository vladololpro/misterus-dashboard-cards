import { ComponentProps, ReactNode } from 'react'

interface ButtonProps extends ComponentProps<'button'> {
  children: ReactNode
}

function Button({ children, className, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={className} {...rest}>
      {children}
    </button>
  )
}

export default Button