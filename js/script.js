const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 10;
let snakeBody = [];
let velocityX = 0, velocityY = 0;
let setIntervalId;
let score = 0;

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerHTML = `High Score: ${highScore}`;

const changeFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
    clearInterval(setIntervalId);
    Swal.fire({
        title: 'Game Over!',
        text: 'Has perdido ! Vuelve a intentarlo..',
        icon: 'error',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
    }).then((result) => {
        if (result.isConfirmed) {
            location.reload();
        }
    });
};

const changeDirection = (e) => {
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
};

function seleccionarColorAleatorio(colores) {
    const indice = Math.floor(Math.random() * colores.length);
    return colores[indice];
}

async function obtenerColores() {
    try {
        const response = await fetch('colores.json');
        if (!response.ok) {
            throw new Error('Error al obtener los colores: ' + response.status);
        }
        return await response.json();
    } catch (error) {
        throw new Error('Error al obtener los colores:', error);
    }
}

async function cambiarColorSerpiente() {
    try {
        const colores = await obtenerColores();
        if (colores.length > 0) {
            const colorAleatorio = seleccionarColorAleatorio(colores);
            console.log('Color aleatorio seleccionado para la serpiente:', colorAleatorio);

            const snakeElements = document.querySelectorAll(".head");
        
            snakeElements.forEach(snakeElement => {
                snakeElement.style.backgroundColor = `${colorAleatorio.hex} !important`;
            });
        } else {
            console.log('No se pudieron obtener los colores para la serpiente.');
        }
    } catch (error) {
        console.error('Error al obtener los colores:', error);
    }
}

const initGame = () => {
    if (gameOver) return handleGameOver();
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if (snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        score++;

        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerHTML = `Score: ${score}`;

        highScoreElement.innerHTML = `High Score: ${highScore}`;
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }

    snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX;
    snakeY += velocityY;

    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = htmlMarkup;
};

async function iniciarJuego() {
    await cambiarColorSerpiente();
    changeFoodPosition();
    document.addEventListener("keydown", changeDirection);
    setIntervalId = setInterval(initGame, 125);
}

document.addEventListener('DOMContentLoaded', iniciarJuego);