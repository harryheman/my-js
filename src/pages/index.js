import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: 'JavaScript',
    imageUrl: 'img/logo.webp'
    // description: (
    //   <>
    //     Docusaurus was designed from the ground up to be easily installed and
    //     used to get your website up and running quickly.
    //   </>
    // )
  },
  {
    title: 'React',
    imageUrl: 'img/react.webp'
  },
  {
    title: 'TypeScript',
    imageUrl: 'img/ts.webp'
  },
  {
    title: 'Node.js',
    imageUrl: 'img/nodejs.webp'
  },
  {
    title: 'And More',
    imageUrl: 'img/coding.webp'
  }
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
      description='Руководства, шпаргалки, вопросы и другие материалы по JavaScript, React, TypeScript, Node.js, Express, Prisma, GraphQL, Docker и множеству других технологий, связанных с разработкой веб-приложений'
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
          <p className='hero__subtitle'>{siteConfig.tagline}</p>

          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted
              )}
              to={useBaseUrl('docs/guide/intro-guide')}
            >
              Поехали!
            </Link>
          </div>

          <p className='hero__subtitle small'>
            Обновление от 29.05.2022:&nbsp;
            <a href='docs/cheatsheet/web-media'>
              Шпаргалка по работе с медиа в браузере
            </a>
            .
          </p>

          <p className='hero__subtitle small'>
            Материалы находятся в свободном доступе. <br />
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
