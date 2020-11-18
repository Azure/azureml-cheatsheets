module.exports = {
  mainSidebar: {
    'Menu': [
      {
        type: 'doc',
        id: 'cheatsheet/cheatsheet'
      },
      {
        type: 'category',
        label: 'Getting Started',
        collapsed: false,
        items: ['cheatsheet/installation'],
      },
      {
        type: 'category',
        label: 'Basic Assets',
        collapsed: false,
        items: ['cheatsheet/workspace', 'cheatsheet/compute-targets', 'cheatsheet/environment', 'cheatsheet/data'],
      },
      {
        type: 'category',
        label: 'Guides',
        collapsed: false,
        items: ['cheatsheet/script-run-config', 'cheatsheet/logging', 'cheatsheet/distributed-training', 'cheatsheet/docker-build', 'cheatsheet/debugging']
      }
    ],
  },
  templateSidebar: {
    'Templates': [
      {
        type: 'doc',
        id: 'templates/templates'
      }
    ]
  },
  secondaySidebar: {
    Cookbook: [
      {
        type: 'doc',
        id: 'cbdocs/cookbook',
      },
      {
        type: 'category',
        label: 'Setup',
        items: ['cbdocs/setup-sdk', 'cbdocs/setup-notebook'],
      }
    ]
  }
};
