const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const algorithm = 'aes-256-cbc';
const secretKey = crypto.createHash('sha256').update(String('your-secret-key')).digest('base64').substr(0, 32);
const iv = crypto.createHash('sha256').update(String('your-fixed-iv')).digest('base64').substr(0, 16);

// Function to encrypt data
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt data
function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(iv));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        req.user = user; // Attach user data (including userId) to the request
        next();
    });
};

// Exporting the functions and middleware
module.exports = {
    encrypt,
    decrypt,
    authenticateToken
};
