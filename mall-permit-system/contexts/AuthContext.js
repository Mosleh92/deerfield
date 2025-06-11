import { createContext, useContext, useReducer, useEffect } from 'react'
import { useRouter } from 'next/router'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true }
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const router = useRouter()
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const user = await response.json()
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
        
        // Redirect based on role
        const redirectMap = {
          admin: '/admin',
          operations: '/operations',
          technical: '/technical',
          security: '/security',
          tenant: '/tenant'
        }
        
        router.push(redirectMap[data.user.role] || '/')
        return { success: true }
      } else {
        const error = await response.json()
        dispatch({ type: 'LOGIN_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Network error' })
      return { success: false, error: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      dispatch({ type: 'LOGOUT' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      dispatch({ type: 'LOGOUT' })
      router.push('/login')
    }
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      clearError: () => dispatch({ type: 'CLEAR_ERROR' })
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}