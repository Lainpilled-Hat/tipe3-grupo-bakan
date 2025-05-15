export const manejarErrorMulter = (err, req, res, next) => {
  try {
    if (err) {
      // Si es un error de Multer
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      }
      // Otros errores, incluido el de fileFilter
      return res.status(400).json({ error: err.message });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Error del servidor. Asegúrate de que el archivo sea JPEG, PNG o WEBP y que no supere los 5MB.",
    });
  }
};

export default manejarErrorMulter;