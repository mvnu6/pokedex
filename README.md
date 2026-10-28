# Mango API — Pokédex

API Express et MongoDB pour créer, consulter et rechercher des Pokémon.

## Démarrage avec MongoDB Compass

1. Démarrez votre serveur MongoDB local (`mongod`). MongoDB Compass est l’interface pour se connecter au serveur ; il ne remplace pas le serveur MongoDB.
2. Dans Compass, connectez-vous à `mongodb://127.0.0.1:27017`.
3. Installez les dépendances avec `npm install`.
4. Copiez `.env.example` vers `.env`. La configuration par défaut utilise MongoDB local (`MONGODB_URI=mongodb://127.0.0.1:27017`) et la base `pokedex`.
5. Lancez l’API avec `npm start`.

La base et la collection `pokemon` sont créées automatiquement à la première insertion.
Pour ajouter les Pokémon d’exemple dans la base, lancez `npm run seed`. Cette commande peut être relancée sans créer de doublons. Dans Compass, actualisez la connexion et ouvrez `pokedex` → `pokemon`.

## Routes

- `POST /items` — crée `{ "name": "Pikachu", "description": "Pokémon électrique", "type": "Électrik" }`.
- `GET /items/:id` — lit un Pokémon par son identifiant MongoDB.
- `GET /items?page=1&limit=20` — liste les Pokémon avec pagination.
- `GET /search?keyword=eclair` — cherche sans tenir compte de la casse dans `name` et `description`.
- `GET /search?keyword=eclair&type=Électrik` — ajoute le filtre de type (insensible à la casse).

La recherche échappe les caractères spéciaux de l’expression régulière fournie par l’utilisateur.
