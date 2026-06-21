import MainLayout from '@/components/layout/MainLayout'
import TrackingScripts from '@/components/common/TrackingScripts'
import AttributionTracker from '@/components/common/AttributionTracker'

export default function MainRouteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <TrackingScripts />
      <AttributionTracker />
      {children}
    </MainLayout>
  )
}
