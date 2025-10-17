

const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({ message: "Unauthorized" });
    }
}
const verifyPermission = (permission) => {
    try{
        return (req, res, next) => {
            //check any key of the role.permissions = permission
            if (
                req.user.role.permissions.some((p) => p.key === permission)
            ) {
                next();
            } else {
                return res.status(403).json({ message: "Forbidden" });
            }
        };
    }catch(error){
        return res.status(401).json({ message: "Unauthorized" });
    }
}

const setUserData = (req, res, next) => {
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    }catch(error){
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };





module.exports = {
    verifyToken,
    verifyPermission,
    setUserData
}