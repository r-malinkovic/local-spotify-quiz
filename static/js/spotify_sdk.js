export let player;

export function InitializeSpotifySDK() {
    player = new Spotify.Player({
        name: 'Spotify Quiz Playback SDK',
        getOAuthToken: cb => { cb(window.token); },
        volume: 0.6
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        window.device_id = device_id;
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
    });

    player.connect()
}