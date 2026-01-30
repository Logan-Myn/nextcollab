'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';

interface ThemeToggleProps {
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
}

export function ThemeToggle({ variant = 'full', className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={`icon-btn ${className}`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`theme-toggle ${className}`}>
        <button
          onClick={() => setTheme('light')}
          className={`theme-toggle-option ${theme === 'light' ? 'active' : ''}`}
          title="Light mode"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`theme-toggle-option ${theme === 'dark' ? 'active' : ''}`}
          title="Dark mode"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Full variant with labels
  return (
    <div className={`theme-toggle ${className}`}>
      <button
        onClick={() => setTheme('light')}
        className={`theme-toggle-option flex items-center gap-1.5 ${theme === 'light' ? 'active' : ''}`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Light</span>
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`theme-toggle-option flex items-center gap-1.5 ${theme === 'dark' ? 'active' : ''}`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Dark</span>
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`theme-toggle-option flex items-center gap-1.5 ${theme === 'system' ? 'active' : ''}`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>System</span>
      </button>
    </div>
  );
}
