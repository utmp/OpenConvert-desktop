// contexts/SettingsContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface AppSettings {
  maxFiles: number
  maxFileSize: number 
  theme: 'light' | 'dark' | 'system'
}

interface SettingsContextType {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetSettings: () => void
  isLoading: boolean
}

const defaultSettings: AppSettings = {
  maxFiles: 90,
  maxFileSize: 50,
  theme: 'system'
}

const SETTINGS_STORAGE_KEY = 'app-settings'

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to handle new settings added in updates
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error)
      // Fallback to defaults
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error)
      }
    }
  }, [settings, isLoading])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem(SETTINGS_STORAGE_KEY)
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      isLoading
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook for getting formatted settings values
export function useFormattedSettings() {
  const { settings } = useSettings()
  
  return {
    ...settings,
    maxFileSizeFormatted: settings.maxFileSize >= 1024 
      ? `${(settings.maxFileSize / 1024).toFixed(1)} GB`
      : `${settings.maxFileSize} MB`,
    maxFileSizeBytes: settings.maxFileSize * 1024 * 1024
  }
}