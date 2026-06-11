"""
Pulse Engine — Comprehensive Accuracy Test Suite
Tests:
  1. XGBoost Bot Detection Model (accuracy, precision, recall, F1, ROC-AUC, confusion matrix)
  2. VADER Sentiment NLP (polarity correctness on labelled samples)
  3. Authenticity Heuristics (bot flag correctness on synthetic profiles)
  4. DVI / Decay Model (sanity checks on known decay patterns)
  5. End-to-end pulse_analyzer.py integration test (real JSON pipe)
"""

import sys, os, json, pickle, math, subprocess, statistics
from datetime import datetime, timedelta

import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE       = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE, "ml-models", "xgboost_bot_model.pkl")
DATA_PATH  = os.path.join(BASE, "ml-models", "fake_instagram_profile.csv")
ANALYZER   = os.path.join(BASE, "analytical-models", "pulse_analyzer.py")

PASS = "✅"
FAIL = "❌"
WARN = "⚠️ "

results_summary = {}

# ══════════════════════════════════════════════════════════════════════════════
# 1.  XGBoost Bot-Detection Model Accuracy
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  TEST 1 — XGBoost Bot Detection Model")
print("═"*60)

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    df = pd.read_csv(DATA_PATH)
    X = df.drop(columns=["fake"])
    y = df["fake"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    y_pred      = model.predict(X_test)
    y_prob      = model.predict_proba(X_test)[:, 1]

    acc       = accuracy_score(y_test, y_pred)
    prec      = precision_score(y_test, y_pred)
    rec       = recall_score(y_test, y_pred)
    f1        = f1_score(y_test, y_pred)
    roc_auc   = roc_auc_score(y_test, y_prob)
    cm        = confusion_matrix(y_test, y_pred)

    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp)
    fpr         = fp / (fp + tn)

    # 5-fold CV on full dataset
    cv_scores   = cross_val_score(model, X, y, cv=5, scoring="accuracy")
    cv_mean     = cv_scores.mean()
    cv_std      = cv_scores.std()

    print(f"\n  Dataset         : {len(df)} samples  |  Real: {(y==0).sum()}  Fake: {(y==1).sum()}")
    print(f"  Test split size : {len(y_test)} samples (80/20 split, seed=42)")
    print()
    print(f"  {'Metric':<28} {'Score':>10}  {'Threshold':>12}")
    print(f"  {'-'*54}")
    print(f"  {'Accuracy':<28} {acc*100:>9.2f}%  {'≥ 90% GOOD':>12}   {PASS if acc>=0.90 else FAIL}")
    print(f"  {'Precision':<28} {prec*100:>9.2f}%  {'≥ 85% GOOD':>12}   {PASS if prec>=0.85 else FAIL}")
    print(f"  {'Recall (Sensitivity)':<28} {rec*100:>9.2f}%  {'≥ 85% GOOD':>12}   {PASS if rec>=0.85 else FAIL}")
    print(f"  {'F1 Score':<28} {f1*100:>9.2f}%  {'≥ 87% GOOD':>12}   {PASS if f1>=0.87 else FAIL}")
    print(f"  {'ROC-AUC':<28} {roc_auc:>10.4f}  {'≥ 0.92 GOOD':>12}   {PASS if roc_auc>=0.92 else FAIL}")
    print(f"  {'Specificity':<28} {specificity*100:>9.2f}%  {'≥ 85% GOOD':>12}   {PASS if specificity>=0.85 else FAIL}")
    print(f"  {'False Positive Rate':<28} {fpr*100:>9.2f}%  {'≤ 15% GOOD':>12}   {PASS if fpr<=0.15 else FAIL}")
    print(f"  {'5-Fold CV Accuracy':<28} {cv_mean*100:>9.2f}%  (±{cv_std*100:.2f}%) {PASS if cv_mean>=0.90 else FAIL}")
    print()
    print("  Confusion Matrix:")
    print(f"  {'':>20} Predicted Real  Predicted Fake")
    print(f"  {'Actual Real':>20} {'TN='+str(tn):<16} {'FP='+str(fp)}")
    print(f"  {'Actual Fake':>20} {'FN='+str(fn):<16} {'TP='+str(tp)}")
    print()
    print("  Full Classification Report:")
    print("  " + classification_report(y_test, y_pred, target_names=["Real","Fake"]).replace("\n", "\n  "))

    results_summary["xgboost_accuracy"]   = f"{acc*100:.2f}%"
    results_summary["xgboost_roc_auc"]    = f"{roc_auc:.4f}"
    results_summary["xgboost_f1"]         = f"{f1*100:.2f}%"
    results_summary["xgboost_cv_mean"]    = f"{cv_mean*100:.2f}%"
    results_summary["xgboost_pass"]       = acc >= 0.90 and f1 >= 0.87

except Exception as e:
    print(f"  {FAIL}  XGBoost test FAILED: {e}")
    results_summary["xgboost_pass"] = False

# ══════════════════════════════════════════════════════════════════════════════
# 2.  VADER Sentiment NLP Accuracy
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  TEST 2 — VADER Sentiment NLP")
print("═"*60)

LABELLED_COMMENTS = [
    # (text,  expected_label)   label: "positive" / "negative" / "neutral"
    ("I absolutely love this creator! Such amazing content! 😍", "positive"),
    ("This product is incredible, definitely buying it!", "positive"),
    ("Great video, learned so much from this! Highly recommend!", "positive"),
    ("This is hands down the best tutorial I have ever watched", "positive"),
    ("Outstanding work, you are so talented! Keep it up!", "positive"),
    ("This product is terrible, waste of money", "negative"),
    ("Worst influencer ever, completely fake and misleading", "negative"),
    ("I regret buying this. Total scam. Do not trust this creator", "negative"),
    ("Really disappointed with this content. Not helpful at all", "negative"),
    ("Horrible quality. The creator lied about the product.", "negative"),
    ("Posted a new video today", "neutral"),
    ("Check out the link in my bio", "neutral"),
    ("New collection available now", "neutral"),
    ("Thanks for watching this video", "neutral"),
    ("Subscribe for more content", "neutral"),
    ("This creator has some really good points, though I disagree on the pricing", "neutral"),
    ("The product works okay, nothing special but does the job", "neutral"),
]

analyzer = SentimentIntensityAnalyzer()

def vader_label(text):
    score = analyzer.polarity_scores(text)["compound"]
    if score >= 0.05: return "positive"
    if score <= -0.05: return "negative"
    return "neutral"

correct = 0
results_vader = []
for text, expected in LABELLED_COMMENTS:
    predicted = vader_label(text)
    ok = predicted == expected
    if ok: correct += 1
    results_vader.append((text[:55], expected, predicted, ok))

vader_acc = correct / len(LABELLED_COMMENTS)
print(f"\n  Labelled samples: {len(LABELLED_COMMENTS)}")
print(f"\n  {'Text (truncated)':<56} {'Expected':<10} {'Got':<10} {'OK'}")
print(f"  {'-'*85}")
for text, exp, got, ok in results_vader:
    print(f"  {text:<56} {exp:<10} {got:<10} {PASS if ok else FAIL}")

print(f"\n  VADER Accuracy: {correct}/{len(LABELLED_COMMENTS)} = {vader_acc*100:.1f}%  {PASS if vader_acc>=0.75 else WARN}")
results_summary["vader_accuracy"] = f"{vader_acc*100:.1f}%"
results_summary["vader_pass"] = vader_acc >= 0.75

# ══════════════════════════════════════════════════════════════════════════════
# 3.  Authenticity Heuristic Bot-Flag Accuracy
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  TEST 3 — Authenticity Heuristic Bot-Flag")
print("═"*60)

sys.path.insert(0, os.path.join(BASE, "analytical-models"))
from pulse_analyzer import calculate_authenticity

# Synthetic test cases (posts, follower_count, expected_bot_flag, label)
HEURISTIC_CASES = [
    # ---------- Real (organic) creator patterns ----------
    {
        "posts": [{"likes": 5200, "comments": 130}, {"likes": 4100, "comments": 78},
                  {"likes": 6800, "comments": 210}, {"likes": 3900, "comments": 61},
                  {"likes": 7200, "comments": 320}, {"likes": 4600, "comments": 95}],
        "followers": 80000, "expected_bot": False, "label": "Organic creator (high variance)"
    },
    {
        "posts": [{"likes": 15000, "comments": 450}, {"likes": 12000, "comments": 310},
                  {"likes": 18000, "comments": 590}, {"likes": 11000, "comments": 280},
                  {"likes": 20000, "comments": 740}],
        "followers": 250000, "expected_bot": False, "label": "Large creator (healthy engagement)"
    },
    # ---------- Bot / Fake patterns ----------
    {
        "posts": [{"likes": 10000, "comments": 100}, {"likes": 10000, "comments": 101},
                  {"likes": 10001, "comments": 100}, {"likes": 10000, "comments": 99},
                  {"likes": 9999, "comments": 100}, {"likes": 10000, "comments": 100}],
        "followers": 150000, "expected_bot": True, "label": "Bot (ultra-uniform engagement)"
    },
    {
        "posts": [{"likes": 50000, "comments": 51}, {"likes": 50000, "comments": 52},
                  {"likes": 49999, "comments": 50}, {"likes": 50001, "comments": 51},
                  {"likes": 50000, "comments": 51}, {"likes": 50000, "comments": 51}],
        "followers": 500000, "expected_bot": True, "label": "Bot (extremely low comment ratio)"
    },
    {
        "posts": [{"likes": 2000, "comments": 60}, {"likes": 2000, "comments": 60},
                  {"likes": 2000, "comments": 60}, {"likes": 2001, "comments": 60},
                  {"likes": 1999, "comments": 60}],
        "followers": 40000, "expected_bot": True, "label": "Bot (robotic uniformity)"
    },
    # ---------- Edge cases ----------
    {
        "posts": [{"likes": 100, "comments": 50}, {"likes": 8000, "comments": 5},
                  {"likes": 450, "comments": 200}],
        "followers": 5000, "expected_bot": False, "label": "Small creator (normal variance)"
    },
]

heuristic_correct = 0
print(f"\n  {'Label':<45} {'Expected':>10} {'Got':>10} {'Score':>7} {'OK'}")
print(f"  {'-'*78}")
for case in HEURISTIC_CASES:
    score, details = calculate_authenticity(case["posts"], case["followers"])
    flagged = details["bot_flag"]
    ok = flagged == case["expected_bot"]
    if ok: heuristic_correct += 1
    exp_str = "BOT" if case["expected_bot"] else "REAL"
    got_str = "BOT" if flagged else "REAL"
    print(f"  {case['label']:<45} {exp_str:>10} {got_str:>10} {score:>7} {PASS if ok else FAIL}")

h_acc = heuristic_correct / len(HEURISTIC_CASES)
print(f"\n  Heuristic Bot-Flag Accuracy: {heuristic_correct}/{len(HEURISTIC_CASES)} = {h_acc*100:.1f}%  {PASS if h_acc>=0.80 else WARN}")
results_summary["heuristic_accuracy"] = f"{h_acc*100:.1f}%"
results_summary["heuristic_pass"] = h_acc >= 0.80

# ══════════════════════════════════════════════════════════════════════════════
# 4.  DVI Decay Model Sanity Checks
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  TEST 4 — DVI / Content Decay Model Sanity Checks")
print("═"*60)

from pulse_analyzer import calculate_dvi

now = datetime.utcnow()

def make_posts_decay(n, base_likes, decay_per_day, hours_between=24):
    """Simulate posts aging with exponential decay."""
    posts = []
    for i in range(n):
        age_days = (i + 1) * hours_between / 24
        likes = max(10, int(base_likes * math.exp(-decay_per_day * age_days)))
        comments = max(1, likes // 30)
        pub = (now - timedelta(hours=(i + 1) * hours_between)).isoformat() + "Z"
        posts.append({"likes": likes, "comments": comments, "publishedAt": pub})
    return posts

dvi_cases = [
    # Slow decay: 0.005/day = 138 days half-life → caps to 120h but > 48h threshold
    {"posts": make_posts_decay(10, 20000, 0.005), "label": "Slow decay (evergreen)", "expect_hl": ">72h"},
    # Fast viral spike: 0.5/day = ~33h half-life (realistic viral posts)
    {"posts": make_posts_decay(10, 20000, 0.50, hours_between=6), "label": "Fast decay (viral spike)", "expect_hl": "<60h"},
    # Standard: 0.15/day = ~111h half-life → within 15–120h
    {"posts": make_posts_decay(6, 5000, 0.15, hours_between=48), "label": "Standard creator", "expect_hl": "15–120h"},
    {"posts": [], "label": "Empty posts (fallback)", "expect_hl": "default"},
]

dvi_correct = 0
print(f"\n  {'Label':<40} {'Half-life':>12} {'Expected':>15} {'DVI':>8}  OK")
print(f"  {'-'*80}")
for case in dvi_cases:
    res = calculate_dvi(case["posts"])
    hl  = res["half_life_hours"]
    dvi = res["dvi_score"]

    if case["expect_hl"] == ">72h":
        ok = hl > 72.0
    elif case["expect_hl"] == "<60h":
        ok = hl < 60.0
    elif case["expect_hl"] == "15–120h":
        ok = 15.0 <= hl <= 120.0
    else:
        ok = 8.0 <= hl <= 168.0  # default fallback is within bounds

    if ok: dvi_correct += 1
    print(f"  {case['label']:<40} {hl:>10.1f}h  {case['expect_hl']:>15} {dvi:>8.2f}  {PASS if ok else FAIL}")

dvi_acc = dvi_correct / len(dvi_cases)
print(f"\n  DVI Sanity Check Pass Rate: {dvi_correct}/{len(dvi_cases)} = {dvi_acc*100:.1f}%  {PASS if dvi_acc>=0.75 else WARN}")
results_summary["dvi_pass_rate"] = f"{dvi_acc*100:.1f}%"
results_summary["dvi_pass"] = dvi_acc >= 0.75

# ══════════════════════════════════════════════════════════════════════════════
# 5.  End-to-End Integration Test (pipe JSON → pulse_analyzer.py)
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  TEST 5 — End-to-End Integration (stdin → pulse_analyzer.py)")
print("═"*60)

e2e_cases = [
    {
        "label": "Organic fashion creator",
        "input": {
            "platform": "instagram", "niche": "fashion", "follower_count": 120000,
            "handle": "fashionista_world", "bio": "Fashion blogger | Style tips | Collab DMs open",
            "external_url": 1, "private": 0, "follows": 450,
            "posts": [
                {"likes": 8200, "comments": 240, "caption": "Love this look!", "publishedAt": (now - timedelta(days=1)).isoformat()+"Z"},
                {"likes": 6100, "comments": 180, "caption": "New outfit today", "publishedAt": (now - timedelta(days=3)).isoformat()+"Z"},
                {"likes": 9500, "comments": 310, "caption": "Summer vibes 🌊", "publishedAt": (now - timedelta(days=5)).isoformat()+"Z"},
                {"likes": 7300, "comments": 195, "caption": "Thrift haul", "publishedAt": (now - timedelta(days=8)).isoformat()+"Z"},
                {"likes": 11200, "comments": 420, "caption": "My favourite brands", "publishedAt": (now - timedelta(days=12)).isoformat()+"Z"},
            ]
        },
        "expect_health": (55, 99), "expect_bot": False
    },
    {
        "label": "Suspicious bot account",
        "input": {
            "platform": "instagram", "niche": "general", "follower_count": 300000,
            "handle": "user_83920183", "bio": "", "external_url": 0, "private": 0, "follows": 8000,
            "posts": [
                {"likes": 50000, "comments": 50, "publishedAt": (now - timedelta(days=1)).isoformat()+"Z"},
                {"likes": 50001, "comments": 50, "publishedAt": (now - timedelta(days=2)).isoformat()+"Z"},
                {"likes": 49999, "comments": 50, "publishedAt": (now - timedelta(days=3)).isoformat()+"Z"},
                {"likes": 50000, "comments": 51, "publishedAt": (now - timedelta(days=4)).isoformat()+"Z"},
                {"likes": 50000, "comments": 50, "publishedAt": (now - timedelta(days=5)).isoformat()+"Z"},
            ]
        },
        "expect_health": (20, 75), "expect_bot": True
    },
    {
        "label": "Tech YouTuber",
        "input": {
            "platform": "youtube", "niche": "tech", "follower_count": 500000,
            "handle": "techreview_pro", "bio": "Tech reviews | Unboxings | Gadgets | 500K subs",
            "external_url": 1, "private": 0, "follows": 120,
            "posts": [
                {"likes": 25000, "comments": 870, "caption": "iPhone review!", "publishedAt": (now - timedelta(days=2)).isoformat()+"Z"},
                {"likes": 18000, "comments": 540, "caption": "Best laptops 2025", "publishedAt": (now - timedelta(days=10)).isoformat()+"Z"},
                {"likes": 32000, "comments": 1200, "caption": "Is this GPU worth it?", "publishedAt": (now - timedelta(days=20)).isoformat()+"Z"},
                {"likes": 22000, "comments": 680, "caption": "Smart home setup", "publishedAt": (now - timedelta(days=35)).isoformat()+"Z"},
            ]
        },
        "expect_health": (60, 99), "expect_bot": False
    },
]

e2e_correct = 0
print()
for case in e2e_cases:
    try:
        result = subprocess.run(
            ["python3", ANALYZER],
            input=json.dumps(case["input"]),
            capture_output=True, text=True, timeout=60
        )
        out = json.loads(result.stdout)

        health  = out.get("health_score", 0)
        auth    = out.get("authenticity_score", 0)
        bot     = out.get("authenticity_details", {}).get("bot_flag", False)
        lo, hi  = case["expect_health"]  # lo=min, hi=max

        health_ok = lo <= health <= hi
        bot_ok    = bot == case["expect_bot"]
        ok        = health_ok and bot_ok
        if ok: e2e_correct += 1

        print(f"  {case['label']}")
        print(f"    Health Score    : {health:>4}  (expected {lo}–{hi})  {PASS if health_ok else FAIL}")
        print(f"    Auth Score      : {auth:>4}")
        print(f"    Bot Flag        : {str(bot):<6} (expected {case['expect_bot']})  {PASS if bot_ok else FAIL}")
        s = out.get("sentiment", {})
        print(f"    Sentiment       : transactional={s.get('transactional')}%  parasocial={s.get('parasocial')}%  polarity={s.get('polarity')}")
        dv = out.get("decay_rate", {})
        print(f"    DVI             : half_life={dv.get('half_life_hours')}h  long_tail={dv.get('long_tail_value')}")
        print(f"    Result          : {PASS + ' PASS' if ok else FAIL + ' FAIL'}")
        print()
    except Exception as e:
        print(f"  {FAIL} Integration test '{case['label']}' FAILED: {e}\n")

e2e_acc = e2e_correct / len(e2e_cases)
print(f"  E2E Pass Rate: {e2e_correct}/{len(e2e_cases)} = {e2e_acc*100:.1f}%  {PASS if e2e_acc>=0.67 else WARN}")
results_summary["e2e_pass_rate"] = f"{e2e_acc*100:.1f}%"
results_summary["e2e_pass"] = e2e_acc >= 0.67

# ══════════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "═"*60)
print("  PULSE ENGINE — FINAL ACCURACY REPORT")
print("═"*60)

def fmt_pass(key):
    return PASS + " PASS" if results_summary.get(key) else FAIL + " FAIL"

print(f"""
  ┌─────────────────────────────────────────────────────────┐
  │  COMPONENT                          SCORE      STATUS   │
  ├─────────────────────────────────────────────────────────┤
  │  XGBoost Bot Detection Accuracy     {results_summary.get('xgboost_accuracy','?'):<10} {fmt_pass('xgboost_pass')}│
  │  XGBoost ROC-AUC                    {results_summary.get('xgboost_roc_auc','?'):<10} {fmt_pass('xgboost_pass')}│
  │  XGBoost F1 Score                   {results_summary.get('xgboost_f1','?'):<10} {fmt_pass('xgboost_pass')}│
  │  XGBoost 5-Fold CV                  {results_summary.get('xgboost_cv_mean','?'):<10} {fmt_pass('xgboost_pass')}│
  ├─────────────────────────────────────────────────────────┤
  │  VADER Sentiment NLP                {results_summary.get('vader_accuracy','?'):<10} {fmt_pass('vader_pass')}│
  ├─────────────────────────────────────────────────────────┤
  │  Authenticity Heuristic Bot-Flag    {results_summary.get('heuristic_accuracy','?'):<10} {fmt_pass('heuristic_pass')}│
  ├─────────────────────────────────────────────────────────┤
  │  DVI Decay Sanity Check             {results_summary.get('dvi_pass_rate','?'):<10} {fmt_pass('dvi_pass')}│
  ├─────────────────────────────────────────────────────────┤
  │  End-to-End Integration             {results_summary.get('e2e_pass_rate','?'):<10} {fmt_pass('e2e_pass')}│
  └─────────────────────────────────────────────────────────┘
""")

all_pass = all([
    results_summary.get("xgboost_pass"),
    results_summary.get("vader_pass"),
    results_summary.get("heuristic_pass"),
    results_summary.get("dvi_pass"),
    results_summary.get("e2e_pass"),
])
if all_pass:
    print("  🎉  ALL TESTS PASSED — Pulse Engine is production ready!\n")
else:
    failing = [k for k in ["xgboost_pass","vader_pass","heuristic_pass","dvi_pass","e2e_pass"] if not results_summary.get(k)]
    print(f"  {WARN} Some tests did not meet thresholds: {', '.join(failing)}\n")
