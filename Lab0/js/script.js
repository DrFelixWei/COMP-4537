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
        <button id="goButton">Go!</button>
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

const updateGameStatus = (statusText) => {
    const gameStatus = document.getElementById('game-status');
    gameStatus.textContent = statusText;
};

const displayGameMessage = (messageText) => {
    const container = document.getElementById('main-content-container');
    const messageWrapper = document.createElement('div'); // using a wrapper for easier removal
    messageWrapper.id = 'game-message-wrapper'; 
    messageWrapper.innerHTML = `
        <div id="game-message">
            <p>${messageText}</p>
            <button id="close-game-message">Close</button>
        </div>
    `;
    container.appendChild(messageWrapper);
    document.getElementById('close-game-message').addEventListener('click', closeGameMessage);
};

const closeGameMessage = () => {
    const messageWrapper = document.getElementById('game-message-wrapper');
    if (messageWrapper) {
        messageWrapper.remove(); 
    }
};


// "THE MAIN FUNCTION" -> runs the game loop
const startGame = async () => {
    updateGameStatus(messages.getReady);

    const numberOfButtons = getButtonCount();
    const buttons = createButtons(numberOfButtons);

    // Wait n seconds showing the buttons in order in a row
    await new Promise((resolve) => setTimeout(resolve, numberOfButtons * 1000));

    // Scramble the buttons
    updateGameStatus(messages.scrambling);
    await scrambleButtons(buttons, numberOfButtons, gameSettings.scrambleInterval);

    // Start the memory game
    hideButtonNumbers(buttons);
    enableGuessing(buttons);
};
window.startGame = startGame; // Attach startGame to the window object for global access


const assignRandomColour = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 is FFFFFF in hexadecimal (max value)
    return `#${randomColor}`;
};

const createButtons = (numberOfButtons) => {
    const container = document.getElementById('buttons-container');
    container.innerHTML = '';
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
    return new Promise((resolve) => {
        let scrambleCount = 0;
        const container = document.getElementById('buttons-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const buttonWidth = buttons[0]?.offsetWidth || 100; 
        const buttonHeight = buttons[0]?.offsetHeight || 50; 

        const scrambleInterval = setInterval(() => {
            if (scrambleCount >= times) {
                clearInterval(scrambleInterval);
                updateGameStatus(''); 
                resolve();
                return;
            }

            updateGameStatus(messages.scrambling);

            buttons.forEach((button) => {
                const randomX = Math.random() * (containerWidth - buttonWidth);
                const randomY = Math.random() * (containerHeight - buttonHeight);

                button.style.position = 'absolute'; // Switch to absolute for scrambling
                button.style.left = `${randomX}px`;
                button.style.top = `${randomY}px`;
            });

            scrambleCount++;
        }, interval);
    });
};

const hideButtonNumbers = (buttons) => {
    buttons.forEach((button) => {
        button.textContent = '';
    });
};

const revealButtonNumbers = (buttons, correctOrder) => {
    buttons.forEach((button, index) => {
        button.textContent = correctOrder[index] + 1;
    });
};

const enableGuessing = (buttons) => {
    updateGameStatus(messages.startGuessing)

    const correctOrder = buttons.map((btn) => parseInt(btn.dataset.index, 10)); // access the data-index attribute we stored earlier
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
                revealButtonNumbers(buttons, correctOrder);
            }
        };
    });
};




/* 
    I acknowledge the use of chat-gpt to help:
     - write the random colour generator method
     - suggest the idea to use a promise to wait for the buttons to scramble
     - suggest the idea to store the button's original index in a data attribute
*/