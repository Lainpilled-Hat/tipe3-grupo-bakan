import { pool } from "../db.js";

export const esAdmin = async (req, res, next) => {
  try {
    const { id_persona } = req.user; // Corrige también si estás usando `id_persona` en vez de `id_usuario`

    const [result] = await pool.execute(
      "SELECT tipo FROM persona WHERE id_persona = ?",
      [id_persona]
    );

    if (result.length > 0 && result[0].tipo === 'admin') {
      next();
    } else {
      res.status(401).json({ message: "Acceso denegado: No eres administrador." });
    }
  } catch (error) {
    console.error("Error en verificación de administrador:", error);
    res.status(500).json({ message: "Error al verificar administrador", error });
  }
};