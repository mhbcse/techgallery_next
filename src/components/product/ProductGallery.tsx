'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

const FALLBACK_SRC = '/assets/logo-vertical-blue.png'
const SWIPE_THRESHOLD = 40 // px of horizontal travel to count as a swipe
const MAX_ZOOM = 4
const DOUBLE_TAP_ZOOM = 2.5

interface ProductGalleryProps {
  images: string[]
  activeImage: string | null
  onActiveImageChange: (url: string) => void
  alt: string
  badge?: ReactNode
  maxThumbnails?: number
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export default function ProductGallery({
  images,
  activeImage,
  onActiveImageChange,
  alt,
  badge,
  maxThumbnails,
}: ProductGalleryProps) {
  const hasImages = images.length > 0
  const rawIndex = activeImage ? images.indexOf(activeImage) : -1
  const currentIndex = rawIndex < 0 ? 0 : rawIndex

  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goTo = (index: number) => {
    if (!hasImages) return
    const next = clamp(index, 0, images.length - 1)
    if (images[next]) onActiveImageChange(images[next])
  }

  // ----- Inline swipe on the main image -----
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    didSwipe.current = false
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    const dy = e.touches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || images.length < 2) return
    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      goTo(currentIndex + (dx < 0 ? 1 : -1))
    }
  }

  const openLightbox = () => {
    // A swipe ends with a synthetic click — don't let it open the viewer.
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    if (hasImages) setLightboxOpen(true)
  }

  const thumbnails = maxThumbnails ? images.slice(0, maxThumbnails) : images

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {thumbnails.length > 0 && (
        <div className="flex md:flex-col gap-3">
          {thumbnails.map((url) => (
            <button
              key={url}
              onClick={() => onActiveImageChange(url)}
              className={`w-20 h-24 overflow-hidden flex-shrink-0 border ${
                activeImage === url ? 'border-2 border-secondary' : 'border-outline-variant'
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 relative">
        <div className="aspect-[4/5] bg-surface-container industrial-grid overflow-hidden border border-outline-variant relative">
          <div className="absolute -top-px -left-px w-10 h-10 border-t-2 border-l-2 border-secondary z-10" />
          <div className="absolute -bottom-px -right-px w-10 h-10 border-b-2 border-r-2 border-secondary z-10" />
          {badge}
          <img
            src={activeImage || FALLBACK_SRC}
            alt={alt}
            onClick={openLightbox}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`w-full h-full object-contain p-6 ${hasImages ? 'cursor-zoom-in' : ''}`}
            style={{ touchAction: 'pan-y' }}
          />
        </div>
      </div>

      {lightboxOpen && hasImages && (
        <Lightbox
          images={images}
          index={currentIndex}
          alt={alt}
          onIndexChange={goTo}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

interface LightboxProps {
  images: string[]
  index: number
  alt: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

function Lightbox({ images, index, alt, onIndexChange, onClose }: LightboxProps) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const zoomed = scale > 1
  const multiple = images.length > 1

  const resetZoom = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  // Lock body scroll while the viewer is open (same approach as ui/Modal.tsx).
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Reset zoom whenever the shown image changes.
  useEffect(resetZoom, [index])

  // Keyboard: Esc closes, arrows navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && multiple) onIndexChange(index + 1)
      else if (e.key === 'ArrowLeft' && multiple) onIndexChange(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, multiple, onIndexChange, onClose])

  // ----- Gesture tracking -----
  const gesture = useRef<{
    startX: number
    startY: number
    lastTap: number
    pinchDist: number | null
    panStart: { x: number; y: number } | null
    translateStart: { x: number; y: number }
    moved: boolean
  }>({
    startX: 0,
    startY: 0,
    lastTap: 0,
    pinchDist: null,
    panStart: null,
    translateStart: { x: 0, y: 0 },
    moved: false,
  })

  const distance = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)

  const toggleZoomAt = (clientX: number, clientY: number, target: HTMLElement) => {
    if (zoomed) {
      resetZoom()
      return
    }
    // Zoom toward the tapped point: shift the image so that point stays put.
    const rect = target.getBoundingClientRect()
    const offsetX = clientX - (rect.left + rect.width / 2)
    const offsetY = clientY - (rect.top + rect.height / 2)
    setScale(DOUBLE_TAP_ZOOM)
    setTranslate({
      x: -offsetX * (DOUBLE_TAP_ZOOM - 1),
      y: -offsetY * (DOUBLE_TAP_ZOOM - 1),
    })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const g = gesture.current
    g.moved = false
    if (e.touches.length === 2) {
      g.pinchDist = distance(e.touches)
      g.panStart = null
    } else if (e.touches.length === 1) {
      g.startX = e.touches[0].clientX
      g.startY = e.touches[0].clientY
      if (zoomed) {
        g.panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        g.translateStart = translate
      }
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const g = gesture.current
    if (e.touches.length === 2 && g.pinchDist) {
      const next = clamp((distance(e.touches) / g.pinchDist) * scale, 1, MAX_ZOOM)
      setScale(next)
      g.pinchDist = distance(e.touches)
      g.moved = true
      if (next === 1) setTranslate({ x: 0, y: 0 })
    } else if (e.touches.length === 1 && g.panStart) {
      // Pan the zoomed image.
      setTranslate({
        x: g.translateStart.x + (e.touches[0].clientX - g.panStart.x),
        y: g.translateStart.y + (e.touches[0].clientY - g.panStart.y),
      })
      g.moved = true
    } else if (e.touches.length === 1) {
      if (Math.abs(e.touches[0].clientX - g.startX) > 10) g.moved = true
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const g = gesture.current
    // Double-tap detection (single finger, no drag).
    if (!g.moved && e.changedTouches.length === 1) {
      const now = e.timeStamp
      if (now - g.lastTap < 300) {
        toggleZoomAt(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY,
          e.currentTarget as HTMLElement
        )
        g.lastTap = 0
      } else {
        g.lastTap = now
      }
    }
    // Horizontal swipe navigation (only when not zoomed).
    if (!zoomed && !g.pinchDist && multiple && g.moved) {
      const dx = e.changedTouches[0].clientX - g.startX
      const dy = e.changedTouches[0].clientY - g.startY
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        onIndexChange(index + (dx < 0 ? 1 : -1))
      }
    }
    g.pinchDist = null
    g.panStart = null
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center select-none">
      {/* Backdrop — tap to close when not zoomed */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!zoomed) onClose()
        }}
      />

      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-20 text-white/80 hover:text-white"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
          close
        </span>
      </button>

      {multiple && (
        <>
          <button
            onClick={() => onIndexChange(index - 1)}
            disabled={index === 0}
            aria-label="Previous image"
            className="absolute left-2 md:left-6 z-20 text-white/80 hover:text-white disabled:opacity-30"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
              chevron_left
            </span>
          </button>
          <button
            onClick={() => onIndexChange(index + 1)}
            disabled={index === images.length - 1}
            aria-label="Next image"
            className="absolute right-2 md:right-6 z-20 text-white/80 hover:text-white disabled:opacity-30"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
              chevron_right
            </span>
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={alt}
        onDoubleClick={(e) => toggleZoomAt(e.clientX, e.clientY, e.currentTarget)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative z-10 max-w-[92vw] max-h-[88vh] object-contain"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transition: gesture.current.moved ? 'none' : 'transform 0.2s ease-out',
          touchAction: 'none',
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
        }}
      />

      {multiple && (
        <div className="absolute bottom-5 z-20 text-white/70 font-label-sm tracking-widest">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
