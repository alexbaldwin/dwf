import { forwardRef } from 'react'
import styles from '../styles/Window.module.css'

const Window = forwardRef(({ title, children, backgroundColor, width, onMinimize, name }, ref) => {
  return (
    <div
      ref={ref}
      className={styles.window}
      data-window={name}
      style={{
        backgroundColor: backgroundColor || 'var(--bg-window)',
        width: width || 'auto'
      }}
    >
      <div className={`${styles.titleBar} handle`}>
        <div className={styles.titleBarLines}>
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.titleBarLines}>
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
          <div className={styles.line} />
        </div>
        <button
          type="button"
          className={styles.minimizeButton}
          onClick={onMinimize}
          aria-label={`Minimize ${title} window`}
          title={`Minimize ${title}`}
          data-no-drag
        >
          <span aria-hidden="true" />
        </button>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
})

Window.displayName = 'Window'

export default Window
