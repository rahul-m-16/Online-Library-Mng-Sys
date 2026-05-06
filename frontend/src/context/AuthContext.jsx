import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const initialState = {
  user:            null,
  token:           localStorage.getItem('lms_token') || null,
  isAuthenticated: false,
  loading:         true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('lms_token', action.payload.token)
      localStorage.setItem('lms_user', JSON.stringify(action.payload.user))
      return { ...state, user: action.payload.user, token: action.payload.token, isAuthenticated: true, loading: false }
    case 'LOGOUT':
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Validate token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('lms_token')
      if (!token) { dispatch({ type: 'SET_LOADING', payload: false }); return }
      try {
        const { data } = await api.get('/auth/me')
        dispatch({ type: 'SET_USER', payload: data.user })
      } catch {
        dispatch({ type: 'LOGOUT' })
      }
    }
    verifyToken()
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    return data
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
