import React from 'react'

interface BadgeProps {
  variant?: 'paid' | 'unpaid' | 'pending' | 'active' | 'inactive'
  children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ variant = 'pending', children }) => {
  const variantClass = {
    paid: 'badge-paid',
    unpaid: 'badge-unpaid',
    pending: 'badge-pending',
    active: 'badge-active',
    inactive: 'badge-inactive'
  }[variant]

  return <span className={`badge ${variantClass}`}>{children}</span>
}

export default Badge
