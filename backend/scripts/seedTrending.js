require('dotenv').config();
const db = require('../models');

async function seedTrending() {
  try {
    const hairstyles = await db.Hairstyle.findAll({ attributes: ['id', 'name', 'category'] });
    if (hairstyles.length === 0) {
      console.error('❌ Aucun hairstyle en base. Lance addTestHairstyles.js d\'abord.');
      process.exit(1);
    }

    await db.TrendHairstyle.destroy({ where: {} });
    console.log('🗑️  Anciennes tendances supprimées');

    const difficultyMap = { Femme: 'moyen', Homme: 'facile', Enfant: 'facile', Mixte: 'moyen' };
    const durationMap   = { Femme: 60, Homme: 30, Enfant: 25, Mixte: 45 };
    const priceMap      = { Femme: '5000-15000 FCFA', Homme: '2000-5000 FCFA', Enfant: '1500-3000 FCFA', Mixte: '3000-8000 FCFA' };
    const scores        = [4.8, 4.5, 4.2, 3.9, 3.7, 3.5, 3.2, 3.0];

    const trends = hairstyles.map((h, i) => ({
      hairstyle_id:     h.id,
      trending_score:   scores[i] ?? 3.0,
      category:         h.category || 'Mixte',
      difficulty:       difficultyMap[h.category] || 'moyen',
      duration_minutes: durationMap[h.category] || 45,
      price_range:      priceMap[h.category] || '3000-8000 FCFA',
      is_active:        true,
      start_date:       new Date(),
    }));

    const created = await db.TrendHairstyle.bulkCreate(trends);
    console.log(`✅ ${created.length} tendances créées`);
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

seedTrending();
