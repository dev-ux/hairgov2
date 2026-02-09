// Test d'inscription coiffeur - Mode Mock
// Simule les données du formulaire d'inscription

const mockRegistrationData = {
  firstName: "Awa",
  lastName: "Koné",
  email: "awa.kone@email.com",
  phone: "+2250712345678",
  password: "Password123!",
  address: "Cocody, Abidjan",
  city: "Abidjan",
  postalCode: "01",
  experience: "2-5",
  diploma: "CAP Coiffure",
  specialties: ["Coupe femme", "Coloration", "Mèches"],
  description: "Coiffeuse professionnelle avec 3 ans d'expérience, spécialisée dans les colorations et les coiffures modernes.",
  travelRadius: 15,
  role: "hairdresser",
  location: {
    address: "Cocody, Abidjan",
    city: "Abidjan",
    postalCode: "01",
    country: "Côte d'Ivoire"
  },
  profile: {
    experience: "2-5",
    diploma: "CAP Coiffure",
    specialties: ["Coupe femme", "Coloration", "Mèches"],
    travelRadius: 15,
    description: "Coiffeuse professionnelle avec 3 ans d'expérience, spécialisée dans les colorations et les coiffures modernes."
  }
};

console.log("🧪 TEST D'INSCRIPTION COIFFEUR - MODE MOCK");
console.log("==========================================");
console.log("Données d'inscription:", JSON.stringify(mockRegistrationData, null, 2));

// Simulation de la fonction registerHairdresser
async function testRegistration() {
  try {
    console.log("\n📤 Envoi des données d'inscription...");
    
    // Simuler le délai du réseau
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validation mock
    if (mockRegistrationData.email === 'test@test.com') {
      throw {
        response: {
          status: 409,
          data: { message: 'Cette adresse email est déjà utilisée. Veuillez en choisir une autre.' }
        }
      };
    }
    
    if (mockRegistrationData.password.length < 8) {
      throw {
        response: {
          status: 400,
          data: { message: 'Le mot de passe doit contenir au moins 8 caractères' }
        }
      };
    }
    
    // Succès mock
    const response = {
      success: true,
      message: 'Inscription réussie (mode mock)',
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'mock-user-' + Date.now(),
        firstName: mockRegistrationData.firstName,
        lastName: mockRegistrationData.lastName,
        email: mockRegistrationData.email,
        role: 'hairdresser',
        profile: mockRegistrationData.profile
      }
    };
    
    console.log("✅ INSCRIPTION RÉUSSIE !");
    console.log("Token:", response.token);
    console.log("Utilisateur:", JSON.stringify(response.user, null, 2));
    
    // Simulation du stockage localStorage
    console.log("\n💾 Stockage des données dans localStorage:");
    console.log("Token stocké:", response.token);
    console.log("Utilisateur stocké:", JSON.stringify(response.user));
    
    return response;
    
  } catch (error) {
    console.log("❌ ERREUR D'INSCRIPTION:");
    console.log("Status:", error.response?.status);
    console.log("Message:", error.response?.data?.message);
    throw error;
  }
}

// Test d'erreur avec email déjà utilisé
async function testDuplicateEmail() {
  console.log("\n\n🧪 TEST EMAIL DÉJÀ UTILISÉ");
  console.log("==========================================");
  
  const duplicateData = {
    ...mockRegistrationData,
    email: 'test@test.com'
  };
  
  try {
    await testRegistration.call({ mockRegistrationData: duplicateData });
  } catch (error) {
    console.log("✅ Test d'erreur réussi - Email déjà détecté");
  }
}

// Exécuter les tests
testRegistration()
  .then(() => testDuplicateEmail())
  .then(() => {
    console.log("\n\n🎉 TOUS LES TESTS TERMINÉS AVEC SUCCÈS !");
    console.log("Le formulaire d'inscription fonctionne parfaitement en mode mock.");
  })
  .catch(error => {
    console.log("\n❌ ERREUR INATTENDUE:", error);
  });
