import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

// Versão e commit gravados no app: quem testa vê exatamente qual build está aberto.
const pacote = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8')) as { version: string };

function commitAtual(): string {
  const doCi = process.env['COMMIT'];
  if (doCi) return doCi.slice(0, 7);
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return 'local';
  }
}

// Content Security Policy só no build: o servidor de desenvolvimento injeta
// estilo em linha e usa websocket, o que a política bloquearia. Os testes de
// navegador rodam contra o build, então qualquer violação aparece como erro de
// console e reprova o teste.
const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "require-trusted-types-for 'script'",
  "trusted-types 'none'",
].join('; ');

function politicaDeSeguranca(): Plugin {
  return {
    name: 'politica-de-seguranca',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
    ],
  };
}

export default defineConfig({
  define: {
    __VERSAO__: JSON.stringify(pacote.version),
    __COMMIT__: JSON.stringify(commitAtual()),
  },
  plugins: [politicaDeSeguranca()],
  build: { sourcemap: true },
});
