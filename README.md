Proyecto de:
Benjamin Duarte
Raul Gonzales

Descripción del proyecto.

este es un proyecto de la asignatura Arquitectura Multi Cloud que consiste en una "WEB"
que permitira subir archivos, eliminarlos, desargarlos y filtrarlos por distintos parametros
especificos del trabajo nosotros en especifico teniamos que permitir ka subida de ppt, word y que no pese mas de 18 mb (P-08) esta web se conecta directamente al laboratorio AWS mas especificamente al bucket donde se almacenaran los archivos



Tecnologías usadas.

Para este proyecto se utilizo: 
1-Frontend (React con Vite)
2-Backend (Python con FastAPI )
3-Almacenamiento: Amazon S3 
4-Otras librerías del backend como boto3, s3transfer, botocore




Arquitectura.

Frontend: React + Vite.
Backend: Python con FastAPI.
Almacenamiento: Amazon S3.
Flujo de subida: el backend genera una presigned URL para hacer PUT a S3 y el frontend sube el archivo con esa URL.
Gestión de archivos: backend lista objetos en S3 y genera presigned URL para descarga; backend elimina objetos en S3.



Requisitos.

Backend usa: FastAPI, pydantic, boto3, python-dotenv.
Frontend usa: React y Vite.
Dependencias AWS del backend (según requirements.txt): boto3 y librerías relacionadas (botocore, s3transfer).
Límite de archivos: 18 MB.
Tipos permitidos: .docx y .pptx.



Instalación.

REQUISITOS
- Git
- Python 3.12 o superior
- Node.js y npm
- Visual Studio Code

INSTALACIÓN

1. Clonar repositorio:
git clone URL_DEL_REPOSITORIO

2. Entrar al proyecto:
cd archivacloud-p08

BACKEND

1. Entrar a backend:
cd backend

2. Crear entorno virtual:
python -m venv venv

3. Activar entorno:
venv\Scripts\activate

4. Instalar dependencias:
pip install -r requirements.txt

5. Crear archivo .env usando .env.example

Variables necesarias:
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
S3_BUCKET

6. Ejecutar backend:
uvicorn main:app --reload

7. Verificar Swagger:
http://localhost:8000/docs

FRONTEND

1. Abrir nueva terminal
2. Entrar a frontend:
cd frontend

3. Instalar dependencias:
npm install

4. Ejecutar:
npm run dev

5. Abrir:
http://localhost:5173


Backend requiere variables de entorno para:
S3_BUCKET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN (si aplica)
AWS_REGION

El backend carga el .env con load_dotenv().


Ejecución frontend.
Subir archivos DOCX o PPTX (máximo 18 MB).
Subida directa a S3 mediante presigned URL:
POST /api/upload/presigned-url devuelve presignedUrl y key.
El frontend hace PUT del archivo a la presignedUrl.
Listar archivos del bucket:
GET /api/files lista objetos con prefijo uploads/ y devuelve:
key, size, lastModified, url (presigned para get_object).
Descargar archivos:
El frontend abre item.url en una nueva pestaña.
Eliminar archivos:
DELETE /api/files/{file_key:path} elimina el objeto en S3.
CORS habilitado en backend para http://localhost:5173.



Reporte de seguridad

Control	Estado

Validación de extensión	✅
Límite de tamaño	✅
Presigned URL	✅
IAM mínimo privilegio	✅
Variables en .env	✅



Declaración IA



Se utilizó ChatGPT como apoyo para:

- Resolución de dudas técnicas.
- Generacion de diseño
- Corrección de errores.

Todo el código fue revisado, probado e integrado manualmente por los estudiantes.
