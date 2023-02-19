require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

const authUserMiddleware = require("./middleware/authentication")

//connect to DB
const connectDB = require("./db/connect")

//Routers
const authRouter = require("./routes/auth")
const JobsRouter = require("./routes/jobs")

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss =  require('xss-clean');
const rateLimeter = require('rate-limiter');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy',1);
app.use(rateLimeter({
  windowMs:15*60*1000,  //15 minutes
  max:100 //limit each IP to 100 request per window
}));
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());


// routes
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/jobs",authUserMiddleware, JobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
