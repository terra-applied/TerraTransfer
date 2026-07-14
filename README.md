# TerraTransfer — Project Page

Project website for **TerraTransfer: Learning End-to-End Driving Policies Without Expert Demonstrations**.

Live at: https://zikang-xiong-ai.github.io/terratransfer

Styled with the Applied Intuition brand design system, consistent with the
[TerraZero](https://terra-applied.github.io/TerraZero/) project page.

## Structure

```
index.html               # single-page site
assets/css/styles.css    # design system (Applied Intuition brand)
assets/js/main.js        # nav, scroll-spy, scroll-reveal, BibTeX copy
assets/fonts/            # Applied Sans + XCharter (vendored)
assets/brand/            # favicons + brand icon
assets/figures/          # pipeline + SVD-spectrum figures
assets/videos/           # teaser + closed-loop rollout clips
serve.py                 # local preview server (127.0.0.1:8138)
```

## Preview locally

```sh
python serve.py        # or: uv run serve.py
```

Then open http://127.0.0.1:8138. The server disables caching, so edits show on
reload. Override the port with `--port`.

## Editing

The page is static HTML — no build step. Edit `index.html` and push to `main`;
GitHub Pages serves it automatically.

The page carries real content: the two-phase pipeline and SVD-spectrum figures,
the HUGSim closed-loop results table, the demo teaser, and the closed-loop
rollout videos. The code link is greyed out until release.

## Credit

Design system shared with the [TerraZero project page](https://terra-applied.github.io/TerraZero/)
(Applied Intuition brand).
