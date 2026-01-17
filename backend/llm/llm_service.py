"""
LLM Service - Abstract interface for AI language model integrations
"""
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import logging
import os

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate text completion"""
        pass
    
    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        schema: Optional[Dict] = None,
        max_tokens: int = 1000
    ) -> Dict:
        """Generate structured JSON output"""
        pass
    
    @abstractmethod
    async def embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts"""
        pass


class LLMService:
    """
    Main LLM service that routes to the configured provider.
    Supports OpenAI, Anthropic, and other providers.
    """
    
    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider
        self._initialized = False
    
    @classmethod
    def create(cls, provider_name: str = "openai") -> "LLMService":
        """Factory method to create LLM service with specified provider"""
        from .openai_provider import OpenAIProvider
        from .anthropic_provider import AnthropicProvider
        
        providers = {
            "openai": OpenAIProvider,
            "anthropic": AnthropicProvider,
        }
        
        provider_class = providers.get(provider_name.lower())
        if not provider_class:
            logger.warning(f"Unknown provider: {provider_name}, using OpenAI")
            provider_class = OpenAIProvider
        
        try:
            provider = provider_class()
            return cls(provider=provider)
        except Exception as e:
            logger.error(f"Failed to initialize LLM provider: {e}")
            return cls(provider=None)
    
    @property
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.provider is not None
    
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 500,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None
    ) -> str:
        """Generate text completion"""
        if not self.provider:
            raise RuntimeError("LLM service not available")
        
        return await self.provider.generate(
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=temperature,
            system_prompt=system_prompt
        )
    
    async def generate_json(
        self,
        prompt: str,
        schema: Optional[Dict] = None,
        max_tokens: int = 1000
    ) -> Dict:
        """Generate structured JSON output"""
        if not self.provider:
            raise RuntimeError("LLM service not available")
        
        return await self.provider.generate_json(
            prompt=prompt,
            schema=schema,
            max_tokens=max_tokens
        )
    
    async def embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for texts"""
        if not self.provider:
            raise RuntimeError("LLM service not available")
        
        return await self.provider.embeddings(texts)
    
    # High-level AI features
    async def analyze_resume(self, resume_text: str) -> Dict:
        """Extract structured data from resume text"""
        prompt = f"""
        Analyze this resume and extract structured information.
        
        RESUME:
        {resume_text[:4000]}
        
        Return a JSON object with:
        {{
            "name": "candidate name",
            "headline": "professional headline",
            "skills": ["skill1", "skill2"],
            "experience_years": 5,
            "experience": [
                {{"company": "", "title": "", "duration": "", "highlights": []}}
            ],
            "education": [
                {{"institution": "", "degree": "", "field": "", "year": 2020}}
            ],
            "summary": "brief professional summary"
        }}
        """
        
        return await self.generate_json(prompt)
    
    async def generate_job_description(
        self,
        title: str,
        company: str,
        requirements: List[str],
        benefits: List[str]
    ) -> str:
        """Generate a job description"""
        prompt = f"""
        Write a compelling job description for:
        
        Title: {title}
        Company: {company}
        Key Requirements: {', '.join(requirements)}
        Benefits: {', '.join(benefits)}
        
        The description should be professional, engaging, and about 300 words.
        Include sections for: About the Role, Responsibilities, Requirements, and What We Offer.
        """
        
        return await self.generate(prompt, max_tokens=800)
    
    async def suggest_skills(self, role_title: str, description: str) -> List[str]:
        """Suggest relevant skills for a role"""
        prompt = f"""
        Based on this job role, suggest 10 relevant technical and soft skills.
        
        Title: {role_title}
        Description: {description[:500]}
        
        Return ONLY a JSON array of skill strings, like:
        ["Python", "React", "Communication", "Problem Solving"]
        """
        
        result = await self.generate_json(prompt)
        if isinstance(result, list):
            return result
        return result.get("skills", [])
    
    async def match_explanation(
        self,
        engineer_profile: Dict,
        role: Dict,
        match_score: float
    ) -> str:
        """Generate an explanation for why a candidate matches a role"""
        prompt = f"""
        Explain why this candidate is a {match_score * 100:.0f}% match for this role.
        
        CANDIDATE:
        - Skills: {', '.join(engineer_profile.get('skills', []))}
        - Experience: {engineer_profile.get('experience_years', 0)} years
        - Headline: {engineer_profile.get('headline', '')}
        
        ROLE:
        - Title: {role.get('title', '')}
        - Required Skills: {', '.join(role.get('skills_required', []))}
        - Experience Level: {role.get('experience_level', '')}
        
        Write 2-3 sentences explaining the match, highlighting strengths and any gaps.
        """
        
        return await self.generate(prompt, max_tokens=150)
