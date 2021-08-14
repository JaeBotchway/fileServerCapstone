//require dependencies
const express = require('express');
const cors = require("cors");
const pool = require('./src/controllers/services/db')
const bcrypt = require('bcrypt')


//initialize app 
const app = express();
const PORT = process.env.PORT || 4001


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// Set 'views' directory for any views 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', (req,res) => {
    res.render('index');
});


app.get('/users/register', (req,res) => {
    res.render('register.ejs');
});

app.get('/users/login', (req,res) => {
    res.render('login.ejs');
});

app.get('/users/dashboard', (req,res) => {
    res.render('dashboard.ejs');
});

app.get('/users/adminlogin', (req,res) => {
    res.render('adminLogin.ejs');
});



const usersRoute = require("./src/controllers/routes/users");
const usersFile = require("./src/controllers/routes/files");

//middleware
app.use("/users", usersRoute);
app.use(usersFile);


//server listening to port
app.listen(PORT, () => {
    console.log (`Server running on ${PORT}`)
})