const e = require('connect-flash');
const { link } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
    title: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true,
        enum: ['government', 'private', 'other']
    },

    Amount: {
        type: Number,
        required: true
    },

    About: {
        type: String,
        required: true
    },

    Eligibility: {
        type: String,
        required: true
    },

    Deadline: {
        type: Date,
        required: true
    },

    Benefits: {
        type: String,
        required: true
    },

    Region: {
        type: String,
        required: true
    },

    Documents: {
        type: String,
        required: true
    },

    ApplyLink: {
        type: String,
        required: true
    },

    Gender : {
        type : String,
        required : false,
        enum : [ 'female', 'both']
    },

    Religion : {
        type : String,
        required : false,
        enum : ['muslim', 'hindu', 'christian', 'sikh', 'other', 'all']
    },

    CourseCategory : {
        type : String,
        required : false,
        enum : ['engineering', 'medical', 'management', 'arts', 'science','commerce']
    },

    State : {
        type : String,
        required : false,
        enum : ['andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jammu and kashmir', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal', 'all','punjab']
    },

    Education : {
        type : String,
        required : false,
        enum : ['all','class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'class 6', 'class 7', 'class 8', 'class 9', 'class 10', 'class 11', 'class 12', 'diploma', 'graduation', 'post graduation']
    }

}, { timestamps: true });


module.exports = mongoose.model('Scholarship', scholarshipSchema);
