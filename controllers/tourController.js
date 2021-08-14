const TourModel = require('../model/toursModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(TourModel.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const Tours = await features.query;
    res.status(201).json({ status: 'Success', results: Tours.length, Tours });
  } catch (error) {
    res.status(404).json({ status: 'Error', Message: error.message });
  }
};

exports.getTourStatus = async (req, res) => {
  try {
    const stats = await TourModel.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTour: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);
    res.status(200).json({ status: 'Success', data: { stats } });
  } catch (error) {
    res.status(404).json({ status: 'Error', Message: error.message });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = +req.params.year;
    const plan = await TourModel.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { numTourStarts: -1 } },
      { $limit: 12 },
    ]);
    res.status(200).json({ status: 'Success', data: { plan } });
  } catch (error) {
    res.status(404).json({ status: 'Error', Message: error.message });
  }
};

exports.getTour = async (req, res) => {
  try {
    const Tour = await TourModel.findById(req.params.id);
    res.status(200).json({ status: 'success', data: Tour });
  } catch (error) {
    res.status(404).json({ status: 'success', Message: error.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    const Tour = await TourModel.create(req.body);
    res.status(201).json({ status: `success`, data: Tour });
  } catch (error) {
    res.status(500).json({ status: 'Error', Message: error.message });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const Tour = await TourModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ status: `success`, data: { Tour } });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'Error', Message: error.message, Kind: error.kind });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await TourModel.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 'Error', Message: error.message });
  }
};

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
