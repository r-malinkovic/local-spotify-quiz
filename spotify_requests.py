from requests import get, post

def token(client_id, code, redirect_uri, code_verifier):
    return post(
        "https://accounts.spotify.com/api/token",
        headers = {"Content-Type": "application/x-www-form-urlencoded"},
        data = {
            "client_id": client_id,
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "code_verifier": code_verifier
        },
        timeout = 10
    ).json()

def user(access_token):
    return get(
        "https://api.spotify.com/v1/me",
        headers = {"Authorization": "Bearer " + access_token},
        timeout = 10
    ).json()

def user_playlists(access_token):
    return get(
        "https://api.spotify.com/v1/me/playlists",
        headers = {"Authorization": "Bearer " + access_token},
        timeout = 10
    ).json()

def songs(access_token, playlist_id):
    offset = 0
    songs = {}
    while True:
        songs_response = get(
            f"https://api.spotify.com/v1/playlists/{playlist_id}/items?offset={offset}&limit=100",
            headers = {"Authorization": "Bearer " + access_token},
            timeout = 10
        ).json()

        if "error" in songs_response:
            return songs_response

        try:
            songs["items"].extend(songs_response.get("items", []))
        except KeyError:
            songs = songs_response

        if not songs_response.get("next"):
            break

        offset += songs.get("limit", 0)

    return songs
