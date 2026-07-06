'use client'

import { useEffect, useState } from 'react'
import { getSettings } from '@/api/settings'
import type { Settings } from '@/api/types'
import { configurePixels, setCustomerMatch } from '@/lib/pixel'
import { readCheckoutDetails } from '@/lib/checkoutDetails'

// Guards against duplicate <script> injection: StrictMode double-mount in dev,
// (main) layout remounts in prod. Module scope survives remounts; a full page
// load resets it along with the injected tags.
let scriptsInjected = false

export default function TrackingScripts() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!settings) return

    configurePixels(settings)

    const saved = readCheckoutDetails()
    if (saved.email || saved.phone) void setCustomerMatch({ email: saved.email, phone: saved.phone })

    if (scriptsInjected) return
    scriptsInjected = true

    if (settings.meta_pixel_id && settings.meta_browser_push_method !== 'google_tag_manager') {
      const script = document.createElement('script')
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.meta_pixel_id}');
        fbq('track', 'PageView');
      `
      document.head.appendChild(script)
    }

    const googleTagId =
      settings.google_browser_push_method === 'google_analytics_4'
        ? settings.google_analytics_id
        : settings.google_browser_push_method === 'google_ads_tag'
          ? settings.google_ads_tag_id
          : null

    if (googleTagId) {
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleTagId}`
      document.head.appendChild(gtagScript)

      const gtagInit = document.createElement('script')
      gtagInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleTagId}');
      `
      document.head.appendChild(gtagInit)
    }

    if (settings.tiktok_pixel_id && settings.tiktok_browser_push_method !== 'google_tag_manager') {
      const ttScript = document.createElement('script')
      ttScript.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
          ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
          ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
          for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
          ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
          ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
          ttq.load('${settings.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `
      document.head.appendChild(ttScript)
    }

    if (settings.microsoft_clarity_id) {
      const clarityScript = document.createElement('script')
      clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${settings.microsoft_clarity_id}");
      `
      document.head.appendChild(clarityScript)
    }

    if (settings.google_tag_manager_id) {
      const gtmScript = document.createElement('script')
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
      `
      document.head.appendChild(gtmScript)
    }
  }, [settings])

  return null
}
