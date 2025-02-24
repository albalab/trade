const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  transpileDependencies: true,
  css: {
    loaderOptions: {
      css: {
        // Отключаем обработку url() в CSS
        url: false
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',

      // Указываем, что эти модули не нужно бандлить
      externals: [
        'node-telegram-bot-api',
        '@cypress/request',
        'tough-cookie'
      ]
    }
  }
})
