import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - Tech Gallery',
  description: 'The terms that govern your use of the Tech Gallery storefront and purchases.',
}

const LAST_UPDATED = 'June 30, 2026'

export default function TermsPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-10">
      {/* Header */}
      <div className="mb-10 border-b border-outline-variant pb-6">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em]">Legal</span>
        <h1 className="font-headline-lg text-headline-lg font-black tracking-tight mt-2 uppercase">Terms of Service</h1>
        <p className="font-body-sm text-body-sm text-outline mt-3">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="max-w-3xl space-y-8 font-body-md text-body-md text-on-surface-variant leading-relaxed">
        <p>
          These Terms of Service govern your access to and use of the Tech Gallery storefront and any purchases you
          make. By using the site or placing an order, you agree to these terms.
        </p>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Accounts
          </h2>
          <p>
            You are responsible for the accuracy of the information you provide and for keeping your account credentials
            secure. You must be able to form a binding contract to place an order.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Orders &amp; pricing
          </h2>
          <p>
            All prices are listed in Bangladeshi Taka (৳) and include applicable VAT unless stated otherwise. We may
            update prices, product details, and availability at any time. An order is confirmed only once we accept it;
            we may decline or cancel an order due to stock, pricing errors, or suspected fraud.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Payment, shipping &amp; delivery
          </h2>
          <p>
            Delivery charges are calculated based on your district and area at checkout. Delivery timelines are
            estimates and may vary. Risk of loss passes to you on delivery.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Returns &amp; warranty
          </h2>
          <p>
            Warranty coverage, where applicable, is provided per product as indicated on the product page and is backed
            by the manufacturer. Returns are handled according to our return process — contact us for assistance with a
            claim.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Acceptable use &amp; intellectual property
          </h2>
          <p>
            You agree not to misuse the site, attempt to disrupt it, or use it for unlawful purposes. All content on the
            site, including text, graphics, and logos, is owned by Tech Gallery or its licensors and may not be used
            without permission.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Limitation of liability
          </h2>
          <p>
            To the extent permitted by law, Tech Gallery is not liable for indirect or consequential damages arising
            from your use of the site. Nothing in these terms limits rights you have under applicable consumer law.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Governing law &amp; changes
          </h2>
          <p>
            These terms are governed by the laws of Bangladesh. We may update these terms from time to time; material
            changes will be reflected by updating the date above. Questions? Reach us via the{' '}
            <a href="/contact" className="text-secondary underline">Contact</a> page.
          </p>
        </section>
      </div>
    </div>
  )
}
