const board = document.getElementById("game-board");
const movesE1 = document.querySelector(".moves");
const timeE1 = document.querySelector(".time");
const restartE1 = document.querySelector(".restart");

let hasFlipped = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let time = 0;
let timer;
let matchedPairs = 0;
let cardsdata = [];

function startTimer() {
    timer = setInterval(() => {
        time++;
        timeE1.textContent = time;
    }, 1000);
};

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

function createCard(data) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-card", data.name);

    card.innerHTML =`
        <div class="card-inner">
            <div class="card-front">
                <img src="${data.image}" alt="${data.name}" />
            </div>
            <div class="card-back">❓</div>
        </div>`

    card.addEventListener("click", flipCard);
    return card;
}

async function loadCards() {
    const response = await fetch("data/cards.json");
    const data = await response.json();

    cardsdata = shuffle([...data.slice(0,8), ...data.slice(0,8)]);
    board.innerHTML = "";
    matchedPairs = 0;
    moves = 0;
    movesE1.textContent = 0;
    timeE1.textContent = 0;

    cardsdata.forEach((card) => {
        const cardElement = createCard(card);
        board.appendChild(cardElement);
    });

    startTimer();
};

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains("matched")) return;
    this.classList.add("flipped");

    if (!hasFlipped) {
        hasFlipped = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesE1.textContent = moves;
    checkForMatch();
};

function checkForMatch() {
    const isMatch = firstCard.dataset.card === secondCard.dataset.card;

    if (isMatch) {
        matchedPairs++;
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        firstCard.removeEventListener("click", flipCard);
        secondCard.removeEventListener("click", flipCard);
        resetBoard();

        if (matchedPairs === cardsdata.length / 2) {
            clearInterval(timer);
            setTimeout(() => {
                alert("🎉 You won in " + moves + " moves and " + time + " seconds!");
            }, 500);
        };
    } else {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            resetBoard();
        }, 1000);
    };
};

function resetBoard() {
    hasFlipped = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
};

function restart() {
    clearInterval(timer);
    loadCards();
};

loadCards();

