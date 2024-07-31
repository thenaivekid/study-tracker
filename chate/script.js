let timer;
let isPaused = true;
let startTime;
let elapsedTime = 0;
let totalTime;
const storageKey = 'study-timer';

document.addEventListener("DOMContentLoaded", () => {
    const savedData = JSON.parse(localStorage.getItem(storageKey));
    if (savedData) {
        elapsedTime = savedData.elapsedTime;
        totalTime = savedData.totalTime;
        updateDisplay();
    }
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function startTimer() {
    const inputMinutes = document.getElementById('study-time').value;
    if (!inputMinutes) return;
    totalTime = inputMinutes * 60;
    isPaused = false;
    startTime = Date.now();
    runTimer();
}

function toggleTimer() {
    isPaused = !isPaused;
    document.getElementById('pause-play').textContent = isPaused ? 'Play' : 'Pause';
    if (!isPaused) {
        startTime = Date.now() - elapsedTime * 1000;
        runTimer();
    } else {
        clearInterval(timer);
        saveData();
    }
}

function runTimer() {
    timer = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        if (elapsedTime >= totalTime) {
            clearInterval(timer);
            elapsedTime = totalTime;
            isPaused = true;
        }
        updateDisplay();
        saveData();
    }, 1000);
}

function updateDisplay() {
    document.getElementById('total-time').textContent = `Total Time: ${formatTime(totalTime)}`;
    document.getElementById('elapsed-time').textContent = `Time Elapsed: ${formatTime(elapsedTime)}`;
    const progress = (elapsedTime / totalTime) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('current-day').textContent = `Day: ${now.toDateString()}`;
    document.getElementById('current-time').textContent = `Current Time: ${now.toLocaleTimeString()}`;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function saveData() {
    const data = {
        elapsedTime,
        totalTime
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
}
