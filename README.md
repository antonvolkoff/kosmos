# Kosmos

Kosmos is a graphic development environment for Clojure.

## Development

Project uses NPM as a runner for development, testing and releasing. Here is a list of commands to
get you started:

| Command | Description |
|---------|-------------|
| npm run dev | Watches for file changes, compiles changed files and starts electron. |
| npm run test | Compiles code and executes tests. |
| npm run release | Compiles code and packages application with electron forge. |

# Version v21.0

## Development

Kosmos has few scripts inside of `/bin` directory to help with development.

| Example | Description |
|---------|-------------|
| ./bin/kosmos | Starts application with nREPL. Best workflow for development. |
| ./bin/test | Run unit tests. |
| ./bin/test --watch | Watch for file changes and run tests. |
