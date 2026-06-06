import os
import json

base_path = r"g:\PROJET DEV\projet tutoré\platefeorme Commercial"

# Create directories
dirs = [
    "prisma",
    "app/api/auth",
    "app/api/resources",
    "app/api/courses",
    "app/api/quizzes",
    "app/auth",
    "app/dashboard",
    "app/courses",
    "app/quiz",
    "components",
    "lib",
    "public/uploads",
]

for d in dirs:
    path = os.path.join(base_path, d)
    os.makedirs(path, exist_ok=True)
    print(f"✓ Created {d}")

print("✓ Directory structure created successfully!")
