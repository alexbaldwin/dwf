"use client"

import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import contentStyles from '../styles/WindowContent.module.css'
import dynamic from 'next/dynamic'
import Window from '../components/Window'
import DesktopIcon from '../components/DesktopIcon'

const Tetris = dynamic(() => import("../components/tetris"), {
  ssr: false,
})

const AnimatedWindow = dynamic(() => import('../components/AnimatedWindow'), {
  ssr: false,
})

export default function Home() {
  const [date, setDate] = useState(() => new Date())
  const [theme, setTheme] = useState('light')
  const [windowStates, setWindowStates] = useState({
    calculator: 'visible',
    images: 'visible',
    email: 'visible',
    tetris: 'visible',
    music: 'visible'
  })
  const [windowPositions, setWindowPositions] = useState({
    calculator: { x: 24, y: 54 },
    images: { x: 70, y: 550 },
    email: { x: 950, y: 77 },
    tetris: { x: 1160, y: 212 },
    music: { x: 1152, y: 739 }
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme)
  }

  const minimizeWindow = (windowName) => {
    setWindowStates(prev => ({
      ...prev,
      [windowName]: 'minimized'
    }))
  }

  const restoreWindow = (windowName) => {
    setWindowStates(prev => ({
      ...prev,
      [windowName]: 'visible'
    }))
  }

  const handleIconClick = (windowName) => {
    if (windowStates[windowName] === 'minimized') {
      restoreWindow(windowName)
    } else {
      minimizeWindow(windowName)
    }
  }

  const updateWindowPosition = (windowName, position) => {
    setWindowPositions(prev => ({
      ...prev,
      [windowName]: position
    }))
  }

  const calculatorRef = useRef(null)
  const emailRef = useRef(null)
  const imagesRef = useRef(null)
  const tetrisRef = useRef(null)
  const musicRef = useRef(null)

  return (
    <div className={styles.container}>
      <Head>
        <title>Dinner with Friends</title>
        <meta name="description" content="Dinner with Friends - Interactive Desktop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav}>
        <div className={styles.navLeft}>
          <div className={styles.navBrand}>Dinner with Friends</div>
          <div className={styles.navItem}>Work</div>
          <div className={`${styles.navItem} ${styles.inactive}`}>About</div>
          <div className={`${styles.navItem} ${styles.inactive}`}>Knowledge</div>
          <div className={`${styles.navItem} ${styles.inactive}`}>Contact</div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.navTime}>
            {date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className={styles.navTime}>
            {date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className={styles.navTheme}>
            <span
              className={theme === 'dark' ? styles.inactive : ''}
              onClick={() => toggleTheme('light')}
            >
              Light
            </span>
            <span
              className={theme === 'light' ? styles.inactive : ''}
              onClick={() => toggleTheme('dark')}
            >
              Dark
            </span>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.hero}>
          <p>Hello, we are</p>
          <p>Dinner with Friends.</p>
        </div>

        <div className={styles.footer}>
          <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.</p>
        </div>

        <div className={styles.desktopIcons}>
          <DesktopIcon name="Calculator" onClick={() => handleIconClick('calculator')} />
          <DesktopIcon name="Images" onClick={() => handleIconClick('images')} />
          <DesktopIcon name="Email" isYellow onClick={() => handleIconClick('email')} />
          <DesktopIcon name="Tetris" onClick={() => handleIconClick('tetris')} />
          <DesktopIcon name="Music" onClick={() => handleIconClick('music')} />
        </div>

        <AnimatedWindow
          isVisible={windowStates.calculator === 'visible'}
          nodeRef={calculatorRef}
          position={windowPositions.calculator}
          onPositionChange={(pos) => updateWindowPosition('calculator', pos)}
        >
          <div style={{ width: '200px' }}>
            <Window title="Calculator" width="200px" onMinimize={() => minimizeWindow('calculator')}>
              <div className={contentStyles.display}>
                $$$
              </div>
            </Window>
          </div>
        </AnimatedWindow>

        <AnimatedWindow
          isVisible={windowStates.images === 'visible'}
          nodeRef={imagesRef}
          position={windowPositions.images}
          onPositionChange={(pos) => updateWindowPosition('images', pos)}
        >
          <div style={{ width: '281px' }}>
            <Window title="Images" width="281px" onMinimize={() => minimizeWindow('images')}>
              <div className={contentStyles.imageFrame} style={{ height: '200px', width: '257px' }}>
                <Image
                  src="/images/alex.jpg"
                  alt="Portrait of Alex Baldwin"
                  fill
                  sizes="257px"
                  style={{ objectFit: 'cover', opacity: 0.6 }}
                  priority
                />
              </div>
            </Window>
          </div>
        </AnimatedWindow>

        <AnimatedWindow
          isVisible={windowStates.email === 'visible'}
          nodeRef={emailRef}
          position={windowPositions.email}
          onPositionChange={(pos) => updateWindowPosition('email', pos)}
        >
          <div style={{ width: '250px' }}>
            <Window title="Email" backgroundColor="var(--accent-yellow)" width="250px" onMinimize={() => minimizeWindow('email')}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <input type="text" placeholder="Name" className={contentStyles.input} />
                <input type="email" placeholder="Email" className={contentStyles.input} />
                <textarea placeholder="Message" rows="7" className={contentStyles.textarea} />
              </div>
              <button className={contentStyles.buttonYellow}>
                Send
              </button>
            </Window>
          </div>
        </AnimatedWindow>

        <AnimatedWindow
          isVisible={windowStates.tetris === 'visible'}
          nodeRef={tetrisRef}
          position={windowPositions.tetris}
          onPositionChange={(pos) => updateWindowPosition('tetris', pos)}
        >
          <div style={{ width: '360px' }}>
            <Window title="Tetris" onMinimize={() => minimizeWindow('tetris')} width="281px">
              <Tetris />
            </Window>
          </div>
        </AnimatedWindow>

        <AnimatedWindow
          isVisible={windowStates.music === 'visible'}
          nodeRef={musicRef}
          position={windowPositions.music}
          onPositionChange={(pos) => updateWindowPosition('music', pos)}
        >
          <div>
            <Window title="Music" onMinimize={() => minimizeWindow('music')}>
              <div className={contentStyles.placeholder} style={{ height: '44px', width: '200px' }} />
            </Window>
          </div>
        </AnimatedWindow>
      </main>
    </div>
  )
}
