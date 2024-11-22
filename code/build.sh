#!/bin/bash
npx rollup -p @rollup/plugin-terser --format=es --file=../functions/github-oauth-login.js -- github-oauth-login.js
