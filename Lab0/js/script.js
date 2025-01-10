getButtonCount = () => {
    const buttonCount = parseInt(document.getElementById('btnCount').value, 10); // Parse as an integer
    return buttonCount;
};

validateButtonCount = (buttonCount) => {
    if (isNaN(buttonCount) || buttonCount < 3 || buttonCount > 7) { // Check if it is a valid number
        alert('Please enter a number between 3 and 7');
        return false;
    }
    return true;
};

assignRandomColour = () => {
    const randomColor = Math.floor(Math.random()*16777215).toString(16);
    return `#${randomColor}`;
};

createButtons = (numberOfButtons) => {
    const container = document.getElementById('buttons-container');

    // Clear the container before creating new buttons
    container.innerHTML = '';

    for (let i = 0; i < numberOfButtons; i++) {
        const button = document.createElement('button');

        button.textContent = `${i + 1}`;

        button.style.backgroundColor = assignRandomColour();

        button.addEventListener('click', () => {
            alert(`Button ${i + 1} clicked`);
        });

        container.appendChild(button);
    }
};




startGame = () => {
    const numberOfButtons = getButtonCount();

    if (validateButtonCount(numberOfButtons)) {
        createButtons(numberOfButtons);
    }
};
