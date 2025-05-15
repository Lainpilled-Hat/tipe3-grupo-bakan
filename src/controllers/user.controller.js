import { pool } from "../db.js";
import bcrypt from "bcryptjs";
import path from "path"
import fs from 'fs';

// Lo que puede hacer el usuario es, registrarse, logearse, borrar cuenta, hacer reserva y cancelarla.
export const registrarse = async (req, res) => {
  try {
    const { nombre, correo, contrasenia} = req.body;

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({ success: false, message: "El nombre debe tener al menos 3 caracteres" });
    }

    // Validación de la contraseña
    if (!contrasenia || contrasenia.length < 8) {
      return res.status(400).json({success: false, message: "La contraseña debe tener al menos 8 caracteres" });
    }

    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<> ]/;
    if (!specialCharacterRegex.test(contrasenia)) {
      return res.status(400).json({success: false, message: "La contraseña debe contener al menos un carácter especial" });
    }

    const numberRegex = /\d/; 
    if (!numberRegex.test(contrasenia)) {
      return res.status(400).json({success: false, message: "La contraseña debe contener al menos un número" });
    }

    // Validación de campos requeridos
    if (!correo || !contrasenia) {
      return res.status(400).json({success: false, message: "Faltan campos por completar" });
    }

    //validar si es un correo
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({success: false, message: "El correo electrónico debe tener la extensión @gmail.com" });
    }

    // Verificar si el correo ya está en uso
    const [emailFound] = await pool.query("SELECT * FROM persona WHERE correo = ?", [correo]);
    if (emailFound.length > 0) {
      return res.status(400).json({ success: false, message: "El correo ya está en uso." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasenia, 10);

    // Guardar el nuevo usuario
    const [rows] = await pool.query(
      "INSERT INTO persona (nombre, correo, clave) VALUES (?, ?, ?)",
      [nombre, correo, hashedPassword]
    );

    const [userRows] = await pool.query("SELECT * FROM persona WHERE id_persona = ?", [rows.insertId]);
    const user = userRows[0];

    req.login(user, (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Error en el servidor." });
        }
  
        return res.status(200).json({ success: true, message: "Registro y sesión creados exitosamente" });
      });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "El correo ya está registrado." });
    }
    console.error(error);
    return res.status(500).json({ success: false, message: "Algo salió mal" });
  }
};


export const logearse = async (req, res) => {    
  
    if (req.isAuthenticated()) {
        return res.status(400).json({ success: false, message: "Ya estás logueado." });
    }

    const { correo, contrasenia } = req.body;

    try {
      // Verificar si el usuario existe
      const [rows] = await pool.query("SELECT * FROM persona WHERE correo = ?", [correo]);
  
      if (rows.length === 0) {
        return res.status(400).json({ success: false, message: "Credenciales inválidas." });
      }
  
      const user = rows[0];
  
      // Comparar la contraseña proporcionada con la almacenada
      const isMatch = await bcrypt.compare(contrasenia, user.clave);
  
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Credenciales inválidas." });
      }
  
    req.login(user, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Error en el servidor." });
        }

        return res.status(200).json({ success: true, message: "Inicio de sesión exitoso" });
    });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: "Error en el servidor." });
    }
};
  
export const deslogearse = async (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado con Passport
      if (!req.isAuthenticated()) {
        return res.status(400).json({ success: false, message: "No active session found." });
      }
  
      // Realizar logout de Passport
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ success: false, message: "fallo el deslogeo, por favor intentelo de nuevo." });
        }
  
        // Destruir la sesión
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ success: false, message: "Fallo la limpieza de la sesion." });
          }
  
          // Responder con éxito
          res.status(200).json({ success: true, message: "Usted se a deslogeado con exito." });
        });
      });
    } catch (error) {
      console.error('Logout unexpected error:', error);
      return res.status(500).json({ success: false, message: "An unexpected error occurred. Please try again." });
    }
};


// Cambiar la contraseña del usuario
export const cambiarContra = async (req, res) => {
  try {
    const { correo, nueva_contrasenia } = req.body;

    // Validar que se proporcionen los parámetros obligatorios
    if (!correo || !nueva_contrasenia) {
      return res.status(400).json({ message: "Se requieren el correo y la nueva contraseña" });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashContrasenia = await bcrypt.hash(nueva_contrasenia, salt);

    // Actualizar la contraseña del usuario
    const [usuarioActualizado] = await pool.query(
      "UPDATE persona SET clave = ? WHERE correo = ?", 
      [hashContrasenia, correo]
    );

    if (usuarioActualizado.affectedRows === 0) {
      return res.status(404).json({ message: "No se encontró el usuario" });
    }

    res.status(200).json({ message: "Contraseña actualizada con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar la contraseña", error });
  }
};

// Borrar la cuenta del cliente
export const borrarCuenta = async (req, res) => {
  try {
    // Verificar que el usuario está autenticado
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    // Obtener el id del usuario desde la sesión
    const userId = req.user.id_persona;

    // Eliminar al usuario de la base de datos
    const [result] = await pool.query("DELETE FROM persona WHERE id_persona = ?", [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Cerrar la sesión del usuario
    req.logout((err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error al cerrar la sesión" });
      }

      return res.status(200).json({ success: true, message: "Cuenta eliminada exitosamente" });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Error al eliminar la cuenta" });
  }
};

// El cliente puede reservar una mesa de las disponibles
export const reservarMesa = async (req, res) => {
    try {
      const { fecha, hora, id_mesa } = req.body;
      const id_persona = req.user.id_persona;
  
      // Obtener los datos del cliente
      const [personaResult] = await pool.query(
        "SELECT correo FROM persona WHERE id_persona = ?",
        [id_persona]
      );
  
      if (personaResult.length === 0) {
        return res.status(404).json({ success: false, message: "Cliente no encontrado." });
      }
  
      const { nombre: nombre_cliente, correo: correo_cliente } = personaResult[0];
  
      // Validar si ya tiene una reserva activa para ese día
      const [reservaExistente] = await pool.query(
        `SELECT * FROM reserva 
         WHERE correo_cliente = ? AND fecha = ? AND estado = 'ocupado'`,
        [correo_cliente, fecha]
      );
  
      if (reservaExistente.length > 0) {
        return res.status(400).json({ success: false, message: "Ya tienes una reserva activa para ese día." });
      }
  
      // Si se especifica una mesa
      if (id_mesa) {
        // Comprobar que la mesa existe y esté libre
        const [mesaResult] = await pool.query(
          "SELECT * FROM reserva WHERE id_mesa = ? AND estado = 'libre'",
          [id_mesa]
        );
  
        if (mesaResult.length === 0) {
          return res.status(400).json({ success: false, message: "La mesa no está disponible." });
        }
  
        // Ejecutar el procedimiento para reservar la mesa
        await pool.query(
          "CALL reservar_mesa(?, ?, ?, ?, ?)",
          [id_mesa, nombre_cliente, correo_cliente, fecha, hora]
        );
  
        return res.status(200).json({ success: true, message: `Reserva realizada en la mesa ${id_mesa}` });
  
      } else {
        // Buscar la primera mesa libre
        const [mesasLibres] = await pool.query(
          "SELECT id_mesa FROM reserva WHERE estado = 'libre' LIMIT 1"
        );
  
        if (mesasLibres.length === 0) {
          return res.status(400).json({ success: false, message: "No hay mesas disponibles." });
        }
  
        const mesaLibre = mesasLibres[0].id_mesa;
  
        // Ejecutar el procedimiento para reservar la mesa encontrada
        await pool.query(
          "CALL reservar_mesa(?, ?, ?, ?, ?)",
          [mesaLibre, 'Cliente', correo_cliente, fecha, hora]
        );
  
        return res.status(200).json({ success: true, message: `Reserva realizada en la mesa ${mesaLibre}` });
      }
  
    } catch (error) {
      console.error("Error al hacer la reserva:", error);
      return res.status(500).json({ success: false, message: "Error al hacer la reserva" });
    }
  };
  

// El cliente puede cancelar sus reservas
export const cancelarReserva = async (req, res) => {
  try {
    const id_persona = req.user.id_persona;

    // Obtener el correo del cliente
    const [personaResult] = await pool.query(
      "SELECT correo FROM persona WHERE id_persona = ?",
      [id_persona]
    );

    if (personaResult.length === 0) {
      return res.status(404).json({ success: false, message: "Cliente no encontrado." });
    }

    const correo_cliente = personaResult[0].correo;

    // Buscar una reserva activa del cliente
    const [reservaActiva] = await pool.query(
      `SELECT id_mesa FROM reserva 
       WHERE correo_cliente = ? AND estado = 'ocupado'`,
      [correo_cliente]
    );

    if (reservaActiva.length === 0) {
      return res.status(400).json({ success: false, message: "No tienes ninguna reserva activa para cancelar." });
    }

    const id_mesa = reservaActiva[0].id_mesa;

    // Llamar al procedimiento para cancelar la reserva
    await pool.query("CALL cancelar_reserva(?)", [id_mesa]);

    return res.status(200).json({ success: true, message: `Reserva en la mesa ${id_mesa} cancelada exitosamente.` });

  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    return res.status(500).json({ success: false, message: "Error al cancelar la reserva" });
  }
};
