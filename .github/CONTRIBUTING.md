# Drive Chart | Contributing

## Packages

The repo is organized into TypeScript packages which share code and are managed via
[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

The packages are:

- `/shared` - Common types, libraries, icons, etc. shared across all packages, client and server
- `/sharedClient` - Common code shared across client-side packages
- `/pwa` - Progressive Web App, for web, desktop, and mobile

## Initial setup

1.  Clone the repo:

    ```bash
    $ git clone git@github.com:jwngr/drivechart.git
    $ cd drivechart
    ```

1.  Install [Yarn v4](https://yarnpkg.com/getting-started/install). Yarn workspaces are used to
    share code across several packages:

    ```bash
    $ corepack enable
    # If above fails: run `npm install -g corepack` then try again
    $ corepack prepare yarn@4 --activate
    $ yarn --version
    # Confirm above outputted 4.x.x
    ```

1.  Install all dependencies:

    ```bash
    $ yarn install
    ```

## Run PWA locally

To start the PWA (Progressive Web App) at http://localhost:3009/, run:

```bash
$ yarn run start:pwa
```

## CORS

CORS headers are managed in [`cors.json`](/cors.json). To update them, run:

```bash
$ gsutil cors set cors.json gs://<FIREBASE_PROJECT_ID>.appspot.com
```

Changes should take effect within a few seconds.
