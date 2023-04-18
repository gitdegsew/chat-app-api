const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const cookies = req.cookies;

    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ 'message': 'Username and password are required.' });

    let  foundUser = await User.findOne({ username: username }).exec();
    if (!foundUser) return res.sendStatus(401); //Unauthorized 
    // evaluate password 
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        
        // create JWTs
        const accessToken = jwt.sign(
            {
                "username": foundUser.username,
            },
            process.env.ACCESS_TOKEN_SECRET,
            
        );
        

        foundUser.password=undefined;
        
        res.status(201).json({"username":foundUser.username,id:foundUser._id,accessToken});
        
        

    } else {
        res.sendStatus(401);
    }
}

module.exports = { handleLogin };