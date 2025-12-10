# On-Chain-Live-Concerts-Ticketing-System

This README provides a step-by-step guide to setting up and working with an IOTA Move package for on chain live concerts ticketing system.

## Prerequisites

- Ensure you have the IOTA Move CLI installed.
- Familiarity with Move language and IOTA dApp concepts is helpful.

## Setup Instructions

### 1. Create a New Package
Run the following command to create a new IOTA Move package:
```bash
iota move new live_concert
```
This will generate the following structure:
- `sources/`: Folder to store your module files.
- `tests/`: Folder to store your test files.
- `Move.toml`: Configuration file for the package.

### 2. Write the `live_concert` Module
Navigate to the `sources` folder and create a new file named `live_concert.move`:
```bash
cd live_concert/sources
touch live_concert.move
```
Write your module code in `live_concert.move`.

### 3. Write Tests for the Module
Navigate to the `tests` folder and write the test cases for your module:
```bash
cd ../tests
touch live_concert_tests.move
```
Add appropriate tests to validate your module's functionality.

## Build and Test the Package

### Build the Package
Run the following command to build the package:
```bash
iota move build
```

### Test the Package
Execute the test cases by running:
```bash
iota move test
```

## Publish the Package

Once your package is ready, publish it to the IOTA client:
```bash
iota client publish
```

For Live Concert Ticketing System frontend, refer to the dedicated [README](./frontend/README.md) file in the frontend folder.