const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Role = require('../model/Role.js');


// create role
exports.CreateRole = catchAsync(async (req, res, next) => {
    const { name } = req.body;
    if(name !== "Viewer" && name !== "Analyst" && name !== "Admin"){
        next(new AppError(1001));
    }
    await Role.query().insert({ name:name });
    res.status(201).json({
        status:true,
        code:null,
        data:null,
        message:"Role created successfully."
    })
})

// get ALl roles
exports.GetAllRoles = catchAsync(async (req, res, next) => {
    const roles = await Role.query();
    res.status(200).json({
        status:true,
        code:null,
        data:roles,
        message:"Role list successfully."
    })
})