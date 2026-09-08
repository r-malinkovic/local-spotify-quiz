import {InitializeSpotifySDK, player, playerReady, playSong} from "./spotify.js";
import {shuffleArray, sleep, buttonClick, initializeKeyboardNavigation} from "./utils.js";
import {settings, storeSettings} from "./settings.js"

const roundDuration = Number(settings.roundDuration);
const songsAmount = Number(settings.songsAmount);

const infoTextElement = document.getElementById("info-text");
const roundCounterElement = document.getElementById("round-counter");
const volumeElement = document.getElementById("volume");
const timerElement = document.getElementById("timer");
const playButtonElement = document.getElementById("play-button");
const userAnswerElement = document.getElementById("user-answer");
const submitAnswerButtonElement = document.getElementById("submit-answer");
const answerHelperElement = document.getElementById("answer-helper");
const resultsElement = document.getElementById("results");
const nextRoundButtonElement = document.getElementById("next-round-button");
const playDivElement = document.getElementById("play-div");

function startVisualCountdown(duration) {
    return setInterval(() => {
        if (duration > 0) {
            duration -= 0.1;
            timerElement.textContent = Math.abs(duration).toFixed(1);
        } else {
            timerElement.textContent = "0.0"; 
            }
        }, 100);
}

async function playRound(songItem) {
    playButtonElement.disabled = true;
    playDivElement.style.display = "none";
    timerElement.style.display = "block";

    userAnswerElement.disabled = false;
    userAnswerElement.focus();
    const seekPos = Math.floor(Math.random() * (songItem.duration_ms - (roundDuration * 1000)));
    if (seekPos < 0) {
        seekPos = 0; // case where song is shorter than round duration
    }

    playSong(songItem.uri, seekPos);
    await sleep(300); 

    const countdownId = startVisualCountdown(roundDuration);
    const timeoutId = setTimeout(() => {
        submitAnswerButtonElement.click();
    }, 1000 * roundDuration);

    return new Promise((resolve) => {
        submitAnswerButtonElement.addEventListener("click", () => {
            clearInterval(countdownId);
            clearTimeout(timeoutId);
            userAnswerElement.disabled = true;
            player.pause();
            resolve();
        }, { once: true });
    });
}

function showRoundResults(isAnswerCorrect, songItem) {
    const correctAnswerElement = document.createElement("div");
    if (isAnswerCorrect) {
        correctAnswerElement.textContent = "Correct!";
        correctAnswerElement.style.color = "green";
    } else {
        correctAnswerElement.textContent = "Incorrect!";
        correctAnswerElement.style.color = "red";
    }
    resultsElement.appendChild(correctAnswerElement);

    const songInfoElement = document.createElement("p");
    songInfoElement.textContent = 
        `The song was: ${songItem.name} - ${songItem.artists.map(artist => artist.name).join(", ")}`;
    resultsElement.appendChild(songInfoElement);

    const albumImageElement = document.createElement("img");
    albumImageElement.src = songItem.album.images[0].url;
    albumImageElement.alt = `${songItem.name} album cover`;
    resultsElement.appendChild(albumImageElement);

    timerElement.style.display = "none";

    nextRoundButtonElement.style.display = "block";
    nextRoundButtonElement.focus();
}

function resetRound(roundNumber) {
    resultsElement.innerHTML = "";
    nextRoundButtonElement.style.display = "none";

    userAnswerElement.value = "";
    answerHelperElement.innerHTML = "";
    timerElement.textContent = roundDuration.toFixed(1);

    playButtonElement.disabled = false;
    playDivElement.style.display = "inline-block";
    playButtonElement.focus();

    if (roundNumber <= songsAmount) {
        roundCounterElement.textContent = `Round ${roundNumber}/${songsAmount}`
    }
}

function showFinalResults(correctAnswersCount) {
    const finalResultsButtonElement = document.getElementById("back-home-final-results-button");

    resultsElement.textContent = 
        `You guessed ${correctAnswersCount}/${songsAmount} songs correctly!`;
    
    timerElement.style.display = "none";
    playDivElement.style.display = "none";
    finalResultsButtonElement.style.display = "block";
}

function updateAnswerHelper() {
    const userAnswer = userAnswerElement.value.trim().toLowerCase();    
    const results = window.songs.filter((song) => {
        return song.item.name.trim().toLowerCase().includes(userAnswer)
            || song.item.artists.some(artist => artist.name.trim().toLowerCase().includes(userAnswer))
            || song.item.album.name.trim().toLowerCase().includes(userAnswer);
    });
    answerHelperElement.innerHTML = "";

    let resultElements = [];
    results.forEach((song) => {
        const resultItem = document.createElement("button");
        resultItem.type = "button";
        resultItem.className = "answer-helper-item";
        resultItem.textContent = 
            `${song.item.name} - ${song.item.artists.map(artist => artist.name).join(", ")}`;
        resultItem.onclick = () => {
            userAnswerElement.value = song.item.name;
            userAnswerElement.focus();
            updateAnswerHelper();
        };
        resultElements.push(resultItem);
    });
    answerHelperElement.append(...resultElements);
    document.navigationIndex = -1;
    document.navigationItems = resultElements;
}

async function main() {
    window.onSpotifyWebPlaybackSDKReady = () => {
        InitializeSpotifySDK();
    } 
    
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
            userAnswerElement.focus();
        }
    });
    userAnswerElement.addEventListener("input", updateAnswerHelper);
    userAnswerElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            submitAnswerButtonElement.click();
        }
    });

    volumeElement.style.setProperty("--volume-progress", `${settings.volume}%`);
    volumeElement.value = settings.volume;
    volumeElement.addEventListener("input", () => {
        player.setVolume(volumeElement.value / 100);
        volumeElement.style.setProperty("--volume-progress", `${volumeElement.value}%`);
        settings.volume = volumeElement.value;
        storeSettings();
    });

    document.navigationIndex = -1;
    document.navigationItems = [];
    initializeKeyboardNavigation();

    roundCounterElement.textContent = `Round 1/${songsAmount}`;

    let error;
    let isAnswerCorrect;
    let correctAnswersCount = 0;
    let roundNumber = 1;
    let songsCopy = [...window.songs];
    shuffleArray(songsCopy);
    const playSongs = songsCopy.slice(0, songsAmount);

    await playerReady;

    player.setVolume(settings.volume / 100);

    playButtonElement.focus();

    for (const song of playSongs) {
        await sleep(100); // Prevents Enter submissions going straight to next round
        await buttonClick(playButtonElement);
        infoTextElement.textContent = "";
        await playRound(song.item);
        isAnswerCorrect = 
            userAnswerElement.value.trim().toLowerCase() === song.item.name.trim().toLowerCase();
        if (isAnswerCorrect) {
            correctAnswersCount++;
        }
        if (roundNumber === songsAmount) {
            nextRoundButtonElement.textContent = "Show results";
        }
        showRoundResults(isAnswerCorrect, song.item); 
        await sleep(100); // Prevents Enter submissions going past results screen
        await buttonClick(nextRoundButtonElement);
        roundNumber++;
        resetRound(roundNumber);
    };
    showFinalResults(correctAnswersCount);
}

main();