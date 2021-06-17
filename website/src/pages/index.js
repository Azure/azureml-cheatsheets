import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Translate, {translate} from '@docusaurus/Translate';

const features = [
  {
    title: <Translate id="section0">'Cheat Sheet'</Translate>,
    pageUrl: 'docs/cheatsheets/python/v1/cheatsheet',
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
      <Translate id="section0.desc">
        A cheat sheet for common use cases with AML.
        Get 80% of what you need in 20% of the documentation.
      </Translate>
      </>
    ),
  },
  {
    title: <Translate id="section1">'Distributed GPU Training'</Translate>,
    pageUrl: 'docs/cheatsheets/python/v1/distributed-training',
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
      <Translate id="section1.desc">
        Guide to getting your distributed training code running in Azure ML.
      </Translate>
      </>
    ),
  },
  {
    title: <Translate id="section2">'Environments'</Translate>,
    pageUrl: 'docs/cheatsheets/python/v1/environment',
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
      <Translate id="section2.desc">
        Set up and manage your Python environments and docker images
        in Azure ML.
      </Translate>
      </>
      ),
  },
];

function Feature({imageUrl, title, description, pageUrl}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3><a href={pageUrl}>{title}</a></h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A user guide to Azure ML <head />">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title"><Translate id="index.title">{siteConfig.title}</Translate></h1>
          <p className="hero__subtitle"><Translate id="index.tagline">{siteConfig.tagline}</Translate></p>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/cheatsheets/python/v1/cheatsheet')}>
              Get started!
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
