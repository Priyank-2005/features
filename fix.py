import os

for root, _, files in os.walk(r'C:\Users\priya\OneDrive\Desktop\knowith\ai_features\src\app'):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8') as file:
                content = file.read()
            # replace backslash-backtick with backtick
            new_content = content.replace('\\`', '`')
            # replace backslash-dollar with dollar
            new_content = new_content.replace('\\$', '$')
            if content != new_content:
                with open(p, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Fixed {p}")
