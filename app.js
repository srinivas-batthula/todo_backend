const express = require('express');
const passport = require('passport')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const helmet = require('helmet')
const MainRouter = require('./routes/MainRouter')


const app = express();

app.use(express.json())

app.use(cookieParser())

let corsOptions = {
    origin: ['http://localhost:3000', 'https://srinivas-batthula.github.io/todo/'], // Allow frontend domain
    credentials: true,               // Allow credentials (cookies)
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 120, // limit each IP to 80 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    headers: true,
})
app.use(limiter)

app.use(helmet())

app.use(passport.initialize())      //Initialize OAuth2.0


app.get('/', (req, res)=>{
    res.json({'status':'success', 'details':"You are Viewing Home Route, Use '/api/' for all other endpoints to access them"})
})

app.use('/api', MainRouter)

app.use((req, res)=>{
    return res.status(404).json({'status':'Not Found', 'details':`Requested path/method {${req.url} & ${req.method}} Not Found`})
})

app.use((err, req, res, next)=>{
    console.log(err)
    res.status(500).json({'status':'failed', 'details':'An error occurred...'})
    process.exit(1)
})


module.exports = app;