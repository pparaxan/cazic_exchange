import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
  <head>
    <title>Cazic</title>
    <meta name="darkreader-lock" />
    <style>
      html, body {
        height: 100%;
        margin: 0;
        font-family: Arial, sans-serif;
        color: white;
      }

      body {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .bg {
        position: fixed;
        inset: 0;
        z-index: -1;
      }

      section {
        max-width: 720px;
        padding: 24px;
        text-align: center;
      }

      a {
        color: white;
      }

      hr {
        border: 0;
        height: 1px;
        background: rgba(255,255,255,0.25);
        margin: 18px 0;
      }

      a {
        color: mediumpurple;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="bg">
      <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
        <defs>
          <linearGradient id="xanGradient" x1="59%" y1="0%" x2="41%" y2="100%">
            <stop offset="0%" stop-color="#cdb4db"/>
            <stop offset="100%" stop-color="#ffafcc"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#xanGradient)"/>
      </svg>
    </div>

    <section>
      <h2>Continue in Cazic to start playing your SoundCloud & local songs!</h2>
      <p>If you haven't install the Free and Open Source Music player—Cazic yet,
      you can download it <a href="https://codeberg.org/pparaxan/Cazic">here!</a>.
      </p>
    </section>
  </body>
</html>`);
}
