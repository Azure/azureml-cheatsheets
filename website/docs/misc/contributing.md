---
title: Contributing
description: Guide to contributing.
---

## Issues

All forms of feedback are welcome through [issues](https://github.com/Azure/azureml-cheatsheets/issues) - please follow the pre-defined templates where applicable.

##  Pull requests

Pull requests (PRs) to this repo require review and approval by the Azure Machine Learning team to merge. Please follow the pre-defined template and read all relevant sections below.

Make PR's against the `main` branch.

```bash
git clone git@github.com:Azure/azureml-cheatsheets.git
cd azureml-cheatsheets
git checkout -b user/contrib
...
gh pr create
```

- When a PR arrives against `main` GitHub actions (deploy-website) will test the build is successful
- When the PR is merged the change will be automatically deployed to `gh-pages` branch (and the webpage will be updated)

99% of contributions should only need the following:

- Add markdown files to the `website/docs` folder
- Update the `sidebar.js` file to add a page to the sidebar
- Put any images in `website/docs/path-to-directory/img/` and refer to them like this: `![](img/image-name.png)`

If you need to do anything more than adding a new page to the sidebar (e.g.
modify the nav bar) then please refer to the [Docusaurus 2 documentation](https://v2.docusaurus.io/).

## Previewing changes locally

- Install npm and yarn: see [instructions here](https://v2.docusaurus.io/docs/installation)
- First time Docusaurus2 installation:

```bash
cd website
npm install
```

- Run local server while developing:

```bash
cd website
yarn start
```
