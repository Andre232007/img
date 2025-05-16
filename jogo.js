const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener('resize', resizeCanvas);

// Carregamento de imagens
const runningLeftImg = new Image();
runningLeftImg.src = 'character_running4.gif';
const backgroundImg = new Image();
backgroundImg.src = 'ChatGPT Image 12 de abr. de 2025, 18_07_42.png';
const idleImg = new Image();
idleImg.src = 'idle.png';
const runningImg = new Image();
runningImg.src = 'character_running3.gif';
const jumpingImg = new Image();
jumpingImg.src = 'character_jumping.gif';
const cloudsImg = new Image();
cloudsImg.src = 'clouds.png';
const obstacleImg = new Image();
obstacleImg.src = 'Browser Games - Maxident - Platform.png';
const jumpSound = new Audio('new-notification-3-323602.mp3');
const doorImg = new Image();
doorImg.src = 'Nintendo Switch - Animal Crossing New Horizons - Doors.png';
const collectibleImg = new Image();
collectibleImg.src = 'frame_6.png';

// Definição do personagem
const square = {
    x: 50,
    y: 100,
    width: 150,
    height: 150,
    gravity: 0.8,
    lift: -20,
    velocity: 20,
    jumping: false,
    doubleJumping: false
};
let itemsCollected = 0;

function drawItemCounter() {
    const x = 30;
    const y = 120; // Ajustei a posição Y para ficar abaixo da barra de energia
    const width = 150;
    const height = 25;
    const radius = 10;

    // Fundo da barra
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, x, y, width, height, radius);
    ctx.stroke();
    const backgroundGradient = ctx.createLinearGradient(x, y, x + width, y);
    backgroundGradient.addColorStop(0, '#444');
    backgroundGradient.addColorStop(1, '#666');
    ctx.fillStyle = backgroundGradient;
    ctx.fill();

    // Texto da contagem
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Itens: ${itemsCollected}/${Object.keys(collectiblePositions).length}`, x + width / 2, y + height / 2 + 5);
}
let moveSpeed = 8; // Aumentei a velocidade de movimento
let currentObstacleInitial = null;
let currentObstacle = null;
let currentObstacle2 = null;
let currentObstacle3 = null;
const obstacle3Width = 60;
const obstacle3Height = 50;
const obstacleWidth = 100;
const obstacleHeight = 50;
let energyBarWidth = 0;
const energyMaxWidth = 200;
const energyRechargeRate = 0.5; // Ajustei a taxa de recarga
let currentCollectible = null;
let doubleJumpAvailable = false;
const clouds = [
    { x: 0, y: 50, speed: 0.5 }, // Aumentei a velocidade das nuvens
    { x: canvas.width / 2, y: 100, speed: 0.6 }, // Aumentei a velocidade das nuvens
];

let level = 1;
const phase2Door = { x: canvas.width - 100, y: canvas.height - 110, width: 80, height: 100 };
const phase3Door = { x: canvas.width - 100, y: canvas.height - 110, width: 80, height: 100 };
const phase4Door = { x: canvas.width - 100, y: canvas.height - 110, width: 80, height: 100 };
const phase5Door = { x: canvas.width - 100, y: canvas.height - 110, width: 80, height: 100 };
const phase6Door = { x: canvas.width - 100, y: canvas.height - 110, width: 80, height: 100 };

// Posições fixas dos colecionáveis por fase
const collectiblePositions = {
    1: { x: 600, y: canvas.height - 600, imageSrc: '2020499-Photoroom.png' },
    2: { x: 900, y: canvas.height - 650, imageSrc: '6bbf5dbb-7245-41f0-af81-eb7527b4ec80-Photoroom.png' },
    3: { x: 700, y: canvas.height - 450, imageSrc: 'f34d276f-2837-4b90-9573-474ad42234f6-Photoroom.png' },
    4: { x: 850, y: canvas.height - 500, imageSrc: '9f28c530-3888-41a5-aa0e-1c92cbcf60a4-Photoroom.png' },
    5: { x: 500, y: canvas.height - 500, imageSrc: '864e7c8f-2feb-46ad-849d-8406c0519b1c-Photoroom.png' },
    6: { x: 1000, y: canvas.height - 350, imageSrc: 'OB7XQH0-Photoroom.png' },
};



let keys = { left: false, right: false }; // Mova a definição para o escopo global
let gameStarted = false;
let gameOverMessage = null;
let doorCollisionMessage = null;
let doorCollisionMessageTimer = 0;
const doorCollisionMessageDuration = 120;

// Event listeners para teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
        console.log('keydown right', keys);
    }
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
        console.log('keydown left', keys);
    }
     if (e.key === ' ' || e.key === 'ArrowUp') { // Combinando as condições de pulo
        e.preventDefault(); // Evita o scroll da página
        jump();
    }
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false;
        console.log('keyup right', keys);
    }
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false;
        console.log('keyup left', keys);
    }
});


// Funções de desenho
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function drawObstacle() {
    if (currentObstacleInitial) {
        ctx.drawImage(obstacleImg, currentObstacleInitial.x, currentObstacleInitial.y, currentObstacleInitial.width, currentObstacleInitial.height);
    }
    if (currentObstacle) {
        ctx.drawImage(obstacleImg, currentObstacle.x, currentObstacle.y, currentObstacle.width, currentObstacle.height);
    }
    if (currentObstacle2) {
        ctx.drawImage(obstacleImg, currentObstacle2.x, currentObstacle2.y, currentObstacle2.width, currentObstacle2.height);
    }
    if (currentObstacle3) {
        ctx.drawImage(obstacleImg, currentObstacle3.x, currentObstacle3.y, currentObstacle3.width, currentObstacle3.height);
    }
}

function checkPlatformCollision() {
    let platforms = [currentObstacle, currentObstacle2, currentObstacle3, currentObstacleInitial];

    platforms.forEach(platform => {
        if (platform &&
            square.y + square.height <= platform.y + square.velocity &&
            square.y + square.height + square.velocity >= platform.y &&
            square.x + square.width > platform.x &&
            square.x < platform.x + platform.width) {

            square.y = platform.y - square.height;
            square.velocity = 0;
            square.jumping = false;
            square.doubleJumping = false;
            doubleJumpAvailable = energyBarWidth === energyMaxWidth;
        }
    });
}

function drawSquare() {
    let imgToDraw = idleImg;
    let drawWidth = square.width;
    let drawHeight = square.height;
    if (square.jumping || square.doubleJumping) {
        imgToDraw = jumpingImg;
        drawWidth = 220;
        drawHeight = 200;
        if (keys.right) {
            imgToDraw = runningImg;
            drawWidth = square.width;
            drawHeight = square.height;
        } else if (keys.left) {
            imgToDraw = runningLeftImg;
            drawWidth = square.width;
            drawHeight = square.height;
        }
    } else if (keys.right) {
        imgToDraw = runningImg;
    } else if (keys.left) {
        imgToDraw = runningLeftImg;
    }
    if (imgToDraw === idleImg) {
        drawWidth = 110;
        drawHeight = 110;
    }
    const offsetY = square.height - drawHeight;
    ctx.drawImage(imgToDraw, square.x, square.y + offsetY, drawWidth, drawHeight);
}

function drawEnergyBar() {
    const x = 30;
    const y = 80;
    const height = 25;
    ctx.fillStyle = '#333';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, x, y, energyMaxWidth, height, 10);
    ctx.stroke();
    const backgroundGradient = ctx.createLinearGradient(x, y, x + energyMaxWidth, y);
    backgroundGradient.addColorStop(0, '#444');
    backgroundGradient.addColorStop(1, '#666');
    ctx.fillStyle = backgroundGradient;
    ctx.fill();

    let fillWidth = energyBarWidth;
    let fillGradient;
    if (fillWidth >= energyMaxWidth) {
        fillGradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
        fillGradient.addColorStop(0, '#ff5fd2');
        fillGradient.addColorStop(1, '#9b5fff');
    } else {
        fillGradient = ctx.createLinearGradient(x, y, x + fillWidth, y);
        fillGradient.addColorStop(0, '#aaffaa');
        fillGradient.addColorStop(1, '#55ff55');
    }
    ctx.fillStyle = fillGradient;
    ctx.beginPath();
    ctx.roundRect(x, y, fillWidth, height, 10);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PULODUPLO', x + energyMaxWidth / 2, y - 10);
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudsImg, cloud.x, cloud.y, 300, 150);
        cloud.x -= cloud.speed;
        if (cloud.x + 300 < 0) {
            cloud.x = canvas.width;
        }
    });
}

function drawDoor() {
    if (level === 1 && doorImg.complete) {
        ctx.drawImage(doorImg, phase2Door.x, phase2Door.y, phase2Door.width, phase2Door.height);
    } else if (level === 2 && doorImg.complete) {
        ctx.drawImage(doorImg, phase3Door.x, phase3Door.y, phase3Door.width, phase3Door.height);
    } else if (level === 3 && doorImg.complete) {
        ctx.drawImage(doorImg, phase4Door.x, phase4Door.y, phase4Door.width, phase4Door.height);
    } else if (level === 4 && doorImg.complete) {
        ctx.drawImage(doorImg, phase5Door.x, phase5Door.y, phase5Door.width, phase5Door.height);
    } else if (level === 5 && doorImg.complete) {
        ctx.drawImage(doorImg, phase6Door.x, phase6Door.y, phase6Door.width, phase6Door.height);
    } else if (level === 6 && doorImg.complete) {
        ctx.drawImage(doorImg, phase6Door.x, phase6Door.y, phase6Door.width, phase6Door.height);
    }
}
function createObstacle() {
    const initialPlatformHeight = 50;
    const initialPlatformWidth = 140;
    const initialPlatformY = canvas.height - 70 - initialPlatformHeight;

    let obstaclesCurrentLevel = [];

    if (level === 1) {
        currentObstacle = { x: canvas.width / 5, y: canvas.height - obstacleHeight - 160, width: obstacleWidth, height: obstacleHeight };
        currentObstacle2 = { x: currentObstacle.x + 300, y: canvas.height - obstacleHeight - 240, width: obstacleWidth, height: obstacleHeight };
        currentObstacle3 = { x: currentObstacle2.x + 400, y: canvas.height - obstacleHeight - 200, width: obstacleWidth, height: obstacleHeight };
        square.y = initialPlatformY - square.height;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        phase2Door.y = canvas.height - 110;
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else if (level === 2) {
        currentObstacle = { x: 340, y: canvas.height - 100 - 60, width: 80, height: 40 };
        currentObstacle2 = { x: currentObstacle.x + 350, y: canvas.height - 280 - 50, width: 130, height: 60 };
        currentObstacle3 = { x: currentObstacle2.x + 320, y: canvas.height - 140 - 30, width: 100, height: 50 };
        square.y = initialPlatformY - square.height;
        phase2Door.y = canvas.height - 110;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        phase3Door.y = canvas.height - 110;
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else if (level === 3) {
        currentObstacle = { x: 250, y: canvas.height - 150 - 70, width: 110, height: 55 };
        currentObstacle2 = { x: currentObstacle.x + 400, y: canvas.height - 280 - 60, width: 90, height: 45 };
        currentObstacle3 = { x: currentObstacle2.x + 350, y: canvas.height - 180 - 80, width: 120, height: 65 };
        square.y = initialPlatformY - square.height;
        phase3Door.y = canvas.height - 150;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        phase4Door.y = canvas.height - 110;
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else if (level === 4) {
        currentObstacle = { x: canvas.width / 3, y: canvas.height - obstacleHeight - 180, width: obstacleWidth, height: obstacleHeight };
        currentObstacle2 = { x: currentObstacle.x + 250, y: canvas.height - obstacleHeight - 260, width: obstacleWidth, height: obstacleHeight };
        currentObstacle3 = { x: currentObstacle2.x + 300, y: canvas.height - obstacleHeight - 220, width: obstacleWidth, height: obstacleHeight };
        square.y = initialPlatformY - square.height;
        phase4Door.y = canvas.height - 110;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        phase5Door.y = canvas.height - 110;
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else if (level === 5) {
        currentObstacle = { x: 250, y: canvas.height - 200 - 40, width: 70, height: 30 };
        currentObstacle2 = { x: currentObstacle.x + 300, y: canvas.height - 200 - 50, width: 120, height: 50 };
        currentObstacle3 = { x: currentObstacle2.x + 280, y: canvas.height - 400 - 20, width: 90, height: 40 };
        square.y = initialPlatformY - square.height;
        phase5Door.y = canvas.height - 110;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        phase6Door.y = canvas.height - 110;
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else if (level === 6) {
        currentObstacle = { x: 250, y: canvas.height - 170 - 60, width: 100, height: 50 };
        currentObstacle2 = { x: currentObstacle.x + 320, y: canvas.height - 240 - 70, width: 80, height: 40 };
        currentObstacle3 = { x: currentObstacle2.x + 400, y: canvas.height - 200 - 90, width: 110, height: 60 };
        square.y = initialPlatformY - square.height;
        phase6Door.y = canvas.height - 110;
        currentObstacleInitial = { x: 50, y: initialPlatformY, width: initialPlatformWidth, height: initialPlatformHeight };
        obstaclesCurrentLevel = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
        if (collectiblePositions[level]) {
            currentCollectible = {
                ...collectiblePositions[level],
                width: 55,
                height: 55,
                image: new Image()
            };
            currentCollectible.image.src = collectiblePositions[level].imageSrc;
        } else {
            currentCollectible = null;
        }
    } else {
        currentCollectible = null; // Sem colecionável em fases desconhecidas
    }
}
function drawCollectible() {
    if (currentCollectible && currentCollectible.image && currentCollectible.image.complete) {
        ctx.drawImage(currentCollectible.image, currentCollectible.x, currentCollectible.y, currentCollectible.width, currentCollectible.height);
    }
}
function checkCollectibleCollision() {
    if (!currentCollectible) return;

    const squareBottom = square.y + square.height;
    const squareTop = square.y;
    const squareLeft = square.x;
    const squareRight = square.x + square.width;

    const collectibleTop = currentCollectible.y;
    const collectibleBottom = currentCollectible.y + currentCollectible.height;
    const collectibleLeft = currentCollectible.x;
    const collectibleRight = currentCollectible.x + currentCollectible.width;

    const isColliding =
        squareRight > collectibleLeft &&
        squareLeft < collectibleRight &&
        squareBottom > collectibleTop &&
        squareTop < collectibleBottom;

    if (isColliding) {
        currentCollectible = null;
        itemsCollected++; // Incrementa a contagem de itens

        // Calcula o incremento para a barra de energia
        const increment = energyMaxWidth / Object.keys(collectiblePositions).length;
        energyBarWidth += increment;

        // Garante que a barra não ultrapasse o máximo
        if (energyBarWidth > energyMaxWidth) {
            energyBarWidth = energyMaxWidth;
        }

        doubleJumpAvailable = energyBarWidth === energyMaxWidth;
    }
}
function drawRoundedRect(ctx, x, y, width, height, radius) {
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (let side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }

    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

function moveSquare() {
    square.velocity += square.gravity;
    square.y += square.velocity;
    if (square.y + square.height > canvas.height) {
        gameOver();
        return;
    }
    let platforms = [];
    if (level === 1 || level === 2 || level === 3 || level === 4 || level === 5 || level === 6) {
        platforms = [currentObstacleInitial, currentObstacle, currentObstacle2, currentObstacle3];
    }
    for (let platform of platforms) {
        if (!platform) continue;
        const squareBottom = square.y + square.height;
        const squareRight = square.x + square.width;
        const squareLeft = square.x;
        const obsTop = platform.y;
        const obsLeft = platform.x;
        const obsRight = obsLeft + platform.width;
        const isOverPlatform =
            squareBottom <= obsTop + 5 &&
            squareBottom >= obsTop - 10 &&
            squareRight > obsLeft &&
            squareLeft < obsRight &&
            square.velocity >= 0;
        if (isOverPlatform) {
            square.y = obsTop - square.height;
            square.velocity = 0;
            square.jumping = false;
            square.doubleJumping = false;
            doubleJumpAvailable = energyBarWidth === energyMaxWidth;
        }
    }
}

function checkCollision() {
    let obstacles = [];
    if (level === 1 || level === 2 || level === 3 || level === 4 || level === 5 || level === 6) {
        obstacles = [currentObstacle, currentObstacle2, currentObstacle3];
    }
    for (let obs of obstacles) {
        if (!obs) continue;
        const obsWidth = obs.width;
        const obsHeight = obs.height;
        const squareBottom = square.y + square.height;
        const squareTop = square.y;
        const squareRight = square.x + square.width;
        const squareLeft = square.x;
        const obsTop = obs.y;
        const obsBottom = obs.y + obsHeight;
        const obsLeft = obs.x;
        const obsRight = obs.x + obsWidth;
        const isHorizontallyAligned = squareRight > obsLeft && squareLeft < obsRight;
        const isVerticallyAligned = squareBottom > obsTop && squareTop < obsBottom;
        const isLandingOnTop =
            squareBottom >= obsTop &&
            squareBottom <= obsTop + 10 &&
            square.velocity >= 0 &&
            isHorizontallyAligned;
        const isHittingFromBelow =
            squareTop <= obsBottom &&
            squareTop >= obsBottom &&
            squareTop >= obsBottom - 10 &&
            square.velocity < 0 &&
            isHorizontallyAligned;
        if (isLandingOnTop) {
            square.y = obsTop - square.height;
            square.velocity = 0;
            square.jumping = false;
            square.doubleJumping = false;
            doubleJumpAvailable = energyBarWidth === energyMaxWidth;
        } else if (isHittingFromBelow) {
            gameOver();
        }
    }
}
function checkDoorCollision() {
    let door;
    if (level === 1) {
        door = phase2Door;
    } else if (level === 2) {
        door = phase3Door;
    } else if (level === 3) {
        door = phase4Door;
    } else if (level === 4) {
        door = phase5Door;
    } else if (level === 5) {
        door = phase6Door;
    } else if (level === 6) {
        door = phase6Door;
    }

    if (door) {
        const squareBottom = square.y + square.height;
        const squareTop = square.y;
        const squareLeft = square.x;
        const squareRight = square.x + square.width;

        const doorTop = door.y;
        const doorBottom = door.y + door.height;
        const doorLeft = door.x;
        const doorRight = door.x + door.width;

        const isColliding =
            squareRight > doorLeft &&
            squareLeft < doorRight &&
            squareBottom > doorTop &&
            squareTop < doorBottom;

        // Verifica se o item da fase atual foi coletado (itemsCollected > número de itens coletados nas fases anteriores)
        if (isColliding && itemsCollected >= level - (level > 0 ? 1 : 0)) {
            levelUp();
        } else if (isColliding) {
            doorCollisionMessage = 'Você precisa coletar o item desta fase para avançar!';
            doorCollisionMessageTimer = doorCollisionMessageDuration;
            square.x -= moveSpeed;
        }
    }
}
function levelUp() {
    level++;
    if (level > Object.keys(collectiblePositions).length && itemsCollected === Object.keys(collectiblePositions).length) {
        window.location.href = "resume.html";
    } else if (level <= Object.keys(collectiblePositions).length) {
        createObstacle();
        square.x = 50;
        square.velocity = 0;
        square.jumping = false;
        square.doubleJumping = false;
        doubleJumpAvailable = false;
       // energyBarWidth = 0;
    } else {
        level = Object.keys(collectiblePositions).length; // Mantém o nível no máximo
    }
}
function resetLevel() {
    createObstacle();
    square.x = 40;
    square.velocity = 0;
    square.jumping = false;
    square.doubleJumping = false;
    doubleJumpAvailable = false;
    energyBarWidth = 0;
    phase3Obstacles = [];
}

let phase3Obstacles = [];

function movePlayerHorizontally() {
    if (keys.left) {
        square.x -= moveSpeed;
    }
    if (keys.right) {
        square.x += moveSpeed;
    }

    // Limitar a personagem à esquerda do canvas
    if (square.x < 0) {
        square.x = 0;
    }

    // Limitar a personagem à direita do canvas
    if (square.x + square.width > canvas.width) {
        square.x = canvas.width - square.width;
    }
}
function drawDoorCollisionMessage() {
    if (doorCollisionMessage && doorCollisionMessageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 30, 300, 60);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(doorCollisionMessage, canvas.width / 2, canvas.height / 2 + 5);
        doorCollisionMessageTimer--;
        if (doorCollisionMessageTimer <= 0) {
            doorCollisionMessage = null;
        }
    }
}

function jump() {
    if (!square.jumping) {
        square.velocity = square.lift;
        square.jumping = true;
        square.doubleJumping = false;
        playJumpSound(1.4);
        if (!gameStarted) {
            gameStarted = true;
        }
    } else if (!square.doubleJumping && energyBarWidth === energyMaxWidth && doubleJumpAvailable) {
        square.velocity = square.lift;
        square.doubleJumping = true;
        energyBarWidth = 0;
        doubleJumpAvailable = false;
        playJumpSound(1.8);
    }
}

function playJumpSound(speed = 1.0) {
    jumpSound.pause();
    jumpSound.currentTime = 0;
    jumpSound.playbackRate = speed;
    jumpSound.play();
}

function gameOver() {
    gameOverMessage = 'Game Over! Você tocou no chão! Pressione R para reiniciar.';
    // Não chame resetGame() imediatamente aqui
}

function drawGameOver() {
    if (gameOverMessage) {
        const larguraAdicional = 100; // Ajuste este valor conforme desejar
        const novaLargura = 500 + larguraAdicional;
        const ajusteX = larguraAdicional / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width / 2 - 250 - ajusteX, canvas.height / 2 - 30, novaLargura, 60);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(gameOverMessage, canvas.width / 2, canvas.height / 2 + 5);
    }
}
function resetGame() {
    level = 1;
    createObstacle();
    square.x = 50;
    square.velocity = 0;
    square.jumping = false;
    square.doubleJumping = false;
    gameStarted = false;
    keys = { left: false, right: false };
    energyBarWidth = 0;
    doubleJumpAvailable = false;
    phase3Obstacles = [];
    gameOverMessage = null;
    itemsCollected = 0; 
}

function startGame() {
    resetGame();
    createObstacle();
    gameLoop();
}

function updateEnergyBar() {
    if (!doubleJumpAvailable && energyBarWidth < energyMaxWidth) {
        energyBarWidth += energyRechargeRate;
        if (energyBarWidth >= energyMaxWidth) {
            energyBarWidth = energyMaxWidth;
            doubleJumpAvailable = true;
        }
    }
}
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawClouds();
    drawObstacle();
    drawCollectible();
    drawSquare();
    drawEnergyBar();
    drawDoor();
    drawItemCounter(); // Já estava aqui, apenas para reforçar
    movePlayerHorizontally();
    moveSquare(); // Certifique-se de que esta linha está aqui
    checkPlatformCollision();
    checkCollectibleCollision();
    checkCollision();
    checkDoorCollision();
    updateEnergyBar();
    drawDoorCollisionMessage(); // Adicione esta linha
    drawGameOver(); // Adicione esta linha para desenhar a mensagem de Game Over
    requestAnimationFrame(gameLoop);
    // ... (o restante do seu código para gameLoop) ..
}
startGame();