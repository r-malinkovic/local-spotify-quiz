# Local Spotify Quiz

A web based app that allows you to generate music quizes from your Spotify playlists. Works on both desktop and android phones.

## Requirements
- Spotify Premium account
- Python version 3.x

## Setup


**Create a Spotify application (Spotify Premium required)**

1. Go to the [Spotify developer dashboard](https://developer.spotify.com/dashboard), login, and click *Create app*.
2. Fill out the necessary fields; in *Redirect URIs* put http://127.0.0.1:5000/quiz and click *add*. Click *Save*.
3. Open the app's basic information page and copy its *Client ID*.

### Windows/Linux/MacOs

**Install Local Spotify Quiz**

1. In your terminal, clone this repository and navigate to it.
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

3. Open the `.env` file and paste your Client ID from the developer dashboard after `CLIENT_ID=`. Make sure the URI in your Spotify developer dashboard matches the one in the `.env` file.

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

### Android

1. Install [Termux](https://play.google.com/store/apps/details?id=com.termux&hl=en).

2. In termux, setup python and git by running:

```bash
pkg update

pkg install python

python -m pip install --upgrade pip

pkg install git
```

3. Clone this repository and navigate to it.
```bash
git clone https://github.com/r-malinkovic/local-spotify-quiz/

cd local-spotify-quiz
```
4. Make the `.env.example` file into a `.env` file.
```bash
mv .env.example .env
```

5. Open the `.env` file and paste your Client ID from the developer dashboard after `CLIENT_ID=`. 
```bash
nano .env  
```
This will open the file in a text editor. Use arrows to navigate. Once you are done make sure the URI in your Spotify developer dashboard matches the one in the `.env` file, then press *CTRL + O* to save the changes and *Enter* on your keyboard to confirm. Exit the editor with *CTRL + X*.

6. Create and activate a virtual environment (optional).

7. Install dependencies.
```bash
python -m pip install -r requirements.txt
```

8. Run the app.
```bash
python app.py
```

9. Open http://127.0.0.1:5000 in your browser.

To run the app next time, open Termux and run the following command:
```bash
python local-spotify-quiz/app.py
```
*If you have created a virtual environment you will need to activate it first.

## Technologies
- HTML, CSS, JavaScript
- Bootstrap
- Python Flask
- Spotify Web API
- Spotify Web Playback SDK
- OAuth 2.0 with PKCE

## Planned updates
- Support for quizes from locally installed playlists
- Remember me login checkbox

## License
This project is licensed under the MIT license.