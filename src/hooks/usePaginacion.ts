import { useState, useMemo, useEffect } from "react";
import { Platform } from "react-native";

interface OpcionesPaginacion {
  registrosPorPaginaInicial?: number;
}

export function usePaginacion<T>(
  datos: T[],
  opciones?: OpcionesPaginacion
) {
  const registrosIniciales = opciones?.registrosPorPaginaInicial ?? 10;
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(registrosIniciales);

  // Reiniciar a la página 1 cuando cambia la cantidad de registros o filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [datos.length]);

  const totalRegistros = datos.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina));

  // Asegurar que la página actual no sea mayor al total de páginas
  const paginaValida = Math.min(Math.max(1, paginaActual), totalPaginas);

  const datosPaginados = useMemo(() => {
    // Si no es Web, mantenemos el listado continuo nativo
    if (Platform.OS !== "web") {
      return datos;
    }
    const inicio = (paginaValida - 1) * registrosPorPagina;
    return datos.slice(inicio, inicio + registrosPorPagina);
  }, [datos, paginaValida, registrosPorPagina]);

  return {
    paginaActual: paginaValida,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados,
  };
}
