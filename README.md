# Notepad

A modern local note-taking and project workspace built with Next.js, React, Tailwind CSS and Tauri.

## About

`notepad` is a desktop-first note and project management app with rich editor support and a lightweight local database. It includes note pages, project and task organization, a kanban-style workspace, theme support, and a native Tauri wrapper for cross-platform desktop deployment.

## Features

- Next.js + React frontend
- Markdown/editor support
- Notes, projects, and task management
- Kanban-style board interface
- Light/dark theme support
- Local SQLite database for persistent storage
- Tauri support for desktop builds

## Requirements

- Node.js 20+ (or a compatible Node 20 runtime)
- npm
- Rust toolchain for Tauri desktop builds
- `sqlite3` CLI if you want to initialize the local database manually with `npm run init-db`

### Note: 
this app uses local `sqlite` database seperate for both dev server and production. 
- for Production 


## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd notepad
```

2. Install dependencies:

```bash
bun install

# install tauri dependencies
cd src-tauri
cargo build
```


## Running the desktop app with Tauri

To run the Tauri desktop wrapper in development:

```bash
bun tauri dev
```

## Build for production

### Tauri desktop bundle
Use the standard Tauri build command after installing the Rust toolchain:

`bun run tauri build`

### Note: 
By default it creates a linux (.deb) file on build. In order to build this app installable/executeable for your OS, you need to change value of `"targets": "deb"` in `src-tauri/tauri.conf.json` file.

Bundled file can be found at `src-tauri/target/release/bundle/`
for example for `.deb`, it is `src-tauri/target/release/bundle/deb/notepad_0.1.0_amd64.deb`



## Project structure

- `src/app/` - application routes and page layout
- `src/components/` - reusable UI components and editor modules
- `src/hooks/` - custom React hooks
- `src/lib/` - utilities and platform helpers
- `src-tauri/` - Tauri native layer and Rust backend

