import Listing from "../models/listing.js";
import { listingSchema } from "../schema.js";
import BankAccount from "../models/bankAccount.js";

export const index = async (req, res) => {
  const { search, minPrice, maxPrice, location } = req.query;
  let query = {};

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  // Price filtering
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Location filtering
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  let data = await Listing.find(query);
  res.render("listings/index", { data, search, minPrice, maxPrice, location });
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    // Get unique suggestions from database
    const suggestions = await Listing.aggregate([
      {
        $match: {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          titles: { $addToSet: "$title" },
          locations: { $addToSet: "$location" },
          countries: { $addToSet: "$country" }
        }
      }
    ]);

    if (suggestions.length === 0) {
      return res.json([]);
    }

    const { titles, locations, countries } = suggestions[0];
    
    // Combine and filter suggestions
    const allSuggestions = [
      ...titles.map(title => ({ text: title, type: 'title' })),
      ...locations.map(location => ({ text: location, type: 'location' })),
      ...countries.map(country => ({ text: country, type: 'country' }))
    ].filter(item => 
      item.text.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions

    res.json(allSuggestions);
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.json([]);
  }
};

// Show user's own listings
export const userListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user._id })
      .populate("owner")
      .sort({ createdAt: -1 });
    
    res.render("listings/index", { 
      data: listings, 
      search: null, 
      minPrice: null, 
      maxPrice: null, 
      location: null,
      isUserListings: true 
    });
  } catch (error) {
    console.error("Get user listings error:", error);
    req.flash("error", "Failed to load your listings");
    res.redirect("/listings");
  }
};

export const renderNewForm = (req, res) => {
  res.render("listings/new");
};

export const showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  // Check if property owner has a bank account
  let hasBankAccount = false;
  if (req.user && listing.owner.equals(req.user._id)) {
    const bankAccount = await BankAccount.findOne({
      owner: req.user._id,
      isActive: true,
    });
    hasBankAccount = !!bankAccount;
  }

  res.render("listings/show.ejs", {
    listing,
    reviews: listing.reviews,
    hasBankAccount,
  });
};

export const editListing = async (req, res) => {
  let { id } = req.params;
  let listingData = await Listing.findById(id);
  if (!listingData) throw new ExpressError(404, "Listing not found!");
  res.render("listings/edit", { listingData });
};

export const createListing = async (req, res) => {
  const listingData = req.body.listing;

  // Handle uploaded image
  if (req.file) {
    listingData.image = "/" + req.file.path; // Set the uploaded file path with leading slash
  }

  // Ensure amenities is always an array
  if (!listingData.amenities) {
    listingData.amenities = [];
  } else if (!Array.isArray(listingData.amenities)) {
    // If it's a single value, convert to array
    listingData.amenities = [listingData.amenities];
  }

  const newListing = new Listing(listingData);
  newListing.owner = req.user._id; // ✅ Important: set owner
  await newListing.save();

  req.flash("success", "Listing Created Successfully!");
  res.redirect("/listings");
};

export const updateListing = async (req, res) => {
  let { id } = req.params;
  // Option 2: using req.user
  // if (!req.user || !listing.owner.equals(req.user._id)) ...

  const listingData = req.body.listing;

  // Handle uploaded image - only update if a new file is uploaded
  if (req.file) {
    listingData.image = "/" + req.file.path; // Set the uploaded file path with leading slash
  }

  // Ensure amenities is always an array
  if (!listingData.amenities) {
    listingData.amenities = [];
  } else if (!Array.isArray(listingData.amenities)) {
    // If it's a single value, convert to array
    listingData.amenities = [listingData.amenities];
  }

  await Listing.findByIdAndUpdate(id, listingData);
  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};

export const destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted Successfully!");
  res.redirect("/listings/my");
};

// Helper function to update listing rating
export const updateListingRating = async (listingId) => {
  const listing = await Listing.findById(listingId).populate("reviews");

  if (listing.reviews.length === 0) {
    listing.averageRating = 0;
    listing.totalReviews = 0;
  } else {
    const totalRating = listing.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    listing.averageRating = totalRating / listing.reviews.length;
    listing.totalReviews = listing.reviews.length;
  }

  await listing.save();
};
