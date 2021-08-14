const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true,
    maxlength: [40, 'A tour name must have less or equal then 40 characters'],
    minlength: [10, 'A tour name must have less or equal then 10 characters'],
    validate: {
      validator(val) {
        //This only point to current doc on New document creation
        return validator.isAlpha(val, 'en-US', {
          ignore: /\s/g,
        });
      },
      message: 'A tour name must only contain characters',
    },
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator(val) {
        //This only point to current doc on New document creation
        return val < this.price;
      },
      message: 'Discount price {VALUE} should be below regular price',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour must have a description'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a group size'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is either:easy,medium,difficulty',
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'A tour name mus have less or equal then 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  slug: String,
  secretTour: {
    type: Boolean,
    default: false,
  },
}, {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

/**
 *  Purpose: DOCUMENT MIDDLEWARE
 *  Creator: Hoàng Qúy Đạt - dathoang9797@gmail.com
 *  Description: Runs before .save() and .create()
 *  Date created: 14-08-2021
 *  Version:
 **/
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log(doc.id);
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document');
//   next();
// });

/**
 *  Purpose: QUERY MIDDLEWARE
 *  Creator: Hoàng Qúy Đạt - dathoang9797@gmail.com
 *  Description:
 *  Date created: 14-08-2021
 *  Version:
 **/
tourSchema.pre(/^find/, async function (next) {
  this.find({
    secretTour: {
      $ne: true,
    },
  });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, async function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs.length);
  next();
});

/**
 *  Purpose: AGGREGATION MIDDLEWARE
 *  Creator: Hoàng Qúy Đạt - dathoang9797@gmail.com
 *  Description:
 *  Date created: 14-08-2021
 *  Version:
 **/
tourSchema.pre('aggregate', async function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;