import { db } from "./db";
import { hashPassword } from "./password";

const ADMIN_EMAIL = "amir0315794492@gmail.com";
const ADMIN_PASSWORD = "@#$&16609";

interface SeedCar {
  brand: string;
  model: string;
  type: string;
  transmission: string;
  fuel: string;
  seats: number;
  doors: number;
  pricePerDay: number;
  withDriver: boolean;
  city: string;
  images: string[];
  features: string[];
  description: string;
  rating: number;
}

const CARS: SeedCar[] = [
  {
    brand: "Toyota", model: "Corolla GLi", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 8500, withDriver: false, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/1ec372c0ed7b.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/545fe3adb66a.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Bluetooth", "USB Charging", "ABS"],
    description: "A reliable and fuel-efficient sedan perfect for city commutes and family trips across Islamabad. The Toyota Corolla GLi offers a smooth automatic drive with comfortable seating for five.",
    rating: 4.6,
  },
  {
    brand: "Honda", model: "Civic Oriel 1.5 Turbo", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 12000, withDriver: false, city: "Lahore",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f3fbb1b7e6eb.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f3e90e0f378b.jpg"],
    features: ["Air Conditioning", "Sunroof", "Cruise Control", "Leather Seats", "Push Start", "Reverse Camera"],
    description: "Experience the thrill of the Honda Civic Oriel with its powerful 1.5L turbo engine, sporty design, and premium interior. Ideal for business travelers and weekend getaways in Lahore.",
    rating: 4.8,
  },
  {
    brand: "Suzuki", model: "Alto VXL", type: "Hatchback", transmission: "Manual", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 4500, withDriver: false, city: "Karachi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/befb61b12faa.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cfdf2a71deb0.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "USB Charging"],
    description: "The most economical ride in our fleet. Compact, easy to park, and incredibly fuel-efficient — perfect for navigating Karachi's busy streets on a budget.",
    rating: 4.3,
  },
  {
    brand: "Toyota", model: "Land Cruiser V8", type: "SUV", transmission: "Automatic", fuel: "Diesel",
    seats: 7, doors: 5, pricePerDay: 35000, withDriver: true, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e3f4e1228b8.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/785d472b53f3.jpg"],
    features: ["4x4 Drive", "Air Conditioning", "Leather Seats", "Sunroof", "GPS Navigation", "Reverse Camera", "Cruise Control"],
    description: "A flagship SUV built for both luxury and rugged terrain. Conquer the Margalla Hills or cruise the motorway in unmatched comfort with a professional driver included.",
    rating: 4.9,
  },
  {
    brand: "Kia", model: "Sportage AWD", type: "SUV", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 5, pricePerDay: 15000, withDriver: false, city: "Lahore",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ac7ef6802092.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/785d472b53f3.jpg"],
    features: ["AWD", "Air Conditioning", "Panoramic Sunroof", "Leather Seats", "Apple CarPlay", "Reverse Camera"],
    description: "A stylish and capable crossover SUV with all-wheel drive, perfect for families exploring Lahore and beyond. Modern tech and a premium cabin make every journey enjoyable.",
    rating: 4.7,
  },
  {
    brand: "Mercedes-Benz", model: "E-Class 200", type: "Luxury", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 28000, withDriver: true, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/51d8a89ebcde.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/bdd3f57d9e20.jpeg"],
    features: ["Luxury Leather", "Ambient Lighting", "Panoramic Roof", "Massage Seats", "Premium Audio", "Chauffeur Service"],
    description: "Arrive in absolute elegance. The Mercedes E-Class delivers first-class comfort with a professional chauffeur — the perfect choice for weddings, corporate events, and VIP airport transfers in Islamabad.",
    rating: 5.0,
  },
  {
    brand: "Toyota", model: "Prius Hybrid", type: "Sedan", transmission: "Automatic", fuel: "Hybrid",
    seats: 5, doors: 4, pricePerDay: 11000, withDriver: false, city: "Karachi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/8d1202fda93b.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/f3fbb1b7e6eb.jpg"],
    features: ["Hybrid Engine", "Air Conditioning", "Push Start", "Cruise Control", "Reverse Camera", "Bluetooth"],
    description: "Go green without compromising on comfort. The Toyota Prius Hybrid offers outstanding fuel economy and a silent, smooth drive — ideal for eco-conscious travelers in Karachi.",
    rating: 4.5,
  },
  {
    brand: "Suzuki", model: "Cultus VXL", type: "Hatchback", transmission: "Manual", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 5000, withDriver: false, city: "Multan",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ae4242412cf4.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/befb61b12faa.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Power Windows"],
    description: "An affordable and dependable hatchback for everyday travel in Multan and southern Punjab. Spacious enough for a small family and easy on the wallet.",
    rating: 4.2,
  },
  {
    brand: "Hyundai", model: "Tucson AWD", type: "SUV", transmission: "Automatic", fuel: "Diesel",
    seats: 5, doors: 5, pricePerDay: 16000, withDriver: false, city: "Rawalpindi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/785d472b53f3.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ac7ef6802092.jpg"],
    features: ["AWD", "Air Conditioning", "Sunroof", "Wireless Charging", "Apple CarPlay", "Reverse Camera"],
    description: "A premium diesel SUV blending performance and efficiency. Great for trips to Murree, Nathiagali, and the northern areas departing from Rawalpindi.",
    rating: 4.6,
  },
  {
    brand: "Toyota", model: "Hiace Commuter", type: "Van", transmission: "Manual", fuel: "Diesel",
    seats: 12, doors: 4, pricePerDay: 18000, withDriver: true, city: "Lahore",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/cfa92f63e17e.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2caaf4ba33c1.jpg"],
    features: ["12 Seater", "Air Conditioning", "Spacious Interior", "Professional Driver", "Luggage Space"],
    description: "The go-to choice for group travel, family tours, and corporate transport. Seats up to 12 passengers comfortably with ample luggage space and a skilled driver included.",
    rating: 4.5,
  },
  {
    brand: "Porsche", model: "911 Carrera", type: "Coupe", transmission: "Automatic", fuel: "Petrol",
    seats: 4, doors: 2, pricePerDay: 75000, withDriver: false, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7c39d5a47137.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fc67f531b263.jpg"],
    features: ["Sports Mode", "Premium Audio", "Leather Interior", "Paddle Shift", "Launch Control", "Premium Brakes"],
    description: "Make a statement. The legendary Porsche 911 Carrera delivers breathtaking performance and timeless design for those special occasions that demand nothing less than extraordinary.",
    rating: 5.0,
  },
  {
    brand: "Ford", model: "Ranger Raptor", type: "Pickup", transmission: "Manual", fuel: "Diesel",
    seats: 5, doors: 4, pricePerDay: 20000, withDriver: false, city: "Peshawar",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ebd761ee0a5e.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a861135f1131.jpg"],
    features: ["4x4 Drive", "Off-Road Mode", "Air Conditioning", "Tow Capability", "Premium Audio", "Reverse Camera"],
    description: "A rugged, go-anywhere pickup truck built for adventure. Tackle the terrain of KPK and beyond with the capable Ford Ranger Raptor — engineered for both work and play.",
    rating: 4.4,
  },
  {
    brand: "BMW", model: "5 Series 530i", type: "Luxury", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 30000, withDriver: true, city: "Karachi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9c74113eb17b.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/51d8a89ebcde.jpg"],
    features: ["Luxury Leather", "Heated Seats", "Panoramic Roof", "Harman Kardon Audio", "Gesture Control", "Chauffeur Service"],
    description: "The Ultimate Driving Machine. The BMW 5 Series blends dynamic performance with executive luxury — available with a professional chauffeur for business and event travel in Karachi.",
    rating: 4.9,
  },
  {
    brand: "Toyota", model: "Fortuner Legender", type: "SUV", transmission: "Automatic", fuel: "Diesel",
    seats: 7, doors: 5, pricePerDay: 22000, withDriver: false, city: "Murree",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/5c5431a2172f.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e3f4e1228b8.jpg"],
    features: ["4x4 Drive", "Air Conditioning", "Leather Seats", "Sunroof", "GPS Navigation", "7 Seater"],
    description: "Built for the hills. The Toyota Fortuner Legender is a 7-seater diesel SUV that handles Murree's winding roads and snowy winters with confidence and comfort.",
    rating: 4.7,
  },
  {
    brand: "Honda", model: "Civic 2026", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 14000, withDriver: false, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/84d5ec5c941f.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d838161cd225.jpg"],
    features: ["Air Conditioning", "Sunroof", "Cruise Control", "Leather Seats", "Push Start", "Reverse Camera", "Apple CarPlay"],
    description: "The all-new 2026 Honda Civic — bold redesign, turbo-charged performance, and a premium tech-loaded cabin. The latest model for those who want to drive the newest Civic in Islamabad.",
    rating: 4.9,
  },
  {
    brand: "Honda", model: "Civic 2025", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 13000, withDriver: false, city: "Lahore",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d838161cd225.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/84d5ec5c941f.jpg"],
    features: ["Air Conditioning", "Sunroof", "Cruise Control", "Leather Seats", "Push Start", "Reverse Camera"],
    description: "The 2025 Honda Civic — sporty styling, refined ride, and Honda's legendary reliability. A favourite for business and leisure travel across Lahore.",
    rating: 4.8,
  },
  {
    brand: "Toyota", model: "Corolla 2026", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 10000, withDriver: false, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ef95d2ccbd9d.png", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a84e46ca2a7a.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Bluetooth", "USB Charging", "ABS", "Reverse Camera"],
    description: "The brand-new 2026 Toyota Corolla — fresh design, enhanced fuel efficiency, and the latest safety tech. Pakistan's most trusted sedan, now in its newest avatar.",
    rating: 4.7,
  },
  {
    brand: "Toyota", model: "Corolla 2025", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 9500, withDriver: false, city: "Karachi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a84e46ca2a7a.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ef95d2ccbd9d.png"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Bluetooth", "USB Charging", "ABS"],
    description: "The 2025 Toyota Corolla — a comfortable, efficient, and dependable sedan perfect for daily commutes and intercity travel in Karachi.",
    rating: 4.6,
  },
  {
    brand: "Suzuki", model: "Alto 2025", type: "Hatchback", transmission: "Manual", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 4800, withDriver: false, city: "Lahore",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/ffc819bd7bb6.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7b021f77adad.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "USB Charging", "Power Windows"],
    description: "The 2025 Suzuki Alto — the most economical ride in our fleet. Compact, incredibly fuel-efficient, and easy to park. Perfect for navigating Lahore's busy streets on a budget.",
    rating: 4.4,
  },
  {
    brand: "Suzuki", model: "Cultus Grande", type: "Hatchback", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 6500, withDriver: false, city: "Multan",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/580fddac0475.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/17a763a939e9.jpeg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Power Windows", "ABS", "Multimedia Screen"],
    description: "The Suzuki Cultus Grande — a spacious and refined hatchback with automatic transmission. Great value for families travelling around Multan and southern Punjab.",
    rating: 4.4,
  },
  {
    brand: "Toyota", model: "Yaris", type: "Sedan", transmission: "Automatic", fuel: "Petrol",
    seats: 5, doors: 4, pricePerDay: 7500, withDriver: false, city: "Rawalpindi",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7b398f99f848.png", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7bf3be0a9839.jpg"],
    features: ["Air Conditioning", "Power Steering", "Airbags", "Bluetooth", "USB Charging", "ABS", "Reverse Camera"],
    description: "The Toyota Yaris — a stylish, fuel-efficient sedan that bridges the gap between compact and mid-size. Ideal for daily use and trips around Rawalpindi and Islamabad.",
    rating: 4.5,
  },
  {
    brand: "Toyota", model: "Land Cruiser Prado", type: "SUV", transmission: "Automatic", fuel: "Diesel",
    seats: 7, doors: 5, pricePerDay: 28000, withDriver: true, city: "Islamabad",
    images: ["https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/2401d811972e.jpg", "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6873d4f8a0ea.jpeg"],
    features: ["4x4 Drive", "Air Conditioning", "Leather Seats", "Sunroof", "GPS Navigation", "Reverse Camera", "7 Seater", "Cruise Control"],
    description: "The Toyota Land Cruiser Prado — legendary off-road capability meets premium luxury. A 7-seater diesel SUV with a professional driver, perfect for northern areas trips and family tours from Islamabad.",
    rating: 4.9,
  },
];

const CITIES = [
  { name: "Islamabad", description: "The capital city — rent a car for Margalla Hills, Faisal Mosque, and Daman-e-Koh.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/6a5f19af431c.jpg" },
  { name: "Rawalpindi", description: "Twin city to Islamabad — gateway to the northern areas and Murree.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/65fc0fac4172.jpeg" },
  { name: "Lahore", description: "The cultural heart of Pakistan — explore Badshahi Mosque, Lahore Fort, and Food Street.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/104618110722.jpg" },
  { name: "Karachi", description: "The city of lights — beach drives, Clifton, and the bustling metropolis.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/420eb9dce9a2.jpg" },
  { name: "Peshawar", description: "Gateway to KPK — historic Qissa Khwani Bazaar and the Khyber Pass.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a2170c91adb1.jpg" },
  { name: "Multan", description: "City of Saints — shrines, mangoes, and southern Punjab hospitality.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/41666e9c987e.jpg" },
  { name: "Murree", description: "Hill station getaway — pine forests, cool weather, and scenic mountain roads.", image: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/72e07aa4c6f5.jpeg" },
];

export async function runSeed() {
  // Admin user
  const existingAdmin = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existingAdmin) {
    await db.user.create({
      data: {
        name: "Amir (Admin)",
        email: ADMIN_EMAIL,
        phone: "0311-5794492",
        passwordHash: hashPassword(ADMIN_PASSWORD),
        role: "ADMIN",
      },
    });
  }

  // Demo customer
  const demoEmail = "customer@demo.com";
  const existingDemo = await db.user.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    await db.user.create({
      data: {
        name: "Demo Customer",
        email: demoEmail,
        phone: "0300-1234567",
        passwordHash: hashPassword("demo1234"),
        role: "CUSTOMER",
      },
    });
  }

  // Cities (update image + description on every seed)
  for (const c of CITIES) {
    await db.city.upsert({
      where: { name: c.name },
      update: { image: c.image, description: c.description },
      create: c,
    });
  }

  // Cars (upsert by brand+model — adds new models, keeps existing)
  let addedCars = 0;
  for (const c of CARS) {
    const existing = await db.vehicle.findFirst({
      where: { brand: c.brand, model: c.model },
    });
    if (!existing) {
      await db.vehicle.create({
        data: {
          brand: c.brand,
          model: c.model,
          type: c.type,
          transmission: c.transmission,
          fuel: c.fuel,
          seats: c.seats,
          doors: c.doors,
          pricePerDay: c.pricePerDay,
          withDriver: c.withDriver,
          city: c.city,
          images: JSON.stringify(c.images),
          features: JSON.stringify(c.features),
          description: c.description,
          rating: c.rating,
          available: true,
        },
      });
      addedCars++;
    }
  }

  return { admin: ADMIN_EMAIL, cars: CARS.length, addedCars, cities: CITIES.length };
}
