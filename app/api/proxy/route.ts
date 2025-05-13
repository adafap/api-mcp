import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import https from "node:https";

// Create custom Axios instance, ignore SSL certificate errors (development only)
const customAxios = axios.create({
	timeout: 30000, // 30 seconds timeout
	httpsAgent: new https.Agent({
		rejectUnauthorized: false, // Ignore self-signed certificate errors
	}),
});

export async function POST(request: NextRequest) {
	const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
	console.log(`[API Proxy:${requestId}] ==== Start processing request ====`);

	try {
		// Get API call information from request body
		const requestBody = await request.json();
		const { url, method, data, headers = {} } = requestBody;

		console.log(
			`[API Proxy:${requestId}] Received request: ${method.toUpperCase()} ${url}`,
		);
		console.log(
			`[API Proxy:${requestId}] Complete request body:`,
			JSON.stringify(requestBody),
		);
		console.log(`[API Proxy:${requestId}] Request data:`, JSON.stringify(data));

		// Build complete URL
		const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3030";
		const fullUrl = url.startsWith("http") ? url : `${apiBaseUrl}${url}`;

		// Build request options
		const options = {
			method: method.toUpperCase(),
			url: fullUrl,
			...(method.toLowerCase() === "get" ? { params: data } : { data }),
			headers,
			// Prevent CORS issues
			withCredentials: false,
			maxRedirects: 5,
		};

		console.log(`[API Proxy:${requestId}] Sending request to:`, options.url);
		console.log(
			`[API Proxy:${requestId}] Request options:`,
			JSON.stringify(options, null, 2),
		);

		// Try multiple ways to send request
		let response: any;

		try {
			response = await customAxios(options);
		} catch (axiosError: any) {
			// If custom Axios instance fails, try standard Axios
			console.log(
				`[API Proxy:${requestId}] Custom Axios failed, trying standard Axios`,
			);
			response = await axios(options);
		}

		console.log(
			`[API Proxy:${requestId}] Received response: status=${response.status}`,
		);
		console.log(
			`[API Proxy:${requestId}] Response data:`,
			`${JSON.stringify(response.data).substring(0, 500)}...`,
		);
		console.log(
			`[API Proxy:${requestId}] ==== Request processing complete ====`,
		);

		// Return result
		return NextResponse.json(response.data);
	} catch (error: any) {
		console.error(`[API Proxy:${requestId}] Request failed:`, error);

		if (error.response) {
			console.error(
				`[API Proxy:${requestId}] Response status:`,
				error.response.status,
			);
			console.error(
				`[API Proxy:${requestId}] Response data:`,
				error.response.data,
			);
		}

		// Try to extract detailed error information
		const errorMessage = error.message || "Unknown error";
		const errorStatus = error.response?.status || 500;
		const errorDetails = error.response?.data || {};

		console.error(`[API Proxy:${requestId}] Error message:`, errorMessage);
		console.error(`[API Proxy:${requestId}] Status code:`, errorStatus);
		console.error(`[API Proxy:${requestId}] Details:`, errorDetails);
		console.log(`[API Proxy:${requestId}] ==== Request processing failed ====`);

		// Build error response
		const errorData = {
			success: false,
			error: true,
			message: errorMessage,
			status: errorStatus,
			details: errorDetails,
		};

		return NextResponse.json(errorData, { status: errorStatus });
	}
}
