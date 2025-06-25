"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlacklistButtonProps {
  propertyId: number
  onBlacklist: (propertyId: number) => Promise<void>
  isLoading?: boolean
  isBlacklisted?: boolean
  size?: 'sm' | 'lg' | 'default' | 'icon'
  variant?: 'default' | 'ghost' | 'destructive'
  className?: string
}

export function BlacklistButton({
  propertyId,
  onBlacklist,
  isLoading = false,
  isBlacklisted = false,
  size = 'default',
  variant = 'ghost',
  className
}: BlacklistButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (isBlacklisted) return
    
    if (!showConfirm) {
      setShowConfirm(true)
    } else {
      onBlacklist(propertyId)
      setShowConfirm(false)
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowConfirm(false)
  }

  if (isBlacklisted) {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn(
          "text-gray-400 cursor-not-allowed",
          className
        )}
      >
        <Check className="w-4 h-4 mr-1" />
        Removed
      </Button>
    )
  }

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    default: "h-8 px-3 text-sm", 
    lg: "h-9 px-4 text-sm",
    icon: "h-8 w-8 p-0"
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!showConfirm ? (
          <motion.div
            key="delete-button"
            initial={{ scale: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Button
              variant={variant}
              size={size}
              onClick={handleClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading}
              className={cn(
                "group transition-all duration-200",
                "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
                "focus:bg-red-50 focus:text-red-600 focus:border-red-200",
                sizeClasses[size],
                className
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <motion.div
                    animate={{ 
                      rotate: isHovered ? [0, -10, 10, -5, 0] : 0,
                      scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                  </motion.div>
                  <span className="hidden sm:inline">Remove</span>
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm-buttons"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-1"
          >
            <Button
              variant="destructive"
              size={size}
              onClick={handleClick}
              disabled={isLoading}
              className={cn(
                "bg-red-600 hover:bg-red-700 text-white border-red-600",
                sizeClasses[size]
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline text-xs">Yes</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size={size}
              onClick={handleCancel}
              className={cn(
                "text-gray-600 hover:bg-gray-100",
                sizeClasses[size]
              )}
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline text-xs ml-1">No</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 