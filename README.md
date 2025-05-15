1. descarga todo, y abra con vsc en la carpeta descargada
2. cree en la raiz de el archivo .env, relle los siguientes variables, con sus datos:
PORT=
DB_HOST=
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurante
MONGODB_URI=mongodb://localhost/restaurante
SESSION_SECRET=nkjxC1"S%%&"8"g7damñxdG(G(D2Dasdg%//$#3d28dda))"nklmcanxl3SBHBD#/GF/FG/(8g3220aco=8376
3. instale mysql server version superior o igual 8, con estas especificaciones:
En la seccion "Type and Networking" -> Config Type = "Development Computer"  
En la seccion "Authentication Method" -> "Use Legacy Authentication Method..."
En la seccion "Server File Permissions" -> "Yes, grant full access to the..."
4. instale mongodb busque un video y siga las intrucciones, detalles extras en caso de que no salga en el video:
cree en ./discolocalC(u otro donde lo instales) la carpeta "data" y dentro de data cree la carpeta "db".
Si no funciona el path en las variables de entorno global, solo vaya al directorio donde esta mongodb.exe, abra una cmd en ese directorio y ponga mongod, deje la cmd ahi y no lo cierre, despues d eeso abra mongodbcompass, ajuste la base de datos para que tenga este nombre mongodb://localhost/restaurante
5. copie todo lo del Scripts BD.txt al mysql.
6. npm run backdev si quiere ejecuciones continuas en caso de cambiar un archivo o npm run node si solo quiere que se ejecute una vez.

