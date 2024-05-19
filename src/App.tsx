import { useCallback, useEffect, useState } from 'react'
import './App.css'

const BOARD_ROWS = 30;
const BOARD_COLS = 30;
const PLAYER_SIDES = ["O", "X"];
const PLAYER_STYLES = ["text-red-500", "text-blue-400"];

export interface GameState {
  board: number[][];
  turnCount: number;
  currentPlayer: 1 | 2;
  playerSide: 1 | 2;
  goFirst: 1 | 2;
  winner?: 1 | 2;
  lastMove: {
    x: number;
    y: number;
  };
  twoSideBlocking: boolean;
  gameMode: "PVP" | "PVC"
}

const defaultGameState: GameState = {
  board: Array.from(Array(BOARD_ROWS), () => new Array(BOARD_COLS).fill(0)),
  turnCount: 0,
  currentPlayer: 1,
  playerSide: 1,
  goFirst: 2,
  lastMove: {x: -1, y: -1},
  twoSideBlocking: true,
  gameMode: "PVC",
}

function App() {
  const [gameState, setGameState] = useState<GameState>({...defaultGameState, board: Array.from(Array(BOARD_ROWS), () => new Array(BOARD_COLS).fill(0))});

  const resetgame = () => {
    setGameState({...defaultGameState, board: Array.from(Array(BOARD_ROWS), () => new Array(BOARD_COLS).fill(0))});
  }

  const checkWinner = (state: GameState) => {
    let	l1 = 1, n1 = 0, l2 = 1, n2 = 0, l3 = 1, n3 = 0, l4 = 1, n4 = 0;

    for (let i = -1; i <= 1; i++)
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue;
        let xx = state.lastMove.x + j, yy = state.lastMove.y + i;
        while (xx >= 0 && xx < BOARD_COLS && yy >= 0 && yy < BOARD_ROWS) {
          if (state.board[yy][xx] === state.currentPlayer) {
            if (i == j)
              l1++;
            else if (i == -j)
              l2++;
            else if (i == 0)
              l3++;
            else l4++;
          }
          else {
            if (state.board[yy][xx] != 0) {
              if (i == j)
                n1++;
              else if (i == -j)
                n2++;
              else if (i == 0)
                n3++;
              else n4++;
            }
            break;
          }
          xx += j;
          yy += i;
        }
      }

    if ((l1 >= 5 && !state.twoSideBlocking) || (l1 >= 5 && state.twoSideBlocking && n1 != 2)) {
      return state.currentPlayer;
    } else if ((l2 >= 5 && !state.twoSideBlocking) || (l2 >= 5 && state.twoSideBlocking && n2 != 2)) {
      return state.currentPlayer;
    } else if ((l3 >= 5 && !state.twoSideBlocking) || (l3 >= 5 && state.twoSideBlocking && n3 != 2)) {
      return state.currentPlayer;
    } else if ((l4 >= 5 && !state.twoSideBlocking) || (l4 >= 5 && state.twoSideBlocking && n4 != 2)) {
      return state.currentPlayer;
    }

    return undefined;
  };

  const aiMove = (state: GameState) : {x: number; y: number} => {
    let	playerCountMax = 0, aiCountMax = 0, playerBlockedMax = 0, aiBlockedMax = 0, playerMoveX = 0, aiMoveX = 0, playerMoveY = 0, aiMoveY = 0, playerDirX = 0, aiDirX = 0, playerDirY = 0, aiDirY = 0, maxToWin = 5;
    let goFirst = true;

    if (state.twoSideBlocking) maxToWin = 6;

    for (let y = 0; y < BOARD_ROWS; y++)
      for (let x = 0; x < BOARD_COLS; x++) {

        if (state.board[y][x] == 0) continue;
        goFirst = false;

        for (let i = -1; i <= 1; i++)
          for (let j = -1; j <= 1; j++) {
            let blocked = 0, count = 0, xx = 0, yy = 0;

            if (i == 0 && j == 0) continue;

            if (x - j < 0 || x - j >= BOARD_COLS || y - i < 0 || y - i >= BOARD_ROWS)
              blocked++;
            else {
              if (state.board[y - i][x - j] == state.board[y][x])
                continue;
              if (state.board[y - i][x - j] != state.board[y][x] && state.board[y - i][x - j] != 0)
                blocked++;
            }

            xx = x;
            yy = y;

            for (let m = 0; m < maxToWin; m++) {

              if ((xx < 0 || xx >= BOARD_COLS || yy < 0 || yy >= BOARD_ROWS) || (state.board[yy][xx] != state.board[y][x] && state.board[yy][xx] != 0)) {
                blocked = 0;
                count = 0;
                break;
              }

              if (state.board[yy][xx] == state.board[y][x]) count++;
              xx += j;
              yy += i;
            }

            if (count == 4) blocked = 0;

            if (state.board[y][x] == state.currentPlayer) {
              if (count * 2 - blocked >= aiCountMax * 2 - aiBlockedMax) {
                aiCountMax = count;
                aiBlockedMax = blocked;
                aiMoveX = x;
                aiMoveY = y;
                aiDirX = j;
                aiDirY = i;
              }
            }
            else {
              if (count * 2 - blocked >= playerCountMax * 2 - playerBlockedMax) {
                playerCountMax = count;
                playerBlockedMax = blocked;
                playerMoveX = x;
                playerMoveY = y;
                playerDirX = j;
                playerDirY = i;
              }
            }
          }
      }

    if (goFirst) {
      return {
        x: BOARD_COLS / 2,
        y: BOARD_ROWS / 2,
      };
    }

    if (playerCountMax - playerBlockedMax > aiCountMax - aiBlockedMax) {
      while (state.board[playerMoveY][playerMoveX] != 0) {
        playerMoveX += playerDirX;
        playerMoveY += playerDirY;
      }

      return {
        x: playerMoveX,
        y: playerMoveY,
      };
    }
    else {
      while (state.board[aiMoveY][aiMoveX] != 0) {
        aiMoveX += aiDirX;
        aiMoveY += aiDirY;
      }

      return {
        x: aiMoveX,
        y: aiMoveY,
      };
    }
  }

  const playerMove = useCallback((x: number, y: number) => {
    if (gameState.board[y][x] !== 0 || gameState.winner != null) return;

    if (gameState.gameMode === "PVP" || gameState.playerSide === gameState.currentPlayer) {
      gameState.board[y][x] = gameState.currentPlayer;
      gameState.lastMove = {x, y}
      const winner = checkWinner(gameState);
      setGameState({...gameState, currentPlayer: gameState.currentPlayer === 1 ? 2 : 1, winner });
      return;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState.gameMode === "PVC" && gameState.winner == null && gameState.currentPlayer != gameState.playerSide) {
      const move = aiMove(gameState);
      gameState.board[move.y][move.x] = gameState.currentPlayer;
      gameState.lastMove = move;
      const winner = checkWinner(gameState);
      setGameState({...gameState, currentPlayer: gameState.currentPlayer === 1 ? 2 : 1, winner });
    }
  }, [gameState])


  return (
    <>
      <div className="flex gap-10 items-center">
        <span>{`Rows: ${BOARD_ROWS}`}</span>
        <span>{`Columns: ${BOARD_COLS}`}</span>
        <span>{`Mode: ${gameState.gameMode}`}</span>
        <span>{`Player 1: ${PLAYER_SIDES[gameState.playerSide - 1]}`}</span>
        <span>{`Player 2: ${PLAYER_SIDES[2 - gameState.playerSide]}`}</span>
        <span>{`Go First: Player ${gameState.goFirst} (${PLAYER_SIDES[gameState.goFirst - 1]})`}</span>
        <button onClick={() => resetgame()} >Reset Game</button>
      </div>
      <span>{`Current Player: Player ${gameState.currentPlayer} (${PLAYER_SIDES[gameState.currentPlayer - 1]})`}</span>
      <div className="flex flex-col border-t border-l w-min">
        {gameState.board.map((row, y) => (
          <div key={`row-${y}`} className="flex">
            {row.map((cell, x) => (
              <div 
                key={`row-${y}-col-${x}`} 
                className={`flex items-center justify-center w-8 h-8 border-r border-b ${PLAYER_STYLES[cell - 1]} ${gameState.currentPlayer === 1 && gameState.winner == null ? 'hover:bg-red-100' : gameState.currentPlayer === 2 && gameState.winner == null ? 'hover:bg-blue-100' : ''} ${x === gameState.lastMove.x && y === gameState.lastMove.y ? '!bg-green-100' : ''}`}
                onClick={() => playerMove(x, y)}
                >
                {PLAYER_SIDES[cell - 1]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

export default App
