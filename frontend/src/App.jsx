import { useEffect, useState } from "react";

function App() {
  const [archivo, setArchivo] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [mensaje, setMensaje] = useState("");

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

      setMensaje("✅ Archivo subido correctamente");

      setArchivo(null);

      cargarArchivos();
    } catch (error) {
      console.error(error);

      setMensaje("❌ Error al subir archivo");
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

  return (
    <div
      style={{
        backgroundColor: "#111827",
        minHeight: "100vh",
        color: "white",
        padding: "30px",
        fontFamily: "Arial",
      }}
    >
      <h1>📁 ArchivaCloud P-08</h1>

      <hr />

      <h2>Subir archivo</h2>

      <label
        style={{
          backgroundColor: "#1f2937",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
          display: "inline-block",
          border: "1px solid #10b981",
        }}
      >
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
        <p style={{ marginTop: "10px" }}>
          Archivo seleccionado: {archivo.name}
        </p>
      )}

      <br />
      <br />

      <button
        onClick={subirArchivo}
        style={{
          backgroundColor: "#10b981",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Subir archivo
      </button>

      {mensaje && (
        <p style={{ marginTop: "15px" }}>
          {mensaje}
        </p>
      )}

      <hr style={{ marginTop: "30px" }} />

      <h2>Archivos almacenados</h2>

      {archivos.length === 0 ? (
        <p>No hay archivos aún</p>
      ) : (
        archivos.map((item) => (
          <div
            key={item.key}
            style={{
              backgroundColor: "#1f2937",
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "10px",
            }}
          >
            <h3>
              📄 {item.key.replace("uploads/", "")}
            </h3>

            <p>
              Tamaño: {formatearTamano(item.size)}
            </p>

            <p>
              Fecha: {formatearFecha(item.lastModified)}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                onClick={() =>
                  descargarArchivo(item.url)
                }
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "120px",
                }}
              >
                Descargar
              </button>

              <button
                onClick={() =>
                  eliminarArchivo(item.key)
                }
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "120px",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;