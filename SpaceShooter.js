const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Konstanta untuk ukuran objek
        const PLAYER_WIDTH = 30;
        const PLAYER_HEIGHT = 30;
        const BULLET_RADIUS = 5;
        const ENEMY_SIZE = 50;
        const ENEMY_BULLET_RADIUS = 5;

        // Karakter utama
        const player = {
            x: 50,
            y: canvas.height / 2 - PLAYER_HEIGHT / 2,
            width: PLAYER_WIDTH,
            height: PLAYER_HEIGHT,
            color: 'blue',
            dx: 0,
            dy: 0,
            speed: 5,
            health: 3
        };

        // Musuh
        const enemies = [];
        const enemyBullets = [];

        // Peluru
        const bullets = [];
        let canShoot = true; // Pembatas tembakan

        // Skor dan kill target
        let score = 0;
        let kills = 0;

        // Fungsi menggambar objek
        function drawPlayer() {
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(player.x + player.width, player.y + player.height / 2);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.closePath();
            ctx.fill();
        }

        function drawEnemies() {
            enemies.forEach(enemy => {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + enemy.size, enemy.y + enemy.size / 2);
                ctx.lineTo(enemy.x, enemy.y + enemy.size);
                ctx.closePath();
                ctx.fill();
            });
        }

        function drawBullets() {
            bullets.forEach(bullet => {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, BULLET_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function drawEnemyBullets() {
            enemyBullets.forEach(bullet => {
                ctx.fillStyle = 'green';
                ctx.beginPath();
                ctx.arc(bullet.x, bullet.y, ENEMY_BULLET_RADIUS, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function drawHealth() {
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText('Health: ' + player.health, canvas.width - 150, 30);
        }

        function drawScore() {
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText('Score: ' + score, 10, 30);
        }

        function drawVictory() {
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.fillText('Victory!', canvas.width / 2 - 100, canvas.height / 2);
        }

        function drawGameOver() {
            ctx.fillStyle = 'white';
            ctx.font = '48px Arial';
            ctx.fillText('Game Over!', canvas.width / 2 - 150, canvas.height / 2);
        }

        // Update game state
        function update() {
            // Check game over condition
            if (player.health <= 0) {
                drawGameOver();
                return;
            }

            // Victory condition
            if (kills >= 100) {
                drawVictory();
                return;
            }

            // Update player position
            player.x += player.dx;
            player.y += player.dy;

            // Check boundaries for player movement
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
            if (player.y < 0) player.y = 0;
            if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;

            // Update bullet position
            bullets.forEach(bullet => {
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;
            });

            // Remove bullets off-screen
            for (let i = bullets.length - 1; i >= 0; i--) {
                if (bullets[i].x > canvas.width) {
                    bullets.splice(i, 1);
                }
            }

            // Update enemy bullet position
            enemyBullets.forEach(bullet => {
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;
            });

            // Remove enemy bullets off-screen
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                if (enemyBullets[i].x < 0 || enemyBullets[i].x > canvas.width || enemyBullets[i].y < 0 || enemyBullets[i].y > canvas.height) {
                    enemyBullets.splice(i, 1);
                }
            }

            // Check for bullet collision with enemies
            for (let i = 0; i < bullets.length; i++) {
                for (let j = 0; j < enemies.length; j++) {
                    let bullet = bullets[i];
                    let enemy = enemies[j];
                    let distX = bullet.x - (enemy.x + enemy.size / 2);
                    let distY = bullet.y - (enemy.y + enemy.size / 2);
                    let distance = Math.sqrt(distX * distX + distY * distY);

                    if (distance < BULLET_RADIUS + enemy.size / 2) {
                        score++; // Increase score
                        kills++; // Increase kill count
                        bullets.splice(i, 1); // Remove bullet
                        enemies.splice(j, 1); // Remove enemy
                        break;
                    }
                }
            }

            // Check for collision with enemy bullets
            for (let i = 0; i < enemyBullets.length; i++) {
                let bullet = enemyBullets[i];
                let distX = bullet.x - (player.x + player.width / 2);
                let distY = bullet.y - (player.y + player.height / 2);
                let distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < ENEMY_BULLET_RADIUS + player.width / 2) {
                    player.health--; // Decrease health
                    enemyBullets.splice(i, 1); // Remove enemy bullet
                    break;
                }
            }

            // Move enemies randomly
            enemies.forEach(enemy => {
                enemy.x += enemy.dx;
                enemy.y += enemy.dy;

                // Bounce the enemy when it hits the canvas edges
                if (enemy.x < 0 || enemy.x + enemy.size > canvas.width) {
                    enemy.dx = -enemy.dx;
                }
                if (enemy.y < 0 || enemy.y + enemy.size > canvas.height) {
                    enemy.dy = -enemy.dy;
                }
            });

            // Randomly shoot enemy bullets
            enemies.forEach(enemy => {
                if (Math.random() < 0.01) { // 1% chance to shoot
                    enemyBullets.push({
                        x: enemy.x + enemy.size / 2,
                        y: enemy.y + enemy.size / 2,
                        dx: -5, // Move bullet left
                        dy: 0
                    });
                }
            });

            // Drawing everything
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPlayer();
            drawEnemies();
            drawBullets();
            drawEnemyBullets();
            drawHealth();
            drawScore();
        }

        // Handle player movement
        function movePlayer(e) {
            if (e.key === 'ArrowRight' || e.key === 'd') {
                player.dx = player.speed;
            }
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                player.dx = -player.speed;
            }
            if (e.key === 'ArrowUp' || e.key === 'w') {
                player.dy = -player.speed;
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                player.dy = player.speed;
            }
            if (e.key === ' ' && canShoot) { // Space to shoot
                bullets.push({
                    x: player.x + player.width,
                    y: player.y + player.height / 2,
                    dx: 7,
                    dy: 0
                });
                canShoot = false; // Disable shooting until bullet leaves the screen
                setTimeout(() => {
                    canShoot = true; // Re-enable shooting after a delay
                }, 200); // Delay before next shot
            }
        }

        // Stop player movement when key is released
        function stopPlayerMovement(e) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                player.dx = 0;
                player.dy = 0;
            }
        }

        // Add enemies to the game
        function addEnemies() {
            const enemyCount = 10; // Start with 10 enemies
            for (let i = 0; i < enemyCount; i++) {
                const enemy = {
                    x: Math.random() * (canvas.width - ENEMY_SIZE),
                    y: Math.random() * (canvas.height - ENEMY_SIZE),
                    size: ENEMY_SIZE,
                    color: 'purple',
                    dx: (Math.random() - 0.5) * 4,
                    dy: (Math.random() - 0.5) * 4
                };
                enemies.push(enemy);
            }
        }

        // Main game loop
        function gameLoop() {
            update();
            requestAnimationFrame(gameLoop);
        }

        // Initialize game
        addEnemies();
        gameLoop();

        // Event listeners for player movement
        document.addEventListener('keydown', movePlayer);
        document.addEventListener('keyup', stopPlayerMovement);