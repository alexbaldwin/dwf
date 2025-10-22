import { useCallback, useEffect, useMemo, useState } from "react";
import contentStyles from "../styles/WindowContent.module.css";
import styles from "../styles/Tetris.module.css";

const ROWS = 20;
const COLS = 10;
const SPAWN_POSITION = { x: Math.floor(COLS / 2) - 2, y: -1 };
const LINE_CLEAR_POINTS = [0, 40, 100, 300, 1200];
const CELL_COLORS = {
  I: "#4d4d4d",
  O: "#4d4d4d",
  T: "#4d4d4d",
  S: "#4d4d4d",
  Z: "#4d4d4d",
  J: "#4d4d4d",
  L: "#4d4d4d",
};

const SHAPES = {
  I: [
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    [
      [1, -1],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [-1, 1],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [0, 2],
    ],
  ],
  O: [
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 0],
    ],
    [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [-1, 0],
    ],
  ],
  S: [
    [
      [0, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [0, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
  ],
  Z: [
    [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [1, -1],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [1, -1],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
  ],
  J: [
    [
      [-1, 0],
      [-1, 1],
      [0, 0],
      [1, 0],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, -1],
    ],
    [
      [-1, -1],
      [0, -1],
      [0, 0],
      [0, 1],
    ],
  ],
  L: [
    [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 1],
      [1, -1],
    ],
    [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    [
      [-1, 1],
      [0, -1],
      [0, 0],
      [0, 1],
    ],
  ],
};

const SHAPE_KEYS = Object.keys(SHAPES);

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomShape() {
  return SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
}

function createPiece(shape) {
  return {
    shape,
    rotation: 0,
    position: { ...SPAWN_POSITION },
  };
}

function getBlocks(piece, rotationOverride, positionOverride) {
  const rotation = rotationOverride ?? piece.rotation;
  const position = positionOverride ?? piece.position;
  const offsets = SHAPES[piece.shape][rotation];
  return offsets.map(([x, y]) => [position.x + x, position.y + y]);
}

function canPlace(board, piece, position = piece.position, rotation = piece.rotation) {
  const blocks = getBlocks(piece, rotation, position);
  return blocks.every(([x, y]) => {
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y < 0) return true;
    return !board[y][x];
  });
}

function mergePiece(board, piece) {
  const next = board.map((row) => row.slice());
  for (const [x, y] of getBlocks(piece)) {
    if (y < 0) {
      return null;
    }
    next[y][x] = piece.shape;
  }
  return next;
}

function clearLines(board) {
  let cleared = 0;
  const remaining = [];
  for (const row of board) {
    if (row.every(Boolean)) {
      cleared += 1;
    } else {
      remaining.push(row);
    }
  }
  while (remaining.length < ROWS) {
    remaining.unshift(Array(COLS).fill(null));
  }
  return { board: remaining, cleared };
}

function getSpeed(level) {
  return Math.max(900 - (level - 1) * 80, 120);
}

function useInterval(callback, delay) {
  useEffect(() => {
    if (delay === null) return undefined;
    const id = setInterval(() => {
      callback();
    }, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}

function getGhostPiece(board, piece) {
  if (!piece) return null;
  let offset = 0;
  while (
    canPlace(board, piece, {
      x: piece.position.x,
      y: piece.position.y + offset + 1,
    })
  ) {
    offset += 1;
  }
  if (offset === 0) return piece;
  return {
    ...piece,
    position: {
      x: piece.position.x,
      y: piece.position.y + offset,
    },
  };
}

function getCellPresentation(value) {
  if (!value) {
    return {
      color: "rgba(255, 255, 255, 0.06)",
      variant: "empty",
    };
  }
  const [shape, variant = "static"] = value.split("-");
  const color = CELL_COLORS[shape] ?? "#888";
  return { color, variant };
}

export default function Tetris() {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [activePiece, setActivePiece] = useState(null);
  const [nextShape, setNextShape] = useState(() => randomShape());
  const [isRunning, setIsRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);

  const startNewGame = useCallback(() => {
    const freshBoard = createEmptyBoard();
    const initialShape = randomShape();
    const initialPiece = createPiece(initialShape);
    setBoard(freshBoard);
    setActivePiece(initialPiece);
    setNextShape(randomShape());
    setScore(0);
    setLevel(1);
    setLines(0);
    setIsGameOver(false);
    setIsRunning(true);
  }, []);

  const endGame = useCallback(() => {
    setIsGameOver(true);
    setIsRunning(false);
    setActivePiece(null);
  }, []);

  const commitPiece = useCallback(
    (pieceToLock) => {
      const merged = mergePiece(board, pieceToLock);
      if (!merged) {
        endGame();
        return;
      }
      const { board: clearedBoard, cleared } = clearLines(merged);
      const totalLines = lines + cleared;
      const nextLevel = Math.min(20, 1 + Math.floor(totalLines / 10));
      const levelForScore = Math.max(level, nextLevel);
      if (cleared > 0) {
        setScore((prev) => prev + LINE_CLEAR_POINTS[cleared] * levelForScore);
      }
      setBoard(clearedBoard);
      setLines(totalLines);
      setLevel(nextLevel);
      const upcomingShape = nextShape;
      const newActive = createPiece(upcomingShape);
      const followingShape = randomShape();
      setNextShape(followingShape);
      if (!canPlace(clearedBoard, newActive)) {
        endGame();
        return;
      }
      setActivePiece(newActive);
    },
    [board, endGame, level, lines, nextShape]
  );

  const moveHorizontal = useCallback(
    (direction) => {
      if (!isRunning) return;
      setActivePiece((prev) => {
        if (!prev) return prev;
        const nextPosition = {
          x: prev.position.x + direction,
          y: prev.position.y,
        };
        if (canPlace(board, prev, nextPosition)) {
          return { ...prev, position: nextPosition };
        }
        return prev;
      });
    },
    [board, isRunning]
  );

  const rotatePiece = useCallback(() => {
    if (!isRunning) return;
    setActivePiece((prev) => {
      if (!prev) return prev;
      const nextRotation = (prev.rotation + 1) % SHAPES[prev.shape].length;
      const kicks = [0, -1, 1, -2, 2];
      for (const offset of kicks) {
        const candidatePosition = {
          x: prev.position.x + offset,
          y: prev.position.y,
        };
        if (canPlace(board, prev, candidatePosition, nextRotation)) {
          return { ...prev, rotation: nextRotation, position: candidatePosition };
        }
      }
      return prev;
    });
  }, [board, isRunning]);

  const softDrop = useCallback(() => {
    if (!isRunning) return;
    setActivePiece((prev) => {
      if (!prev) return prev;
      const nextPosition = {
        x: prev.position.x,
        y: prev.position.y + 1,
      };
      if (canPlace(board, prev, nextPosition)) {
        return { ...prev, position: nextPosition };
      }
      commitPiece(prev);
      return prev;
    });
  }, [board, commitPiece, isRunning]);

  const hardDrop = useCallback(() => {
    if (!isRunning || !activePiece) return;
    let dropDistance = 0;
    while (
      canPlace(board, activePiece, {
        x: activePiece.position.x,
        y: activePiece.position.y + dropDistance + 1,
      })
    ) {
      dropDistance += 1;
    }
    const landed = {
      ...activePiece,
      position: {
        x: activePiece.position.x,
        y: activePiece.position.y + dropDistance,
      },
    };
    commitPiece(landed);
  }, [activePiece, board, commitPiece, isRunning]);

  const togglePause = useCallback(() => {
    if (isGameOver || !activePiece) return;
    setIsRunning((prev) => !prev);
  }, [activePiece, isGameOver]);

  const dropDelay = isRunning && !isGameOver ? getSpeed(level) : null;
  useInterval(softDrop, dropDelay);

  const ghostPiece = useMemo(
    () => (activePiece ? getGhostPiece(board, activePiece) : null),
    [activePiece, board]
  );

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const displayBoard = useMemo(() => {
    const draft = board.map((row) => row.slice());
    if (ghostPiece && activePiece) {
      for (const [x, y] of getBlocks(ghostPiece)) {
        if (y >= 0 && !draft[y][x]) {
          draft[y][x] = `${ghostPiece.shape}-ghost`;
        }
      }
    }
    if (activePiece) {
      for (const [x, y] of getBlocks(activePiece)) {
        if (y >= 0) {
          draft[y][x] = `${activePiece.shape}-active`;
        }
      }
    }
    return draft;
  }, [activePiece, board, ghostPiece]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return;
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          moveHorizontal(-1);
          break;
        case "ArrowRight":
          event.preventDefault();
          moveHorizontal(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          rotatePiece();
          break;
        case "ArrowDown":
          event.preventDefault();
          softDrop();
          break;
        case " ":
          event.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          event.preventDefault();
          togglePause();
          break;
        case "n":
        case "N":
          event.preventDefault();
          startNewGame();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hardDrop, moveHorizontal, rotatePiece, softDrop, startNewGame, togglePause]);

  useEffect(() => {
    if (!activePiece && !isGameOver) {
      const initialPiece = createPiece(randomShape());
      if (!canPlace(board, initialPiece)) {
        endGame();
      } else {
        setActivePiece(initialPiece);
      }
    }
  }, [activePiece, board, endGame, isGameOver]);

  return (
    <div className={styles.container}>
      <div className={styles.frame}>
        <div className={styles.board} role="grid" aria-label="Tetris board">
          {displayBoard.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const { color, variant } = getCellPresentation(cell);
              return (
                <div
                  key={key}
                  className={`${styles.cell} ${
                    variant === "ghost" ? styles.cellGhost : ""
                  }`}
                  style={{
                    backgroundColor:
                      variant === "ghost" || variant === "empty"
                        ? "transparent"
                        : color,
                  }}
                  role="gridcell"
                />
              );
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
          {isGameOver ? "Play Again" : "New Game"}
        </button>
      </div>
    </div>
  );
}
