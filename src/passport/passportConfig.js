const LocalStrategy = require("passport-local");
const passport = require('passport');
const pool = require("../controllers/services/db");
const bcrypt = require('bcrypt')


function initialize(passport){
    const authenticatedUser =  async (email, password, done) => {
  
        try {
    
            //check if user exist else throw error
            let results = await pool.query('SELECT * FROM users WHERE user_email = $1', [email]);
    
            if (results.rows.length === 0) {
                return done(null, false, { message: 'Incorrect credentials.' });
            }
    
            //check if password already exist
            const validPassword = await bcrypt.compare(password, results.rows[0].user_password);
            //console.log(validPassword)
            if (!validPassword) {
                done(null, false, { message: 'Incorrect credentials.' });
            }
            
            const user = results.rows[0]
            return done(null, user)
        }
        catch (err) {
            console.error(err.message);
            done("Sever Error");
        }
      }
    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        authenticatedUser)        
        );

    passport.serializeUser((user, done)=> done(null, user.user_id))
    passport.deserializeUser((id,done)=>{
        pool.query('SELECT * FROM users WHERE user_id = $1', [id], (err,results)=>{
            if(err) throw err
            return done(null, results.rows[0]) 
        });
    })
}

module.exports = {initialize: initialize, passport: passport};