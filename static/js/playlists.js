import { initializeKeyboardNavigation } from "./utils.js";

const infoTextElement = document.getElementById("info-text")

function playPlaylist(playlistHref) {
    infoTextElement.textContent = "Loading songs..."
    infoTextElement.style.color = "rgb(255, 255, 255)";

    window.location.href = playlistHref
}

window.playPlaylist = playPlaylist; // enable inline use of the function in jinja for loop

window.addEventListener("pageshow", () => {
    infoTextElement.textContent = "";
    infoTextElement.style.color = "rgba(255, 255, 255, 0.5)";
});

document.navigationIndex = -1;
document.navigationItems = document.querySelectorAll(".playlist-entry");
initializeKeyboardNavigation()

