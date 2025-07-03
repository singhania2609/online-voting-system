const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true //fixed
    },
    age: {
        type: Number,
        required: true
    },
    email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    mobile: {
    type: String,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter','admin'], //only access voter or admin
        default: 'voter'   //by default only voter login
    },
    photo: {   
        type:String,  //store based64 encoded data
    },
    isVoted: {
        type:Boolean,
        default:false
    }
});



userSchema.pre('save', async function(next){
    const user = this;

    // Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')) return next();

    try{
        // hash password generation
        const salt = await bcrypt.genSalt(10);

        // hash password
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Override the plain password with the hashed one
        user.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        // Use bcrypt to compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }catch(err){
        throw err;
    }
}



// Create the user
const User= mongoose.model('User', userSchema); 
module.exports =User;  //export