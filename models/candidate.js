const mongoose =require('mongoose');

// Define the candidate schema
const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true //fixed
    },
    age: {
        type: Number,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    Area_Standing_election: {
        type:String,
        require:true
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
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    votes: [    //to recode of voter which person votes with timing
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',   //reference from user
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount: {
        type:Number,
        default:0
    }
});

// Create the user
const Candidate= mongoose.model('Candidates',candidateSchema); 
module.exports =Candidate;  //export