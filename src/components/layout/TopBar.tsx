import Link from 'next/link'

export default function TopBar() {
  return (
    <div className="bg-primary text-white text-label-md font-label-md uppercase tracking-wider py-2 px-gutter-md flex justify-between items-center">
      <span>24H Dispatch Nationwide · Secure 256-bit Checkout</span>
      <div className="hidden sm:flex items-center gap-4">
        <Link href="/track-order" className="hover:text-secondary transition-colors">Track Order</Link>
        <Link href="/contact" className="hover:text-secondary transition-colors">Contact</Link>
      </div>
    </div>
  )
}
