# eToro Popular Investors List

This repository provides a simple web page that fetches the list of popular investors directly from [eToro Discover People](https://www.etoro.com/discover/people) using client-side JavaScript.

## Usage

Open `index.html` in a browser. The page will attempt to download the HTML of the eToro Discover People page and parse the investor links. The names and links will then appear on the page automatically.

Because this fetch happens from the browser, cross‑origin restrictions may prevent the request from succeeding. If you see a CORS error, you may need to serve the page from a local server or use a CORS proxy.

## Note

An internet connection is required for the investor list to load. If the request to eToro is blocked, the page will display an error message.

## eToro Tools

The repository also includes a placeholder page `etoro.html` for future tools.
Planned features include importing a profile from JSON and exporting data to CSV.
