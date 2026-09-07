#!/usr/bin/env python3

import random
from dotenv import load_dotenv
from string import ascii_lowercase, ascii_uppercase, digits
from hashlib import sha256
from base64 import urlsafe_b64encode
from urllib.parse import urlencode
from flask import Flask, render_template, request, redirect, url_for, session
import os

import spotify_requests

load_dotenv()

app = Flask("Local Spotify Quiz", template_folder="templates", static_folder="static")
app.secret_key = "awesome spotify quiz secret key"
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPE = " ".join([
    "user-read-private",
    "user-read-email",
    "playlist-read-collaborative",
    "playlist-read-private",
    "user-modify-playback-state",
    "streaming",
    "user-read-playback-state",
    "user-read-currently-playing", 
])

user_playlists = {}

@app.route("/login", methods=["GET"])
def login():
    def generate_random_string(length):
        characters = ascii_lowercase + ascii_uppercase + digits
        return "".join(random.choice(characters) for _ in range(length))

    session["code_verifier"] = generate_random_string(64)
    sha_code = sha256(session["code_verifier"].encode()).digest()
    session["code_challenge"] = urlsafe_b64encode(sha_code).decode().rstrip("=")
    params =  {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "scope": SCOPE,
        "code_challenge_method": "S256",
        "code_challenge": session["code_challenge"],
        "redirect_uri": REDIRECT_URI
    }

    spotify_login_url = "https://accounts.spotify.com/authorize?" + urlencode(params)
    return render_template("login.html", spotifyLoginUrl=spotify_login_url)


@app.route("/quiz", methods=["GET"])
def quiz():
    if "code" not in request.args and not user_playlists:
        return redirect(url_for("login", error=request.args.get("message", "Unknown error")))
    
    if "code" in request.args and not user_playlists.get(session.get("user_id")):
        token_response = spotify_requests.token(
            client_id=CLIENT_ID, 
            code=request.args.get("code"),
            redirect_uri=REDIRECT_URI,
            code_verifier=session["code_verifier"]
        )

        if "error" in token_response:
            return redirect(url_for("login", error=token_response).get("message", "Unknown error"))
        
        session["access_token"] = token_response.get("access_token")
        session["refresh_token"] = token_response.get("refresh_token")

        if not session.get("user_id"):
            user_response = spotify_requests.user(session["access_token"])

            if "error" in user_response:
                return redirect(url_for("login", error=user_response.get("message", "Unknown error")))
            elif user_response.get("product") in ("free", "open"):
                return redirect(url_for("login", error="Spotify free accounts are not supported with Spotify's API"))
            else:
                session["user_id"] = user_response.get("id")
        
        playlists_response = spotify_requests.user_playlists(session["access_token"])

        if "error" in playlists_response:
            return redirect(url_for("login", error=playlists_response.get("message", "Unknown error")))
        
        availible_playlists = playlists_response.copy()
        availible_playlists["items"] = [
            playlist
            for playlist in availible_playlists.get("items", [])
            if  playlist.get("items", {}).get("total", 0) > 0
            and playlist.get("owner", {}).get("id") == session["user_id"]
        ]
        
        user_playlists[session["user_id"]] = {"all_playlists": availible_playlists.copy()}
        user_playlists[session["user_id"]]["playlist_previews"] = sorted([
            {
                "id": playlist["id"],
                "name": playlist["name"],
                "images": playlist.get("images", []),
                "songs": playlist.get("items", {}).get("total", 0)
            }
            for playlist in user_playlists[session["user_id"]]["all_playlists"]["items"]
        ], key=lambda x: x.get("songs", 0), reverse=True)

    return render_template(
        "quiz.html", 
        playlist_previews=user_playlists[session["user_id"]]["playlist_previews"]
    )


@app.route("/quiz/play/<playlist_id>", methods=["GET"])
def play(playlist_id):

    songs_response = spotify_requests.songs(session["access_token"], playlist_id)

    if "error" in songs_response:
        return redirect(url_for("quiz", error=songs_response.get("message", "Unknown error")))

    songs = []
    for song in songs_response.get("items", []):
        try:
            if song.get("item", {}).get("uri") is None:
                continue
            if not song.get("item", {}).get("is_playable", False) or song.get("is_local"):
                continue
            songs.append(song)
        except AttributeError:     # catches song["item"] is None
            continue

    return render_template(
        "play.html", 
        playlist_id=playlist_id,
        songs=songs,
        songs_total=songs_response.get("total", 0)
    )


@app.route("/", methods=["GET"])
def index():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=False)
