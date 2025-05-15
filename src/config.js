import { config } from "dotenv"

config()

export const SESSION_SECRET = process.env.SESSION_SECRET 
export const PORT = process.env.PORT
export const DB_HOST = process.env.DB_HOST
export const DB_USER = process.env.DB_USER
export const DB_NAME = process.env.DB_NAME
export const DB_PORT = process.env.DB_PORT
export const DB_PASSWORD = process.env.DB_PASSWORD
export const MONGODB_URI = process.env.MONGODB_URI
export const MONGODB_URI_WEB = process.env.MONGODB_URI_WEB