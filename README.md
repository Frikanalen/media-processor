# Media processor

This is the new media processing backend.

It will replace fkupload and fkprocess.

## Development

```bash
cp dev-env .env
# This will expose a redis frontend at http://localhost:8083
docker-compose up -d
yarn run dev

```
