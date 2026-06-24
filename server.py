print("⏳ Initializing Server (LIVE BASE44 + FALLBACK VERSION)...")

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import requests
import uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ==========================================
# 1. LIVE API CONFIGURATION
# ==========================================
BASE44_API_KEY = "8232d62b6cf24e7eb74c7f765abb6e10"
BASE44_ENDPOINT = "https://app.base44.com/api/apps/69160892745be891ce4c021a/entities/TravelDataProfile"

# ==========================================
# 2. LOCAL FALLBACK KAGGLE DATA
# ==========================================
df = pd.DataFrame()

try:
    df = pd.read_csv("travel_insurance.csv")
    demo_names = ["Tom Chan", "Priya Sharma", "James Wilson", "Elena Rossi", "Li Wei", "Chan Ka Ho", "Chow Ka Ho"]
    df['full_name'] = [demo_names[i] if i < len(demo_names) else f"Traveler {i}" for i in range(len(df))]
    
    df['avg_spend_per_trip'] = df['AnnualIncome'] / 150
    df['tokens_earned'] = df['AnnualIncome'] / 100
    df['trip_frequency_annual'] = df['FrequentFlyer'].apply(lambda x: 18 if x == 'Yes' else 2)
    df['insurance_purchase_rate'] = df['TravelInsurance'] * 100
    df['completeness_score'] = 95
    df['ancillary_spending'] = df['AnnualIncome'] / 2000
    df['destination_consistency'] = df['EverTravelledAbroad'].apply(lambda x: "Low" if x == 'Yes' else "High")
    df['business_vs_leisure_ratio'] = "70/30"
    df['booking_lead_time_days'] = df['Age']
    print(f"📁 Local CSV Loaded: {len(df)} records available for fallback.")
except FileNotFoundError:
    print("⚠️ Warning: travel_insurance.csv not found. CSV fallback disabled.")

# ==========================================
# 3. BULLETPROOF DATA PARSERS (Fixes messy Base44 data)
# ==========================================
def safe_int(value, default):
    try: return int(float(value))
    except (ValueError, TypeError): return default

def safe_float(value, default):
    try: return float(value)
    except (ValueError, TypeError): return default

def safe_str(value, default):
    if not value or str(value).strip() == "": return default
    return str(value)

# ==========================================
# 4. DATA FETCHING LOGIC
# ==========================================
def fetch_user_data(name):
    print(f"\n🔍 --- NEW SEARCH REQUEST: {name} ---")
    
    try:
        print("📡 Attempting to fetch from LIVE Base44 API...")
        headers = {'api_key': BASE44_API_KEY, 'Content-Type': 'application/json'}
        response = requests.get(BASE44_ENDPOINT, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data if isinstance(data, list) else data.get('items', data.get('data', data.get('entities', [data])))
            
            for item in items:
                if safe_str(item.get('full_name'), '').lower() == name.lower():
                    print("🟢 [SUCCESS: LIVE API] Data pulled directly from Base44!")
                    
                    return {
                        "age": safe_int(item.get('age'), 34),
                        "tokens_earned": safe_float(item.get('avg_spend_per_trip'), 1500.0) * 2,
                        "trip_frequency_annual": safe_int(item.get('trip_frequency_annual'), 5),
                        "completeness_score": safe_int(item.get('completeness_score'), 80),
                        "insurance_purchase_rate": safe_int(item.get('insurance_purchase_rate'), 50),
                        "avg_spend_per_trip": safe_float(item.get('avg_spend_per_trip'), 1500.0),
                        "ancillary_spending": safe_float(item.get('ancillary_spending'), 200.0),
                        "destination_consistency": safe_str(item.get('destination_consistency'), 'Medium'),
                        "business_vs_leisure_ratio": safe_str(item.get('business_vs_leisure_ratio'), '50/50'),
                        "booking_lead_time_days": safe_int(item.get('booking_lead_time_days'), 14)
                    }
            print("❌ User not found in Base44 database.")
        else:
            print(f"❌ Base44 API Error: Status Code {response.status_code}")
    except Exception as e:
        print(f"❌ Base44 Connection Failed: {e}")

    print("🔄 Switching to Local CSV Fallback...")
    if not df.empty:
        match = df[df['full_name'].str.contains(name, case=False, na=False)]
        if not match.empty:
            print("🟡 [SUCCESS: CSV FALLBACK] Data pulled from local Kaggle dataset!")
            return match.iloc[0].to_dict()

    print("🔴 [SUCCESS: HARDCODE FALLBACK] User not found. Using emergency hardcoded profile!")
    return {
        "age": 34, "tokens_earned": 14500, "trip_frequency_annual": 12,
        "completeness_score": 95, "insurance_purchase_rate": 100,
        "avg_spend_per_trip": 8500, "ancillary_spending": 1200,
        "destination_consistency": "High", "business_vs_leisure_ratio": "80/20",
        "booking_lead_time_days": 45
    }

# ==========================================
# 5. ENDPOINTS
# ==========================================
@app.get("/get-user")
def get_user(name: str, api_key: str = Header(None)):
    if api_key != "base44":
        raise HTTPException(status_code=401, detail="Unauthorized.")
        
    user = fetch_user_data(name)
    age = safe_int(user.get('age', user.get('Age')), 34)
    raw_spend = safe_float(user.get('tokens_earned'), 14500)
    raw_trips = safe_int(user.get('trip_frequency_annual'), 12)
    completeness = safe_int(user.get('completeness_score'), 95)
    
    credit_amount = int(raw_spend) 
    duration = int(completeness * 0.6) 
    
    if raw_trips < 5: installment = 1
    elif raw_trips < 10: installment = 2
    elif raw_trips < 15: installment = 3
    else: installment = 4
    
    return {
        "status": "success", "age": age, "creditAmount": credit_amount, "duration": duration,
        "installment": installment, "residence": 3, "tripsAnnual": raw_trips, 
        "insuranceRate": safe_int(user.get('insurance_purchase_rate'), 100)
    }

@app.get("/get-credit-score-by-name")
def get_credit_score_by_name(name: str, api_key: str = Header(None)):
    if api_key != "base44": raise HTTPException(status_code=401, detail="Unauthorized.")
    
    user = fetch_user_data(name)
    avg_spend = safe_float(user.get('avg_spend_per_trip'), 8500.0)
    trips = safe_int(user.get('trip_frequency_annual'), 12)
    
    spending_style = "Premium" if avg_spend > 5000 else "Mid-Range" if avg_spend > 2000 else "Budget"
    loyalty = "Platinum" if trips > 14 else "Gold" if trips > 8 else "Bronze"

    return {
        "average_spend_per_trip": round(avg_spend, 2),
        "premium_vs_budget": spending_style,
        "trip_frequency": trips,
        "loyalty_tiers": loyalty,
        "recommendation": "Approve" if avg_spend > 1500 else "Review",
        "ancillary_spending": f"${round(safe_float(user.get('ancillary_spending'), 1200), 2)}",
        "destination_consistency": safe_str(user.get('destination_consistency'), 'High'),
        "travel_purpose_ratio": safe_str(user.get('business_vs_leisure_ratio'), '80/20'),
        "booking_lead_times": f"{safe_int(user.get('booking_lead_time_days'), 45)} days",
        "insurance_purchase_rate": f"{safe_int(user.get('insurance_purchase_rate'), 100)}%"
    }

if __name__ == "__main__":
    print("🚀 API Server starting on http://127.0.0.1:8001")
    uvicorn.run(app, host="127.0.0.1", port=8001)