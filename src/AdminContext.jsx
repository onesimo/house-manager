import { createContext, useContext, useState } from 'react'

const AdminContext = createContext()

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('admin') === 'true')

  const unlock = (pin) => {
    if (pin === '8787') {
      setIsAdmin(true)
      sessionStorage.setItem('admin', 'true')
      return true
    }
    return false
  }

  const lock = () => {
    setIsAdmin(false)
    sessionStorage.removeItem('admin')
  }

  return (
    <AdminContext.Provider value={{ isAdmin, unlock, lock }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
