//require dependencies
const express = require('express');
const cors = require("cors");
const pool = require('./src/controllers/services/db')
const bcrypt = require('bcrypt')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
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

app.use(passport.initialize());
app.use(passport.session());

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

app.get('/users/dashboard', async (req,res) => {

    let allFiles = await pool.query('SELECT * FROM file')
    // for(let file of allFiles.rows){
    //     if(file.url) file.url =  "/" + file.url.replace("\\", "/")
    //     console.log(file.url);
    // }
    allFiles = allFiles.rows;
    res.render('dashboard.ejs', {files: allFiles});
});

app.get('/users/admin-dashboard', async (req,res) =>{
    let allFiles = await pool.query('SELECT * FROM file')
    allFiles = allFiles.rows;
    res.render('adminDashboard.ejs', {files: allFiles});
})
app.get("/search", async (req,res) =>{
    let files = await pool.query(`SELECT * FROM file WHERE title LIKE '%${req.query.term}%';`)
    files=files.rows;
    res.json(files)
})
const usersRoute = require("./src/controllers/routes/users");
const usersFile = require("./src/controllers/routes/files");

//middleware
app.use("/users", usersRoute);
app.use(usersFile);

// adminCreate()
//server listening to port
app.listen(PORT, () => {
    console.log (`Server running on ${PORT}`)
})

// async function adminCreate(){
//     //bcrypt the user password
//     const saltRound = 10;
//     const salt = await bcrypt.genSalt(saltRound);
//     const bcryptPassword = await bcrypt.hash('chan822', salt);

//     //enter the new user inside our database
//     await pool.query('INSERT INTO users (user_name, user_email, user_password, roles) VALUES ($1, $2, $3, $4) RETURNING *',
//         ['jackie', 'jackie344@amalitech.com', bcryptPassword, 'Admin']);
// }