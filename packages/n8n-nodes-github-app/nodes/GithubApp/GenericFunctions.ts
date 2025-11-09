import type {
	IExecuteFunctions,
	IHookFunctions,
	IDataObject,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
import jwt from 'jsonwebtoken';

// Token cache to avoid generating new tokens on every request
interface TokenCache {
	token: string;
	expiresAt: number;
}

const installationTokenCache = new Map<string, TokenCache>();

/**
 * Format private key by replacing literal \n with actual newlines
 * Handles cases where users paste keys with escaped newlines
 */
function formatPrivateKey(privateKey: string): string {
	// Trim whitespace from start and end
	let key = privateKey.trim();

	// If the key has actual newlines, it's likely already properly formatted
	if (key.includes('\n')) {
		return key;
	}

	// Replace literal \n with actual newlines (handles copy-paste issues)
	key = key.replace(/\\n/g, '\n');

	return key;
}

/**
 * Generate JWT for GitHub App authentication
 */
function generateJWT(appId: number, privateKey: string): string {
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		iat: now - 60, // Issued at time (60 seconds in the past to account for clock drift)
		exp: now + 600, // JWT expiration time (10 minutes maximum)
		iss: appId.toString(), // GitHub App's identifier
	};

	try {
		// Format the private key to handle various input formats
		const formattedKey = formatPrivateKey(privateKey);

		return jwt.sign(payload, formattedKey, { algorithm: 'RS256' });
	} catch (error) {
		throw new Error(
			`Failed to generate GitHub App JWT. Please verify your private key is in valid PEM format: ${error.message}`,
		);
	}
}

/**
 * Get or refresh installation access token
 */
async function getInstallationToken(
	context: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	appId: number,
	installationId: number,
	privateKey: string,
	baseUrl: string,
): Promise<string> {
	const cacheKey = `${appId}-${installationId}`;
	const cached = installationTokenCache.get(cacheKey);

	// Return cached token if still valid (with 5 minute buffer)
	if (cached && cached.expiresAt > Date.now() + 300000) {
		return cached.token;
	}

	// Generate JWT for authentication
	const jwtToken = generateJWT(appId, privateKey);

	// Request installation access token
	const options: IRequestOptions = {
		method: 'POST',
		headers: {
			'User-Agent': 'n8n',
			Authorization: `Bearer ${jwtToken}`,
			Accept: 'application/vnd.github.v3+json',
		},
		uri: `${baseUrl}/app/installations/${installationId}/access_tokens`,
		json: true,
	};

	try {
		const response = await context.helpers.request(options);
		const token = response.token;
		const expiresAt = new Date(response.expires_at).getTime();

		// Cache the token
		installationTokenCache.set(cacheKey, { token, expiresAt });

		return token;
	} catch (error) {
		throw new NodeApiError(context.getNode(), error as JsonObject, {
			message: 'Failed to get GitHub App installation token',
		});
	}
}

/**
 * Make an API request to Github
 *
 */
export async function githubApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: object,
	query?: IDataObject,
	option: IDataObject = {},
): Promise<any> {
	const options: IRequestOptions = {
		method,
		headers: {
			'User-Agent': 'n8n',
			Accept: 'application/vnd.github.v3+json',
		},
		body,
		qs: query,
		uri: '',
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	try {
		// Get GitHub App credentials
		const credentials = await this.getCredentials('githubAppApi');
		const baseUrl = (credentials.server as string) || 'https://api.github.com';
		const appId = credentials.appId as number;
		const installationId = credentials.installationId as number;
		const privateKey = credentials.privateKey as string;

		// Get installation access token (cached or fresh)
		const token = await getInstallationToken(this, appId, installationId, privateKey, baseUrl);

		// Set authorization header with installation token
		options.headers = {
			...options.headers,
			Authorization: `Bearer ${token}`,
		};

		options.uri = `${baseUrl}${endpoint}`;

		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Returns the SHA of the given file
 *
 * @param {(IHookFunctions | IExecuteFunctions)} this
 */
export async function getFileSha(
	this: IHookFunctions | IExecuteFunctions,
	owner: string,
	repository: string,
	filePath: string,
	branch?: string,
): Promise<any> {
	const query: IDataObject = {};
	if (branch !== undefined) {
		query.ref = branch;
	}

	const getEndpoint = `/repos/${owner}/${repository}/contents/${encodeURI(filePath)}`;
	const responseData = await githubApiRequest.call(this, 'GET', getEndpoint, {}, query);

	if (responseData.sha === undefined) {
		throw new NodeOperationError(this.getNode(), 'Could not get the SHA of the file.');
	}
	return responseData.sha;
}

export async function githubApiRequestAllItems(
	this: IHookFunctions | IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,

	body: any = {},
	query: IDataObject = {},
): Promise<any> {
	const returnData: IDataObject[] = [];

	let responseData;

	query.per_page = 100;
	query.page = 1;

	do {
		responseData = await githubApiRequest.call(this, method, endpoint, body as IDataObject, query, {
			resolveWithFullResponse: true,
		});
		query.page++;
		returnData.push.apply(returnData, responseData.body as IDataObject[]);
	} while (responseData.headers.link?.includes('next'));
	return returnData;
}

export function isBase64(content: string) {
	const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	return base64regex.test(content);
}

export function validateJSON(json: string | undefined): any {
	let result;
	try {
		result = JSON.parse(json!);
	} catch (exception) {
		result = undefined;
	}
	return result;
}
