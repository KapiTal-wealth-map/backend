const prisma = require('../config/db');
const AppError = require('../utils/AppError');

exports.getAllProperties = async (page, limit) => {
  const skip = (page - 1) * limit;
  const properties = await prisma.property.findMany({
    skip,
    take: limit
  });
  return properties;
};

exports.getPropertyById = async (id) => {
  return await prisma.property.findUnique({ where: { id } });
};

exports.filterProperties = async (filters) => {
  const {
    minPrice, maxPrice,
    minBeds, maxBeds,
    minBaths, maxBaths,
    zip
  } = filters;

  const where = {};

  if (zip) where.zip = zip;
  if (minPrice || maxPrice) where.price = { gte: parseFloat(minPrice) || 0, lte: parseFloat(maxPrice) || Number.MAX_VALUE };
  if (minBeds || maxBeds) where.beds = { gte: parseInt(minBeds) || 0, lte: parseInt(maxBeds) || 100 };
  if (minBaths || maxBaths) where.baths = { gte: parseInt(minBaths) || 0, lte: parseInt(maxBaths) || 100 };

  return await prisma.property.findMany({ where });
};

exports.addToFavourites = async (userId, propertyIds) => {
  const existingFavourites = await prisma.favoriteListing.findMany({
    where: {
      userId,
      propertyId: { in: propertyIds }
    }
  });
  if (existingFavourites.length > 0) {
    throw new AppError('Some properties are already in your favourites', 400);
  }
  const favourites = await prisma.favoriteListing.createMany({
    data: propertyIds.map(propertyId => ({
      userId,
      propertyId
    }))
  });
  return favourites;
};

exports.getFavourites = async (userId) => {
  const favourites = await prisma.favoriteListing.findMany({
    where: { userId },
    include: { property: true }
  });
  return favourites;
};

exports.removeFromFavourites = async (userId, propertyIds) => {
  return await prisma.favoriteListing.deleteMany({
    where: {
      userId,
      propertyId: { in: propertyIds }
    }
  });
}

