require('dotenv').config();
const PORT = process.env.PORT || 8080;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const  {setup_db} = require("./db/index.js");

const app = express();

// ================= MIDDLEWARES =================
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
// Health check route (important for testing)
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running 🚀',
    });
});

app.use((req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});

app.use((err, req, res, next) => {
    console.error('ERROR 💥', err);
    const statusCode = err.statusCode || 500;
    // 🔥 DEV vs PROD behavior
    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            status: err.status || 'error',
            message: err.message,
            stack: err.stack,
        });
    };
    return res.status(statusCode).json({
        status: 'error',
        message: 'Something went wrong!',
    });
});

setup_db().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});
