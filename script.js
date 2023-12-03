// https://tetris.fandom.com/wiki/Tetris_Guideline

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate a new tetromino sequence
// @see https://tetris.fandom.com/wiki/Random_Generator
function generateSequence() {
  const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

// get the next tetromino in the sequence
function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  // I and O start centered, all others start in left-middle
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

  // I starts on row 21 (-1), all others start on row 22 (-2)
  const row = name === 'I' ? -1 : -2;

  return {
    name: name,      // name of the piece (L, O, etc.)
    matrix: matrix,  // the current rotation matrix
    row: row,        // current row (starts offscreen)
    col: col         // current col
  };
}

// rotate an NxN matrix 90deg
// @see https://codereview.stackexchange.com/a/186834
function rotate(matrix) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - j][i])
  );

  return result;
}

// check to see if the new matrix/row/col is valid
function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          // outside the game bounds
          cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          // collides with another piece
          playfield[cellRow + row][cellCol + col])
        ) {
        return false;
      }
    }
  }

  return true;
}

let score = 0;
let linesCleared = 0;
let level = 1;
let scoreToNextLevel = 1000;
let fallingSpeed = 35; // Initial falling speed
let gameState = 'playing'; // Initial game state

// place the tetromino on the playfield
function placeTetromino() {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {

        // game over if piece has any part offscreen
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every(cell => !!cell)) {

      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r-1][c];
        }
      }
       // Increment the lines cleared and update the score
       linesCleared++;
       score += 100; // You can adjust the scoring as needed
    } else {
      row--;
    }
  }

  // Update the score display
  score += 10;
  updateScoreDisplay();

  if (score >= scoreToNextLevel && wantToContinue === false) {
    levelUp();
  }

  tetromino = nextTetromino;
  nextTetromino = getNextTetromino();
}

// Function to update the display of the score
function updateScoreDisplay() {
    // Update the HTML element displaying the score
    document.getElementById('score').innerHTML = `Score: ${score}`;
}

// Add this function
function updateLevelDisplay() {
    document.getElementById('level').innerHTML = `Level: ${level}`;
}


// Define an array of background music for each level
const levelSongs = [
    document.getElementById('level-1-song'),
    document.getElementById('level-2-song'),
    document.getElementById('level-3-song'),
];
  


function levelUp() {
    if (gameState !== 'leveling-up'){
        gameState = 'leveling-up'

        pauseBackgroundMusic();
        cancelAnimationFrame(rAF);
        level++;
        scoreToNextLevel = scoreToNextLevel + 1000 + (level * 500);
        
        const levelUpSound = document.getElementById('level-up-sound');
        levelUpSound.play();
    
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        if ( level <= 3) {
            backgroundMusic = levelSongs[level - 1];
        }
    
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '25px Press2P';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`New Level: ${level}`, canvas.width / 2, canvas.height / 2 - 30);
    
        // Display a continue button
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 10, 160, 40);
        context.font = '20px Press2P';
        context.fillStyle = 'white';
        context.fillText('Continue', canvas.width / 2, canvas.height / 2 + 30);
    
        // Listen for click events on the continue button
        canvas.addEventListener('click', continueGame);
    
        // Update the level display
        updateLevelDisplay();
    }
    
}





  let backgroundMusic = document.getElementById('level-1-song');

  function playBackgroundMusic() {
    backgroundMusic.play();
  }
  
  function pauseBackgroundMusic() {
    backgroundMusic.pause();
  }
  
// Function to restart the game
function restartGame() {
    gameState = 'playing';

    const youWonSound = document.getElementById('you-won-sound');
    youWonSound.pause();
    youWonSound.currentTime = 0;
    pauseBackgroundMusic();
    backgroundMusic.currentTime = 0;
    backgroundMusic = levelSongs[0]

    // Remove the event listener to avoid multiple restarts
    canvas.removeEventListener('click', restartGame);

     // Reset game variables
     gameOver = false;
     score = 0;
     linesCleared = 0;
     scoreToNextLevel = 1000;
     level = 1;
     updateLevelDisplay();
     updateScoreDisplay();

    // Clear the playfield
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
      }
    }
  
    // Start the game loop again
    rAF = requestAnimationFrame(loop);
}

function continueGame() {
    gameState = 'playing';
    console.log('Running continue Game function')

    if(wantToContinue === true ){
      const youWonSound = document.getElementById('you-won-sound');
      youWonSound.pause();
      youWonSound.currentTime = 0;
    }
    

    canvas.removeEventListener('click', continueGame);
    context.clearRect(0, 0, canvas.width, canvas.height);
    playBackgroundMusic();

    // Reset game variables
    gameOver = false;
    linesCleared = 0;

    // Clear the playfield
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }

    // Start the game loop again
    rAF = requestAnimationFrame(loop);
}


const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];

// keep track of what is in every cell of the game using a 2d array
// tetris playfield is 10x20, with a few rows offscreen
const playfield = [];

// populate the empty state
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

// how to draw each tetromino
// @see https://tetris.fandom.com/wiki/SRS
const tetrominos = {
  'I': [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  'J': [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  'L': [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  'O': [
    [1,1],
    [1,1],
  ],
  'S': [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  'Z': [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  'T': [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

// color of each tetromino
const colors = {
  'I': 'cyan',
  'O': 'yellow',
  'T': 'purple',
  'S': 'green',
  'Z': 'red',
  'J': 'blue',
  'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;  // keep track of the animation frame so we can cancel it
let gameOver = false;

const nextTetrominoCanvas = document.getElementById('next-tetromino-canvas');
const nextTetrominoContext = nextTetrominoCanvas.getContext('2d');
let nextTetromino = getNextTetromino();

function drawNextTetromino() {
    // Clear the next tetromino canvas
    nextTetrominoContext.clearRect(0, 0, nextTetrominoCanvas.width, nextTetrominoCanvas.height);
  
    // Set the size of each grid cell for the next tetromino
    const nextGrid = nextTetrominoCanvas.width / 4;
  
    // Draw the "Next:" text
    nextTetrominoContext.fillStyle = 'white';
    nextTetrominoContext.font = '15px Press2P';
    nextTetrominoContext.fillText('Next:', 10, 25);
  
    // Draw the next tetromino on the next tetromino canvas
    for (let row = 0; row < nextTetromino.matrix.length; row++) {
      for (let col = 0; col < nextTetromino.matrix[row].length; col++) {
        if (nextTetromino.matrix[row][col]) {
          const name = nextTetromino.name;
          nextTetrominoContext.fillStyle = colors[name];
  
          // Adjust the position based on the grid size
          nextTetrominoContext.fillRect(20 + col * nextGrid, 50 + row * nextGrid, nextGrid - 1, nextGrid - 1);
        }
      }
    }
  }


let wantToContinue = false 
// game loop
function loop() {
    playBackgroundMusic()
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);

    drawNextTetromino();

    if (level > 3 && wantToContinue === false ) {
        showYouWonScreen();
        return;
    }

    // draw the playfield
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
            const name = playfield[row][col];
            context.fillStyle = colors[name];

            // drawing 1 px smaller than the grid creates a grid effect
            context.fillRect(col * grid, row * grid, grid-1, grid-1);
        }
        }
    }

    // draw the active tetromino
    if (tetromino) {

        // tetromino falls every fallingSpeed frames
        if (++count > fallingSpeed) {
        tetromino.row++;
        count = 0;
        
        // Changing falling speed based on level
        fallingSpeed = Math.max(5,35 - level * 4);

        // place piece if it runs into anything
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
            tetromino.row--;
            placeTetromino();
        }
        }

        context.fillStyle = colors[tetromino.name];

        for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {

            // drawing 1 px smaller than the grid creates a grid effect
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
            }
        }
        }
    }
}

// show the game over screen
function showGameOver() {
    if (gameState !== 'game over') {
        gameState = 'game over';

        pauseBackgroundMusic();
        cancelAnimationFrame(rAF);

        const gameOverSound = document.getElementById('game-over-sound');
        gameOverSound.play();

        gameOver = true;
    
        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '30px Press2P';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
    
        // Display a restart button
        context.fillStyle = 'rgba(0, 0, 0, 0)';
        context.fillRect(canvas.width / 2 - 80, canvas.height / 2 + 40, 160, 40);
        context.font = '20px Press2P';
        context.fillStyle = 'white';
        context.fillText('Restart', canvas.width / 2, canvas.height / 2 + 60);
    
        // Listen for click events on the restart button
        canvas.addEventListener('click', restartGame);
    }
  }
  

function showYouWonScreen() {
    if (gameState !== 'game over'){
        gameState = 'game over';
        pauseBackgroundMusic();
        cancelAnimationFrame(rAF);
    
    
        const youWonSound = document.getElementById('you-won-sound')
        youWonSound.play();
    
        context.fillStyle = 'black';
        context.globalAlpha = 0.75;
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        
      
        context.globalAlpha = 1;
        context.fillStyle = 'white';
        context.font = '30px Press2P';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('YOU WON!', canvas.width / 2, canvas.height / 2);
    
        // Create container div for buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.transform = 'translate(-60%, 80%)';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.flexDirection = 'column';
        document.body.appendChild(buttonContainer);

        // Display a Restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Restart';
        restartButton.style.marginBottom = '15px'; // Adjust spacing between buttons
        restartButton.style.marginTop = '20px'; // Adjust spacing between buttons
        restartButton.style.font = '20px Press2P';
        restartButton.style.background = 'rgba(255, 255, 255, 0)';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.addEventListener('click', function () {
            buttonContainer.remove(); 
            restartGame();
        });
        buttonContainer.appendChild(restartButton);

        // Display a Continue button
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Continue';
        continueButton.style.color = 'white';
        continueButton.style.font = '20px Press2P';
        continueButton.style.background = 'rgba(255, 255, 255, 0)';
        continueButton.style.border = 'none';
        continueButton.addEventListener('click', function () {
            console.log('Continue pressed')
            buttonContainer.remove(); 
            wantToContinue = true;
            continueGame();
        });
        buttonContainer.appendChild(continueButton);
    }
}

let isPaused = false;


// listen to keyboard events to move the active tetromino
document.addEventListener('keydown', function(e) {
  if (gameOver) return;


  if (e.which === 27) {
    if(gameState === 'playing'){
        isPaused = !isPaused;
        if (isPaused) {
        // Perform actions when the game is paused (e.g., display a pause screen)
            cancelAnimationFrame(rAF);
            displayPauseScreen();
            console.log('Game paused');
        } else {
            // Resume the game loop when the game is unpaused
            hidePauseScreen();
            rAF = requestAnimationFrame(loop);
            console.log('Game resumed');
        }
    }
  }

  // left and right arrow keys (move)
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37
      ? tetromino.col - 1
      : tetromino.col + 1;

    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }

  // up arrow key (rotate)
  if (e.which === 38) {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }

  // down arrow key (drop)
  if(e.which === 40) {
    const row = tetromino.row + 1;

    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;

      placeTetromino();
      return;
    }

    tetromino.row = row;
  }
});


function displayPauseScreen() {
    context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Transparent black background
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '25px Press2P'
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Game Paused', canvas.width / 2, canvas.height / 2);
    pauseBackgroundMusic();
}

function hidePauseScreen() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    playBackgroundMusic();
}
  

// start the game
rAF = requestAnimationFrame(loop);