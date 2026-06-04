# 🏥 MimaCare v2.0 - Application de Gestion Intégrée

**Application complète pour gérer la vie quotidienne de Mima avec sa famille.**

## 🎯 Objectif

Fournir à la famille une plateforme unifiée et intuitive pour :
- ✅ Gérer **les présences** (qui est avec Mima, qui dort chez elle)
- ✅ Gérer **les médicaments** de façon dynamique
- ✅ Suivi **glycémie** avec historique
- ✅ Garder un **carnet des proches**
- ✅ Consulter l'**historique complet**
- ✅ Prendre des **notes et photos**

---

## 📦 Structure du Projet

```
mimacare/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── mimacare-logo.png
├── src/
│   ├── App.js                          # Composant principal refactorisé
│   ├── App.css                         # Styles globaux
│   ├── index.js
│   ├── data/
│   │   └── storage.js                  # 🆕 Système persistance localStorage
│   └── components/
│       ├── Modal.js                    # 🆕 Composant modal réutilisable
│       ├── MedicinesManager.js         # 🆕 Gestion médicaments CRUD
│       ├── ContactsBook.js             # 🆕 Carnet des proches
│       ├── PresenceManager.js          # 🆕 Gestion présences
│       └── HistoryView.js              # 🆕 Historique
├── GUIDE_UTILISATION.md                # 🆕 Guide utilisateur
└── package.json
```

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js 14+
- npm 6+

### Installation
```bash
cd mimacare
npm install
```

### Démarrage (mode développement)
```bash
npm start
```
L'app s'ouvre à `http://localhost:3000`

### Build (production)
```bash
npm run build
```
Génère le dossier `build/` optimisé

---

## 🎨 Nouvelles Fonctionnalités (v2.0)

### 1️⃣ Carnet des Proches
- **Ajouter/Modifier/Supprimer** contacts
- **Recherche** par nom
- **Téléphone optionnel** pour chaque contact
- **Réutilisable** dans Présence et Ce Soir

### 2️⃣ Présences Dynamiques
- **"J'arrive"** avec modal de sélection
- **"+ Ajouter une personne"** pour saisir nom libre
- **"Je pars"** enregistre heure départ
- **"Ce soir"** - choisir qui dort chez Mima
- **Historique** des 5 derniers passages

### 3️⃣ Historique Consulable
- **Groupé par date** (Jeu 30 mai, Ven 31 mai, etc.)
- **Affichage des passages** avec horaires
- **Statut "En cours"** pour présents actuels
- **Résumé nuit** - qui doit dormir ce soir

### 4️⃣ Médicaments Gestion Complète
- **Ajouter** : Nom, Rôle, Posologie
- **Modifier** : Champs modifiables
- **Désactiver** : Sans supprimer (réactivation facile)
- **Supprimer** : Suppression définitive
- **Indicateur "Important"** pour alertes visuelles

### 5️⃣ Persistance Automatique
- **localStorage** pour sauvegarde locale
- **Pas de backend** actuellement (prêt pour future intégration)
- **Données persistantes** entre sessions

---

## 📊 Onglets (6 au total)

| Onglet | Emoji | Fonctionnalité |
|--------|-------|---|
| **Accueil** | 🏠 | Vue d'ensemble, résumés, messages |
| **Présence** | 👤 | Gestion arrivées/départs, "Ce soir" |
| **Proches** | 📖 | Carnet des contacts (CRUD + recherche) |
| **Historique** | 📅 | Logs des passages par date |
| **Médicaments** | 💊 | Gestion complète (ajouter/modifier/supprimer) |
| **Glycémie** | 💧 | Saisie + historique 3 jours |

---

## 🔄 Architecture Données

### localStorage Keys
```javascript
{
  mimacare_medicines:        // Médicaments par moment (matin/midi/soir)
  mimacare_contacts:         // Carnet des proches
  mimacare_presences:        // Présence actuelle
  mimacare_present_tonight:  // Qui dort ce soir
  mimacare_history:          // Historique passages
  mimacare_glycemias:        // Glycémies (petitdej/dejeuner/diner)
  mimacare_notes:            // Notes de la famille
}
```

### Modèles de Données

**Médicament**
```javascript
{
  id: number,
  name: string,
  role: string,           // Indication
  dose: string,           // Posologie
  enabled: boolean,       // Actif/Inactif
  alert: boolean          // ⚠️ Important
}
```

**Contact**
```javascript
{
  id: number,
  name: string,
  phone: string,          // Optionnel
  createdAt: ISO8601date
}
```

**Passage (Historique)**
```javascript
{
  date: string,           // "30 mai 2026"
  prenom: string,
  arrivee: string,        // "09h00"
  depart: string | null   // "12h15" ou null
}
```

---

## 🎨 Design System

### Couleurs
- **Vert principal** : `#2D7A4F` (actions, sélection)
- **Vert clair** : `#E8F5EE` (backgrounds)
- **Gris foncé** : `#1A1A1A` (texte)
- **Gris clair** : `#6B7280` (labels)
- **Gris très clair** : `#F7F7F5` (page background)
- **Blanc** : `#FFFFFF` (cartes)
- **Rouge** : `#EF4444` (alerte)

### Tipographie
- **Font** : `-apple-system, 'Helvetica Neue', sans-serif`
- **H1 (Titre principal)** : 22px, 800, noir
- **H2 (Sous-titres)** : 20px, 800, noir
- **Body** : 15px, 400-600, gris
- **Label** : 11px, 700, gris (UPPERCASE)

### Composants
- **Cartes** : border-radius 18px, padding 16px, box-shadow léger
- **Boutons** : border-radius 12px, padding 13px, full-width possible
- **Modales** : slide-up animation, arrondies haut (24px)
- **Icônes** : Emoji (✓, ✏️, 🗑️, +, etc.)

---

## 🔐 Sécurité & Confidentialité

⚠️ **Version Locale (Pas de Backend)**
- Données stockées en `localStorage` du navigateur
- Pas de chiffrement actuellement
- Accessible uniquement sur l'appareil

📌 **Recommandations**
- Pour utilisation sensible : ajouter authentification
- Pour sauvegarde cloud : implémenter API backend
- Données médicales : considérer RGPD/conformité

---

## 🚀 Roadmap Future

- [ ] Backend API (Node.js/Express ou autre)
- [ ] Authentification familiale
- [ ] Synchronisation cloud (Firebase, AWS, etc.)
- [ ] Notifications push (arrivées/départs)
- [ ] Photos avec stockage cloud
- [ ] Rapports générables (PDF)
- [ ] Mode dark/light
- [ ] Multilingue (FR/AR/etc.)

---

## 📝 Logs des Changements

### v2.0 (Juin 2026) - Refactorisation Complète
- ✅ Système de persistance localStorage
- ✅ Gestion médicaments dynamique (CRUD)
- ✅ Carnet des proches avec recherche
- ✅ Gestion présences avec modales
- ✅ Historique consulable
- ✅ 6 onglets intégrés
- ✅ Design Apple optimisé

### v1.0 (Initial)
- Interface de base
- Validation statique des médicaments
- Notes et photos

---

## 👨‍💻 Développement

### Ajouter un Nouveau Composant

1. Créer le fichier : `src/components/MonComponent.js`
2. Utiliser les fonctions de `src/data/storage.js` pour persistance
3. Utiliser les couleurs constants du haut de chaque fichier
4. Intégrer dans `App.js` (import + ajouter au `screens` object)
5. Ajouter l'onglet dans `TABS` array si nécessaire

### Modifier le Stockage

1. Éditer `src/data/storage.js`
2. Ajouter nouvelles clés dans `KEYS` object
3. Créer fonctions getter/setter (`get*`, `save*`, `add*`, `update*`, `delete*`)
4. Utiliser dans composants : `storage.getFonction()`

---

## 📞 Support

- Guide utilisateur : Voir `GUIDE_UTILISATION.md`
- Questions sur le code : Consulter les commentaires dans les fichiers
- Fichiers de données : localStorage du navigateur (DevTools → Application)

---

**Bonne utilisation de MimaCare! 💚**

