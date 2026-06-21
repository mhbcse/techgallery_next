'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar({ className = '' }: { className?: string }) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`)
      setQuery('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full rounded-full bg-rose-blush border-none pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-slate-400 text-xl">search</span>
    </form>
  )
}
