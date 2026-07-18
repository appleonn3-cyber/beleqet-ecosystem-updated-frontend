#!/usr/bin/env bash
# =============================================================================
# verify-compose.sh — render every Compose file with synthetic values
#
# Fails when any Compose file is syntactically invalid or when
# docker-compose.staging.yml renders despite a missing required variable
# (its ${VAR:?} guards are part of the deployment safety contract).
# =============================================================================
set -Eeuo pipefail

log() { printf '[verify-compose] %s\n' "$*"; }

command -v docker >/dev/null 2>&1 || {
  log "ERROR: docker is required"
  exit 1
}

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

# ── Development compose files (self-contained defaults) ──────────────────────
log "rendering docker-compose.yml"
docker compose -f docker-compose.yml config >/dev/null

log "rendering docker-compose.yml + load-balancer overlay"
docker compose -f docker-compose.yml -f docker-compose.load-balancer.yml config >/dev/null

# ── Staging compose: must render with a complete synthetic environment ───────
staging_env="$workdir/env.staging"
cat >"$staging_env" <<'EOF'
STAGING_DB_USER=synthetic_user
STAGING_DB_PASSWORD=synthetic_password
STAGING_DB_NAME=synthetic_db
STAGING_FRONTEND_URLS=http://localhost:3000,http://localhost:3001
STAGING_APP_BASE_URL=http://localhost:4000
JWT_ACCESS_SECRET=synthetic_jwt_secret
SESSION_SECRET=synthetic_session_secret
TOTP_ENCRYPTION_KEY=synthetic_totp_key
TOTP_TEMP_SECRET=synthetic_totp_temp
EOF
images_env="$workdir/env.images"
cat >"$images_env" <<'EOF'
BACKEND_IMAGE=ghcr.io/example/beleqet-backend:0000000000000000000000000000000000000000
ADMIN_IMAGE=ghcr.io/example/beleqet-admin-frontend:0000000000000000000000000000000000000000
JOBS_IMAGE=ghcr.io/example/beleqet-jobs-frontend:0000000000000000000000000000000000000000
EOF

log "rendering docker-compose.staging.yml with full synthetic env"
docker compose --env-file "$staging_env" --env-file "$images_env" \
  -f docker-compose.staging.yml config >/dev/null

# ── Staging compose: must REFUSE to render without required variables ────────
log "verifying staging compose rejects a missing required variable"
if docker compose --env-file "$images_env" \
  -f docker-compose.staging.yml config >/dev/null 2>&1; then
  log "ERROR: staging compose rendered without its required variables"
  exit 1
fi

log "all compose files verified"
