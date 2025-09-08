import http from 'http'
import { createReadStream } from 'fs'
import { resolve, extname } from 'path'

const ROOT = resolve('html')
const PORT = 8118

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
};

http.createServer((rq, response) => {
  const filePath = resolve(ROOT + (rq.url === '/' ? '/index.html' : rq.url))
  const ext = extname(filePath)
  const type = mimeTypes[ext] || 'application/octet-stream'

  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
  response.setHeader('Content-Type', type)

  createReadStream(filePath)
    .on('error', () => {
      response.writeHead(404)
      response.end('-- NOT FOUND --')
    })
    .pipe(response);
}).listen(PORT, () => {
  console.log(`YAM server running at http://localhost:${PORT}`)
})
