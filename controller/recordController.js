const Record = require('../model/Record');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// create Record
exports.createRecord = catchAsync(async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return next(new AppError('User not authenticated', 401));
    }

    const record = await Record.query().insert({
        ...req.body,
        userId: req.user.id,
    });

    res.status(201).json({
        status: 'success',
        data: { record },
    });
});

// get all Records
exports.getAllRecords = catchAsync(async (req, res, next) => {
    const { type, category, startDate, endDate, l = 100, f = 0, search } = req.query;

    const query = Record.query();
    query.where("isDelete", false)

    if (type) query.where('type', type);
    if (category) query.where('category', category);
    if (startDate && endDate) query.whereBetween('date', [startDate, endDate]);


    if (search) {
        query.where('category', 'ilike', `%${search}%`);
    }

    query.limit(parseInt(l));
    query.offset(parseInt(f));

    const records = await query.orderBy('date', 'desc');

    res.status(200).json({
        status: true,
        count: records.length,
        data: records,
    });
});

// update Record
exports.updateRecord = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedRecord = await Record.query().patchAndFetchById(id, req.body);
    if (!updatedRecord) {
        return next(new AppError(1010));
    }
    res.status(200).json({
        status: true,
        data: null,
        message: "Record updated successfully.",
    });
});

// delete Record
exports.deleteRecord = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updatedRecord = await Record.query().patchAndFetchById(id, { isDelete: true });
    if (!updatedRecord) {
        return next(new AppError(1010));
    }
    res.status(200).json({
        status: true,
        data: null,
        message: "Record deleted successfully.",
    });
});


// get all delete record
exports.getAllDeleteRecords = catchAsync(async (req, res, next) => {
    const { type, category, startDate, endDate, l = 100, f = 0, search } = req.query;

    const query = Record.query();
    query.where("isDelete", true)

    if (type) query.where('type', type);
    if (category) query.where('category', category);
    if (startDate && endDate) query.whereBetween('date', [startDate, endDate]);


    if (search) {
        query.where('category', 'ilike', `%${search}%`);
    }

    query.limit(parseInt(l));
    query.offset(parseInt(f));

    const records = await query.orderBy('date', 'desc');

    res.status(200).json({
        status: true,
        count: records.length,
        data: records,
    });
}); 
