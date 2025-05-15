export const errorRuta = (req, res, next) => {
    try {    
        res.status(404).json({
            message: 'Ruta inexistente'
        })
        next();
    } catch (error) {
        return res.status(500).json({
            message: 'Error del servidor. Inténtalo de nuevo más tarde.'
        });
    }
};
export default errorRuta;