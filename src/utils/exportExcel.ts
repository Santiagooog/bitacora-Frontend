import * as XLSX from 'xlsx';

export const exportarAExcel = (datos: any[], nombreArchivo: string) => {
  // Crear hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(datos);
  
  // Crear libro
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Casos');
  
  // Generar archivo
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
};

export const exportarHojasAExcel = (
  hojas: { nombre: string; datos: Record<string, unknown>[]; encabezados: string[] }[],
  nombreArchivo: string,
) => {
  const workbook = XLSX.utils.book_new();
  hojas.forEach(({ nombre, datos, encabezados }) => {
    const worksheet = XLSX.utils.json_to_sheet(datos, { header: encabezados });
    XLSX.utils.book_append_sheet(workbook, worksheet, nombre.slice(0, 31));
  });
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
};
