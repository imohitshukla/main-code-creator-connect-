/**
 * Compatibility shim — real implementation is in db/config/database.js
 * This file exists so existing imports like "../config/database.js" continue to work
 * without needing to update every controller, middleware, and script.
 */
export { client, pool } from '../db/config/database.js';
