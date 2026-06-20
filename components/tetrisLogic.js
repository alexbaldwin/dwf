export const ROWS = 20
export const COLS = 10
export const SPAWN_POSITION = { x: Math.floor(COLS / 2) - 2, y: -1 }
export const LINE_CLEAR_POINTS = [0, 40, 100, 300, 1200]
export const CELL_COLORS = {
  I: '#4d4d4d',
  O: '#4d4d4d',
  T: '#4d4d4d',
  S: '#4d4d4d',
  Z: '#4d4d4d',
  J: '#4d4d4d',
  L: '#4d4d4d'
}

export const SHAPES = {
  I: [
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0]
    ],
    [
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2]
    ],
    [
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1]
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2]
    ]
  ],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1]
    ]
  ],
  T: [
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1]
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 0]
    ],
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1]
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [-1, 0]
    ]
  ],
  S: [
    [
      [0, 0],
      [1, 0],
      [-1, 1],
      [0, 1]
    ],
    [
      [0, -1],
      [0, 0],
      [1, 0],
      [1, 1]
    ],
    [
      [0, 0],
      [1, 0],
      [-1, 1],
      [0, 1]
    ],
    [
      [0, -1],
      [0, 0],
      [1, 0],
      [1, 1]
    ]
  ],
  Z: [
    [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [1, -1],
      [0, 0],
      [1, 0],
      [0, 1]
    ],
    [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [1, -1],
      [0, 0],
      [1, 0],
      [0, 1]
    ]
  ],
  J: [
    [
      [-1, 0],
      [-1, 1],
      [0, 0],
      [1, 0]
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 1]
    ],
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, -1]
    ],
    [
      [-1, -1],
      [0, -1],
      [0, 0],
      [0, 1]
    ]
  ],
  L: [
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1]
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, -1]
    ],
    [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [1, 0]
    ],
    [
      [-1, 1],
      [0, -1],
      [0, 0],
      [0, 1]
    ]
  ]
}

const SHAPE_KEYS = Object.keys(SHAPES)

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export function randomShape() {
  return SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)]
}

export function createPiece(shape) {
  return {
    shape,
    rotation: 0,
    position: { ...SPAWN_POSITION }
  }
}

export function getBlocks(piece, rotationOverride, positionOverride) {
  const rotation = rotationOverride ?? piece.rotation
  const position = positionOverride ?? piece.position
  const offsets = SHAPES[piece.shape][rotation]
  return offsets.map(([x, y]) => [position.x + x, position.y + y])
}

export function canPlace(board, piece, position = piece.position, rotation = piece.rotation) {
  const blocks = getBlocks(piece, rotation, position)
  return blocks.every(([x, y]) => {
    if (x < 0 || x >= COLS || y >= ROWS) return false
    if (y < 0) return true
    return !board[y][x]
  })
}

export function mergePiece(board, piece) {
  const next = board.map((row) => row.slice())
  for (const [x, y] of getBlocks(piece)) {
    if (y < 0) return null
    next[y][x] = piece.shape
  }
  return next
}

export function clearLines(board) {
  let cleared = 0
  const remaining = []
  for (const row of board) {
    if (row.every(Boolean)) {
      cleared += 1
    } else {
      remaining.push(row)
    }
  }
  while (remaining.length < ROWS) {
    remaining.unshift(Array(COLS).fill(null))
  }
  return { board: remaining, cleared }
}

export function getSpeed(level) {
  return Math.max(900 - (level - 1) * 80, 120)
}

export function getGhostPiece(board, piece) {
  if (!piece) return null
  let offset = 0
  while (
    canPlace(board, piece, {
      x: piece.position.x,
      y: piece.position.y + offset + 1
    })
  ) {
    offset += 1
  }
  if (offset === 0) return piece
  return {
    ...piece,
    position: {
      x: piece.position.x,
      y: piece.position.y + offset
    }
  }
}

export function getCellPresentation(value) {
  if (!value) {
    return {
      color: 'rgba(255, 255, 255, 0.06)',
      variant: 'empty'
    }
  }
  const [shape, variant = 'static'] = value.split('-')
  const color = CELL_COLORS[shape] ?? '#888'
  return { color, variant }
}

export function createIdleState() {
  return {
    board: createEmptyBoard(),
    activePiece: null,
    nextShape: null,
    isRunning: false,
    isGameOver: false,
    score: 0,
    level: 1,
    lines: 0
  }
}

export function createInitialState(initialShape = 'T', nextShape = 'I') {
  return {
    board: createEmptyBoard(),
    activePiece: createPiece(initialShape),
    nextShape,
    isRunning: true,
    isGameOver: false,
    score: 0,
    level: 1,
    lines: 0
  }
}

function endGame(state) {
  return {
    ...state,
    activePiece: null,
    isGameOver: true,
    isRunning: false
  }
}

function lockPiece(state, pieceToLock, followingShape = 'I') {
  const merged = mergePiece(state.board, pieceToLock)
  if (!merged) return endGame(state)

  const { board: clearedBoard, cleared } = clearLines(merged)
  const totalLines = state.lines + cleared
  const nextLevel = Math.min(20, 1 + Math.floor(totalLines / 10))
  const levelForScore = Math.max(state.level, nextLevel)
  const nextScore =
    cleared > 0
      ? state.score + LINE_CLEAR_POINTS[cleared] * levelForScore
      : state.score
  const newActive = createPiece(state.nextShape ?? followingShape)
  const nextState = {
    ...state,
    board: clearedBoard,
    activePiece: newActive,
    nextShape: followingShape,
    score: nextScore,
    level: nextLevel,
    lines: totalLines
  }

  if (!canPlace(clearedBoard, newActive)) return endGame(nextState)
  return nextState
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialState(action.initialShape, action.nextShape)
    case 'MOVE_HORIZONTAL': {
      if (!state.isRunning || !state.activePiece) return state
      const nextPosition = {
        x: state.activePiece.position.x + action.direction,
        y: state.activePiece.position.y
      }
      if (!canPlace(state.board, state.activePiece, nextPosition)) return state
      return {
        ...state,
        activePiece: { ...state.activePiece, position: nextPosition }
      }
    }
    case 'ROTATE': {
      if (!state.isRunning || !state.activePiece) return state
      const nextRotation =
        (state.activePiece.rotation + 1) % SHAPES[state.activePiece.shape].length
      const kicks = [0, -1, 1, -2, 2]
      for (const offset of kicks) {
        const candidatePosition = {
          x: state.activePiece.position.x + offset,
          y: state.activePiece.position.y
        }
        if (canPlace(state.board, state.activePiece, candidatePosition, nextRotation)) {
          return {
            ...state,
            activePiece: {
              ...state.activePiece,
              rotation: nextRotation,
              position: candidatePosition
            }
          }
        }
      }
      return state
    }
    case 'SOFT_DROP': {
      if (!state.isRunning || !state.activePiece) return state
      const nextPosition = {
        x: state.activePiece.position.x,
        y: state.activePiece.position.y + 1
      }
      if (canPlace(state.board, state.activePiece, nextPosition)) {
        return {
          ...state,
          activePiece: { ...state.activePiece, position: nextPosition }
        }
      }
      return lockPiece(state, state.activePiece, action.nextShape)
    }
    case 'HARD_DROP': {
      if (!state.isRunning || !state.activePiece) return state
      let dropDistance = 0
      while (
        canPlace(state.board, state.activePiece, {
          x: state.activePiece.position.x,
          y: state.activePiece.position.y + dropDistance + 1
        })
      ) {
        dropDistance += 1
      }
      const landed = {
        ...state.activePiece,
        position: {
          x: state.activePiece.position.x,
          y: state.activePiece.position.y + dropDistance
        }
      }
      return lockPiece(state, landed, action.nextShape)
    }
    case 'TOGGLE_PAUSE':
      if (state.isGameOver || !state.activePiece) return state
      return {
        ...state,
        isRunning: !state.isRunning
      }
    default:
      return state
  }
}

export function createGameReducer() {
  return gameReducer
}
