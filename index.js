require("./db/connection");
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const patient = require("./Model/patientAppoinment");
const Doctor = require("./Model/DoctorSchema");

const PORT = process.env.PORT || 8000

app.use(express.json());
app.use(cors());

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

// formating  today data
const formatDate = () => {
  const todayDate = new Date();
  const day = todayDate.getDate();
  const month = todayDate.getMonth() + 1;
  const year = todayDate.getFullYear();

  return `${day}/${month}/${year}`;
};

// ------------------Appoinments Booking API------------------------------------
app.post("/Appoinments", async (req, res) => {
  const checkUp = req.body.checkUp;
  let doctor = "";
  let payment = null;

  switch (checkUp) {
    case "Head":
      doctor = "Dr. Ashok Pandey";
      payment = 1000;
      break;
    case "Liver":
      doctor = "Dr. Manish Parmar";
      payment = 800;
      break;
    case "Chest":
      doctor = "Dr. Ashish Sharma";
      payment = 500;
      break;
    case "Surgery":
      doctor = "Dr. Avinash Barfa";
      payment = 1500;
      break;
    case "Stomach":
      doctor = "Dr. Vishal Yadav";
      payment = 800;
      break;
    case "Accident":
      doctor = "Dr. Rajnish Tiwari";
      payment = 2000;
      break;
    case "Ortho":
      doctor = "Dr. Riya Rathod";
      payment = 600;
      break;
    case "Dental":
      doctor = "Dr. Rajesh Gupta";
      payment = 500;
      break;
    case "Skin":
      doctor = "Dr. Rashmi Patidar";
      payment = 1200;
      break;
    default:
      doctor = "Dr. Anna Reddy";
      payment = 1000;
  }
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    age: req.body.age,
    checkUp: checkUp,
    doctor: doctor,
    date: req.body.date,
    time: req.body.time,
    problem: req.body.problem,
    status: "Pending",
    payment: payment,
  };
  await patient.insertMany(data);
  const today = formatDate();
  const todayAppointments = await patient.find({ date: today });
  io.emit("todayAppointments", todayAppointments);
  res.send("appointment book");
});

// -------------------Appoinments Status update API------------------------------
app.put("/Appoinments/:id", async (req, res) => {
  const appoinmentId = req.params.id;
  const newStatus = req.body.status;

  try {
    const appoinment = await patient.findById(appoinmentId);
    if (appoinment) {
      appoinment.status = newStatus;
      await appoinment.save();

      // sending appointments to the doctors
      const today = formatDate();
      const todayAppointments = await patient.find({ date: today });
      io.emit("todayAppointments", todayAppointments);
      
      res.json({ message: "Appointment updated successfully" });
    } else {
      res.json({ error: "Appointment not found" });
    }
  } catch (error) {
    res.json(error);
  }
});

// --------------------Fetching Appointments API --------------------------------
app.get("/Appoinments", async (req, res) => {
  try {
    const appoinments = await patient.find();
    res.json(appoinments);
  } catch (error) {
    res.send(error);
  }
});

// -------------------- Fetch appointments of today -------------------------------
app.get("/Appoinments/today", async (req, res) => {
  const today = formatDate();
  try {
    const appointments = await patient.find({ date: today });
    res.json(appointments);
  } catch (error) {
    res.send(error);
  }
});

// -----------------------Doctor SignUp API--------------------------------------
app.post("/Doctors/signup", async (req, res) => {
  const data = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
    age: req.body.age,
    specialist: req.body.specialist,
    availability: "Not Available",
  };
  const existDoctor = await Doctor.findOne({ email: data.email });
  if (existDoctor) {
    res.send("Doctor Already Exist");
  } else {
    const saltRound = 10;
    const encryptPass = await bcrypt.hash(data.password, saltRound);
    data.password = encryptPass;

    await Doctor.insertMany(data);
    res.send("Doctor Created Successfully");
  }
});

// ---------------------------- Doctor Login API --------------------------------
app.post("/Doctors/signin", async (req, res) => {
  try {
    const existDoctor = await Doctor.findOne({ email: req.body.email });
    if (!existDoctor) {
      res.send("User Cannot found");
      return;
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      existDoctor.password
    );
    if (isPasswordMatch) {
      const token = jwt.sign({ userId: existDoctor._id }, "your_secret_key", {
        expiresIn: "1h",
      });
      res.send({ token, existDoctor });
    } else {
      res.send("wrong password");
    }
  } catch {
    res.send("wrong details");
  }
});

// ------------------------Fetching doctors API----------------------------------
app.get("/Doctors/signup", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.send(error);
  }
});

// -------------------Doctor Availability update API-----------------------------
app.put("/Doctors/signup/:id", async (req, res) => {
  const doctorId = req.params.id;
  const availability = req.body.availability;

  try {
    const doctor = await Doctor.findById(doctorId);
    if (doctor) {
      doctor.availability = availability;
      await doctor.save();

      // Fetch all the doctors and emit the 'doctorsUpdated' event
      const allDoctors = await Doctor.find();
      io.emit("doctorsUpdated", allDoctors);

      res.send("Doctor Availability Updated successfully");
    } else {
      res.send("Doctor Availability Updated Not successfully");
    }
  } catch (error) {
    res.json(error);
  }
});

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
