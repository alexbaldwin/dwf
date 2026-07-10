import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles/WindowContent.module.css'

const TRACKS = [
  { title: 'First Course', detail: 'C major / 84 BPM', notes: [261.63, 329.63, 392] },
  { title: 'Late Plate', detail: 'A minor / 76 BPM', notes: [220, 261.63, 329.63] },
  { title: 'Last Call', detail: 'F major / 92 BPM', notes: [174.61, 220, 261.63] }
]

export default function MusicPlayer({ isActive = true }) {
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const intervalRef = useRef(null)

  const stop = useCallback((updateState = true) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = null
    if (audioRef.current) {
      audioRef.current.close().catch(() => undefined)
      audioRef.current = null
    }
    if (updateState) setIsPlaying(false)
  }, [])

  const playChord = useCallback((context, notes) => {
    const now = context.currentTime
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = index === 0 ? 'triangle' : 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 1.25)
    })
  }, [])

  const start = useCallback(async () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const context = new AudioContext()
    audioRef.current = context
    await context.resume()
    const notes = TRACKS[trackIndex].notes
    playChord(context, notes)
    intervalRef.current = window.setInterval(() => playChord(context, notes), 1800)
    setIsPlaying(true)
  }, [playChord, trackIndex])

  const toggle = () => {
    if (isPlaying) stop()
    else start()
  }

  const moveTrack = (direction) => {
    stop()
    setTrackIndex((current) => (current + direction + TRACKS.length) % TRACKS.length)
  }

  useEffect(() => {
    if (isActive) return undefined
    const timeout = window.setTimeout(stop, 0)
    return () => window.clearTimeout(timeout)
  }, [isActive, stop])

  useEffect(() => () => stop(false), [stop])

  const track = TRACKS[trackIndex]

  return (
    <div className={styles.musicPlayer}>
      <div className={styles.nowPlaying}>
        <span>{isPlaying ? 'Now playing' : 'Dinner radio'}</span>
        <strong>{track.title}</strong>
        <small>{track.detail}</small>
      </div>
      <div className={styles.playerControls}>
        <button type="button" onClick={() => moveTrack(-1)} aria-label="Previous track" title="Previous track">
          &lt;
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={toggle}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
          title={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? 'II' : '>'}
        </button>
        <button type="button" onClick={() => moveTrack(1)} aria-label="Next track" title="Next track">
          &gt;
        </button>
      </div>
      <div className={styles.trackProgress} aria-hidden="true">
        <span className={isPlaying ? styles.trackProgressActive : ''} />
      </div>
    </div>
  )
}
