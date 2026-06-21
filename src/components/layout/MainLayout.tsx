import TopBar from './TopBar'
import Navbar from './Navbar'
import Footer from './Footer'
import CartAddedModal from '@/components/cart/CartAddedModal'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartAddedModal />
    </div>
  )
}
