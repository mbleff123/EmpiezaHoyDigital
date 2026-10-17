(() => {
  "use strict";
  const base = {
    nombre: "Caso", edad: "18a24", situacion: "estudio", objetivo: "habilidad",
    experiencia: "nunca", frenos: [], dudas: [], tiempo: "30a60",
    recursos: ["celular", "internet"], aprender: "guiado", vender: "verguenza", compromiso: "varias"
  };
  const cases = [
    { name: "sin_base tiene prioridad", patch: { recursos: ["celular"], dudas: ["estafa"] }, expected: "sin_base" },
    { name: "desconfiado por duda", patch: { dudas: ["estafa"] }, expected: "desconfiado" },
    { name: "explorador por objetivo", patch: { objetivo: "sin_claro", compromiso: "cuando_pueda" }, expected: "explorador" },
    { name: "poco_tiempo", patch: { tiempo: "menos30", experiencia: "intento_fallido", frenos: ["sin_rumbo"] }, expected: "poco_tiempo" },
    { name: "con_experiencia", patch: { experiencia: "vendio" }, expected: "con_experiencia" },
    { name: "decidido", patch: {}, expected: "decidido" },
    { name: "inseguro", patch: { experiencia: "intento_fallido", aprender: "inseguro", compromiso: "cuando_pueda" }, expected: "inseguro" },
    { name: "límite 70 es Listo", patch: { aprender: "guiado", vender: "verguenza", compromiso: "varias" }, expected: "decidido", level: "ready" }
  ];

  window.runFunnelTests = () => {
    if (!window.FunnelLogic) throw new Error("FunnelLogic no está disponible");
    const results = cases.map(test => {
      const result = window.FunnelLogic.computeDiagnosis({ ...base, ...test.patch });
      const segmentOk = result.segment === test.expected;
      const levelOk = !test.level || result.levels.actitud.key === test.level;
      return { caso: test.name, esperado: test.expected, obtenido: result.segment, estado: segmentOk && levelOk ? "OK" : "ERROR", detalle: result };
    });
    console.table(results.map(({ caso, esperado, obtenido, estado }) => ({ caso, esperado, obtenido, estado })));
    const failures = results.filter(item => item.estado !== "OK");
    if (failures.length) throw new Error(`${failures.length} prueba(s) fallaron`);
    console.info("8/8 pruebas del embudo superadas.");
    return results;
  };

  if (new URLSearchParams(location.search).get("test") === "1") setTimeout(window.runFunnelTests, 0);
})();

