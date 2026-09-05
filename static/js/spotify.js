export let player;
let playerReadyResolve;
let playerReadyReject;

export const playerReady = new Promise((resolve, reject) => {
    playerReadyResolve = resolve;
    playerReadyReject = reject;
});

export function InitializeSpotifySDK() {
    player = new Spotify.Player({
        name: 'Spotify Quiz Playback SDK',
        getOAuthToken: cb => { cb(window.token); },
        volume: 0.6
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        window.device_id = device_id;
        playerReadyResolve(player);
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    player.addListener('initialization_error', ({ message }) => {
        console.error(message);
        playerReadyReject(new Error(message));
    });

    player.addListener('authentication_error', ({ message }) => {
        console.error(message);
        playerReadyReject(new Error(message));
    });

    player.addListener('account_error', ({ message }) => {
        console.error(message);
        playerReadyReject(new Error(message));
    });

    player.connect()
}

export function playSong(songUri, seekPosition) {
    return fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${window.device_id}`,
        {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${window.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "uris": [songUri],
                "position_ms": seekPosition
            })
        }
    )
}
