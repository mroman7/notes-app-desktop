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


3. (Optional) Manually Initialize the local database:

```bash
bun run init-db
```


## Running the desktop app with Tauri

To run the Tauri desktop wrapper in development:

```bash
bun tauri dev
```

## Build for production

### Web app

```bash
npm run build
```

### Tauri desktop bundle

Use the standard Tauri build command after installing the Rust toolchain:

```bash
npm run tauri build
```

## Project structure

- `src/app/` - application routes and page layout
- `src/components/` - reusable UI components and editor modules
- `src/hooks/` - custom React hooks
- `src/lib/` - utilities and platform helpers
- `src-tauri/` - Tauri native layer and Rust backend
- `scripts/init-db.js` - database initialization script

## Notes

- This repository is configured for a Tauri desktop experience, but can also run as a regular Next.js web app.
- If `npm run init-db` fails, ensure the `sqlite3` command is installed and available in your PATH.

## License

This repository is ready for open-source publishing. Add a license file if required.
