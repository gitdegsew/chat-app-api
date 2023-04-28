const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    // console.log('req header jwt ',req.headers)
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('verify',authHeader)
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    // console.log('token',token)
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.user = decoded.username;
            
            next();
        }
    );
}

module.exports = verifyJWT