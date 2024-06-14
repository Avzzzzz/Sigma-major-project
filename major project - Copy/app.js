const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingschema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/amrita";



main()
.then(() => {
    console.log("connected to DB");

}).catch(err => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {

    res.send("Hi I am root");

});

const validateListing = (req, res, next) => {
  let { error } = listingschema.validate(req.body);
   if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
    } else{
    next();
    }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
   if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
    } else{
    next();
    }
};


//Index Route
app.get("/listings",  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
   
    }));

    //New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
  });

    //show route
    app.get("/listings/:id", wrapAsync(async (req, res) => {
        let { id } = req.params;
        
        const listing = await Listing.findById(id).populate("reviews");
        console.log(listing)
        res.render("listings/show.ejs", { listing });
      }));

      //Create Route
    app.post("/listings", validateListing,
     wrapAsync(async (req, res, next) => {
    
      const newListing = new Listing(req.body.listing);
      await newListing.save();
      res.redirect("/listings");
    }));


  
  
    //Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  }));
      
  //Update Route
app.put("/listings/:id", validateListing,
wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));

  //Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

//REVIEWS
//post reviews
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res) => {
  let { id } = req.params;
      let listing = await Listing.findById(id);
      console.log(listing);
      let { review } = req.body;
      console.log(review); //woking
      let reviewObj = new Review(review);
      await reviewObj.save();
      listing.reviews.push(reviewObj);
      await listing.save();
      res.redirect(`/listings/${listing._id}`);
  })
  
  );
  
  //Delete Review route
  //Delete Review route
  app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    console.log('delete');
    let { id, reviewId} = req.params;
    console.log(id)
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    console.log("Review Deleted!");

    res.redirect(`/listings/${id}`);
  


  }));


// app.get("/testListing", async (req, res) => {

//     let sampleListing = new Listing ({

//         title:"My New Villa",
//         description:"By the Beach",
//         price: 1200,
//         location: "Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Succesful Testing");
    
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


app.use((err, req, res, next) => {
  let { statusCode=500, message = "Something went wrong!"} = err;
  res.status(statusCode).render("error.ejs",{message});
}
);

app.listen(4000, () => {
    console.log("server is listening to port 4000");

});