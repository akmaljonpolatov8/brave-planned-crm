export interface User {
  role: 'owner' | 'manager' | 'teacher'
}

export function canCreate(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}

export function canEdit(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}

export function canDelete(user: User | null) {
  return user?.role === 'owner'
}

export function canViewRevenue(user: User | null) {
  return user?.role === 'owner'
}

export function canManageAttendance(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}

export function canManagePayments(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}

export function canSendSMS(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}

export function canEditPrice(user: User | null) {
  return user?.role === 'owner' || user?.role === 'manager'
}
