const jwt = require("jsonwebtoken");

module.exports = {
    getTokenFromHeader: (req, res, next) => {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }

        return null;
    },
    verifyJwtToken: (req, res, next) => {
        var token;
        var expireTime;
        if ("authorization" in req.headers) {
            token = req.headers["authorization"].split(" ")[1];
        }

        if (!token) {
            return res.status(403).send({ status: 403, auth: false, message: "Not Authorized to access this resource!" });
        } else {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err)
                    return res.status(403).send({ status: 500, auth: false });
                else {
                    req._id = decoded._id;
                    req.expireTime = decoded.exp;
                    console.log("::request header :::", req.headers);
                    if ("refreshtoken" in req.headers) {
                        var newToken = jwt.sign({ _id: req._id }, process.env.JWT_SECRET, {
                            expiresIn: process.env.JWT_EXP
                        });
                        req.responseBody = { token: newToken };
                    } else {
                        req.responseBody = {};
                    }
                    next();
                }
            });
        }
    }
}