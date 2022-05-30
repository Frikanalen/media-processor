# Media processor

This is the new media processing backend.

It will replace fkupload and fkprocess.

The server receives file uploads over tus.

Once a file has been uploaded, it is probed using ffmpeg. If the file is found acceptable, it is stored on the configured S3 backend, and an entry in the database is created using the Frikanalen API.

## Development

```bash
cp dev-env .env
# This will expose a redis frontend at http://localhost:8083
docker-compose up -d
yarn run dev

```
