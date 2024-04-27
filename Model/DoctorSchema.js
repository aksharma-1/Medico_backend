const mongoose = require('mongoose')

const DoctorSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    phone: Number,
    age: String,
    specialist: String,
    availability: String,
})

const Doctor = mongoose.model("Doctors",DoctorSchema);
module.exports = Doctor;