#!/usr/bin/env python3
"""
Basic MarkItDown MCP Server
Provides basic text conversion functionality
"""

import asyncio
import json
import sys
import os
from typing import Dict, Any, List

async def main():
    """Basic MCP Server implementation"""
    
    # Simple tool definitions
    tools = [
        {
            "name": "convert_text_to_markdown",
            "description": "Convert plain text to markdown format",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to convert to markdown"
                    }
                },
                "required": ["text"]
            }
        },
        {
            "name": "format_as_code",
            "description": "Format text as a code block",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "Text to format as code"
                    },
                    "language": {
                        "type": "string",
                        "description": "Programming language for syntax highlighting",
                        "default": ""
                    }
                },
                "required": ["text"]
            }
        }
    ]
    
    # Read from stdin
    try:
        while True:
            line = input()
            if not line:
                break
            
            try:
                message = json.loads(line)
                
                if message.get("method") == "tools/list":
                    response = {
                        "jsonrpc": "2.0",
                        "id": message.get("id"),
                        "result": {
                            "tools": tools
                        }
                    }
                    print(json.dumps(response))
                    
                elif message.get("method") == "tools/call":
                    params = message.get("params", {})
                    tool_name = params.get("name")
                    arguments = params.get("arguments", {})
                    
                    if tool_name == "convert_text_to_markdown":
                        text = arguments.get("text", "")
                        markdown_text = f"**Converted Text:**\n\n{text}\n\n*Converted using MarkItDown MCP*"
                        
                        response = {
                            "jsonrpc": "2.0",
                            "id": message.get("id"),
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": markdown_text
                                    }
                                ]
                            }
                        }
                        print(json.dumps(response))
                        
                    elif tool_name == "format_as_code":
                        text = arguments.get("text", "")
                        language = arguments.get("language", "")
                        
                        code_block = f"```{language}\n{text}\n```"
                        
                        response = {
                            "jsonrpc": "2.0",
                            "id": message.get("id"),
                            "result": {
                                "content": [
                                    {
                                        "type": "text",
                                        "text": code_block
                                    }
                                ]
                            }
                        }
                        print(json.dumps(response))
                        
                    else:
                        response = {
                            "jsonrpc": "2.0",
                            "id": message.get("id"),
                            "error": {
                                "code": -32601,
                                "message": f"Unknown tool: {tool_name}"
                            }
                        }
                        print(json.dumps(response))
                        
                elif message.get("method") == "initialize":
                    response = {
                        "jsonrpc": "2.0",
                        "id": message.get("id"),
                        "result": {
                            "protocolVersion": "2024-11-05",
                            "capabilities": {
                                "tools": {}
                            },
                            "serverInfo": {
                                "name": "markitdown-basic",
                                "version": "1.0.0"
                            }
                        }
                    }
                    print(json.dumps(response))
                    
            except json.JSONDecodeError:
                continue
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": message.get("id", None),
                    "error": {
                        "code": -32603,
                        "message": f"Internal error: {str(e)}"
                    }
                }
                print(json.dumps(error_response))
                
    except EOFError:
        pass

if __name__ == "__main__":
    asyncio.run(main()) 