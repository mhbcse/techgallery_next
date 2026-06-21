'use client'

import { useEffect, useState } from 'react'
import { getSettings } from '@/api/settings'
import type { Settings } from '@/api/types'

export default function TrackingScripts() {
  const [settings, setSettings] = useState<Settings | null>(null)

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!settings) return

    if (settings.meta_pixel_id) {
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

    if (settings.google_analytics_id) {
      const gaScript = document.createElement('script')
      gaScript.async = true
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`
      document.head.appendChild(gaScript)

      const gaInit = document.createElement('script')
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `
      document.head.appendChild(gaInit)
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
