# Interactive Media 2025 – Collaboration Guide

## 1. Clone the Repository
1. Go to the project page in GitLab.  

2. Click **Code → HTTPS** and copy the link:  
https://gitlab.com/rayankib-group/interactive-media-2025.git

bash
Code kopiëren
3. Clone it:
```bash
git clone https://gitlab.com/rayankib-group/interactive-media-2025.git
cd interactive-media-2025

2. Personal Access Token (PAT)
GitLab does not accept passwords for Git.
You must use a Personal Access Token:

Go to your GitLab profile → Edit profile → Access tokens.

Create a token with:

Name: git-access

Scopes: read_repository, write_repository

Copy and save the token.

When Git asks for login:

Username: your GitLab username

Password: your token

3. Workflow
Always pull latest changes:

bash
Code kopiëren
git pull
Create a new branch:

bash
Code kopiëren
git checkout -b feature/short-description
Commit and push:

bash
Code kopiëren
git add .
git commit -m "Short description"
git push -u origin feature/short-description
Open a Merge Request (MR):
Go to GitLab, create an MR for your branch, assign a reviewer, and merge into main.

4. Rules
Do not push directly to main.

Each feature/fix → new branch.

Use clear English commit messages.

Review each other’s Merge Requests before merging