import { StrictMode } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, jest, test } from '@jest/globals'
import Tetris from '../tetris'
import {
  COLS,
  createEmptyBoard,
  createIdleState,
  createInitialState,
  createPiece,
  gameReducer,
  mergePiece
} from '../tetrisLogic'

describe('tetris logic', () => {
  test('starts a new game with an active piece and next piece', () => {
    const state = gameReducer(createIdleState(), {
      type: 'NEW_GAME',
      initialShape: 'T',
      nextShape: 'O'
    })

    expect(state).toMatchObject({
      isRunning: true,
      isGameOver: false,
      nextShape: 'O'
    })
    expect(state.activePiece.shape).toBe('T')
  })

  test('rejects horizontal movement beyond the board edge', () => {
    const state = {
      ...createIdleState(),
      activePiece: { ...createPiece('O'), position: { x: 0, y: 0 } },
      nextShape: 'O',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'MOVE_HORIZONTAL', direction: -1 })

    expect(nextState.activePiece.position).toEqual({ x: 0, y: 0 })
  })

  test('rotates a piece and applies a wall kick when needed', () => {
    const state = {
      ...createInitialState('T', 'O'),
      activePiece: { ...createPiece('T'), position: { x: 0, y: 2 } }
    }

    const nextState = gameReducer(state, { type: 'ROTATE' })

    expect(nextState.activePiece.rotation).toBe(1)
    expect(nextState.activePiece.position.x).toBeGreaterThanOrEqual(0)
  })

  test('hard drops and locks the active piece', () => {
    const state = createInitialState('O', 'T')

    const nextState = gameReducer(state, { type: 'HARD_DROP', nextShape: 'I' })

    expect(nextState.board.flat().filter((cell) => cell === 'O')).toHaveLength(4)
    expect(nextState.activePiece.shape).toBe('T')
    expect(nextState.nextShape).toBe('I')
  })

  test('pauses and resumes an active game', () => {
    const state = createInitialState('O', 'T')

    const paused = gameReducer(state, { type: 'TOGGLE_PAUSE' })
    const resumed = gameReducer(paused, { type: 'TOGGLE_PAUSE' })

    expect(paused.isRunning).toBe(false)
    expect(resumed.isRunning).toBe(true)
  })

  test('clears four completed lines and applies Tetris scoring', () => {
    const board = createEmptyBoard()
    for (let row = 16; row < 20; row += 1) {
      board[row] = Array.from({ length: COLS }, (_, column) => (column === 4 ? null : 'O'))
    }
    const state = {
      ...createIdleState(),
      board,
      activePiece: {
        ...createPiece('I'),
        rotation: 1,
        position: { x: 3, y: 17 }
      },
      nextShape: 'O',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'SOFT_DROP', nextShape: 'T' })

    expect(nextState.lines).toBe(4)
    expect(nextState.score).toBe(1200)
    expect(nextState.board.flat().every((cell) => cell === null)).toBe(true)
  })

  test('advances the level after ten cleared lines', () => {
    const board = createEmptyBoard()
    board[19] = Array.from({ length: COLS }, (_, column) => (column < 4 ? null : 'O'))
    const state = {
      ...createIdleState(),
      board,
      activePiece: { ...createPiece('I'), position: { x: 1, y: 19 } },
      nextShape: 'O',
      isRunning: true,
      lines: 9
    }

    const nextState = gameReducer(state, { type: 'SOFT_DROP', nextShape: 'T' })

    expect(nextState.lines).toBe(10)
    expect(nextState.level).toBe(2)
  })

  test('ends the game when a locked piece is above the visible board', () => {
    const board = createEmptyBoard()
    board[0][3] = 'O'
    board[0][4] = 'O'
    const state = {
      ...createIdleState(),
      board,
      activePiece: { ...createPiece('O'), position: { x: 3, y: -1 } },
      nextShape: 'I',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'SOFT_DROP', nextShape: 'T' })

    expect(nextState).toMatchObject({ isGameOver: true, isRunning: false, activePiece: null })
  })

  test('does not mutate the source board when merging a piece', () => {
    const board = createEmptyBoard()
    const piece = { ...createPiece('O'), position: { x: 3, y: 3 } }

    const merged = mergePiece(board, piece)

    expect(board[3][3]).toBeNull()
    expect(merged[3][3]).toBe('O')
  })
})

describe('Tetris component', () => {
  test('starts visibly and exposes the complete game controls', () => {
    render(<Tetris />)

    expect(screen.getByRole('grid', { name: /tetris board/i })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(200)
    expect(screen.getByText('Playing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  test('does not cancel Space on unrelated buttons', () => {
    render(<Tetris />)
    const button = document.createElement('button')
    document.body.append(button)
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })

    const wasNotCancelled = button.dispatchEvent(event)

    expect(wasNotCancelled).toBe(true)
    button.remove()
  })

  test('does not register global keyboard shortcuts while inactive', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')

    render(<Tetris isActive={false} />)

    expect(addSpy).not.toHaveBeenCalledWith('keydown', expect.any(Function))
    addSpy.mockRestore()
  })

  test('pairs every StrictMode keyboard listener with cleanup', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    const removeSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = render(
      <StrictMode>
        <Tetris />
      </StrictMode>
    )
    fireEvent.click(screen.getByRole('button', { name: /pause/i }))
    unmount()

    const added = addSpy.mock.calls
      .filter(([type]) => type === 'keydown')
      .map(([, listener]) => listener)
    const removed = removeSpy.mock.calls
      .filter(([type]) => type === 'keydown')
      .map(([, listener]) => listener)

    expect(added.length).toBeGreaterThan(0)
    expect(added.every((listener) => removed.includes(listener))).toBe(true)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
