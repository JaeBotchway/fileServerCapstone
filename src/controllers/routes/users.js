//require dependencies
const express = require('express');
const app = express();
const router = express.Router();
const pool = require('../services/db')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const flash = require('express-flash')

const validation = require('../../helpers/validation')
const { passport } = require('../../passport/passportConfig');

router.use(flash());


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
router.post('/login', validation, passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:true}), async (req, res) => {

    try {
        const { email, password } = req.body
       
        let result = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);

        const user = result.rows.length > 0 ? result.rows[0]:null;

        if (!user) {
            // tell the user the email does not existss
            return res.json("Invalid email");
        }

        let validPassword = await bcrypt.compare(
            password,
            user.user_password
        );
       
        if (!validPassword) {
            // tell the user invalid password
            return res.json("Invalid password");
        }

        const role = user.roles;

        delete user.password;

        req.logIn(user,(err)=>{
            if(err){
                console.log('error req.LogIn()',err);
                return res.json("error during login");
            }
                
            if (role == 'Admin') {
                return res.redirect('admin-dashboard')
            }
            return res.redirect('dashboard');
        });
    }
    catch (err) {
        console.log("error ")
        console.error(err.message)
    }
});

router.get('/logout', (req,res) =>{
    req.logOut();
    req.flash('success_msg' ,'Logged out')
    res.redirect('/users/login')
})



module.exports = router;



