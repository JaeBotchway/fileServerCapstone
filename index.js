//require dependencies
require("dotenv").config();
const express = require('express');
const cors = require("cors");
const pool = require('./src/controllers/services/db')
const bcrypt = require('bcrypt')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const sessions = require('express-session');
const flash = require('express-flash')

//initialize app 
const app = express();
const PORT = process.env.PORT || 4001
const {passport} = require("./src/passport/passportConfig")
const {initialize} = require('./src/passport/passportConfig');
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

initialize(passport);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash())

// register the session
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: process.env.jwtSecretKey,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Set 'views' directory for any views 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

//routes to
app.get('/', (req,res) => {
    res.render('index');
});


app.get('/users/register',checkNotAuthentication, (req,res) => {
    res.render('register.ejs');
});

app.get('/users/login', checkNotAuthentication, (req,res) => {
    res.render('login.ejs');
});

app.get('/users/dashboard',checkAuthentication, async (req,res) => {

    let allFiles = await pool.query('SELECT * FROM file')
    allFiles = allFiles.rows;
    res.render('dashboard.ejs', {files: allFiles});
});

app.get('/users/admin-dashboard',checkAuthentication, async (req,res) =>{
    let allFiles = await pool.query('SELECT * FROM file')
    allFiles = allFiles.rows;
    res.render('adminDashboard.ejs', {files: allFiles});
})
app.get("/search", async (req,res) =>{
    let files = await pool.query(`SELECT * FROM file WHERE title LIKE '%${req.query.term}%';`)
    files=files.rows;
    res.json(files)
})
app.get("/download", async(req,res) =>{
    let files = await pool.query(`SELECT * FROM file WHERE file_id = $1`, [req.query.fileId]);
    let file = files.rows[0];
    file = `${__dirname}/public/${file.url}`;
    console.log(file);
    res.download(file); // Set disposition and send it.
})
const usersRoute = require("./src/controllers/routes/users");
const usersFile = require("./src/controllers/routes/files");

//middleware
app.use("/users", usersRoute);
app.use(usersFile);


//server listening to port
app.listen(PORT, () => {
    console.log (`Server running on ${PORT}`)
})

//checking authenticating
function checkAuthentication(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('login')
}

//checking authenticating
function checkNotAuthentication(req,res,next){
    if( req.isAuthenticated()){
        return dashboardRedirect(req,res)
    }

    next();
}

//function checking redirection to dashboard based on user role
function dashboardRedirect(req,res){
    const role = req.user.roles;
    if(role === 'Admin'){
        return res.redirect('admin-dashboard')
    }
    return res.redirect('dashboard');
}

