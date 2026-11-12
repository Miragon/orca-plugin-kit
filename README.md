# Orca plugin kit

[![Release](https://img.shields.io/github/v/release/Miragon/orca-plugin-kit)](https://github.com/Miragon/orca-plugin-kit/releases)
[![Test](https://github.com/Miragon/orca-plugin-kit/actions/workflows/test.yml/badge.svg)](https://github.com/Miragon/orca-plugin-kit/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/github/license/Miragon/orca-plugin-kit)](LICENSE)

**Test your Orca plugin in a real Orca, and ship each release to Miragon's Orca catalog.**

Two GitHub Actions and a container image for Miragon's repositories that build
[Orca](https://www.onorca.dev) plugins. Releases go to
[Miragon/orca-plugins](https://github.com/Miragon/orca-plugins), the catalog Orca installs
Miragon's plugins from. [Miragon/modeler-suite](https://github.com/Miragon/modeler-suite/tree/main/.github/workflows)
uses all of it.

## What you get

| Part                                                                                      | What it does                                                                                        | Where it runs    |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| [`setup-orca`](setup-orca/action.yml)                                                     | Installs an Orca release and xvfb, and returns the folder your test starts Orca from                | Linux runners    |
| [`publish-plugin`](publish-plugin/action.yml)                                             | Publishes the built plugins of one release into the catalog, checked by the catalog's rules         | Linux runners    |
| [`ghcr.io/miragon/orca`](https://github.com/orgs/Miragon/packages/container/package/orca) | Node 22 on Debian with Orca under `/opt/orca` and xvfb, tagged by Orca release, for amd64 and arm64 | Podman or Docker |

## Test a plugin in Orca

Pick the Orca release by `version`, by `channel: latest`, or by `channel: minimum`, the oldest
release your plugin's `engines.orca` accepts, read from `plugin-manifest`. Your test finds Orca in
`ORCA_APP`:

```yaml
- id: orca
  uses: Miragon/orca-plugin-kit/setup-orca@<sha> # v1.0.0
  with:
    channel: minimum
    plugin-manifest: apps/orca/orca-plugin.json
- run: xvfb-run -a npm run test:orca
  env:
    ORCA_APP: ${{ steps.orca.outputs.app }}
```

On your machine or for an agent, run the same test in the image, where `ORCA_APP` is already set and
no Orca window takes the focus:

```sh
podman run --rm -v "$PWD:/repo" -w /repo ghcr.io/miragon/orca:1.4.254 \
  sh -c 'npm ci && xvfb-run -a npm run test:orca'
```

## Publish a release

Your repository must first be
[listed as a source in the catalog](https://github.com/Miragon/orca-plugins/blob/main/CONTRIBUTING.md#adding-a-source-repository),
which also describes the folder `plugins-dir` points to. Then call `publish-plugin` once per
release, with a token of Miragon's release-please app:

```yaml
- uses: actions/create-github-app-token@64ab729a6294000f5aa4a4bc0b73d1f32bc45510 # v3.3.0
  id: app
  with:
    client-id: ${{ vars.RELEASE_PLEASE_APP_CLIENT_ID }}
    private-key: ${{ secrets.RELEASE_PLEASE_APP_PRIVATE_KEY }}
    owner: Miragon
    repositories: orca-plugins
- uses: Miragon/orca-plugin-kit/publish-plugin@<sha> # v1.0.0
  with:
    token: ${{ steps.app.outputs.token }}
    plugins-dir: orca-plugins
    source-repo: ${{ github.repository }}
    source-ref: ${{ github.sha }}
```

## Stay up to date

Pin the commit of a [release](https://github.com/Miragon/orca-plugin-kit/releases) with its version
as a comment, as above, and let Dependabot move the pin to each new release:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

A new major version means changed inputs or outputs. An image tag follows its Orca release and is
rebuilt when the recipe changes; pin its digest to keep one build.

## Help and feedback

- **Bugs and ideas:** [open an issue](https://github.com/Miragon/orca-plugin-kit/issues).
- **Security:** report vulnerabilities privately via [SECURITY.md](SECURITY.md).

## Contributing

How the actions and the image are built, tested and released is in
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Miragon
