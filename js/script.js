const drawButton = document.getElementById("drawButton");
const wheel1 = document.getElementById("wheel1");
const wheel2 = document.getElementById("wheel2");
const wheel3 = document.getElementById("wheel3");

const shuffleSound = new Audio("./sounds/shuffle.mp3");
const resolveSound = new Audio("./sounds/resolve.mp3");
const finalResolveSounds = [
    new Audio("./sounds/final1.mp3"),
    new Audio("./sounds/final2.mp3"),
    new Audio("./sounds/final3.mp3")
];

const duration = 10 * 1000;
const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function triggerConfetti() {
    const animationEnd = Date.now() + duration;

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
    }, 250);
}

function playShuffleSound() {
    shuffleSound.loop = true;
    shuffleSound.play();
}

function stopShuffleSound() {
    shuffleSound.pause();
    shuffleSound.currentTime = 0;
}

function animateWheel(wheel, targetNumber, delay, isLastWheel = false) {
    let currentNumber = 0;
    const interval = setInterval(() => {
        currentNumber = (currentNumber + 1) % 10;
        wheel.textContent = currentNumber;
    }, 80);

    setTimeout(() => {
        clearInterval(interval);
        wheel.textContent = targetNumber;

        if (isLastWheel) {
            stopShuffleSound();
            const finalResolvedSound1 = finalResolveSounds[0];
            const finalResolvedSound2 = finalResolveSounds[1];
            const finalResolvedSound3 = finalResolveSounds[2];
            resolveSound.play();
            finalResolvedSound1.play();
            finalResolvedSound2.play();
            finalResolvedSound3.play();
        } else {
            resolveSound.play();
        }
    }, delay);
}

drawButton.addEventListener("click", () => {
    stopShuffleSound();
    playShuffleSound();

    const randomNumber = Math.floor(Math.random() * 501);
    const hundreds = Math.floor(randomNumber / 100);
    const tens = Math.floor((randomNumber % 100) / 10);
    const ones = randomNumber % 10;

    animateWheel(wheel1, hundreds, 3000);
    animateWheel(wheel2, tens, 6000);
    animateWheel(wheel3, ones, 9000, true);

    setTimeout(() => {
        triggerConfetti();
    }, 9000);
});
