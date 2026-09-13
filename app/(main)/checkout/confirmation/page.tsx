import { Suspense } from 'react'
import Spinner from '@/components/ui/Spinner'
import OrderConfirmationPage from '@/views/OrderConfirmationPage'

export default function OrderConfirmationRoute() {
  return (
    // OrderConfirmationPage reads useSearchParams, so it must be inside Suspense.
    <Suspense
      fallback={
        <div className="max-w-container-max mx-auto px-margin-lg py-20 flex justify-center">
          <Spinner />
        </div>
      }
    >
      <OrderConfirmationPage />
    </Suspense>
  )
}
