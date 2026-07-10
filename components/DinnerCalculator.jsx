import { useMemo, useState } from 'react'
import styles from '../styles/WindowContent.module.css'

const TIP_OPTIONS = [15, 20, 25]

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number.isFinite(value) ? value : 0)
}

export default function DinnerCalculator() {
  const [bill, setBill] = useState('84.00')
  const [guests, setGuests] = useState(4)
  const [tip, setTip] = useState(20)

  const totals = useMemo(() => {
    const subtotal = Math.max(0, Number.parseFloat(bill) || 0)
    const total = subtotal * (1 + tip / 100)
    return {
      total,
      perGuest: total / guests
    }
  }, [bill, guests, tip])

  return (
    <div className={styles.calculator}>
      <label className={styles.fieldLabel} htmlFor="bill-total">
        Bill
      </label>
      <div className={styles.moneyField}>
        <span aria-hidden="true">$</span>
        <input
          id="bill-total"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={bill}
          onChange={(event) => setBill(event.target.value)}
        />
      </div>

      <div className={styles.controlRow}>
        <span className={styles.fieldLabel}>Guests</span>
        <div className={styles.stepper} aria-label="Number of guests">
          <button
            type="button"
            onClick={() => setGuests((value) => Math.max(1, value - 1))}
            aria-label="Remove a guest"
          >
            -
          </button>
          <output aria-live="polite">{guests}</output>
          <button
            type="button"
            onClick={() => setGuests((value) => Math.min(20, value + 1))}
            aria-label="Add a guest"
          >
            +
          </button>
        </div>
      </div>

      <fieldset className={styles.tipFieldset}>
        <legend className={styles.fieldLabel}>Tip</legend>
        <div className={styles.segmentedControl}>
          {TIP_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={tip === option ? styles.segmentActive : ''}
              onClick={() => setTip(option)}
              aria-pressed={tip === option}
            >
              {option}%
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.calculatorResult} aria-live="polite">
        <div>
          <span>Each</span>
          <strong>{formatCurrency(totals.perGuest)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
      </div>
    </div>
  )
}
