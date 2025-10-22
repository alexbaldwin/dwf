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
      <div
        className={`${styles.titleBar} handle`}
        style={{ cursor: 'move' }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          if (onMinimize) onMinimize()
        }}
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
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
})

Window.displayName = 'Window'

export default Window
