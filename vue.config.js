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
  }
})
