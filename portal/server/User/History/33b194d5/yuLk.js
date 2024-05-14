import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import {pool} from './config/db.config.js';
import Pepper from 'chilli-pepper'
// Routes import
import AuthRoute from './routes/account.js';
import DataRoute from './routes/data.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(cookieParser());

app.options('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.WEB_URL);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", ['X-Requested-With', 'content-type', 'credentials']);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.status(200);
    next()
})

app.get('/', (req, res) => {
    var pepper = Pepper({
        host: '192.168.182.1',
        port: 3990
      });
      
      pepper.logon('kulikovps2004@gmail.com', '33467784', function(err, data) {
        
          console.log("DATA", data)
        
      
      });
})



const port = process.env.SERVER_PORT || '4000';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'
app.use('/account', AuthRoute);
app.use('/data', DataRoute);

pool.connect((err, client, release) => {
    if (err) {
        console.log(`Error connecting to PostgreSQL: ${err}`);
        return;
    }
    console.log('Connected to PostgreSQL');
    release();
    app.listen(port, async () => {
        console.log(`Server is running at ${backendUrl}`);
    });
});