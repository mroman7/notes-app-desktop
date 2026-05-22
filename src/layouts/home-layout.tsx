"use client"

import { Sidebar } from '@/components/ui/sidebar'
import React from 'react'

export default function HomeLayout({ children}: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-background">
            {children}  
        </main>
    </main>
  )
}
