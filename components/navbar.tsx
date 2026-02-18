'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const {user, logout} = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              CR
            </div>
            <span className="hidden sm:inline font-bold text-foreground">CityReport</span>
          </Link>

          <div className="flex items-center gap-4">
            {!isLoading && user ? (
              <>
                <Link href="/issues" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Browse Issues
                </Link>
                <Link href="/report" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Report Issue
                </Link>
                <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/issues" className="text-sm text-muted-foreground hover:text-foreground transition">
                  Browse Issues
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
