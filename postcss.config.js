// postcss.config.js
export default {
  plugins: {
    'postcss-import': {},

    // Tailwind v4’s new PostCSS plugin
    '@tailwindcss/postcss': {},

    // autoprefixer is still required
    autoprefixer: {},

    // production-only minifier
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: [
              'default',
              {
                // don’t run postcss-calc
                calc: false,
                // still strip comments
                discardComments: { removeAll: true },
              },
            ],
          },
        }
      : {}),
  },
};
