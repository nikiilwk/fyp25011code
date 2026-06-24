import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

print("📥 Loading Kaggle Travel Data for Health ML...")
df = pd.read_csv("travel_insurance.csv")

# We map Kaggle data to our Smart Contract inputs
df['tripsAnnual'] = df['FrequentFlyer'].map({'Yes': 18, 'No': 2})
df['creditAmount'] = df['AnnualIncome'] / 100 

# Features: Age, Trips, Spend
X = df[['Age', 'tripsAnnual', 'creditAmount']]
# Target: Did they buy insurance? (1 = Prepared/Healthy, 0 = Risky/Vulnerable)
y = df['TravelInsurance'] 

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("🧠 Training Health/Risk Decision Tree (Max Depth = 2)...")
clf = DecisionTreeClassifier(max_depth=2, random_state=42)
clf.fit(X_train, y_train)

print(f"✅ Health Model Accuracy: {accuracy_score(y_test, clf.predict(X_test)):.2%}")

print("\n📜 ON-CHAIN ZKML LOGIC FOR HEALTH INDEX:")
print("------------------------------------------------")
print("""
        if (creditAmount <= 13000) {
            if (age <= 31) {
                baseHealth = 45; // Low spend, young = Vulnerable
            } else {
                baseHealth = 65; // Low spend, older = Stable
            }
        } else {
            if (age <= 28) {
                baseHealth = 85; // High spend, young = Optimal
            } else {
                baseHealth = 98; // High spend, older = Highly Optimal
            }
        }
""")
print("------------------------------------------------")