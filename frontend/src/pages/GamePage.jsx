import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const MATCH3_COLORS = ['ruby', 'amber', 'emerald', 'azure', 'violet', 'rose'];
const MEMORY_SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];
const DRAW_COLORS = ['sand', 'ember', 'sky', 'leaf', 'orchid', 'sun'];

const GAME_COPY = {
  'caro-5': {
    title: 'Caro 5',
    summary: 'Dat 5 quan lien tiep tren ban co lon va danh bai AI random.',
    instructions: 'Dung phim dieu huong hoac bam vao o de dat X. May tinh se danh O ngay sau moi luot hop le.',
    help: 'Hint se di chuyen con tro den mot o trong ngau nhien, Back dua con tro ve giua ban.',
  },
  'caro-4': {
    title: 'Caro 4',
    summary: 'Phien ban nhanh hon cua Caro voi muc tieu 4 quan lien tiep.',
    instructions: 'Luot choi giong Caro 5, nhung ban co nho hon va ap luc cao hon.',
    help: 'Hint chon mot nuoc di trong, Back can giua lai con tro de ban thao tac nhanh.',
  },
  'tic-tac-toe': {
    title: 'Tic-Tac-Toe',
    summary: 'Co XO co dien 3x3, phu hop demo routing va game flow.',
    instructions: 'Dat X vao mot trong 9 o. AI random danh O sau do.',
    help: 'Dung arrow de di chuyen, Enter de danh, Hint chon mot o trong.',
  },
  snake: {
    title: 'Ran san moi',
    summary: 'Dieu huong ran an moi tren ban co, tranh tu can vao than hoac bien.',
    instructions: 'Dung 4 phim mui ten hoac nut dieu khien de doi huong cho ran.',
    help: 'Hint se doi sang mot huong ngau nhien hop le neu co, Back khoi dong lai van moi.',
  },
  'match-3': {
    title: 'Ghep hang 3',
    summary: 'Chon 2 o ke nhau de doi cho va tao thanh hang 3 mau trung.',
    instructions: 'Enter lan 1 de chon vien, Enter lan 2 de doi voi o dang duoc tro den.',
    help: 'Back bo chon hien tai, Hint dua con tro den mot o ngau nhien tren ban.',
  },
  'memory-card': {
    title: 'Co tri nho',
    summary: 'Lat 2 the moi luot, ghep dung tat ca cap the de thang.',
    instructions: 'Chon the thu nhat va thu hai. Neu khop, cap the duoc giu mo.',
    help: 'Hint se dua con tro den mot the chua lat, Back bo nho lua chon dang doi.',
  },
  'free-draw': {
    title: 'Bang ve tu do',
    summary: 'To mau len tung o tren luoi. Moi o to duoc tang them diem.',
    instructions: 'Arrow di chuyen con tro, Enter to mau o hien tai, Back xoa mau.',
    help: 'Hint doi sang mau tiep theo trong bang mau.',
  },
};

function parseBoardSize(boardSize) {
  const matched = /(\d+)\s*x\s*(\d+)/i.exec(boardSize || '');
  if (!matched) {
    return { cols: 8, rows: 8 };
  }
  return { cols: Number(matched[1]), rows: Number(matched[2]) };
}

function createMatrix(rows, cols, factory) {
  return Array.from({ length: rows }, (_, y) => (
    Array.from({ length: cols }, (_, x) => (typeof factory === 'function' ? factory(x, y) : factory))
  ));
}

function getGameType(slug) {
  if (slug === 'snake') return 'snake';
  if (slug === 'match-3') return 'match3';
  if (slug === 'memory-card') return 'memory';
  if (slug === 'free-draw') return 'draw';
  return 'caro';
}

function checkLineWin(board, x, y, target) {
  const currentValue = board[y]?.[x];
  if (!currentValue) return false;

  const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
  return directions.some(([dx, dy]) => {
    let streak = 1;
    for (let step = 1; step < target; step += 1) {
      if (board[y + dy * step]?.[x + dx * step] !== currentValue) break;
      streak += 1;
    }
    for (let step = 1; step < target; step += 1) {
      if (board[y - dy * step]?.[x - dx * step] !== currentValue) break;
      streak += 1;
    }
    return streak >= target;
  });
}

function pickRandomEmpty(board) {
  const emptyCells = [];
  board.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (!cell) emptyCells.push({ x, y });
    });
  });
  if (!emptyCells.length) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function createCaroState(cols, rows) {
  return {
    board: createMatrix(rows, cols, null),
    cursorX: Math.floor(cols / 2),
    cursorY: Math.floor(rows / 2),
    gameOver: false,
    winner: null,
    result: null,
    score: 0,
  };
}

function placeFood(cols, rows, snake) {
  const emptyCells = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!snake.some(([sx, sy]) => sx === x && sy === y)) emptyCells.push([x, y]);
    }
  }
  return emptyCells[Math.floor(Math.random() * emptyCells.length)] || [0, 0];
}

function createSnakeState(cols, rows) {
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  const snake = [[centerX, centerY], [centerX - 1, centerY], [centerX - 2, centerY]];
  return {
    snake,
    direction: 'right',
    food: placeFood(cols, rows, snake),
    cursorX: centerX,
    cursorY: centerY,
    gameOver: false,
    result: null,
    score: 0,
  };
}

function stepSnake(state, cols, rows) {
  if (!state || state.gameOver) return state;
  const [headX, headY] = state.snake[0];
  const nextHead = [headX, headY];
  if (state.direction === 'left') nextHead[0] -= 1;
  if (state.direction === 'right') nextHead[0] += 1;
  if (state.direction === 'up') nextHead[1] -= 1;
  if (state.direction === 'down') nextHead[1] += 1;

  const hitWall = nextHead[0] < 0 || nextHead[0] >= cols || nextHead[1] < 0 || nextHead[1] >= rows;
  const hitBody = state.snake.some(([x, y]) => x === nextHead[0] && y === nextHead[1]);
  if (hitWall || hitBody) return { ...state, gameOver: true, result: 'lose', cursorX: nextHead[0], cursorY: nextHead[1] };

  const nextSnake = [nextHead, ...state.snake];
  const ateFood = nextHead[0] === state.food[0] && nextHead[1] === state.food[1];
  if (!ateFood) nextSnake.pop();

  return {
    ...state,
    snake: nextSnake,
    food: ateFood ? placeFood(cols, rows, nextSnake) : state.food,
    cursorX: nextHead[0],
    cursorY: nextHead[1],
    score: ateFood ? state.score + 150 : state.score,
  };
}

function shuffleArray(list) {
  const nextList = [...list];
  for (let index = nextList.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextList[index], nextList[swapIndex]] = [nextList[swapIndex], nextList[index]];
  }
  return nextList;
}

function findMatch3Cells(board) {
  const matches = new Set();
  const rows = board.length;
  const cols = board[0].length;
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols - 2; x += 1) {
      if (board[y][x] && board[y][x] === board[y][x + 1] && board[y][x] === board[y][x + 2]) {
        matches.add(`${x}:${y}`);
        matches.add(`${x + 1}:${y}`);
        matches.add(`${x + 2}:${y}`);
      }
    }
  }
  for (let x = 0; x < cols; x += 1) {
    for (let y = 0; y < rows - 2; y += 1) {
      if (board[y][x] && board[y][x] === board[y + 1][x] && board[y][x] === board[y + 2][x]) {
        matches.add(`${x}:${y}`);
        matches.add(`${x}:${y + 1}`);
        matches.add(`${x}:${y + 2}`);
      }
    }
  }
  return matches;
}

function resolveMatch3Board(board) {
  const rows = board.length;
  const cols = board[0].length;
  let nextBoard = board.map((row) => [...row]);
  let scoreGain = 0;
  let totalMatches = 0;

  while (true) {
    const matches = findMatch3Cells(nextBoard);
    if (!matches.size) break;

    totalMatches += matches.size;
    scoreGain += matches.size * 15;
    matches.forEach((entry) => {
      const [x, y] = entry.split(':').map(Number);
      nextBoard[y][x] = null;
    });

    for (let x = 0; x < cols; x += 1) {
      const keptColors = [];
      for (let y = rows - 1; y >= 0; y -= 1) {
        if (nextBoard[y][x]) keptColors.push(nextBoard[y][x]);
      }
      for (let y = rows - 1; y >= 0; y -= 1) {
        nextBoard[y][x] = keptColors[rows - 1 - y] || MATCH3_COLORS[Math.floor(Math.random() * MATCH3_COLORS.length)];
      }
    }
  }

  return { board: nextBoard, scoreGain, totalMatches };
}

function createMatch3State(cols, rows) {
  return {
    board: createMatrix(rows, cols, () => MATCH3_COLORS[Math.floor(Math.random() * MATCH3_COLORS.length)]),
    cursorX: 0,
    cursorY: 0,
    selected: null,
    movesLeft: 24,
    gameOver: false,
    result: null,
    score: 0,
  };
}

function createMemoryState(cols, rows) {
  const totalCells = cols * rows;
  const pairCount = Math.floor(totalCells / 2);
  const cardValues = shuffleArray([...MEMORY_SYMBOLS.slice(0, pairCount), ...MEMORY_SYMBOLS.slice(0, pairCount)]);
  while (cardValues.length < totalCells) cardValues.push('X');
  return {
    board: createMatrix(rows, cols, (x, y) => ({ value: cardValues[y * cols + x], flipped: false, found: false })),
    cursorX: 0,
    cursorY: 0,
    firstPick: null,
    locked: false,
    matchedPairs: 0,
    totalPairs: pairCount,
    gameOver: false,
    result: null,
    score: 0,
  };
}

function createDrawState(cols, rows) {
  return {
    board: createMatrix(rows, cols, null),
    cursorX: 0,
    cursorY: 0,
    currentColor: 0,
    paintedCells: 0,
    gameOver: false,
    result: null,
    score: 0,
  };
}

function createInitialState(game) {
  const { cols, rows } = parseBoardSize(game.board_size);
  const type = getGameType(game.slug);
  if (type === 'snake') return createSnakeState(cols, rows);
  if (type === 'match3') return createMatch3State(cols, rows);
  if (type === 'memory') return createMemoryState(cols, rows);
  if (type === 'draw') return createDrawState(cols, rows);
  return createCaroState(cols, rows);
}

function formatDuration(totalSeconds = 0) {
  const minutes = String(Math.floor((Number(totalSeconds) || 0) / 60)).padStart(2, '0');
  const seconds = String((Number(totalSeconds) || 0) % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('vi-VN');
}

function buildDefaultSaveName(game) {
  return `${game.name} ${new Date().toLocaleString('vi-VN')}`;
}

export default function GamePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveName, setSaveName] = useState('');
  const [saves, setSaves] = useState([]);
  const [ratingForm, setRatingForm] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);
  const [loadingSaves, setLoadingSaves] = useState(false);
  const [savingGame, setSavingGame] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const gameStateRef = useRef(null);
  const snakeIntervalRef = useRef(null);
  const memoryTimeoutRef = useRef(null);

  const gameType = game ? getGameType(game.slug) : null;
  const gameCopy = GAME_COPY[slug] || GAME_COPY['tic-tac-toe'];
  const currentScore = gameState?.score || 0;
  const directionControls = [
    { action: 'ArrowUp', label: 'UP', icon: '\u2191', positionClass: 'control-button-up', sizeClass: 'control-button-small' },
    { action: 'ArrowLeft', label: 'LEFT', icon: '\u2190', positionClass: 'control-button-left' },
    { action: 'ArrowRight', label: 'RIGHT', icon: '\u2192', positionClass: 'control-button-right' },
    { action: 'ArrowDown', label: 'DOWN', icon: '\u2193', positionClass: 'control-button-down', sizeClass: 'control-button-small' },
  ];
  const actionControls = [
    { action: 'Backspace', label: 'BACK', icon: '\u21B6', toneClass: 'control-face-back' },
    { action: 'Enter', label: 'ENTER', icon: '\u21A9', toneClass: 'control-face-enter' },
    { action: 'h', label: 'HELP', icon: '?' , toneClass: 'control-face-help' },
  ];

  function stopRealtimeEffects() {
    clearInterval(snakeIntervalRef.current);
    clearTimeout(memoryTimeoutRef.current);
    snakeIntervalRef.current = null;
    memoryTimeoutRef.current = null;
  }

  function applyNextState(nextState) {
    gameStateRef.current = nextState;
    setGameState(nextState);
  }

  function startSnakeLoop(nextState, currentGame) {
    stopRealtimeEffects();
    applyNextState(nextState);
    if (getGameType(currentGame.slug) !== 'snake' || nextState.gameOver) return;

    const { cols, rows } = parseBoardSize(currentGame.board_size);
    snakeIntervalRef.current = setInterval(() => {
      const steppedState = stepSnake(gameStateRef.current, cols, rows);
      applyNextState(steppedState);
      if (steppedState.gameOver) {
        clearInterval(snakeIntervalRef.current);
        snakeIntervalRef.current = null;
      }
    }, 180);
  }

  async function refreshGameDetail() {
    const nextGame = await api.getGame(slug);
    setGame(nextGame);
    return nextGame;
  }

  async function refreshSaves() {
    if (!user) {
      setSaves([]);
      return;
    }

    setLoadingSaves(true);
    try {
      setSaves(await api.getMySaves(slug));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSaves(false);
    }
  }

  function resetGame(currentGame = game) {
    if (!currentGame) return;
    const nextState = createInitialState(currentGame);
    setElapsedSeconds(0);
    setNotice('');
    if (getGameType(currentGame.slug) === 'snake') {
      startSnakeLoop(nextState, currentGame);
    } else {
      stopRealtimeEffects();
      applyNextState(nextState);
    }
  }

  // The game session is intentionally reset when slug or auth state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError('');
      setNotice('');
      stopRealtimeEffects();

      try {
        const [nextGame, nextSaves] = await Promise.all([
          api.getGame(slug),
          user ? api.getMySaves(slug).catch(() => []) : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const nextState = createInitialState(nextGame);
        setGame(nextGame);
        setSaveName(buildDefaultSaveName(nextGame));
        setSaves(nextSaves);
        setElapsedSeconds(0);
        setRatingForm({ rating: 5, comment: '' });

        if (getGameType(nextGame.slug) === 'snake') {
          startSnakeLoop(nextState, nextGame);
        } else {
          applyNextState(nextState);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
      stopRealtimeEffects();
    };
  }, [slug, user]);

  // Timer follows the current game-over state for the active session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!gameState || gameState.gameOver) return undefined;
    const timer = setInterval(() => setElapsedSeconds((previous) => previous + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState?.gameOver]);

  // Keyboard shortcuts are rebound when the visible game state changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!gameState || !game) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Backspace', 'h', 'H'].includes(event.key)) {
        event.preventDefault();
        handleControl(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, game]);

  function handleCaroControl(action) {
    if (!gameState || !game) return;

    const target = game.slug === 'caro-5' ? 5 : game.slug === 'caro-4' ? 4 : 3;
    const cols = gameState.board[0].length;
    const rows = gameState.board.length;
    let { cursorX, cursorY } = gameState;

    if (action === 'ArrowLeft') {
      cursorX = Math.max(0, cursorX - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowRight') {
      cursorX = Math.min(cols - 1, cursorX + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowUp') {
      cursorY = Math.max(0, cursorY - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowDown') {
      cursorY = Math.min(rows - 1, cursorY + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'Backspace') {
      applyNextState({ ...gameState, cursorX: Math.floor(cols / 2), cursorY: Math.floor(rows / 2) });
      setNotice('Da dua con tro ve giua ban co.');
      return;
    }
    if (action === 'h' || action === 'H') {
      const hintCell = pickRandomEmpty(gameState.board);
      if (hintCell) {
        applyNextState({ ...gameState, cursorX: hintCell.x, cursorY: hintCell.y });
        setNotice('Hint da dua con tro den mot o trong.');
      }
      return;
    }
    if (action !== 'Enter' || gameState.gameOver || gameState.board[cursorY][cursorX]) return;

    const nextBoard = gameState.board.map((row) => [...row]);
    nextBoard[cursorY][cursorX] = 'X';

    if (checkLineWin(nextBoard, cursorX, cursorY, target)) {
      applyNextState({
        ...gameState,
        board: nextBoard,
        cursorX,
        cursorY,
        winner: 'X',
        gameOver: true,
        result: 'win',
        score: gameState.score + 1200,
      });
      setNotice('Ban da thang may tinh.');
      return;
    }

    const emptyForAi = pickRandomEmpty(nextBoard);
    if (!emptyForAi) {
      applyNextState({
        ...gameState,
        board: nextBoard,
        cursorX,
        cursorY,
        gameOver: true,
        result: 'draw',
        score: gameState.score + 300,
      });
      setNotice('Van choi ket thuc voi ket qua hoa.');
      return;
    }

    nextBoard[emptyForAi.y][emptyForAi.x] = 'O';

    if (checkLineWin(nextBoard, emptyForAi.x, emptyForAi.y, target)) {
      applyNextState({
        ...gameState,
        board: nextBoard,
        cursorX,
        cursorY,
        winner: 'O',
        gameOver: true,
        result: 'lose',
      });
      setNotice('AI da chien thang. Thu lai van moi nhe.');
      return;
    }

    if (!pickRandomEmpty(nextBoard)) {
      applyNextState({
        ...gameState,
        board: nextBoard,
        cursorX,
        cursorY,
        gameOver: true,
        result: 'draw',
        score: gameState.score + 300,
      });
      setNotice('Van choi ket thuc voi ket qua hoa.');
      return;
    }

    applyNextState({
      ...gameState,
      board: nextBoard,
      cursorX,
      cursorY,
      score: gameState.score + 50,
    });
  }

  function handleSnakeControl(action) {
    if (!gameState || !game) return;

    if (action === 'Backspace') {
      resetGame(game);
      return;
    }
    if (action === 'h' || action === 'H') {
      const directions = ['up', 'right', 'down', 'left'];
      const nextDirection = directions[Math.floor(Math.random() * directions.length)];
      applyNextState({ ...gameState, direction: nextDirection });
      setNotice(`Hint da doi huong sang ${nextDirection}.`);
      return;
    }

    const directionMap = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    const oppositeDirection = { left: 'right', right: 'left', up: 'down', down: 'up' };
    const nextDirection = directionMap[action];

    if (!nextDirection || oppositeDirection[nextDirection] === gameState.direction) return;
    applyNextState({ ...gameState, direction: nextDirection });
  }

  function handleMatch3Control(action) {
    if (!gameState) return;

    const cols = gameState.board[0].length;
    const rows = gameState.board.length;
    let { cursorX, cursorY } = gameState;

    if (action === 'ArrowLeft') {
      cursorX = Math.max(0, cursorX - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowRight') {
      cursorX = Math.min(cols - 1, cursorX + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowUp') {
      cursorY = Math.max(0, cursorY - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowDown') {
      cursorY = Math.min(rows - 1, cursorY + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'Backspace') {
      applyNextState({ ...gameState, selected: null });
      return;
    }
    if (action === 'h' || action === 'H') {
      applyNextState({
        ...gameState,
        cursorX: Math.floor(Math.random() * cols),
        cursorY: Math.floor(Math.random() * rows),
      });
      setNotice('Hint da di chuyen con tro den mot o ngau nhien.');
      return;
    }
    if (action !== 'Enter' || gameState.gameOver) return;

    if (!gameState.selected) {
      applyNextState({ ...gameState, selected: { x: cursorX, y: cursorY } });
      return;
    }

    const deltaX = Math.abs(gameState.selected.x - cursorX);
    const deltaY = Math.abs(gameState.selected.y - cursorY);
    if (!((deltaX === 1 && deltaY === 0) || (deltaX === 0 && deltaY === 1))) {
      applyNextState({ ...gameState, selected: { x: cursorX, y: cursorY } });
      return;
    }

    const nextBoard = gameState.board.map((row) => [...row]);
    [nextBoard[gameState.selected.y][gameState.selected.x], nextBoard[cursorY][cursorX]] = [
      nextBoard[cursorY][cursorX],
      nextBoard[gameState.selected.y][gameState.selected.x],
    ];

    const resolved = resolveMatch3Board(nextBoard);
    if (!resolved.totalMatches) {
      applyNextState({ ...gameState, selected: null, cursorX, cursorY });
      setNotice('Nuoc di nay chua tao duoc hang 3.');
      return;
    }

    const nextMoves = gameState.movesLeft - 1;
    const nextState = {
      ...gameState,
      board: resolved.board,
      selected: null,
      cursorX,
      cursorY,
      movesLeft: nextMoves,
      score: gameState.score + resolved.scoreGain,
      gameOver: nextMoves <= 0,
      result: nextMoves <= 0 ? 'completed' : null,
    };

    applyNextState(nextState);
    if (nextState.gameOver) setNotice('Ban da dung het luot. Hay luu diem va choi tiep.');
  }

  function handleMemoryControl(action) {
    if (!gameState || gameState.locked) return;

    const cols = gameState.board[0].length;
    const rows = gameState.board.length;
    let { cursorX, cursorY } = gameState;

    if (action === 'ArrowLeft') {
      cursorX = Math.max(0, cursorX - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowRight') {
      cursorX = Math.min(cols - 1, cursorX + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowUp') {
      cursorY = Math.max(0, cursorY - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowDown') {
      cursorY = Math.min(rows - 1, cursorY + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'Backspace') {
      applyNextState({ ...gameState, firstPick: null });
      return;
    }
    if (action === 'h' || action === 'H') {
      const hiddenCards = [];
      gameState.board.forEach((row, y) => {
        row.forEach((card, x) => {
          if (!card.found && !card.flipped) hiddenCards.push({ x, y });
        });
      });
      const hintCard = hiddenCards[Math.floor(Math.random() * hiddenCards.length)];
      if (hintCard) {
        applyNextState({ ...gameState, cursorX: hintCard.x, cursorY: hintCard.y });
        setNotice('Hint da dua con tro den mot la bai chua mo.');
      }
      return;
    }
    if (action !== 'Enter' || gameState.gameOver) return;

    const targetCard = gameState.board[cursorY][cursorX];
    if (!targetCard || targetCard.found || targetCard.flipped) return;

    const nextBoard = gameState.board.map((row) => row.map((cell) => ({ ...cell })));
    nextBoard[cursorY][cursorX].flipped = true;

    if (!gameState.firstPick) {
      applyNextState({ ...gameState, board: nextBoard, firstPick: { x: cursorX, y: cursorY }, cursorX, cursorY });
      return;
    }

    const firstCard = nextBoard[gameState.firstPick.y][gameState.firstPick.x];
    const secondCard = nextBoard[cursorY][cursorX];

    if (firstCard.value === secondCard.value) {
      nextBoard[gameState.firstPick.y][gameState.firstPick.x].found = true;
      nextBoard[cursorY][cursorX].found = true;
      const nextPairs = gameState.matchedPairs + 1;
      const nextState = {
        ...gameState,
        board: nextBoard,
        cursorX,
        cursorY,
        firstPick: null,
        matchedPairs: nextPairs,
        score: gameState.score + 120,
        gameOver: nextPairs >= gameState.totalPairs,
        result: nextPairs >= gameState.totalPairs ? 'win' : null,
      };
      applyNextState(nextState);
      if (nextState.gameOver) setNotice('Ban da lat dung toan bo cap the.');
      return;
    }

    const waitingState = { ...gameState, board: nextBoard, cursorX, cursorY, locked: true };
    applyNextState(waitingState);

    memoryTimeoutRef.current = setTimeout(() => {
      const resetBoard = nextBoard.map((row) => row.map((cell) => ({ ...cell, flipped: cell.found })));
      applyNextState({ ...waitingState, board: resetBoard, firstPick: null, locked: false });
    }, 900);
  }

  function handleDrawControl(action) {
    if (!gameState) return;

    const cols = gameState.board[0].length;
    const rows = gameState.board.length;
    let { cursorX, cursorY, currentColor } = gameState;

    if (action === 'ArrowLeft') {
      cursorX = Math.max(0, cursorX - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowRight') {
      cursorX = Math.min(cols - 1, cursorX + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowUp') {
      cursorY = Math.max(0, cursorY - 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'ArrowDown') {
      cursorY = Math.min(rows - 1, cursorY + 1);
      applyNextState({ ...gameState, cursorX, cursorY });
      return;
    }
    if (action === 'h' || action === 'H') {
      currentColor = (currentColor + 1) % DRAW_COLORS.length;
      applyNextState({ ...gameState, cursorX, cursorY, currentColor });
      setNotice('Da doi sang mau ve tiep theo.');
      return;
    }

    const nextBoard = gameState.board.map((row) => [...row]);
    if (action === 'Backspace') {
      if (nextBoard[cursorY][cursorX]) {
        nextBoard[cursorY][cursorX] = null;
        const paintedCells = nextBoard.flat().filter(Boolean).length;
        applyNextState({ ...gameState, board: nextBoard, cursorX, cursorY, paintedCells, score: paintedCells * 5 });
      }
      return;
    }
    if (action !== 'Enter') return;

    nextBoard[cursorY][cursorX] = DRAW_COLORS[currentColor];
    const paintedCells = nextBoard.flat().filter(Boolean).length;
    applyNextState({
      ...gameState,
      board: nextBoard,
      cursorX,
      cursorY,
      currentColor,
      paintedCells,
      score: paintedCells * 5,
      result: paintedCells ? 'completed' : null,
    });
  }

  function handleControl(action) {
    if (!game || !gameState) return;
    setError('');

    if (gameType === 'snake') {
      handleSnakeControl(action);
      return;
    }
    if (gameType === 'match3') {
      handleMatch3Control(action);
      return;
    }
    if (gameType === 'memory') {
      handleMemoryControl(action);
      return;
    }
    if (gameType === 'draw') {
      handleDrawControl(action);
      return;
    }
    handleCaroControl(action);
  }

  function handleBoardClick(x, y) {
    if (!gameState) return;
    applyNextState({ ...gameState, cursorX: x, cursorY: y });
    setTimeout(() => handleControl('Enter'), 0);
  }

  async function handleSaveGame() {
    if (!user || !game || !gameState) {
      setError('Dang nhap de luu tien do choi game.');
      return;
    }

    setSavingGame(true);
    setError('');
    setNotice('');

    try {
      await api.saveGame(game.slug, {
        save_name: saveName.trim() || buildDefaultSaveName(game),
        state_json: { gameState, elapsedSeconds },
        score: currentScore,
        duration_seconds: elapsedSeconds,
      });
      await refreshSaves();
      setNotice('Da luu tien do choi game thanh cong.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingGame(false);
    }
  }

  function handleLoadSave(save) {
    if (!game) return;

    const savedState = save.state_json?.gameState || save.state_json;
    const savedSeconds = Number(save.state_json?.elapsedSeconds ?? save.duration_seconds ?? 0);
    setElapsedSeconds(savedSeconds);
    setNotice(`Da tai ban luu "${save.save_name}".`);

    if (getGameType(game.slug) === 'snake') {
      startSnakeLoop(savedState, game);
    } else {
      stopRealtimeEffects();
      applyNextState(savedState);
    }
  }

  async function handleSubmitScore() {
    if (!user || !game || !gameState) {
      setError('Dang nhap de luu diem so cua ban.');
      return;
    }

    setSubmittingScore(true);
    setError('');
    setNotice('');

    try {
      await api.recordScore(game.slug, {
        score: currentScore,
        result: gameState.result || 'completed',
        duration_seconds: elapsedSeconds,
        metadata_json: {
          board_size: game.board_size,
          game_type: gameType,
        },
      });
      await refreshGameDetail();
      setNotice('Da luu diem so vao he thong.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingScore(false);
    }
  }

  async function handleSubmitRating(event) {
    event.preventDefault();
    if (!user || !game) {
      setError('Dang nhap de gui danh gia game.');
      return;
    }

    setSubmittingRating(true);
    setError('');
    setNotice('');

    try {
      await api.rateGame(game.slug, ratingForm);
      await refreshGameDetail();
      setRatingForm({ rating: 5, comment: '' });
      setNotice('Da gui danh gia cua ban.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingRating(false);
    }
  }

  function renderSnakeBoard() {
    const { cols, rows } = parseBoardSize(game.board_size);
    const board = createMatrix(rows, cols, '');
    gameState.snake.forEach(([x, y], index) => {
      board[y][x] = index === 0 ? 'snake-head' : 'snake-body';
    });
    if (gameState.food) board[gameState.food[1]][gameState.food[0]] = 'snake-food';

    return (
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${cols}, minmax(18px, 1fr))` }}>
        {board.map((row, y) => row.map((cell, x) => (
          <button key={`${x}-${y}`} className={`board-cell ${cell}`} type="button" onClick={() => handleBoardClick(x, y)} />
        )))}
      </div>
    );
  }

  function renderCaroBoard() {
    const board = gameState.board;
    const cellSize = game.slug === 'tic-tac-toe' ? 64 : game.slug === 'caro-4' ? 40 : 32;

    return (
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${board[0].length}, ${cellSize}px)` }}>
        {board.map((row, y) => row.map((cell, x) => (
          <button
            key={`${x}-${y}`}
            className={`board-cell board-cell-symbol${gameState.cursorX === x && gameState.cursorY === y ? ' selected' : ''}`}
            style={{ width: cellSize, height: cellSize }}
            type="button"
            onClick={() => handleBoardClick(x, y)}
          >
            {cell || ''}
          </button>
        )))}
      </div>
    );
  }

  function renderMatch3Board() {
    const board = gameState.board;
    return (
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${board[0].length}, 42px)` }}>
        {board.map((row, y) => row.map((cell, x) => (
          <button
            key={`${x}-${y}`}
            className={`board-cell board-cell-color color-${cell}${gameState.cursorX === x && gameState.cursorY === y ? ' selected' : ''}${gameState.selected?.x === x && gameState.selected?.y === y ? ' is-picked' : ''}`}
            style={{ width: 42, height: 42 }}
            type="button"
            onClick={() => handleBoardClick(x, y)}
          />
        )))}
      </div>
    );
  }

  function renderMemoryBoard() {
    const board = gameState.board;
    return (
      <div className="game-board" style={{ gridTemplateColumns: `repeat(${board[0].length}, 56px)` }}>
        {board.map((row, y) => row.map((card, x) => (
          <button
            key={`${x}-${y}`}
            className={`board-cell board-cell-memory${gameState.cursorX === x && gameState.cursorY === y ? ' selected' : ''}${card.found ? ' is-found' : ''}`}
            style={{ width: 56, height: 56 }}
            type="button"
            onClick={() => handleBoardClick(x, y)}
          >
            {card.flipped || card.found ? card.value : '?'}
          </button>
        )))}
      </div>
    );
  }

  function renderDrawBoard() {
    const board = gameState.board;
    return (
      <>
        <div className="draw-palette">
          {DRAW_COLORS.map((colorName, index) => (
            <button
              key={colorName}
              className={`palette-swatch color-${colorName}${gameState.currentColor === index ? ' active' : ''}`}
              type="button"
              onClick={() => applyNextState({ ...gameState, currentColor: index })}
            />
          ))}
        </div>
        <div className="game-board" style={{ gridTemplateColumns: `repeat(${board[0].length}, 28px)` }}>
          {board.map((row, y) => row.map((cell, x) => (
            <button
              key={`${x}-${y}`}
              className={`board-cell board-cell-draw${cell ? ` color-${cell}` : ''}${gameState.cursorX === x && gameState.cursorY === y ? ' selected' : ''}`}
              style={{ width: 28, height: 28 }}
              type="button"
              onClick={() => handleBoardClick(x, y)}
            />
          )))}
        </div>
      </>
    );
  }

  function renderBoard() {
    if (!game || !gameState) return null;
    if (gameType === 'snake') return renderSnakeBoard();
    if (gameType === 'match3') return renderMatch3Board();
    if (gameType === 'memory') return renderMemoryBoard();
    if (gameType === 'draw') return renderDrawBoard();
    return renderCaroBoard();
  }

  if (loading) {
    return (
      <section className="content-panel">
        <div className="page-loader">
          <div className="spinner" />
          <p>Dang tai giao dien choi game...</p>
        </div>
      </section>
    );
  }

  if (!game || !gameState) {
    return (
      <section className="content-panel">
        <div className="empty-state">
          <h2>Khong tai duoc game</h2>
          <p>{error || 'Khong tim thay game nay trong he thong.'}</p>
          <Link className="btn btn-primary" to="/">Ve danh sach game</Link>
        </div>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <section className="section-header">
        <div>
          <p className="section-tag">Gameplay</p>
          <h1 className="page-title">{gameCopy.title}</h1>
          <p className="lead">{gameCopy.summary}</p>
        </div>
        <div className="button-row">
          <Link className="btn btn-secondary" to="/">Ve danh sach game</Link>
          <button className="btn btn-primary" type="button" onClick={() => resetGame()}>Bat dau van moi</button>
        </div>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {notice && <div className="alert alert-success">{notice}</div>}

      <div className="play-layout">
        <section className="content-panel play-board-panel">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Game Board</p>
              <h2>{game.name}</h2>
            </div>
            <span className={`status-pill${gameState.gameOver ? ' status-pill-highlight' : ' status-pill-success'}`}>
              {gameState.gameOver ? (gameState.result || 'completed') : 'playing'}
            </span>
          </div>

          {renderBoard()}

          <div className="control-console" aria-label="Game controls">
            <div className="direction-pad">
              {directionControls.map((control) => (
                <button
                  key={control.action}
                  className={`control-button ${control.positionClass || ''} ${control.sizeClass || ''}`.trim()}
                  type="button"
                  aria-label={control.label}
                  onClick={() => handleControl(control.action)}
                >
                  <span className="control-face control-face-dark">{control.icon}</span>
                  <span className="control-button-label">{control.label}</span>
                </button>
              ))}
            </div>

            <div className="action-pad">
              {actionControls.map((control) => (
                <button
                  key={control.action}
                  className="control-button control-button-round"
                  type="button"
                  aria-label={control.label}
                  onClick={() => handleControl(control.action)}
                >
                  <span className={`control-face ${control.toneClass}`}>{control.icon}</span>
                  <span className="control-button-label">{control.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="play-sidebar">
          <section className="content-panel">
            <div className="stats-strip stats-strip-compact">
              <article className="stat-tile">
                <span className="stat-label">Diem</span>
                <strong>{currentScore}</strong>
              </article>
              <article className="stat-tile">
                <span className="stat-label">Thoi gian</span>
                <strong>{formatDuration(elapsedSeconds)}</strong>
              </article>
              <article className="stat-tile">
                <span className="stat-label">Board</span>
                <strong>{game.board_size || 'Khong ro'}</strong>
              </article>
            </div>
          </section>

          <section className="content-panel">
            <div className="panel-heading">
              <div>
                <p className="section-tag">Guide</p>
                <h2>Huong dan nhanh</h2>
              </div>
            </div>
            <div className="info-list">
              <div>
                <span>Cach choi</span>
                <strong>{gameCopy.instructions}</strong>
              </div>
              <div>
                <span>Help</span>
                <strong>{gameCopy.help}</strong>
              </div>
              <div>
                <span>Trang thai</span>
                <strong>{game.is_enabled ? 'Game dang mo' : 'Game dang tam tat'}</strong>
              </div>
            </div>
          </section>

          <section className="content-panel">
            <div className="panel-heading">
              <div>
                <p className="section-tag">Save / Score</p>
                <h2>Luu tien do</h2>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="save-name">Ten ban luu</label>
              <input
                id="save-name"
                className="form-input"
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
                placeholder="Nhap ten cho ban luu"
              />
            </div>

            <div className="button-stack">
              <button className="btn btn-primary" type="button" onClick={handleSaveGame} disabled={savingGame}>
                {savingGame ? 'Dang luu...' : 'Luu game'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={refreshSaves} disabled={loadingSaves || !user}>
                {loadingSaves ? 'Dang tai...' : 'Tai danh sach save'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleSubmitScore} disabled={submittingScore}>
                {submittingScore ? 'Dang gui...' : 'Luu diem'}
              </button>
            </div>

            {!user && (
              <p className="helper-copy">Dang nhap de su dung tinh nang luu tien do, luu diem va danh gia.</p>
            )}
          </section>
        </aside>
      </div>

      <div className="section-grid">
        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Saved Sessions</p>
              <h2>Danh sach ban luu</h2>
            </div>
          </div>

          {user ? (
            saves.length ? (
              <div className="score-list">
                {saves.map((save) => (
                  <div key={save.id} className="score-row">
                    <div>
                      <strong>{save.save_name}</strong>
                      <p>{formatDate(save.updated_at || save.created_at)}</p>
                    </div>
                    <div className="score-row-meta">
                      <span>{save.score} diem</span>
                      <button className="btn btn-secondary btn-compact" type="button" onClick={() => handleLoadSave(save)}>
                        Tai lai
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state empty-state-left">
                <p>Ban chua co ban luu nao cho game nay.</p>
              </div>
            )
          ) : (
            <div className="empty-state empty-state-left">
              <p>Dang nhap de xem va tai lai cac ban luu cua ban.</p>
            </div>
          )}
        </section>

        <section className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="section-tag">Leaderboard</p>
              <h2>Top diem va danh gia</h2>
            </div>
          </div>

          {game.top_scores?.length ? (
            <div className="score-list">
              {game.top_scores.map((score) => (
                <div key={score.id} className="score-row">
                  <div>
                    <strong>{score.display_name || score.username}</strong>
                    <p>{formatDate(score.created_at)}</p>
                  </div>
                  <div className="score-row-meta">
                    <strong>{score.score}</strong>
                    <span>{score.result}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state-left">
              <p>Chua co diem nao duoc luu cho game nay.</p>
            </div>
          )}

          <div className="panel-heading panel-heading-spaced">
            <div>
              <p className="section-tag">Ratings</p>
              <h2>{game.average_rating ? `${game.average_rating.toFixed(1)} / 5` : 'Chua co danh gia'}</h2>
            </div>
          </div>

          {game.recent_ratings?.length ? (
            <div className="score-list">
              {game.recent_ratings.map((rating) => (
                <div key={rating.id} className="score-row">
                  <div>
                    <strong>{rating.display_name || rating.username}</strong>
                    <p>{rating.comment || 'Khong co nhan xet.'}</p>
                  </div>
                  <div className="score-row-meta">
                    <strong>{rating.rating}/5</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state-left">
              <p>Chua co ai gui danh gia cho game nay.</p>
            </div>
          )}
        </section>
      </div>

      <section className="content-panel">
        <div className="panel-heading">
          <div>
            <p className="section-tag">Rating Form</p>
            <h2>Gui danh gia cua ban</h2>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmitRating}>
          <div className="two-column-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="rating-value">So sao</label>
              <select
                id="rating-value"
                className="form-input"
                value={ratingForm.rating}
                onChange={(event) => setRatingForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
              >
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rating-comment">Nhan xet</label>
              <textarea
                id="rating-comment"
                className="form-textarea"
                rows={4}
                value={ratingForm.comment}
                onChange={(event) => setRatingForm((prev) => ({ ...prev, comment: event.target.value }))}
                placeholder="Chia se cam nhan cua ban ve tro choi nay"
              />
            </div>
          </div>

          <div className="button-row">
            <button className="btn btn-primary" type="submit" disabled={submittingRating}>
              {submittingRating ? 'Dang gui...' : 'Gui danh gia'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
