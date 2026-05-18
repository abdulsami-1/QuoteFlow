'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', setTheme: () => {} })

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(t)
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'light'
    setThemeState(stored)
    applyTheme(stored)
  }, [])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
