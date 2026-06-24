import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score

# ==========================================
# 1. LOAD & CLEAN DATA
# ==========================================
print("📥 Loading German Credit Data...")

columns = [
    "Status", "Duration", "Credit_History", "Purpose", "Credit_Amount",
    "Savings", "Employment", "Installment_Rate", "Personal_Status_Sex", "Guarantors",
    "Residence", "Property", "Age", "Other_Installment_Plans", "Housing",
    "Num_Credits", "Job", "People_Liable", "Telephone", "Foreign_Worker", "Risk"
]

try:
    df = pd.read_csv("german.data", sep=' ', names=columns, index_col=False)
except FileNotFoundError:
    print("❌ Error: 'german.data' not found.")
    exit()

features = ['Age', 'Credit_Amount', 'Duration', 'Installment_Rate', 'Residence']
df['Risk'] = df['Risk'].map({1: 1, 2: 0})

X = df[features]
y = df['Risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. TRAIN THE MODEL
# ==========================================
print("🧠 Training Decision Tree...")
clf = DecisionTreeClassifier(max_depth=3, random_state=42)
clf.fit(X_train, y_train)

# ==========================================
# 4. RUN BACKTEST
# ==========================================
print("\n📊 RUNNING BACKTEST RESULTS:")
y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
print("------------------------------------------------")

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