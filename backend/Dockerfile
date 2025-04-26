FROM oven/bun

WORKDIR /app

COPY . .

# Install dependencies
RUN bun install

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "server.js"]
