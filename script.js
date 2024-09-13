const dateEl = document.getElementById('date');
const currentTimeEl = document.getElementById('current-time');
const plannedTimeInput = document.getElementById('planned-time');
const startBtn = document.getElementById('start-btn');
const totalTimeEl = document.getElementById('total-time');
const timeLeftEl = document.getElementById('time-left');
const progressBar = document.getElementById('progress');
const pausePlayBtn = document.getElementById('pause-play-btn');
const pauseHistoryEl = document.getElementById('pause-history');
const finishedMessageEl = document.getElementById('finished-message');

let timer;
let totalSeconds = 0;
let elapsedSeconds = 0;
let isRunning = false;
let pauseHistory = [];
let startTime;

function updateDateTime() {
    const now = new Date();
    dateEl.textContent = now.toDateString();
    currentTimeEl.textContent = now.toLocaleTimeString();
}

function updateTimer() {
    const remainingSeconds = totalSeconds - elapsedSeconds;
    const percent = (elapsedSeconds / totalSeconds) * 100;

    timeLeftEl.textContent = `Time left: ${formatTime(remainingSeconds)}`;
    progressBar.style.width = `${percent}%`;

    if (remainingSeconds <= 0) {
        clearInterval(timer);
        isRunning = false;
        pausePlayBtn.textContent = 'Finished';
        pausePlayBtn.disabled = true;
        finishedMessageEl.style.display = 'block';
        timeLeftEl.style.display = 'none';
        saveData();
    } else {
        elapsedSeconds++;
        saveData();
    }
}

function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    const plannedHours = parseFloat(plannedTimeInput.value); // Parse input as a floating-point number (e.g., 1.5)
    if (isNaN(plannedHours) || plannedHours <= 0) {
        alert('Please enter a valid number of hours.');
        return;
    }

    totalSeconds = plannedHours * 3600; // Convert hours to seconds
    elapsedSeconds = 0;
    isRunning = true;
    pauseHistory = [];
    startTime = new Date();

    totalTimeEl.textContent = `Total time: ${formatTime(totalSeconds)}`;
    pausePlayBtn.textContent = 'Pause';
    pausePlayBtn.disabled = false;
    finishedMessageEl.style.display = 'none';
    timeLeftEl.style.display = 'block';

    timer = setInterval(updateTimer, 1000);
    startBtn.disabled = true;
    plannedTimeInput.disabled = true;
    updatePauseHistory();
}



function togglePausePlay() {
    if (isRunning) {
        clearInterval(timer);
        pausePlayBtn.textContent = 'Play';
        addPauseEntry();
    } else {
        timer = setInterval(updateTimer, 1000);
        pausePlayBtn.textContent = 'Pause';
    }
    isRunning = !isRunning;
}

function addPauseEntry() {
    const now = new Date();
    pauseHistory.push({
        timeWorked: formatTime(elapsedSeconds),
        pauseTime: now.toLocaleTimeString(),
        startedTime: startTime.toLocaleTimeString()
    });
    updatePauseHistory();
}

function updatePauseHistory() {
    pauseHistoryEl.innerHTML = '<h3>Pause History</h3>';
    pauseHistory.forEach((entry, index) => {
        const entryEl = document.createElement('p');
        entryEl.textContent = `Pause ${index + 1}: Started at ${entry.startedTime}, worked ${entry.timeWorked} before pausing at ${entry.pauseTime}`;
        pauseHistoryEl.appendChild(entryEl);
    });
}

function saveData() {
    const data = {
        date: new Date().toDateString(),
        totalSeconds,
        elapsedSeconds,
        pauseHistory,
        startTime: startTime.toISOString()
    };
    localStorage.setItem('studyTimerData', JSON.stringify(data));
}

function loadData() {
    const savedData = localStorage.getItem('studyTimerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.date === new Date().toDateString()) {
            totalSeconds = data.totalSeconds;
            elapsedSeconds = data.elapsedSeconds;
            pauseHistory = data.pauseHistory || [];
            startTime = new Date(data.startTime);
            plannedTimeInput.value = Math.floor(totalSeconds / 60);
            totalTimeEl.textContent = `Total time: ${formatTime(totalSeconds)}`;
            updateTimer();
            updatePauseHistory();
            startBtn.disabled = true;
            plannedTimeInput.disabled = true;
            pausePlayBtn.disabled = false;
        }
    }
}

startBtn.addEventListener('click', startTimer);
pausePlayBtn.addEventListener('click', togglePausePlay);

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        togglePausePlay();
    }
});

plannedTimeInput.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
        event.preventDefault();
        startTimer();
    }
});

setInterval(updateDateTime, 1000);
updateDateTime();
loadData();
