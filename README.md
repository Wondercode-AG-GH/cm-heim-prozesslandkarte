# Prozesslandkarte C.M. Heim

Static site (single `site/index.html`) deployed on Vercel.

## CI/CD
- **Push to `main`** → Vercel production deployment.
- **Pull request** → Vercel preview deployment with its own URL, posted on the PR.
- **GitHub Actions `Check`** runs on every push/PR: verifies the page is complete and all inline scripts parse.

## Notes
- The page is served read-only on Vercel. Shared status changes, decisions and the change log live in the Claude artifact's database and are not available here.
- `noindex` headers and `robots.txt` keep search engines out; the URL is open to anyone who has it.

## Local preview
```
npx serve site
```
