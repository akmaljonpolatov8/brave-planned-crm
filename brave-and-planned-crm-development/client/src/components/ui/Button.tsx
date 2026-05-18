import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode
  isLoading?: boolean
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, isLoading, disabled, ...props }) => {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  }[variant]

  return (
    <button className={variantClass} disabled={disabled || isLoading} {...props}>
      {isLoading ? <span className="loading-spinner"></span> : null}
      {children}
    </button>
  )
}

export default Button
