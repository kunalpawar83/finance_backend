require('dotenv').config();
const PORT = process.env.PORT || 8080;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const  {setup_db} = require("./db/index.js");
const globalerrorhandler = require('./controller/errorController.js');
const appError = require('./utils/appError.js');
//const { map, updateMessage } = require('./utils/errorjson.js');

const app = express();

// ================= MIDDLEWARES =================
app.use(helmet());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.all(/.*/, (req, res, next) => {
    next(new appError(1025, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalerrorhandler);

setup_db().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});
