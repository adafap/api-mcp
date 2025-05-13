/**
 * Application initialization script
 * Responsible for executing various initialization operations at application startup
 */

import { initializeMCP as initMCP } from "./mcp";

/**
 * Initialize MCP service
 * Call this function at application startup to preload MCP service
 */
export async function init() {
	try {
		console.log("===== Application Initialization Started =====");

		// Initialize MCP service
		console.log("Initializing MCP service...");
		await initMCP();
		console.log("MCP initialization successful");
	} catch (error) {
		console.error(
			"MCP initialization failed, API functionality may not work properly",
		);
		console.error(error);
	}
}

// Auto-execute initialization on file import
(async () => {
	try {
		await init();
	} catch (error) {
		console.error("Application auto-initialization failed:", error);
	}
})();
