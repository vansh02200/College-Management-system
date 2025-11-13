const express = require('express')
const cors=require('cors')
const app = express()
const port = 5000
const eventRoutes= require('./Routes/eventRoutes')
const RegistrationRoutes = require('./Routes/RegistrationRoutes')

// Middleware
app.use(cors());
app.use(express.json());


// test Routes
app.get('/', (req, res) => {
  res.send('<h2>College Event Management Backend Running</h2>')
})


app.get('/contact',(req,res) => {
    res.send("<h2>Contact us Page</h2>");
})

app.get('/aboutus', (req,res) => {
  res.send("<h1>This is About Us Page</h1>")
})


// Middleware (needed for parsing)
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true })); // for form submissions

// Routes
const registrationRouter = require("./routes/registration");
app.use("/register", registrationRouter);



// Start Server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


