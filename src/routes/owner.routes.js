import { Router } from "express";
import { 
  Acceder, // Ruta para que el supervisor acceda a la plataforma de supervisión
  OtorgarPermisos, // Ruta para otorgar permisos de administrador a un usuario
  DenegarPermisos, // Ruta para denegar los permisos de administrador a un usuario
  ObtenerUsuarios // Ruta para obtener la lista de usuarios con la opción de buscarlos por nombre
} from "../controllers/owner.controller.js";

const router = Router();

router.post("/restaurante/Acceder", Acceder);
router.patch("/restaurante/OtorgarPermisos", OtorgarPermisos);
router.patch("/restaurante/DenegarPermisos", DenegarPermisos);
router.get("/restaurante/ObtenerUsuarios", ObtenerUsuarios);

export default router;