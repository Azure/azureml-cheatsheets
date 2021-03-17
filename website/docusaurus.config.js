const path = require('path');

module.exports = {
  title: 'Azure Machine Learning',
  tagline: 'Open source cheat sheets for Azure ML',
  url: 'https://github.com/Azure/',
  baseUrl: '/azureml-cheatsheets/',
  onBrokenLinks: 'ignore',
  favicon: 'img/logo.svg',
  organizationName: 'Azure', // Usually your GitHub org/user name.
  projectName: 'azureml-cheatsheets', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Azure Machine Learning',
      logo: {
        alt: 'Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: 'docs/cheatsheets/python/v1/cheatsheet', label: 'Python', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Resources',
          items: [
            {
              label: 'Contributing guide',
              href: 'docs/misc/contributing',
            },
            {
              label: 'Service documentation',
              href: 'https://docs.microsoft.com/azure/machine-learning',
            },
            {
              label: 'Python SDK documentation',
              href: 'https://docs.microsoft.com/python/api/overview/azure/ml/?view=azure-ml-py'
            }
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'GitHub issues',
              href: 'https://github.com/Azure/azureml-examples/issues',
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
              label: 'Examples and notebooks',
              href: 'https://github.com/Azure/azureml-examples',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Microsoft Corporation`,
    },
    algolia: {
      // search only api key: https://docsearch.algolia.com/docs/faq/#can-i-share-the-apikey-in-my-repo
      apiKey: '8cdd3d909edd00501899b929541d6ce7',
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
