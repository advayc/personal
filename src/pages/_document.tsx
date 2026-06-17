import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" style={{ backgroundColor: '#0a0a0a' }}>
      <Head>
        <meta charSet="UTF-8" />
        <meta property="og:image" content="/meta.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Preview of Advay Chandorkar's developer portfolio" />
        <style dangerouslySetInnerHTML={{ __html: 'html,body{background:#0a0a0a;color:#fff}' }} />
      </Head>
      <body style={{ backgroundColor: '#0a0a0a' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
