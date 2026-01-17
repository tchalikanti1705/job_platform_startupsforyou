"""
Anthropic Provider - Anthropic Claude API integration for LLM features
"""
from typing import Optional, List, Dict
import logging
import os
import json

from .llm_service import LLMProvider

logger = logging.getLogger(__name__)


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API provider implementation"""
    
    def __init__(self):
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.model = os.environ.get("ANTHROPIC_MODEL", "claude-3-haiku-20240307")
        
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not set, Anthropic provider unavailable")
            raise ValueError("ANTHROPIC_API_KEY not configured")
        
        try:
            from anthropic import AsyncAnthropic
            self.client = AsyncAnthropic(api_key=self.api_key)
        except ImportError:
            logger.error("anthropic package not installed")
            raise ImportError("anthropic package required: pip install anthropic")
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate text completion using Claude"""
        try:
            kwargs = {
                "model": self.model,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            if system_prompt:
                kwargs["system"] = system_prompt
            
            response = await self.client.messages.create(**kwargs)
            
            return response.content[0].text.strip()
        
        except Exception as e:
            logger.error(f"Anthropic generation failed: {e}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        schema: Optional[Dict] = None,
        max_tokens: int = 1000
    ) -> Dict:
        """Generate structured JSON output using Claude"""
        system_prompt = "You are a helpful assistant that always responds with valid JSON only. No markdown, no explanations, just JSON."
        
        if schema:
            system_prompt += f"\n\nRespond with JSON matching this schema:\n{json.dumps(schema)}"
        
        enhanced_prompt = f"{prompt}\n\nRespond with valid JSON only."
        
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=[{"role": "user", "content": enhanced_prompt}]
            )
            
            content = response.content[0].text.strip()
            
            # Try to extract JSON if wrapped in markdown
            if content.startswith("```"):
                lines = content.split("\n")
                json_lines = []
                in_json = False
                for line in lines:
                    if line.startswith("```") and not in_json:
                        in_json = True
                        continue
                    elif line.startswith("```") and in_json:
                        break
                    elif in_json:
                        json_lines.append(line)
                content = "\n".join(json_lines)
            
            return json.loads(content)
        
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            return {}
        except Exception as e:
            logger.error(f"Anthropic JSON generation failed: {e}")
            raise
    
    async def embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Note: Anthropic doesn't have a native embeddings API.
        This would need to use a different provider for embeddings.
        """
        logger.warning("Anthropic does not support embeddings, use OpenAI or another provider")
        raise NotImplementedError("Anthropic does not support embeddings")
