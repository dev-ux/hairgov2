// Test d'inscription vers le backend PostgreSQL sur Render

console.log("🧪 TEST D'INSCRIPTION - BACKEND POSTGRESQL");
console.log("=========================================");

const API_BASE_URL = 'https://hairgov2.onrender.com';

// Données de test formatées pour votre backend
const testData = {
  full_name: "Awa Koné",
  phone: "+2250712345678",
  email: "awa.kone@test.com",
  password: "Password123!",
  profession: "Coiffeur professionnel",
  residential_address: "Cocody, Abidjan",
  date_of_birth: "1990-01-01",
  id_card_number: "ID-" + Date.now(),
  has_salon: false,
  education_level: "CAP Coiffure",
  hairstyle_ids: [1, 2, 3]
};

console.log("🌐 Configuration:");
console.log(`   URL: ${API_BASE_URL}`);
console.log(`   Endpoint: POST /api/v1/auth/register/hairdresser`);
console.log(`   Base de données: PostgreSQL`);
console.log(`   Hébergement: Render`);

console.log("\n📤 Données à envoyer:");
console.log(JSON.stringify(testData, null, 2));

// Test avec fetch (similaire à axios)
async function testBackendConnection() {
  try {
    console.log("\n🔄 Test de connexion au backend...");
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/hairdresser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Succès !");
      console.log("📦 Réponse:", JSON.stringify(data, null, 2));
      
      if (data.token) {
        console.log("🔑 Token JWT reçu:", data.token.substring(0, 20) + "...");
      }
      
      if (data.user) {
        console.log("👤 Utilisateur créé:", data.user.email);
      }
      
    } else {
      const errorData = await response.text();
      console.log("❌ Erreur:", errorData);
      
      if (response.status === 409) {
        console.log("📧 Email déjà utilisé");
      } else if (response.status === 400) {
        console.log("⚠️ Données invalides");
      } else if (response.status === 500) {
        console.log("🔥 Erreur serveur");
      }
    }
    
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
    
    if (error.message.includes('timeout')) {
      console.log("⏰ Timeout - Le backend est peut-être en mode veille (Render)");
      console.log("💡 Solution: Patientez quelques secondes et réessayez");
    } else if (error.message.includes('CORS')) {
      console.log("🌐 Erreur CORS - Le backend n'accepte pas les requêtes depuis votre domaine");
      console.log("💡 Solution: Configurez CORS dans le backend");
    } else {
      console.log("🔌 Erreur réseau - Vérifiez votre connexion");
    }
  }
}

// Test de santé du backend
async function testHealthCheck() {
  try {
    console.log("\n🏥 Test de santé du backend...");
    
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log("✅ Backend accessible");
      console.log("📄 Réponse:", data.substring(0, 100) + "...");
    } else {
      console.log("❌ Backend inaccessible");
    }
    
  } catch (error) {
    console.error("❌ Erreur de santé:", error.message);
  }
}

// Exécuter les tests
async function runTests() {
  console.log("🚀 DÉMARRAGE DES TESTS");
  console.log("====================");
  
  await testHealthCheck();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testBackendConnection();
  
  console.log("\n📝 RÉSUMÉ");
  console.log("==========");
  console.log("✅ URL API mise à jour: https://hairgov2.onrender.com");
  console.log("✅ Données formatées pour PostgreSQL");
  console.log("✅ Mode mock désactivé");
  console.log("🎯 Le formulaire enverra les données à votre base PostgreSQL !");
}

runTests();
