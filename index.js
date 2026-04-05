require('dotenv').config();
const PORT = process.env.PORT || 8080;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { setup_db } = require("./db/index.js");
const globalerrorhandler = require('./controller/errorController.js');
const appError = require('./utils/appError.js');

const RoleRoutes = require('./route/RoleRoute.js');
const UserRoutes = require('./route/UserRoute.js');
const RecordRoutes = require('./route/RecordRoute.js');
const DashboardRoutes = require('./route/DashboardRoute.js');

const app = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/roles', RoleRoutes);
app.use("/users", UserRoutes);
app.use("/records", RecordRoutes);
app.use("/dashboard", DashboardRoutes);

app.all(/.*/, (req, res, next) => {
    next(new appError(1025, `Can't find ${req.originalUrl} on this server!`));
});

app.use(globalerrorhandler);

setup_db().then(() => {
    app.listen(PORT, () => {
    });
});
