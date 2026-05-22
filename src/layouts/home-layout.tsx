"use client"

import { Sidebar } from '@/components/ui/sidebar'
import React from 'react'

export default function HomeLayout({ children}: { children: React.ReactNode }) {
  return (
    <main className="h-screen overflow-hidden flex flex-row items-start relative">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-background h-screen overflow-hidden">
            {children}  
        </main>
    </main>
  )
}
