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

// Ajouter une coiffure temporairement sans authentification
exports.addHairstyleTemp = async (req, res) => {
  try {
    const { name, description, photo, estimated_duration, category, is_active } = req.body;

    const queryText = `
      INSERT INTO hairstyles 
        (id, name, description, photo, estimated_duration, category, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      require('uuid').v4(), // Générer un nouvel ID
      name,
      description,
      photo, // Utiliser la photo fournie directement
      estimated_duration,
      category,
      is_active === 'true' || is_active === true
    ];

    const result = await query(queryText, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Hairstyle ajouté avec succès'
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
    console.log('🌱 Début du seed des hairstyles...');
    
    const hairstyles = [
      {
        name: 'Coupe Dégradé Homme',
        description: 'Coupe moderne avec dégradé progressif sur les côtés et dos',
        photo: 'https://images.unsplash.com/photo-1582073213061-1b3d9a5b7b6b?w=400&h=400&fit=crop',
        estimated_duration: 30,
        category: 'homme',
        is_active: true
      },
      // ... autres hairstyles
    ];

    const insertedHairstyles = [];
    
    for (const hairstyle of hairstyles) {
      try {
        console.log(`🔄 Traitement de: ${hairstyle.name}`);
        
        const queryText = `
          INSERT INTO hairstyles (name, description, photo, estimated_duration, category, is_active)
          VALUES ($1, $2, $3, $4, $5, $6)
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
        console.log(`📊 Résultat pour ${hairstyle.name}: ${result.rowCount} lignes`);
        
        if (result.rows.length > 0) {
          insertedHairstyles.push(result.rows[0]);
          console.log(`✅ Ajouté: ${hairstyle.name}`);
        } else {
          console.log(`❌ Pas de retour pour: ${hairstyle.name}`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'ajout de ${hairstyle.name}:`, error);
      }
    }

    console.log(`🎉 Total traité: ${insertedHairstyles.length} hairstyles`);
    
    res.status(201).json({
      success: true,
      message: `${insertedHairstyles.length} coiffures ajoutées avec succès`,
      data: insertedHairstyles
    });

  } catch (error) {
    console.error('❌ Erreur lors du seed des coiffures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du seed des coiffures',
      error: error.message
    });
  }
};

// Modifier une coiffure existante
exports.updateHairstyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, estimated_duration, category, is_active } = req.body;
    let photoUrl = '';

    // Gestion de l'upload de la photo
    if (req.file) {
      try {
        const file = req.file;
        const fileExt = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, filename);
        
        // Déplacer le fichier vers le dossier d'uploads
        fs.renameSync(file.path, filePath);
        
        // Enregistrer le chemin relatif dans la base de données
        photoUrl = `/uploads/hairstyles/${filename}`;
      } catch (error) {
        console.error('Erreur lors de l\'upload de la photo:', error);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'upload de la photo',
          error: error.message
        });
      }
    }

    const updateQuery = `
      UPDATE hairstyles 
      SET name = $1, 
          description = $2, 
          estimated_duration = $3, 
          category = $4, 
          is_active = $5,
          photo = COALESCE($6, photo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;

    const values = [name, description, estimated_duration, category, is_active, photoUrl, id];
    const result = await query(updateQuery, values);

    if (result.rowCount > 0) {
      res.status(200).json({
        success: true,
        message: 'Coiffure modifiée avec succès',
        data: { id, name, description, estimated_duration, category, is_active, photo: photoUrl }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Coiffure non trouvée'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la modification de la coiffure:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la coiffure',
      error: error.message
    });
  }
};

// Supprimer une coiffure
exports.deleteHairstyle = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier d'abord si la coiffure existe
    const checkQuery = 'SELECT * FROM hairstyles WHERE id = $1';
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coiffure non trouvée'
      });
    }

    // Supprimer la photo associée si elle existe
    const hairstyle = checkResult.rows[0];
    if (hairstyle.photo && hairstyle.photo.includes('/uploads/hairstyles/')) {
      const photoPath = path.join(__dirname, '../../public', hairstyle.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
        console.log(`🗑️ Photo supprimée: ${photoPath}`);
      }
    }

    // Supprimer la coiffure de la base de données
    const deleteQuery = 'DELETE FROM hairstyles WHERE id = $1';
    const result = await query(deleteQuery, [id]);

    if (result.rowCount > 0) {
      res.status(200).json({
        success: true,
        message: 'Coiffure supprimée avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression de la coiffure'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la coiffure:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la coiffure',
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
