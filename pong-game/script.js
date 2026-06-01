// Get canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED = 5;

let gameRunning = false;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Computer paddle (right)
const computerPaddle = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: BALL_SPEED,
    dy: BALL_SPEED
};

// Score
let playerScore = 0;
let computerScore = 0;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        if (gameRunning) {
            resetBall();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * BALL_SPEED * 2;
}

// Update player paddle position
function updatePlayerPaddle() {
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += PADDLE_SPEED;
    }

    // Mouse control
    if (mouseY > playerPaddle.y && mouseY < playerPaddle.y + playerPaddle.height) {
        // Already in range, no movement needed
    } else if (mouseY < playerPaddle.y) {
        playerPaddle.y = Math.max(0, playerPaddle.y - PADDLE_SPEED);
    } else {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + PADDLE_SPEED);
    }

    // Constrain paddle to canvas
    playerPaddle.y = Math.max(0, Math.min(playerPaddle.y, canvas.height - playerPaddle.height));
}

// Update computer paddle position (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const difficulty = 4; // AI difficulty (higher = smarter)

    if (computerCenter < ballCenter - 35) {
        computerPaddle.y += difficulty;
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y -= difficulty;
    }

    // Constrain paddle to canvas
    computerPaddle.y = Math.max(0, Math.min(computerPaddle.y, canvas.height - computerPaddle.height));
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height - 0.5;
        ball.dy += hitPos * 4;
    }

    if (
        ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.size;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height - 0.5;
        ball.dy += hitPos * 4;
    }

    // Scoring
    if (ball.x - ball.size < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    if (ball.x + ball.size > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

function drawDottedLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawStatusText() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, 30);
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw elements
    drawDottedLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
    drawStatusText();

    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
