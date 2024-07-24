(function () {
  let FPS = 10;
  const SIZE = 40;
  let paused = false;
  let gameStarted = false;

  let board;
  let snake;
  let food;
  let foodType;
  let score = 0;
  let frameCounter = 0;
  let runInterval;

  function init() {
    // Cria o tabuleiro se ainda não existir ou o reinicializa
    if (!board) {
      board = new Board(SIZE);
    } else {
      board.reset();
    }

    // Cria ou reinicializa a cobra
    snake = new Snake([[4, 4], [4, 5], [4, 6]]);

    // Gera o alimento e atualiza o placar
    generateFood();
    updateScore();

    // Reinicia o intervalo de execução
    clearInterval(runInterval);
    runInterval = setInterval(run, 1000 / FPS);
  }

  function gameOver() {
    clearInterval(runInterval);
    // Verifica se a mensagem de game over já existe
    if (!document.getElementById("gameOverMsg")) {
      const gameOverMsg = document.createElement("div");
      gameOverMsg.setAttribute("id", "gameOverMsg");
      gameOverMsg.textContent = "Game Over! Press 'S' to Restart";
      document.body.appendChild(gameOverMsg);
    }
    gameStarted = false; // Resetar o estado de início do jogo
  }

  window.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowUp":
        if (gameStarted) snake.changeDirection(0);
        break;
      case "ArrowRight":
        if (gameStarted) snake.changeDirection(1);
        break;
      case "ArrowDown":
        if (gameStarted) snake.changeDirection(2);
        break;
      case "ArrowLeft":
        if (gameStarted) snake.changeDirection(3);
        break;
      case "p":
        if (gameStarted) {
          if (paused) {
            runInterval = setInterval(run, 1000 / FPS);
          } else {
            clearInterval(runInterval);
          }
          paused = !paused;
        }
        break;
      case "s":
        if (!gameStarted) {
          if (document.getElementById("gameOverMsg")) {
            document.body.removeChild(document.getElementById("gameOverMsg"));
          }
          document.getElementById("scoreboard").textContent = "00000";
          score = 0;
          FPS = 10; // Resetando a velocidade
          init(); // Inicia o jogo
          gameStarted = true; // Seta o estado de início do jogo
        } else if (document.getElementById("gameOverMsg")) {
          document.body.removeChild(document.getElementById("gameOverMsg"));
          score = 0;
          FPS = 10; // Resetando a velocidade
          init(); // Reinicia o jogo
        }
        break;
      default:
        break;
    }
  });

  class Board {
    constructor(size) {
      this.size = size;
      this.element = document.createElement("table");
      this.element.setAttribute("id", "board");
      this.color = "#ccc";
      document.body.appendChild(this.element);
      this.create();
    }

    create() {
      for (let i = 0; i < this.size; i++) {
        const row = document.createElement("tr");
        this.element.appendChild(row);
        for (let j = 0; j < this.size; j++) {
          const field = document.createElement("td");
          row.appendChild(field);
        }
      }
    }

    reset() {
      // Limpa o tabuleiro existente
      this.element.innerHTML = '';
      // Recria o tabuleiro
      this.create();
    }
  }

  class Snake {
    constructor(body) {
      this.body = body;
      this.color = "#222";
      this.direction = 1; // 0: up, 1: right, 2: down, 3: left
      this.updateBoard();
    }

    updateBoard() {
      this.body.forEach(field => 
        document.querySelector(`#board tr:nth-child(${field[0] + 1}) td:nth-child(${field[1] + 1})`).style.backgroundColor = this.color
      );
    }

    walk() {
      const head = this.body[this.body.length - 1];
      let newHead;
      switch (this.direction) {
        case 0:
          newHead = [head[0] - 1, head[1]];
          break;
        case 1:
          newHead = [head[0], head[1] + 1];
          break;
        case 2:
          newHead = [head[0] + 1, head[1]];
          break;
        case 3:
          newHead = [head[0], head[1] - 1];
          break;
        default:
          break;
      }

      // Verifica se a nova cabeça bateu em uma parede ou no próprio corpo
      if (
        newHead[0] < 0 || newHead[0] >= SIZE ||
        newHead[1] < 0 || newHead[1] >= SIZE ||
        this.body.some(segment => segment[0] === newHead[0] && segment[1] === newHead[1])
      ) {
        gameOver();
        return; // Não executa o restante do código
      }

      // Verifica se a nova cabeça comeu o alimento
      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        this.body.push(newHead);
        this.updateBoard();
        updateScore(foodType); // Atualiza o placar quando o alimento é comido
        generateFood();
      } else {
        this.body.push(newHead);
        const oldTail = this.body.shift();
        document.querySelector(`#board tr:nth-child(${newHead[0] + 1}) td:nth-child(${newHead[1] + 1})`).style.backgroundColor = this.color;
        document.querySelector(`#board tr:nth-child(${oldTail[0] + 1}) td:nth-child(${oldTail[1] + 1})`).style.backgroundColor = board.color;
      }
    }

    changeDirection(newDirection) {
      // Verifica se a nova direção é oposta à direção atual
      if ((this.direction === 0 && newDirection === 2) ||
          (this.direction === 2 && newDirection === 0) ||
          (this.direction === 1 && newDirection === 3) ||
          (this.direction === 3 && newDirection === 1)) {
        return; // Não permite a mudança para a direção oposta
      }
      this.direction = newDirection;
    }
  }

  function generateFood() {
    let x, y;
    do {
      x = Math.floor(Math.random() * SIZE);
      y = Math.floor(Math.random() * SIZE);
    } while (snake.body.some(segment => segment[0] === x && segment[1] === y));

    foodType = Math.random() < 2 / 3 ? 0 : 1;
    food = [x, y];
    document.querySelector(`#board tr:nth-child(${food[0] + 1}) td:nth-child(${food[1] + 1})`).style.backgroundColor = foodType === 0 ? "black" : "red";
  }

  function updateScore(type) {
    if (type === 0) {
      score += 1;
    } else if (type === 1) {
      score += 2;
    }
    document.getElementById("scoreboard").textContent = score.toString().padStart(5, '0');
  }

  function run() {
    if (paused || !gameStarted) return;
    frameCounter++;
    snake.walk();
    if (frameCounter % 60 === 0) {
      FPS += 1;
      clearInterval(runInterval);
      runInterval = setInterval(run, 1000 / FPS);
    }
  }

  window.onload = function () {
    const scoreBoard = document.createElement("div");
    scoreBoard.setAttribute("id", "scoreboard");
    scoreBoard.textContent = "Press 'S' to Start";
    document.body.insertBefore(scoreBoard, document.body.firstChild);
  }
})();