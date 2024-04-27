const mongoose = require('mongoose');
const DataBase = process.env.DATABASE;

const connect = mongoose.connect(DataBase);

connect.then(()=>{
    console.log('Connected to database');
})
.catch(()=>{
    console.log('Database cannot be conected');
})