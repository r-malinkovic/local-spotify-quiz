export let settings = {
    roundDuration: 20.0, // seconds
    songsAmount: 10,
    volume: 60
}

const savedSettings = localStorage.getItem("gameSettings");
if (savedSettings) {
    try {
        settings = JSON.parse(savedSettings);
    } catch (error) {
        localStorage.removeItem("gameSettings");
        window.location.href = "/quiz?error=" + encodeURIComponent("Saved settings were invalid.");
    }
}

export function storeSettings() {
    localStorage.setItem("gameSettings", JSON.stringify({
        roundDuration: Number(settings.roundDuration),
        songsAmount: Number(settings.songsAmount),
        volume: Number(settings.volume)
    }));
}