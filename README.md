# LeanFlow

An installable weekly workout app for Android and iPhone. Includes 45 real exercise GIFs (15 original exercises plus 30 backups), a seven-day carousel, 66 recovery quotes, muscle-group swaps and device-local saved choices.

## Publish on GitHub Pages

1. Create a repository named `leanflow`. GitHub Free requires a public repository for Pages. The website will be publicly accessible; it contains no account, personal health profile or uploaded personal preferences.
2. Unzip this package. Upload its **contents** to the root of the repository, keeping the `assets` folder intact. The repository root must contain `index.html`, not a folder containing it.
3. Under **Settings → Pages**, select **Deploy from a branch**, then **main** and **/(root)**. Save.
4. Use the actual URL shown by GitHub Pages after publication. Enable **Enforce HTTPS** if shown.
5. Open that HTTPS URL on your phone. Do not open the downloaded HTML from Files.

GitHub Pages can take several minutes to publish. A custom domain is optional. The package works with a repository subpath; it does not require being at the domain root. No npm build, server or database is required.

## Install on Android

Open the published link in Brave or Chrome. Use the app's **Add to home screen** button if an install prompt is available. Otherwise use the browser menu **⋮ → Add to Home screen / Install app**, then confirm.

## Install on iPhone

Open the published link in **Safari**. Tap **Share → Add to Home Screen**, enable **Open as Web App** if shown, then tap **Add**. Launch LeanFlow from its new home-screen icon.

## Save the app offline

Expand **LeanFlow → Install & offline setup**. Tap **Save all 45 demos offline** and keep the page open until it says **Ready offline ✓**. The full catalog is about 49.5 MB; the page HTML is about 34 KB. Demonstrations load on demand during normal online use.

A failed or interrupted download can be retried; already saved GIFs are reused. The app does not claim full offline readiness until all 45 demonstrations are cached. Offline storage is specific to each browser/device, and the OS may remove it under storage pressure. If that happens, reconnect and save the demos again.

## Saved choices and moving to another device

Exercise refresh buttons choose a different exercise from the same muscle group, avoid same-day duplicates, and save the new default. Recovery quotes are shuffled and saved too.

**Export choices** downloads a small `LeanFlow-Choices.json` file. On another device, open **Install & offline setup → Import choices** and choose that file. Imports also accept the earlier **LeanFlow-My-Defaults.html** exported from the standalone version. Choices do not automatically sync across devices or between a local HTML file, different browser, and installed app. Import into the installed app if its choices differ from the browser tab.

The original standalone HTML remains a separate, self-contained offline edition. The files in this package must be kept together when hosted.

## Hosting and updates

All URLs and service-worker scope are relative to the app path. Cache keys are versioned; GIF names include their content hash. When changing app code, update the shell cache version in `sw.js` as part of publishing. Existing cached GIFs are reused across shell updates. Changed GIFs require new hashed filenames and updates to the embedded catalog and `offline-assets.json`.

The website uses no analytics, accounts, API keys, external fonts or runtime image providers. Source URLs for the genuine demonstrations are retained in the embedded catalog as provenance; demonstrating people and their footage belong to the original publishers.

## Validation

JavaScript syntax and local asset/manifest checks pass. Browser preview verifies the installation instructions, exercise swapping, saved selections after reload, square GIF cards and on-demand loading. Service-worker lifecycle tests verify all 45 cached GIFs, project-subpath scope, interrupted-download recovery, repeat-download cache reuse and offline navigation. Actual Android/iPhone installation and real service-worker caching still need a published HTTPS origin; the internal HTTP preview cannot perform that final device check.
