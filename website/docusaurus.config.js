const path = require('path');

module.exports = {
  title: 'Azure Machine Learning',
  tagline: 'Open source cheat sheets for Azure ML',
  url: 'https://github.com/Azure/',
  baseUrl: '/azureml-cheatsheets/',
  onBrokenLinks: 'ignore',
  favicon: 'img/logo.svg',
  organizationName: 'keonabut', // Usually your GitHub org/user name.
  projectName: 'azureml-cheatsheets', // Usually your repo name.
  themeConfig: {
    agolia: {
      contextualSearch: true
    },
    navbar: {
      title: 'Azure Machine Learning',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: '/docs/cheatsheets/python/v1/cheatsheet', label: 'Python SDK', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Resources',
          items: [
            {
              label: 'Azure ML - Microsoft Docs',
              href: 'https://docs.microsoft.com/azure/machine-learning',
            },
            {
              label: 'Azure ML - Python API',
              href: 'https://docs.microsoft.com/python/api/overview/azure/ml/?view=azure-ml-py'
            }
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'GitHub issues',
              href: 'https://github.com/Azure/azureml-cheatsheets/issues',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.microsoft.com/questions/tagged/10888',
            }
          ],
        },
        {
          title: 'GitHub',
          items: [
            {
              label: 'Cheat sheets',
              href: 'https://github.com/Azure/azureml-cheatsheets',
            },
            {
              label: 'Azure ML Examples',
              href: 'https://github.com/Azure/azureml-examples',
            },
            {
              label: 'Contribution',
              href: '/docs/misc/contributing',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Microsoft Corporation`,
    },
    algolia: {
      // search only api key: https://docsearch.algolia.com/docs/faq/#can-i-share-the-apikey-in-my-repo
      apiKey: '1e4db0054fd7da8ce9923b63900fa842',
      indexName: 'azureml-cheatsheets',
      searchParameters: {},
      placeholder: 'Search cheat sheets'
    }
  },
  plugins: [path.resolve(__dirname, 'plugins/appinsights')], // uncomment for appinsights
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/Azure/azureml-cheatsheets/tree/main/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
