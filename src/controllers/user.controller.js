import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { deleteLocalFiles } from "../utils/deleteLocalFiles.js"

const registerUser = asyncHandler( async (req, res) => {
  // get user details from the frontend
  // validation - not empty
  // check if user already exist: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const {fullName, email, username, password} = req.body || {}
  // console.log("email: ", email);


  // if(fullName === ""){
  //   throw new ApiError(400, "fullname is required")
  // }
  
  // Instead of checking for every field, we write this some() function here to check in loop.
  if([fullName, email, password, username].some((field) => {
    field?.trim() === ""})
  ) {
    throw new ApiError(400, "All fields are required")
  }

  // extract local paths
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
  }


  // check if the same email or username is already present or not
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if(existedUser){
    deleteLocalFiles([avatarLocalPath, coverImageLocalPath])
    throw new ApiError(409, "User with email or username already exists")
  }

  
  // upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400, "Avatar file is required")
  }

  // create a entry in DB
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registring the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

} )

export {registerUser}