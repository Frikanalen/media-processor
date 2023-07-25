# Media processor

This is the media processing service for Frikanalen.

* The server receives file uploads over tus, using its own implementation in order to be able to pass data back to the user.

* Once a file has been uploaded, it is probed using ffmpeg.

* A fully received file is probed for metadata and evaluated for technical acceptance criteria before the final upload PATCH call returns.

* If the file fails to meet these criteria, or probing is not possible, media-processor will return 400 to the client.

* If the file is found acceptable, it is copied to an S3 bucket and the backend is notified using internal APIs.

## Environment variables

See `./dev-env` for an annotated list of environment variables.

## TODO

- Create functioning mock environment for testing
- Progress report endpoints so end-users can see the state of their videos

## Development environment

[`./dev-env`](./dev-env) contains

```bash
# Copy development environment variables
# (assumes you are running toches on localhost:8080)
cp dev-env .env
# This will expose a connection frontend at http://localhost:8081.
docker-compose up -d
yarn run dev
```
