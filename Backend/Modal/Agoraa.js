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
    },
     meetingType: {
        type: String,
        required: true 
    },
    meetingDate: {
        type: Date,
        required: true
    },
      meetingTime: {
        type: String, 
        required: true
    }, meetingDescription:{
       type: String,
        required: true
  },
    meetingRepeat: {
      type: String, 
      required: true
      
    },
      recurrence: {
    repeatType: { type: String }, 
    interval: { type: Number, default: 1 },
    batchSize: { type: Number, default: 5 }
  }
})

const Agoraa =  mongoose.model("agoraa" , userSchema)
module.exports = Agoraa;