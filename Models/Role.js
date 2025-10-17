

const mongoose = require('mongoose');

const Role = mongoose.Schema({
   key:{
        type: String,
        required: true,
        unique: true
   },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
});



module.exports = mongoose.model('Role', Role);