const User = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const loginController = require('../controllers/loginController');
const secretKey="1234567890"

const addNewUser = async (req, res,next) => {
    console.log("add user is called")
    
    const { username,password } = req.body;
    console.log(username,password)
    if (!username || !password || username==="ADMIN") return res.status(400).json({ 'message': 'Username and password are required.' });

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({ username: username }).exec();
    if (duplicate) return res.sendStatus(409); //Conflict 

    try {
        // encrypt the password
        const hashedPwd = await bcrypt.hash(password, 10);

        // create and store the new user
        let result 
        try {
             result = await User.create({
                "username": username,
                "password": hashedPwd,
                
            });
        } catch (error) {
            console.log("error creating user")
            console.log(error)
            
        }

        const accessToken = jwt.sign(
            {
                "username": result.username,
            },
            process.env.ACCESS_TOKEN_SECRET,
            
        );
        

        result.password=undefined;
        
        res.status(201).json({"username":result.username,id:result._id,accessToken});
        
        

        // loginController.handleLogin({'username':result.username,'id':result.id})
        // req.body={'username':result.username,'password':result.password}
        // next();
        
        // res.status(201).json({'username':result.username,'id':result.id});


        
    } catch (err) {
        res.status(500).json({ 'u kidding': err.message });
    }
}

module.exports = { addNewUser };