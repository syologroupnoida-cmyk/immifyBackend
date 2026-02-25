import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ErrorHandler } from "../error/error.js";

export const authMiddleware=async (req,res,next)=>{
    try
    {
        const authHeader=req.headers.authorization;
        
        if(!authHeader || !authHeader.startsWith('Bearer'))
            return next(new ErrorHandler("Unauthorized. Token missing.", 401));

        const token=authHeader.split(" ")[1];

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
console.log('decoded',decoded);
        if (!decoded?.userId) {
           return next(new ErrorHandler("User not found", 401));
        }

       
        const user_id=decoded?.userId;
        const user=await User.findById(user_id).select('-password');

        if (!user) {
            return next(new ErrorHandler("User not found", 401));
            }

         return res.status(200).json({success:true,user});
            // req.user = user;
            // next(); 
        }

      catch(error)
      {
            return next(new ErrorHandler("Unauthorized. Invalid token.", 401));
      }  
}