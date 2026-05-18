import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'

const AppLayout: React.FC = () => {
  const { user } = useAuth()

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '260px', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout
