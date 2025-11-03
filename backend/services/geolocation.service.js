// services/geolocation.service.js
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { User, Hairdresser, Hairstyle } = require('../models');

// Fonction utilitaire pour calculer la distance entre deux points en mètres (formule de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = lat1 * Math.PI / 180; // φ, λ en radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // en mètres
}

/**
 * Trouve les coiffeurs à proximité d'un point géographique
 * @param {number} latitude - Latitude du point de référence
 * @param {number} longitude - Longitude du point de référence
 * @param {number} radius - Rayon de recherche en mètres
 * @param {string} [hairstyleId] - ID du style de coiffure pour filtrer les coiffeurs
 * @returns {Promise<Array>} Liste des coiffeurs à proximité avec leurs distances
 */
async function findNearbyHairdressers(latitude, longitude, radius = 5000, hairstyleId = null) {
  try {
    // Récupérer tous les coiffeurs disponibles
    const hairdressers = await Hairdresser.findAll({
      include: [
        {
          model: User,
          as: 'user',
          where: {
            is_active: true,
            user_type: 'hairdresser'
          },
          attributes: ['id', 'full_name', 'email', 'phone', 'profile_photo']
        },
        {
          model: Hairstyle,
          as: 'hairstyles',
          where: hairstyleId ? { id: hairstyleId } : {},
          required: !!hairstyleId,
          through: { attributes: [] },
          attributes: ['id', 'name', 'description', 'photo', 'estimated_duration', 'category']
        }
      ],
      where: {
        is_available: true,
        registration_status: 'approved',
        latitude: { [Op.ne]: null },
        longitude: { [Op.ne]: null }
      },
      raw: true,
      nest: true
    });

    // Calculer la distance pour chaque coiffeur et filtrer
    const hairdressersWithDistance = hairdressers
      .map(hairdresser => {
        if (hairdresser.latitude && hairdresser.longitude) {
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(hairdresser.latitude),
            parseFloat(hairdresser.longitude)
          );
          
          // Ajouter la distance à l'objet coiffeur
          return {
            ...hairdresser,
            distance_meters: Math.round(distance)
          };
        }
        return null;
      })
      .filter(Boolean) // Enlever les entrées null
      .filter(hairdresser => hairdresser.distance_meters <= radius) // Filtrer par rayon
      .sort((a, b) => a.distance_meters - b.distance_meters); // Trier par distance croissante

    return hairdressersWithDistance;
  } catch (error) {
    console.error('Error finding nearby hairdressers:', error);
    throw new Error('Erreur lors de la recherche de coiffeurs à proximité');
  }
}

/**
 * Obtenir l'adresse à partir des coordonnées (Reverse Geocoding)
 */
const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Utiliser un service de géocodage comme OpenStreetMap Nominatim
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.display_name || 'Adresse non trouvée';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return 'Adresse inconnue';
  }
};

/**
 * Obtenir les coordonnées à partir d'une adresse (Geocoding)
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    // Utiliser un service de géocodage comme OpenStreetMap Nominatim
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Adresse non trouvée');
    }
    
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      display_name: data[0].display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Calculer le temps de trajet estimé
 */
const calculateTravelTime = async (originLat, originLon, destLat, destLon) => {
  try {
    // Utiliser un service d'itinéraire comme OSRM (Open Source Routing Machine)
    const response = await fetch(
      `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`
    );
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('Impossible de calculer le trajet');
    }
    
    return {
      duration: Math.round(data.routes[0].duration / 60), // en minutes
      distance: Math.round(data.routes[0].distance) // en mètres
    };
  } catch (error) {
    console.error('Erreur de calcul du trajet:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      duration: 15, // minutes par défaut
      distance: 2000 // mètres par défaut
    };
  }
};

module.exports = {
  calculateDistance,
  findNearbyHairdressers,
  getAddressFromCoordinates,
  getCoordinatesFromAddress,
  calculateTravelTime
};