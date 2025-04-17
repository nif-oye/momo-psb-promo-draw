// DOM Elements
const drawButton = document.getElementById("drawButton");
const numberDisplay = document.getElementById("numberDisplay");
const nameDisplay = document.getElementById("nameDisplay");
const resultsButton = document.getElementById("resultsButton");
const resultsModal = document.getElementById("resultsModal");
const spanClose = document.querySelector(".close");
const resultsList = document.getElementById("resultsList");
const grandPrizeModal = document.getElementById("grandPrizeModal");
const grandPrizeButton = document.getElementById("grandPrizeButton");

// Get audio elements
const normalAudio = document.getElementById("normalAudio");
const grandAudio  = document.getElementById("grandAudio");

// State Variables
let isGrandPrizeReady = false;
let people = [];
let roundCount = 0;
let winners = [];
const totalRounds = 11;

// Utility Functions
function loadPeopleFromCSV() {
  fetch("qualified_customers.csv")
    .then(res => res.text())
    .then(data => {
      const lines = data.split("\n").slice(1);
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
    });
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function maskPhoneNumber(phone) {
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(7)}` : phone;
}

function updateNumberDisplay(number) {
  numberDisplay.textContent = maskPhoneNumber(number);
}

function updateResultsList() {
  resultsList.innerHTML = "";
  winners.forEach((winner, index) => {
    const listItem = document.createElement("div");
    const typeLabel = winner.isGrandPrize ? "Grand Prize Winner" : `Winner #${winner.round}`;
    listItem.innerHTML = winner.isGrandPrize
      ? `<img src="./images/crown.png" alt="Crown" style="width:20px;vertical-align:middle;margin-right:8px;"> ${typeLabel} → ${maskPhoneNumber(winner.phone)} - ${winner.name}`
      : `${typeLabel} → ${maskPhoneNumber(winner.phone)} - ${winner.name}`;
    resultsList.appendChild(listItem);
  });
}

function disableDrawButton() {
  drawButton.disabled = true;
  drawButton.textContent = "No More Draws";
}

function showNoWinnersModal() {
  document.getElementById("noWinnersModal").style.display = "block";
}

// Confetti Functions
function triggerConfettiNormal() {
  const end = Date.now() + 4000;
  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      particleCount: 100,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      zIndex: 0
    });
  }, 250);
}

function triggerConfettiGrand() {
  const end = Date.now() + 15000;
  const interval = setInterval(() => {
    if (Date.now() > end) return clearInterval(interval);
    confetti({
      particleCount: 350,
      startVelocity: 90,
      spread: 1000,
      ticks: 120,
      colors: ['#FFD700', '#FFCC08', '#ffffff'],
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      zIndex: 0
    });
  }, 200);
}

// Draw Logic
function shuffleNumber() {
  if (people.length === 0) return showNoWinnersModal();

  if (roundCount >= totalRounds - 1) {
    isGrandPrizeReady = true;
    drawButton.disabled = false;
    drawButton.innerHTML = 'Next: Grand Prize... <img src="images/crown.png" alt="Crown" class="crown-icon">';
    return;
  }

  drawButton.disabled = true;
  nameDisplay.innerHTML = `<div class="spinner"></div>`;

  let count = 0;
  const interval = setInterval(() => {
    const random = people[Math.floor(Math.random() * people.length)];
    updateNumberDisplay(random.phone);
    count++;

    if (count > 750) {
      clearInterval(interval);
      const winner = shuffleArray(people)[Math.floor(Math.random() * people.length)];

      updateNumberDisplay(winner.phone);
      nameDisplay.textContent = winner.name;
      roundCount++;

      winners.push({ ...winner, round: roundCount, isGrandPrize: false });
      people = people.filter(p => p.name !== winner.name);

      triggerConfettiNormal();
      updateResultsList();

      if (roundCount < totalRounds - 1) {
        drawButton.disabled = false;
      } else {
        isGrandPrizeReady = true;
        drawButton.disabled = false;
        drawButton.innerHTML = 'Next: Grand Prize... <img src="images/crown.png" alt="Crown" class="crown-icon">';
      }
    }
  }, 20);
}

function shuffleGrandPrize() {
  grandPrizeModal.style.display = "none";
  document.querySelector('.logo').src = "./images/momo-logo-yellow.png";
  document.body.classList.add("grand-prize-mode");

  setTimeout(() => {
    nameDisplay.innerHTML = `<div class="spinner"></div>`;

    let count = 0;
    const interval = setInterval(() => {
      const random = people[Math.floor(Math.random() * people.length)];
      updateNumberDisplay(random.phone);
      count++;

      if (count > 900) {
        clearInterval(interval);
        const winner = shuffleArray(people)[Math.floor(Math.random() * people.length)];

        updateNumberDisplay(winner.phone);
        nameDisplay.textContent = winner.name;
        roundCount++;

        winners.push({ ...winner, round: roundCount, isGrandPrize: true });
        people = people.filter(p => p.name !== winner.name);

        triggerConfettiGrand();
        updateResultsList();
        disableDrawButton();
      }
    }, 20);
  }, 300);
}

// Draw Button click → plays normal audio
drawButton.addEventListener("click", () => {
  if (isGrandPrizeReady) {
    grandPrizeModal.style.display = "block";
    drawButton.style.display = "none";
  } else {
    normalAudio.currentTime = 0;
    normalAudio.play().catch(console.error);
    shuffleNumber();
  }
});

// Grand Prize button click → plays grand audio
grandPrizeButton.addEventListener("click", () => {
  grandAudio.currentTime = 0;
  grandAudio.play().catch(console.error);
  shuffleGrandPrize();
});

document.querySelector(".grand-close").addEventListener("click", () => {
  grandPrizeModal.style.display = "none";
  drawButton.disabled = false;
});

document.querySelector(".no-winners-close").addEventListener("click", () => {
  document.getElementById("noWinnersModal").style.display = "none";
});

resultsButton.addEventListener("click", () => {
  if (winners.length === 0) return showNoWinnersModal();
  resultsModal.style.display = "block";
});

document.getElementById("downloadResultsBtn").addEventListener("click", () => {
  if (winners.length === 0) return showNoWinnersModal();

  const content = `MoMo PSB Airtime/Data Draw - Winners List\n=========================================\n\n` +
    winners.map(w => (
      w.isGrandPrize ?
      `Grand Prize Winner: ${w.name} (${w.phone})` :
      `Winner #${w.round}: ${w.name} (${w.phone})`
    )).join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "raffle_winners.txt";
  a.click();
  URL.revokeObjectURL(url);
});

spanClose.addEventListener("click", () => {
  resultsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === resultsModal) {
    resultsModal.style.display = "none";
  }
});

// Init
loadPeopleFromCSV();
