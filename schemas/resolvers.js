const { AuthenticationError } = require('apollo-server-express');
const { User, Recipe } = require('../models');
const { signToken } = require('../utils/auth');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('savedRecipes');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    users: async () => {
      return User.find().populate('savedRecipes');
    },
    product: async (parent, { _id }) => {
      return await Product.findById(_id).populate('category');
    },
    order: async (parent, { _id }, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id).populate({
          path: 'orders.products',
          populate: 'category'
        });

        return user.orders.id(_id);
      }

      throw new AuthenticationError('Not logged in');
    },
    checkout: async (parent, { products }, context) => {
      const url = new URL(context.headers.referer).origin;
      // const order = new Order({ products: args.products });
      const line_items = [];

      console.log("process.env.STRIPE_KEY:", process.env.STRIPE_KEY);

      console.log("url: ", url);
      console.log('args.products: ', products);

      try {
        for (let i = 0; i < products.length; i++) {
          const product = await stripe.products.create({
            name: products[i],
            description: products[i],            
          });


          const price = await stripe.prices.create({
            product: product.id,            
            unit_amount: 0.99 * 100,
            currency: 'usd',
          });

          line_items.push({
            price: price.id,
            quantity: 1
          });
        }

        console.log("line_items: ", line_items);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${url}/`
        });

        return { session: session.id };
      } catch (err) {
        console.log("err: ", err);

      }

    }
  },
  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveRecipe: async (parent, { mealData }, context) => {
      console.log("mealData:", mealData);
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedRecipes: { ...mealData } } },
          { new: true, }
        );
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeRecipe: async (parent, { idMeal }, context) => {
      if (context.user) {
        return await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedRecipes: { idMeal } } },
          { new: true, }
        );
      }
    }
  }
}

module.exports = resolvers;
