import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        preview: resolve(__dirname, 'pattern-preview.html'),
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'theme-updater',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/update-theme') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', async () => {
              try {
                const themeFiles = JSON.parse(body);
                
                // Write theme files
                fs.writeFileSync(
                  path.join(__dirname, 'src/theme/palette.ts'),
                  themeFiles.palette,
                  'utf8'
                );
                
                fs.writeFileSync(
                  path.join(__dirname, 'src/theme/darkPalette.ts'),
                  themeFiles.darkPalette,
                  'utf8'
                );
                
                fs.writeFileSync(
                  path.join(__dirname, 'src/theme/typography.ts'),
                  themeFiles.typography,
                  'utf8'
                );
                
                fs.writeFileSync(
                  path.join(__dirname, 'src/theme/theme.ts'),
                  themeFiles.theme,
                  'utf8'
                );
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, message: 'Theme files updated' }));
              } catch (error) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
})