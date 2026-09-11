import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BlurImage from './BlurImage'

const meta = { width: 1200, height: 900, lqip: 'UklGRiQAAAA' }

describe('BlurImage', () => {
  it('paints the inlined preview until the image loads', () => {
    render(<BlurImage src="/photo.webp" meta={meta} alt="Keyboard" />)
    const img = screen.getByAltText('Keyboard')

    expect(img.style.backgroundImage).toBe('url("data:image/webp;base64,UklGRiQAAAA")')
    expect(img.style.backgroundSize).toBe('cover')

    fireEvent.load(img)
    expect(img.style.backgroundImage).toBe('')
  })

  it('sizes the preview to the fit the image is rendered with', () => {
    render(<BlurImage src="/photo.webp" meta={meta} fit="contain" alt="Mouse" />)
    expect(screen.getByAltText('Mouse').style.backgroundSize).toBe('contain')
  })

  it('renders a plain image when the platform never measured one', () => {
    render(<BlurImage src="/photo.webp" meta={null} alt="Headset" />)
    expect(screen.getByAltText('Headset').style.backgroundImage).toBe('')
  })
})
