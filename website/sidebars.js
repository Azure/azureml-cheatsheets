module.exports = {
  pythonSidebar: {
    'Python': [
      {
        type: 'doc',
        id: 'cheatsheets/python/v1/cheatsheet'
      },
      {
        type: 'category',
        label: 'Getting Started',
        collapsed: false,
        items: ['cheatsheets/python/v1/installation'],
      },
      {
        type: 'category',
        label: 'Azure ML Resources',
        collapsed: false,
        items: ['cheatsheets/python/v1/workspace', 'cheatsheets/python/v1/compute-targets', 'cheatsheets/python/v1/environment', 'cheatsheets/python/v1/data'],
      },
      {
        type: 'category',
        label: 'Guides',
        collapsed: false,
        items: ['cheatsheets/python/v1/script-run-config', 'cheatsheets/python/v1/logging', 'cheatsheets/python/v1/distributed-training', 'cheatsheets/python/v1/docker-build', 'cheatsheets/python/v1/debugging', 'cheatsheets/python/v1/ci-dev','cheatsheets/python/v1/troubleshooting']
      }
    ],
  },
  cliSidebar: {
    'CLI (preview)': [
      {
      },
    ],
  }
};
