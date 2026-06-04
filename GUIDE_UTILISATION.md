# 📱 Guide d'Utilisation MimaCare v2.0

## 🚀 Démarrage

```bash
npm start
```

L'application s'ouvre dans votre navigateur avec une interface optimisée pour smartphone.

---

## 📑 Navigation par Onglet

### 🏠 **ACCUEIL** - Vue d'Ensemble
- **Présence actuelle** : Qui est avec Mima maintenant
- **Ce soir** : Qui dort chez Mima (configurable dans "Proches")
- **Moments de vie** : Galerie photos
- **Glycémie** : Dernière mesure et graphique
- **Médicaments** : Progression du jour (matin/midi/soir)
- **Message du jour** : Citation motivante

### 👤 **PRÉSENCE** - Gestion des Présences
#### "Avec Mima en ce moment"
- **J'arrive** : Bouton vert
  - Affiche liste des contacts
  - Option "+ Ajouter une personne" pour enregistrer nouveau nom
  - Enregistre heure d'arrivée automatiquement
  
- **Je pars** : Bouton gris
  - Enregistre heure de départ
  - Marque comme "Parti(e)"

#### "Ce soir - qui dort chez Mima ?"
- Boutons avec noms des contacts
- Cliquez sur un nom pour le sélectionner
- **+ Ajouter une personne** : Pour ajouter un nouveau nom ponctuellement
- Affiche confirmation "✓ [Nom] dort chez Mima ce soir"

#### Derniers Passages
- Historique des 5 derniers passages
- Affiche arrivée → départ (ou "en cours")

---

### 📖 **PROCHES** - Carnet des Contacts
**Fonctionnalités complètes CRUD :**

#### Ajouter un Contact
- Bouton **+** en haut à droite
- Modal : Nom ou prénom (requis)
- Modal : Téléphone (optionnel)
- Cliquez "Ajouter"

**Exemples de noms :**
- `Samira`
- `Nadia`
- `Monsieur Benali`
- `Infirmière Fatima`
- `Cousine Leïla`
- `Infirmière de nuit`

#### Modifier un Contact
- Cliquez icône ✏️ sur la carte du contact
- Modifiez nom/téléphone
- Cliquez "Modifier"

#### Supprimer un Contact
- Cliquez icône 🗑️ (rouge)
- Confirmez la suppression

#### Chercher un Contact
- Tapez dans "Rechercher un proche..."
- La liste se filtre en temps réel

---

### 📅 **HISTORIQUE** - Logs des Passages
- **Regroupement par date** : Jeu 30 mai, Ven 31 mai, etc.
- **Affichage des passages** : Qui, heure arrivée → départ
- **Statut en cours** : Badge vert si toujours présent
- **Ce soir avec Mima** : Affichage du contact sélectionné

Cet historique **persiste entre fermetures** de l'app.

---

### 💊 **MÉDICAMENTS** - Gestion Dynamique
#### Validation Rapide (en haut)
- 3 boutons : Matin / Midi / Soir
- Sélectionnez le moment
- **Cliquez sur un médicament** = le cocher
- **Bouton "Tout valider"** = valide tous les meds du moment

#### Gérer les Médicaments (en bas)
**Pour le moment sélectionné (Matin/Midi/Soir) :**

##### Ajouter
- Bouton **+** bleu
- Modal :
  - Nom du médicament (ex: "Azarga")
  - Rôle/Indication (ex: "gouttes yeux")
  - Posologie/Dose (ex: "1 comprimé")
- Cliquez "Ajouter"

##### Modifier
- Cliquez ✏️ sur la carte du médicament
- Modifiez les champs
- Cliquez "Modifier"

##### Désactiver (au lieu de supprimer)
- Cliquez la **case à cocher** blanche
- Le médicament devient grisé (désactivé)
- Ne compte plus dans la progression du jour

##### Supprimer
- Cliquez 🗑️ (rouge)
- Suppression définitive

---

### 💧 **GLYCÉMIE** - Saisie et Historique
#### Saisie
1. Sélectionnez le moment : **Petit-déj / Déjeuner / Dîner**
2. Pavé numérique à gauche :
   - Chiffres 0-9
   - Virgule **,**
   - Effacer ⌫
3. Valeur affichée en **gros chiffres** (48px)

#### Couleurs
- 🟢 **Vert** : Valeur normale
- 🔴 **Rouge** : Valeur élevée (>1,4) ou basse (<0,7)
- ⚠️ Alerte affichée si hors limites

#### Graphique (à droite)
- **3 derniers jours** (Jeu, Ven, Sam)
- **3 barres par jour** : Petit-déj (vert), Déjeuner (vert clair), Dîner (bleu)
- **Hauteur = valeur**
- Légende en bas

---

## 💾 Persistance des Données

### Stockage Local (localStorage)
✅ **Tout est sauvegardé automatiquement :**
- Médicaments (ajout/modification/suppression)
- Contacts
- Présences et historique
- Glycémie
- Notes

### Entre Sessions
- Fermer et rouvrir l'app = données intactes
- Pas de synchronisation backend actuellement
- Données locales seulement

---

## 🎨 Design

### Style Apple Moderne
- **Cartes arrondies** (18px border-radius)
- **Espaces généreux** (padding 14px-16px)
- **Couleur principale** : Vert foncé `#2D7A4F`
- **Arrière-plan** : Gris très clair `#F7F7F5`

### Optimisé Smartphone
- Vue simulée iPhone (390x844px)
- Interface tactile grande et facile
- Typographie lisible (seniors)
- Emoji pour clarté visuelle

---

## 🔧 Astuces d'Utilisation

### Ajouter des Personnes sans Contact
✅ Vous pouvez ajouter un nom directement quand vous arrivez
- Bouton "J'arrive" → "Ajouter une nouvelle personne"
- Ou depuis le carnet "Proches"

### Réutiliser les Contacts
✅ Tous les contacts du carnet "Proches" sont disponibles dans :
- "J'arrive" (présence)
- "Ce soir" (nuit)

### Historique Automatique
✅ Chaque "J'arrive" et "Je pars" est enregistré automatiquement
- Consultable dans "Historique"
- Groupé par date

### Médicaments Importants
✅ Un médicament peut être marqué comme "⚠ Important"
- Affichage en rouge
- Suggestion : pour alerte visuelle

---

## 📞 Support & Maintenance

### Backend Futur
L'architecture est prête pour une migration vers une API REST
- Fichier `src/data/storage.js` peut être étendu facilement
- Ajoutez simplement les appels API sans changer les composants

### Données Sensibles
- ⚠️ Pas d'authentification actuellement
- Données sauvegardées en localStorage uniquement
- Pour sécurité : utilisez un serveur sécurisé

---

## 📋 Checklist de Démarrage

- [ ] Tester "J'arrive" / "Je pars"
- [ ] Ajouter 2-3 contacts dans "Proches"
- [ ] Tester modifier/supprimer un contact
- [ ] Ajouter/modifier un médicament
- [ ] Remplir une glycémie
- [ ] Vérifier que tout persiste après fermeture app
- [ ] Consulter l'historique

---

**Version:** 2.0  
**Date:** Juin 2026  
**Auteur:** Assistant MimaCare

