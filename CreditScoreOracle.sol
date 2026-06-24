// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CreditScoreOracle {
    struct ScoreData {
        uint256 score;
        string rating;
        uint256 timestamp;
    }
    
    struct HealthData {
        uint256 healthIndex;
        string status;
        uint256 timestamp;
    }

    mapping(address => ScoreData) public scores;
    mapping(address => HealthData) public healthInsights;

    event ScoreCalculated(address indexed user, uint256 score);
    event HealthCalculated(address indexed user, uint256 healthIndex);

    // 1. FICO CREDIT ALGORITHM (Derived from German Data Decision Tree)
    function calculateAndStoreScore(
        uint256 age, uint256 creditAmount, uint256 duration, 
        uint256 installment, uint256 residence
    ) public {
        uint256 probability = 50; 

        if (duration <= 31) {
            if (creditAmount <= 8195) { 
                if (age <= 25) { probability = 85; } else { probability = 95; }       
            } else {
                if (creditAmount <= 10975) { probability = 40; } else { probability = 20; }       
            }    
        } else {
            if (age <= 26) {
                if (duration <= 54) { probability = 30; } else { probability = 60; }       
            } else {
                if (duration <= 47) { probability = 80; } else { probability = 10; }       
            }    
        }

        uint256 score = 300 + ((probability * 550) / 100);
        string memory rating = "Fair";
        if (score >= 740) rating = "Excellent";
        else if (score >= 670) rating = "Good";
        else if (score >= 580) rating = "Fair";
        else rating = "Poor";

        scores[msg.sender] = ScoreData(score, rating, block.timestamp);
        emit ScoreCalculated(msg.sender, score);
    }

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

    function getScore(address user) public view returns (uint256, string memory, uint256) {
        ScoreData memory data = scores[user];
        return (data.score, data.rating, data.timestamp);
    }

    function getHealth(address user) public view returns (uint256, string memory, uint256) {
        HealthData memory data = healthInsights[user];
        return (data.healthIndex, data.status, data.timestamp);
    }
}