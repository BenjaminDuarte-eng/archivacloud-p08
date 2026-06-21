import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [archivo, setArchivo] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [criterioOrden, setCriterioOrden] =
    useState("nombre");

  const [ascendente, setAscendente] =
    useState(true);

  const cargarArchivos = async () => {
    const response = await fetch(
      "http://localhost:8000/api/files"
    );

    const data = await response.json();

    setArchivos(data);
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const formatearTamano = (bytes) => {
    return (bytes / 1024).toFixed(2) + " KB";
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString();
  };

  const subirArchivo = async () => {
    if (!archivo) {
    alert("Selecciona un archivo");
    return;
    }

    const MAX_SIZE = 18 * 1024 * 1024;

    if (archivo.size > MAX_SIZE) {
      setMensaje(
        "❌ El archivo supera el límite de 18 MB"
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/upload/presigned-url",
       {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: archivo.name,
            fileType: archivo.type,
            fileSize: archivo.size,
          }),
        }
      );


      const data = await response.json();

      const uploadResponse = await fetch(
        data.presignedUrl,
        {
          method: "PUT",
          headers: {
            "Content-Type": archivo.type,
          },
          body: archivo,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Error al subir a S3");
      }

      setMensaje("✅ Archivo subido correctamente y guardado en S3");

      setArchivo(null);
      setMensaje("⏳ Subiendo archivo...");

      cargarArchivos();
    } catch (error) {
      console.error(error);

      setMensaje(
        "❌ Error al subir archivo"
      );
    }
  };

  const descargarArchivo = (url) => {
    window.open(url, "_blank");
  };

  const eliminarArchivo = async (key) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas eliminar este archivo?"
    );

    if (!confirmar) return;

    await fetch(
      `http://localhost:8000/api/files/${key}`,
      {
        method: "DELETE",
      }
    );

    cargarArchivos();
  };

  const archivosOrdenados = [...archivos].sort(
    (a, b) => {
      let resultado = 0;

      if (criterioOrden === "nombre") {
        resultado = a.key.localeCompare(
          b.key
        );
      }

      if (criterioOrden === "tamano") {
        resultado = a.size - b.size;
      }

      if (criterioOrden === "fecha") {
        resultado =
          new Date(a.lastModified) -
          new Date(b.lastModified);
      }

      return ascendente
        ? resultado
        : -resultado;
    }
  );

  return (
    <div className="app-container">
      
    
      <div className="header-card">
        <h1 className="header-title">
         📁 ArchivaCloud P-08
       </h1>

       <p className="header-subtitle">
        Sistema de Gestión Documental AWS S3
      </p>
    </div>

      <hr />

      <h2 className="section-title">
        Subir archivo
      </h2>

      <label className="file-selector">
        📄 Seleccionar DOCX o PPTX

        <input
          type="file"
          style={{ display: "none" }}
          onChange={(e) =>
            setArchivo(e.target.files[0])
          }
        />
      </label>

      {archivo && (
        <p style={{ marginTop: "15px" }}>
          Archivo seleccionado:
          {" "}
          {archivo.name}
        </p>
      )}

      <br />
      <br />

      <button
        onClick={subirArchivo}
        className="action-button"
      >
        Subir archivo
      </button>

      {mensaje && (
        <p
          style={{
            marginTop: "15px",
          }}
        >
          {mensaje}
        </p>
      )}

      <hr
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      />

      <h2 className="section-title">
        Archivos almacenados
      </h2>

      <div className="toolbar">
        <button
          onClick={() =>
            setCriterioOrden("nombre")
          }
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Nombre
        </button>

        <button
          onClick={() =>
            setCriterioOrden("tamano")
          }
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Tamaño
        </button>

        <button
          onClick={() =>
            setCriterioOrden("fecha")
          }
          style={{
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Fecha
        </button>

        <button
          onClick={() =>
            setAscendente(!ascendente)
          }
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 15px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {ascendente
            ? "↑ Ascendente"
            : "↓ Descendente"}
        </button>
      </div>

      {archivosOrdenados.length === 0 ? (
        <p>No hay archivos aún</p>
      ) : (
        archivosOrdenados.map((item) => (
          <div
            key={item.key}
            className="file-card"
          >
            <div className="file-name">
              📄 {item.key.replace("uploads/", "")}
            </div>

            <div className="file-info">
              <span className="file-label">Tamaño:</span>{" "}
              {formatearTamano(item.size)}
            </div>

            <div className="file-info">
              <span className="file-label">Fecha:</span>{" "}
              {formatearFecha(item.lastModified)}
            </div>

            <div className="acciones">
              <button
                className="btn-descargar"
                onClick={() => descargarArchivo(item.url)}
              >
                ⬇ Descargar
              </button>

              <button
                className="btn-eliminar"
                onClick={() => eliminarArchivo(item.key)}
              >
              🗑 Eliminar
             </button>
             </div>
             </div>
             ))
             )}
             </div>
            );
            }

export default App;