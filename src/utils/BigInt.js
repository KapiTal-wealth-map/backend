const normalizeProperty = (prop) => {
  return {
    id: prop.id,
    address: prop.Address,
    zipCode: String(prop.Zip_Code),
    price: Number(prop.Price),
    beds: prop.Beds !== null ? Number(prop.Beds) : null,
    baths: prop.Baths !== null ? Number(prop.Baths) : null,
    livingSpace: prop.Living_Space !== null ? Number(prop.Living_Space) : null,
    zipCodePopulation: prop.Zip_Code_Population !== null ? Number(prop.Zip_Code_Population) : null,
    zipCodeDensity: prop.Zip_Code_Density,
    county: prop.County,
    medianHouseholdIncome: prop.Median_Household_Income !== null ? Number(prop.Median_Household_Income) : null,
    latitude: prop.Latitude,
    longitude: prop.Longitude,
    sizeRank: prop.SizeRank !== null ? Number(prop.SizeRank) : null,
    regionName: prop.RegionName,
    zhvi: prop.ZHVI,
    marketValue: prop.Market_Value,
    owner: prop.Owner
      ? {
            id: prop.Owner.id,
          name: prop.Owner.name,
          netWorth: prop.Owner.netWorth !== null ? Number(prop.Owner.netWorth) : null,
          occupation: prop.Owner.occupation,
          purchaseDate: prop.Owner.purchaseDate
            ? new Date(prop.Owner.purchaseDate).toISOString()
            : null,
          age: prop.Owner.age,
          email: prop.Owner.email,
          phone: prop.Owner.phone,
        }
      : null,
  };
}

module.exports = {
  normalizeProperty,
};