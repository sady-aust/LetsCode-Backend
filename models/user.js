const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt= require('bcryptjs');

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    password:{
        type:String,
        required:true

    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({_id:user._id.toString()},'thisistoken');
  user.tokens = user.tokens.concat({
      token
  });
  console.log(user);

  await user.save();
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

userSchema.statics.findByCridentials = async (email,password)=>{
  const user = await User.findOne({email});
  if(!user){
      throw new Error("Unable to login");
  }
  const isMatch = bcrypt.compare(password,user.password);
  if(!isMatch){
      throw new Error("Unable to login");
  }

  return user;
};

userSchema.pre('save',async function (next) {
   const user = this;
   if(user.isModified('password')){
       user.password = await bcrypt.hash(user.password,8);
   }
   next();
});

const User = mongoose.model("User",userSchema);
module.exports = User;