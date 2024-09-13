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
const exportBtn = document.getElementById('export-btn');

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
        startTime = new Date();
    }
    isRunning = !isRunning;
}

function addPauseEntry() {
    const now = new Date();
    const timeWorkedInMinutes = ((now - startTime) / 1000 / 60).toFixed(1);
    pauseHistory.push({
        timeWorked: timeWorkedInMinutes,
        pauseTime: now.toLocaleTimeString(),
        startedTime: startTime.toLocaleTimeString()
    });
    updatePauseHistory();
}

function updatePauseHistory() {
    // Clear previous history and create a new table
    pauseHistoryEl.innerHTML = '<h3>Pause History</h3>';

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    // Create table headers
    const headerRow = document.createElement('tr');
    const headers = ['Pause #', 'Started At', 'Time Worked (min)', 'Paused At'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid black';
        th.style.padding = '8px';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Add data rows
    pauseHistory.forEach((entry, index) => {
        const row = document.createElement('tr');

        // Create cells for pause number, start time, time worked, and pause time
        const pauseNumberCell = document.createElement('td');
        pauseNumberCell.textContent = index + 1;
        pauseNumberCell.style.border = '1px solid black';
        pauseNumberCell.style.padding = '8px';

        const startedTimeCell = document.createElement('td');
        startedTimeCell.textContent = entry.startedTime;
        startedTimeCell.style.border = '1px solid black';
        startedTimeCell.style.padding = '8px';

        const timeWorkedCell = document.createElement('td');
        timeWorkedCell.textContent = entry.timeWorked;
        timeWorkedCell.style.border = '1px solid black';
        timeWorkedCell.style.padding = '8px';

        const pausedAtCell = document.createElement('td');
        pausedAtCell.textContent = entry.pauseTime;
        pausedAtCell.style.border = '1px solid black';
        pausedAtCell.style.padding = '8px';

        // Append cells to the row
        row.appendChild(pauseNumberCell);
        row.appendChild(startedTimeCell);
        row.appendChild(timeWorkedCell);
        row.appendChild(pausedAtCell);

        // Append row to the table
        table.appendChild(row);
    });

    // Append the table to the pause history container
    pauseHistoryEl.appendChild(table);
}

function saveData() {
    const currentDate = new Date().toDateString();
    const data = {
        date: new Date().toDateString(),
        totalSeconds,
        elapsedSeconds,
        pauseHistory,
        startTime: startTime.toISOString()
    };
    const allData = JSON.parse(localStorage.getItem('studyTimerData')) || {};
    allData[new Date().toDateString()] = data;
    localStorage.setItem('studyTimerData', JSON.stringify(allData));
}

function loadData() {
    const savedData = localStorage.getItem('studyTimerData');
    if (savedData) {
        const allData = JSON.parse(savedData);
        const todayData = allData[new Date().toDateString()];
        if (todayData) {
            totalSeconds = todayData.totalSeconds;
            elapsedSeconds = todayData.elapsedSeconds;
            pauseHistory = todayData.pauseHistory || [];
            startTime = new Date(todayData.startTime);
            plannedTimeInput.value = (totalSeconds / 3600).toFixed(1); // Convert to hours
            totalTimeEl.textContent = `Total time: ${formatTime(totalSeconds)}`;
            updateTimer();
            updatePauseHistory();
            startBtn.disabled = true;
            plannedTimeInput.disabled = true;
            pausePlayBtn.disabled = false;
        }
    }
}

function exportToCSV() {
    const allData = JSON.parse(localStorage.getItem('studyTimerData')) || {};
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Started At,Work Duration (min),Paused At\n";

    for (const date in allData) {
        const dayData = allData[date];
        dayData.pauseHistory.forEach(pause => {
            csvContent += `${date},${pause.startedTime},${pause.timeWorked},${pause.pauseTime}\n`;
        });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "study_timer_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

exportBtn.addEventListener('click', exportToCSV);
