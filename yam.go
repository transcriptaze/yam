package main

import (
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"strings"
	"log"
	"log/slog"
)


type httpdFS struct {
	http.FileSystem
}

type httpdFile struct {
	http.File
}

func main() {
	port := 8118

	run(port, os.DirFS("./html"))
}

func run(port int, html fs.FS) {
	infof("initialising")

	// ... initialise HTTP server
	fsys := httpdFS{
		http.FS(html),
	}

	// http.Handle("/css/", http.FileServer(fsys))
	// http.Handle("/fonts/", http.FileServer(fsys))
	// http.Handle("/images/", http.FileServer(fsys))
	// http.Handle("/javascript/", http.FileServer(fsys))
	// http.Handle("/favicon.ico", http.FileServer(fsys))
	http.Handle("/", http.FileServer(fsys))

	// if os.Getenv("PORT") != "" {
	// 	port = os.Getenv("PORT")
	// }

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
