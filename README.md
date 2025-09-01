## Werkwijze (VS Code + Git)

### 1) Laatste versie ophalen
- VS Code: Source Control → **Pull** (⟲)  
- Terminal: `git pull`

### 2) Werken aan code
- Maak een **branch** (aanrader):
  - VS Code: klik op `main` onderin → **Create new branch** (bv. `feature/validatie`)
  - Terminal: `git checkout -b feature/validatie`
- Start lokaal testen (optioneel): **Live Server** → rechtsklik `index.html` → *Open with Live Server*.

### 3) Opslaan naar GitHub
- **Stage** → **Commit** → **Push**  
  - VS Code: Source Control (takje)  
    - `+` (Stage All) → bericht bv. `feat: voeg validatie toe` → **Commit** → **Push**
  - Terminal:
    ```bash
    git add .
    git commit -m "feat: voeg validatie toe"
    git push -u origin feature/validatie
    ```

### 4) (Team of netjes solo) Pull Request & merge
- Ga naar GitHub → **Compare & pull request** → korte beschrijving → **Merge**.
- Daarna lokaal updaten:
  ```bash
  git checkout main
  git pull
  git branch -d feature/validatie
  git push origin --delete feature/validatie  # optioneel

