import express from "express";
import session from "express-session";
import methodOverride from "method-override";
import flash from "connect-flash";
import passport from "passport";
import morgan from "morgan";
import MongoStore from "connect-mongo";

import { SESSION_SECRET, MONGODB_URI } from "../config.js";

const middleware = (app) => {
  // Log de las peticiones HTTP
  app.use(morgan("dev"));
  
  // Parseo de datos del cuerpo de la solicitud (body parser)
  app.use(express.urlencoded({ extended: false }));

  // Soporte para métodos HTTP adicionales (PUT, DELETE, etc.)
  app.use(methodOverride("_method"));

  // Configuración de la sesión
  app.use(session({
    secret: SESSION_SECRET,
    resave: false, // Evita que la sesión se guarde si no ha cambiado
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // La sesión dura 24 horas
        secure: false, // Cambiar a `true` si usas HTTPS en producción
    }
  }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
};

export default middleware;