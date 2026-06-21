import { Suspense } from 'react'
import OrderHistoryPage from '@/views/OrderHistoryPage'

export default function OrderHistoryRoute() {
  return (
    <Suspense>
      <OrderHistoryPage />
    </Suspense>
  )
}
