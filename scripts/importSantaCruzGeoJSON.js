const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MAX_ROWS = 10;
const FILE_PATH = '../uploads/data/props.csv';

async function importSample() {
  const rows = [];
  let count = 0;
  const usedPostcodes = new Set();
  fs.createReadStream(FILE_PATH)
    .pipe(csv())
    .on('data', (row) => {
      if (row.City.toLowerCase() === 'los angeles') {
        rows.push(row);
      }
    })
    .on('end', async () => {
      for (const row of rows) {
        if (count >= MAX_ROWS) break;
        if (usedPostcodes.has(row['Zip Code'])) continue;
        usedPostcodes.add(row['Zip Code']);
        count++;
        try {
          await prisma.property.create({
            data: {
              address: row.Address,
              city: row.City,
              state: row.State,
              zip: row['Zip Code'],
              lat: parseFloat(row.Latitude),
              lng: parseFloat(row.Longitude),
              price: parseFloat(row.Price),
              beds: parseInt(row.Beds || 0),
              baths: parseFloat(row.Baths || 0),
              sizeSqFt: parseInt(row['Living Space'] || 0),
              medianIncome: parseInt(row['Median Household Income'] || 0),
              population: parseInt(row['Zip Code Population'] || 0),
              density: parseInt(row['Zip Code Density'] || 0),
              county: row.County,
            },
          });
        } catch (err) {
          console.error('Error inserting row:', err.message);
        }
      }
      console.log(`✅ Imported ${rows.length} Los Angeles properties`);
      await prisma.$disconnect();
    });
}

importSample();
