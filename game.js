const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    speed: 3,
    direction: null,
    drawing: false,
    path: []
};

const directions = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
};

const gridWidth = 64;
const gridHeight = 48;
const cellSize = 10;
const grid = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(0));

document.addEventListener("keydown", (event) => {
    if (directions[event.key]) {
        player.direction = directions[event.key];
        player.drawing = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (directions[event.key]) {
        player.direction = null;
        player.drawing = false;
    }
});

function floodFill(grid, startX, startY, targetValue, replacementValue) {
    if (grid[startY][startX] !== targetValue) return;

    grid[startY][startX] = replacementValue;

    if (startX > 0) floodFill(grid, startX - 1, startY, targetValue, replacementValue);
    if (startY > 0) floodFill(grid, startX, startY - 1, targetValue, replacementValue);
    if (startX < gridWidth - 1) floodFill(grid, startX + 1, startY, targetValue, replacementValue);
    if (startY < gridHeight - 1) floodFill(grid, startX, startY + 1, targetValue, replacementValue);
}

function update() {
    if (player.direction) {
        const newX = player.x + player.direction.x * player.speed;
        const newY = player.y + player.direction.y * player.speed;

        if (
            player.drawing &&
            (newX < 0 || newY < 0 || newX >= canvas.width || newY >= canvas.height)
        ) {
            player.direction = null;
            player.drawing = false;

            const startX = Math.floor(player.x / cellSize);
            const startY = Math.floor(player.y / cellSize);
            floodFill(grid, startX, startY, 0, 2);
        } else {
            player.x = newX;
            player.y = newY;

            if (player.drawing) {
                player.path.push({ x: player.x, y: player.y });
            }
        }
    }

    if (!player.drawing && player.path.length > 0) {
        for (const point of player.path) {
            const gridX = Math.floor(point.x / cellSize);
            const gridY = Math.floor(point.y / cellSize);
            grid[gridY][gridY][gridX] = 2;
            }
            player.path = [];
    }
}
    
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw playfield and calculate claimed area percentage
    let claimedCells = 0;
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (grid[y][x] === 2) {
                claimedCells++;
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    const claimedPercentage = (claimedCells / (gridWidth * gridHeight)) * 100;

    // Display the claimed area percentage
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(`Claimed: ${claimedPercentage.toFixed(2)}%`, 10, 20);

    // Draw player's path
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.moveTo(player.path[0]?.x || player.x, player.path[0]?.y || player.y);
    for (const point of player.path) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();

    // Draw player
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 4, 0, Math.PI * 2);
    ctx.fill();
}
    
function gameLoop() {
    update();
    draw();

    requestAnimationFrame(gameLoop);
}

gameLoop();
