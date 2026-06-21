'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { registerSchema, type RegisterFormData } from '@/lib/validators'
import { useTitle } from '@/hooks/useTitle'

export default function RegisterPage() {
  useTitle('Create Account - Baby Gallery')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedTerms, setAgreedTerms] = useState(false)

  const router = useRouter()
  const { register: registerUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    if (!agreedTerms) {
      toast.error('Please agree to the Terms & Conditions')
      return
    }
    try {
      await registerUser({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
      })
      toast.success('Account created successfully!')
      router.push('/account')
    } catch {
      toast.error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-pink-100">
      {/* Left Side - Decorative */}
      <div className="md:w-1/2 bg-pink-50 relative p-12 flex flex-col justify-between overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/4 right-0 w-16 h-16 bg-pink-200/20 rounded-full blur-xl" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-pink-200">
              <span className="material-icons-outlined text-white">child_care</span>
            </div>
            <span className="text-2xl font-bold text-slate-800 tracking-tight">Baby Gallery</span>
          </div>

          <h1 className="text-4xl font-extrabold text-slate-800 leading-tight mb-4">
            Join Our <br /> <span className="text-primary">Happy Family</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-sm">
            Discover the finest collection of party dresses, adorable bags, and educational toys for your little ones.
          </p>
        </div>

        <div className="relative z-10 mt-12">
          <img
            src="/assets/carton-girl.webp"
            alt="Happy Child"
            className="rounded-xl shadow-lg border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform duration-500"
          />

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-pink-200 flex items-center justify-center text-xs font-bold text-primary">A</div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-rose-200 flex items-center justify-center text-xs font-bold text-primary">S</div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-pink-300 flex items-center justify-center text-xs font-bold text-white">R</div>
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">2,000+</span> parents joined this week
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 p-8 md:p-12">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Account</h2>
            <p className="text-slate-500">Please fill in the details below to start shopping.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <span className="material-icons-outlined text-lg">person</span>
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 outline-none ${
                    errors.name ? 'border-red-400 focus:ring-red-400' : ''
                  }`}
                  {...register('name')}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm">
                  +880
                </span>
                <input
                  type="tel"
                  placeholder="1XXXXXXXXX"
                  className={`block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 outline-none ${
                    errors.phone ? 'border-red-400 focus:ring-red-400' : ''
                  }`}
                  {...register('phone')}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <span className="material-icons-outlined text-lg">alternate_email</span>
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 outline-none ${
                    errors.email ? 'border-red-400 focus:ring-red-400' : ''
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password + Confirm side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <span className="material-icons-outlined text-lg">lock</span>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 outline-none ${
                      errors.password ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="material-icons-outlined text-slate-400 text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <span className="material-icons-outlined text-lg">lock_reset</span>
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-slate-900 outline-none ${
                      errors.confirmPassword ? 'border-red-400 focus:ring-red-400' : ''
                    }`}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="material-icons-outlined text-slate-400 text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-3 mt-2">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary focus:ring-offset-0 bg-slate-50 cursor-pointer"
                />
              </div>
              <label className="text-sm text-slate-500 leading-tight">
                I agree to the{' '}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-pink-600 text-white font-bold py-4 rounded-lg shadow-lg shadow-pink-200/50 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              )}
              Join Baby Gallery
              <span className="material-icons-outlined">arrow_forward</span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <span className="material-icons-outlined text-lg text-slate-500">g_translate</span>
                <span className="text-sm font-semibold text-slate-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <span className="text-blue-600 text-xl font-bold leading-none">f</span>
                <span className="text-sm font-semibold text-slate-700">Facebook</span>
              </button>
            </div>

            {/* Sign In Link */}
            <p className="text-center text-sm text-slate-500 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
