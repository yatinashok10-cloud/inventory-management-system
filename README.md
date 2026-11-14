# Stockroom

Live site: https://yinventorymanagement.netlify.app/
<img width="1920" height="999" alt="Screenshot 2026-11-13 224613" src="https://github.com/user-attachments/assets/80f051cb-2939-4e3b-b5d8-7ec0820c019d" />


A small inventory tracker for people with too much stuff and no good way to count it. Add items, change the numbers when things sell, and see what is running low. It is plain HTML, CSS and JavaScript. No frameworks, no build step, nothing to install.

## What it does

- Add, edit and delete items (name, SKU, category, quantity, price)
- Quick +1 and -1 buttons for when something sells or arrives
- Search box and an "only show low stock" filter
- Totals at the top: number of items, units in stock, stock value, and how many are running low
- Warns you when an item drops to its "warn me at" number
- Privacy policy, terms of use, a cookie banner and a custom 404 page

## How to run it

Easiest way: open `index.html` in your browser.

If you use VS Code, right click `index.html` and pick "Open with Live Server". Two things to know about that:

1. The page has a Content Security Policy in a `<meta>` tag, and it blocks the little script Live Server injects. So auto reload will not work and the console will complain. While you are working on the site, comment out that one `<meta http-equiv="Content-Security-Policy"...>` line in `index.html`. Put it back before you upload anything.
2. Live Server uses the same address (127.0.0.1:5500) for every project, so your browser can show an old favicon from a different project. Hard refresh with Ctrl+Shift+R or try a private window.

## Where your data lives

Everything is saved in your browser using local storage. Nothing is sent to a server, because there is no server. That also means:

- If you clear your browser data, your items are gone.
- Your items will not show up on another device or in another browser.
- A private window starts empty every time.

If you need a real shared inventory with logins, this is not it yet. That would need a backend and a database.

## What is in the folder

| File | What it is |
| --- | --- |
| `index.html` | The main page and the app |
| `app.js` | All the logic: saving, validation, search, the cookie banner |
| `style.css` | Styles for every page |
| `privacy.html`, `terms.html` | Legal pages |
| `404.html` | Shown when someone opens a page that does not exist |
| `_headers` | Security headers for Netlify and Cloudflare Pages |
| `robots.txt`, `sitemap.xml` | For search engines |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Tab and home screen icons |
| `preview.png` | The image people see when the link is shared |

## Security notes

This is a front-end only site, so the security story is simple but limited.

What it does:

- Item names and other text are only ever put on the page as plain text, never as HTML, so someone cannot sneak in code through the form.
- Every field is checked and cut to a sensible length before it is saved.
- Saved data is checked again when it loads, because anyone can edit local storage by hand.
- A hidden form field catches simple spam bots.
- A Content Security Policy plus other headers (HSTS, no framing, no content sniffing) are set in `_headers`.
- No API keys, no passwords, no database and no third party scripts.

What it cannot do without a server: real logins, different permissions for different users, rate limiting, password hashing, and database security. Those need a backend.

Your host has to force HTTPS. Netlify, Cloudflare Pages, Vercel and GitHub Pages all have a switch for it.

## Analytics

None is set up.

## Ideas for later

- Export and import as CSV so people can back up their data
- A login and a real database
- Photos for each item
- Low stock emails

## Contact

Questions or bugs: yatinashok10@gmail.com

The privacy policy and terms are basic templates, not legal advice.
