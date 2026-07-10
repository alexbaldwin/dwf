import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/WindowContent.module.css'

const PORTRAITS = [
  {
    src: '/images/alex.jpg',
    alt: 'Portrait of Alex Baldwin',
    name: 'Alex Baldwin',
    role: 'Creative direction'
  },
  {
    src: '/images/justin.jpg',
    alt: 'Portrait of Justin',
    name: 'Justin',
    role: 'Design and good company'
  }
]

export default function PortraitGallery() {
  const [index, setIndex] = useState(0)
  const portrait = PORTRAITS[index]

  const move = (direction) => {
    setIndex((current) => (current + direction + PORTRAITS.length) % PORTRAITS.length)
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.imageFrame}>
        <Image
          key={portrait.src}
          src={portrait.src}
          alt={portrait.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 760px) calc(100vw - 64px), 276px"
          className={styles.portrait}
        />
      </div>
      <div className={styles.galleryMeta}>
        <div>
          <strong>{portrait.name}</strong>
          <span>{portrait.role}</span>
        </div>
        <div className={styles.galleryControls}>
          <button type="button" onClick={() => move(-1)} aria-label="Previous portrait" title="Previous portrait">
            &lt;
          </button>
          <span aria-live="polite">{index + 1} / {PORTRAITS.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next portrait" title="Next portrait">
            &gt;
          </button>
        </div>
      </div>
    </div>
  )
}
