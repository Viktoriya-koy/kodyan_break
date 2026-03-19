import os
import glob
import re
import json

base_dir = "c:/Users/Usuario/Documents/Vico/Office_Games"

games = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

results = {}

for game in games:
    index_path = os.path.join(base_dir, game, "index.html")
    if not os.path.exists(index_path):
        continue
    
    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()
    
    # Check for return button
    has_return = ("../index.html" in html) or ("Volver" in html) or ("🔙" in html)
    
    # Check for instructions (either start-screen or overlay or instructions class)
    has_instructions = ("Instrucciones" in html) or ("Misión:" in html) or ("instructions" in html) or ("start-screen" in html) or ("overlay" in html) or ("Cómo jugar" in html)
    
    # Check for English text heuristically
    english_keywords = ["Drag mouse", "Click anywhere", "Targets:", "Score:", "Time:", "Level:", "Game Over", "Press", "points", "pts"]
    english_found = [kw for kw in english_keywords if kw in html]
    
    results[game] = {
        "has_return": has_return,
        "has_instructions": has_instructions,
        "english_found": english_found
    }

with open("c:/Users/Usuario/Documents/Vico/Office_Games/audit_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4)

print("Audit completed. Check audit_results.json")
