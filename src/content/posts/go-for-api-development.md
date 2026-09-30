---
title: "Go Is the Right Tool for API Backends"
date: "2025-11-03"
category: "Systems"
tags: ["Go", "Backend"]
excerpt: "I've written backends in Node.js, Express, and FastAPI. They all work. But when I need something that will hold up under real load without babysitting it, I write Go."
---

I've written backends in Node.js, Express, and FastAPI. They all work. The ecosystems are mature, the communities are large, and you can build something real with any of them.

But when I need a backend that holds up under actual load, that I can ship as a single binary and not think about again, Go is what I reach for. The reasons are specific.

## The Concurrency Model Is the Language

In Node.js, concurrency is a workaround. You're on a single thread, so async/await exists to let you pretend you're not. Once you need real CPU parallelism, or a third-party library doesn't play well with async, or you need to reason about what runs when, you're fighting the execution model instead of using it.

Go was designed around concurrency from the start. Goroutines are cheap, the runtime schedules them across OS threads, and channels give you a clean way to communicate between them.

```go
func handleRequests(listener net.Listener) {
    for {
        conn, err := listener.Accept()
        if err != nil {
            continue
        }
        go handleConn(conn)
    }
}
```

That go keyword is doing real work. The runtime handles the rest. You can spin up thousands of goroutines and the overhead stays manageable because they start with small stacks that grow on demand.

I've built services handling hundreds of concurrent connections where the implementation was straightforward because goroutines made it straightforward, not because I was clever about it.

## The Binary Ships Itself

Go compiles to a single static binary. You build it, copy it to a server, run it. No node_modules to install, no Python virtual environment to manage, no runtime version to pin.

Cross-compilation is also trivial. GOOS=linux GOARCH=amd64 go build on Windows produces a Linux binary in seconds with no additional setup. A Docker image with a Go binary is smaller and simpler than one carrying a Node.js runtime and a hundred megabytes of node_modules. Cold starts on serverless are faster because there's no interpreter to spin up.

## The Standard Library Is Enough

The Go standard library has a production-quality HTTP server built in. Not "good enough for demos", actually production-quality. The net/http package is what many real services run directly without any framework on top.

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/projects", getProjects)
    mux.HandleFunc("POST /api/contact", handleContact)

    log.Fatal(http.ListenAndServeTLS(":443", "cert.pem", "key.pem", mux))
}
```

Go 1.22 added method and path parameter support to the standard router, which closes the last real gap where people were reaching for third-party routing libraries. I've built APIs with zero external packages except a database driver. The standard library handles JSON encoding, context propagation, TLS, and structured logging through slog. You need fewer dependencies than in most other ecosystems.

## What Go Gets Wrong

Error handling is verbose. You write if err != nil { return err } constantly, and there's no getting around it. The language made a deliberate choice here and the rationale is defensible, but it makes some functions tedious to read.

Generics landed in 1.18 and they work, but the constraint syntax has rough edges and the community was slow to adopt them. You'll find older libraries that duplicate code where generics would have cleaned things up.

These are real complaints. They don't change my answer for backend work. The concurrency model and deployment story are concrete wins that outweigh the verbosity for the kind of services I've been building.
