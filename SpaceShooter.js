const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let playerHP = 3;
let gameOver = false;
let canShoot = true;
let wave = 1;
let powerUpActive = null;
let powerUpDuration = 0;
const keys = {};
const powerUps = [];

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    lasers: []
};

// Alien array
let aliens = [];
const alienLasers = [];

// Create aliens
function createAliens() {
    aliens = [];
    const rows = 3 + wave;
    const cols = 6 + Math.min(wave, 4);
    const speed = 1 + wave * 0.2;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            aliens.push({
                x: 100 + col * 80,
                y: 50 + row * 60,
                width: 40,
                height: 40,
                speed: speed,
                direction: 1
            });
        }
    }
}

// Move and draw aliens
function moveAliens() {
    aliens.forEach(alien => {
        alien.x += alien.speed * alien.direction;
        if (alien.x < 0 || alien.x + alien.width > canvas.width) {
            alien.direction *= -1;
            alien.y += 20;
        }
    });
}

function drawAliens() {
    aliens.forEach(alien => {
        ctx.fillStyle = 'green';
        ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
    });
}

// Gambar Player
function drawPlayer() {
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Handle power-ups
function spawnPowerUp() {
    if (Math.random() < 0.01) {
        const types = ['double', 'spread', 'rapid'];
        powerUps.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            type: types[Math.floor(Math.random() * types.length)]
        });
    }
}

function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(powerUp.x, powerUp.y, 30, 30);
        powerUp.y += 2; 
        if (powerUp.y > canvas.height) powerUps.splice(index, 1);
    });
}

// Handle power-up collision
function handlePowerUpCollision() {
    powerUps.forEach((powerUp, index) => {
        if (
            powerUp.x < player.x + player.width &&
            powerUp.x + 30 > player.x &&
            powerUp.y < player.y + player.height &&
            powerUp.y + 30 > player.y
        ) {
            powerUpActive = powerUp.type;
            powerUpDuration = 600;
            powerUps.splice(index, 1);
        }
    });
}

// Fire lasers based on power-up
function fireLaser() {
    if (powerUpActive === 'double') {
        player.lasers.push({ x: player.x + 5, y: player.y, speed: 6 });
        player.lasers.push({ x: player.x + player.width - 10, y: player.y, speed: 6 });
    } else if (powerUpActive === 'spread') {
        player.lasers.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 6 });
        player.lasers.push({ x: player.x, y: player.y, speed: 6, angle: -0.1 });
        player.lasers.push({ x: player.x + player.width, y: player.y, speed: 6, angle: 0.1 });
    } else {
        player.lasers.push({ x: player.x + player.width / 2 - 2.5, y: player.y, speed: 6 });
    }
}

// Move and draw lasers
function drawLasers() {
    player.lasers.forEach((laser, index) => {
        ctx.fillStyle = 'red';
        ctx.fillRect(laser.x, laser.y, 5, 10);
        laser.y -= laser.speed;
        if (laser.angle) laser.x += Math.sin(laser.angle) * 2;

        // Check collision with aliens
        aliens.forEach((alien, alienIndex) => {
            if (
                laser.x < alien.x + alien.width &&
                laser.x + 5 > alien.x &&
                laser.y < alien.y + alien.height &&
                laser.y + 10 > alien.y
            ) {
                player.lasers.splice(index, 1);
                aliens.splice(alienIndex, 1);
                score += 100;
            }
        });

        if (laser.y < 0) player.lasers.splice(index, 1);
    });
}

// Draw UI
function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`HP: ${playerHP}`, 10, 60);
    ctx.fillText(`Wave: ${wave}`, 10, 90);
    if (powerUpActive) {
        ctx.fillText(`Power-Up: ${powerUpActive.toUpperCase()} (${Math.ceil(powerUpDuration / 60)}s)`, 10, 120);
    }
}

// Handle key events
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if ((e.key === ' ' || e.key === 'w') && canShoot) {
        fireLaser();
        canShoot = false;
        setTimeout(() => canShoot = true, powerUpActive === 'rapid' ? 100 : 300);
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Check wave
function checkWave() {
    if (aliens.length === 0) {
        wave++;
        createAliens();
    }
}

// Move player
function movePlayer() {
    if (keys['a'] && player.x > 0) player.x -= player.speed;
    if (keys['d'] && player.x + player.width < canvas.width) player.x += player.speed;
    if (keys['w'] && player.y > 0) player.y -= player.speed;
    if (keys['s'] && player.y + player.height < canvas.height) player.y += player.speed;
}

// Game loop
function gameLoop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveAliens();
    drawPlayer();
    drawAliens();
    drawLasers();
    drawPowerUps();
    handlePowerUpCollision();
    spawnPowerUp();
    drawUI();
    checkWave();

    if (powerUpActive) {
        powerUpDuration--;
        if (powerUpDuration <= 0) {
            powerUpActive = null;
        }
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game
createAliens();
gameLoop();
