'use client'

import { useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'
import type { ImageMeta } from '@/api/types'

interface BlurImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  meta?: ImageMeta | null
  fit?: 'cover' | 'contain'
}

// Paints the image's own 32px preview behind it until the real bytes arrive. The preview is
// inlined rather than fetched: one that needs its own request lands after first paint, which
// is the moment it exists to serve.
export default function BlurImage({ meta, fit = 'cover', src, style, onLoad, ...props }: BlurImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const lqip = loadedSrc === src ? null : meta?.lqip

  const markLoaded = (e?: SyntheticEvent<HTMLImageElement>) => {
    if (src) setLoadedSrc(src)
    if (e) onLoad?.(e)
  }

  return (
    <img
      {...props}
      src={src}
      // A cached image can finish before React attaches onLoad, stranding the preview behind it.
      ref={(node) => { if (node?.complete) markLoaded() }}
      onLoad={markLoaded}
      style={
        lqip
          ? {
              backgroundImage: `url(data:image/webp;base64,${lqip})`,
              backgroundSize: fit,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              ...style,
            }
          : style
      }
    />
  )
}
