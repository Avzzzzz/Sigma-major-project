const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: String,
    imageFilename: {
      type: String,
      default: "listingimage"
    },
    imageUrl: {
      type: String,
      default: "https://images.unsplash.com/photo-1715157163446-91abdd457a97?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D"
    },
    price: Number,
    location: String,
    country: String,
    reviews: [ {
      type: Schema.Types.ObjectId,
      ref: "Review",

    },
      
    ],
  });

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;