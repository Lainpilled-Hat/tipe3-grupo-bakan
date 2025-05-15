import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { pool } from "../db.js"; 
import bcrypt from "bcryptjs";

//import User from "../models/usuario.js";

// Estrategia de autenticación local
passport.use(
  new LocalStrategy(
    {
      usernameField: "correo", // Cambia esto si el campo es diferente
      passwordField: "contrasenia",
    },
    async (correo, contrasenia, done) => {
      try {
        // Buscar el usuario por correo electrónico
        const [rows] = await pool.query("SELECT * FROM Persona WHERE correo = ?", [correo]);

        if (rows.length === 0) {
          return done(null, false, { message: "Usuario no encontrado." });
        }

        const user = rows[0];

        // Comparar la contraseña proporcionada con la almacenada
        const isMatch = await bcrypt.compare(contrasenia, user.clave);
        if (!isMatch) {
          return done(null, false, { message: "Contraseña incorrecta." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serializar el usuario
passport.serializeUser ((user, done) => {
  done(null, user.id_persona); // Usar el ID del usuario de MySQL
});

// Deserializar el usuario
passport.deserializeUser (async (id, done) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Persona WHERE id_persona = ?", [id]);
    if (rows.length === 0) {
      return done(new Error("Usuario no encontrado."));
    }
    done(null, rows[0]); // Devuelve el usuario encontrado
  } catch (err) {
    done(err);
  }
});

/*
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        // Match Email's User
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "Usuario no encontrado." });
        }

      // Match Password's User
        const isMatch = await user.matchPassword(password);
        if (!isMatch)
          return done(null, false, { message: "Contraseña incorrecta." });
      
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

//passport.deserializeUser((id, done) => {
//  User.findById(id, (err, user) => {
//    done(err, user);
//  });
//});
passport.deserializeUser (async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
*/