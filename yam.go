package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"strings"
)

//go:embed html
var html embed.FS

func main() {
	port := 8118
	if p := os.Getenv("PORT"); p != "" {
		if v, err := strconv.ParseInt(p, 10, 32); err != nil {
			warnf("invalid PORT environment variable %v (%v)", p, err)
		} else {
			port = int(v)
		}
	}

	dir := ""

	flag.IntVar(&port, "port", port, "HTTP port")
	flag.StringVar(&dir, "html", "", "optional HTML folder (defaults to serving embedded HTML)")
	flag.Parse()

	if dir != "" {
		run(port, os.DirFS(dir))
	} else if embedded, err := fs.Sub(html, "html"); err != nil {
		fatalf("%v", err)
	} else {
		run(port, embedded)
	}
}

func run(port int, html fs.FS) {
	infof("initialising")

	fsys := httpdFS{
		http.FS(html),
	}

	handler := CORS(http.FileServer(fsys))
	address := fmt.Sprintf(":%v", port)

	infof("listening on port %v", port)
	fatalf("%v", http.ListenAndServe(address, handler))
}

func CORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, rq *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")

		handler.ServeHTTP(w, rq)
	})
}

func infof(format string, args ...any) {
	f := fmt.Sprintf("%-8v %v", "YAM", format)
	msg := fmt.Sprintf(f, args...)

	slog.Info(msg)
}

func warnf(format string, args ...any) {
	f := fmt.Sprintf("%-8v %v", "YAM", format)
	msg := fmt.Sprintf(f, args...)

	slog.Warn(msg)
}

func fatalf(format string, args ...any) {
	f := fmt.Sprintf("%-8v %v", "YAM", format)

	log.Fatalf(f, args...)
}

// --- httpdFS ---
type httpdFS struct {
	http.FileSystem
}

func (fs httpdFS) Open(name string) (http.File, error) {
	parts := strings.Split(name, "/")
	for _, part := range parts {
		if strings.HasPrefix(part, ".") {
			return nil, os.ErrPermission
		}
	}

	f, err := fs.FileSystem.Open(name)
	if err != nil {
		return nil, err
	}

	return httpdFile{f}, err
}

// --- httpdFile ---
type httpdFile struct {
	http.File
}

func (f httpdFile) Readdir(N int) (fis []os.FileInfo, err error) {
	return nil, os.ErrPermission
}
