import {terser} from "rollup-plugin-terser";

export default [
  {
    input: "src/js/index.js",
    output: {
      file: "dist/dex.js",
      format: "umd",
      name: "dex",
      globals: {
        'jQuery': '$'
      }
    }
  },
  {
    input: "src/js/index.js",
    plugins: [
      terser()
    ],
    output: {
      file: "dist/dex.min.js",
      format: "umd",
      name: "dex",
      globals: {
        'jQuery': '$'
      }
    }
  }
];