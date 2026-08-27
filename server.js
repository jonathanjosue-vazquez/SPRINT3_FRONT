const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 3000
const ROOT = path.join(__dirname, "SPRINT3_FRONT")

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split("?")[0])
    if (urlPath === "/") urlPath = "/index.html"

    let filePath = path.join(ROOT, urlPath)

    // Prevent path traversal outside of ROOT
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403)
      res.end("Forbidden")
      return
    }

    // If a directory is requested, serve its index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html")
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" })
      res.end("<h1>404 - Página não encontrada</h1>")
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME[ext] || "application/octet-stream"

    res.writeHead(200, {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    })
    fs.createReadStream(filePath).pipe(res)
  } catch (err) {
    res.writeHead(500)
    res.end("Internal Server Error")
  }
})

server.listen(PORT, () => {
  console.log(`[v0] JOVI static server rodando em http://localhost:${PORT}`)
})
