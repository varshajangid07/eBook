const mongoose=require('mongoose');


const replySchema = new mongoose.Schema({
    user : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    text : { 
        type: String, 
        required: true 
    },
    likes : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt : { 
        type: Date, 
        default: Date.now 
    }
});

const commentSchema=new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    text : {
        type : String,
        required : true
    },
    likes : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited : { 
        type: Boolean, 
        default: false 
    },
    replies : [replySchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const bookSchema=new mongoose.Schema({
    bookId : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    author : {
        type : String,
        default : 'Unknown Author'
    },
    likesCount : {
        type : Number,
        default : 0
    },
    likedBy : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }],
    comments : [commentSchema]
}, {
    timestamps : true
})


module.exports=mongoose.model('Book', bookSchema);