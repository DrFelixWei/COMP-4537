import { gameSettings } from './consts.js';
import { messages } from '../lang/messages/en/user.js';

const renderMenu = () => {
    const container = document.getElementById('menu-container');
    container.innerHTML = `
        <p>${messages.buttonsPrompt}</p>
        <input 
            type="number" 
            id="btnCount" 
            value="${gameSettings.defaultBtnCount}"
        >
        <button id="goButton">Go</button>
        <div id="message-container" style="marginTop: 0.5em">
            <div id="button-count-validation" style="color: red;"></div>
            <div id="game-status"></div>
        </div>
    `;
    document.getElementById('btnCount').addEventListener('input', validateButtonCount);
    document.getElementById('goButton').addEventListener('click', startGame);
};
window.onload = function() {
    renderMenu();
};

const getButtonCount = () => {
    const buttonCount = parseInt(document.getElementById('btnCount').value, 10);
    return buttonCount;
};

const validateButtonCount = () => {
    const buttonCount = getButtonCount();
    const validationMessageContainer = document.getElementById('button-count-validation');
    const goButton = document.getElementById('goButton');

    if (isNaN(buttonCount) 
        || buttonCount < gameSettings.minButtons 
        || buttonCount > gameSettings.maxButtons
    ) {
        validationMessageContainer.textContent = messages.invalidButtonCount + ` (${gameSettings.minButtons} - ${gameSettings.maxButtons})`;
        goButton.disabled = true;
    } else {
        validationMessageContainer.textContent = '';
        goButton.disabled = false;
    }
};

const startGame = async () => {
    updateGameStatus(messages.getReady);

    const numberOfButtons = getButtonCount();
    const buttons = createButtons(numberOfButtons);

    // Wait for n seconds (based on the number of buttons)
    await new Promise((resolve) => setTimeout(resolve, numberOfButtons * 1000));

    // Display "Scrambling" message and scramble buttons
    updateGameStatus(messages.scrambling);
    await scrambleButtons(buttons, numberOfButtons, 2);

    // Clear game status and start the memory game
    updateGameStatus('');
    hideButtonNumbers(buttons);
    enableMemoryGame(buttons);
};
window.startGame = startGame; // Attach startGame to the window object for global access

const updateGameStatus = (message) => {
    const gameStatus = document.getElementById('game-status');
    gameStatus.textContent = message;
};

const displayGameMessage = (message) => {
    const container = document.getElementById('main-content-container');
    const modal = document.createElement('div');
    
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button onclick="closeModal()">Close</button>
        </div>
    `;
    
    modal.style = {
        display: 'block',
        position: 'fixed',
        zIndex: '1',
        left: '50',
        top: '50',
        padding: '1em',
    }
    container.appendChild(modal);
};





const assignRandomColour = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor}`;
};

const createButtons = (numberOfButtons) => {
    const container = document.getElementById('buttons-container');
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.gap = '1em';

    const buttonOrder = [];

    for (let i = 0; i < numberOfButtons; i++) {
        const button = document.createElement('button');
        button.textContent = `${i + 1}`;
        button.dataset.index = i; // Store the button's original index
        button.style.backgroundColor = assignRandomColour();
        button.style.height = gameSettings.buttonSize.height || '5em';
        button.style.width = gameSettings.buttonSize.width || '10em';
        button.style.position = 'relative'; // Initially relative for the row layout

        container.appendChild(button);
        buttonOrder.push(button);
    }

    return buttonOrder;
};

const scrambleButtons = (buttons, times, interval) => {
    updateGameStatus(messages.scrambling);

    return new Promise((resolve) => {
        let scrambleCount = 0;

        const scrambleInterval = setInterval(() => {
            if (scrambleCount >= times) {
                clearInterval(scrambleInterval);
                updateGameStatus(''); // Clear the game status after scrambling
                resolve();
                return;
            }


            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            buttons.forEach((button) => {
                const randomX = Math.random() * (windowWidth - 100);
                const randomY = Math.random() * (windowHeight - 50);
                button.style.position = 'absolute'; // Switch to absolute for scrambling
                button.style.left = `${randomX}px`;
                button.style.top = `${randomY}px`;
            });

            scrambleCount++;
        }, interval * 1000);
    });
};



const hideButtonNumbers = (buttons) => {
    buttons.forEach((button) => {
        button.textContent = '';
    });
};

const enableMemoryGame = (buttons) => {
    updateGameStatus(messages.startGuessing)
    const correctOrder = buttons.map((btn) => parseInt(btn.dataset.index, 10));
    let currentIndex = 0;

    buttons.forEach((button) => {
        button.onclick = () => {
            const clickedIndex = parseInt(button.dataset.index, 10);

            if (clickedIndex === correctOrder[currentIndex]) {
                button.textContent = clickedIndex + 1; // Reveal the number
                currentIndex++;

                if (currentIndex === correctOrder.length) {
                    displayGameMessage(messages.win);
                }
            } else {
                displayGameMessage(messages.lose);
                revealCorrectOrder(buttons, correctOrder);
            }
        };
    });
};

const revealCorrectOrder = (buttons, correctOrder) => {
    buttons.forEach((button, index) => {
        button.textContent = correctOrder[index] + 1;
    });
};

