module.exports = {
  plugins: [
    require('@tailwindcss/postcss'), // correct plugin for v4
    require('autoprefixer'),         // optional
    // add any other PostCSS plugins here
  ],
};
