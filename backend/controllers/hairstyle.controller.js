const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration de la connexion à la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hairgo_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5435,
});

// Fonction utilitaire pour exécuter des requêtes
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

// Créer le dossier d'uploads s'il n'existe pas
const uploadDir = path.join(__dirname, '../../public/uploads/hairstyles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ajouter une nouvelle coiffure
exports.addHairstyle = async (req, res) => {
  try {
    const { name, description, estimated_duration, category, is_active } = req.body;
    let photoUrl = '';

    // Gestion de l'upload de la photo
    if (req.file) {
      // Cas où on utilise upload.single()
      try {
        const file = req.file;
        const fileExt = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, filename);
        
        // Déplacer le fichier vers le dossier d'uploads
        fs.renameSync(file.path, filePath);
        
        // Enregistrer le chemin relatif dans la base de données
        photoUrl = `/uploads/hairstyles/${filename}`;
      } catch (uploadError) {
        console.error('Erreur lors de l\'enregistrement de l\'image:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de l\'enregistrement de l\'image' 
        });
      }
    } else if (req.files) {
      // Cas où on utilise upload.any()
      try {
        // Récupérer tous les fichiers qui commencent par 'photo_'
        const photoFiles = Object.entries(req.files)
          .filter(([key]) => key.startsWith('photo_'))
          .map(([_, file]) => file);

        // Traiter uniquement la première photo pour l'instant
        if (photoFiles.length > 0) {
          const file = Array.isArray(photoFiles[0]) ? photoFiles[0][0] : photoFiles[0];
          const fileExt = path.extname(file.originalname).toLowerCase();
          const filename = `${uuidv4()}${fileExt}`;
          const filePath = path.join(uploadDir, filename);
          
          // Déplacer le fichier vers le dossier d'uploads
          fs.renameSync(file.path, filePath);
          
          // Enregistrer le chemin relatif dans la base de données
          photoUrl = `/uploads/hairstyles/${filename}`;
        }
      } catch (uploadError) {
        console.error('Erreur lors de l\'enregistrement des images:', uploadError);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur lors de l\'enregistrement des images' 
        });
      }
    }

    const queryText = `
      INSERT INTO hairstyles 
        (id, name, description, photo, estimated_duration, category, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      uuidv4(), // Générer un nouvel ID
      name, 
      description, 
      photoUrl, 
      estimated_duration, 
      category, 
      is_active === 'true' || is_active === true
    ];

    const result = await query(queryText, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de la coiffure:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la coiffure',
      error: error.message
    });
  }
};

// Ajouter plusieurs coiffures (seed data)
exports.seedHairstyles = async (req, res) => {
  try {
    const hairstyles = [
      {
        name: 'Coupe Dégradé Homme',
        description: 'Coupe moderne avec dégradé progressif sur les côtés et dos',
        photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
        estimated_duration: 30,
        category: 'homme',
        is_active: true
      },
      {
        name: 'Brushing Lissant',
        description: 'Brushing professionnel pour cheveux lisses et brillants',
        photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
        estimated_duration: 45,
        category: 'femme',
        is_active: true
      },
      {
        name: 'Coloration Ombré',
        description: 'Coloration ombré avec dégradé naturel du foncé au clair',
        photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
        estimated_duration: 120,
        category: 'femme',
        is_active: true
      },
      {
        name: 'Barbe Traditionnelle',
        description: 'Taille de barbe traditionnelle au rasoir et ciseaux',
        photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
        estimated_duration: 25,
        category: 'homme',
        is_active: true
      },
      {
        name: 'Chignon Classique',
        description: 'Chignon élégant pour occasions spéciales',
        photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
        estimated_duration: 60,
        category: 'femme',
        is_active: true
      },
      {
        name: 'Coupe Enfant Mixte',
        description: 'Coupe simple et rapide pour enfants',
        photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
        estimated_duration: 20,
        category: 'enfant',
        is_active: true
      },
      {
        name: 'Mèches Balayage',
        description: 'Mèches balayage pour effet naturel et ensoleillé',
        photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
        estimated_duration: 90,
        category: 'femme',
        is_active: true
      },
      {
        name: 'Coupe Court Homme',
        description: 'Coupe courte et stylée pour homme moderne',
        photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
        estimated_duration: 25,
        category: 'homme',
        is_active: true
      },
      {
        name: 'Soin Capillaire Profond',
        description: 'Soin nourrissant et réparateur en profondeur',
        photo: 'https://images.unsplash.com/photo-1562322140-8ddde5a8b4d5?w=400&h=400&fit=crop',
        estimated_duration: 40,
        category: 'femme',
        is_active: true
      },
      {
        name: 'Tresse Africaine',
        description: 'Tresse africaine traditionnelle et moderne',
        photo: 'https://images.unsplash.com/photo-1560066988-1a4b1b6b8b6b?w=400&h=400&fit=crop',
        estimated_duration: 180,
        category: 'femme',
        is_active: true
      }
    ];

    const insertedHairstyles = [];
    
    for (const hairstyle of hairstyles) {
      try {
        const queryText = `
          INSERT INTO hairstyles (name, description, photo, estimated_duration, category, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (name) DO UPDATE SET
            description = EXCLUDED.description,
            photo = EXCLUDED.photo,
            estimated_duration = EXCLUDED.estimated_duration,
            category = EXCLUDED.category,
            is_active = EXCLUDED.is_active
          RETURNING *
        `;
        
        const values = [
          hairstyle.name,
          hairstyle.description,
          hairstyle.photo,
          hairstyle.estimated_duration,
          hairstyle.category,
          hairstyle.is_active
        ];

        const result = await query(queryText, values);
        
        if (result.rows.length > 0) {
          insertedHairstyles.push(result.rows[0]);
        }
      } catch (error) {
        console.error(`Erreur lors de l'ajout de ${hairstyle.name}:`, error);
      }
    }

    res.status(201).json({
      success: true,
      message: `${insertedHairstyles.length} coiffures ajoutées avec succès`,
      data: insertedHairstyles
    });

  } catch (error) {
    console.error('Erreur lors du seed des coiffures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du seed des coiffures',
      error: error.message
    });
  }
};

// Récupérer toutes les coiffures
exports.getHairstyles = async (req, res) => {
  try {
    const result = await query('SELECT * FROM hairstyles ORDER BY created_at DESC');
    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des coiffures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des coiffures',
      error: error.message
    });
  }
};
