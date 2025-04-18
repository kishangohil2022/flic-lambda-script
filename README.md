# 🚀 Flic TypeScript Lambda Functions Repository

## 🛠️ Technologies Used

- 📗 Node.js (v20.x)
- 📘 TypeScript
- ☁️ AWS Lambda
- 🔧 Serverless Framework
- 📦 esbuild (for bundling)

### 🔬 Development Dependencies

- `@types/aws-lambda`: TypeScript definitions for AWS Lambda
- `@types/node`: TypeScript definitions for Node.js
- `esbuild`: JavaScript bundler and minifier
- `serverless`: Serverless Framework CLI
- `serverless-offline`: Serverless plugin for local development
- `typescript`: TypeScript compiler

## 📁 Project Structure

```sh
├── serverless.yml
├── package.json
├── pnpm-lock.yaml
├── README.md
├── .npmrc
├── src
│   └── handler.ts
└── tsconfig.json
```

## 🖥️ Usage

### 🏠 Local Development

To run the function locally:

```sh
npm start
```

This will start the Serverless Offline server on port 9000.

### 🚀 Deployment

To deploy the function to AWS:

```sh
npm run deploy
```

### 🗑️ Removal

To remove the deployed function from AWS:

```sh
npm run remove
```

## ⚙️ Configuration

- The `serverless.yml` file contains the Serverless Framework configuration.
- The `tsconfig.json` file contains the TypeScript compiler options.
- The `package.json` file lists the project dependencies and scripts.
