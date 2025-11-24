package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"log/slog"
	"net/http"
	"os"
	"strings"
)

//go:embed html
var html embed.FS

type httpdFS struct {
	http.FileSystem
}

type httpdFile struct {
	http.File
}

func main() {
	port := "8118"
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	// run(port, os.DirFS("./html"))

	// ... run with embedded FS
	if dir, err := fs.Sub(html, "html"); err != nil {
		fatalf("%v", err)
	} else {
		run(port, dir)
	}
}

func run(port string, html fs.FS) {
	infof("initialising")

	// ... initialise HTTP server
	fsys := httpdFS{
		http.FS(html),
	}

	http.Handle("/", http.FileServer(fsys))

	infof("listening on port %v", port)
	fatalf("%v", http.ListenAndServe(fmt.Sprintf(":%v", port), nil))
}

func infof(format string, args ...any) {
	f := fmt.Sprintf("%-8v %v", "YAM", format)
	msg := fmt.Sprintf(f, args...)

	slog.Info(msg)
}

func fatalf(format string, args ...any) {
	f := fmt.Sprintf("%-8v %v", "YAM", format)

	log.Fatalf(f, args...)
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

func (f httpdFile) Readdir(N int) (fis []os.FileInfo, err error) {
	return nil, os.ErrPermission
}
