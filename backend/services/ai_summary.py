import httpx
import os
from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

async def generate_supplier_summary(supplier: dict) -> str:
    """
    Generate a plain English AI summary for a supplier
    using the Claude API
    """

    # Build a structured prompt from supplier data
    prompt = f"""
You are a federal procurement analyst. Based on the following supplier data, 
write a concise 3-4 sentence professional summary for a procurement officer.
Focus on: risk level, past performance, diversity status, and a recommendation.

Supplier Data:
- Name: {supplier.get('name', 'Unknown')}
- Location: {supplier.get('city', '')}, {supplier.get('state', '')}
- SAM Registration: {supplier.get('registration_status', 'Unknown')}
- Registration Expires: {supplier.get('expiration_date', 'Unknown')}
- CAGE Code: {supplier.get('cage_code', 'N/A')}
- Risk Score: {supplier.get('risk_score', 0)}/100
- Diversity Score: {supplier.get('diversity_score', 0)}/100
- Certifications: {', '.join(supplier.get('certifications', [])) or 'None'}
- Total Contract Awards: ${supplier.get('total_awards', 0):,}
- Number of Contracts: {supplier.get('contract_count', 0)}
- Agencies Served: {', '.join(supplier.get('agencies_served', [])) or 'None'}
- Last Award Date: {supplier.get('last_award_date', 'Unknown')}

Write a professional 3-4 sentence summary. Be specific with numbers.
End with a clear recommendation (Recommended / Use with Caution / Not Recommended).
"""

    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }

    body = {
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 300,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=body,
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]

        except httpx.HTTPStatusError as e:
            return f"Error generating summary: {e.response.status_code}"
        except Exception as e:
            return f"Error: {str(e)}"