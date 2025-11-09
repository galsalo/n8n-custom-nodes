# n8n-nodes-github-app-auth

Custom n8n node for GitHub with GitHub App authentication support.

## Features

- **GitHub App Authentication**: Authenticate using GitHub App credentials (App ID, Installation ID, Private Key)
- **Full GitHub API Support**: All operations from the standard GitHub node (Files, Issues, Repositories, Releases, etc.)
- **Automatic Token Management**: JWT generation and installation token caching with automatic refresh
- **Enhanced Security**: Uses short-lived installation access tokens instead of long-lived PATs

## Installation

### From npm (Recommended)

```bash
npm install n8n-nodes-github-app-auth
```

Then restart your n8n instance and the node will be available.

### From Source

1. Clone the repository:
   ```bash
   git clone https://github.com/galsalo/n8n-custom-nodes.git
   cd n8n-custom-nodes/packages/n8n-nodes-github-app
   ```

2. Build the node:
   ```bash
   npm install
   npm run build
   ```

3. Install in n8n:
   - Copy the package to n8n's custom nodes directory
   - Or link it locally for development

## GitHub App Setup

1. **Create a GitHub App**:
   - Go to GitHub Settings → Developer settings → GitHub Apps → New GitHub App
   - Set required permissions (repo, issues, pull requests, etc.)
   - Generate a private key (download the .pem file)

2. **Install the App**:
   - Install the app on your organization or repositories
   - Note the Installation ID from the URL: `https://github.com/settings/installations/{installation_id}`

3. **Get App Credentials**:
   - **App ID**: Found in app settings
   - **Installation ID**: From the installation URL
   - **Private Key**: The .pem file content (include BEGIN/END lines)

## Configuration in n8n

1. **Add Credentials**:
   - In n8n, go to Credentials → Add Credential
   - Select "GitHub App API"
   - Fill in:
     - **GitHub Server**: `https://api.github.com` (or your GitHub Enterprise URL)
     - **App ID**: Your GitHub App ID
     - **Installation ID**: The installation ID
     - **Private Key**: Paste the entire .pem file content

2. **Use the Node**:
   - Add "GitHub App" node to your workflow
   - Select your credentials
   - Choose resource and operation

## Supported Operations

- **File**: Create, Delete, Edit, Get, List
- **Issue**: Create, Comment, Edit, Get, Lock
- **Release**: Create, Delete, Get, Get All, Update
- **Repository**: Get, Get Issues, Get Pull Requests, Get License, Get Profile, List Paths, List Referrers
- **Review**: Create, Get, Get All, Update
- **Organization**: Get Repositories
- **User**: Get Repositories, Invite
- **Workflow**: Dispatch, Dispatch and Wait, Enable, Disable, Get, Get Usage, List

## Authentication Flow

1. **JWT Generation**: Creates a short-lived JWT (10 min) signed with your private key
2. **Installation Token**: Exchanges JWT for an installation access token (1 hour)
3. **Token Caching**: Tokens are cached and automatically refreshed when needed
4. **API Requests**: All requests use the installation token

## Best Practices

- **Private Key Security**: Never commit your private key to source control
- **Minimal Permissions**: Grant only necessary permissions to your GitHub App
- **Installation Scope**: Install the app only on required repositories
- **Token Refresh**: The node handles token refresh automatically

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode for development
npm run dev
```

## Troubleshooting

### Node doesn't appear in n8n
- Verify `dist/` directory exists and contains compiled files
- Check n8n logs for loading errors
- Ensure package.json `n8n` section is correct

### Authentication errors
- Verify App ID and Installation ID are correct numbers
- Ensure private key includes BEGIN and END lines
- Check GitHub App has required permissions
- Verify app is installed on the target repository

### JWT signing errors
- Ensure private key is in valid PEM format
- Try copying the key from GitHub again
- Check for extra spaces or line breaks

## License

MIT

## Author

galsalo
