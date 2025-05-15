import express from "express"
//import cors from 'cors';

import {dirname, join} from "path"
import {fileURLToPath} from "url"
import {PORT} from "./config.js"

import isAuthenticated from './middleware/user.middleware.js'
import errorRuta from './middleware/errorRuta.middleware.js'
import middleware from './middleware/seguridad.middleware.js'
import manejarErrorMulter from './middleware/manejarErrorMulter.middleware.js'
import connectdb from './database.js'

import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import ownerRoutes from './routes/owner.routes.js'


import "./config/passport.js"
import fs from "fs";

// Initializations
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// settings
app.set("port", PORT);
app.set("views", join(__dirname, "views"));

// middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(cors());

// crea la carpeta /images si no existe (usada por multer)
const imageDir = join(__dirname, "images");
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// middlewares: seguridad y conexión
middleware(app);
connectdb(app);

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// rutas públicas
app.use(userRoutes);

// rutas protegidas

app.use(adminRoutes);
app.use(ownerRoutes);

// static files
app.use(express.static(join(__dirname, "public")));
app.use("/images", express.static(join(__dirname, "images"))); // para servir imágenes


//Que quitar 
//express-fileupload
//express-myconncetion

// middleware de error 404
app.use(manejarErrorMulter);
app.use(errorRuta);

export default app;