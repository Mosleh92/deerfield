import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <meta name="description" content="نظام إدارة تصاريح العمل للمراكز التجارية" />
        <meta name="keywords" content="تصاريح العمل, إدارة المول, نظام التصاريح" />
        <meta name="author" content="Mall Management System" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
      </Head>
      <body className="rtl font-arabic bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}