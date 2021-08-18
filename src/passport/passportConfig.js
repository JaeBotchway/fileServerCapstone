const LocalStrategy = require("passport-local").Strategy;
const passport = require('passport');
const pool = require("../controllers/services/db");
const bcrypt = require('bcrypt')


function initialize(passport){
    const authenticatedUser =  async (email, password, done) => {
  
        try {
    
            //check if user exist else throw error
            let results = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    
            if (results.rows.length === 0) {
                return done(null, false, { message: 'Incorrect email.' });
            }
    
            //check if password already exist
            const validPassword = await bcrypt.compare(password, results.rows[0].user_password);
            //console.log(validPassword)
            if (!validPassword) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            
            const user = results.rows[0]
            return done(null, user)
        }
        catch (err) {
            console.error(err.message);
            done("Sever Error");
        }
      }

    passport.serializeUser((user, done)=> {
       // console.log('user been serialized', user )
        done(null, user.user_id);
    })
    passport.deserializeUser((id,done)=>{
        pool.query('SELECT * FROM users WHERE user_id = $1', [id], (err,results)=>{
            if(err) done(err)

            else {
                const user = results.rows[0];
                delete user.password;
                done(null, user) 
            }
        });
    })

    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        authenticatedUser)        
        );

}

module.exports = {initialize: initialize, passport: passport};