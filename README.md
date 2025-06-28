# eToro Popular Investors List

This repository provides a simple web page that fetches the list of popular investors directly from [eToro Discover People](https://www.etoro.com/discover/people) using client-side JavaScript.

## Usage

Open `index.html` in a browser. The page will attempt to download the HTML of the eToro Discover People page and parse the investor links. The names and links will then appear on the page automatically.

Because this fetch happens from the browser, cross‑origin restrictions may prevent the request from succeeding. If you see a CORS error, you may need to serve the page from a local server or use a CORS proxy.

## Note

An internet connection is required for the investor list to load. If the request to eToro is blocked, the page will display an error message.

## eToro Tools

The repository also includes a tools page `etoro.html` for working with
portfolio data. Paste the JSON response from the eToro API and click
**Process JSON** to view your positions in a table. You can then use the
**Export CSV** button to download the table contents.

### Getting the Portfolio JSON

1. Log in to eToro and open <https://www.etoro.com/portfolio/overview>.
2. Press <kbd>F12</kbd> (or `Ctrl+Shift+I`) to open the Chrome Developer
   Tools and select the **Network** tab.
3. Refresh the page and look for a request to
   `https://www.etoro.com/api/logindata/v1.1/logindata`.
4. Click that entry and switch to the **Response** panel to see the JSON.
5. Copy the JSON response and paste it into the text area on `etoro.html`.
   The tools page is pre-filled with a sanitized example so you can see the
   expected format before pasting your own data.

## Styling

Both pages now use [Bootstrap](https://getbootstrap.com/) and a simple color
palette built around the primary Pine color `#234F1E`. Additional accents use a
lighter pine `#3A6D35` and a golden highlight `#F2AE1C`. The layout should look
cleaner on both desktop and mobile devices.
