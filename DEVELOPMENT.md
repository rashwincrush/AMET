# Development Setup and Port Configuration

## Port Configuration

The development server must run exclusively on port 3000. This is the designated port for all development activities and should be used consistently across the project.

### Starting the Development Server

1. Ensure no other processes are running on port 3000 before starting the server
2. Start the development server using:
   ```bash
   npm run dev
   ```

### Port Usage Policy

- **Development Server**: Port 3000
- All other services should use different ports
- Always verify port availability before starting the server
- If you encounter port conflicts, terminate other processes using port 3000

### Checking Port Usage

To check if port 3000 is in use:
```bash
lsof -i :3000
```

To terminate processes using port 3000:
```bash
kill $(lsof -t -i:3000)
```

## Development Server Commands

- Start the server: `npm run dev`
- Stop the server: Press Ctrl+C in the terminal or run `kill $(lsof -t -i:3000)`
- Restart the server: Stop and then start again using the above commands

## Important Notes

- Always use port 3000 for development
- Never run multiple instances of the development server
- Ensure only one instance of the server is running at a time
- Follow these port configuration guidelines to avoid conflicts and ensure consistent development environment
