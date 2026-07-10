import { useEffect, useState } from 'react'
import styles from '../styles/WindowContent.module.css'

const STORAGE_KEY = 'dwf-contact-draft'
const EMPTY_DRAFT = { name: '', email: '', message: '' }

export default function ContactDraft() {
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved) setDraft({ ...EMPTY_DRAFT, ...JSON.parse(saved) })
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [])

  const updateField = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }))
    setStatus('')
  }

  const saveDraft = (event) => {
    event.preventDefault()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setStatus('Draft saved on this device.')
  }

  const clearDraft = () => {
    setDraft(EMPTY_DRAFT)
    window.localStorage.removeItem(STORAGE_KEY)
    setStatus('Draft cleared.')
  }

  return (
    <form className={styles.contactForm} onSubmit={saveDraft}>
      <div className={styles.inlineFields}>
        <label>
          <span>Name</span>
          <input
            type="text"
            autoComplete="name"
            value={draft.name}
            onChange={updateField('name')}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={updateField('email')}
          />
        </label>
      </div>
      <label>
        <span>Message</span>
        <textarea
          rows="5"
          value={draft.message}
          onChange={updateField('message')}
        />
      </label>
      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryButton}>Save draft</button>
        <button type="button" className={styles.textButton} onClick={clearDraft}>Clear</button>
      </div>
      <p className={styles.formStatus} aria-live="polite">{status || 'Your draft stays in this browser.'}</p>
    </form>
  )
}
