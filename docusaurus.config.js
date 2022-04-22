/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MyJavaScript',
  tagline:
    'Руководства, шпаргалки, вопросы и другие материалы по JavaScript, React, TypeScript, Node.js, Express, Prisma, Docker и множеству других технологий, связанных с разработкой веб-приложений',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'harryheman', // Usually your GitHub org/user name.
  projectName: 'my-js', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/harryheman/my-js/tree/master/'
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/harryheman/my-js/tree/master/'
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
        title: 'MyJavaScript',
        logo: {
          alt: 'MyJavaScript Logo',
          src: 'img/logo.png'
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
          {
            type: 'doc',
            docId: 'links/intro-links',
            position: 'left',
            label: 'Cсылки'
          },
          // { to: 'blog', label: 'Блог', position: 'left' },
          // Please keep GitHub link to the right for consistency.
          {
            href: 'https://github.com/harryheman/my-js',
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
                href: 'https://github.com/harryheman/my-js'
              }
            ]
          }
        ],
        // Please do not remove the credits, help to publicize Docusaurus :)
        copyright: `Copyright © ${new Date().getFullYear()}. MyJavaScript. <br />  Built by <a href="https://github.com/harryheman" target="_blank" rel="noopener noreferrer">Igor Agapov</a> with&nbsp;🖤 &amp; <a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">Docusaurus</a>. <br /> Deploy on <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer">Netlify</a>.`
      },
      hideableSidebar: true,
      autoCollapseSidebarCategories: true
    })
}

module.exports = config
