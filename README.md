# SketchUp Room Redesign App

A lightweight demo app that accepts a SketchUp `.skp` file, lets a user describe a new interior style, and returns a redesigned SketchUp model. The current implementation uses a placeholder pipeline so you can plug in your own model-generation workflow later.

## Features

- Upload SketchUp `.skp` files and provide a natural language redesign prompt.
- Preview each redesign iteration inside the app.
- Receive a downloadable redesigned SketchUp model.
- Simple UI that explains the workflow and requirements.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open the app at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/server.js`: Express server with upload, preview, and download APIs.
- `public/`: Front-end UI.
- `data/`: Placeholder SketchUp output files and preview image.

## Next Steps

- Replace `data/placeholder.skp` with a real SketchUp export pipeline.
- Render real preview imagery from your SketchUp automation workflow.
- Persist job metadata to a database for long-running redesigns.
- Add authentication and storage for multi-user usage.
