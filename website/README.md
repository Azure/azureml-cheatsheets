# Website

This is the source code for the website.

This website is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

Layout:

- `docs/`: Contains the markdown files used to generate the webpage. Main sections are:
    - `cheatsheet/`
    - `vs-code-snippets/`
    - `tempaltes/`
- `docusaurus.config.js`: Configuration file for the webpage generation. Controls the nav bar and some
other global information (e.g. AppInsights logging is configured here)
- `sidebar.js`: Modify the sidebars in the webpages

Typically you shouldn't need to modify any of the other files and folders.
