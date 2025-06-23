import React, { useState } from "react";
import "./App.css";

const EMPTY = "";
const PLAYER = "X";
const COMPUTER = "O";

function App() {
  const initialBoard = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
  ];

  const [board, setBoard] = useState(initialBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [status, setStatus] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [showStartMenu, setShowStartMenu] = useState(true);

  const checkWinner = (b) => {
    const lines = [
      [b[0][0], b[0][1], b[0][2]],
      [b[1][0], b[1][1], b[1][2]],
      [b[2][0], b[2][1], b[2][2]],
      [b[0][0], b[1][0], b[2][0]],
      [b[0][1], b[1][1], b[2][1]],
      [b[0][2], b[1][2], b[2][2]],
      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]],
    ];
    for (let line of lines) {
      if (line.every((cell) => cell === PLAYER)) return PLAYER;
      if (line.every((cell) => cell === COMPUTER)) return COMPUTER;
    }
    return null;
  };

  const checkDraw = (b) => {
    return b.flat().every((cell) => cell !== EMPTY);
  };

  const handleClick = async (row, col) => {
    if (!isPlayerTurn || gameOver || board[row][col] !== EMPTY) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = PLAYER;
    setBoard(newBoard);
    setIsPlayerTurn(false);

    const winner = checkWinner(newBoard);
    if (winner) {
      setStatus("You Win!");
      setGameOver(true);
      return;
    } else if (checkDraw(newBoard)) {
      setStatus("It's a Draw!");
      setGameOver(true);
      return;
    }

    setStatus("Computer's Turn...");

    try {
      const response = await fetch("https://tic-tac-toe-game-backend.onrender.com/computer_move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: newBoard }),
      });
      const data = await response.json();
      if (data.move) {
        const [x, y] = data.move;
        newBoard[x][y] = COMPUTER;
      }
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        setStatus("Computer Wins!");
        setGameOver(true);
      } else if (checkDraw(newBoard)) {
        setStatus("It's a Draw!");
        setGameOver(true);
      } else {
        setIsPlayerTurn(true);
        setStatus("Your Turn");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Server Error");
    }
  };

  const resetBoard = () => {
    setBoard(initialBoard);
    setIsPlayerTurn(true);
    setStatus("");
    setGameOver(false);
    setShowStartMenu(true);
  };

  const handleStart = async (playerFirst) => {
    const newBoard = initialBoard.map((row) => [...row]);
    setBoard(newBoard);
    setGameOver(false);
    setShowStartMenu(false);

    if (playerFirst) {
      setIsPlayerTurn(true);
      setStatus("Your Turn");
    } else {
      setIsPlayerTurn(false);
      setStatus("Computer's Turn...");
      try {
        const response = await fetch("https://tic-tac-toe-game-backend.onrender.com/computer_move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board: newBoard }),
        });
        const data = await response.json();
        if (data.move) {
          const [x, y] = data.move;
          newBoard[x][y] = COMPUTER;
        }
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner) {
          setStatus("Computer Wins!");
          setGameOver(true);
        } else if (checkDraw(newBoard)) {
          setStatus("It's a Draw!");
          setGameOver(true);
        } else {
          setIsPlayerTurn(true);
          setStatus("Your Turn");
        }
      } catch (error) {
        console.error("Error:", error);
        setStatus("Server Error");
      }
    }
  };

  return (
    <div className="App">
      <h1>Tic Tac Toe</h1>

      {showStartMenu ? (
        <div className="start-menu">
          <p>Who should play first?</p>
          <button onClick={() => handleStart(true)}>You</button>
          <button onClick={() => handleStart(false)}>Computer</button>
        </div>
      ) : (
        <>
          <p className="status">{status}</p>
          <table className="board">
            <tbody>
              {board.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} onClick={() => handleClick(i, j)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="buttons">
            {!gameOver && <button onClick={resetBoard}>Reset</button>}
            {gameOver && <button onClick={resetBoard}>Play Again</button>}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
