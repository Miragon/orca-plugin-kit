# Security

Report a vulnerability in the actions or the image privately through GitHub's
[security advisories](https://github.com/Miragon/orca-plugin-kit/security/advisories/new), not in a
public issue.

## How releases are protected

- `main` changes only through squash-merged pull requests that pass `test.yml`.
- Only the release-please app creates `v*` tags. Consumers pin a full commit, so a moved tag never
  changes what they run.
- Every action this repository uses is pinned to a full commit.
- `setup-orca` and the image download Orca from the releases of
  [stablyai/orca](https://github.com/stablyai/orca/releases) over HTTPS.
