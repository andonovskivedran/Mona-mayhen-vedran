import { defineConfig } from 'astro/config';

// Pages serves the same arena as a static page, without the Node-only API route.
export default defineConfig({
  output: 'static',
  srcDir: './pages-app',
  outDir: './dist-pages',
  site: 'https://andonovskivedran.github.io',
  base: '/Mona-mayhen-vedran/',
  vite: {
    define: { 'import.meta.env.PUBLIC_STATIC_CONTRIBUTIONS': JSON.stringify('true') },
  },
});
