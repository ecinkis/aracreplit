import { db } from "./db";
import { listings, users } from "@shared/schema";
import { sql } from "drizzle-orm";

const DEMO_USER_ID = "demo-user-001";

const demoListings = [
  {
    id: "demo-listing-001",
    userId: DEMO_USER_ID,
    brand: "BMW",
    model: "320i M Sport",
    year: 2020,
    km: 45000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "İstanbul",
    district: "Kadıköy",
    estimatedValue: 1850000,
    description: "Temiz kullanılmış, kazasız, boyasız araç. M Sport paket, harman kardon ses sistemi, panoramik cam tavan mevcut.",
    photos: ["/vehicles/bmw-320i-white.jpg"],
    preferredBrands: ["Mercedes", "Audi", "Volkswagen"],
    swapActive: true,
    isFeatured: true,
    status: "approved",
    viewCount: 156,
  },
  {
    id: "demo-listing-002",
    userId: DEMO_USER_ID,
    brand: "Mercedes-Benz",
    model: "C200 AMG",
    year: 2019,
    km: 62000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "Ankara",
    district: "Çankaya",
    estimatedValue: 1950000,
    description: "AMG paket, gece paketi, burmester ses sistemi. Tüm bakımları yetkili serviste yapılmıştır.",
    photos: ["/vehicles/mercedes-c200-black.jpg"],
    preferredBrands: ["BMW", "Audi", "Volvo"],
    swapActive: true,
    isFeatured: true,
    status: "approved",
    viewCount: 203,
  },
  {
    id: "demo-listing-003",
    userId: DEMO_USER_ID,
    brand: "Audi",
    model: "A4 Quattro",
    year: 2021,
    km: 28000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "İzmir",
    district: "Karşıyaka",
    estimatedValue: 2100000,
    description: "Quattro 4x4, virtual cockpit, matrix LED farlar. Garantisi devam etmektedir.",
    photos: ["/vehicles/audi-a4-gray.jpg"],
    preferredBrands: ["BMW", "Mercedes", "Volkswagen"],
    swapActive: true,
    isFeatured: true,
    status: "approved",
    viewCount: 178,
  },
  {
    id: "demo-listing-004",
    userId: DEMO_USER_ID,
    brand: "Volkswagen",
    model: "Golf R",
    year: 2018,
    km: 55000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "İstanbul",
    district: "Beşiktaş",
    estimatedValue: 1450000,
    description: "310 HP, 4Motion, akrapovic egzoz, stage 1 tune. Performans tutkunları için ideal.",
    photos: ["/vehicles/vw-golf-r-blue.jpg"],
    preferredBrands: ["BMW", "Audi", "Ford"],
    swapActive: true,
    isFeatured: true,
    status: "approved",
    viewCount: 289,
  },
  {
    id: "demo-listing-005",
    userId: DEMO_USER_ID,
    brand: "Toyota",
    model: "Corolla Hybrid",
    year: 2022,
    km: 15000,
    fuelType: "Hibrit",
    transmission: "Otomatik",
    city: "Bursa",
    district: "Nilüfer",
    estimatedValue: 1350000,
    description: "Sıfır ayarında hibrit araç. Yakıt tasarruflu, çevreci. Tüm opsiyonlar mevcut.",
    photos: ["/vehicles/toyota-corolla-white.jpg"],
    preferredBrands: ["Honda", "Mazda", "Hyundai"],
    swapActive: true,
    isFeatured: false,
    status: "approved",
    viewCount: 134,
  },
  {
    id: "demo-listing-006",
    userId: DEMO_USER_ID,
    brand: "Ford",
    model: "Focus ST-Line",
    year: 2020,
    km: 38000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "Antalya",
    district: "Muratpaşa",
    estimatedValue: 1100000,
    description: "ST-Line paket, spor süspansiyon, 18 inç jantlar. Dinamik sürüş deneyimi.",
    photos: ["/vehicles/ford-focus-red.jpg"],
    preferredBrands: ["Volkswagen", "Peugeot", "Renault"],
    swapActive: true,
    isFeatured: false,
    status: "approved",
    viewCount: 98,
  },
  {
    id: "demo-listing-007",
    userId: DEMO_USER_ID,
    brand: "Volvo",
    model: "XC60 T5",
    year: 2019,
    km: 72000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "İstanbul",
    district: "Sarıyer",
    estimatedValue: 2400000,
    description: "Inscription paket, pilot assist, bowers & wilkins ses sistemi. En güvenli SUV.",
    photos: ["/vehicles/volvo-xc60-navy.jpg"],
    preferredBrands: ["BMW", "Mercedes", "Audi"],
    swapActive: true,
    isFeatured: true,
    status: "approved",
    viewCount: 167,
  },
  {
    id: "demo-listing-008",
    userId: DEMO_USER_ID,
    brand: "Honda",
    model: "Civic RS",
    year: 2021,
    km: 22000,
    fuelType: "Benzin",
    transmission: "Otomatik",
    city: "Kocaeli",
    district: "İzmit",
    estimatedValue: 1550000,
    description: "RS paket, 1.5 VTEC Turbo, Honda Sensing güvenlik paketi. Sportif ve güvenilir.",
    photos: ["/vehicles/honda-civic-gray.jpg"],
    preferredBrands: ["Toyota", "Mazda", "Hyundai"],
    swapActive: true,
    isFeatured: false,
    status: "approved",
    viewCount: 145,
  },
];

export async function seedDemoData(): Promise<void> {
  try {
    const existingListings = await db.select({ count: sql<number>`count(*)` }).from(listings);
    const count = Number(existingListings[0]?.count || 0);
    
    if (count > 0) {
      console.log(`Database already has ${count} listings, skipping seed.`);
      return;
    }

    console.log("Seeding demo data...");

    const existingUser = await db.select().from(users).where(sql`id = ${DEMO_USER_ID}`);
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: DEMO_USER_ID,
        phone: "+905551234567",
        name: "Demo Kullanıcı",
        city: "İstanbul",
        trustScore: 95,
        phoneVerified: true,
        identityVerified: true,
        userType: "bireysel",
      });
      console.log("Demo user created.");
    }

    for (const listing of demoListings) {
      await db.insert(listings).values(listing);
    }

    console.log(`Seeded ${demoListings.length} demo listings.`);
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}
