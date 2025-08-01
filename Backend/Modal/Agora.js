const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
     user :{
         _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        imageUrls:[{
            type: String,
            required: true
        }]
    },
    appId:{
        type:String,
        require:true
    },
    channel:{
        type:String,
        require:true
    },
    token:{
        type:String,
        require:true
    },
    linkId:{
        type:String,
        require:true
    }
})

const Agora =  mongoose.model("agora" , userSchema)
module.exports = Agora;