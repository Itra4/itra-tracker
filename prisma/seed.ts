import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ============================================
  // USERS
  // ============================================
  const passwordHash = await bcrypt.hash("change-me-123", 10);

  const william = await prisma.user.upsert({
    where: { email: "william@itra.local" },
    update: {},
    create: {
      name: "William",
      email: "william@itra.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  const avery = await prisma.user.upsert({
    where: { email: "avery@itra.local" },
    update: {},
    create: {
      name: "Avery",
      email: "avery@itra.local",
      passwordHash,
      role: "WAREHOUSE",
    },
  });

  console.log("Users created:");
  console.log("  - William (ADMIN)  → william@itra.local / change-me-123");
  console.log("  - Avery (WAREHOUSE) → avery@itra.local / change-me-123");

  // ============================================
  // CATEGORIES (from the approved eSCO list)
  // ============================================
  const categories = [
    // Circuit Boards / Precious Metals
    { name: "Gold Memory", groupName: "Circuit Boards / Precious Metals" },
    { name: "Silver Memory", groupName: "Circuit Boards / Precious Metals" },
    { name: "Hard Drive Board", groupName: "Circuit Boards / Precious Metals" },
    { name: "Shielded Memory", groupName: "Circuit Boards / Precious Metals" },
    { name: "Telecom Board", groupName: "Circuit Boards / Precious Metals" },
    { name: "Server Backplane High Grade", groupName: "Circuit Boards / Precious Metals" },
    { name: "Fingercards (Heatsink and Fan Removed)", groupName: "Circuit Boards / Precious Metals" },
    { name: "P3 Motherboard (Large Socket)", groupName: "Circuit Boards / Precious Metals" },
    { name: "Laptop Motherboard", groupName: "Circuit Boards / Precious Metals" },
    { name: "Midgrade Circuit Board", groupName: "Circuit Boards / Precious Metals" },
    { name: "Server Motherboard", groupName: "Circuit Boards / Precious Metals" },
    { name: "Cell Phones with Battery", groupName: "Circuit Boards / Precious Metals" },
    { name: "P4 Motherboard (Small Socket)", groupName: "Circuit Boards / Precious Metals" },
    { name: "Cell Phones", groupName: "Circuit Boards / Precious Metals" },
    { name: "Cable Box Boards", groupName: "Circuit Boards / Precious Metals" },
    { name: "Colored Motherboard", groupName: "Circuit Boards / Precious Metals" },
    { name: "Shredded Auto Board", groupName: "Circuit Boards / Precious Metals" },
    { name: "Power Board (Green)", groupName: "Circuit Boards / Precious Metals" },
    { name: "Power Board (Brown/Yellow)", groupName: "Circuit Boards / Precious Metals" },
    { name: "Crypto Board", groupName: "Circuit Boards / Precious Metals" },

    // Whole Units
    { name: "Laptop Scrap Mixed", groupName: "Whole Units" },
    { name: "Chromebooks", groupName: "Whole Units" },
    { name: "Thin Clients", groupName: "Whole Units" },
    { name: "Cable Boxes (No HDD)", groupName: "Whole Units" },
    { name: "Cable Boxes (w/HDD)", groupName: "Whole Units" },
    { name: "Computer Towers (Missing HDD Only)", groupName: "Whole Units" },
    { name: "Computer Towers (Missing RAM/CPU)", groupName: "Whole Units" },
    { name: "Workstations Complete (Missing HDD Only)", groupName: "Whole Units" },
    { name: "Servers Complete (Missing HDD Only)", groupName: "Whole Units" },
    { name: "Servers Incomplete (Missing RAM/CPU)", groupName: "Whole Units" },
    { name: "All In One Computers", groupName: "Whole Units" },
    { name: "Projectors", groupName: "Whole Units" },
    { name: "Office Phones", groupName: "Whole Units" },
    { name: "UPS w/ Batteries", groupName: "Whole Units" },
    { name: "UPS No Batteries", groupName: "Whole Units" },
    { name: "Disk Arrays", groupName: "Whole Units" },
    { name: "Cable Modems", groupName: "Whole Units" },
    { name: "Networking – Plastic Case", groupName: "Whole Units" },
    { name: "Networking – Steel Case", groupName: "Whole Units" },
    { name: "Bitcoin Miners", groupName: "Whole Units" },

    // Computer Scrap / Components
    { name: "AC Adapters w/ Wire", groupName: "Computer Scrap / Components" },
    { name: "AC Adapters No Wire", groupName: "Computer Scrap / Components" },
    { name: "HDD Whole w/ Board (No Caddies)", groupName: "Computer Scrap / Components" },
    { name: "HDD Whole No Board", groupName: "Computer Scrap / Components" },
    { name: "HDD Shredded w/ Board", groupName: "Computer Scrap / Components" },
    { name: "HDD Shredded No Board", groupName: "Computer Scrap / Components" },
    { name: "HDD Punched w/ Board", groupName: "Computer Scrap / Components" },
    { name: "Power Supply w/ Wire", groupName: "Computer Scrap / Components" },
    { name: "Power Supply Server", groupName: "Computer Scrap / Components" },
    { name: "Power Supply No Wire", groupName: "Computer Scrap / Components" },
    { name: "Fans", groupName: "Computer Scrap / Components" },
    { name: "CD-Rom/Floppy Drives", groupName: "Computer Scrap / Components" },
    { name: "Docking Stations", groupName: "Computer Scrap / Components" },
    { name: "Ribbon Wire", groupName: "Computer Scrap / Components" },
    { name: "LCD Monitors Damaged", groupName: "Computer Scrap / Components" },
    { name: "Printers/Copiers (Ink & Toner Removed)", groupName: "Computer Scrap / Components" },

    // Non Ferrous
    { name: "Computer Wire (35%)", groupName: "Non Ferrous" },
    { name: "Cat 5", groupName: "Non Ferrous" },
    { name: "Wire Mid (50%)", groupName: "Non Ferrous" },
    { name: "Copper #2", groupName: "Non Ferrous" },
    { name: "Aluminum Sheet", groupName: "Non Ferrous" },
    { name: "Aluminum Cast", groupName: "Non Ferrous" },
    { name: "Heat Sink (aluminum)", groupName: "Non Ferrous" },
    { name: "Heat Sink (Aluminum/Copper)", groupName: "Non Ferrous" },
    { name: "Transformers (All Copper)", groupName: "Non Ferrous" },
    { name: "Electric Motors", groupName: "Non Ferrous" },

    // Batteries
    { name: "Li-Ion Laptop", groupName: "Batteries" },
    { name: "Li-Ion Cell Phone", groupName: "Batteries" },
    { name: "Li-Ion Power Tool", groupName: "Batteries" },
    { name: "Ni-Mh Re-chargable", groupName: "Batteries" },
    { name: "Ni-Cad Mixed", groupName: "Batteries" },
    { name: "Alkaline Battery", groupName: "Batteries" },
    { name: "Lead Acid", groupName: "Batteries" },
    { name: "Lithium Primary", groupName: "Batteries" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { groupName: cat.groupName, active: true },
      create: {
        name: cat.name,
        groupName: cat.groupName,
        active: true,
      },
    });
  }

  console.log(`Categories loaded: ${categories.length}`);
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
