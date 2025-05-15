export const isAuthenticated = (req, res, next) => {
    try {    
        if (!req.isAuthenticated()) { // Cambié de req.isAuthenticated() a !req.isAuthenticated()
            return res.status(403).json({
                message: 'Acceso denegado. Debes iniciar sesión.'
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Error del servidor. Inténtalo de nuevo más tarde.'
        });
    }
};
export default isAuthenticated;