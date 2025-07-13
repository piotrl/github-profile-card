import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import fs from 'fs';
import path from 'path';
import PACKAGE from './package.json' with { type: 'json' };

const ENV = process.env.WEBPACK_ENV;
const libraryName = 'gh-profile-card';
const banner = `/**
* ${PACKAGE.name} - ${PACKAGE.version} | ${PACKAGE.license}
* (c) 2014 - ${new Date().getFullYear()} ${PACKAGE.author} | ${PACKAGE.homepage}
*/
`;

const outfilePath = path.resolve('dist', `${libraryName}.min.js`);

esbuild
  .build({
    entryPoints: ['./src/gh-widget-init.ts'],
    outfile: outfilePath,
    bundle: true,
    minify: false,
    sourcemap: ENV === 'dev', // Inline source map in development
    format: 'iife',
    target: ['es2022'],
    plugins: [
      sassPlugin({
        type: 'style',
      }), // Load SCSS using esbuild-sass-plugin
      {
        name: 'banner-plugin',
        setup(build) {
          build.onEnd((result) => {
            const content = fs.readFileSync(outfilePath, 'utf8');
            fs.writeFileSync(outfilePath, `${banner}\n${content}`);
          });
        },
      },
    ],
  })
  .catch(() => process.exit(1));
