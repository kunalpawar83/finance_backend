const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/User');
const Role = require('../model/Role');

exports.protect = catchAsync(async (req, res, next) => {

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError(1006));

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.query().findById(decoded.id);

    if (!currentUser) {
        return next(new AppError(1007));
    }

    const roleData = await Role.query().findById(currentUser.roleId);

    if (currentUser.status === 'I') {
        return next(new AppError(1008));
    }

    req.user = {
        id: currentUser.id,
        email: currentUser.email,
        role: roleData.name
    };
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['Admin', 'Analyst', 'Viewer']
        if (!roles.includes(req.user.role)) {
            return next(new AppError(1009));
        }
        next();
    };
};