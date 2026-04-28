// Données géographiques des villes de Côte d'Ivoire
// Format: [id, nom, noms_alternatifs, latitude, longitude, type, classe, pays, codes_admin, population, élévation, fuseau_horaire, date_modification]

export const IVORY_COAST_CITIES = [
  {
    id: 2273690,
    name: "Tani River",
    alternateNames: ["Tani River", "Tani River"],
    latitude: 6.48028,
    longitude: -8.50972,
    featureClass: "H",
    featureCode: "STM",
    country: "CI",
    adminCodes: ["00"],
    population: 0,
    elevation: 270,
    timezone: "Africa/Monrovia",
    modificationDate: "2021-08-05"
  },
  {
    id: 2274685,
    name: "Monts Nimba",
    alternateNames: ["Manimba Range", "Monts Nimba", "Nanimba Mountains", "Nanimba Range", "Nimba Mountains", "Nimba Range"],
    latitude: 7.56306,
    longitude: -8.465,
    featureClass: "T",
    featureCode: "MTS",
    country: "CI",
    adminCodes: ["CI", "GN"],
    population: 0,
    elevation: 1242,
    timezone: "Africa/Monrovia",
    modificationDate: "2023-11-07"
  },
  {
    id: 2278048,
    name: "Cestos River",
    alternateNames: ["Cess", "Cess River", "Cestos", "Cestos River", "Negben", "Nuon", "Rio dos Cestos"],
    latitude: 5.45333,
    longitude: -9.57444,
    featureClass: "H",
    featureCode: "STM",
    country: "CI",
    adminCodes: ["LR"],
    population: 0,
    elevation: 0,
    timezone: "Africa/Monrovia",
    modificationDate: "2021-09-07"
  },
  {
    id: 2278455,
    name: "Boan",
    alternateNames: ["Boan", "Boan River"],
    latitude: 6.43903,
    longitude: -8.40383,
    featureClass: "H",
    featureCode: "STM",
    country: "CI",
    adminCodes: ["00"],
    population: 0,
    elevation: 252,
    timezone: "Africa/Monrovia",
    modificationDate: "2021-09-07"
  },
  {
    id: 2279151,
    name: "Ziogouin",
    alternateNames: ["Ziogouin", "Ziogouine", "Ziogouiné", "Zyogouine", "Zyogouiné"],
    latitude: 7.24536,
    longitude: -7.55026,
    featureClass: "P",
    featureCode: "PPL",
    country: "CI",
    adminCodes: ["00"],
    population: 78,
    elevation: 335,
    timezone: "Africa/Abidjan",
    modificationDate: "2023-12-22"
  },
  {
    id: 2279152,
    name: "Zyogouiné",
    alternateNames: ["Ziogouin", "Ziogouine", "Ziogouiné", "Zyogouine", "Zyogouiné"],
    latitude: 7.19246,
    longitude: -7.64056,
    featureClass: "P",
    featureCode: "PPL",
    country: "CI",
    adminCodes: ["00"],
    population: 78,
    elevation: 4145,
    timezone: "Africa/Abidjan",
    modificationDate: "2023-12-22"
  },
  {
    id: 2279153,
    name: "Zyelougo",
    alternateNames: ["Zielougo", "Ziélougo", "Zyelougo"],
    latitude: 9.53333,
    longitude: -5.88333,
    featureClass: "H",
    featureCode: "STMI",
    country: "CI",
    adminCodes: ["00"],
    population: 0,
    elevation: 335,
    timezone: "Africa/Abidjan",
    modificationDate: "2012-01-17"
  },
  {
    id: 2279154,
    name: "Zyébatogo",
    alternateNames: ["Ziebatogo", "Ziébatogo", "Zyebatogo", "Zyébatogo"],
    latitude: 9.5932,
    longitude: -5.44057,
    featureClass: "P",
    featureCode: "PPL",
    country: "CI",
    adminCodes: ["00"],
    population: 87,
    elevation: 515,
    timezone: "Africa/Abidjan",
    modificationDate: "2023-12-22"
  },
  {
    id: 2279155,
    name: "Zyébatogo",
    alternateNames: ["Ziebatogo", "Ziébatogo", "Zyebatogo", "Zyébatogo"],
    latitude: 9.15,
    longitude: -5.56667,
    featureClass: "P",
    featureCode: "PPL",
    country: "CI",
    adminCodes: ["00"],
    population: 87,
    elevation: 316,
    timezone: "Africa/Abidjan",
    modificationDate: "2014-01-10"
  },
  {
    id: 2279156,
    name: "Zwa",
    alternateNames: ["Zwa"],
    latitude: 8.72015,
    longitude: -7.74763,
    featureClass: "H",
    featureCode: "STM",
    country: "CI",
    adminCodes: ["00"],
    population: 97,
    elevation: 0,
    timezone: "Africa/Abidjan",
    modificationDate: "2016-06-04"
  },
  {
    id: 2279157,
    name: "Zuzua",
    alternateNames: ["Zuzua"],
    latitude: 6.62394,
    longitude: -6.47849,
    featureClass: "P",
    featureCode: "PPL",
    country: "CI",
    adminCodes: ["96"],
    population: 96,
    elevation: 824,
    timezone: "Africa/Abidjan",
    modificationDate: "2023-12-22"
  },
  // Ajoutez plus de villes ici...
];

// Fonctions utilitaires pour la recherche et la manipulation
export const searchCities = (query: string) => {
  if (!query) return IVORY_COAST_CITIES;
  
  const lowerQuery = query.toLowerCase();
  return IVORY_COAST_CITIES.filter(city => 
    city.name.toLowerCase().includes(lowerQuery) ||
    city.alternateNames.some(alt => alt.toLowerCase().includes(lowerQuery))
  );
};

export const getCityById = (id: number) => {
  return IVORY_COAST_CITIES.find(city => city.id === id);
};

export const getCitiesByRegion = (adminCode: string) => {
  return IVORY_COAST_CITIES.filter(city => 
    city.adminCodes.includes(adminCode)
  );
};

export const formatCityForSelect = (city: any) => ({
  value: city.id,
  label: `${city.name} (${city.latitude}, ${city.longitude})`,
  ...city
});

export default IVORY_COAST_CITIES;
