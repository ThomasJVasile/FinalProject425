// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

// // vue.config.js
// module.exports = {
//   devServer: {
//     host: '0.0.0.0',
//     port: 9090,
//   },
// };


const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    devServer: {
        allowedHosts: "all"
    }
})