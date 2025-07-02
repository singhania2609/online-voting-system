const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');

// POST route to add a person
router.post('/signup', async (req, res) =>{
    try{
        const data = req.body // Assuming the request body contains the User data

         // Check if there is already an admin user
        if (data.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(400).json({ error: 'Admin already exists' });
            }
        }
        if (!data.name) return res.status(400).json({ message: 'Name is required' });
        if (!data.age || data.age < 18) return res.status(400).json({ message: 'Age must be at least 18' });
        if (!data.address) return res.status(400).json({ message: 'Address is required' });
        if (!data.password || data.password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        if (!data.aadharCardNumber || !/^\d{12}$/.test(data.aadharCardNumber)) {
                    return res.status(400).json({ message: 'Aadhar Card Number must be exactly 12 digits' });
        }
        if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        if (data.mobile && !/^\d{10}$/.test(data.mobile)) {
            return res.status(400).json({ message: 'Mobile number must be exactly 10 digits' });
        }


        // Check if a candidate with the same Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({message: 'User with the same Aadhar Card Number already exists' });
        }

        // Create a new User document using the Mongoose model
        const newUser = new User(data);

        // Save the new user to the database
        const response = await newUser.save();
        console.log('data saved');

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
    
        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


// Login Route
router.post('/login', async(req, res) => {
    try{
        const {aadharCardNumber, password, role} = req.body;

        if (!aadharCardNumber || !password || !role) {
            return res.status(400).json({ error: 'Aadhar Card Number, password, and role are required' });
        }

        // Find the user by aadharCardNumber and role
        const user = await User.findOne({aadharCardNumber: aadharCardNumber, role: role});

        if (!user) {
            return res.status(401).json({error: 'Invalid Aadhar Card Number or Role'});
        }
        if (!(await user.comparePassword(password))) {
            return res.status(401).json({error: 'Wrong password'});
        }

        const payload = { id: user.id };
        const token = generateToken(payload);
        res.json({token});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Profile route
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);
        res.status(200).json({user});
    }catch(err){
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


//User can change password 
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

        // Check if currentPassword and newPassword are present in the request body
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required' });
        }

        // Find the user by userID
        const user = await User.findById(userId);

        // If user does not exist or password does not match, return error
        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({ message: 'Password updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;