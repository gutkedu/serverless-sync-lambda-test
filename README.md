# Serverless Multi-Runtime Lambda Performance Test

A comparative study of AWS Lambda functions across different programming languages and runtimes, measuring performance, cold start times, and resource utilization.

## Overview

This repository contains identical Lambda functions implemented in multiple languages to compare:
- **Cold start performance**
- **Execution time**
- **Memory usage**

## Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────┐
│   API Gateway   │───▶│   Lambda     │───▶│  DynamoDB   │
│                 │    │ (Multi-Lang) │    │   Table     │
└─────────────────┘    └──────────────┘    └─────────────┘
```

## Supported Runtimes

| Language | Runtime | Status |
|----------|---------|--------|
| Go       | `go1.x` | ✅ Active |
| Node.js  | `nodejs20.x` | 🚧 Available |
| Rust     | `provided.al2` | 🚧 Available |

## Project Structure

```
├── golang/           # Go implementation
├── nodejs/           # Node.js implementation  
├── rust/            # Rust implementation
├── db/              # DynamoDB CloudFormation
├── test/k6/         # Performance tests (k6)
└── template.yaml    # Main CloudFormation stack
```

## Quick Start

1. **Deploy the stack:**
   ```bash
   sam build
   sam deploy --guided
   ```

2. **Run performance tests:**
   ```bash
   cd test/k6
   ./run.sh
   ```

## Key Features

- **Lazy initialization** patterns for DynamoDB clients
- **Shared infrastructure** using nested CloudFormation stacks  
- **Performance testing** with k6 load testing framework
- **Identical functionality** across all runtimes for fair comparison

## Testing

Each implementation:
- Records request source IP in DynamoDB
- Uses lazy initialization for optimal performance
- Implements proper error handling
- Follows language-specific best practices

## Performance Metrics

Use the included k6 tests to measure:
- Cold start latency
- Warm invocation performance  
- Throughput under load
- Memory consumption patterns
