# Skyjo API

This is the API for the Skyjo game project. It is built with [Hono](https://hono.dev/) and [socket.io](https://socket.io/). The API is responsible for managing the game state and handling the communication between the different clients.

## Development

To start the development environment, you can run the following commands:

### Install dependencies

```bash
pnpm install
```

### Start the API

```bash
pnpm dev --filter api
```

### Build the project

```bash
pnpm build --filter api
```

### Deploy the project

This project is deployed with a github action each time a tag with the format `vX.Y.Z` is pushed.
