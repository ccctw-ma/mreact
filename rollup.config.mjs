import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-typescript2";

export default {
    input: "src/index.ts",
    output: {
        file: "dist/bundle.js",
        format: "umd",
        name: "MReact"

    },
    plugins: [
        nodeResolve({
            extensions: ['.js', '.ts']
        }),
        ts({
            tsconfig: "tsconfig.json"
        })
    ]
}