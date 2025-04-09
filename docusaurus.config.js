/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MyJavaScript',
  tagline:
    'Руководства, шпаргалки, вопросы и другие материалы по JavaScript, React, TypeScript, Node.js, Express, Prisma, GraphQL, Docker и множеству других технологий.',
  url: 'https://my-js.org',
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
          editUrl: 'https://github.com/harryheman/my-js/tree/master/',
          breadcrumbs: false,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'standalone',
          'queryString',
        ],
        pwaHead: [
          {
            tagName: 'link',
            rel: 'icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'manifest',
            href: '/manifest.json',
          },
          {
            tagName: 'meta',
            name: 'theme-color',
            content: '#3c3c3c',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-capable',
            content: 'yes',
          },
          {
            tagName: 'meta',
            name: 'apple-mobile-web-app-status-bar-style',
            content: '#3c3c3c',
          },
          {
            tagName: 'link',
            rel: 'apple-touch-icon',
            href: '/img/logo.png',
          },
          {
            tagName: 'link',
            rel: 'mask-icon',
            href: '/img/logo.png',
            color: '#3c3c3c',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileImage',
            content: '/img/logo.png',
          },
          {
            tagName: 'meta',
            name: 'msapplication-TileColor',
            content: '#3c3c3c',
          },
        ],
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/logo.png',
      navbar: {
        title: 'MyJavaScript',
        logo: {
          alt: 'MyJavaScript Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'guide/intro-guide',
            position: 'left',
            label: 'Руководства',
          },
          {
            type: 'doc',
            docId: 'cheatsheet/intro-cheatsheet',
            position: 'left',
            label: 'Шпаргалки',
          },
          {
            type: 'doc',
            docId: 'algorithms/intro-algorithms',
            position: 'left',
            label: 'Структуры данных и алгоритмы',
          },
          {
            type: 'doc',
            docId: 'other/intro-other',
            position: 'left',
            label: 'Другое',
          },
          {
            type: 'doc',
            docId: 'links/intro-links',
            position: 'left',
            label: 'Cсылки',
          },
          // Please keep GitHub link to the right for consistency.
          {
            href: 'https://github.com/harryheman/my-js',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Контакты',
            items: [
              {
                html: '<a class="footer__link" href="https://github.com/harryheman" target="_blank"><img src="/img/github.png" alt=""><span>harryheman</span></a>',
              },
              {
                html: '<a class="footer__link" href="https://habr.com/ru/users/aio350" target="_blank"><img src="/img/habr.webp" alt=""><span>aio350</span></a>',
              },
              {
                html: '<a class="footer__link" href="https://t.me/igoragapov" target="_blank"><img src="/img/telegram.png" alt=""><span>igoragapov</span></a>',
              },
              {
                html: '<a class="footer__link" href="mailto:aio350@yahoo.com"><img src="/img/email.png" alt=""><span>aio350@yahoo.com</span></a>',
              },
            ],
          },
        ],
        copyright: `
          © ${new Date().getFullYear()}. MyJavaScript. <br />
          Разработал <a href="https://github.com/harryheman" target="_blank" rel="noopener noreferrer">Игорь Агапов</a> с помощью&nbsp;🖤&nbsp;&nbsp;&amp; <a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">Docusaurus</a>. <br />
          Приложение развернуто на <a href="https://www.netlify.com/" target="_blank" rel="noopener noreferrer">Netlify</a>.
        `,
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      algolia: {
        appId: 'K9EMNI09N5',
        apiKey: '415a654b5e8424ce6bb502e4d9689c4a',
        indexName: 'my-js',
        contextualSearch: true,
      },
    }),

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru', 'en'],
  },
}

module.exports = config
