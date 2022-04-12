/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My JavaScript',
  tagline: 'The tagline of my site',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'My JavaScript',
        logo: {
          alt: 'My JavaScript Logo',
          src: 'img/logo.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'guide/intro-guide',
            position: 'left',
            label: 'Руководства'
          },
          {
            type: 'doc',
            docId: 'cheatsheet/intro-cheatsheet',
            position: 'left',
            label: 'Шпаргалки'
          },
          {
            type: 'doc',
            docId: 'other/intro-other',
            position: 'left',
            label: 'Другое'
          },
          { to: 'blog', label: 'Блог', position: 'left' },
          // Please keep GitHub link to the right for consistency.
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus'
              }
            ]
          }
        ],
        logo: {
          alt: 'My JavaScript Logo',
          src: 'img/oss_logo.png'
        },
        // Please do not remove the credits, help to publicize Docusaurus :)
        copyright: `Copyright © ${new Date().getFullYear()} My JavaScript. Built with Docusaurus.`
      },
      hideableSidebar: true,
      autoCollapseSidebarCategories: true
    })
}

module.exports = config
