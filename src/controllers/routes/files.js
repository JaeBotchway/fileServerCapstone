//require dependencies
const express = require('express');
const app = express();
const router = express.Router();
const cors = require("cors");
const pool = require('../services/db')




app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


router.get('/dashboard' , async (req,res) =>{
    try{
    const allUsers = await pool.query('SELECT * FROM file')
    res.json(allUsers.rows)
    }
    catch(err){
console.error(err.message)
    }
})

router.get('/dashboard/:title' , async (req,res) =>{
    const {title} = req.params
    try{
    const titles = await pool.query("SELECT * FROM file WHERE title = $1", [title]);
    res.json(titles.rows[0]);
    }
    catch(err){
        console.error(err.message)
    }
})

router.post('/dashboard', async (req,res) => {
    try{
    //destructure the req.body (description , title)
const {description, title} = req.body;

const file = await pool.query('INSERT INTO file (description, title) VALUES ($1, $2) RETURNING *',
[description, title])
res.json(file.rows[0])
    }
    catch(err){
console.error(err.message)
    }
})

module.exports = router;