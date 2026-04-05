const User = require('../model/User');
const Role = require('../model/Role');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const {generateToken} = require("../utils/jwt.js");

// Create a new user
exports.CreateUser = catchAsync(async (req, res,next) => {
    const {name, email, password,roleName} = req.body;
    const roleData = await Role.query().findOne({ name: roleName });
    if (!roleData)  return next(new AppError(1002));

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.query().insert({
        name,
        email,
        password: hashedPassword,
        roleId: roleData.id,
        status: 'A'
    });
    const token = generateToken(newUser.id, roleData.name);
    return res.status(200).json({
        status:true,
        data:token,
        message: 'User created successfully.',
    })
});


// login user
exports.LoginUser = catchAsync(async (req, res,next) => {
    const { email, password } = req.body;
    const user = await User.query().findOne({ email })
    const roleData = await Role.query().findById(user.roleId);

    if (!user)  return next(new AppError(1003));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new AppError(1003));

    if(user.status === "I") return next(new AppError(1004));
    const token = generateToken(user.id, roleData.name);

    return res.status(200).json({
        status:true,
        data:token,
        message: 'User login successfully.',
    })
});

// update user
exports.updateUser = catchAsync(async (req, res,next) => {
    const { password, role, ...userData } = req.body;

    if (password) {
        userData.password = await bcrypt.hash(password, 10);
    }

    if (role) {
        const roleRecord = await Role.query().findOne({ name: role });
        if (!roleRecord) {
            return next(new AppError(1002));
        }
        userData.role_id = roleRecord.id;
    }

    const user = await User.query().patchAndFetchById(req.params.id, userData);

    if (!user)  return next(new AppError(1005));

    res.status(200).json({
        status:true,
        data:null,
        message: 'User updated successfully.',
    })
})
