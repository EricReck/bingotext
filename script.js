let words = [];
let markedWords = [];
let players = [];
let currentPlayer = 0;

function setPlayerName() {
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        localStorage.setItem('playerName', playerName);
        showNotification(`¡Bienvenido, ${playerName}!`);
        const namePopup = document.getElementById('name-popup');
        if (namePopup) {
            namePopup.style.display = 'none';
        }
        updatePlayerNameDisplay();
    } else {
        showNotification('Por favor, ingresa un nombre válido.');
    }
}

function updatePlayerNameDisplay() {
    const playerName = localStorage.getItem('playerName');
    const playerNameDisplays = document.querySelectorAll('.player-name-display');
    playerNameDisplays.forEach(display => {
        display.textContent = playerName ? `Jugador: ${playerName}` : 'Jugador anónimo';
    });
}

function addWord() {
    const wordInput = document.getElementById('new-word');
    addWordToList(wordInput, words);
    updateBoard();
}

function addWordToList(inputElement, wordList) {
    const word = inputElement.value.trim();
    if (word && !wordList.includes(word)) {
        wordList.push(word);
        inputElement.value = '';
        return true;
    } else {
        showNotification('La palabra ya existe o está vacía');
        return false;
    }
}

function updateBoard() {
    const board = document.getElementById('bingo-board');
    if (!board) return;
    
    board.innerHTML = '';
    words.forEach((word, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.textContent = word;
        cell.onclick = () => toggleMark(index);
        if (markedWords.includes(index)) {
            cell.classList.add('marked');
        }
        board.appendChild(cell);
    });
    checkWin();
}

function toggleMark(index) {
    const markedIndex = markedWords.indexOf(index);
    if (markedIndex === -1) {
        markedWords.push(index);
    } else {
        markedWords.splice(markedIndex, 1);
    }
    updateBoard();
}

function checkWin() {
    if (markedWords.length === words.length && words.length > 0) {
        showConfetti();
        const playerName = localStorage.getItem('playerName') || 'Jugador anónimo';
        showNotification(`¡${playerName} ha ganado!`);
    }
}

function showConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function setupMultiplayerGame() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    players = [];
    
    for (let i = 0; i < playerCount; i++) {
        let playerName = prompt(`Nombre del jugador ${i + 1}:`);
        players.push({ name: playerName, words: [], markedWords: [] });
    }
    
    currentPlayer = 0;
    updatePlayerTurn();
    
    document.getElementById('setup-game').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');
    createMultiplayerBoards();
}

function createMultiplayerBoards() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = '';
    
    const boardsContainer = document.createElement('div');
    boardsContainer.className = 'boards-container';
    
    players.forEach((player, index) => {
        const boardContainer = document.createElement('div');
        boardContainer.className = 'player-board';
        boardContainer.innerHTML = `
            <h3>${player.name}</h3>
            <div id="bingo-board-${index}" class="bingo-board"></div>
            <div class="word-input">
                <input type="text" id="new-word-${index}" placeholder="Ingresa una palabra">
                <button onclick="addWordMultiplayer(${index})" class="btn">Agregar palabra</button>
            </div>
        `;
        boardsContainer.appendChild(boardContainer);
    });
    
    gameArea.appendChild(boardsContainer);
    
    const nextTurnButton = document.createElement('button');
    nextTurnButton.textContent = 'Siguiente turno';
    nextTurnButton.className = 'btn next-turn-btn';
    nextTurnButton.onclick = nextTurn;
    gameArea.appendChild(nextTurnButton);
    
    updatePlayerTurn();
    
    players.forEach((player, index) => {
        const input = document.getElementById(`new-word-${index}`);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addWordMultiplayer(index);
            }
        });
    });
}

function addWordMultiplayer(playerIndex) {
    if (playerIndex !== currentPlayer) {
        showNotification('No es tu turno');
        return;
    }
    
    const wordInput = document.getElementById(`new-word-${playerIndex}`);
    if (addWordToList(wordInput, players[playerIndex].words)) {
        updateMultiplayerBoard(playerIndex);
        nextTurn();
    }
}

function updateMultiplayerBoard(playerIndex) {
    const board = document.getElementById(`bingo-board-${playerIndex}`);
    board.innerHTML = '';
    players[playerIndex].words.forEach((word, index) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell';
        cell.textContent = word;
        cell.onclick = () => toggleMarkMultiplayer(playerIndex, index);
        if (players[playerIndex].markedWords.includes(index)) {
            cell.classList.add('marked');
        }
        board.appendChild(cell);
    });
    checkWinMultiplayer(playerIndex);
}

function toggleMarkMultiplayer(playerIndex, wordIndex) {
    const markedIndex = players[playerIndex].markedWords.indexOf(wordIndex);
    if (markedIndex === -1) {
        players[playerIndex].markedWords.push(wordIndex);
    } else {
        players[playerIndex].markedWords.splice(markedIndex, 1);
    }
    updateMultiplayerBoard(playerIndex);
}

function checkWinMultiplayer(playerIndex) {
    if (players[playerIndex].markedWords.length === players[playerIndex].words.length && players[playerIndex].words.length > 0) {
        showConfetti();
        showNotification(`¡${players[playerIndex].name} ha ganado!`);
        endGame(playerIndex);
    }
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    updatePlayerTurn();
}

function updatePlayerTurn() {
    const playerTurnElement = document.getElementById('player-turn');
    if (playerTurnElement) {
        playerTurnElement.textContent = `Turno de: ${players[currentPlayer].name}`;
    }
    
    players.forEach((player, index) => {
        const boardElement = document.getElementById(`bingo-board-${index}`);
        if (boardElement) {
            boardElement.classList.toggle('active-player', index === currentPlayer);
        }
    });
}

function endGame(winnerIndex) {
    const gameArea = document.getElementById('game-area');
    const endGameMessage = document.createElement('div');
    endGameMessage.className = 'end-game-message';
    endGameMessage.innerHTML = `
        <h2>¡Fin del juego!</h2>
        <p>${players[winnerIndex].name} ha ganado.</p>
        <button onclick="location.reload()" class="btn">Jugar de nuevo</button>
    `;
    gameArea.appendChild(endGameMessage);
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

function toggleSettings() {
    // Esta función ya no es necesaria, pero la mantenemos vacía por si acaso
}

document.addEventListener('DOMContentLoaded', () => {
    const playerName = localStorage.getItem('playerName');
    const namePopup = document.getElementById('name-popup');
    
    if (!playerName && namePopup) {
        namePopup.style.display = 'flex';
    } else if (playerName) {
        showNotification(`¡Bienvenido de nuevo, ${playerName}!`);
    }
    
    updatePlayerNameDisplay();
    
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        gameArea.classList.add('hidden');
    }
    
    const setupGame = document.getElementById('setup-game');
    if (setupGame) {
        setupGame.classList.remove('hidden');
    }
    
    const singlePlayerInput = document.getElementById('new-word');
    if (singlePlayerInput) {
        singlePlayerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addWord();
            }
        });
    }
});
