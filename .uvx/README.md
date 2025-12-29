# UVX Fetch MCP Server Configuration

This directory contains the configuration for the UVX Fetch MCP (Multi-Client Protocol) server, which provides web scraping and data fetching capabilities for the Bulgarian-German Learning App.

## Configuration Files

- `config.json` - Main configuration file for the UVX Fetch MCP server
- `cache/` - Directory for cached responses (created automatically)
- `uvx-fetch.log` - Log file for server operations

## Server Capabilities

The UVX Fetch MCP server provides the following capabilities:

1. **Web Scraping** - Extract structured data from websites
2. **Data Fetching** - Retrieve JSON, HTML, and other content types
3. **HTML Parsing** - Parse and analyze HTML content
4. **JSON Extraction** - Extract and transform JSON data
5. **Content Analysis** - Analyze web content for patterns and structure

## Usage

The server is configured to run on `http://localhost:3001` and is the default server for UVX operations.

### Configuration Details

- **Timeout**: 30 seconds
- **Rate Limiting**: 120 requests per minute, 20 burst limit
- **Caching**: Enabled with 100MB max size, 24-hour TTL
- **Logging**: Info level logging with rotation (5 files, 5MB each)

### Security

- SSL verification enabled
- Rate limiting to prevent abuse
- Secure headers for all requests

## Integration

The UVX Fetch MCP server is integrated with the project's data enrichment pipeline and can be used for:

- Fetching vocabulary data from external sources
- Scraping grammar examples and cultural notes
- Retrieving audio pronunciation files
- Extracting structured data from language learning resources

## Starting the Server

The UVX Fetch MCP server should be started separately and will automatically use this configuration when running in this repository directory.

```bash
# Start the UVX Fetch MCP server
uvx-fetch-mcp start

# Check server status
uvx-fetch-mcp status

# Stop the server
uvx-fetch-mcp stop
```

## Troubleshooting

- Check logs: `tail -f .uvx/uvx-fetch.log`
- Clear cache: `rm -rf .uvx/cache/*`
- Verify configuration: `uvx-fetch-mcp validate`
