//const config = require('@polkadot/dev/config/jest.cjs');

// Copyright 2017-2022 @polkadot/dev authors & contributors
// SPDX-License-Identifier: Apache-2.0

const { defaults } = require("jest-config");

module.exports = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, "ts", "tsx"],
  modulePathIgnorePatterns: [
    "<rootDir>/build",
    "<rootDir>/build-tsc-cjs",
    "<rootDir>/build-tsc-ems",
    "<rootDir>/build-tsc-js",
  ],
  // See https://jestjs.io/docs/configuration#extraglobals-arraystring
  sandboxInjectedGlobals: ["Math"],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "node_modules/variables/.+\\.(j|t)sx?$": [
      "ts-jest",
      { tsconfig: "./tsconfig.jest.json", useESM: true },
    ],
    "\\.[jt]sx?$": [
      "ts-jest",
      { tsconfig: "./tsconfig.jest.json", useESM: true },
    ],
    ".ts": ["ts-jest", { tsconfig: "./tsconfig.jest.json", useESM: true }],
  },
  transformIgnorePatterns: ["node_modules/(?!variables/.*)"],
  extensionsToTreatAsEsm: [".ts"],
  resolver: "jest-ts-webcompat-resolver",
};
