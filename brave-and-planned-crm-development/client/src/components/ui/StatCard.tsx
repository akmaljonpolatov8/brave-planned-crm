import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  change?: string
  isLoading?: boolean
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, change, isLoading }) => {
  if (isLoading) {
    return (
      <div className="stat-card">
        <div className="stat-label"></div>
        <div className="skeleton" style={{ height: '48px', marginBottom: '8px' }}></div>
        <div className="skeleton" style={{ height: '14px' }}></div>
      </div>
    )
  }

  return (
    <div className="stat-card bp-fadeup">
      <div className="stat-label">
        {icon}
        {label}
      </div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change positive">{change}</div>}
    </div>
  )
}

export default StatCard
