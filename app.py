#!/usr/bin/env python3

import random
from dotenv import load_dotenv
from string import ascii_lowercase, ascii_uppercase, digits
from hashlib import sha256
from base64 import urlsafe_b64encode
from urllib.parse import urlencode
from flask import Flask, render_template, request, redirect, url_for, session
import requests
import os

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
    elif "code" in request.args:
        token_response = requests.post(
            "https://accounts.spotify.com/api/token",
            headers = {"Content-Type": "application/x-www-form-urlencoded"},
            data = {
                "client_id": CLIENT_ID,
                "grant_type": "authorization_code",
                "code": request.args.get("code"),
                "redirect_uri": REDIRECT_URI,
                "code_verifier": session["code_verifier"]
            },
            timeout = 10
        )
        if "error" in token_response.json():
            return redirect(url_for("login", error=token_response.json().get("message", "Unknown error")))
        session["access_token"] = token_response.json().get("access_token")
        session["refresh_token"] = token_response.json().get("refresh_token")

    if not session.get("user_id"):
        user_response = requests.get(
            "https://api.spotify.com/v1/me",
            headers = {"Authorization": "Bearer " + session["access_token"]},
            timeout = 10
        )
        if "error" in user_response.json():
            return redirect(url_for("login", error=user_response.json().get("message", "Unknown error")))
        elif user_response.json().get("product") in ("free", "open"):
            return redirect(url_for("login", error="Spotify free accounts are not supported with Spotify's API"))
        else:
            session["user_id"] = user_response.json().get("id")

    if not user_playlists.get(session["user_id"]):
        playlists_response = requests.get(
            "https://api.spotify.com/v1/me/playlists",
            headers = {"Authorization": "Bearer " + session["access_token"]},
            timeout = 10
        )
        if "error" in playlists_response.json():
            return redirect(url_for("login", error=playlists_response.json().get("message", "Unknown error")))
        
        availible_playlists = playlists_response.json().copy()
        # get more filters for which playlists are actually playable
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
    offset = 0
    songs = []
    while True:
        songs_json = requests.get(
            f"https://api.spotify.com/v1/playlists/{playlist_id}/items?offset={offset}&limit=100",
            headers = {"Authorization": "Bearer " + session["access_token"]},
            timeout = 10
        ).json()

        if "error" in songs_json:
            return redirect(url_for("login", error=songs_json.get("message", "Unknown error")))

        songs.extend(
            song
            for song in songs_json.get("items", [])
            if song.get("item") is not None
            and not song.get("is_local")
        )
        
        if not songs_json.get("next"):
            break
        offset += songs_json.get("limit", 0)

    return render_template("play.html", playlist_id=playlist_id, songs=songs)


@app.route("/", methods=["GET"])
def index():
    return redirect(url_for("login"))

if __name__ == "__main__":
    app.run(debug=True)