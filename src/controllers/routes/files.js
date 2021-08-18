//require dependencies
const express = require('express');
const app = express();
const router = express.Router();
const cors = require("cors");
const pool = require('../services/db')
const multer  = require('multer')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        if(file.mimetype === 'image/png') cb(null, Date.now() + '.png') //Appending .png
        if(file.mimetype === 'image/jpeg') cb(null, Date.now() + '.jpg')
    }
  })
const upload = multer({ storage: storage }) 


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

router.post('/upload', upload.single('file'), async (req,res) => {
    try{
    //destructure the req.body (description , title)
    const {description, title} = req.body;
    const uploadedFile = req.file;
    const file = await pool.query('INSERT INTO file (description, title, url) VALUES ($1, $2, $3) RETURNING *',
    [description, title, uploadedFile.path.replace("public\\uploads\\", "/uploads/")])
    // return res.redirect('/users/admin-dashboard')
    res.json({
        filePath: file.rows[0].url
    })
        }
        catch(err){
    console.error(err.message)
        }
})

module.exports = router;