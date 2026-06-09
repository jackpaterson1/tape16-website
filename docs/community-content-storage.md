# TAPE 16 Community Content Storage

Community themes and future mods use Cloudflare:

- D1 stores public item metadata, download counts, recent download events, and private uploader email addresses.
- R2 stores uploaded ZIP packages and preview images.
- The Worker exposes `/themes`, `/submit-theme`, `/themes/:slug/download`, and `/themes/:slug/preview`.

Uploader email addresses are stored in D1 for owner/contact use, but they are not returned by public API responses.

## Current D1 Database

```toml
[[d1_databases]]
binding = "COMMUNITY_DB"
database_name = "tape16-community"
database_id = "c13b2792-5c32-42a3-9399-233ae1c95a3b"
```

Migration applied:

```sh
/opt/homebrew/bin/wrangler d1 migrations apply tape16-community --remote
```

Applied migrations:

- `0001_community_content.sql`
- `0002_community_downloads.sql`

## R2 Bucket

R2 must be enabled in the Cloudflare dashboard before the bucket can be created. Once enabled, run:

```sh
/opt/homebrew/bin/wrangler r2 bucket create tape16-community
```

Then uncomment this binding in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "COMMUNITY_BUCKET"
bucket_name = "tape16-community"
```

After that, deploy the Worker:

```sh
/opt/homebrew/bin/wrangler deploy
```
