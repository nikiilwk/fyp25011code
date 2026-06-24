import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ==========================================
# 1. LOAD & CLEAN DATA
# ==========================================
print("📥 Loading German Credit Data...")

# Define columns manually because 'german.data' has no header
columns = [
    "Status", "Duration", "Credit_History", "Purpose", "Credit_Amount",
    "Savings", "Employment", "Installment_Rate", "Personal_Status_Sex", "Guarantors",
    "Residence", "Property", "Age", "Other_Installment_Plans", "Housing",
    "Num_Credits", "Job", "People_Liable", "Telephone", "Foreign_Worker", "Risk"
]

try:
    # Load the file using space separator
    df = pd.read_csv("german.data", sep=' ', names=columns, index_col=False)
except FileNotFoundError:
    print("❌ Error: 'german.data' not found. Make sure it is in the same folder!")
    exit()

# Features mapped to our Smart Contract inputs
features = ['Age', 'Credit_Amount', 'Duration', 'Installment_Rate', 'Residence']
df['Risk'] = df['Risk'].map({1: 1, 2: 0}) # Good (1) -> 1, Bad (2) -> 0

X = df[features]
y = df['Risk']

# ==========================================
# 2. TRAIN/TEST SPLIT
# ==========================================
print("\n🔄 Splitting data for Backtesting (80% Train, 20% Test)...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. TRAIN THE MODEL (Max Depth 3 for Smart Contract)
# ==========================================
print("🧠 Training Decision Tree...")
clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

# ==========================================
# 4. RUN BACKTEST & PRINT REPORT
# ==========================================
print("\n" + "="*40)
print("📊 BACKTESTING RESULTS (German Credit Data)")
print("="*40)

y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
conf_matrix = confusion_matrix(y_test, y_pred)

print(f"✅ Accuracy: {accuracy * 100:.2f}%")
print("ℹ️  Meaning: The model correctly predicted risk {:.2f}% of the time.".format(accuracy * 100))
print("-" * 40)

print("🔍 DETAILED METRICS:")
print(classification_report(y_test, y_pred, target_names=['Bad Borrower', 'Good Borrower']))

print("-" * 40)
print("📉 CONFUSION MATRIX (The Truth Table):")
print(f"True Positives (Predicted Good, Actually Good): {conf_matrix[1][1]}")
print(f"True Negatives (Predicted Bad, Actually Bad):   {conf_matrix[0][0]}")
print(f"False Positives (Predicted Good, Actually Bad): {conf_matrix[0][1]}  <-- RISK")
print(f"False Negatives (Predicted Bad, Actually Good): {conf_matrix[1][0]}  <-- MISSED OPPORTUNITY")
print("="*40)

# ==========================================
# 5. GENERATE SOLIDITY CODE
# ==========================================
print("\n📜 GENERATING SMART CONTRACT LOGIC...")

def tree_to_solidity(tree, feature_names):
    tree_ = tree.tree_
    feature_name = [feature_names[i] if i != -2 else "undefined!" for i in tree_.feature]
    
    def recurse(node, depth):
        indent = "    " * depth
        if tree_.feature[node] != -2:
            name = feature_name[node]
            threshold = tree_.threshold[node]
            if name == "Credit_Amount": name = "creditAmount"
            if name == "Age": name = "age"
            if name == "Duration": name = "duration"
            if name == "Installment_Rate": name = "installment"
            if name == "Residence": name = "residence"
            
            return f"{indent}if ({name} <= {int(threshold)}) {{\n{recurse(tree_.children_left[node], depth + 1)}\n{indent}}} else {{\n{recurse(tree_.children_right[node], depth + 1)}\n{indent}}}"
        else:
            score = 80 if tree_.value[node][0][1] > tree_.value[node][0][0] else 20
            return f"{indent}probability = {score};"

    return recurse(0, 2)

solidity_logic = tree_to_solidity(clf, features)
print("------------------------------------------------")
print(solidity_logic)
print("------------------------------------------------")