# Deployment

## GitHub Pages frontend

The React + Vite frontend lives in `frontend/`. Its npm lockfile is `frontend/package-lock.json`, the production command is `npm run build`, and the output is `frontend/dist/`. Vite builds the app for the repository path `/Veytrix/`, matching <https://syedraqi.github.io/Veytrix/>.

The workflow at `.github/workflows/deploy.yml` deploys the frontend after pushes to `main` and supports manual runs through **Actions -> Deploy VEYTRIX to GitHub Pages -> Run workflow**. In repository **Settings -> Pages**, choose **GitHub Actions** as the build and deployment source. The workflow needs no deployment secret.

All frontend public asset URLs use Vite's `BASE_URL`, including images, the GLB model, logos and icons. Navigation uses URL fragments (`/#studio`, `/#simulation`, etc.), so refreshing a page does not require server-side SPA rewrite support.

### Optional API connection

GitHub Pages hosts static files only. The Flask API in `backend/` must be deployed separately to a public HTTPS-capable host. Configure the API deployment with the correct `FRONTEND_ORIGIN` (the Pages origin is `https://syedraqi.github.io`) and any backend-only credentials as that host's private environment variables.

To connect the frontend, add a GitHub Actions **repository variable** named `VITE_API_BASE_URL` with the public API root ending in `/api/v1` (for example, `https://api.example.com/api/v1`). This value is public and is compiled into the browser bundle. Never put passwords, service-role keys, signing keys or other secrets in a `VITE_` variable, a workflow value or the frontend source. If the variable is absent, API-backed actions report that the backend URL is not configured; local frontend features remain browser-local.

The local development example `frontend/.env.example` points to `http://localhost:5000/api/v1`; it is not a production endpoint. Backend settings belong in the separately hosted API environment.

## Local production preview

From `frontend/`:

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1
```

Open the preview under `/Veytrix/` (normally `http://127.0.0.1:4173/Veytrix/`) to check the same base path used in production.
