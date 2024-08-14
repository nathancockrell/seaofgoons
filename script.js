import dparse from "./dparse.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 41;
const cellSize = canvas.width / gridSize; // Adjust to new canvas size

const messagesElement = document.getElementById('messages');
const goldElement = document.getElementById('gold');
const inventoryElement = document.getElementById('inventory');
const islandNameElement = document.getElementById('islandName');
const shopElement = document.getElementById('shop');

let boat = {
    x: 20,
    y: 20
};
let gold = 50;
let wood = 0;
let paper = 0;
let cannonballs = 0;
let goldRate = .15;

const maxWood = 15;
const maxPaper = 20;
const maxCannonballs = 10;

const pirateMessages = [
    "Arrr! You've moved the ship!",
    "Aye! The sea is vast and mysterious!",
    "Shiver me timbers! Keep sailing!",
    "Yo ho ho! Adventure awaits!",
    "Avast! What treasure will you find?",
    "Ahoy! The crew is ready!",
    "Sail on, ye brave sailor!",
    "Blimey! Watch out for sea monsters!",
    "Land ho! But not just yet!",
    "Ahoy matey! More gold for the chest!",
    "There be squalls ahead."
];

const islands = [
    {
        name: "Treasure Island", 
        topLeft: { x: 30, y: 18 },
        shop: {
            wood: { buy: 1500, sell: 900, stock: 0 },
            paper: { buy: 175, sell: 65, stock: 0 },
            cannonball: { buy: 40000, sell: 15000, stock: 0 }
        }
    },
    {
        name: "Convoy Isle", 
        topLeft: { x: 22, y: 8 },
        shop: {
            wood: { buy: 3000, sell: 1780, stock: 0 },
            paper: { buy: 50, sell: 40, stock: 0 },
            cannonball: { buy: 50000, sell: 20000, stock: 0 }
        }
    },
    {
        name: "Reaper Hideout", 
        topLeft: { x: 5, y: 38 },
        shop: {
            wood: { buy: 7000, sell: 1615, stock: 0 },
            paper: { buy: 200, sell: 60, stock: 0 },
            cannonball: { buy: 11000, sell: 3000, stock: 0 }
        }
    }
];

const islandCells = [];
let currentIsland = null;
let stockUpdateInterval = 5000; // 5 seconds

// Create a map of island cells
function generateIslandCells() {
    islands.forEach(island => {
        const { topLeft } = island;
        for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
                islandCells.push({
                    x: topLeft.x + dx,
                    y: topLeft.y + dy,
                    islandName: island.name,
                    isDock: dx === 1 && dy === 1,
                    shop: island.shop
                });
            }
        }
    });
}

// Draw the grid
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }

    drawIslands();
}

// Draw the islands
function drawIslands() {
    islandCells.forEach(cell => {
        ctx.fillStyle = cell.isDock ? 'gold' : 'green';
        ctx.fillRect(cell.x * cellSize, cell.y * cellSize, cellSize, cellSize);
    });
}

// Draw the boat
function drawBoat() {
    ctx.fillStyle = 'brown'; // Boat color
    ctx.fillRect(boat.x * cellSize, boat.y * cellSize, cellSize, cellSize);
}

// Display a random pirate message
function displayRandomMessage() {
    const message = pirateMessages[Math.floor(Math.random() * pirateMessages.length)];
    messagesElement.textContent = message;
}

// Update the gold display
function updateGold() {
    goldElement.textContent = `Gold: ${dparse(gold)}`;
}

// Update the inventory display
function updateInventory() {
    document.getElementById('woodCount').textContent = wood;
    document.getElementById('paperCount').textContent = paper;
    document.getElementById('cannonballCount').textContent = cannonballs;
    checkCapacity();
}

// Update the island name display
function updateIslandName(name) {
    islandNameElement.textContent = name ? `Island: ${name}` : '';
}

// Show the shop with prices and stock
function showShop(shop) {
    shopElement.style.display = 'block';
    document.getElementById('woodPrice').textContent = `${shop.wood.buy} (Stock: ${shop.wood.stock})`;
    document.getElementById('woodSellPrice').textContent = shop.wood.sell;
    document.getElementById('paperPrice').textContent = `${shop.paper.buy} (Stock: ${shop.paper.stock})`;
    document.getElementById('paperSellPrice').textContent = shop.paper.sell;
    document.getElementById('cannonballPrice').textContent = `${shop.cannonball.buy} (Stock: ${shop.cannonball.stock})`;
    document.getElementById('cannonballSellPrice').textContent = shop.cannonball.sell;
}

// Hide the shop
function hideShop() {
    shopElement.style.display = 'none';
}

// Check if item is at maximum capacity and show a message
function checkCapacity() {
    if (wood >= maxWood) {
        messagesElement.textContent = "You can't carry any more wood!";
    }
    if (paper >= maxPaper) {
        messagesElement.textContent = "You can't carry any more paper!";
    }
    if (cannonballs >= maxCannonballs) {
        messagesElement.textContent = "You can't carry any more cannonballs!";
    }
}

// Handle buying and selling items
function handleBuy(item) {
    if (!currentIsland) return;

    const prices = currentIsland.shop[item];
    if (gold >= prices.buy && getItemCount(item) < getMaxItem(item) && prices.stock > 0) {
        gold -= prices.buy;
        incrementItem(item);
        prices.stock--;
        updateGold();
        updateInventory();
        showShop(currentIsland.shop); // Update stock display
    }
}

function handleSell(item) {
    if (!currentIsland) return;

    const prices = currentIsland.shop[item];
    if (item === 'wood' && wood > 0) {
        gold += prices.sell;
        wood--;
        updateGold();
        updateInventory();
        showShop(currentIsland.shop); // Update stock display
    }
    if (item === 'paper' && paper > 0) {
        gold += prices.sell;
        paper--;
        updateGold();
        updateInventory();
        showShop(currentIsland.shop); // Update stock display
    }
    if (item === 'cannonball' && cannonballs > 0) {
        gold += prices.sell;
        cannonballs--;
        updateGold();
        updateInventory();
        showShop(currentIsland.shop); // Update stock display
    }
}

// Increment item count based on type
function incrementItem(item) {
    if (item === 'wood') wood++;
    if (item === 'paper') paper++;
    if (item === 'cannonball') cannonballs++;
}

// Get current item count
function getItemCount(item) {
    if (item === 'wood') return wood;
    if (item === 'paper') return paper;
    if (item === 'cannonball') return cannonballs;
    return 0;
}

// Get max item count
function getMaxItem(item) {
    if (item === 'wood') return maxWood;
    if (item === 'paper') return maxPaper;
    if (item === 'cannonball') return maxCannonballs;
    return 0;
}

// Check if the boat is at a dock
function checkDock() {
    const dock = islandCells.find(cell => cell.x === boat.x && cell.y === boat.y && cell.isDock);
    if (dock) {
        currentIsland = islands.find(island => island.name === dock.islandName);
        updateIslandName(currentIsland.name);
        showShop(currentIsland.shop);
    } else {
        currentIsland = null;
        updateIslandName('');
        hideShop();
    }
}

// Refills stock of each island
function refillStocks() {
    islands.forEach(island => {
        Object.keys(island.shop).forEach(item => {
            if (island.shop[item].stock < 8) {
                island.shop[item].stock++;
            }
        });
    });
    // If currently at an island, update the shop display
    if (currentIsland) {
        showShop(currentIsland.shop);
    }
}

function startStockRefill() {
    setInterval(refillStocks, stockUpdateInterval);
}

// Handle keyboard input
function handleKeyDown(event) {
    let newX = boat.x;
    let newY = boat.y;

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            newY--;
            break;
        case 'ArrowDown':
        case 's':
            newY++;
            break;
        case 'ArrowLeft':
        case 'a':
            newX--;
            break;
        case 'ArrowRight':
        case 'd':
            newX++;
            break;

    }

    const canMove = !islandCells.some(cell => cell.x === newX && cell.y === newY && !cell.isDock);

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && canMove) {
        
        if(newX != boat.x || newY != boat.y) {gold += goldRate;}
        
        boat.x = newX;
        boat.y = newY;
        
        
        drawGrid();
        drawBoat();
        displayRandomMessage();
        updateGold();
        updateInventory();
        checkDock();
    }
}

// Handle shop button clicks
function handleShopButtonClick(event) {
    if (!currentIsland) return;

    const [action, item] = event.target.id.split(/(?=[A-Z])/);
    if (action === 'buy') {
        handleBuy(item.toLowerCase());
    } else if (action === 'sell') {
        handleSell(item.toLowerCase());
    }
}

document.addEventListener('click', handleShopButtonClick);

// Initialize the game
function init() {
    generateIslandCells();
    drawGrid();
    drawBoat();
    displayRandomMessage();
    updateGold();
    updateInventory();
    checkDock();
    startStockRefill();
    document.addEventListener('keydown', handleKeyDown);
}

init();
