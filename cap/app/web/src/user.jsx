import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, getDevUser, setDevUser, SRC } from './api.js'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setUser(await api.get(`${SRC}/userInfo()`))
      setError(null)
    } catch (e) {
      setError(e)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const switchDevUser = async name => {
    setDevUser(name)
    setUser(null)
    await load()
  }

  const roles = user?.roles ?? []
  const value = {
    user,
    error,
    devUser: getDevUser(),
    switchDevUser,
    canEdit: roles.includes('SrcEditor'),
    canApprove: roles.includes('SrcApprover'),
    canAdmin: roles.includes('SrcAdmin')
  }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => useContext(UserContext)
