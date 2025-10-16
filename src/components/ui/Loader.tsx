import React from 'react'
import { Loader2, Sparkles } from 'lucide-react'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'pulse'
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  text = 'Cargando...',
  fullScreen = false,
  variant = 'spinner'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 backdrop-blur-sm z-50'
    : 'flex items-center justify-center p-8'

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full animate-bounce animation-delay-200" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full animate-bounce animation-delay-400" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )
      case 'pulse':
        return (
          <div className="relative">
            <Sparkles className={`${sizeClasses[size]} text-primary-600 animate-pulse`} />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-20 rounded-full blur-xl animate-pulse"></div>
          </div>
        )
      default:
        return (
          <div className="relative">
            <Loader2
              className={`${sizeClasses[size]} text-primary-600 animate-spin`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-10 rounded-full blur-lg animate-pulse"></div>
          </div>
        )
    }
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4 animate-fadeIn">
        {renderLoader()}
        {text && (
          <p className="text-sm md:text-base text-gray-600 font-semibold animate-pulse-slow gradient-text">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default Loader
