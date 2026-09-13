import MainLayout from '@/components/layout/MainLayout'
import TrackingScripts from '@/components/common/TrackingScripts'
import AttributionTracker from '@/components/common/AttributionTracker'
import CouponCapture from '@/components/common/CouponCapture'

export default function MainRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <TrackingScripts />
      <AttributionTracker />
      <CouponCapture />
      {children}
    </MainLayout>
  )
}
