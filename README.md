# Exchange

Serverless utility used for SoundCloud login in the [Cazic](https://codeberg.org/pparaxan/cazic) music player.

---

SoundCloud currently requires `client_secret` for exchanging authorization codes. And because Cazic can't keep secrets in-binary, CazicExchange acts as a broker.
