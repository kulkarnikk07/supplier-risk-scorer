import httpx
import os
from dotenv import load_dotenv

load_dotenv()

SAM_API_KEY = os.getenv("SAM_API_KEY")
SAM_BASE_URL = "https://api.sam.gov/entity-information/v3/entities"

async def search_suppliers(
    naics_code: str = None,
    state: str = None,
    business_type: str = None,
    limit: int = 10
):
    """
    Search for suppliers on SAM.gov by NAICS code, state, and business type
    """

    # Build query parameters — SAM.gov returns 10 records per page by default
    params = {
        "api_key": SAM_API_KEY,
        "samRegistered": "Yes",
        "registrationStatus": "A",  # A = Active vendors only
    }

    # Add optional filters
    if naics_code:
        params["naicsCode"] = naics_code
    if state:
        params["physicalAddressProvinceOrStateCode"] = state
    if business_type:
        params["businessTypeCode"] = business_type

    # Make the API call
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                SAM_BASE_URL,
                params=params,
                timeout=30.0
            )

            # Debug: print the actual URL being called
            print(f"Calling URL: {response.url}")
            print(f"Status Code: {response.status_code}")

            response.raise_for_status()
            data = response.json()

            # Parse and return clean supplier list
            suppliers = []
            entities = data.get("entityData", [])

            for entity in entities:
                registration = entity.get("entityRegistration", {})
                core_data = entity.get("coreData", {})
                address = core_data.get("physicalAddress", {})

                supplier = {
                    "uei": registration.get("ueiSAM", ""),
                    "name": registration.get("legalBusinessName", ""),
                    "state": address.get("stateOrProvinceCode", ""),
                    "city": address.get("city", ""),
                    "registration_status": registration.get("registrationStatus", ""),
                    "cage_code": registration.get("cageCode", ""),
                    "expiration_date": registration.get("registrationExpirationDate", ""),
                }
                suppliers.append(supplier)

            return {
                "total": data.get("totalRecords", 0),
                "suppliers": suppliers
            }

        except httpx.HTTPStatusError as e:
            print(f"HTTP Error: {e.response.status_code}")
            print(f"Response body: {e.response.text}")
            return {
                "error": f"SAM.gov API error: {e.response.status_code}",
                "details": e.response.text
            }
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}