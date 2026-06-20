import { forwardRef } from 'react'
import styles from '../styles/Window.module.css'

const Window = forwardRef(({ title, children, backgroundColor, width, onMinimize }, ref) => {
  return (
    <div
      ref={ref}
      className={styles.window}
      style={{
        backgroundColor: backgroundColor || 'var(--bg-window)',
        width: width || 'auto'
      }}
    >
      <button
        type="button"
        className={`${styles.titleBar} handle`}
        onDoubleClick={(e) => {
          e.stopPropagation()
          if (onMinimize) onMinimize()
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onMinimize) {
            e.preventDefault()
            onMinimize()
          }
        }}
        aria-label={`Move or minimize ${title} window`}
      >
        <div className={styles.titleBarLines}>
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
        <p className={styles.title}>{title}</p>
        <div className={styles.titleBarLines}>
          <div className={styles.line} />
          <div className={styles.line} />
            <div className={styles.line} />
          <div className={styles.line} />
        </div>
      </button>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
})

Window.displayName = 'Window'

export default Window
