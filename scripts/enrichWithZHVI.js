// scripts/enrichWithZHVI.js
const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ZHVI_CSV_PATH = '../uploads/data/zhvi.csv';
const LATEST_DATE_COL = '2025-04-30'; // Update to match your actual column

async function enrichSelectedZipsOnly() {
  const properties = await prisma.property.findMany({
    select: { id: true, zip: true }
  });
  const zipToPropertyId = Object.fromEntries(properties.map(p => [p.zip, p.id]));
  const targetZips = new Set(properties.map(p => p.zip));

  const zipValueMap = {};

  await new Promise((resolve) => {
    fs.createReadStream(ZHVI_CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const zip = row['RegionName']?.trim();

        if (zip && targetZips.has(zip)) {
          const value = parseFloat(row[LATEST_DATE_COL]);
          console.log(value);
          if (!isNaN(value)) {
            zipValueMap[zip] = value;
          }
        }
      })
      .on('end', resolve);
  });

  let updated = 0;
  for (const [zip, propertyId] of Object.entries(zipToPropertyId)) {
    const estimatedValue = zipValueMap[zip];
    if (estimatedValue) {
      await prisma.property.update({
        where: { id: propertyId },
        data: { estimatedValue }
      });
      updated++;
    } else {
      console.warn(`⚠️ No ZHVI data for ZIP: ${zip}`);
    }
  }

  console.log(`✅ Updated ${updated} properties with ZHVI`);
  await prisma.$disconnect();
}

enrichSelectedZipsOnly();
