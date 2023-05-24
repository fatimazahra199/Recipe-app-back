const { gql } = require('apollo-server-express');

const typeDefs = gql`

    type Category {
        _id: ID
        name: String
    }
    
    type User {
        _id: ID!
        username: String!
        email: String!
        savedRecipes: [Recipe]
    }

    type Product {
        _id: ID
        name: String
        description: String
        image: String
        quantity: Int
        price: Float
        category: Category
    }

    type Order {
        _id: ID
        purchaseDate: String
        products: [Product]
    }

    type Checkout {
        session: ID
    }


    type Auth {
        token: ID!
        user: User
    }

    type Recipe {
        _id: ID!
        idMeal: String!
        strMeal: String
        strCategory: String
        strArea: String
        strInstructions: String
        strMealThumb: String
        strTags: [String]
        strYoutube: String
        strIngredients: [String]        
        strMeasures: [String]
    }

    input RecipeInput {
      idMeal: String!
      strMeal: String
      strCategory: String
      strArea: String
      strInstructions: String
      strMealThumb: String
      strTags: [String]
      strYoutube: String
      strIngredients: [String]        
      strMeasures: [String]
    }

    type Query {
        me: User
        users: [User]
        product(_id: ID!): Product
        order(_id: ID!): Order
        checkout(products: [ID]!): Checkout

    }

    type Mutation {
        addUser(username: String!, email: String!, password: String!): Auth
        login(email: String!, password: String!): Auth
        updateProduct(_id: ID!, quantity: Int!): Product
        addProduct(name: String!, description: String!, image: String!, quantity: Int!, price: Float!, category: String!): Product
        saveRecipe(mealData: RecipeInput!) : User
        removeRecipe(idMeal: String!): User
        addOrder(products: [ID]!): Order
    }
`;

module.exports = typeDefs;