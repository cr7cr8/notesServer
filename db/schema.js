const mongoose = require("mongoose");
const { connDB, connDB2 } = require("./db")



const userSchema = new mongoose.Schema({

  userName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    index: { unique: true },

    //     validate: [(val) => { return /\d{3}-\d{3}-\d{4}/.test(val) }, "please enter a valid userName"],

  },

  notiToken: {
    type: String,

    default: "",
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



const messageSchema = new mongoose.Schema({

  text: {
    type: String,
    default: "",
    //     validate: [(val) => { return /\d{3}-\d{3}-\d{4}/.test(val) }, "please enter a valid userName"],
  },
  user: Object,
  createdAt: Date,
  _id: String,// { type: String, unique: true }, //{type:mongoose.Types.ObjectId},
  createdTime: Number,
  sender: String,
  toPerson: String,
  image: { type: String, default: null },
  imageWidth: { type: Number, default: null },
  imageHeight: { type: Number, default: null },
  audio:{ type: String, default: null },
  durationMillis:{ type: Number, default: null },
  mongooseID:{ type: String, default: null },
},
  {
    toObject: { virtuals: true },
    collection: "messages",
    //  timestamps: true, 
  }

)





const User = connDB.model("users", userSchema);
const Message = connDB.model("messages", messageSchema);

module.exports = { User, Message }

