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


// //adminlogin route
// router.post('/adminlogin', validation, async (req, res) => {
//     try {
//         //destructure the req.body
//         const { email, password } = req.body;

//         //check if user exist else throw error
//         const user = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
//         if (user.rows.length === 0) {
//             return res.status(401).send("Invalid Credential");
//         }

//         //check if password and email exist
//         const validEmail = await pool.query('SELECT * FROM users WHERE user_id = 1');
//         if ((validEmail.rows[0].user_email === email) && (validEmail.rows[0].user_password === password)) {
//             //res.json(validEmail.rows[0])
//             try {
//                 const allUsers = await pool.query('SELECT * FROM file')
//                 //res.json(allUsers)
//                 const allFiles = allUsers.rows;
//             return res.render('adminDashboard', { allFiles })
//            }
//            catch (err) {
//                console.error(err.message)
//            }
            
//         }else {
//           return  res.render('Enter valid credentials')
//         }
        
//     }
//     catch (err) {
//         console.error(err.message);
//         res.status(500).send("Sever Error");
//     }


// });

//get all users
router.get('/register', async (req, res) => {
    try {
        const allUsers = await pool.query('SELECT * FROM users')
        res.json(allUsers.rows)
    }
    catch (err) {
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



