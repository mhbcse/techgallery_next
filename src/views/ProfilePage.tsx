'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { useTitle } from '@/hooks/useTitle'
import { useAuthStore } from '@/stores/authStore'
import { profileSchema, type ProfileFormData } from '@/lib/validators'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  useTitle('My Profile - Baby Gallery')

  const { user, updateProfile } = useAuthStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-slate-900 font-display">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-icons text-primary text-4xl">person</span>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-1">
            <h2 className="text-xl font-bold text-slate-900">{user?.name || 'N/A'}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="material-icons-outlined text-base">email</span>
              {user?.email || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="material-icons-outlined text-base">phone</span>
              {user?.phone || 'N/A'}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="material-icons-outlined text-base">calendar_today</span>
              Member since {memberSince}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl">
          <Input
            label="Full Name"
            icon="person"
            placeholder="Your full name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            icon="alternate_email"
            type="email"
            placeholder="your@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Address"
            icon="location_on"
            placeholder="Your delivery address"
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="pt-2">
            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              <span className="material-icons-outlined text-lg">save</span>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
