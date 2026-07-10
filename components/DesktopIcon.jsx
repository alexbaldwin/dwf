import styles from '../styles/DesktopIcon.module.css'

export default function DesktopIcon({ name, isYellow, isActive, onClick }) {
  return (
    <button
      type="button"
      className={styles.desktopIcon}
      onClick={onClick}
      aria-label={`${name} window`}
      aria-pressed={isActive}
    >
      <div
        className={styles.iconContainer}
        style={{
          backgroundColor: isYellow ? 'var(--accent-yellow)' : 'transparent',
          border: '1px solid var(--border-primary)'
        }}
      >
        <div className={styles.decorativeLines}>
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
      </div>
      <p className={styles.label}>{name}</p>
    </button>
  )
}
