import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, BookOpen, Layers, Calendar, CreditCard,
  AlertCircle, MessageSquare, LogOut, User
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/groups', icon: Layers, label: 'Guruhlar' },
    { path: '/students', icon: Users, label: "O'quvchilar" },
    { path: '/teachers', icon: BookOpen, label: "O'qituvchilar" },
    { path: '/attendance', icon: Calendar, label: 'Davomat' },
    { path: '/payments', icon: CreditCard, label: "To'lovlar" },
    { path: '/debtors', icon: AlertCircle, label: 'Qarzdorlar' },
    { path: '/sms', icon: MessageSquare, label: 'SMS yuborish' },
  ]

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,214,98,0.12)' }}>
        <h1 style={{ fontSize: '20px', color: '#FFD662', marginBottom: '2px', fontWeight: 700 }}>
          Brave & Planned
        </h1>
        <p style={{ fontSize: '11px', color: '#c4a8d8', margin: 0 }}>CRM tizimi</p>
      </div>

      {/* Navigation */}
      <nav style={{ marginTop: '16px', flex: 1 }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User info + Logout */}
      <div style={{ padding: '16px 16px 8px', borderTop: '1px solid rgba(255,214,98,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,214,98,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={18} style={{ color: '#FFD662' }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: '13px', color: '#f0e6ff', fontWeight: 600 }}>
              {user?.full_name || user?.username}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#c4a8d8', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', color: '#f87171', margin: 0, padding: '8px 12px' }}
        >
          <LogOut size={16} />
          <span>Chiqish</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
