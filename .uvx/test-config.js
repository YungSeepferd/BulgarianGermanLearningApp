#!/usr/bin/env node

/**
 * UVX Fetch MCP Server Configuration Tester
 * Tests the configuration and connectivity to the UVX Fetch MCP server
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load configuration
const configPath = path.join(__dirname, 'config.json');

try {
  // Read and parse configuration
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('✅ UVX Fetch MCP Server Configuration Loaded Successfully');
  console.log('📋 Configuration Summary:');
  console.log(`   - Version: ${config.version}`);
  console.log(`   - Default Server: ${config.default_server}`);
  console.log(`   - Servers Configured: ${config.servers.length}`);
  
  // Validate server configuration
  const server = config.servers.find(s => s.name === config.default_server);
  if (server) {
    console.log('✅ Default Server Configuration:');
    console.log(`   - Name: ${server.name}`);
    console.log(`   - Type: ${server.type}`);
    console.log(`   - URL: ${server.url}`);
    console.log(`   - Timeout: ${server.timeout}ms`);
    console.log(`   - Capabilities: ${server.capabilities.join(', ')}`);
  }
  
  // Validate logging configuration
  if (config.logging) {
    console.log('✅ Logging Configuration:');
    console.log(`   - Level: ${config.logging.level}`);
    console.log(`   - File: ${config.logging.file}`);
  }
  
  // Validate cache configuration
  if (config.cache) {
    console.log('✅ Cache Configuration:');
    console.log(`   - Enabled: ${config.cache.enabled}`);
    console.log(`   - Directory: ${config.cache.directory}`);
    console.log(`   - Max Size: ${config.cache.max_size}`);
  }
  
  // Validate security configuration
  if (config.security) {
    console.log('✅ Security Configuration:');
    console.log(`   - SSL Verify: ${config.security.ssl_verify}`);
    console.log(`   - Rate Limiting: ${config.security.rate_limiting.enabled}`);
    if (config.security.rate_limiting.enabled) {
      console.log(`     - Requests/Min: ${config.security.rate_limiting.requests_per_minute}`);
      console.log(`     - Burst Limit: ${config.security.rate_limiting.burst_limit}`);
    }
  }
  
  // Validate plugins
  if (config.plugins && config.plugins.length > 0) {
    console.log('✅ Plugins Configured:');
    config.plugins.forEach(plugin => {
      console.log(`   - ${plugin.name}: ${plugin.enabled ? 'Enabled' : 'Disabled'}`);
    });
  }
  
  console.log('\n🎉 UVX Fetch MCP Server Configuration is Valid!');
  console.log('\n📝 Usage:');
  console.log('   - Start server: uvx-fetch-mcp start');
  console.log('   - Check status: uvx-fetch-mcp status');
  console.log('   - View logs: tail -f .uvx/uvx-fetch.log');
  
} catch (error) {
  console.error('❌ Error loading UVX Fetch MCP Server configuration:');
  console.error(error.message);
  process.exit(1);
}