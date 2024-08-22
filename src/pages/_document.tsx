import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Advay Chandorkar</title>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          
          <meta name="description" content="Advay Chandorkar - Personal Portfolio." />
          <meta name="keywords" content="Advay Chandorkar, portfolio, web developer, competitive programmer, tech enthusiast" />
          <meta name="author" content="Advay Chandorkar" />
          <meta name="robots" content="index, follow" />
          <meta name="revisit-after" content="7 days" />
          
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Advay Chandorkar" />
          <meta property="og:description" content="portfolio site" />
          <meta property="og:image" content="/meta.png" />
          <meta property="og:site_name" content="Advay Chandorkar" />
          <meta property="og:locale" content="en_US" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Advay Chandorkar" />
          <meta name="twitter:description" content="portfolio site" />
          <meta name="twitter:image" content="/meta.png" />
          <meta name="twitter:site" content="@advayc" />
          <meta name="twitter:creator" content="@advayc" />
          
          <meta name="theme-color" content="#22D3EE" />
          
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Advay Chandorkar" />
          <meta name="application-name" content="Advay Chandorkar" />
          <meta name="msapplication-tooltip" content="portfolio site" />
          <meta name="msapplication-starturl" content="/" />
          <meta name="msapplication-navbutton-color" content="#22D3EE" />
          <meta name="format-detection" content="telephone=no" />
          
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
          
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const theme = localStorage.getItem('theme') || 'light';
                  document.documentElement.classList.add(theme);
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
