const path = require('path');

module.exports = {
  title: 'Azure Machine Learning',
  tagline: '',
  url: 'https://github.com/Azure/',
  baseUrl: '/azureml-web/',
  onBrokenLinks: 'ignore',
  favicon: 'img/logo.svg',
  organizationName: 'Azure', // Usually your GitHub org/user name.
  projectName: 'azureml-web', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Azure Machine Learning',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {to: 'docs/cheatsheet/', label: 'Cheat Sheet', position: 'left'},
        {to: 'docs/vs-code-snippets/snippets', label: 'Snippets', position: 'left'},
        {to: 'docs/templates/', label: 'Templates', position: 'left'},
        // {to: 'blog', label: 'Blog', position: 'left'},
        // {href: 'https://github.com/Azure/azureml-web', label: 'GitHub', position: 'right',
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Reference',
          items: [
            {
              label: 'Microsoft Docs',
              href: 'https://docs.microsoft.com/azure/machine-learning',
            },
            {
              label: 'API Documentation',
              href: 'https://docs.microsoft.com/python/api/overview/azure/ml/?view=azure-ml-py'
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Azure/azureml-examples/issues',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.microsoft.com/questions/tagged/10888',
            }
          ],
        },
        {
          title: 'Code',
          items: [
            {
              label: 'Website Repo',
              href: 'https://github.com/Azure/azureml-web',
            },
            {
              label: 'Azure ML Examples Repo',
              href: 'https://github.com/Azure/azureml-examples',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Microsoft`,
    },
    algolia: {
      // search only api key: https://docsearch.algolia.com/docs/faq/#can-i-share-the-apikey-in-my-repo
      apiKey: '8cdd3d909edd00501899b929541d6ce7',
      indexName: 'azureml-web',
      searchParameters: {},
      placeholder: 'Search cheat sheet'
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
            'https://github.com/Azure/azureml-web/tree/main/website/',
        },
        cookbook: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/Azure/azureml-web/tree/main/website/blog',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
