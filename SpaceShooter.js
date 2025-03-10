const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerImage = new Image();
playerImage.src = 'images/player.png';

const laserImage = new Image();
laserImage.src = 'path/to/laser.png';

const alienImage = new Image();
alienImage.src = 'path/to/alien.png';

const backgroundImage = new Image();
backgroundImage.src = 'images/space.png';

const enemyImages = {
    1: new Image(),
    2: new Image(),
    3: new Image()
};

enemyImages[1].src = 'images/enemy1.png';
enemyImages[2].src = 'images/enemy2.png';
enemyImages[3].src = 'images/enemy3.png';

const enemyMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
    [2, 2, 2, 3, 3, 3, 3, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
];

let imagesLoaded = 0;
const totalImages = 5; // Player, 3 musuh, background

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        createAliens();
        gameLoop();
    }
}

playerImage.onload = imageLoaded;
enemyImages[1].onload = imageLoaded;
enemyImages[2].onload = imageLoaded;
enemyImages[3].onload = imageLoaded;
backgroundImage.onload = imageLoaded;

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
    speed: 3, // Kecepatan player dikurangi
    lasers: []
};

// Alien array
let aliens = [];
const alienLasers = [];

// Create aliens
function createAliens() {
    aliens = [];
    const alienWidth = 40;
    const alienHeight = 40;
    const startX = 100;
    const startY = 50;
    const spacingX = 80;
    const spacingY = 60;

    for (let row = 0; row < enemyMap.length; row++) {
        for (let col = 0; col < enemyMap[row].length; col++) {
            const type = enemyMap[row][col];
            if (type !== 0) { // 0 berarti tidak ada musuh
                aliens.push({
                    type: type,
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    width: alienWidth,
                    height: alienHeight,
                    speed: 1 + wave * 0.2,
                    direction: 1,
                    canShoot: Math.random() < 0.02, // Kemungkinan musuh menembak ditingkatkan
                    shootCooldown: 60, // Cooldown tembakan dikurangi
                });
            }
        }
    }
}

// Move and draw aliens
function moveAliens() {
    aliens.forEach(alien => {
        alien.x += alien.speed * alien.direction;
        if (alien.x < 0 || alien.x + alien.width > canvas.width) {
            alien.direction *= -1;
            alien.y += 10; // Jarak turun saat alien mencapai tepi layar dikurangi
        }
    });
}

function drawAliens() {
    aliens.forEach(alien => {
        ctx.drawImage(enemyImages[alien.type], alien.x, alien.y, alien.width, alien.height);
    });
}

function updateAliens() {
    aliens.forEach((alien, index) => {
        // Gerakkan musuh
        alien.x += alien.speed * alien.direction;
        if (alien.x < 0 || alien.x + alien.width > canvas.width) {
            alien.direction *= -1;
            alien.y += 20;
        }

        // Musuh menembak
        if (alien.canShoot && alien.shootCooldown <= 0) {
            alienLasers.push({
                x: alien.x + alien.width / 2 - 2.5,
                y: alien.y + alien.height,
                speed: 4,
            });
            alien.shootCooldown = 120; // Cooldown tembakan
        }
        if (alien.shootCooldown > 0) alien.shootCooldown--;
    });
}

function drawAlienLasers() {
    alienLasers.forEach((laser, index) => {
        ctx.fillStyle = 'orange';
        ctx.fillRect(laser.x, laser.y, 5, 10);
        laser.y += laser.speed;

        // Cek tabrakan dengan player
        if (
            laser.x < player.x + player.width &&
            laser.x + 5 > player.x &&
            laser.y < player.y + player.height &&
            laser.y + 10 > player.y
        ) {
            playerHP--;
            alienLasers.splice(index, 1);
            if (playerHP <= 0) {
                gameOver = true;
            }
        }

        // Hapus laser jika keluar layar
        if (laser.y > canvas.height) alienLasers.splice(index, 1);
    });
}

// Gambar Player
function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

// Handle power-ups
function spawnPowerUp() {
    if (Math.random() < 0.0013) {
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
    if (keys['a'] && player.x > 0) player.x -= player.speed; // Bergerak ke kiri
    if (keys['d'] && player.x + player.width < canvas.width) player.x += player.speed; // Bergerak ke kanan
}

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

// Game loop
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    movePlayer();
    updateAliens();
    drawPlayer();
    drawAliens();
    drawLasers();
    drawAlienLasers();
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
