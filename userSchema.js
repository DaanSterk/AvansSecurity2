var mongoose = require("mongoose");

var userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        }
    });

mongoose.model("User", userSchema);