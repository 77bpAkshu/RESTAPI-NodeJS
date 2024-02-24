const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');


const authRoutes = require('./routes/authentication');
const customerRoutes = require('./routes/customer');
const bookRoutes = require('./routes/book');
const { Socket } = require('socket.io');
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'), 
    { flags: 'a'}
);

const app = express();
// const store = new MongoDBStore({
//     uri: process.env.MONGODB_URI,
//     collection: 'sessions'
// });
//const csrfProtection = csrf();
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString()+ '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);

    }
    else {
        cb(null, false);
    }
};
//app.use(bodyParser.urlencoded());
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('profileUrl')
);
app.use('/images', express.static(path.join(__dirname,'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETe');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


app.use(customerRoutes);
app.use(authRoutes);
app.use(bookRoutes);


app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});
//.connect(mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.zwf9rkb.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority&appName=AtlasApp)
mongoose
    .connect(process.env.MONGODB_URI)
    .then(client => {
        const server = app.listen(process.env.PORT || 8080);
        // const server = https.createServer({key: privateKey, cert: certificate}, app)
        //                     .listen(process.env.PORT || 8080);

        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('Client connected');
        });
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
