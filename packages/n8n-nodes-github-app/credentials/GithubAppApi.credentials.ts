import type {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GithubAppApi implements ICredentialType {
	name = 'githubAppApi';

	displayName = 'GitHub App API';

	documentationUrl = 'https://docs.github.com/en/developers/apps/building-github-apps/authenticating-with-github-apps';

	properties: INodeProperties[] = [
		{
			displayName: 'GitHub Server',
			name: 'server',
			type: 'string',
			default: 'https://api.github.com',
			description: 'The server to connect to. Leave default for GitHub.com, or use your GitHub Enterprise Server API URL.',
		},
		{
			displayName: 'App ID',
			name: 'appId',
			type: 'number',
			default: 0,
			required: true,
			description: 'The App ID of your GitHub App (found in app settings)',
		},
		{
			displayName: 'Installation ID',
			name: 'installationId',
			type: 'number',
			default: 0,
			required: true,
			description: 'The Installation ID for your GitHub App installation. Find this in your app\'s installation settings or in the URL when viewing the installation.',
		},
		{
			displayName: 'Private Key',
			name: 'privateKey',
			type: 'string',
			typeOptions: {
				password: true,
				rows: 8,
			},
			default: '',
			required: true,
			description: 'The private key (PEM format) generated for your GitHub App. Include the BEGIN and END lines.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {},
		},
	};
}
