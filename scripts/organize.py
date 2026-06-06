#!/usr/bin/env python3
"""
Script to reorganize project files into correct directory structure
Run this after creating the files
"""

import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).parent

def organize_files():
    """Move files to their correct locations"""
    
    # Files to move with their destinations
    moves = {
        "app_layout.tsx": "app/layout.tsx",
        "app_globals.css": "app/globals.css",
        "lib_auth.ts": "lib/auth.ts",
        "lib_db.ts": "lib/db.ts",
        "lib_validations.ts": "lib/validations.ts",
        "middleware.ts": "middleware.ts",
        "api_auth_register.ts": "app/api/auth/register/route.ts",
        "api_auth_nextauth.ts": "app/api/auth/[...nextauth]/route.ts",
        "api_courses_route.ts": "app/api/courses/route.ts",
        "api_courses_id.ts": "app/api/courses/[id]/route.ts",
        "api_resources_route.ts": "app/api/resources/route.ts",
        "api_resources_upload.ts": "app/api/resources/upload/route.ts",
        "api_quizzes_route.ts": "app/api/quizzes/route.ts",
        "api_quizzes_id.ts": "app/api/quizzes/[id]/route.ts",
        "api_results_route.ts": "app/api/results/route.ts",
        "api_student_quizzes.ts": "app/api/student/quizzes/route.ts",
        "api_teacher_dashboard.ts": "app/api/teacher/dashboard/route.ts",
        "components_NavBar.tsx": "components/NavBar.tsx",
        "components_LoginForm.tsx": "components/LoginForm.tsx",
        "components_RegisterForm.tsx": "components/RegisterForm.tsx",
        "page_index.tsx": "app/page.tsx",
        "page_dashboard.tsx": "app/dashboard/page.tsx",
        "page_auth_login.tsx": "app/auth/login/page.tsx",
        "page_auth_register.tsx": "app/auth/register/page.tsx",
        "page_teacher_courses.tsx": "app/teacher/courses/page.tsx",
        "page_teacher_resources.tsx": "app/teacher/resources/page.tsx",
        "page_teacher_quiz_builder.tsx": "app/teacher/quizzes/create/page.tsx",
        "page_teacher_dashboard.tsx": "app/teacher/dashboard/page.tsx",
        "page_student_quizzes.tsx": "app/student/quizzes/page.tsx",
        "page_student_quiz.tsx": "app/student/quiz/[id]/page.tsx",
        "page_student_results.tsx": "app/student/results/page.tsx",
        "page_student_dashboard.tsx": "app/student/dashboard/page.tsx",
        "schema.prisma": "prisma/schema.prisma",
    }
    
    for src, dst in moves.items():
        src_path = BASE_DIR / src
        dst_path = BASE_DIR / dst
        
        if src_path.exists():
            # Create parent directories if needed
            dst_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Move file
            shutil.move(str(src_path), str(dst_path))
            print(f"✓ Moved {src} → {dst}")
        else:
            print(f"⚠ Source not found: {src}")
    
    # Create necessary empty directories
    empty_dirs = [
        "app/api/quizzes",
        "app/api/student",
        "app/api/teacher",
        "app/auth/login",
        "app/auth/register",
        "app/courses",
        "app/dashboard",
        "app/quiz",
        "app/student",
        "app/teacher",
        "public/uploads",
    ]
    
    for dir_path in empty_dirs:
        full_path = BASE_DIR / dir_path
        full_path.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created {dir_path}")
    
    print("\n✅ Project structure organized successfully!")
    print("\nNext steps:")
    print("1. npm install")
    print("2. npm run db:migrate")
    print("3. npm run dev")

if __name__ == "__main__":
    organize_files()
