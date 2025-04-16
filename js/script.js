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

function triggerConfetti() {
    const duration = 8000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
        const timeLeft = end - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        confetti({
            particleCount: 200 * (timeLeft / duration),
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            zIndex: 0,
        });
    }, 250);
}

function updateResultsList() {
    resultsList.innerHTML = ""; // clear before updating
    winners.forEach((winner, index) => {
        const listItem = document.createElement("div");
        listItem.textContent = `Winner #${winner.round}: ${maskPhoneNumber(winner.phone)} - ${winner.name}`;
        resultsList.appendChild(listItem);
    });
}

function shuffleNumber() {
    if (people.length === 0) {
        showNoWinnersModal();
        return;
    }

    let count = 0;

    // Show spinner
    nameDisplay.innerHTML = `<div class="spinner"></div>`;
    nameDisplay.style.opacity = 1;

    const interval = setInterval(() => {
        const random = people[Math.floor(Math.random() * people.length)];
        updateNumberDisplay(random.phone);
        // nameDisplay.textContent = "Shuffling..."; // optional during shuffle
        count++;

        if (count > 200) {
            clearInterval(interval);

            const shuffled = shuffleArray(people);
            const winner = shuffled[Math.floor(Math.random() * shuffled.length)];

            updateNumberDisplay(winner.phone);
            nameDisplay.textContent = winner.name;

            roundCount++;  // increment round

            winners.push({
                ...winner,
                round: roundCount // add round info here
            });

            updateResultsList();
            triggerConfetti();
        }

    }, 20);
}

function showNoWinnersModal() {
    document.getElementById("noWinnersModal").style.display = "block";
}
document.querySelector(".no-winners-close").addEventListener("click", () => {
    document.getElementById("noWinnersModal").style.display = "none";
});


drawButton.addEventListener("click", shuffleNumber);

loadPeopleFromCSV();

// Show Results modal logic
resultsButton.addEventListener("click", () => {
    if (winners.length === 0) {
        showNoWinnersModal();
        return;
    }

    // Clear old results
    resultsList.innerHTML = "";

    winners.forEach(winner => {
        const resultItem = document.createElement("div");
        resultItem.innerHTML = `
      <strong>Winner #${winner.round}:</strong> 
      ${winner.name} 
      (${maskPhoneNumber(winner.phone)})
    `;
        resultsList.appendChild(resultItem);
    });

    // Show modal
    resultsModal.style.display = "block";
});

document.getElementById("downloadResultsBtn").addEventListener("click", () => {
    if (winners.length === 0) {
        showNoWinnersModal();
        return;
    }

    let content = `MoMo PSB Airtime/Data Draw - Winners List\n=========================================\n\n`;

    winners.forEach(winner => {
        content += `Winner #${winner.round}: ${winner.name} (${winner.phone})\n`;
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
