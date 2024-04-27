const mongoose = require('mongoose')

const patientSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: String,
    doctor: String,
    checkUp: String,
    date: String,
    time: String,
    problem: String,
    status:String,
    payment:Number
})

const patient = mongoose.model("appoinments",patientSchema);
module.exports = patient;