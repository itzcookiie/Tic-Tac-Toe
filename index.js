import { init } from './ads.js'
const gameSpots = document.querySelector('.game-grid').children;
const gameBoard = document.querySelector('.game-board');
const adScreen = document.querySelector('.ad-screen');
const startMenu = document.querySelector('.start-menu');
const gameOverMenu = document.querySelector('.game-over-menu');
const gameOverMenuTitle = document.querySelector('.game-over-menu__title');
const uiMessage = document.getElementById('ui-message');
const canvasBoard = document.getElementById('gamecube');
const playButton = document.getElementById('playButton');

const context = canvasBoard.getContext('2d');
const { width, height } = canvasBoard;
context.lineWidth = 6;
context.strokeStyle = "white";

let waitTurn = false;
let stopGame = false;

const user = {
    player: 'user',
    symbol: '',
    colour: ''
}

const computer = {
    player: 'computer',
    symbol: '',
    colour: ''
}

function restartGame() {
    [...gameSpots].forEach(removeSymbol);
    stopGame = false;
    context.clearRect(0,0, width, height)
}

function removeSymbol(symbol) {
    symbol.classList.remove('cross', 'nought');
}

document.addEventListener('keydown', e => {
    const showingStartMenu = getComputedStyle(startMenu).display;

    if(showingStartMenu !== 'none') {
        if(e.key === 'Enter') {
            changeScreens(startMenu, adScreen);
            playButton.click();
        }
        if(e.key === 'Backspace') window.location = 'https://www.apple.com/uk/';
        return;
    }

    const showingAdScreen = getComputedStyle(adScreen).display;

    if(showingAdScreen !== 'none') return;

    const showingGameOverMenu = getComputedStyle(gameOverMenu).display;

    if(showingGameOverMenu !== 'none') {
        if(e.key === 'Enter') {
            restartGame();
            hideGameBoard();
            changeScreens(gameOverMenu, adScreen);
            init();
            const waitAd = setTimeout(() => {
                clearTimeout(waitAd);
                playButton.click();
            }, 1000);
        }
        if(e.key === 'Backspace') window.location = 'https://www.apple.com/uk/';
        
        return;
    }

    if(waitTurn || stopGame) return;
    const newPosition = handleArrowKeys(e.key);
    if(validPosition(newPosition) && e.key === 'Enter') {
        play(newPosition, user.symbol);
        const userResults = calculateResults(user)
        if(userResults) {
            return;
        }
        displayUI('COMPUTERS TURN');
        const waitBotTurn = setTimeout(() => {
            clearTimeout(waitBotTurn);
            handleComputer(computer.symbol)
            const computerResults = calculateResults(computer)
            if(computerResults) {
                return;
            }
            displayUI('USERS TURN', false)
        }, 1000)
    }
})

function changeScreens(initalScreen, screenToChange, displayOption='block') {
    initalScreen.style.display = 'none';
    screenToChange.style.display = displayOption;
}

function hideGameBoard() {
    gameBoard.style.display = 'none';
}

export function changeAdScreen() {
    changeScreens(adScreen, gameBoard, 'flex');
    decideStartingPlayer();
}

function handleArrowKeys(key) {
    let steps = 0;
    switch(key) {
        case 'ArrowUp':
            steps -= 3;
        break;
        case 'ArrowRight':
            steps += 1;
        break;
        case 'ArrowDown':
            steps += 3;
        break;
        case 'ArrowLeft':
            steps -= 1;
        break;
    }

    const currentSpot = document.querySelector('.active');
    const currentSpotPosition = currentSpot.id;
    const newPosition = document.getElementById(+currentSpotPosition + steps);
    if(newPosition) {
        currentSpot.classList.remove('active');
        newPosition.classList.add('active');
        return newPosition;
    }
}

function play(spot, symbol) {
    spot.classList.add(symbol);
}

function displayUI(message, wait=true) {
    waitTurn = wait;
    uiMessage.innerText = message;
}

function handleComputer(symbol) {
    const freeSpots = allFreeSpots();
    const randomNumber = Math.floor(Math.random() * freeSpots.length);
    return play(freeSpots[randomNumber], symbol);
}

function validPosition(spot) {
    return !(spot.classList.contains('cross') || spot.classList.contains('nought'))
}

function calculateResults({ player, symbol, colour }) {
    const combinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ]

    const gameSpots = document.querySelector('.game-grid').children;
    const playerSpots = [...gameSpots].filter(spot => spot.classList.contains(symbol));
    const matchingCombination = findMatchingCombinations(playerSpots, combinations);

    if(matchingCombination.length) {
        createCanvas(matchingCombination);
        stopGame = true;
        gameOverMenu.style.display = 'flex';
        gameOverMenuTitle.innerText = `${player} wins`;
        gameOverMenuTitle.style.color = colour;
        return true;
    }
    if(isADraw()) {
        gameOverMenu.style.display = 'flex';
        gameOverMenuTitle.innerText = `DRAW`;
        return true;
    }
}

function findMatchingCombinations(spots, combinations) {
    return combinations.filter(combination => spots.filter(spot => combination.includes(+spot.id)).length === 3).flat();

}

function isADraw() {
    if(allFreeSpots().length === 0) {
        return true;
    }
}

function allFreeSpots() {
    const gameSpots = document.querySelector('.game-grid').children;
    return [...gameSpots].filter(spot => !(spot.classList.contains('cross') || spot.classList.contains('nought')));
}

function decideStartingPlayer() {
    const userStarts = Math.random() > 0.5 ? true : false;
    const symbolObj = Math.random() > 0.5 ? {symbol: 'cross', colour: 'black'} : {symbol: 'nought', colour: 'white'};
    user.symbol = symbolObj.symbol
    user.colour = symbolObj.colour;
    computer.symbol = symbolObj.symbol === 'cross' ? 'nought' : 'cross'
    computer.colour = symbolObj.colour === 'black' ? 'white' : 'black'
    if(!userStarts) {
        waitTurn = true;
        uiMessage.innerText = 'COMPUTERS TURN';
        const waitBotTurn = setTimeout(() => {
            clearTimeout(waitBotTurn);
            handleComputer(computer.symbol);
            uiMessage.innerText = 'USERS TURN';
            waitTurn = false;
            return;
        }, 1000)
    }
}

function createCanvas(combination) {
    context.beginPath();
    switch(combination.join('')) {
        case '012': {
            drawHorizontalLine(50, width);
            break;
        }
        case '345': {
            drawHorizontalLine(150, width);
            break;
        }
        case '678': {
            drawHorizontalLine(250, width);
            break;
        }
        case '036': {
            drawVerticalLine(50, height);
            break;
        }
        case '147': {
            drawVerticalLine(150, height);
            break;
        }
        case '258': {
            drawVerticalLine(250, height);
            break;
        }
        case '048': {
            drawDiagonalLine(0, width, height);
            break;
        }
        case '246': {
            drawDiagonalLine(width, 0, height);
            break;
        }
    }

    context.stroke();
    return;
}

function drawHorizontalLine(offset, width) {
    const canvasStartingPosition = 25 + offset;
    context.moveTo(0, canvasStartingPosition);
    context.lineTo(width, canvasStartingPosition);
}

function drawVerticalLine(offset, height) {
    const canvasStartingPosition = 25 + offset;
    context.moveTo(canvasStartingPosition, 0);
    context.lineTo(canvasStartingPosition, height);
}

function drawDiagonalLine(startingWidth, width, height) {
    context.moveTo(startingWidth, 0);
    context.lineTo(width, height);
}