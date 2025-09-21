// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import { TextDecoder } from "@polkadot/x-textdecoder";
import { TextEncoder } from "@polkadot/x-textencoder";

// Polyfill for jsdom environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
