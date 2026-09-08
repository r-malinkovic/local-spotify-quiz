import { initializeKeyboardNavigation } from "./utils.js";
import { settings, storeSettings } from "./settings.js";

const infoTextElement = document.getElementById("info-text")

function playPlaylist(playlistHref) {
    infoTextElement.textContent = "Loading songs...";
    infoTextElement.style.color = "rgb(255, 255, 255)";

    window.location.href = playlistHref;
}

function openGameSettingsOverlay(playlistName, playlistHref) {
    const overlayElement = document.getElementById("game-settings");
    const playlistNameElement = document.getElementById("playlist-name");
    const roundDurationElement = document.getElementById("round-duration");
    const songsAmountElement = document.getElementById("songs-amount");
    const cancelElement = document.getElementById("overlay-cancel");
    const playElement = document.getElementById("overlay-play");

    playlistNameElement.textContent = playlistName
    roundDurationElement.value = settings.roundDuration;
    songsAmountElement.value = settings.songsAmount;

    cancelElement.addEventListener("click", () => {
        overlayElement.classList.remove("show");
    });

    playElement.addEventListener("click", () => {
        overlayElement.classList.remove("show");

        settings.roundDuration = roundDurationElement.value;
        settings.songsAmount = songsAmountElement.value;
        storeSettings();

        playPlaylist(playlistHref);
    });

    overlayElement.classList.add("show");
    playElement.focus();
}

// enable inline use of the function in jinja for loop
window.openGameSettingsOverlay = openGameSettingsOverlay; 

window.addEventListener("pageshow", () => {
    infoTextElement.textContent = "";
    infoTextElement.style.color = "rgba(255, 255, 255, 0.5)";
});

document.navigationIndex = -1;
document.navigationItems = document.querySelectorAll(".playlist-entry");
initializeKeyboardNavigation()
