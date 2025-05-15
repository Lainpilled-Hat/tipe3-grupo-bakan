import { Router } from "express";
import {esAdmin} from "../middleware/admin.middleware.js" 
import { subirImagen } from "../middleware/upload.middleware.js";
import {ObtenerTodosLosAnuncios,
        ListarPlatos, 
        CrearAnuncio, 
        CrearPlato, 
        BorrarPlato,
        ObtenerTodosLosPlatos
     } from "../controllers/admin.controller.js";

const router = Router();

router.get("/restaurante/ObtenerTodosLosAnuncios", esAdmin, ObtenerTodosLosAnuncios);
router.get("/restaurante/ListarPlatos", esAdmin, ListarPlatos);
router.get("/restaurante/ObtenerTodosLosPlatos", esAdmin, ObtenerTodosLosPlatos);

router.post("/restaurante/CrearAnuncio", esAdmin, subirImagen, CrearAnuncio);
router.post("/restaurante/CrearPlato", esAdmin, subirImagen, CrearPlato);

router.delete("/restaurante/BorrarPlato", esAdmin, BorrarPlato);

export default router;