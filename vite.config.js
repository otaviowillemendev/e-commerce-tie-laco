import { defineConfig } from 'vite';

export default defineConfig({
  // Serve os arquivos HTML da raiz normalmente
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Inclui todas as páginas no build
      input: {
        home:     'Home.html',
        catalogo: 'Catalogo.html',
        produto:  'Produto.html',
        checkout: 'Checkout.html',
        conta:    'Conta.html',
      },
    },
  },
  // Expõe variáveis VITE_* para o browser
  envPrefix: 'VITE_',
});
