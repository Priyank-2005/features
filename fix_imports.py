import os
import glob

for root, _, files in os.walk(r'C:\Users\priya\OneDrive\Desktop\knowith\ai_features\src\app'):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # The exact string to replace
            bad_string = 'import ReactMarkdown from "react-markdown"; from "@/lib/grok";'
            good_string = 'import ReactMarkdown from "react-markdown";'
            
            if bad_string in content:
                new_content = content.replace(bad_string, good_string)
                with open(p, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Fixed syntax error in {p}")
