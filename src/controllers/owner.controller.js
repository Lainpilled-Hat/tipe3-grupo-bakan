import { pool } from "../db.js";

// El dueño puede, organizar quienes son los admins por ende ver una lista de todas las personas.

// Método para que el dueño acceda mediante una clave especial
export const Acceder = async (req, res) => {
  try {
    const { claveAcceso, correo } = req.body;

    // Verificamos la clave de acceso especial
    if (claveAcceso === "Dare ga hon'yaku shite mo kusoda") {
      // Actualizamos al usuario para que sea 'admin'
      const [result] = await pool.query(
        "UPDATE persona SET tipo = 'admin' WHERE correo = ?",
        [correo]
      );

      if (result.affectedRows > 0) {
        return res.json({ message: "Acceso concedido. Ahora eres administrador." });
      } else {
        return res.status(404).json({ message: "Correo no encontrado." });
      }
    }

    res.status(401).json({ message: "Acceso denegado. Clave incorrecta." });
  } catch (error) {
    res.status(500).json({ message: "Error al acceder", error });
  }
};


// Otorga permisos de administrador a un usuario por correo
export const OtorgarPermisos = async (req, res) => {
  try {
    const { correo } = req.body;

    const [result] = await pool.query(
      "UPDATE persona SET tipo = 'admin' WHERE correo = ?",
      [correo]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Permisos de administrador otorgados correctamente." });
    }

    res.status(404).json({ message: "Correo no encontrado." });
  } catch (error) {
    res.status(500).json({ message: "Error al otorgar permisos", error });
  }
};


// Deniega los permisos de administrador de un usuario por correo
export const DenegarPermisos = async (req, res) => {
  try {
    const { correo } = req.body;

    const [result] = await pool.query(
      "UPDATE persona SET tipo = 'cliente' WHERE correo = ?",
      [correo]
    );

    if (result.affectedRows > 0) {
      return res.json({ message: "Permisos de administrador revocados correctamente." });
    }

    res.status(404).json({ message: "Usuario no encontrado." });
  } catch (error) {
    res.status(500).json({ message: "Error al denegar permisos", error });
  }
};


// Obtiene la lista de usuarios, con opción de filtrar por nombre
export const ObtenerUsuarios = async (req, res) => {
  try {
    const { correo } = req.query;

    let query = "SELECT id_persona, correo, tipo FROM persona";
    const params = [];

    if (correo) {
      query += " WHERE correo LIKE ?";
      params.push(`%${correo}%`);
    }

    const [usuarios] = await pool.query(query, params);
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error });
  }
};

