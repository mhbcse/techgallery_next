'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTitle } from '@/hooks/useTitle'
import { useAuthStore } from '@/stores/authStore'
import { loginSchema, type LoginFormData } from '@/lib/validators'

type Tab = 'password' | 'otp'

// OTP login is not implemented yet — hidden until the backend is ready.
// Flip to true to re-enable the OTP tab and the password-tab quick-access block.
const OTP_ENABLED = false

export default function LoginPage() {
  useTitle('Login - Tech Gallery')

  const [activeTab, setActiveTab] = useState<Tab>('password')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(59)
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [phone, setPhone] = useState('')
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // OTP countdown timer
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return
    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [otpSent, otpTimer])

  const onPasswordSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      const from = searchParams?.get('from') || '/account'
      router.push(from)
    } catch {
      toast.error('Invalid email or password')
    }
  }

  const handleGetOtp = () => {
    if (!phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }
    setOtpSent(true)
    setOtpTimer(59)
    toast('OTP feature coming soon', { icon: '🔜' })
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpSubmit = () => {
    toast('OTP feature coming soon', { icon: '🔜' })
  }

  return (
    <div className="max-w-md w-full">
      {/* Logo & Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          aria-label="Tech Gallery home"
          className="inline-flex items-center justify-center w-20 h-20 bg-surface-container-lowest border border-outline-variant mb-4 ring-4 ring-secondary/10 hover:border-secondary transition-colors"
        >
          <img src="/assets/logo-vertical-blue.png" alt="Tech Gallery" className="w-14 h-14 object-contain" />
        </Link>
        <h1 className="text-headline-lg font-display font-bold text-on-surface">Welcome Back!</h1>
        <p className="text-on-surface-variant mt-2 text-body-md">Log in to gear up your setup</p>
      </div>

      {/* Card */}
      <div className="bg-surface-container-lowest border border-outline-variant overflow-hidden">
        {/* Tabs */}
        {OTP_ENABLED && (
        <div className="flex border-b border-outline-variant bg-surface-container-low">
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-4 text-label-md uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'password'
                ? 'text-secondary border-secondary bg-surface-container-lowest'
                : 'text-on-surface-variant border-transparent hover:text-secondary'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">lock</span>
              Password Login
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('otp')}
            className={`flex-1 py-4 text-label-md uppercase tracking-wider transition-colors border-b-2 ${
              activeTab === 'otp'
                ? 'text-secondary border-secondary bg-surface-container-lowest'
                : 'text-on-surface-variant border-transparent hover:text-secondary'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">textsms</span>
              OTP Login
            </span>
          </button>
        </div>
        )}

        {/* Form Content */}
        <div className="p-8">
          {/* Password Tab */}
          {activeTab === 'password' && (
            <>
              <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-5">
                {/* Email or Phone */}
                <div>
                  <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5">
                    Email or Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Enter your email or phone"
                      className={`block w-full pl-10 pr-3 py-2.5 border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all text-body-sm outline-none ${
                        errors.email ? 'border-red-400 focus:ring-red-400' : ''
                      }`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant">Password</label>
                    <Link href="#" className="text-xs font-semibold text-secondary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">vpn_key</span>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`block w-full pl-10 pr-10 py-2.5 border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all text-body-sm outline-none ${
                        errors.password ? 'border-red-400 focus:ring-red-400' : ''
                      }`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-secondary"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="h-4 w-4 text-secondary focus:ring-secondary border-outline-variant cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-body-sm text-on-surface cursor-pointer">
                    Keep me logged in
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-secondary text-white font-label-md uppercase tracking-widest py-3 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting && (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  )}
                  Login to Account
                </button>
              </form>

              {OTP_ENABLED && (
              <>
              {/* OTP Quick Access Divider */}
              <div className="my-8 flex items-center text-outline-variant">
                <div className="flex-grow border-t border-outline-variant" />
                <span className="px-3 text-label-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  OTP Quick Access
                </span>
                <div className="flex-grow border-t border-outline-variant" />
              </div>

              {/* OTP Quick Access Section */}
              <div className="space-y-5">
                <div>
                  <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg">smartphone</span>
                      </span>
                      <input
                        type="tel"
                        placeholder="01XXX-XXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all text-body-sm outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGetOtp}
                      className="bg-primary text-white hover:bg-secondary font-label-md uppercase tracking-widest px-5 text-sm whitespace-nowrap transition-all"
                    >
                      Get OTP
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">Verification Code</label>
                  <div className="grid grid-cols-6 gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full h-14 text-center text-xl font-bold border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all outline-none"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-center text-xs text-on-surface-variant">
                    Didn't receive the code?{' '}
                    {otpTimer > 0 && otpSent ? (
                      <span className="text-secondary font-bold">
                        Resend in 00:{otpTimer.toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGetOtp}
                        className="text-secondary font-bold hover:underline"
                      >
                        Resend
                      </button>
                    )}
                  </p>
                </div>
              </div>
              </>
              )}
            </>
          )}

          {/* OTP Tab (focused OTP view) */}
          {OTP_ENABLED && activeTab === 'otp' && (
            <div className="space-y-5">
              <div>
                <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-1.5">Phone Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">smartphone</span>
                    </span>
                    <input
                      type="tel"
                      placeholder="01XXX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all text-body-sm outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    className="bg-primary text-white hover:bg-secondary font-label-md uppercase tracking-widest px-5 text-sm whitespace-nowrap transition-all"
                  >
                    Get OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <>
                  <div>
                    <label className="block text-label-sm uppercase tracking-wider text-on-surface-variant mb-3">Verification Code</label>
                    <div className="grid grid-cols-6 gap-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-full h-14 text-center text-xl font-bold border border-outline-variant bg-white text-on-surface focus:ring-1 focus:ring-secondary transition-all outline-none"
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-center text-xs text-on-surface-variant">
                      Didn't receive the code?{' '}
                      {otpTimer > 0 ? (
                        <span className="text-secondary font-bold">
                          Resend in 00:{otpTimer.toString().padStart(2, '0')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGetOtp}
                          className="text-secondary font-bold hover:underline"
                        >
                          Resend
                        </button>
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOtpSubmit}
                    className="w-full bg-primary hover:bg-secondary text-white font-label-md uppercase tracking-widest py-3 transition-all flex items-center justify-center gap-2"
                  >
                    Verify & Login
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-8 py-5 bg-surface-container-low border-t border-outline-variant text-center">
          <p className="text-body-sm text-on-surface-variant">
            New to Tech Gallery?{' '}
            <Link href="/register" className="text-secondary font-bold hover:underline ml-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
        <Link href="/" className="flex items-center gap-2 text-body-sm font-medium text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined text-sm">home</span>
          Back to Store
        </Link>
        <span className="hidden sm:block w-1.5 h-1.5 bg-outline-variant" />
        <Link href="#" className="text-body-sm font-medium text-on-surface-variant hover:text-secondary transition-colors">
          Help Center
        </Link>
        <span className="hidden sm:block w-1.5 h-1.5 bg-outline-variant" />
        <Link href="/privacy" className="text-body-sm font-medium text-on-surface-variant hover:text-secondary transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}
