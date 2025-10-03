const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const User = require('../Modal/User');
const {generateToken} = require('../ultils/tokenUtils')
const cookiConfig =require('../ultils/cookieConfig')
const {auth} = require('../middleware/auth')
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/signUp',upload.array('images'), async (req, res) => {
  console.log(req.body); 
    try {
        const { email, name } = req.body;


        if (!email ||  !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

       


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }
            



        const imageUrls = [];
        if (req.files && req.files.length > 0) {
        for (const file of req.files) {
            const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(base64Image, { folder: 'products' });
            imageUrls.push(result.secure_url);
        }
      }

        const user = await User.create({ email, name , imageUrls});

        const token = generateToken(user._id);
        res.cookie('token',token,cookiConfig)

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                imageUrls:user.imageUrls
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// router.post('/login', async(req,res)=>{
//     try{
//        const {email }= req.body;
//        const user = await User.findOne({email});

//        if(!user){
//          return res.status(400).json({message: 'Invalid credential'});
//        }

//        const token = generateToken(user._id);

//        res.cookie('token',token)
//        .json({
//         token,
//         user:{
//           _id:user._id,
//           name:user.name,
//           email:user.email,
//           imageUrls:user.imageUrls
//         }
//        })
//     }catch(error){
//       res.status(500).json({error: error.message});
//     }
// })


router.get('/auth/:decodedEmail', async(req,res)=>{
    try{
       const { decodedEmail } = req.params; 
       const user = await User.findOne({ email: decodedEmail });

       if(!user){
         return res.status(400).json({message: 'Invalid credential'});
       }

       const token = generateToken(user._id);

        res.cookie("token", token, {
       httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
        maxAge: 5 * 60 * 1000, 
       })
       .json({
        token,
        user:{
          _id:user._id,
          name:user.name,
          email:user.email,
          imageUrls:user.imageUrls
        }
       })
    }catch(error){
      res.status(500).json({error: error.message});
    }
})



router.put('/name/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ name: user.name ,imageUrls:user.imageUrls});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/me',auth,async(req,res)=>{
  try{
    const user = await User.findById(req.user._id);
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    res.json(user);
  }catch(error){
    res.status(500).json({error: error.message});
  }
})

router.post('/logOut',(req,res)=>{
  res.clearCookie('token',{
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }).json({message:'logged out successfully'})
 
})


module.exports = router