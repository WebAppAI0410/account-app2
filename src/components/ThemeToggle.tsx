'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/context/ThemeContext'
import useTranslation from '@/hooks/use-translation'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="theme-toggle"
        checked={theme === 'dark'}
        onCheckedChange={toggleTheme}
        aria-label={theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
      />
      <label 
        htmlFor="theme-toggle" 
        className="text-sm cursor-pointer"
        onClick={toggleTheme}
      >
        {theme === 'dark' ? t('Dark Mode') : t('Light Mode')}
      </label>
    </div>
  )
}