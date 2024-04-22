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
    foodX = Math.floor(Math.random() * 30) +1;
    foodY = Math.floor(Math.random() * 30) +1;
}

const fetchRandomBackgroundColor = async () => {
    try {
        const response = await fetch('https://www.thecolorapi.com/scheme?format=json&count=1');
        if (!response.ok) {
            throw new Error('Error al obtener el color de fondo');
        }
        const data = await response.json();
        return data.colors[0].hex.value;
    } catch (error) {
        console.error('Error al obtener el color de fondo:', error.message);
        return null;
    }
};



const setBackgroundColor = async () => {
    try {
        const backgroundColor = await fetchRandomBackgroundColor();
        if (backgroundColor) {
        const snakeColorContrast = getContrastRatio(backgroundColor, 'green');
        const foodColorContrast = getContrastRatio(backgroundColor, 'red');
        
        if (snakeColorContrast > 3 && foodColorContrast > 3) {
            document.body.style.backgroundColor = backgroundColor;
        } else {
            setBackgroundColor();
        }
        } else {
        console.error('No se pudo establecer el color de fondo');
        }
    } catch (error) {
        console.error('Error al establecer el color de fondo:', error.message);
    }
};

const getContrastRatio = (color1, color2) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    const luminance1 = calculateLuminance(rgb1);
    const luminance2 = calculateLuminance(rgb2);
    const contrastRatio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);

    return contrastRatio;
};

const hexToRgb = (hex) => {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
};

const calculateLuminance = (rgb) => {
    const [r, g, b] = rgb.map(component => {
        component /= 255;
        return component <= 0.03928 ? component / 12.92 : Math.pow((component + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};


setBackgroundColor();  


import Swal from 'sweetalert2';

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
    //console.log(e);
    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
    //initGame();
}

const initGame = () => {
    if(gameOver) return handleGameOver();
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if(snakeX === foodX && snakeY === foodY) {
        changeFoodPosition();
        snakeBody.push([foodX, foodY]);
        score++;

        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerHTML = `Score: ${score}`;

        highScoreElement.innerHTML = `High Score: ${highScore}`;
    }

    for(let i = snakeBody.length - 1; i > 0; i--){
        snakeBody[i] = snakeBody[i - 1];
    }
    
    snakeBody[0] = [snakeX, snakeY]

    snakeX += velocityX;
    snakeY += velocityY;

    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        gameOver = true;
    }

    for(let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        if(i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = htmlMarkup;
}

changeFoodPosition();
setIntervalId = setInterval(initGame, 125)
document.addEventListener("keydown", changeDirection);