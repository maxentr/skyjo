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

If you want to deploy the project to fly.io. You have to be at the root directory, and run the following command:

```bash
sh ./apps/api/script/deploy.sh
```

### Add a new server region

Create the new server region app in fly.io:
```bash
flyctl apps create --name skyjo-online-<REGION_NAME>
```

Then in the fly directory, copy the `fly.XX.toml.template` file to `fly.XX.toml`, XX being the region code, and replace the XX with the region code (e.g. `eu` for Europe).

In the file, replace XX in the app name with the region code, and replace the region code in the `region` field with the region code (https://fly.io/docs/reference/regions/#fly-io-regions).

Next, add the new region in the constant `API_REGIONS` in the file `packages/shared/constants.ts`.

Generate an API token in the fly.io dashboard and add it to the GitHub secrets with the name `FLY_XX_API_TOKEN`, XX being the region code. Finally, add the next code to the `fly.toml` file (replace XX with the region code):

```toml
  deploy-XX:
    name: Deploy XX region 
    runs-on: ubuntu-latest
    concurrency: deploy-us-group
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only --config ./apps/api/fly/fly.XX.toml --dockerfile ./apps/api/Dockerfile
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_XX_API_TOKEN }}
```
