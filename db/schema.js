const mongoose = require("mongoose");
const { connDB } = require("./db")



const userSchema = new mongoose.Schema({

  userName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    index: { unique: true },

    //     validate: [(val) => { return /\d{3}-\d{3}-\d{4}/.test(val) }, "please enter a valid userName"],

  },

  description: {
    type: String,
    required: false,
  },
  hasAvatar: {
    type: Boolean,
    required: true,
    default: false,
  },
  listOrder: {
    type: [String],
    default: []
  }

  // pushNotificationOn: {
  //   type: Boolean,
  //   required: true,
  //   default: true,
  // }

},
  {
    toObject: { virtuals: true },
    collection: "users",
    //  timestamps: true, 
  }

)


const User = connDB.model("users", userSchema);

module.exports = { User }

