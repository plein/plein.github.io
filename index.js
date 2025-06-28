// JavaScript for index.html

// Wait for DOM to load before fetching the investor list
window.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('investor-list');
    fetch('https://www.etoro.com/discover/people')
        .then(resp => resp.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const links = doc.querySelectorAll('a[href^="/people/"]');
            const seen = new Set();
            const ul = document.createElement('ul');
            ul.className = 'list-group';
            links.forEach(a => {
                const name = a.textContent.trim();
                const href = a.getAttribute('href');
                if (!name || !href || seen.has(href)) return;
                seen.add(href);
                const li = document.createElement('li');
                li.className = 'list-group-item';
                const link = document.createElement('a');
                link.className = 'link-primary text-decoration-none';
                link.href = 'https://www.etoro.com' + href;
                link.textContent = name;
                li.appendChild(link);
                ul.appendChild(li);
            });
            container.appendChild(ul);
        })
        .catch(err => {
            container.textContent = 'Failed to load investor list: ' + err;
        });
});
