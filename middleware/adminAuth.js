import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../error/error.js';
import { Admin } from '../models/admin.model.js';


// export const adminAuth = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'];

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return next(new ErrorHandler("Unauthorized. Token missing.", 401));
//         }
//         const token = authHeader.split(" ")[1];
//         // console.log('test TT', token)
//         if (!token) {
//             return next(new ErrorHandler("Unauthorized access", 401));
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // console.log(decoded)

//         if (!decoded?.admin_id) {
//             return next(new ErrorHandler("Invalid session token", 401));
//         }

//         const admin = await Admin.findById(decoded.admin_id).select("-password");

//         if (!admin) {
//             return next(new ErrorHandler("admin not found", 401));
//         }
//         if (!admin?.sessionToken) {
//             return next(new ErrorHandler("token has been expired", 401))
//         }
//         // console.log(admin)

//         req.admin = admin;
//         next();
//     } catch (error) {
//         // console.error("Token verification error:", error.message);
//         return next(new ErrorHandler("Unauthorized. Invalid or expired token.", 401));
//     }
// };

export const adminAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new ErrorHandler("Unauthorized. Token missing.", 401));
    }
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.admin_id) {
            return next(new ErrorHandler("Invalid session token", 401));
        }

        const admin = await Admin.findById(decoded.admin_id).select("-password");

        if (!admin) {
            return next(new ErrorHandler("admin not found", 401));
        }
        if (!admin?.sessionToken) {
            return next(new ErrorHandler("token has been expired", 401))
        }

        req.admin = admin;
        next();
    } catch (error) {
        // Step 5: Handle token expiration
        if (error.name === "TokenExpiredError") {
            return next(new ErrorHandler("Token has expired", 401));
        }
        return next(new ErrorHandler("Unauthorized. Invalid or expired token.", 401));
    }
};

export default adminAuth;