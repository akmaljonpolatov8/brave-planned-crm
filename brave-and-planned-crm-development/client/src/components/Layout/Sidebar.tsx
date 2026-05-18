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

  return (
    <div className="sidebar">
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,214,98,0.18)' }}>
        <h1 style={{ fontSize: '24px', color: '#FFD662', marginBottom: '4px' }}>BP</h1>
        <p style={{ fontSize: '12px', color: '#c4a8d8', margin: '0' }}>Brave and Planet</p>
      </div>

      <nav style={{ marginTop: '24px' }}>
        <Link to="/" className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link to="/students" className={`sidebar-link ${isActive('/students') ? 'active' : ''}`}>
          <Users size={20} />
          <span>O'quvchilar</span>
        </Link>

        <Link to="/teachers" className={`sidebar-link ${isActive('/teachers') ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>O'qituvchilar</span>
        </Link>

        <Link to="/groups" className={`sidebar-link ${isActive('/groups') ? 'active' : ''}`}>
          <Layers size={20} />
          <span>Guruhlar</span>
        </Link>

        <Link to="/attendance" className={`sidebar-link ${isActive('/attendance') ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Davomat</span>
        </Link>

        <Link to="/payments" className={`sidebar-link ${isActive('/payments') ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>To'lovlar</span>
        </Link>

        <Link to="/debtors" className={`sidebar-link ${isActive('/debtors') ? 'active' : ''}`}>
          <AlertCircle size={20} />
          <span>Qarzdorlar</span>
        </Link>

        <Link to="/sms" className={`sidebar-link ${isActive('/sms') ? 'active' : ''}`}>
          <MessageSquare size={20} />
          <span>SMS</span>
        </Link>
      </nav>

      <div style={{ padding: '0 20px', marginTop: 'auto', borderTop: '1px solid rgba(255,214,98,0.18)' }}>
        <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <User size={20} style={{ color: '#FFD662' }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#f0e6ff', fontWeight: '600' }}>{user?.full_name}</p>
            <p style={{ margin: '0', fontSize: '11px', color: '#c4a8d8' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'rgba(248,113,113,0.15)',
            color: '#f87171',
            border: 'none',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.25)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
        >
          <LogOut size={16} />
          Chiqish
        </button>
      </div>
    </div>
  )
}

export default Sidebar
