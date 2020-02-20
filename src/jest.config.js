process.env.NODE_ENV = "test";

let fs = require("fs");
let hjson = require("hjson");
require("jest-extended");
let path = require("path");
let {
    pathsToModuleNameMapper,
} = require("ts-jest/utils");

const tsConfig = hjson.parse(
    fs.readFileSync(
        path.resolve(__dirname, "../", "tsconfig.json"),
        "utf8",
    ),
);

/**
 * See more here https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
    coveragePathIgnorePatterns: [
        "/node_modules/",
    ],
    displayName: "tsc",
    globals: {},
    moduleNameMapper: {
        ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths),
    },
    modulePaths: [
        "./",
    ],
    preset: "ts-jest",
    rootDir: "./",
    setupFiles: [
        "<rootDir>/jest/jest.setup.ts",
    ],
    setupFilesAfterEnv: ["jest-extended"],
    testEnvironment: "node",
    testMatch: [
        "**/__tests__/**/*.spec.js?(x)",
        "**/__tests__/**/*.spec.ts",
    ],
    verbose: false,
};
