let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

let isDrawing = false; X = 0;
let lastX = 0;
let lastY = 0;
let strokes = [];
let currentStroke = [];

let players = ['Player 1', 'Player 2'];
let scores = [0, 0];
let currentPlayer = 0;
let rounds = 0;
let maxRounds = 6;
let guessChances = 3;
let hintUsed = false;
let currentRound = 1;

const wordsByCategory = {
    animals: ['Cat', 'Cattle', 'Dog', 'Donkey', 'Goat', 'Horse', 'Pig', 'Rabbit', "Ant", "bat", "Bear", "Bird", "Butterfly", "Camel", "Crow", "Crocodile", "Lion", "tiger", "Lizard" ],
    objects: ["apple", "ball", "car", "house", "tree", "bat", "table", "bottle", "book", "phone", "camera", "computer", "laptop", "tv", "fridge", "oven", "microwave", "toaster", "refrigerator", "stove"],
    places: ["beach", "city", "forest", "mountain", "river", "lake", "ponds", "ocean", "desert", "jungle"],
    food: ["apple", "banana", "chocolate", "cookie", "cake", "milk", "bread", "rice", "noodles", "pasta", "sushi", "pizza", "burger", "hotdog", "sandwich", "ice cream", "cake", "donut", "popsicle"],
    colors: ["red", "blue", "green", "yellow", "orange", "purple", "pink", "black", "white", "brown"],
    numbers: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],

};
let usedWords = [];
let category = "";
let chosenWord = "";
let chosenHint = "";
let timeInterval;
let leftTime = 60;

const guessInput = document.getElementById("guess-input");
const submitButton = document.getElementById("guess-button");
const wordspan = document.getElementById("word-to-draw");
const timerDisplay = document.getElementById("timer");
const hintBox = document.getElementById("hint-box");
const requestHint = document.getElementById("requestHint");
const feedback = document.getElementById("feedback");
const turnInfo = document.getElementById("turn-info");
const beepSound= new Audio("beep.mp3");

function $(id) {
    return document.getElementById(id);
}

function chooseMode(mode) {
    $("landing-page").classList.add("hidden-page");
    if (mode === "category") {
        $("category-page").classList.remove("hidden-page");
    } else if (mode === "custom") {
        $("custom-word-page").classList.remove("hidden-page");
    }
}

function selectCategory(selectedCategory) {
    category = selectedCategory;
    chooseNextCategoryWord();
    moveToGame();
}

function chooseNextCategoryWord(){
    const availableWords = wordsByCategory[category].filter(w => !usedWords.includes(w));
    if (availableWords.length === 0) {
        usedWords = [];
    }
    freshWords= wordsByCategory[category].filter(w => !usedWords.includes(w));
    chosenWord =freshWords[Math.floor(Math.random() * freshWords.length)].toLowerCase();
    usedWords.push(chosenWord);
    chosenHint = "It's a " + category + "!";
}

function selectCustomWord() {
    category = "custom";
    chosenWord = $("custom-word-input").value;
    chosenHint = $("custom-word-hint").value;
    moveToGame();
};
function moveToGame() {
    $("category-page").classList.add("hidden-page");
    $("custom-word-page").classList.add("hidden-page");
    $("game-page").classList.remove("hidden-page");
    startGame();
};
function startGame() {
    feedback.textContent = "";
    guessChances = 3;
    timeLeft = 60;
    phase = "drawing";
    rounds = 0;
    guessInput.disabled = true;
    submitButton.disabled = true;
    $("requestHint").classList.add("hidden-page");
    hintBox.classList.add("hidden-page");
    document.getElementById("guess-button").disabled = true;
    wordspan.classList.remove("hidden-page");

    if ( category != "custom") {
        chooseNextCategoryWord();
    }

    currentWord = chosenWord;
    wordspan.textContent = "Word to draw: " + currentWord;
    turnInfo.textContent = "It's " + players[currentPlayer] + "'s turn";

    resetCanvas();
    setupDrawing();
    resetGuess();
    startTimer(() => {
        phase = "guessing";
        startGuessing();
    });
    hintUsed = false;
    hintBox.classList.remove("hidden-page");
};

function startGuessing() {
    phase = "guessing";
    turnInfo.textContent = players[(currentPlayer + 1) % 2] + " , It's your guess time!";
    guessInput.disabled = false;
    submitButton.disabled = false;
    wordspan.textContent = "Guess the word!";
    wordspan.classList.remove("hidden-page");
    guessInput.value = "";
    document.getElementById("requestHint").classList.remove("hidden-page");
    clearInterval(timeInterval);
    startTimer(() => {
        endTurn(false);
    });
    hintUsed = false;
    hintBox.classList.remove("hidden-page");
};
function startTimer(onEnd) {
    clearInterval(timeInterval);
    timeLeft = 60;
    timerDisplay.textContent = "Time left: " + timeLeft;
    timeInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = "Time left: " + timeLeft;
        if(timeLeft <= 10 && timeLeft > 2 ){
            beepSound.play();
        }
        if (timeLeft <= 0) {
            clearInterval(timeInterval);
            if (phase === "drawing") {
                onEnd();
            }
        }
    }, 1000);
}

canvas.addEventListener("mousedown", () => {
    if (phase != "drawing") return;
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];

    context.beginPath();
    context.moveTo(lastX, lastY);
});
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    context.closePath();
});
canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    context.closePath();
});

function draw(e) {
    if (phase != "drawing") return;
    context.lineCap = "round";
    const strokeStyle = document.getElementById("color-picker").value;
    context.strokeStyle = strokeStyle;
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(e.offsetX, e.offsetY);
    context.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
}

function setupDrawing() {
    $("color-picker").addEventListener("change", (e) => {
        context.strokeStyle = e.target.value;
    });
    $("brushSize").addEventListener("change", (e) => {
        context.lineWidth = e.target.value;
    });
    $("clear-button").addEventListener("click", () => {
        resetCanvas();
    });
}

function redrawAll() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((stroke) => {
        if (stroke.length > 0) {
            context.beginPath();
            context.strokeStyle = stroke[0].color;
            context.lineWidth = stroke[0].size;
            context.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) {
                context.lineTo(stroke[i].x, stroke[i].y);
                context.stroke();
            }
            context.closePath();
        }
    });
}

function updateToolbar(enable) {
    canvas.style.pointerEvents = enable ? "auto" : "none";
    $("guess-input").disabled = enable;
}

function submitGuess() {
    const guess = $("guess-input").value.toLowerCase().trim();
    if (guess === chosenWord) {
        clearInterval(timeInterval);
        const points = hintUsed ? 0.5 : 1;
        scores[(currentPlayer + 1) % 2] += points;
        feedback.textContent = "Correct guess! , " + players[(currentPlayer + 1) % 2] + " gets " + points + " points";
        endTurn(true);
    } else {
        guessChances--;
        guessInput.value = "";
        feedback.textContent = "Wrong guess! You have " + guessChances + " chances left";
        if (guessChances === 0) {
            endTurn(false);
        }
    }
};

function endTurn(success) {
    clearInterval(timeInterval);
    if (!success) {
        scores[currentPlayer] += 1;
        feedback.textContent = "The word was " + chosenWord + ". " + players[(currentPlayer + 1) % 2 ] + " starts the next round!";
    }
    currentPlayer = (currentPlayer + 1) % 2;
    currentRound++;
    if (currentRound > maxRounds) {
        endGame();
    } else {
        if (category === "custom") {
            setTimeout(() => {
                $("game-page").classList.add("hidden-page");
                $("custom-word-page").classList.remove("hidden-page");
            }, 3000);
            return;
        }
        setTimeout(() => {
            moveToGame();
        }, 4000)
    }
}

function resetGuess() {
    $("guess-input").value = "";
    $("guess-input").placeholder = "Enter your guess";
    guessChances = 3;
    hintUsed = false;
    $("requestHint").classList.add("hidden-page");
    hintBox.classList.add("hidden-page");
    hintBox.textContent = "";
}

function requestHints() {
    $("hint-box").textContent = "Hint: " + chosenHint;
    $("hint-box").classList.remove("hidden-page");
    hintUsed = true;
    $("requestHint").classList.add("hidden-page");
}

function endGame() {
    $("game-page").classList.add("hidden-page");
    $("leaderboard").classList.remove("hidden-page");
    $("score-summary").textContent = players[0] + ": " + scores[0] + " | " + players[1] + ": " + scores[1];
    if (scores[0] > scores[1]) {
        $("winner").textContent = "🏆 " + players[0] + " wins! 🏆";
    } else if (scores[0] < scores[1]) {
        $("winner").textContent = "🏆 " + players[1] + " wins! 🏆";
    } else {
        $("winner").textContent = "🏆 It's a tie! 🏆";
    }
}

function restartGame() {
    location.reload();
}

function resetCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    context.strokeStyle = $("color-picker").value || "#000000";
    context.lineWidth = $("brushSize").value || 2;
}

