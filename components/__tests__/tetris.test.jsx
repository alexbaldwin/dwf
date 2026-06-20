import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, jest, test } from '@jest/globals'
import Tetris from '../tetris'
import {
  COLS,
  createEmptyBoard,
  createIdleState,
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

    expect(state.isRunning).toBe(true)
    expect(state.isGameOver).toBe(false)
    expect(state.activePiece.shape).toBe('T')
    expect(state.nextShape).toBe('O')
  })

  test('rejects horizontal movement beyond the board edge', () => {
    const state = {
      ...createIdleState(),
      activePiece: {
        ...createPiece('O'),
        position: { x: 0, y: 0 }
      },
      nextShape: 'O',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'MOVE_HORIZONTAL', direction: -1 })

    expect(nextState.activePiece.position).toEqual({ x: 0, y: 0 })
  })

  test('clears a completed line and scores it when a piece locks', () => {
    const board = createEmptyBoard()
    board[19] = Array.from({ length: COLS }, (_, index) => (index < 4 ? null : 'O'))
    const state = {
      ...createIdleState(),
      board,
      activePiece: {
        ...createPiece('I'),
        position: { x: 1, y: 19 }
      },
      nextShape: 'O',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'SOFT_DROP', nextShape: 'T' })

    expect(nextState.lines).toBe(1)
    expect(nextState.score).toBe(40)
    expect(nextState.level).toBe(1)
    expect(nextState.board[19].every((cell) => cell === null)).toBe(true)
  })

  test('ends the game when a locked piece is above the visible board', () => {
    const board = createEmptyBoard()
    board[0][3] = 'O'
    board[0][4] = 'O'
    const state = {
      ...createIdleState(),
      board,
      activePiece: {
        ...createPiece('O'),
        position: { x: 3, y: -1 }
      },
      nextShape: 'I',
      isRunning: true
    }

    const nextState = gameReducer(state, { type: 'SOFT_DROP', nextShape: 'T' })

    expect(nextState.isGameOver).toBe(true)
    expect(nextState.isRunning).toBe(false)
    expect(nextState.activePiece).toBeNull()
  })

  test('does not mutate the source board when merging a piece', () => {
    const board = createEmptyBoard()
    const piece = {
      ...createPiece('O'),
      position: { x: 3, y: 3 }
    }

    const merged = mergePiece(board, piece)

    expect(board[3][3]).toBeNull()
    expect(merged[3][3]).toBe('O')
  })
})

describe('Tetris component', () => {
  test('renders the board and cleans up the keyboard listener', () => {
    const addSpy = jest.spyOn(window, 'addEventListener')
    const removeSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = render(
      <StrictMode>
        <Tetris />
      </StrictMode>
    )

    expect(screen.getByRole('grid', { name: /tetris board/i })).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(200)
    expect(screen.getByRole('button', { name: /new game/i })).toBeInTheDocument()

    unmount()

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
