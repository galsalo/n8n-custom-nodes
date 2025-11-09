# n8n Custom Nodes

A collection of custom n8n community nodes, each independently published to npm.

## Structure

Each node is contained in its own package under `packages/` and is published separately:

```
n8n-custom-nodes/
├── packages/
│   ├── n8n-nodes-github-app/    # GitHub App authentication node
│   └── ...                       # Future custom nodes
└── README.md
```

## Available Nodes

### n8n-nodes-github-app
n8n node for GitHub with GitHub App authentication support.

- **Package**: `n8n-nodes-github-app`
- **Location**: `packages/n8n-nodes-github-app/`
- **Documentation**: See package README

## Adding a New Node

1. Create a new directory under `packages/` with the naming convention `n8n-nodes-{name}`
2. Set up the node package structure following n8n community node guidelines
3. Each node is completely independent with its own:
   - `package.json`
   - Dependencies
   - Build configuration
   - Tests
   - Documentation

## Publishing

Each node is published independently to npm from its own package directory:

```bash
cd packages/n8n-nodes-{name}
npm publish
```

## Development

To work on a specific node:

```bash
cd packages/n8n-nodes-{name}
npm install
npm run build
npm run dev
```

## License

MIT