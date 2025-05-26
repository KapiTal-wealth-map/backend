const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const { normalizeProperty } = require('../utils/BigInt');

exports.getAllProperties = async (page, limit) => {
  const skip = (page - 1) * limit;
  const total = await prisma.property_1.count();
  const properties = await prisma.property_1.findMany({
    skip,
    take: limit,
    include: {
      Owner: true, // Include owner details
    }
  });
  return {
    data: properties.map(normalizeProperty),
    total
  }
};

exports.getPropertyById = async (id) => {
  const property = await prisma.property_1.findUnique({
    where: { id } ,
    include: {
      Owner: true, // Include owner details
    }
  });
  if (!property) {
    throw new AppError('Property not found yo', 404);
  }
  return normalizeProperty(property);
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

  const properties = await prisma.property_1.findMany({
    where,
    include: {
      Owner: true, // Include owner details
    }
  });
  const normalizedProperties = properties.map(normalizeProperty);
  return properties.map(normalizeProperty);
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
  if (!favourites) {
    throw new AppError('Failed to add favourites', 500);
  }
  if (favourites.count === 0) {
    throw new AppError('No favourites added', 400);
  }
  return { message: 'added'}
};

exports.getFavourites = async (userId) => {
  const favourites = await prisma.favoriteListing.findMany({
    where: { userId },
    include: { property: true }
  });
  if (!favourites || favourites.length === 0) {
    throw new AppError('No favourites found for this user', 404);
  }
  return favourites.map(fav => ({
    ...normalizeProperty(fav.property),
    favouriteId: fav.id,
  }));
};

exports.removeFromFavourites = async (userId, propertyIds) => {
  return await prisma.favoriteListing.deleteMany({
    where: {
      userId,
      propertyId: { in: propertyIds }
    }
  });
}


exports.createSavedMapView = async (data, userId) => {
  const {
    name,
    center,
    zoom,
    filters,
    showProperties,
    showHeatmap,
    showClusters,
    scope = 'private', // default to private
  } = data;

  const savedMapView = await prisma.savedMapView.create({
    data: {
      name,
      centerLat: center[0],
      centerLng: center[1],
      zoom,
      filters,
      showProperties,
      showHeatmap,
      showClusters,
      scope,
      userId,
    },
    include: {
      user: true,
    },
  });

  return savedMapView;
};

exports.getSavedMapViewsForUser = async (userId, companyId) => {
  return await prisma.savedMapView.findMany({
    where: {
      OR: [
        { userId }, // user's private views
        {
          scope: 'company',
          user: {
            companyId: companyId,
          },
        },
      ],
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};


exports.deleteSavedMapView = async (id, userId) => {
  const savedMapView = await prisma.savedMapView.findUnique({
    where: { id },
  });

  if (!savedMapView || savedMapView.userId !== userId) {
    throw new Error('Not authorized');
  }

  await prisma.savedMapView.delete({ where: { id } });
};


