import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var b=localStorage.getItem('portfolioBackground');if(['gray','black','white','cream'].indexOf(b)<0)b='gray';document.documentElement.dataset.background=b;document.documentElement.classList.toggle('light',b==='white'||b==='cream')}catch(e){}})();` }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
