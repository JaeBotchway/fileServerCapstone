//require dependencies
const express = require('express');
const app = express();
const router = express.Router();
const cors = require("cors");
const pool = require('../services/db')
const bcrypt = require('bcrypt')
//const jwtGenerator = require('../../utils/jwtGenerator')
const validation = require('../../helpers/validation') 
const authorize = require('../../helpers/authorization')




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//routes

//registration
router.post('/register',validation, async (req, res) => {
    try {
        //console.log(req.body)
        //destructure the req.body(name,email, password)
        const { name, email, password } = req.body;

        //check if user exist(if user exist throw error)
        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
        if (user.rows.length !== 0) {
            res.status(401).json('user already exist')
            return;
        }

        //bcrypt the user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        //enter the new user inside our database
        const newUser = await pool.query('INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *',
         [name, email, bcryptPassword]);
        res.render('login');
        
        //generate our jwt token
        //  const jwtToken = jwtGenerator(newUser.rows[0].user_id);
        // return res.json({ jwtToken })

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Sever Error");
        return;
    }
})


//login route
router.post('/login',validation, async (req, res) => {
    try {
        //destructure the req.body
        const { email, password } = req.body;

        //check if user exist else throw error
        const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(401).send("Invalid Credential");
        }

        //check if password already exist
        const validPassword = await bcrypt.compare(password,user.rows[0].user_password);
        //console.log(validPassword)
        if (!validPassword) {
            return res.status(401).send("Invalid Password");
        }
        res.redirect('dashboard')

        // //give a jwt token
        // const jwtToken = jwtGenerator(user.rows[0].user_id);
        // return res.json({ jwtToken });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Sever Error");
    }
});

//get all users
router.get('/register' , async (req,res) =>{
    try{
    const allUsers = await pool.query('SELECT * FROM users')
    res.json(allUsers.rows)
    }
    catch(err){
console.error(err.message)
    }
})

//verify token
// router.get('/verify', authorize, (req, res) => {
//     try {
//       res.json(true);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server error");
//     }
//   });


module.exports = router;



