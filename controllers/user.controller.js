import { ErrorHandler, TryCatch } from "../error/error.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from 'google-auth-library';



export const GoogleSignUp = TryCatch(async (req, res, next) => {
  const { code } = req.body;
  if (!code) return next(new ErrorHandler("Google code required", 400));

   const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,  
    'http://localhost:5173'  
  );

  try {
    const { tokens } = await client.getToken({ code });
    // console.log('tokens:', tokens);

    client.setCredentials(tokens);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('payload:', payload);

    const { sub: googleId, email, name } = payload;

    const fullName=name.split(' ');
    const firstName=fullName[0];
    const lastName=fullName[1];

    let user = await User.findOne({ email:email });
    
    console.log('user',user);

    if (!user) {
      user = new User({ googleId, email, firstName, lastName});
      await user.save();
    }
    
    if(!user.googleId)
    {
        user.googleId=googleId;
        user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ success: true, user, token: jwtToken });
 }
 catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    return next(new ErrorHandler("Invalid Google code", 400));
  }
});


export const UserSignup = TryCatch(async (req, res, next) => {
    const { firstName, lastName, email, phone,password } = req.body;

    console.log(firstName,lastName,email,phone,password);
    if (!firstName || !lastName || !email || !phone || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Find vet by email
    let userExist = await User.findOne({ email }).select("+password");
    if (userExist) {
        console.log('userexist');
        return next(
            new ErrorHandler("user is already registered! Kindly Login!", 400)
        );
    }

     await User.create({
        firstName,
        lastName,
        email,
        phone,
        password
    })


    // this is lead only not user authentication
    // const token = jwe.sign({ user_id: user._id }, process.env.JWT_SECRET, {
    //     expiresIn: "1d",
    // });
    // user.sessionToken = token; // Set session token
    // await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json({
            success: true,
            message: "Your  query has been submitted successfully, we will contact you soon.",
        });
});

export const UserLogin = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;

    console.log(email,password)

    if (!email || !password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    // Find vet by email
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(
            new ErrorHandler("user is not exist please do inform to owner", 400)
        );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid credentials", 400));
    }

    // Generate token
    const token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
    user.sessionToken = token; // Set session token
    await user.save({ validateBeforeSave: false });

    // console.log('token',token);
    // Set cookie with token
    return res
        .status(200)
        .cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            sameSite: "none",
            secure: true,
        })
        .json({
            success: true,
            message: "Login successful", 
            user,
            token
        });
});


