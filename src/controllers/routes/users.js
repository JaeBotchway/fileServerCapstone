//require dependencies
const express = require('express');
const router = express.Router();
const pool = require('../services/db')
const bcrypt = require('bcrypt')
//const jwtGenerator = require('../../utils/jwtGenerator')
const validation = require('../../helpers/validation')
const {passport} = require('../../passport/passportConfig');




//routes

//registration
router.post('/register', validation, async (req, res) => {
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

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send("Sever Error");
        return;
    }
})

//userlogin route
router.post('/login', validation, passport.authenticate('local'), async (req, res) => {

    const {email} = req.body
    let user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    try {

        if(user.rows[0].roles === 'Admin'){
            return res.redirect('admin-dashboard')
        }
        return res.redirect('dashboard');
    }
    catch (err) {
        console.log("error ")
        console.error(err.message)
    }
});




module.exports = router;



