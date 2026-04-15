import { useMemo, useState } from "react";

type TagProps = {
  children: React.ReactNode;
  color?: string;
};

type PillProps = {
  v: number;
};

type MiniSparklineProps = {
  hist: { m: string; v: number }[];
  proj: { m: string; v: number }[];
};

const COSTO_FIJO_SEM = 39002;
const DIAS_SEMANA = 6;
const COSTO_FIJO_DIA = COSTO_FIJO_SEM / DIAS_SEMANA;
const VAR_X_CERDO = 150;
const REND = 0.75;
const FECHA_HOY = "14 Abr 2026";
const SNIIM_HOY = 40.5;
const SNIIM_RANGO = "37-44";

const CORTES = [
  { n: "Jamon", prop: 0.1475, hist: 79.2, sniim: 78.0 },
  { n: "Pecho", prop: 0.1357, hist: 92.5, sniim: 91.0 },
  { n: "Pulpa", prop: 0.1088, hist: 84.1, sniim: 83.0 },
  { n: "Pierna", prop: 0.0764, hist: 74.3, sniim: 73.0 },
  { n: "Espilomo", prop: 0.0533, hist: 81.0, sniim: 80.0 },
  { n: "Cuero", prop: 0.0688, hist: 53.0, sniim: 52.0 },
  { n: "Retazo", prop: 0.0687, hist: 61.5, sniim: 60.0 },
  { n: "Grasa", prop: 0.0748, hist: 34.0, sniim: 33.0 },
  { n: "Lomo USA", prop: 0.0346, hist: 75.0, sniim: 74.0 },
  { n: "Capote", prop: 0.0374, hist: 79.0, sniim: 78.0 },
  { n: "H.Americano", prop: 0.0218, hist: 74.5, sniim: 74.0 },
  { n: "Codillo", prop: 0.0173, hist: 51.0, sniim: 50.5 },
  { n: "Espinazo", prop: 0.0077, hist: 79.0, sniim: 78.0 },
  { n: "Filete", prop: 0.0064, hist: 96.0, sniim: 95.0 },
];

const HIST_MENS = [
  { m: "Ene 25", v: 47 }, { m: "Feb 25", v: 45.5 }, { m: "Mar 25", v: 46 }, { m: "Abr 25", v: 47 },
  { m: "May 25", v: 47.5 }, { m: "Jun 25", v: 49 }, { m: "Jul 25", v: 50 }, { m: "Ago 25", v: 49 },
  { m: "Sep 25", v: 49.5 }, { m: "Oct 25", v: 50 }, { m: "Nov 25", v: 51.5 }, { m: "Dic 25", v: 53.5 },
  { m: "Ene 26", v: 48.5 }, { m: "Feb 26", v: 46 }, { m: "Mar 26", v: 44 }, { m: "Abr 26", v: 40.5 },
];

const PROJ_MENS = [
  { m: "May 26", v: 44.5 }, { m: "Jun 26", v: 49 }, { m: "Jul 26", v: 52 },
  { m: "Ago 26", v: 47 }, { m: "Sep 26", v: 45.5 }, { m: "Oct 26", v: 47.5 },
  { m: "Nov 26", v: 52 }, { m: "Dic 26", v: 57 },
];

const SEMANAS = [
  { sem: "14-18 Abr", precio: "$38-42", senal: "Minimo", color: "#1d9e75", nota: "Comprar maximo" },
  { sem: "21-25 Abr", precio: "$40-45", senal: "Semana Santa", color: "#d97706", nota: "Spike carnitas" },
  { sem: "28 Abr-2 May", precio: "$41-45", senal: "Pre-alza", color: "#d97706", nota: "No regresa a $40" },
  { sem: "5-9 May", precio: "$43-47", senal: "Alza", color: "#e24b4a", nota: "Dia de la Madre" },
];

const PROY_TABLA = [
  { m: "Abr 26", p: "$37-44", t: "Minimo", f: "Temporada baja", tipo: "real", pr: 40.5 },
  { m: "May 26", p: "$42-47", t: "Alza", f: "Dia de la Madre", tipo: "proj", pr: 44.5 },
  { m: "Jun 26", p: "$46-52", t: "Fuerte alza", f: "Copa Mundial", tipo: "proj", pr: 49 },
  { m: "Jul 26", p: "$48-55", t: "Pico", f: "Copa - verano", tipo: "proj", pr: 52 },
  { m: "Ago 26", p: "$44-49", t: "Baja gradual", f: "Post-Copa", tipo: "proj", pr: 47 },
  { m: "Nov-Dic", p: "$52-62", t: "Maximo", f: "Navidad", tipo: "proj", pr: 57 },
];

const f2 = (n: number) => Number(n).toFixed(2);
const fmx = (n: number) => Number(n).toLocaleString("es-MX", { maximumFractionDigits: 0 });

function Tag({ children, color }: TagProps) {
  const c = color || "#378add";
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10,
      fontWeight: 500, background: c + "22", color: c, border: "0.5px solid " + c + "88" }}>
      {children}
    </span>
  );
}

function Pill({ v }: PillProps) {
  const pos = v >= 0;
  return (
    <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500,
      background: pos ? "#eaf3de" : "#fcebeb", color: pos ? "#3b6d11" : "#a32d2d" }}>
      {pos ? "+" : ""}{f2(v)}
    </span>
  );
}

function MiniSparkline({ hist, proj }: MiniSparklineProps) {
  const all = [...hist.map((d) => d.v), ...proj.map((d) => d.v)];
  const max = Math.max(...all) + 4;
  const min = Math.min(...all) - 3;
  const H = 80;
  const pts = [...hist, ...proj.map((d) => ({ m: d.m, v: d.v, p: true }))];
  const x = (i: number) => ((i / (pts.length - 1)) * 100).toFixed(1);
  const y = (v: number) => (H - ((v - min) / (max - min)) * H).toFixed(1);
  const splitAt = hist.length - 1;
  const pathR = pts.slice(0, splitAt + 1).map((d, i) => (i === 0 ? "M" : "L") + x(i) + "," + y(d.v)).join(" ");
  const pathP = pts.slice(splitAt).map((d, i) => (i === 0 ? "M" : "L") + x(splitAt + i) + "," + y(d.v)).join(" ");
  return (
    <svg viewBox={"0 0 100 " + H} preserveAspectRatio="none" style={{ width: "100%", height: H, display: "block" }}>
      <path d={pathR} fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <path d={pathP} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3,2" />
      <circle cx={x(splitAt)} cy={y(pts[splitAt].v)} r="2.5" fill="#34d399" />
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("decision");
  const [precioPie, setPrecioPie] = useState(36);
  const [numCerdos, setNumCerdos] = useState(25);
  const [pesoCerdo, setPesoCerdo] = useState(125);
  const [margen, setMargen] = useState(8);

  const C = useMemo(() => {
    const kgVivos = numCerdos * pesoCerdo;
    const kgCanal = kgVivos * REND;
    const costoMP = kgVivos * precioPie;
    const costoOpDia = COSTO_FIJO_DIA + VAR_X_CERDO * numCerdos;
    const costoMPkg = precioPie / REND;
    const costoOpKg = costoOpDia / kgCanal;
    const costoKg = costoMPkg + costoOpKg;
    const precioMin = costoKg * (1 + margen / 100);
    let ingHist = 0, ingSNIIM = 0, ingMin = 0;
    const cortes = CORTES.map((c) => {
      const kg = c.prop * REND * kgVivos;
      ingHist += c.hist * kg;
      ingSNIIM += c.sniim * kg;
      ingMin += precioMin * kg;
      return {
        ...c, kg: parseFloat(kg.toFixed(1)),
        mgHist: parseFloat((c.hist - costoKg).toFixed(2)),
        mgSNIIM: parseFloat((c.sniim - costoKg).toFixed(2)),
        precioMin: parseFloat(precioMin.toFixed(2)),
        costoKg: parseFloat(costoKg.toFixed(2)),
      };
    });
    const costoTotal = costoMP + costoOpDia;
    return {
      kgVivos, kgCanal, costoMP, costoOpDia, costoMPkg, costoOpKg,
      costoKg, precioMin, costoTotal,
      ingHist, utilHist: ingHist - costoTotal,
      ingSNIIM, utilSNIIM: ingSNIIM - costoTotal,
      ingMin, utilMin: ingMin - costoTotal,
      cortes,
    };
  }, [precioPie, numCerdos, pesoCerdo, margen]);

  const score = precioPie <= 38 ? 9.1 : precioPie <= 42 ? 7.5 : precioPie <= 46 ? 5.8 : 3.5;
  const scoreColor = score >= 8 ? "#1d9e75" : score >= 6 ? "#d97706" : "#e24b4a";
  const scoreLabel = score >= 8 ? "COMPRAR AHORA" : score >= 6 ? "EVALUAR" : "PRECAUCION";

  const tabS = (t: string): React.CSSProperties => ({
    padding: "6px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
    border: "0.5px solid var(--color-border-tertiary)",
    background: tab === t ? "#b91c1c" : "transparent",
    color: tab === t ? "#fff" : "var(--color-text-secondary)",
    fontWeight: tab === t ? 500 : 400,
  });
  const inp: React.CSSProperties = {
    width: "100%", padding: "6px 10px", fontSize: 13,
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-md)",
    background: "var(--color-background-primary)",
    color: "var(--color-text-primary)",
  };
  const thS: React.CSSProperties = { fontSize: 10, fontWeight: 500, color: "var(--color-text-secondary)",
    padding: "5px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)",
    textAlign: "right", whiteSpace: "nowrap" };
  const tdS: React.CSSProperties = { padding: "5px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)",
    color: "var(--color-text-primary)", fontSize: 11 };
  const tdR: React.CSSProperties = { ...tdS, textAlign: "right" };

  return (
    <div className="app-shell">
      <div style={{ padding: "0.5rem 0" }}>
        <div style={{ background: "linear-gradient(135deg,#7f1d1d,#b91c1c)", borderRadius: 10,
          padding: "14px 16px", marginBottom: "1rem", color: "#fff" }}>
          <div style={{ fontSize: 10, opacity: .75, marginBottom: 2, letterSpacing: .5, textTransform: "uppercase" }}>
            Distribuidora Tres Hermanos - Cerro Gordo, Ecatepec - {FECHA_HOY}
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 10 }}>Panel Ejecutivo de Operaciones</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
            {[
              ["Precio en pie HOY", "$" + precioPie + " /kg", "Real - Cerro Gordo", "#34d399"],
              ["Precio SNIIM ref.", "$" + SNIIM_HOY + "/kg", "Rango " + SNIIM_RANGO, "#93c5fd"],
              ["Costo total/kg", "$" + f2(C.costoKg), "MP + Operativo", "#fbbf24"],
              ["Precio min. venta", "$" + f2(C.precioMin), "Con " + margen + "% mg", "#f87171"],
              ["Score compra", score + "/10", scoreLabel, scoreColor],
            ].map((item) => (
              <div key={item[0]} style={{ background: "rgba(255,255,255,.12)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, opacity: .8, marginBottom: 2, textTransform: "uppercase", letterSpacing: .4 }}>{item[0]}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: item[3], lineHeight: 1 }}>{item[1]}</div>
                <div style={{ fontSize: 9, opacity: .7, marginTop: 2 }}>{item[2]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "var(--color-background-secondary)", borderRadius: 10,
          padding: "12px 14px", marginBottom: "1rem", border: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>
            Parametros del lote — actualiza para recalcular todo
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            {[
              ["Precio en pie ($/kg)", precioPie, 0.5, 20, 120, setPrecioPie],
              ["Num. de cerdos", numCerdos, 1, 1, 500, setNumCerdos],
              ["Peso prom. (kg)", pesoCerdo, 1, 80, 250, setPesoCerdo],
              ["Margen minimo (%)", margen, 0.5, 0, 50, setMargen],
            ].map((item) => (
              <div key={item[0]}>
                <label style={{ fontSize: 10, color: "var(--color-text-secondary)", display: "block", marginBottom: 3 }}>
                  {item[0]}
                </label>
                <input type="number" value={Number(item[1])} step={Number(item[2])} min={Number(item[3])} max={Number(item[4])}
                  onChange={(e) => (item[5] as (n: number) => void)(parseFloat(e.target.value) || 0)} style={inp} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: "1rem", flexWrap: "wrap" }}>
          {[ ["decision", "Decision"], ["ganancia", "Ganancia"], ["cortes", "Por corte"], ["mercado", "Mercado"], ["costos", "Costos"] ].map((item) => (
            <button key={item[0]} onClick={() => setTab(item[0])} style={tabS(item[0])}>{item[1]}</button>
          ))}
        </div>

        {tab === "decision" && (
          <div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10,
              padding: "14px 16px", marginBottom: "1rem", borderLeft: "4px solid " + scoreColor }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: scoreColor + "22",
                  border: "2px solid " + scoreColor, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 22, fontWeight: 500, color: scoreColor, flexShrink: 0 }}>
                  {score}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: scoreColor }}>{scoreLabel} — Precio ${precioPie}/kg en pie</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4, lineHeight: 1.6 }}>
                    {precioPie <= 38
                      ? "Precio en minimo historico. Comprar volumen maximo. La alza de mayo reduce este nivel de margen."
                      : precioPie <= 42
                        ? "Precio por debajo del promedio. Buen momento para comprar."
                        : precioPie <= 46
                          ? "Precio en rango promedio. Comprar volumen normal."
                          : "Precio elevado. Comprar solo lo necesario. Ajustar precio de venta."}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: "1rem" }}>
              {[
                ["Accion inmediata", "Vender por encima de $" + f2(C.precioMin) + "/kg (precio minimo con " + margen + "% margen).", "#1d9e75"],
                ["Referencia de mercado", "SNIIM hoy: $" + SNIIM_HOY + "/kg. Tu costo: $" + f2(C.costoKg) + "/kg. Diferencia: $" + f2(SNIIM_HOY - C.costoKg) + "/kg.", "#378add"],
                ["Alerta proximas semanas", "En mayo el precio subira a ~$44-47/kg. Tu margen se comprimira aproximadamente $" + f2((45.5 - precioPie) / REND) + " por kg.", "#d97706"],
              ].map((item) => (
                <div key={item[0]} style={{ background: "var(--color-background-secondary)", borderRadius: 8,
                  padding: "12px 14px", borderLeft: "3px solid " + item[2] }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 4 }}>{item[0]}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{item[1]}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>Precio en pie — Tendencia + proyeccion 2026</div>
                <div style={{ display: "flex", gap: 10, fontSize: 9, color: "var(--color-text-secondary)" }}>
                  <span style={{ color: "#ef4444" }}>— Real</span>
                  <span style={{ color: "#60a5fa" }}>-- Proyeccion</span>
                  <span style={{ color: "#34d399" }}>● Hoy</span>
                </div>
              </div>
              <MiniSparkline hist={HIST_MENS} proj={PROJ_MENS} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--color-text-secondary)", marginTop: 4 }}>
                <span>Ene 25</span><span>May 25</span><span>Sep 25</span>
                <span style={{ color: "#34d399" }}>Hoy</span>
                <span style={{ color: "#60a5fa" }}>May</span>
                <span style={{ color: "#60a5fa" }}>Jul Copa</span>
                <span style={{ color: "#60a5fa" }}>Dic</span>
              </div>
            </div>

            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>
                Proyeccion precio — proximas 4 semanas
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 8 }}>
                {SEMANAS.map((s) => (
                  <div key={s.sem} style={{ background: "var(--color-background-primary)", borderRadius: 8,
                    padding: "10px", border: "0.5px solid " + s.color + "44" }}>
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginBottom: 3 }}>{s.sem}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.precio}</div>
                    <div style={{ marginTop: 4 }}><Tag color={s.color}>{s.senal}</Tag></div>
                    <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 4 }}>{s.nota}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "ganancia" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: "1rem" }}>
              {[
                { lb: "Precio minimo", ing: C.ingMin, util: C.utilMin, c: "#888780", nota: "Piso absoluto · $" + f2(C.precioMin) + "/kg" },
                { lb: "Precio SNIIM", ing: C.ingSNIIM, util: C.utilSNIIM, c: "#378add", nota: "Mercado oficial · $" + SNIIM_HOY + "/kg" },
                { lb: "Precio historico", ing: C.ingHist, util: C.utilHist, c: "#1d9e75", nota: "Precios reales Ene-Oct 2025" },
              ].map((s) => (
                <div key={s.lb} style={{ background: "var(--color-background-secondary)", borderRadius: 10,
                  padding: "14px", borderLeft: "3px solid " + s.c }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 4 }}>{s.lb}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Ingreso estimado</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>${fmx(s.ing)}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 8 }}>Utilidad bruta</div>
                  <div style={{ fontSize: 20, fontWeight: 500, color: s.util >= 0 ? "#1d9e75" : "#e24b4a" }}>
                    {s.util >= 0 ? "+" : ""} ${fmx(s.util)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 4 }}>{s.nota}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px", marginBottom: "1rem" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 12 }}>
                Utilidad comparativa por escenario
              </div>
              {[
                ["Precio minimo", C.utilMin, "#888780"],
                ["Precio SNIIM", C.utilSNIIM, "#378add"],
                ["Precio historico", C.utilHist, "#1d9e75"],
              ].map((item) => {
                const mx = Math.max(C.utilHist, C.utilSNIIM, C.utilMin, 1);
                return (
                  <div key={String(item[0])} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: "var(--color-text-primary)" }}>{item[0]}</span>
                      <span style={{ color: Number(item[1]) >= 0 ? "#1d9e75" : "#e24b4a", fontWeight: 500 }}>
                        {Number(item[1]) >= 0 ? "+" : ""} ${fmx(Number(item[1]))}
                      </span>
                    </div>
                    <div style={{ background: "var(--color-border-tertiary)", borderRadius: 4, height: 10 }}>
                      <div style={{ width: Math.max(0, Number(item[1]) / mx * 100) + "%", background: String(item[2]), height: 10, borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "14px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>
                Impacto del precio de compra en la utilidad del lote
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))", gap: 8 }}>
                {[36, 38, 40, 42, 44, 46, 48].map((p) => {
                  const ck = (p / REND) + COSTO_FIJO_DIA / C.kgCanal + VAR_X_CERDO * numCerdos / C.kgCanal;
                  let ing2 = 0;
                  CORTES.forEach((c) => { ing2 += c.hist * c.prop * REND * C.kgVivos; });
                  const util2 = ing2 - (C.kgVivos * p + C.costoOpDia);
                  const isHoy = p === Math.round(precioPie);
                  return (
                    <div key={p} style={{ background: isHoy ? "#1d9e7522" : "var(--color-background-primary)",
                      borderRadius: 8, padding: "8px 10px", textAlign: "center",
                      border: isHoy ? "0.5px solid #1d9e75" : "0.5px solid var(--color-border-tertiary)" }}>
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Compra</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: isHoy ? "#1d9e75" : "var(--color-text-primary)" }}>
                        ${p}/kg
                      </div>
                      <div style={{ fontSize: 9, color: "var(--color-text-secondary)", marginTop: 2 }}>
                        Costo/kg: ${f2(ck)}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 500,
                        color: util2 >= 0 ? "#1d9e75" : "#e24b4a", marginTop: 4 }}>
                        {util2 >= 0 ? "+" : ""} ${fmx(util2)}
                      </div>
                      {isHoy && <div style={{ fontSize: 8, color: "#1d9e75", marginTop: 2 }}>HOY</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "cortes" && (
          <div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 10 }}>
              Costo base: <strong style={{ color: "var(--color-text-primary)" }}>${f2(C.costoKg)}/kg</strong>
              {" · "}Precio minimo: <strong style={{ color: "#e24b4a" }}>${f2(C.precioMin)}/kg</strong>
              {" · "}<Tag color="#378add">SNIIM 10 Abr</Tag>{" "}<Tag color="#1d9e75">Historico Ene-Oct 25</Tag>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ ...thS, textAlign: "left" }}>Corte</th>
                    <th style={thS}>Kg/lote</th>
                    <th style={thS}>Costo/kg</th>
                    <th style={{ ...thS, color: "#e24b4a" }}>Precio min.</th>
                    <th style={{ ...thS, color: "#378add" }}>SNIIM</th>
                    <th style={{ ...thS, color: "#378add" }}>Mg SNIIM</th>
                    <th style={{ ...thS, color: "#1d9e75" }}>Historico</th>
                    <th style={{ ...thS, color: "#1d9e75" }}>Mg hist.</th>
                    <th style={thS}>Senal</th>
                  </tr>
                </thead>
                <tbody>
                  {C.cortes.map((c) => (
                    <tr key={c.n}>
                      <td style={{ ...tdS, fontWeight: 500 }}>{c.n}</td>
                      <td style={tdR}>{c.kg}</td>
                      <td style={tdR}>${f2(c.costoKg)}</td>
                      <td style={{ ...tdR, color: "#e24b4a", fontWeight: 500 }}>${f2(c.precioMin)}</td>
                      <td style={{ ...tdR, color: "#378add" }}>${f2(c.sniim)}</td>
                      <td style={tdR}><Pill v={c.mgSNIIM} /></td>
                      <td style={{ ...tdR, color: "#1d9e75" }}>${f2(c.hist)}</td>
                      <td style={tdR}><Pill v={c.mgHist} /></td>
                      <td style={tdS}>
                        {c.mgHist > 10
                          ? <Tag color="#1d9e75">Rentable</Tag>
                          : c.mgHist > 0
                            ? <Tag color="#d97706">Ajustar</Tag>
                            : <Tag color="#e24b4a">Perdida</Tag>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "mercado" && (
          <div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10,
              padding: "14px 16px", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2, textTransform: "uppercase" }}>
                    Precio SNIIM — D.F. y Zona Metro · 10 Abr 2026
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    $40.50<span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}>/kg</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>
                    Rango $37-44 · 1,748 cabezas sacrificadas
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 4 }}>Tu precio real hoy</div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: "#34d399" }}>${precioPie}<span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>/kg</span></div>
                  <Tag color={precioPie <= SNIIM_HOY ? "#1d9e75" : "#e24b4a"}>
                    {precioPie <= SNIIM_HOY
                      ? "$" + f2(SNIIM_HOY - precioPie) + " por debajo del SNIIM"
                      : "$" + f2(precioPie - SNIIM_HOY) + " por encima del SNIIM"}
                  </Tag>
                </div>
              </div>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {[ ["Jalisco", "718 cab.", "41.1%"], ["Guanajuato", "522 cab.", "29.9%"], ["Puebla", "508 cab.", "29.1%"] ].map((e) => (
                  <div key={e[0]} style={{ background: "var(--color-background-primary)", borderRadius: 6, padding: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>{e[0]}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{e[1]}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#378add" }}>{e[2]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#1d9e75", marginBottom: 8 }}>Factores bajistas</div>
                {["Maiz y soya en minimos globales", "Sobreoferta post-diciembre 2025",
                  "Cupos PACIC: 51k ton cerdo importado", "Produccion nacional +6% en 2025",
                  "Temporada baja ene-abr (cuaresma)"].map((f) => (
                  <div key={f} style={{ fontSize: 10, color: "var(--color-text-secondary)",
                    padding: "3px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "#e24b4a", marginBottom: 8 }}>Factores alcistas</div>
                {["Dia de la Madre — 10 mayo (+$4-7)", "Copa Mundial FIFA jun-jul (+$10-16)",
                  "PRRS y PED activos en EE.UU.", "Cupos insuficientes vs demanda real",
                  "Inflacion estructural +3.6%/año"].map((f) => (
                  <div key={f} style={{ fontSize: 10, color: "var(--color-text-secondary)",
                    padding: "3px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 10 }}>
                Proyeccion mensual 2026 — precio en pie LAB rastro CDMX
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                  <thead>
                    <tr>
                      {["Mes", "Precio est.", "Tendencia", "Factor", "Costo/kg estimado"].map((h, i) => (
                        <th key={h} style={{ ...thS, textAlign: i === 0 ? "left" : "right" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PROY_TABLA.map((r) => {
                      const ck = (r.pr / REND) + COSTO_FIJO_DIA / C.kgCanal + VAR_X_CERDO * numCerdos / C.kgCanal;
                      const isHoy = r.tipo === "real";
                      return (
                        <tr key={r.m}>
                          <td style={{ ...tdS, fontWeight: isHoy ? 500 : 400, color: isHoy ? "#34d399" : "var(--color-text-primary)" }}>{r.m}</td>
                          <td style={{ ...tdR, color: isHoy ? "#34d399" : "#60a5fa", fontWeight: 500 }}>{r.p}</td>
                          <td style={tdR}><Tag color={r.t === "Minimo" ? "#1d9e75" : r.t.includes("Pico") || r.t.includes("Fuerte") ? "#e24b4a" : "#d97706"}>{r.t}</Tag></td>
                          <td style={{ ...tdR, fontSize: 10, color: "var(--color-text-secondary)" }}>{r.f}</td>
                          <td style={{ ...tdR, color: ck > C.costoKg ? "#e24b4a" : "#1d9e75" }}>
                            ${f2(ck)} {ck > C.costoKg ? "(+" + f2(ck - C.costoKg) + ")" : "(piso)"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "costos" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: "1rem" }}>
              {[
                ["Costo fijo/semana", "$" + fmx(COSTO_FIJO_SEM), "6 dias · $" + fmx(COSTO_FIJO_DIA) + "/dia", "#378add"],
                ["Costo variable/dia", "$" + fmx(VAR_X_CERDO * numCerdos), "$150 x " + numCerdos + " cerdos", "#d97706"],
                ["Costo MP/dia", "$" + fmx(C.costoMP), C.kgVivos.toLocaleString() + " kg x $" + precioPie, "#e24b4a"],
                ["Costo total/dia", "$" + fmx(C.costoTotal), "MP + fijo + variable", "#7f77dd"],
                ["Costo por kg", "$" + f2(C.costoKg), C.kgCanal.toFixed(0) + " kg canal", "#1d9e75"],
                ["Precio min. venta", "$" + f2(C.precioMin), "Margen " + margen + "%", "#e24b4a"],
              ].map((item) => (
                <div key={item[0]} style={{ background: "var(--color-background-secondary)",
                  borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid " + item[3] }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginBottom: 2 }}>{item[0]}</div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.1 }}>{item[1]}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>{item[2]}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>
                  Costos fijos semanales
                </div>
                {[
                  ["Personal (9 trabajadores)", "$35,100", 58],
                  ["Renta local", "$6,904", 11],
                  ["Rastro (corrales, bajada...)", "$4,350", 7],
                  ["Combustibles", "$2,800", 5],
                  ["Mantenimiento vehiculos", "$2,500", 4],
                  ["Luz", "$1,148", 2],
                  ["Gastos operacion + contador", "$2,300", 4],
                ].map((item) => (
                  <div key={String(item[0])} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "4px 0", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 11 }}>
                    <span style={{ color: "var(--color-text-secondary)", flex: 1 }}>{item[0]}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ width: 40, background: "var(--color-border-tertiary)", borderRadius: 3, height: 5 }}>
                        <div style={{ width: item[2] + "%", background: "#378add", height: 5, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontWeight: 500, minWidth: 55, textAlign: "right" }}>{item[1]}</span>
                    </div>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0",
                  fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)" }}>
                  <span>Total semanal</span><span>${fmx(COSTO_FIJO_SEM)}</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>
                  / 6 dias = ${fmx(COSTO_FIJO_DIA)}/dia
                </div>
              </div>

              <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>
                  Resumen del lote actual
                </div>
                {[
                  ["Cerdos", numCerdos + " cabezas", false],
                  ["Peso promedio", pesoCerdo + " kg/cerdo", false],
                  ["Kg vivos", C.kgVivos.toLocaleString() + " kg", false],
                  ["Rendimiento canal", "75%", false],
                  ["Kg canal", C.kgCanal.toFixed(0) + " kg", false],
                  ["Precio en pie", "$" + precioPie + "/kg", false],
                  ["Costo MP", "$" + fmx(C.costoMP), false],
                  ["Matanza+desbarate", "$" + fmx(VAR_X_CERDO * numCerdos), false],
                  ["Costo fijo/dia", "$" + fmx(COSTO_FIJO_DIA), false],
                  ["Costo total lote", "$" + fmx(C.costoTotal), false],
                  ["Costo por kg", "$" + f2(C.costoKg), true],
                  ["Precio min. venta", "$" + f2(C.precioMin), true],
                ].map((item, i) => (
                  <div key={String(item[0])} style={{ display: "flex", justifyContent: "space-between",
                    padding: "3px 0", borderBottom: "0.5px solid var(--color-border-tertiary)",
                    fontSize: 11, fontWeight: item[2] ? 500 : 400 }}>
                    <span style={{ color: item[2] ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>{item[0]}</span>
                    <span style={{ color: i === 11 ? "#e24b4a" : "var(--color-text-primary)" }}>{item[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "1.5rem", padding: "10px 0",
          borderTop: "0.5px solid var(--color-border-tertiary)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap",
          gap: 6, fontSize: 9, color: "var(--color-text-secondary)" }}>
          <span>Tres Hermanos · Panel Ejecutivo · {FECHA_HOY}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag color="#34d399">Confirmado</Tag>
            <Tag color="#378add">SNIIM oficial</Tag>
            <Tag color="#d97706">Proyeccion</Tag>
          </div>
        </div>
      </div>
    </div>
  );
}
