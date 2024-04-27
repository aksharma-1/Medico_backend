const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb+srv://akshaysharma58194:5G9OmIPEiApnsv3M@cluster0.5sqxpst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

connect.then(()=>{
    console.log('Connected to database');
})
.catch(()=>{
    console.log('Database cannot be conected');
})