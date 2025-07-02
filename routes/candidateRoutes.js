const express = require('express');
const router = express.Router();
const User=require('../models/user');
const Candidate= require('./../models/candidate');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

const chechkAdminRole= async(userID)=>{
    try{
        const user =await User.findById(userID);
       if(user.role=='admin'){
            return true;
       }
    }
    catch(err){
        return false;
    }
}


// POST route to add candidate ->only admin add candidate
router.post('/', jwtAuthMiddleware,async (req, res) =>{
    try{
        if(!(await chechkAdminRole(req.user.id)))
            return res.status(403).json({message:'user does not have admin role'});
        

        const data = req.body // Assuming the request body contains the candidate data

        
        // Validate Aadhar Card Number must have exactly 12 digit
        if (!/^\d{12}$/.test(data.aadharCardNumber)) {
            return res.status(400).json({ error: 'Aadhar Card Number must be exactly 12 digits' });
        }
        
        // Check if a candidate with the same Aadhar Card Number already exists
        const existingCandidate = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingCandidate) {
            return res.status(400).json({ error: 'Candidate with the same Aadhar Card Number already exists' });
        }


        // Create a new User document using the Mongoose model
        const newCandidates = new Candidate(data);

        // Save the new candidate to the database
        const response = await newCandidates.save();
        console.log('data saved');
        
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



//updated document  ///update in candidate only admin
router.put('/:candidateId',jwtAuthMiddleware,async (req, res) => {
    try {
        if(!(await chechkAdminRole(req.user.id)))
            return res.status(403).json({message:'user has not admin role'});
        
        const candidateId = req.params.candidateId;
        const updatedCandidateData = req.body;

        const response= await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(403).json({ error: 'candidate not found' });
        }

        console.log('Candidate data updated:', response);
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//admin can delete candidate
router.delete('/:candidateId', jwtAuthMiddleware,async (req, res) => {
    try {
        if(!(await chechkAdminRole(req.user.id))){
            console.log('User can not admin ,so we can not delete');
            return res.status(403).json({message:'user does not have admin role'});
        }
            
        const candidateId = req.params.candidateId;
       
        const response= await Candidate.findByIdAndDelete(candidateId);
        if (!response) {
            return res.status(403).json({ error: 'candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Let's start voting
router.post('/vote/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    //no admin can vote
    //user can only vote once

    candidateId =req.params.candidateID;
    userId=req.user.id;
    try{
        //Find the candidate document with the specific candidateId
        const candidate=await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: 'user not found'});
        }
        if(user.isVoted){
            return res.status(400).json({message:'You have already voted'});
        }
        if(user.role=='admin'){
            return res.status(403).json({message: 'admin is not allowed'});
        }
        //Update the Candidate document to record the vote 
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted=true;
        await user.save();
        res.status(200).json({message: 'vote recoded successfully'});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});


//vote count
router.get('/vote/count',async (req,res)=>{
    try{
        //Find all candidates and sort them by voteCount in descending order
        const candidate=await Candidate.find().sort({voteCount: 'desc'});

        //Map the candidates to only return their name and voteCount
        const voterRcoded=candidate.map((data)=>{
            return {
                party: data.party,
                count:data.voteCount
            }
        })

        return res.status(200).json(voterRcoded)
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});


// Get List of all candidates with only name and party fields
router.get('/',async(req,res)=>{
    try{
        //Find all candidates in the collection
        const candidates = await Candidate.find({}, 'name party -_id');

        //Return the list as response
        res.status(200).json(candidates);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
});


module.exports = router;