const resultPara = document.querySelector(".result");
const start = document.querySelector(".start");
const playerTypeElt = document.querySelector(".type");
const difficulty = document.querySelector(".difficulty");

let playerHuman;
let playerType = "X";
let aiType = "O";

function changeDifficulty() {
  if (difficulty.textContent === "random") {
    difficulty.textContent = "unbeatable";
  } else {
    difficulty.textContent = "random";
  }
}

function changeType() {
  if (playerType === "X") {
    playerTypeElt.textContent = "O";
    playerType = playerTypeElt.textContent;
    aiType = "X";
  } else {
    playerTypeElt.textContent = "X";
    playerType = playerTypeElt.textContent;
    aiType = "O";
  }
}

const Gameboard = (function () {
  let gameboard = [];
  function getGameboard() {
    return gameboard;
  }
  function setGameboard(arr) {
    gameboard = arr;
  }
  const cells = document.querySelectorAll(".cell");

  function setMark(index, type) {
    const curCell = document.getElementById(`${index}`);
    if (type === "X") {
      curCell.style.background = "url('./assets/images/cross.svg')";
    } else {
      curCell.style.background = "url('./assets/images/circle.svg')";
    }
    gameboard[index] = type;
    curCell.removeEventListener("click", Gameflow.makeTurn);
    Gameflow.setTurnCounter(Gameflow.getTurnCounter() + 1);
  }

  function emptyIndexes(gb) {
    return gb.filter((s) => s !== "O" && s !== "X");
  }

  return { cells, setMark, getGameboard, setGameboard, emptyIndexes };
})();

function player(name, type, difficulty) {
  return { name, type, difficulty };
}

const GameController = (function () {
  const notification = document.querySelector(".notification");
  const name = document.getElementById("name");

  function checkName() {
    if (!name.value) {
      notification.textContent = "name is required";
      return false;
    }
    notification.textContent = "";
    return true;
  }

  function showCells() {
    const gameboard = document.querySelector(".gameboard");
    gameboard.style.display = "grid";
  }

  function clearCells() {
    resultPara.textContent = "";
    Gameboard.setGameboard([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    Gameboard.cells.forEach((cell) => {
      cell.style.background = "";
    });
    Gameflow.setTurnCounter(0);
    start.textContent = "restart / save new settings";
  }

  function startGame() {
    if (!checkName()) return;
    playerHuman = player(`${name.value}`, playerType, difficulty.textContent);
    clearCells();
    showCells();
    Gameflow.playRound();
  }

  return { startGame };
})();

const Gameflow = (function () {
  let turnCounter = 0;
  function setTurnCounter(num) {
    turnCounter = num;
  }
  function getTurnCounter() {
    return turnCounter;
  }

  function checkForWin(board, type) {
    if (
      (board[0] === type && board[1] === type && board[2] === type) ||
      (board[3] === type && board[4] === type && board[5] === type) ||
      (board[6] === type && board[7] === type && board[8] === type) ||
      (board[0] === type && board[3] === type && board[6] === type) ||
      (board[1] === type && board[4] === type && board[7] === type) ||
      (board[2] === type && board[5] === type && board[8] === type) ||
      (board[0] === type && board[4] === type && board[8] === type) ||
      (board[2] === type && board[4] === type && board[6] === type)
    ) {
      return true;
    }
    return false;
  }

  function checkForTie() {
    return Gameflow.getTurnCounter() === 9;
  }

  function makeTurn() {
    const index = this.id;
    Gameboard.setMark(index, playerHuman.type);

    let result = checkForWin(Gameboard.getGameboard(), playerType);

    if (result) {
      announce(playerType);
    } else if (checkForTie()) {
      announce("tie");
    } else {
      aiTurn(playerHuman.difficulty);
      result = checkForWin(Gameboard.getGameboard(), aiType);
      if (result) announce(aiType);
    }
  }

  function aiTurn(difficulty) {
    function minimax(newBoard, type) {
      const availSpots = Gameboard.emptyIndexes(newBoard);

      if (checkForWin(newBoard, playerType)) {
        return { score: -10 };
      }
      if (checkForWin(newBoard, aiType)) {
        return { score: 10 };
      }
      if (availSpots.length === 0) {
        return { score: 0 };
      }

      const moves = [];

      for (let i = 0; i < availSpots.length; i += 1) {
        const move = {};
        move.index = newBoard[availSpots[i]];

        newBoard[availSpots[i]] = type;

        if (type === aiType) {
          const result = minimax(newBoard, playerType);
          move.score = result.score;
        } else {
          const result = minimax(newBoard, aiType);
          move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
      }

      let bestMove;
      if (type === aiType) {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      }
      return moves[bestMove];
    }

    function randomIndex() {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * 9);
      } while (typeof Gameboard.getGameboard()[randomIndex] !== "number");
      return randomIndex;
    }

    let aiIndex;

    if (difficulty === "random") {
      aiIndex = randomIndex();
    } else {
      aiIndex = minimax(Gameboard.getGameboard(), aiType).index;
    }

    Gameboard.setMark(aiIndex, aiType);
  }

  function announce(type) {
    resultPara.style.display = "block";
    if (type === playerHuman.type) {
      resultPara.textContent = `${playerHuman.name} wins!`;
    } else if (type === "tie") {
      resultPara.textContent = `that's a tie!`;
    } else {
      resultPara.textContent = `AI won and stole your job!`;
    }
    stopRound();
  }

  function playRound() {
    Gameboard.cells.forEach((cell) => {
      cell.addEventListener("click", makeTurn);
    });
  }
  function stopRound() {
    Gameboard.cells.forEach((cell) => {
      cell.removeEventListener("click", makeTurn);
    });
  }

  return { playRound, makeTurn, getTurnCounter, setTurnCounter };
})(playerHuman);

difficulty.addEventListener("click", changeDifficulty);
playerTypeElt.addEventListener("click", changeType);

start.addEventListener("click", GameController.startGame);
