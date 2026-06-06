# Guide de Déploiement sur Render

## Étapes à suivre :

### 1. Préparer ton repo GitHub
```bash
# Pousse ton code vers GitHub
git add .
git commit -m "Configuration Render"
git push origin main
```

### 2. Se connecter à Render
- Va sur [render.com](https://render.com)
- Connecte-toi avec ton compte GitHub

### 3. Créer un nouveau Web Service
1. Clique sur **"New +"** → **"Web Service"**
2. Sélectionne ton repo : `platefeorme-Commercial-CCF`
3. Configure :
   - **Name** : `platefeorme-commercial` (ou le nom que tu veux)
   - **Environment** : `Node`
   - **Region** : `Frankfurt` (ou proche de toi)
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : `Free` (gratuit)

### 4. Ajouter les Variables d'Environnement
Dans la section "Environment", ajoute :

| Clé | Valeur |
|-----|--------|
| `NODE_ENV` | `production` |
| `NEXTAUTH_URL` | `https://platefeorme-commercial.onrender.com` |
| `NEXTAUTH_SECRET` | *(génère une clé secrète forte - tu peux utiliser `openssl rand -base64 32`)* |

### 5. Déployer
- Clique sur **"Create Web Service"**
- Render va automatiquement construire et déployer ton app
- Ça peut prendre 3-5 minutes

### 6. Accéder à ton app
Une fois déployée, tu peux y accéder via :
`https://platefeorme-commercial.onrender.com`

---

## ⚠️ Notes importantes :

### Données JSON (IMPORTANT!)
- Tes fichiers JSON (`data/*.json`) sont **effacés à chaque redémarrage** sur Render
- **Solution** : Pour une utilisation en production, tu dois migrer vers PostgreSQL
- **Pour tester** : Les données vont réinitialiser, mais c'est ok pour les tests

### Accès via git push
Si tu utilises le `render.yaml`, tu peux simplement faire :
```bash
git push origin main
```
Et Render se redéploiera automatiquement ! 🚀

---

## Générer un NEXTAUTH_SECRET fort

```bash
# Sur Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Ou sur terminal (Mac/Linux)
openssl rand -base64 32
```

Copie la valeur générée dans les variables d'environnement Render.

---

## Troubleshooting

**"Build failed"** → Vérifie que `npm run build` fonctionne localement
**"App crashing"** → Check les logs dans Render Dashboard → "Logs"
**Données perdues** → C'est normal avec JSON en free tier, tu dois utiliser PostgreSQL
