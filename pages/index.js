import Head from 'next/head'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import AnimatedWindow from '../components/AnimatedWindow'
import Window from '../components/Window'
import DesktopIcon from '../components/DesktopIcon'
import ContactDraft from '../components/ContactDraft'
import DinnerCalculator from '../components/DinnerCalculator'
import MusicPlayer from '../components/MusicPlayer'
import PortraitGallery from '../components/PortraitGallery'
import Tetris from '../components/tetris'

const WINDOW_NAMES = ['calculator', 'images', 'contact', 'tetris', 'music']

function getInitialWindowPositions(viewportWidth = 1440) {
  return {
    calculator: { x: 24, y: 82 },
    images: { x: 58, y: 540 },
    contact: { x: Math.max(952, viewportWidth - 328), y: 62 },
    tetris: { x: Math.max(1002, viewportWidth - 278), y: 414 },
    music: { x: Math.round(viewportWidth / 2) - 145, y: 662 }
  }
}

function getPreferredTheme() {
  const saved = window.localStorage.getItem('dwf-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function Home() {
  const [date, setDate] = useState(null)
  const [theme, setTheme] = useState('light')
  const [themeReady, setThemeReady] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [windowStates, setWindowStates] = useState(() =>
    Object.fromEntries(WINDOW_NAMES.map((name) => [name, 'visible']))
  )
  const [windowPositions, setWindowPositions] = useState(() => getInitialWindowPositions())
  const [stack, setStack] = useState(WINDOW_NAMES)

  const calculatorRef = useRef(null)
  const contactRef = useRef(null)
  const imagesRef = useRef(null)
  const tetrisRef = useRef(null)
  const musicRef = useRef(null)

  const windowRefs = useMemo(() => ({
    calculator: calculatorRef,
    images: imagesRef,
    contact: contactRef,
    tetris: tetrisRef,
    music: musicRef
  }), [])

  useEffect(() => {
    const initialTick = window.setTimeout(() => setDate(new Date()), 0)
    const timer = window.setInterval(() => setDate(new Date()), 1000)
    return () => {
      window.clearTimeout(initialTick)
      window.clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setTheme(getPreferredTheme())
      setThemeReady(true)
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    document.body.setAttribute('data-theme', theme)
    if (themeReady) window.localStorage.setItem('dwf-theme', theme)
  }, [theme, themeReady])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px) and (min-height: 900px)')
    const updateMode = () => {
      setIsDesktop(media.matches)
      if (media.matches) setWindowPositions(getInitialWindowPositions(window.innerWidth))
    }
    updateMode()
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  const bringToFront = useCallback((windowName) => {
    setStack((current) => [...current.filter((name) => name !== windowName), windowName])
  }, [])

  const minimizeWindow = useCallback((windowName) => {
    setWindowStates((current) => ({ ...current, [windowName]: 'minimized' }))
  }, [])

  const focusWindow = useCallback((windowName) => {
    setWindowStates((current) => ({ ...current, [windowName]: 'visible' }))
    bringToFront(windowName)

    if (!isDesktop) {
      window.setTimeout(() => {
        document.querySelector(`[data-window="${windowName}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 30)
    }
  }, [bringToFront, isDesktop])

  const resetWorkspace = useCallback(() => {
    setWindowStates(Object.fromEntries(WINDOW_NAMES.map((name) => [name, 'visible'])))
    setStack(WINDOW_NAMES)
    setWindowPositions(getInitialWindowPositions(window.innerWidth))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const updateWindowPosition = useCallback((windowName, position) => {
    setWindowPositions((current) => ({ ...current, [windowName]: position }))
  }, [])

  const renderWindow = ({ name, title, width, backgroundColor, children }) => (
    <AnimatedWindow
      key={name}
      isVisible={windowStates[name] === 'visible'}
      isDraggable={isDesktop}
      nodeRef={windowRefs[name]}
      position={windowPositions[name]}
      onPositionChange={(position) => updateWindowPosition(name, position)}
      onActivate={() => bringToFront(name)}
      zIndex={100 + stack.indexOf(name)}
      className={`${styles.desktopWindow} ${styles[`${name}Shell`]}`}
    >
      <Window
        name={name}
        title={title}
        width={width}
        backgroundColor={backgroundColor}
        onMinimize={() => minimizeWindow(name)}
      >
        {children}
      </Window>
    </AnimatedWindow>
  )

  const formattedDate = date?.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  const formattedTime = date?.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={styles.container}>
      <Head>
        <title>Dinner with Friends</title>
        <meta
          name="description"
          content="Dinner with Friends is an interactive creative desktop for sharing ideas, portraits, music, and play."
        />
        <meta name="theme-color" content={theme === 'dark' ? '#171717' : '#f2f1ed'} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className={styles.nav} aria-label="Workspace navigation">
        <button type="button" className={styles.navBrand} onClick={resetWorkspace}>
          Dinner with Friends
        </button>
        <div className={styles.navLinks}>
          <button type="button" onClick={resetWorkspace}>Desk</button>
          <button type="button" onClick={() => focusWindow('images')}>People</button>
          <button type="button" onClick={() => focusWindow('tetris')}>Play</button>
          <button type="button" onClick={() => focusWindow('contact')}>Contact</button>
        </div>
        <div className={styles.navMeta}>
          <span className={styles.navTime}>{formattedDate || 'Today'}</span>
          <span className={styles.navTime}>{formattedTime || '--:-- --'}</span>
          <div className={styles.themeControl} aria-label="Color theme">
            <button
              type="button"
              onClick={() => setTheme('light')}
              aria-pressed={theme === 'light'}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              aria-pressed={theme === 'dark'}
            >
              Dark
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="hero-title" data-region="hero">
          <p className={styles.eyebrow}>A small creative studio</p>
          <h1 id="hero-title">Dinner<br />with Friends.</h1>
          <p className={styles.heroCopy}>Ideas are better when the table is full.</p>
        </section>

        <div className={styles.desktopIcons} aria-label="Workspace windows" data-region="window-dock">
          {[
            ['calculator', 'Calculator'],
            ['images', 'Images'],
            ['contact', 'Contact'],
            ['tetris', 'Tetris'],
            ['music', 'Music']
          ].map(([name, label]) => (
            <DesktopIcon
              key={name}
              name={label}
              isYellow={name === 'contact'}
              isActive={windowStates[name] === 'visible'}
              onClick={() => focusWindow(name)}
            />
          ))}
        </div>

        <div className={styles.windowLayer}>
          {renderWindow({
            name: 'calculator',
            title: 'Split the Bill',
            width: '260px',
            children: <DinnerCalculator />
          })}
          {renderWindow({
            name: 'images',
            title: 'At the Table',
            width: '302px',
            children: <PortraitGallery />
          })}
          {renderWindow({
            name: 'contact',
            title: 'Leave a Note',
            width: '320px',
            backgroundColor: 'var(--accent-yellow)',
            children: <ContactDraft />
          })}
          {renderWindow({
            name: 'tetris',
            title: 'After Dinner',
            width: '360px',
            children: <Tetris isActive={windowStates.tetris === 'visible'} />
          })}
          {renderWindow({
            name: 'music',
            title: 'Dinner Radio',
            width: '290px',
            children: <MusicPlayer isActive={windowStates.music === 'visible'} />
          })}
        </div>

        <footer className={styles.footer} data-region="footer">
          <span>Detroit and wherever dinner takes us.</span>
          <span>DWF / {new Date().getFullYear()}</span>
        </footer>
      </main>
    </div>
  )
}
