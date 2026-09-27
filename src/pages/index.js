import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const newThings = [
  {
    title: 'Полезные новшества ECMAScript 2026',
    href: 'https://habr.com/ru/companies/timeweb/articles/1081878/',
    target: '_blank',
  },
  {
    title: 'Жизненный цикл токена API: от выпуска до отзыва',
    href: 'https://habr.com/ru/companies/timeweb/articles/1077690/',
    target: '_blank',
  },
  {
    title: 'Глубокое погружение в React Fiber',
    href: 'https://habr.com/ru/companies/timeweb/articles/1068626/',
    target: '_blank',
  },
  {
    title: 'Размытая граница между состояниями CSS и событиями JavaScript',
    href: 'https://habr.com/ru/companies/timeweb/articles/1059272/',
    target: '_blank',
  },
  {
    title: 'Книга аутентификации',
    href: 'docs/guide/auth',
    target: '',
  },
  {
    title: 'Руководства по современной веб-разработке',
    href: 'docs/guide/modern-web-guidance',
    target: '',
  },
  {
    title: 'Демо использования Intl API',
    href: 'https://intl-api-demo.netlify.app/',
    target: '_blank',
  },
  {
    title:
      '37 советов и приемов по написанию качественных тестов для фронтенда',
    href: 'docs/cheatsheet/testing',
    target: '',
  },
  {
    title:
      'Основы системного администрирования Linux: от командной строки до веб-сервера',
    href: 'docs/other/linux',
    target: '',
  },
  {
    title: 'Выделение памяти в Go',
    href: 'docs/guide/go-memory',
    target: '',
  },
  {
    title: 'Планировщик Go',
    href: 'docs/guide/go-scheduler',
    target: '',
  },
]

const features = [
  {
    title: 'JavaScript',
    imageUrl: 'img/logo.webp',
    // description: (
    //   <>
    //     Docusaurus was designed from the ground up to be easily installed and
    //     used to get your website up and running quickly.
    //   </>
    // )
  },
  {
    title: 'React',
    imageUrl: 'img/react.webp',
  },
  {
    title: 'TypeScript',
    imageUrl: 'img/ts.webp',
  },
  {
    title: 'Node.js',
    imageUrl: 'img/nodejs.webp',
  },
  {
    title: 'And More',
    imageUrl: 'img/coding.webp',
  },
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={styles.feature}>
      {imgUrl && (
        <div className='text--center'>
          <img
            className={styles.featureImage}
            src={imgUrl}
            alt={title}
            width={120}
            height={120}
          />
        </div>
      )}
      <h3 className='text--center'>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}

export default function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout
      title={`${siteConfig.title}`}
      description='Руководства, шпаргалки, вопросы и другие материалы по JavaScript, TypeScript, React, Next.js, Node.js, Express, Prisma, GraphQL, Docker, Rust, Go и другим технологиям'
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className='container'>
          <img
            src='img/logo.webp'
            alt='MyJavaScript logo'
            className='hero__logo'
            width={120}
            height={120}
          />
          <h1 className='hero__title'>{siteConfig.title}</h1>
          <p className='hero__subtitle'>
            <a href='docs/guide/intro-guide'>Руководства</a>,{' '}
            <a href='docs/cheatsheet/intro-cheatsheet'>шпаргалки</a>,{' '}
            <a href='docs/other/intro-other'>вопросы и другие материалы</a> по
            JavaScript, TypeScript, React, Next.js, Node.js, Express, Prisma,
            GraphQL, Docker, Rust, Go и другим технологиям.
          </p>

          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg go',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/guide/intro-guide')}
            >
              Поехали!
            </Link>
          </div>

          <p className='hero__subtitle small'>
            Дата последнего обновления: 26.09.2026.
          </p>

          <p className='hero__subtitle small'>
            Новинки:
            {newThings.slice(0, 10).map((item, index) => (
              <a key={index} href={item.href} target={item.target}>
                {item.title}
              </a>
            ))}
          </p>

          <p className='hero__subtitle small'>
            Материалы находятся в свободном доступе (лицензия MIT). <br />
            Ссылки на приложение приветствуются.
          </p>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            {features.map(({ title, imageUrl, description }) => (
              <Feature
                key={title}
                title={title}
                imageUrl={imageUrl}
                description={description}
              />
            ))}
          </section>
        )}
      </main>
    </Layout>
  )
}
