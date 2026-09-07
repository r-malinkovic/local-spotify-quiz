# Local Spotify Quiz

A web based app that allows you to generate music quizes from your Spotify playlists.

## Requirements
- Spotify Premium account
- Python version 3.x

## Setup
**Create a Spotify application (Spotify Premium required)**

1. Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard), login, and click *Create app*.
2. Fill out the necessary fields; in *Redirect URIs* put http://127.0.0.1:5000/quiz and click *add*. Click *Save*.
3. Open the app's basic information page and copy its *Client ID*.

**Install Local Spotify Quiz**

1. Clone this repository and navigate to it.
```bash
git clone https://github.com/r-malinkovic/local-spotify-quiz/

cd local-spotify-quiz
```
2. Make the `.env.example` file into a `.env` file.

Windows:
```cmd
ren .env.example .env
```

Linux/MacOS:
```bash
mv .env.example .env
```

3. Open the `.env` file and paste your Client ID after `CLIENT_ID=`. Make sure the URI in your Spotify developer dashboard matches the one in the `.env` file.

4. Create and activate a virtual environment (optional).

5. Install dependencies.
```bash
python -m pip install -r requirements.txt
```

6. Run the app.
```bash
python app.py
```

7. Open http://127.0.0.1:5000 in your browser.

## Technologies
- HTML, CSS, JavaScript
- Bootstrap
- Python Flask
- Spotify Web API
- Spotify Web Playback SDK
- OAuth 2.0 with PKCE

## Planned updates
- Support for quizes from locally installed playlists
- Android support
- Quiz settings
- Remember me login checkbox

## License
This project is licensed under the MIT license.