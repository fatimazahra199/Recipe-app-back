const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const recipeSchema = require('./Recipe');
const Order = require('./Order');

const userSchema = new Schema({
  email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please enter a valid e-mail address']
  },
  password: {
      type: String,
      required: true,
      minlength: 4
  },
  username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  savedRecipes: [recipeSchema],
  orders: [Order.schema]
 
},
{
    timestamps: true,
  });

//This middleware ensures that the user's password is always hashed before being saved to the database, providing a layer of security.
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

//The comparison result is returned, indicating whether the provided password matches the stored password or not.
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);

module.exports = User;
