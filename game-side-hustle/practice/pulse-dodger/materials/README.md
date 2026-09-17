# Pulse Dodger Submission Materials

This directory stores the reusable CrazyGames submission materials generated for `Pulse Dodger`.

## Files

| Type | Path | Purpose |
| --- | --- | --- |
| Metadata | `metadata.md` | Copy for Developer Portal fields |
| Screenshots | `screenshots/menu.png` | Menu screenshot |
| Screenshots | `screenshots/gameplay.png` | Gameplay screenshot |
| Screenshots | `screenshots/result.png` | Result / end screen screenshot |
| Covers | `covers/landscape-1920x1080.png` | Landscape cover |
| Covers | `covers/portrait-800x1200.png` | Portrait cover |
| Covers | `covers/square-800x800.png` | Square cover |
| Video | `videos/preview.mp4` | 15-20 second landscape preview video |
| Video | `videos/preview-portrait.mp4` | 15-20 second portrait preview video |

## Regenerate

Run from the project root:

```bash
node scripts/generate-submission-materials.mjs
```

The script starts the production preview server, controls local Chrome through CDP, captures screenshots, renders covers, and uses `ffmpeg` to create the landscape and portrait preview videos.

The cover images intentionally contain only the game title. Do not add taglines such as `Play Now`, `New`, or gameplay slogans to cover art.
