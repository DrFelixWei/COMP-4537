import { messages } from '../lang/messages/en/user.js';

const GAMESETTINGS = {
    minButtons: 3,
    maxButtons: 7,
    defaultBtnCount: 4,
    buttonSize: {
        height: '5em',
        width: '10em',
    },
    scrambleInterval: 2000, 
};

class Button {
    constructor(index, colour, height, width) {
        this.index = index;
        this.colour = colour;
        this.height = height;
        this.width = width;
        this.x = 0;
        this.y = 0;
        this.element = null;  // DOM element for the button
    }

    changePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    createElement() {
        this.element = document.createElement('button');
        this.element.textContent = `${this.index + 1}`;
        this.element.style.backgroundColor = this.colour;
        this.element.style.height = this.height;
        this.element.style.width = this.width;
        this.element.style.position = 'relative';
        this.element.dataset.index = this.index; // Store the button's original index
        return this.element;
    }
}

class ButtonManager {
    constructor() {
        this.buttons = [];
    }

    assignRandomColour = () => {
        const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 is FFFFFF in hexadecimal (max value)
        return `#${randomColor}`;
    };

    createButtons(numberOfButtons) {
        const container = document.getElementById('buttons-container');
        container.innerHTML = '';
        const buttonOrder = [];

        for (let i = 0; i < numberOfButtons; i++) {
            const colour = this.assignRandomColour();
            const button = new Button(i, colour, GAMESETTINGS.buttonSize.height, GAMESETTINGS.buttonSize.width);
            const buttonElement = button.createElement();
            container.appendChild(buttonElement);
            this.buttons.push(button);
            buttonOrder.push(buttonElement);
        }

        return buttonOrder;
    }

    scrambleButtons(times, interval) {
        return new Promise((resolve) => {
            let scrambleCount = 0;
            const container = document.getElementById('buttons-container');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const buttonWidth = this.buttons[0]?.element.offsetWidth || 100;
            const buttonHeight = this.buttons[0]?.element.offsetHeight || 50;

            const scrambleInterval = setInterval(() => {
                if (scrambleCount >= times) {
                    clearInterval(scrambleInterval);
                    resolve();
                    return;
                }

                this.buttons.forEach((button) => {
                    const randomX = Math.random() * (containerWidth - buttonWidth);
                    const randomY = Math.random() * (containerHeight - buttonHeight);

                    button.changePosition(randomX, randomY);
                    button.element.style.position = 'absolute';
                    button.element.style.left = `${randomX}px`;
                    button.element.style.top = `${randomY}px`;
                });

                scrambleCount++;
            }, interval);
        });
    }

    hideButtonNumbers() {
        this.buttons.forEach((button) => {
            button.element.textContent = '';
        });
    }

    revealButtonNumbers(correctOrder) {
        this.buttons.forEach((button, index) => {
            button.element.textContent = correctOrder[index] + 1;
        });
    }
}

class GameManager {
    constructor() {
        this.buttonManager = new ButtonManager();
    }

    renderMenu() {
        const container = document.getElementById('menu-container');
        container.innerHTML = `
            <p>${messages.buttonsPrompt}</p>
            <input 
                type="number" 
                id="btnCount" 
                value="${GAMESETTINGS.defaultBtnCount}"
            >
            <button id="goButton">${messages.go}</button>
            <div id="message-container" style="marginTop: 0.5em">
                <div id="button-count-validation" style="color: red;"></div>
                <div id="game-status"></div>
            </div>
        `;
        document.getElementById('btnCount').addEventListener('input', this.validateButtonCount);
        document.getElementById('goButton').addEventListener('click', this.startGame);
    }

    getButtonCount() {
        const buttonCount = parseInt(document.getElementById('btnCount').value, 10);
        return buttonCount;
    }

    validateButtonCount() {
        const buttonCount = this.getButtonCount();
        const validationMessageContainer = document.getElementById('button-count-validation');
        const goButton = document.getElementById('goButton');

        if (isNaN(buttonCount) 
            || buttonCount < GAMESETTINGS.minButtons 
            || buttonCount > GAMESETTINGS.maxButtons
        ) {
            validationMessageContainer.textContent = messages.invalidButtonCount + ` (${GAMESETTINGS.minButtons} - ${GAMESETTINGS.maxButtons})`;
            goButton.disabled = true;
        } else {
            validationMessageContainer.textContent = '';
            goButton.disabled = false;
        }
    }

    updateGameStatus(statusText) {
        const gameStatus = document.getElementById('game-status');
        gameStatus.textContent = statusText;
    }

    displayGameMessage(messageText) {
        const container = document.getElementById('main-content-container');
        const messageWrapper = document.createElement('div'); // using a wrapper for easier removal
        messageWrapper.id = 'game-message-wrapper'; 
        messageWrapper.innerHTML = `
            <div id="game-message">
                <p>${messageText}</p>
                <button id="close-game-message">${messages.close}</button>
            </div>
        `;
        container.appendChild(messageWrapper);
        document.getElementById('close-game-message').addEventListener('click', this.closeGameMessage);
    }

    closeGameMessage() {
        const messageWrapper = document.getElementById('game-message-wrapper');
        if (messageWrapper) {
            messageWrapper.remove(); 
        }
    }

    async startGame() {
        this.updateGameStatus(messages.getReady);

        const numberOfButtons = this.getButtonCount();
        const buttons = this.buttonManager.createButtons(numberOfButtons);

        // Wait n seconds showing the buttons in order in a row
        await new Promise((resolve) => setTimeout(resolve, numberOfButtons * 1000));

        // Scramble the buttons
        this.updateGameStatus(messages.scrambling);
        await this.buttonManager.scrambleButtons(numberOfButtons, GAMESETTINGS.scrambleInterval);

        // Start the memory game
        this.buttonManager.hideButtonNumbers();
        this.enableGuessing(buttons);
    }

    enableGuessing(buttons) {
        this.updateGameStatus(messages.startGuessing);

        const correctOrder = buttons.map((btn) => parseInt(btn.dataset.index, 10)); // access the data-index attribute we stored earlier
        let currentIndex = 0;

        buttons.forEach((button) => {
            button.onclick = () => {
                const clickedIndex = parseInt(button.dataset.index, 10);

                if (clickedIndex === correctOrder[currentIndex]) {
                    button.textContent = clickedIndex + 1; // Reveal the number
                    currentIndex++;

                    if (currentIndex === correctOrder.length) {
                        this.displayGameMessage(messages.win);
                    }
                } else {
                    this.displayGameMessage(messages.lose);
                    this.buttonManager.revealButtonNumbers(correctOrder);
                }
            };
        });
    }
}

window.onload = function() {
    const gameManager = new GameManager();
    gameManager.renderMenu();
};


