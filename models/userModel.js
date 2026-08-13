const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    googleId : {
        type : String,
        required : false,
    },
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : false,
    },
    profilePhoto : {
        type : String,
        default : ''
    },
    likedBooks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Book'
    }],
    bookmarks : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Book'
    }],
    recentReads : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Book'
    }],
    notifications: [{
        type: { 
            type: String, 
            enum: ['like', 'reply', 'system'] 
        },
        message: {
            type: String
        },
        link: {
            type: String 
        },
        isRead: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timeseries : true
});


module.exports=mongoose.model('User', userSchema);