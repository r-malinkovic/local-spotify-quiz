import {InitializeSpotifySDK, player, playSong} from "./spotify.js";
import {shuffleArray, sleep, buttonClick, initializeKeyboardNavigation} from "./utils.js";

// let user choose these in later update
const roundDuration = 20; 
const songsAmount = 10;

const timerElement = document.getElementById("timer");
const playButtonElement = document.getElementById("play-button");
const userAnswerElement = document.getElementById("user-answer");
const submitAnswerButtonElement = document.getElementById("submit-answer");
const answerHelperElement = document.getElementById("answer-helper");
const resultsOverlayElement = document.getElementById("results-overlay");
const resultsElement = document.getElementById("round-results");
const nextRoundButtonElement = document.getElementById("next-round");

function startVisualCountdown(duration) {
    return setInterval(() => {
        if (duration > 0) {
            duration--;
            timerElement.textContent = duration;
        } else {
            timerElement.textContent = 0; 
            }
        }, 1000);
}

async function playRound(songItem) {
    playButtonElement.disabled = true;
    userAnswerElement.disabled = false;
    const seekPos = Math.floor(Math.random() * (songItem.duration_ms - (roundDuration * 1000)));
    if (seekPos < 0) {
        seekPos = 0; // case where song is shorter than round duration
    }

    await playSong(songItem.uri, seekPos)

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
    songInfoElement.appendChild(albumImageElement);

    resultsOverlayElement.style.display = "block";
    nextRoundButtonElement.focus();
}

function resetRound() {
    resultsOverlayElement.style.display = "none";
    resultsElement.innerHTML = "";
    userAnswerElement.value = "";
    answerHelperElement.innerHTML = "";
    timerElement.textContent = roundDuration;
    playButtonElement.disabled = false;
    playButtonElement.focus();
}

function showFinalResults(correctAnswersCount) {
    const finalResultsMessageElement = document.getElementById("final-results-message");
    const finalResultsOverlayElement = document.getElementById("final-results-overlay");
    finalResultsMessageElement.textContent = 
        `You guessed ${correctAnswersCount}/${songsAmount} songs correctly!`;
    finalResultsOverlayElement.style.display = "block";
    nextRoundButtonElement.style.display = "none";
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

    document.navigationIndex = -1;
    document.navigationItems = [];
    initializeKeyboardNavigation();

    let isAnswerCorrect;
    let correctAnswersCount = 0;
    let roundNumber = 1;
    let songsCopy = [...window.songs];
    shuffleArray(songsCopy);
    const playSongs = songsCopy.slice(0, songsAmount);

    for (const song of playSongs) {
        await buttonClick(playButtonElement);
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
        await sleep(100); // Prevents Enter submissions going straight to next round
        await buttonClick(nextRoundButtonElement);
        resetRound();
        roundNumber++;
    };
    showFinalResults(correctAnswersCount);
}

main();