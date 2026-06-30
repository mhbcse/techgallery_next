import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Tech Gallery',
  description: 'How Tech Gallery collects, uses, and protects your personal information.',
}

const LAST_UPDATED = 'June 30, 2026'

export default function PrivacyPage() {
  return (
    <div className="max-w-container-max mx-auto px-margin-lg py-10">
      {/* Header */}
      <div className="mb-10 border-b border-outline-variant pb-6">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-[0.2em]">Legal</span>
        <h1 className="font-headline-lg text-headline-lg font-black tracking-tight mt-2 uppercase">Privacy Policy</h1>
        <p className="font-body-sm text-body-sm text-outline mt-3">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="max-w-3xl space-y-8 font-body-md text-body-md text-on-surface-variant leading-relaxed">
        <p>
          Tech Gallery (&quot;we&quot;, &quot;us&quot;) respects your privacy. This policy explains what information we
          collect when you use our storefront, how we use it, and the choices you have. By using the site you agree to
          the practices described here.
        </p>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Information we collect
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account details</strong> — name, phone number, email address, and delivery address you provide when registering or placing an order.</li>
            <li><strong>Order information</strong> — items purchased, amounts, delivery district/area, and order history.</li>
            <li><strong>Usage &amp; device data</strong> — pages visited, referrer, and attribution parameters (e.g. UTM tags, ad click IDs) captured via first-party cookies.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            How we use your information
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Process and deliver your orders and provide customer support.</li>
            <li>Manage your account and order history.</li>
            <li>Understand site performance and measure marketing effectiveness.</li>
            <li>Communicate order updates and, where you opt in, product news.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Cookies &amp; analytics
          </h2>
          <p>
            We use first-party cookies for sessions and attribution, and third-party analytics and advertising tools
            (such as Meta Pixel, Google Analytics, and Google Tag Manager) to understand traffic and conversions. You
            can control cookies through your browser settings; disabling them may affect site functionality.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Sharing your information
          </h2>
          <p>
            We do not sell your personal data. We share it only as needed with delivery partners to fulfil orders,
            payment processors, and analytics/advertising providers, or where required by law.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Data retention &amp; security
          </h2>
          <p>
            We retain personal information for as long as needed to provide our services and meet legal obligations, and
            we apply reasonable safeguards (including encrypted transactions) to protect it. No method of transmission is
            completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Your rights
          </h2>
          <p>
            You may request access to, correction of, or deletion of your personal information. To make a request,
            contact us through the <a href="/contact" className="text-secondary underline">Contact</a> page.
          </p>
        </section>

        <section>
          <h2 className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface mb-2">
            Changes to this policy
          </h2>
          <p>
            We may update this policy from time to time. Material changes will be reflected by updating the date above.
          </p>
        </section>
      </div>
    </div>
  )
}
