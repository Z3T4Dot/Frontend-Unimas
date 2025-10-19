import { Phone, CheckCircle2 } from 'lucide-react'
import { ChangeEvent, FocusEvent, useState } from 'react'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  error?: string
}

export default function PhoneInput({
  value,
  onChange,
  placeholder = '424 1234567',
  required = false,
  disabled = false,
  className = '',
  error
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '')

    // Remove leading zeros
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }

    // If starts with 58, remove it temporarily for formatting
    let hasPrefix = false
    if (cleaned.startsWith('58')) {
      cleaned = cleaned.substring(2)
      hasPrefix = true
    }

    // Limit to 10 digits after removing prefix
    cleaned = cleaned.substring(0, 10)

    // Format: XXX XXXXXXX
    let formatted = ''
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = cleaned
      } else {
        formatted = `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`
      }
    }

    // Add prefix if it was there or if there's content
    if (hasPrefix || cleaned.length > 0) {
      formatted = `+58 ${formatted}`.trim()
    }

    return formatted
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    onChange(formatted)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    const currentValue = e.target.value
    if (currentValue && !currentValue.startsWith('+58')) {
      const formatted = formatPhoneNumber(currentValue)
      onChange(formatted)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const isValid = value.length >= 16 // +58 XXX XXXXXXX = 16 characters minimum

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Phone Icon */}
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${
          isFocused ? 'text-pink-500' : 'text-gray-400'
        }`}>
          <Phone className="h-5 w-5" />
        </div>

        {/* Input Field */}
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            block w-full pl-12 pr-12 py-3.5
            border-2 rounded-xl
            font-medium text-gray-900
            placeholder:text-gray-400 placeholder:font-normal
            transition-all duration-200
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : isFocused
              ? 'border-pink-500 ring-4 ring-pink-100'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${className}
          `}
        />

        {/* Valid Check Icon */}
        {isValid && !error && value && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <CheckCircle2 className="h-5 w-5 text-green-500 animate-in fade-in duration-200" />
          </div>
        )}

        {/* Prefix Label */}
        <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
          <span className={`text-sm font-semibold transition-colors ${
            isFocused ? 'text-pink-600' : 'text-gray-500'
          }`}>
            +58
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 animate-in slide-in-from-top-1 duration-200">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Help Text */}
      {!error && (
        <div className="mt-2 flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            isFocused ? 'bg-pink-500' : 'bg-gray-300'
          }`}></div>
          <p className={`text-xs font-medium transition-colors ${
            isFocused ? 'text-pink-600' : 'text-gray-500'
          }`}>
            Formato automático: +58 XXX XXXXXXX
          </p>
        </div>
      )}
    </div>
  )
}
