# Media processor

This is the new media processing backend.

It will replace fkupload and fkprocess.

The server receives file uploads over tus.

Once a file has been uploaded, it is probed using ffmpeg.
If the file is not possible to probe or does not contain at least one media stream, it will return 400.
If the file is found acceptable, it is stored on the configured S3 backend.
An entry is then created in the database using the Frikanalen API.

## Environment variables

```dotenv
# Internal API key
FK_API_KEY=1234
# Location of Frikanalen API
FK_API=http://localhost:8080
# AWS settings (these are s3-ninja defaults)
BUCKET_HOST=localhost
BUCKET_PORT=9000
AWS_REGION=no-where-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Location of redis backend
url=redis://localhost:6379
```

## TODO

- Create functioning mock environment for testing
- Progress report endpoints so end-users can see the state of their videos

## Development

```bash
cp dev-env .env
# This will expose a redis frontend at http://localhost:8083
docker-compose up -d
yarn run dev

```
