# cycle-demi-fond
## Design commun (17/10/2026)
- `eps-design.css` et `eps-commun.js` : socle visuel partagé par tous les cycles (volley, badminton, demi-fond, tennis de table, step). Le fichier est identique dans chaque dépôt : en cas de modification, recopier la même version partout.
- Couleur de l'activité : ligne `<style>:root{--sport:…}</style>` dans `index.html`.
- **Mode gymnase** : bouton en haut à droite. Actif par défaut quand l'appli est ouverte depuis l'écran d'accueil de l'iPad.
- `index-old.html` : la version d'avant, gardée telle quelle (bandeau jaune « Ancienne version »).

## Organisation des pages (18/10/2026)
- `index.html` : **la version actuelle du cycle**, l'écran de cours (même famille que le volley et le step). Séances dans le bandeau, bascule de niveau, déroulé ajustable (rallonger, zapper, remplacer), variables, schémas.
- `cycle-demi-fond-old.html` : l'outil précédent, gardé par sécurité, inchangé. Tous les outils y restent (bouton « Préparer ») : c'est là qu'on marque la séance du jour.
- `demi-fond-donnees.js` : séances, schémas et échauffements, partagés par les deux pages.
- `polices/` : polices embarquées pour le hors ligne (licence SIL OFL).
