import  babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";

export default {
  input: './src/index.js',   //  引入的文件
  output: {
    format: 'umd',  //  amd commonjs规范 默认将打包后的结果挂载到window上
    file: 'dist/vue.js',  //  打包 出的vue.js  new Vue
    name: 'Vue',
    sourcemap: true
  },
  plugins: [
    babel({   //  解析  es6 --> es5
        exclude: "node_modules/**"   // 排除文件的操作  glob
    }),
    serve({   //  开启本地服务
        open: true,
        openPage: '/public/index.html',   // 打开的页面
        port: 3000,
        contentBase: ''
    })
  ]
}