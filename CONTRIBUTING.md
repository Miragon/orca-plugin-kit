# Contributing

The kit serves Miragon's repositories that build Orca plugins. Changes go through a pull request
with a code owner's review; `test.yml` must pass.

## Layout

The repository is grouped by the kind of part it ships, so a new action or image gets a folder of
its own instead of a new entry in the root:

- `actions/<name>/action.yml`: the composite actions, called as
  `Miragon/orca-plugin-kit/actions/<name>@<sha>`.
  - [`setup-orca`](actions/setup-orca/action.yml): installs an Orca release into the runner's
    cache with [`scripts/install-orca.mjs`](scripts/install-orca.mjs).
  - [`publish-plugin`](actions/publish-plugin/action.yml): checks out
    [Miragon/orca-plugins](https://github.com/Miragon/orca-plugins) at `main`, installs the Orca
    release its `.orca-version` names and runs its `scripts/publish-plugin.mjs`. The rules of the
    catalog live there; this action only carries its inputs.
- `images/<name>/Containerfile`: the container images, built with the repository root as context.
  - [`orca`](images/orca/Containerfile): the image `ghcr.io/miragon/orca:<version>`, which installs
    Orca with the same script.
- `scripts/`: what several parts share. Actions reach it through `$GITHUB_ACTION_PATH/../../scripts`.
- `test/`: fixtures for `test.yml`.

Reusable workflows for consumers would go to `.github/workflows/`, the only place GitHub looks for
them. Moving any of these paths breaks every consumer's `uses:`, so it is a major release.

## Testing

`test.yml` runs `setup-orca` on the channels `minimum` (against
[`test/fixtures/orca-plugin.json`](test/fixtures/orca-plugin.json)) and `latest`, on x64 and arm64
runners, starts each Orca under xvfb, and builds the image of the newest Orca release without pushing it.

## Images

[`image.yml`](.github/workflows/image.yml) builds `ghcr.io/miragon/orca` of one Orca release for
linux/amd64 and linux/arm64 from the newest kit release, and pushes it as
`<orca version>-<kit version>` and `<orca version>`; the newest Orca release also moves `latest`.
It runs

- every Monday, for the newest Orca release when it has no image yet,
- on a kit release that changes `images/orca/` or `scripts/install-orca.mjs`, for the newest Orca
  release, so `latest` gets the changed image,
- by hand with one Orca release, to build any other.

The workflow's `GITHUB_TOKEN` needs write access to the package: in the package settings,
**Manage Actions access** grants `orca-plugin-kit` the Write role.

## Versioning

Consumers pin a commit with the version as a comment (`@<sha> # v1.2.0`). Dependabot moves those
pins on every release.

| Change                                                        | Version |
| ------------------------------------------------------------- | ------- |
| An input or output removed or renamed, or its meaning changed | major   |
| A new input, output or channel                                | minor   |
| A fix, a pinned action moved, a new Node minor or patch       | patch   |

Commit messages follow Conventional Commits; `feat!` or `fix!` marks a major. release-please keeps
a release pull request open; merging it tags `vX.Y.Z` and moves `vX` to the same commit. Only the
release-please app creates `v*` tags.

`publish-plugin` follows the rules of Miragon/orca-plugins at `main`, whatever version is pinned:
its version covers its inputs, not the catalog's checks.
