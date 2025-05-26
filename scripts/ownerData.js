const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

async function main() {
  const allProperties = await prisma.property_1.findMany({ select: { id: true } });
  let propertyPool = faker.helpers.shuffle(allProperties.map(p => p.id));

  let totalAssigned = 0;

  while (propertyPool.length > 0) {
    const numProps = faker.number.int({ min: 1, max: Math.min(8, propertyPool.length) });

    const owner = await prisma.owner.create({
      data: {
        name: faker.person.fullName(),
        netWorth: faker.number.int({ min: 100_000, max: 10_000_000 }),
        occupation: faker.person.jobTitle(),
        age: faker.number.int({ min: 25, max: 80 }),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        purchaseDate: faker.date.between({ from: '2015-01-01', to: '2024-01-01' }),
      },
    });

    const propsForOwner = propertyPool.splice(0, numProps);

    await Promise.all(
      propsForOwner.map(id =>
        prisma.property_1.update({
          where: { id },
          data: { ownerId: owner.id },
        })
      )
    );

    totalAssigned += propsForOwner.length;
    console.log(`Owner ${owner.name} assigned ${propsForOwner.length} properties`);
  }

  console.log(`✅ All ${totalAssigned} properties assigned to owners.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// const fs = require('fs');
// const csv = require('csv-parser');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const path = require('path');
// const csvPath = path.resolve(__dirname, '../uploads/data/property_1.csv');

// async function importPropertiesFromCSV() {
//   const properties = [];

//   fs.createReadStream(csvPath)
//     .pipe(csv())
//     .on('data', (row) => {
//       properties.push({
//         Zip_Code: BigInt(row['Zip Code']),
//         Price: BigInt(row['Price']),
//         Beds: row['Beds'] ? BigInt(row['Beds']) : null,
//         Baths: row['Baths'] ? BigInt(row['Baths']) : null,
//         Living_Space: row['Living Space'] ? BigInt(row['Living Space']) : null,
//         Address: row['Address'],
//         Zip_Code_Population: row['Zip Code Population'] ? BigInt(row['Zip Code Population']) : null,
//         Zip_Code_Density: row['Zip Code Density'] ? parseFloat(row['Zip Code Density']) : null,
//         County: row['County'] || null,
//         Median_Household_Income: row['Median Household Income'] ? BigInt(row['Median Household Income']) : null,
//         Latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
//         Longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
//         SizeRank: row['SizeRank'] ? BigInt(row['SizeRank']) : null,
//         RegionName: row['RegionName'] || null,
//         ZHVI: row['ZHVI'] ? JSON.parse(row['ZHVI']) : null,
//         Market_Value: row['Market_Value'] ? JSON.parse(row['Market_Value']) : null,
//       });
//     })
//     .on('end', async () => {
//       console.log(`Read ${properties.length} properties from CSV`);

//       // Insert properties in batches for better performance
//       const batchSize = 1000;
//       for (let i = 0; i < properties.length; i += batchSize) {
//         const batch = properties.slice(i, i + batchSize);
//         await prisma.property_1.createMany({
//           data: batch,
//           skipDuplicates: true,  // skips if Address unique constraint violated
//         });
//       }

//       console.log('Finished inserting properties');
//       await prisma.$disconnect();
//     });
// }

// importPropertiesFromCSV();
