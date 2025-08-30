import nextIntl from 'next-intl/plugin';

const withNextIntl = nextIntl('./i18n.ts');

const config = withNextIntl({
  reactStrictMode: true
});

export default config;
