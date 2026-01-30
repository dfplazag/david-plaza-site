# Putting this website online (free/cheap) + making it searchable

This site is a static website (HTML/CSS/JS). That means you can host it for free on several reliable services. The easiest options are **GitHub Pages**, **Netlify**, and **Cloudflare Pages**.

## Option A — GitHub Pages (free)
1. Create a new GitHub repository (public is simplest for indexing).
2. Upload the contents of this folder (the `index.html` must be in the repo root).
3. In the repository settings, enable **Pages** and choose the branch (usually `main`) and the root folder.
4. GitHub will give you a URL like `https://USERNAME.github.io/REPO/`.

## Option B — Netlify (free)
1. Create a Netlify account and choose “Add new site”.
2. Drag-and-drop the site folder (or connect a GitHub repo).
3. Netlify deploys it instantly and gives you a URL like `https://something.netlify.app`.

## Option C — Cloudflare Pages (free)
1. Create a Cloudflare account and choose “Pages”.
2. Connect the GitHub repo (or upload).
3. Deploy and get a URL like `https://something.pages.dev`.

## Getting indexed by Google
Once the site is publicly accessible:
- Make sure the site is **not blocked** by `robots.txt` (this repo allows indexing by default).
- Update `sitemap.xml` by replacing `https://YOUR-DOMAIN-HERE/` with your real URL.
- Add the site in **Google Search Console**, verify ownership, and submit the sitemap.
- Indexing can still take time, but Search Console is the most reliable way to speed it up.

Tip: If you buy a domain later, all three platforms above support custom domains with HTTPS.
