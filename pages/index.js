import { useEffect } from 'react';
import Head from 'next/head';

import Intro from '../components/Intro';
import Gallery from '../components/Gallery';
import Roadmap from '../components/Roadmap';
import Whitelist from '../components/Whitelist';
import Team from '../components/Team';
import PFPMaker from '../components/PFPMaker';
import FAQ from '../components/FAQ';
import Mint from '../components/Mint';
import Summary from '../components/Summary';
import Buidl from '../components/Buidl';

export default function Home() {
  useEffect(() => {
    if (window.console) {
      console.log('%c您好，科学家！', 'font-size: 20px;font-weight:bold;');
      console.log(
        '%c没什么别的意思，就是想提醒您，我们是国产良心 NFT 项目，您无需费劲的查看编译后的代码，我们已经开源了。',
        'font-size: 20px;'
      );
      console.log(
        '%c网站开源地址：https://github.com/brucexu-eth/gclx-official',
        'font-size: 20px;'
      );
    }
  }, []);

  return (
    <div>
      <Head>
        <title>国产良心 NFT - 全宇宙限量 1000 的中国国产良心 NFT！</title>
        <meta name="description" content="中国人不骗中国人，放心！" />
        <link rel="icon" href="/favicon.png" />

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
      </Head>
      <Intro />
      <Gallery />
      <PFPMaker />
      <Roadmap />
      <Whitelist />
      <FAQ />
      <Team />
      <Mint />
      <Summary />
      <Buidl />
    </div>
  );
}
