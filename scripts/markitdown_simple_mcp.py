#!/usr/bin/env python3
"""
Simple MarkItDown MCP Server
Provides text conversion functionality from various file formats to Markdown
"""

import asyncio
import json
import sys
from typing import Dict, Any, List

from mcp.server.models import InitializationOptions
from mcp.server import Server, NotificationOptions
from mcp.server.models import Tool
from mcp.types import (
    CallToolResult,
    TextContent,
)

try:
    from markitdown import MarkItDown
    MARKITDOWN_AVAILABLE = True
except ImportError:
    MARKITDOWN_AVAILABLE = False

# Create server instance
server = Server("markitdown-simple")

@server.list_tools()
async def handle_list_tools() -> List[Tool]:
    """List available tools"""
    if not MARKITDOWN_AVAILABLE:
        return [
            Tool(
                name="convert_text_to_markdown",
                description="Convert plain text to markdown format",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "Text to convert to markdown"
                        }
                    },
                    "required": ["text"]
                }
            )
        ]
    
    return [
        Tool(
            name="convert_file_to_markdown",
            description="Convert various file formats (PDF, DOCX, etc.) to Markdown",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Path to the file to convert"
                    }
                },
                "required": ["file_path"]
            }
        ),
        Tool(
            name="convert_text_to_markdown",
            description="Convert plain text to markdown format",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to convert to markdown"
                    }
                },
                "required": ["text"]
            }
        ),
        Tool(
            name="convert_url_to_markdown",
            description="Convert web page content to Markdown",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL to convert to markdown"
                    }
                },
                "required": ["url"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: Dict[str, Any] | None
) -> CallToolResult:
    """Handle tool calls"""
    
    if name == "convert_text_to_markdown":
        if not arguments or "text" not in arguments:
            raise ValueError("Missing required parameter: text")
        
        text = arguments["text"]
        # Simple text to markdown conversion
        markdown_text = f"```\n{text}\n```"
        
        return CallToolResult(
            content=[TextContent(type="text", text=markdown_text)]
        )
    
    elif name == "convert_file_to_markdown" and MARKITDOWN_AVAILABLE:
        if not arguments or "file_path" not in arguments:
            raise ValueError("Missing required parameter: file_path")
        
        file_path = arguments["file_path"]
        
        try:
            md = MarkItDown()
            result = md.convert(file_path)
            
            return CallToolResult(
                content=[TextContent(type="text", text=result.text_content)]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error converting file: {str(e)}")]
            )
    
    elif name == "convert_url_to_markdown" and MARKITDOWN_AVAILABLE:
        if not arguments or "url" not in arguments:
            raise ValueError("Missing required parameter: url")
        
        url = arguments["url"]
        
        try:
            md = MarkItDown()
            result = md.convert(url)
            
            return CallToolResult(
                content=[TextContent(type="text", text=result.text_content)]
            )
        except Exception as e:
            return CallToolResult(
                content=[TextContent(type="text", text=f"Error converting URL: {str(e)}")]
            )
    
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    """Main function to run the server"""
    # Read input from stdin
    async with server.stdio() as streams:
        await server.run(
            streams[0], streams[1], InitializationOptions(
                server_name="markitdown-simple",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            )
        )

if __name__ == "__main__":
    asyncio.run(main()) 