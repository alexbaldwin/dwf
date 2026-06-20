import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import contentStyles from '../styles/WindowContent.module.css'
import styles from '../styles/Tetris.module.css'
import {
  createIdleState,
  gameReducer,
  getBlocks,
  getCellPresentation,
  getGhostPiece,
  getSpeed,
  randomShape
} from './tetrisLogic'

function useInterval(callback, delay) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return undefined
    const id = setInterval(() => {
      savedCallback.current()
    }, delay)
    return () => clearInterval(id)
  }, [delay])
}

function isTextEntryTarget(target) {
  if (!target || target.nodeType !== 1) return false
  const tagName = target.tagName?.toLowerCase()
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select'
}

export default function Tetris() {
  const hasStartedRef = useRef(false)
  const [state, dispatch] = useReducer(gameReducer, undefined, createIdleState)
  const {
    board,
    activePiece,
    isRunning,
    isGameOver,
    level
  } = state

  const startNewGame = useCallback(() => {
    dispatch({
      type: 'NEW_GAME',
      initialShape: randomShape(),
      nextShape: randomShape()
    })
  }, [])

  const moveHorizontal = useCallback((direction) => {
    dispatch({ type: 'MOVE_HORIZONTAL', direction })
  }, [])

  const rotatePiece = useCallback(() => {
    dispatch({ type: 'ROTATE' })
  }, [])

  const softDrop = useCallback(() => {
    dispatch({ type: 'SOFT_DROP', nextShape: randomShape() })
  }, [])

  const hardDrop = useCallback(() => {
    dispatch({ type: 'HARD_DROP', nextShape: randomShape() })
  }, [])

  const togglePause = useCallback(() => {
    dispatch({ type: 'TOGGLE_PAUSE' })
  }, [])

  useEffect(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    startNewGame()
  }, [startNewGame])

  const dropDelay = isRunning && !isGameOver ? getSpeed(level) : null
  useInterval(softDrop, dropDelay)

  const ghostPiece = useMemo(
    () => (activePiece ? getGhostPiece(board, activePiece) : null),
    [activePiece, board]
  )

  const displayBoard = useMemo(() => {
    const draft = board.map((row) => row.slice())
    if (ghostPiece && activePiece) {
      for (const [x, y] of getBlocks(ghostPiece)) {
        if (y >= 0 && !draft[y][x]) {
          draft[y][x] = `${ghostPiece.shape}-ghost`
        }
      }
    }
    if (activePiece) {
      for (const [x, y] of getBlocks(activePiece)) {
        if (y >= 0) {
          draft[y][x] = `${activePiece.shape}-active`
        }
      }
    }
    return draft
  }, [activePiece, board, ghostPiece])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented || isTextEntryTarget(event.target)) return
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          moveHorizontal(-1)
          break
        case 'ArrowRight':
          event.preventDefault()
          moveHorizontal(1)
          break
        case 'ArrowUp':
          event.preventDefault()
          rotatePiece()
          break
        case 'ArrowDown':
          event.preventDefault()
          softDrop()
          break
        case ' ':
          event.preventDefault()
          hardDrop()
          break
        case 'p':
        case 'P':
          event.preventDefault()
          togglePause()
          break
        case 'n':
        case 'N':
          event.preventDefault()
          startNewGame()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hardDrop, moveHorizontal, rotatePiece, softDrop, startNewGame, togglePause])

  return (
    <div className={styles.container}>
      <div className={styles.frame}>
        <div className={styles.board} role="grid" aria-label="Tetris board">
          {displayBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`
              const { color, variant } = getCellPresentation(cell)
              return (
                <div
                  key={key}
                  className={`${styles.cell} ${
                    variant === 'ghost' ? styles.cellGhost : ''
                  }`}
                  style={{
                    backgroundColor:
                      variant === 'ghost' || variant === 'empty'
                        ? 'transparent'
                        : color
                  }}
                  role="gridcell"
                />
              )
            })
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${contentStyles.button} ${styles.actionButton}`}
          onClick={startNewGame}
        >
          {isGameOver ? 'Play Again' : 'New Game'}
        </button>
      </div>
    </div>
  )
}
