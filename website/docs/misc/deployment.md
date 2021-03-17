---
title: Deployment
description: One-time website deployment setup.
---

## Deployment

This article describes the one-time process for deploying this website.

This repo has GitHub actions in place that automate deployment by watching the `website` branch.
If you are interested in how deployment works then read on!

### GitHub Actions

We use GitHub actions to automate deployment. Set up was as follows:

- Generated new SSH key
    - NB. Since there was an existing ssh key tied the repo a new key was generated (in a different location) `/tmp/.ssh/id_rsa`
- Add public key to repo's [deploy key](https://developer.github.com/v3/guides/managing-deploy-keys/)
    - NB. Allow write access
- Add private key as [GitHub secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets)
    - We use repo-level (not org level) secret
    - Secret is named `GH_PAGES_DEPLOY`
    - `xclip -sel clip < /tmp/.ssh/id_rsa`

### Manual

It is possible to make manual deployments without use of the GitHub action above.

```console
GIT_USER=<Your GitHub username> USE_SSH=true yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
