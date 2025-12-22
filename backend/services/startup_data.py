"""
Known Startup Database with Funding Stages
This helps enrich job listings with accurate funding information
"""

# Known startups with funding stages (curated list)
# Format: company_name_lower -> {funding_stage, is_unicorn, founded, hq}
KNOWN_STARTUPS = {
    # Unicorns (10B+)
    "stripe": {"funding_stage": "Unicorn", "valuation": "95B", "hq": "San Francisco, CA"},
    "spacex": {"funding_stage": "Unicorn", "valuation": "150B", "hq": "Hawthorne, CA"},
    "openai": {"funding_stage": "Unicorn", "valuation": "80B", "hq": "San Francisco, CA"},
    "databricks": {"funding_stage": "Unicorn", "valuation": "43B", "hq": "San Francisco, CA"},
    "canva": {"funding_stage": "Unicorn", "valuation": "40B", "hq": "San Francisco, CA"},
    "instacart": {"funding_stage": "Unicorn", "valuation": "24B", "hq": "San Francisco, CA"},
    "discord": {"funding_stage": "Unicorn", "valuation": "15B", "hq": "San Francisco, CA"},
    "figma": {"funding_stage": "Unicorn", "valuation": "20B", "hq": "San Francisco, CA"},
    "notion": {"funding_stage": "Unicorn", "valuation": "10B", "hq": "San Francisco, CA"},
    "plaid": {"funding_stage": "Unicorn", "valuation": "13B", "hq": "San Francisco, CA"},
    "rippling": {"funding_stage": "Unicorn", "valuation": "13.5B", "hq": "San Francisco, CA"},
    "airtable": {"funding_stage": "Unicorn", "valuation": "11B", "hq": "San Francisco, CA"},
    "ramp": {"funding_stage": "Unicorn", "valuation": "8B", "hq": "New York, NY"},
    "brex": {"funding_stage": "Unicorn", "valuation": "12B", "hq": "San Francisco, CA"},
    "scale ai": {"funding_stage": "Unicorn", "valuation": "14B", "hq": "San Francisco, CA"},
    "anthropic": {"funding_stage": "Unicorn", "valuation": "18B", "hq": "San Francisco, CA"},
    
    # Series C/D (Growth Stage)
    "vercel": {"funding_stage": "Series D", "valuation": "2.5B", "hq": "San Francisco, CA"},
    "linear": {"funding_stage": "Series C", "valuation": "400M", "hq": "San Francisco, CA"},
    "mercury": {"funding_stage": "Series C", "valuation": "1.6B", "hq": "San Francisco, CA"},
    "runway": {"funding_stage": "Series C", "valuation": "1.5B", "hq": "New York, NY"},
    "retool": {"funding_stage": "Series D", "valuation": "3.2B", "hq": "San Francisco, CA"},
    "supabase": {"funding_stage": "Series C", "valuation": "500M", "hq": "San Francisco, CA"},
    "deel": {"funding_stage": "Series D", "valuation": "12B", "hq": "San Francisco, CA"},
    "webflow": {"funding_stage": "Series C", "valuation": "4B", "hq": "San Francisco, CA"},
    "loom": {"funding_stage": "Series C", "valuation": "1.5B", "hq": "San Francisco, CA"},
    "dbt labs": {"funding_stage": "Series D", "valuation": "4.2B", "hq": "Philadelphia, PA"},
    "anyscale": {"funding_stage": "Series C", "valuation": "1B", "hq": "San Francisco, CA"},
    "snyk": {"funding_stage": "Series G", "valuation": "7.4B", "hq": "Boston, MA"},
    
    # Series A/B (Early Growth)
    "resend": {"funding_stage": "Series A", "valuation": "100M", "hq": "San Francisco, CA"},
    "raycast": {"funding_stage": "Series B", "valuation": "100M", "hq": "San Francisco, CA"},
    "pylon": {"funding_stage": "Series A", "valuation": "50M", "hq": "San Francisco, CA"},
    "airplane": {"funding_stage": "Series B", "valuation": "150M", "hq": "San Francisco, CA"},
    "modal": {"funding_stage": "Series A", "valuation": "50M", "hq": "San Francisco, CA"},
    "tinybird": {"funding_stage": "Series B", "valuation": "100M", "hq": "San Francisco, CA"},
    "inngest": {"funding_stage": "Series A", "valuation": "40M", "hq": "San Francisco, CA"},
    "cal.com": {"funding_stage": "Series A", "valuation": "30M", "hq": "San Francisco, CA"},
    "posthog": {"funding_stage": "Series B", "valuation": "450M", "hq": "San Francisco, CA"},
    "dagster": {"funding_stage": "Series B", "valuation": "200M", "hq": "San Francisco, CA"},
    
    # Seed Stage
    "replo": {"funding_stage": "Seed", "valuation": "15M", "hq": "San Francisco, CA"},
    "baseten": {"funding_stage": "Series A", "valuation": "60M", "hq": "San Francisco, CA"},
    "highlight": {"funding_stage": "Seed", "valuation": "10M", "hq": "San Francisco, CA"},
    "defer": {"funding_stage": "Seed", "valuation": "5M", "hq": "San Francisco, CA"},
}

# USA tech hub cities
USA_TECH_CITIES = [
    "San Francisco", "SF", "Bay Area", "Silicon Valley", "Palo Alto", "Mountain View", 
    "Menlo Park", "Sunnyvale", "San Jose", "Oakland", "Berkeley",
    "New York", "NYC", "Manhattan", "Brooklyn",
    "Seattle", "Bellevue", "Redmond",
    "Austin", "Dallas", "Houston",
    "Boston", "Cambridge",
    "Los Angeles", "LA", "Santa Monica", "Venice",
    "Denver", "Boulder",
    "Chicago",
    "Miami",
    "Atlanta",
    "Portland",
    "San Diego",
    "Washington DC", "Washington, D.C.",
    "Philadelphia",
    "Remote"  # Include remote jobs
]


def get_funding_stage(company_name: str) -> str:
    """Get funding stage for a company"""
    if not company_name:
        return None
    
    company_lower = company_name.lower().strip()
    
    # Direct match
    if company_lower in KNOWN_STARTUPS:
        return KNOWN_STARTUPS[company_lower]["funding_stage"]
    
    # Partial match (e.g., "Stripe, Inc." -> "stripe")
    for known_company, data in KNOWN_STARTUPS.items():
        if known_company in company_lower or company_lower in known_company:
            return data["funding_stage"]
    
    return None


def is_usa_location(location: str) -> bool:
    """Check if a location is in the USA"""
    if not location:
        return False
    
    location_upper = location.upper()
    
    # Check for common USA indicators
    usa_indicators = [
        "USA", "US", "UNITED STATES", "AMERICA",
        ", CA", ", NY", ", TX", ", WA", ", MA", ", CO", ", IL", ", FL", ", GA",
        ", OR", ", PA", ", NC", ", VA", ", AZ", ", MD", ", NV", ", OH",
        "CALIFORNIA", "NEW YORK", "TEXAS", "WASHINGTON", "MASSACHUSETTS",
        "REMOTE"  # Include remote jobs
    ]
    
    for indicator in usa_indicators:
        if indicator in location_upper:
            return True
    
    # Check for known tech cities
    location_lower = location.lower()
    for city in USA_TECH_CITIES:
        if city.lower() in location_lower:
            return True
    
    return False


def categorize_funding_stage(stage_str: str) -> str:
    """Normalize funding stage string to our categories"""
    if not stage_str:
        return None
    
    stage_lower = stage_str.lower()
    
    if "unicorn" in stage_lower or "ipo" in stage_lower or "public" in stage_lower:
        return "Unicorn"
    elif any(x in stage_lower for x in ["series d", "series e", "series f", "series g", "growth"]):
        return "Series D+"
    elif "series c" in stage_lower:
        return "Series C"
    elif "series b" in stage_lower:
        return "Series B"
    elif "series a" in stage_lower:
        return "Series A"
    elif "seed" in stage_lower or "pre-seed" in stage_lower or "angel" in stage_lower:
        return "Seed"
    
    return stage_str


def enrich_job_with_startup_data(job: dict) -> dict:
    """Enrich a job listing with startup data"""
    company = job.get("company", "")
    
    # Get funding stage
    funding_stage = get_funding_stage(company)
    if funding_stage:
        job["funding_stage"] = funding_stage
        job["is_startup"] = True
    elif not job.get("funding_stage"):
        # Try to guess from company size indicators in description
        desc = job.get("description", "").lower()
        if any(word in desc for word in ["early stage", "seed", "founding team", "first hire"]):
            job["funding_stage"] = "Seed"
            job["is_startup"] = True
        elif any(word in desc for word in ["series a", "growing team", "product-market fit"]):
            job["funding_stage"] = "Series A"
            job["is_startup"] = True
        elif any(word in desc for word in ["series b", "scaling", "rapid growth"]):
            job["funding_stage"] = "Series B"
            job["is_startup"] = True
        elif any(word in desc for word in ["unicorn", "decacorn", "billion dollar"]):
            job["funding_stage"] = "Unicorn"
            job["is_startup"] = True
    
    return job
