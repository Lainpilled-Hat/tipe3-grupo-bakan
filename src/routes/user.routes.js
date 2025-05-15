import { Router } from "express";
import {registrarse, 
        logearse, 
        deslogearse, 
        cambiarContra, //El backend recibe como parametro una nueva contraseña, para ajustarlo
        borrarCuenta,
        reservarMesa,
        cancelarReserva
        } from "../controllers/user.controller.js";
import {isAuthenticated} from "../middleware/user.middleware.js"       

const router = Router();

router.post("/restaurante/registrarse", registrarse);
router.post("/restaurante/logearse", logearse);

router.get("/restaurante/deslogearse", deslogearse);

router.delete("/restaurante/borrarCuenta", isAuthenticated, borrarCuenta);

router.patch("/restaurante/cambiarContra", isAuthenticated, cambiarContra);
router.patch("/restaurante/reservarMesa", isAuthenticated, reservarMesa);
router.patch("/restaurante/cancelarReserva", isAuthenticated, cancelarReserva);

export default router;