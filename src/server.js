const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validPokemon(body) {
  return body && typeof body.name === 'string' && body.name.trim() &&
    typeof body.description === 'string' && body.description.trim() &&
    typeof body.type === 'string' && body.type.trim();
}

async function start() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  const pokemon = client.db(dbName).collection('pokemon');

  app.post('/items', async (req, res, next) => {
    if (!validPokemon(req.body)) {
      return res.status(400).json({ error: 'name, description et type sont obligatoires.' });
    }
    try {
      const item = {
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        type: req.body.type.trim(),
      };
      const { insertedId } = await pokemon.insertOne(item);
      res.status(201).json({ _id: insertedId, ...item });
    } catch (error) { next(error); }
  });

  app.get('/items/:id', async (req, res, next) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide.' });
    try {
      const item = await pokemon.findOne({ _id: new ObjectId(req.params.id) });
      if (!item) return res.status(404).json({ error: 'Pokémon introuvable.' });
      res.json(item);
    } catch (error) { next(error); }
  });

  app.get('/items', async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    try {
      const [items, total] = await Promise.all([
        pokemon.find().skip((page - 1) * limit).limit(limit).toArray(),
        pokemon.countDocuments(),
      ]);
      res.json({ items, page, limit, total });
    } catch (error) { next(error); }
  });

  app.get('/search', async (req, res, next) => {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
    if (!keyword) return res.status(400).json({ error: 'Le paramètre keyword est obligatoire.' });
    const filter = {
      $or: [
        { name: { $regex: escapeRegex(keyword), $options: 'i' } },
        { description: { $regex: escapeRegex(keyword), $options: 'i' } },
      ],
    };
    if (type) filter.type = { $regex: `^${escapeRegex(type)}$`, $options: 'i' };
    try {
      const items = await pokemon.find(filter).limit(100).toArray();
      res.json({ items, total: items.length });
    } catch (error) { next(error); }
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  });

  app.listen(port, () => console.log(`Pokédex API démarrée sur http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Connexion à MongoDB impossible :', error.message);
  process.exit(1);
});
