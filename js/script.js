const drawButton = document.getElementById("drawButton");
const numberDisplay = document.getElementById("numberDisplay");
const nameDisplay = document.getElementById("nameDisplay");
const resultsButton = document.getElementById("resultsButton");
const resultsModal = document.getElementById("resultsModal");
const spanClose = document.querySelector(".close");
const resultsList = document.getElementById("resultsList");

let people = [];
let roundCount = 0;
let winners = [];
const totalRounds = 11; // 10 normal rounds + 1 grand prize round

// Load CSV with RefCount support
function loadPeopleFromCSV() {
    fetch("people.csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split("\n").slice(1); // skip header
            people = [];

            lines.forEach(line => {
                const [phone, name, refCountStr] = line.split(",").map(v => v.trim());
                if (name && phone) {
                    const refCount = parseInt(refCountStr || "0", 10);
                    for (let i = 0; i <= refCount; i++) {
                        people.push({ name, phone });
                    }
                }
            });

            console.log("Loaded People:", people);
        });
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function maskPhoneNumber(phone) {
    if (phone.length !== 11) return phone;
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

function updateNumberDisplay(number) {
    numberDisplay.textContent = maskPhoneNumber(number);
}

// Normal confetti effect (for rounds 1-10)
function triggerConfettiNormal() {
    const duration = 4000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
        const timeLeft = end - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
            particleCount: 100 * (timeLeft / duration),
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            zIndex: 0,
        });
    }, 250);
}

// Special confetti effect for the grand prize round
function triggerConfettiGrand() {
    const duration = 20000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
        const timeLeft = end - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
            particleCount: 350 * (timeLeft / duration),
            startVelocity: 90,
            spread: 1000,
            ticks:120,
            colors: ['#FFD700', '#FFCC08', '#ffffff'], // gold and bright colors
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            zIndex: 0,
        });
    }, 200);
}

function updateResultsList() {
    resultsList.innerHTML = ""; // clear before updating
    winners.forEach((winner, index) => {
        const listItem = document.createElement("div");
        if (winner.isGrandPrize) {
            listItem.innerHTML = `<img src="./images/crown.png" alt="Crown" class="crown-icon" style="width:20px;vertical-align:middle;margin-right:8px;"> Grand Prize Winner → ${winner.name} (${maskPhoneNumber(winner.phone)})`;
        } else {
            listItem.textContent = `Winner #${winner.round} → ${winner.name} (${maskPhoneNumber(winner.phone)}) `;
        }
        resultsList.appendChild(listItem);
    });
}

function disableDrawButton() {
    drawButton.disabled = true;
    drawButton.textContent = "No More Draws";
}

// Main function to run a draw round
function shuffleNumber() {
    if (people.length === 0) {
        showNoWinnersModal();
        return;
    }
    if (roundCount >= totalRounds) {
        disableDrawButton();
        return;
    }

    // Disable button immediately to prevent double-click
    drawButton.disabled = true;

    let count = 0;
    nameDisplay.innerHTML = `<div class="spinner"></div>`;
    nameDisplay.style.opacity = 1;

    const interval = setInterval(() => {
        const random = people[Math.floor(Math.random() * people.length)];
        updateNumberDisplay(random.phone);
        count++;

        if (count > 10) { // ~15 seconds of shuffling
            clearInterval(interval);

            const shuffled = shuffleArray(people);
            const winner = shuffled[Math.floor(Math.random() * shuffled.length)];

            updateNumberDisplay(winner.phone);
            nameDisplay.textContent = winner.name;

            roundCount++;

            if (roundCount === totalRounds) {
                drawButton.textContent = "Grand Prize Draw!";
                winners.push({ ...winner, round: roundCount, isGrandPrize: true });
                triggerConfettiGrand();

                // Change logo image to grand prize logo (update the path as needed)
            } else {
                winners.push({ ...winner, round: roundCount, isGrandPrize: false });
                triggerConfettiNormal();
                if (roundCount === totalRounds - 1) {
                    drawButton.textContent = "Next: Grand Prize Round";
                    
                    document.querySelector('.logo').src = "images/grand-logo.png";
                    // Add the grand prize mode to the body to trigger all the CSS changes
                    document.body.classList.add("grand-prize-mode");
                }
            }

            updateResultsList();

            // Remove the winner from the pool to prevent repeats
            people = people.filter(p => p.name !== winner.name);

            if (roundCount >= totalRounds) {
                disableDrawButton();
            } else {
                // Re-enable button after shuffling stops if more rounds remain
                drawButton.disabled = false;
            }
        }
    }, 20);
}


function showNoWinnersModal() {
    document.getElementById("noWinnersModal").style.display = "block";
}
document.querySelector(".no-winners-close").addEventListener("click", () => {
    document.getElementById("noWinnersModal").style.display = "none";
});

// Event listeners
drawButton.addEventListener("click", shuffleNumber);

loadPeopleFromCSV();

// Show Results modal logic
resultsButton.addEventListener("click", () => {
    if (winners.length === 0) {
        showNoWinnersModal();
        return;
    }
    resultsModal.style.display = "block";
});

document.getElementById("downloadResultsBtn").addEventListener("click", () => {
    if (winners.length === 0) {
        showNoWinnersModal();
        return;
    }

    let content = `MoMo PSB Airtime/Data Draw - Winners List\n=========================================\n\n`;
    winners.forEach(winner => {
        if (winner.isGrandPrize) {
            content += `Grand Prize Winner: ${winner.name} (${winner.phone})\n`;
        } else {
            content += `Winner #${winner.round}: ${winner.name} (${winner.phone})\n`;
        }
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "raffle_winners.txt";
    a.click();

    URL.revokeObjectURL(url);
});

// Close modal when clicking the '×'
spanClose.addEventListener("click", () => {
    resultsModal.style.display = "none";
});

// Close modal when clicking outside it
window.addEventListener("click", (event) => {
    if (event.target === resultsModal) {
        resultsModal.style.display = "none";
    }
});
