import Joi from "joi";

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    country: Joi.string().required(),
    location: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().allow("", null),
    category: Joi.string().valid(
      "Apartment",
      "House",
      "Villa",
      "Cabin",
      "Condo",
      "Studio",
      "Other"
    ),
    amenities: Joi.array().items(
      Joi.string().valid(
        "WiFi",
        "Kitchen",
        "Washing Machine",
        "Air Conditioning",
        "Heating",
        "TV",
        "Parking",
        "Gym",
        "Pool",
        "Garden",
        "Balcony",
        "Pet Friendly",
        "Breakfast Included"
      )
    ).optional().default([]),
    capacity: Joi.number().min(1),
    bedrooms: Joi.number().min(0),
    bathrooms: Joi.number().min(0),
    availableFrom: Joi.date(),
    availableTo: Joi.date(),
    isAvailable: Joi.boolean(),
  }).required(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required(),
    comment: Joi.string().required(),
  }).required(),
});

const bookingSchema = Joi.object({
  booking: Joi.object({
    checkIn: Joi.date().required(),
    checkOut: Joi.date().required(),
    guests: Joi.number().required().min(1),
    specialRequests: Joi.string().allow("", null),
  }).required(),
});

export { listingSchema, reviewSchema, bookingSchema };
