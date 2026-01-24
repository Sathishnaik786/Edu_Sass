import requests
import json

url = "http://localhost:3003/api/admission/pet/apply"
payload = {
  "candidate_type": "EXTERNAL",
  "email": "test@example.com",
  "mobile": "1234567890",
  "identity_document": "ID12345",
  "personal_details": { "full_name": "Test User", "dob": "2000-01-01", "gender": "M", "contact_number": "12345", "address": "Test Address" },
  "academic_details": { "qualifying_degree": "TEST", "university": "TEST U", "year_of_passing": 2020, "percentage": 80 },
  "research_interest": { "area_of_interest": "TEST AI" }
}

try:
    print("Sending request...")
    response = requests.post(url, json=payload, timeout=20)
    print("Status Code:", response.status_code)
    print("Response:", response.json())
except Exception as e:
    print("Error:", e)
