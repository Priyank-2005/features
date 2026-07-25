import os

files_with_msg = ['advisor', 'support']
files_with_report = ['health', 'portfolio', 'sip', 'tax', 'news']

for feature in files_with_msg:
    p = os.path.join('src', 'app', feature, 'page.tsx')
    with open(p, 'r') as f:
        c = f.read()
    if 'import ReactMarkdown' not in c:
        c = c.replace('import { callGrokAPI }', 'import { callGrokAPI } from "@/lib/grok";\nimport ReactMarkdown from "react-markdown";')
        c = c.replace('{msg.content}', '<ReactMarkdown>{msg.content}</ReactMarkdown>')
    with open(p, 'w') as f:
        f.write(c)

for feature in files_with_report:
    p = os.path.join('src', 'app', feature, 'page.tsx')
    with open(p, 'r') as f:
        c = f.read()
    if 'import ReactMarkdown' not in c:
        c = c.replace('import { callGrokAPI }', 'import { callGrokAPI } from "@/lib/grok";\nimport ReactMarkdown from "react-markdown";')
        c = c.replace('{report}', '<ReactMarkdown>{report}</ReactMarkdown>')
    with open(p, 'w') as f:
        f.write(c)
