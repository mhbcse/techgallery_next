'use client'

import { useState, useEffect } from 'react'

function getTimeLeft(endDate: Date) {
  const diff = endDate.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function FlashSaleCountdown() {
  const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(endDate)), 1000)
    return () => clearInterval(timer)
  }, [])

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <section className="bg-sale-yellow py-6 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-4xl text-slate-900 animate-pulse">bolt</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter">Flash Sale</h2>
          </div>
          <div className="bg-slate-900 text-sale-yellow px-6 py-2 rounded-full font-black text-xl md:text-2xl italic tracking-tight shadow-lg">
            Up to 50% Off
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3">
            {blocks.map((block, i) => (
              <div key={block.label} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <span className="bg-white text-slate-900 w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                    {String(block.value).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-900 uppercase mt-1">{block.label}</span>
                </div>
                {i < blocks.length - 1 && (
                  <span className="text-2xl font-black text-slate-900">:</span>
                )}
              </div>
            ))}
          </div>
          <a
            href="/shop"
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-0.5 flex items-center gap-2 group whitespace-nowrap"
          >
            Shop Now
            <span className="material-icons-outlined text-lg group-hover:translate-x-1 transition-transform">bolt</span>
          </a>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-64 h-full bg-white/10 skew-x-12 translate-x-32 pointer-events-none" />
      <div className="absolute top-0 left-0 w-32 h-full bg-white/10 -skew-x-12 -translate-x-16 pointer-events-none" />
    </section>
  )
}
