import { pool } from "../db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

//El admin puede agregar nuevos platos en el menu y anuncios (Descuento etc...)

// El administrador sube la imagen de un platillo y su nombre

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CrearPlato = async (req, res) => {
  const { nombre } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  try {
    const { filename, mimetype } = req.files[0];
    const rutaOriginal = path.join(__dirname, "../images", filename);

    // Redimensionar la imagen con sharp
    const imagenRedimensionada = await sharp(rutaOriginal)
      .resize(600, 400)
      .toBuffer();

    // Guardar en la base de datos (como LONGBLOB + tipo MIME)
    const [result] = await pool.query(
      "INSERT INTO plato (nombre, tipo_imagen, imagen_plato) VALUES (?, ?, ?)",
      [nombre, mimetype, imagenRedimensionada]
    );

    /* (Opcional) Eliminar el archivo original del disco
    fs.unlink(rutaOriginal, (err) => {
      if (err) console.error("Error al eliminar la imagen temporal:", err.message);
    });
    */
    res.json({ mensaje: "Plato creado exitosamente", id: result.insertId });
  } catch (err) {
    res.status(500).json({
      error: "Error al guardar el plato",
      detalle: err.message,
    });
  }
};

// Se listan los platos 
export const ListarPlatos = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id_plato, nombre, tipo_imagen FROM plato");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Error al listar los platos", detalle: err.message });
  }
};


// Se borran los platos
export const BorrarPlato = async (req, res) => {
  const { id_plato } = req.body;

  if (!id_plato) return res.status(400).json({ error: "Falta el ID del plato" });

  try {
    await pool.query("DELETE FROM plato WHERE id_plato = ?", [id_plato]);
    res.json({ mensaje: "Plato eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el plato", detalle: err.message });
  }
};


//obtener imagen por id
export const ObtenerTodosLosPlatos = async (req, res) => {
  try {
    const [platos] = await pool.query(
      "SELECT id_plato, nombre, tipo_imagen, imagen_plato FROM plato"
    );

    const data = platos.map(({ id_plato, nombre, tipo_imagen, imagen_plato }) => ({
      id: id_plato,
      nombre,
      tipo_imagen,
      imagenBase64: `data:${tipo_imagen};base64,${imagen_plato.toString("base64")}`,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los platos", detalle: err.message });
  }
};


// El administrador sube un anuncio de algun descuento o algo
export const CrearAnuncio = async (req, res) => {
  const { titulo, dias } = req.body;
  const duracionDias = dias ? parseInt(dias) : 3;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No se subió ninguna imagen" });
  }

  try {
    const { filename, mimetype } = req.files[0];
    const rutaOriginal = path.join(__dirname, "../images", filename);

    // Redimensionar imagen (600x400)
    const imagenRedimensionada = await sharp(rutaOriginal)
      .resize(600, 400)
      .toBuffer();

    // Llamar al procedimiento almacenado
    await pool.query("CALL CrearAnuncioConDuracion(?, ?, ?, ?)", [
      titulo,
      mimetype,
      imagenRedimensionada,
      duracionDias,
    ]);

    /* (Opcional) Eliminar archivo original del disco */
    // fs.unlink(rutaOriginal, (err) => {
    //   if (err) console.error("Error al eliminar imagen temporal:", err.message);
    // });

    res.json({ mensaje: "Anuncio creado correctamente" });
  } catch (err) {
    res.status(500).json({
      error: "Error al guardar el anuncio",
      detalle: err.message,
    });
  }
};


export const ObtenerTodosLosAnuncios = async (req, res) => {
  try {
    const [anuncios] = await pool.query(
      `SELECT id_anuncio, titulo, tipo_imagen, imagen_anuncio, 
              fecha_publicacion, fecha_termino 
       FROM anuncio 
       ORDER BY fecha_publicacion DESC`
    );

    const data = anuncios.map(({ 
      id_anuncio, 
      titulo, 
      tipo_imagen, 
      imagen_anuncio, 
      fecha_publicacion, 
      fecha_termino 
    }) => ({
      id: id_anuncio,
      titulo,
      tipo_imagen,
      fecha_publicacion,
      fecha_termino,
      imagenBase64: `data:${tipo_imagen};base64,${imagen_anuncio.toString("base64")}`,
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los anuncios", detalle: err.message });
  }
};

