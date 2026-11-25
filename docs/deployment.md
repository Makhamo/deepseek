# Deployment

> **Status:** the GitHub Actions workflows are not in the repository yet. This
> guide describes the setup they will automate — add `.github/workflows/` before
> following the branch-based steps below.

Two environments run side by side on one VPS. Each is a separate Docker Compose
project with its own containers, network, volumes and host port, so staging
cannot touch production data.

| Branch  | Environment | Compose project  | Host port |
| ------- | ----------- | ---------------- | --------- |
| `main`  | production  | `uhs-production` | 3000      |
| `stage` | staging     | `uhs-staging`    | 3100      |

The `stage` branch does not exist yet. Create it when you are ready; the deploy
workflow maps it to staging once you add it:

```bash
git checkout main
git checkout -b stage
git push -u origin stage
```

Use the exact name `stage` (the workflow also accepts `Stage`).

You can also deploy manually from the Actions tab (`workflow_dispatch`) and
choose the environment, which works before the branch exists.

## What CI does

`ci.yml` runs install, lint, typecheck, tests and build on `main`, `stage` and
every pull request, so both branches are held to the same standard.

`deploy.yml`:

1. resolves the environment from the branch (`main` → production, otherwise staging);
2. builds and pushes one image per workspace to GHCR, tagged with both the short
   commit SHA and the environment name;
3. copies `infra/deploy/docker-compose.yml` and `infra/postgres/init/` to the VPS;
4. pulls, starts Postgres/Redis/RabbitMQ, runs each service's migrations with the
   owner role, then restarts the stack;
5. fails the job if any step fails, leaving the previous containers running.

## VPS prerequisites

- Docker Engine with the Compose v2 plugin
- A deploy user with access to `docker`
- A deployment directory, for example `/srv/uhs`, owned by that user
- A checkout is **not** needed: CI uploads the compose file and init scripts

The VPS directory ends up like this:

```
/srv/uhs/
  staging/
    docker-compose.yml
    postgres-init/
    .env.staging        <- you create this, never committed
  production/
    docker-compose.yml
    postgres-init/
    .env.production     <- you create this, never committed
```

## GitHub configuration

Secrets (repository or, preferably, per environment):

| Secret            | Purpose                         |
| ----------------- | ------------------------------- |
| `VPS_HOST`        | hostname or IP of the VPS       |
| `VPS_USER`        | deploy user                     |
| `VPS_SSH_KEY`     | private key for that user       |
| `VPS_DEPLOY_PATH` | base directory, e.g. `/srv/uhs` |

Create the `staging` and `production` environments in **Settings → Environments**
so each can hold its own `VPS_*` secrets and (optionally) require approval for
production.

The workflow pushes to GHCR with the built-in `GITHUB_TOKEN`. If the packages are
private, the VPS must be authenticated once:

```bash
echo "$GHCR_PAT" | docker login ghcr.io -u <github-user> --password-stdin
```

Alternatively make the packages public.

## First deployment

1. On the VPS, create `staging/` and `production/` under the deploy path.
2. Copy the matching example and fill in real values:
   ```bash
   cp infra/deploy/.env.staging.example /srv/uhs/staging/.env.staging
   cp infra/deploy/.env.production.example /srv/uhs/production/.env.production
   ```
   Set strong `POSTGRES_*` and `RABBITMQ_*` passwords, a long
   `BETTER_AUTH_SECRET`, and the public `AUTH_ISSUER` / `CORS_ORIGINS` for that
   environment. `IMAGE_TAG` is injected by CI.
3. Push to `stage` (or run the workflow manually with `staging`) and check
   `docker compose -p uhs-staging ps`.
4. Put a reverse proxy (Caddy, Nginx, Traefik) in front of `WEB_HOST_PORT` for
   TLS. Only the web container publishes a host port; every service port is
   reachable inside the Compose network only.

`AUTH_JWKS_URL` is set to `http://auth:4001/api/auth/jwks` inside the stack. The
browser never talks to a service directly: once the login flow exists, the web
app proxies `/api/auth/*` to auth.

## Role passwords

The Postgres bootstrap creates `uhs_app` and `uhs_migrator`. The database URLs in
compose read the passwords from `.env.<environment>`. If you change them after
the volume exists, update the role as well:

```sql
ALTER ROLE uhs_app PASSWORD '...';
ALTER ROLE uhs_migrator PASSWORD '...';
```

## Operating

```bash
# logs for one service
docker compose -p uhs-staging --env-file .env.staging logs -f doctor

# restart after an image change (CI normally does this)
docker compose -p uhs-staging --env-file .env.staging up -d

# stop a stack without deleting data
docker compose -p uhs-staging --env-file .env.staging down
```

Volumes are named per project (`uhs-staging_postgres-data`), so `down` never
touches the other environment. `down -v` deletes data and is never run by CI.
