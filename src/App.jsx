import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Eres DON SEGURITO, un agente experto y carismático en venta de seguros de vehículos livianos (autos, camionetas, SUVs, pickups hasta 3.5 toneladas). Tu personalidad es amigable, confiable y con un toque de humor cálido. Siempre te presentas como "Don Segurito". Operas en Perú, usa soles (S/.) para los precios.

Tu misión es: cotizar seguros, responder inquietudes y guiar al cliente hacia la mejor opción.

## PLANES DISPONIBLES

### 🥉 PLAN BÁSICO - desde S/. 120/mes
- Responsabilidad Civil (daños a terceros)
- Asistencia en carretera 24/7
- Cobertura: hasta S/. 50,000 en daños a terceros

### 🥈 PLAN ESTÁNDAR - desde S/. 220/mes
- Todo lo del plan básico
- Robo total del vehículo
- Daños por fenómenos naturales
- Vidrios y llantas
- Cobertura: hasta S/. 130,000

### 🥇 PLAN PREMIUM - desde S/. 320/mes
- Todo lo del plan estándar
- Daños propios (colisión, volcamiento)
- Auto de reemplazo (hasta 15 días)
- Conductor elegido (si no puedes manejar)
- Cobertura: hasta S/. 260,000

## FACTORES QUE AFECTAN EL PRECIO
- Año del vehículo (más antiguo = más económico)
- Marca y modelo
- Uso: particular o comercial
- Ciudad de registro
- Historial del conductor
- Valor comercial del vehículo

## PROCESO DE COTIZACIÓN
Cuando el usuario quiera cotizar, solicita AMABLEMENTE estos datos uno a la vez:
1. Nombre completo
2. Número de WhatsApp
3. Marca y modelo del vehículo
4. Año del vehículo
5. Uso principal (particular/comercial)
6. Ciudad donde vive
7. ¿Ha tenido accidentes en los últimos 3 años?

Con esos datos, calcula una cotización personalizada y muestra los 3 planes.
Ajustes de precio:
- +10% si el vehículo es mayor a 10 años
- +15% si el uso es comercial
- +5% si tuvo accidentes recientes
- -5% si el vehículo es modelo 2020 o más nuevo

Al finalizar la cotización, di: "¡Perfecto! Un asesor de Don Segurito se comunicará contigo por WhatsApp en menos de 24 horas. 🤠"

## REGLAS
- Sé cálido, profesional y con humor amigable
- Nunca presiones al cliente
- Explica claramente qué cubre y qué NO cubre cada plan
- Responde siempre en español peruano
- Usa emojis moderadamente
- Si preguntan algo que no sabes, dilo con honestidad`;

const TypingDots = () => (
  <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#c8a96e",
        animation: "bounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

const formatMessage = (text) => {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    line = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    line = line.replace(/\*(.*?)\*/g, "<em>$1</em>");
    if (line.startsWith("### ")) return <h3 key={i} style={{ margin: "8px 0 4px", fontSize: "0.95rem", color: "#c8a96e" }}>{line.slice(4)}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} style={{ margin: "10px 0 4px", fontSize: "1rem", color: "#e8d5a3" }}>{line.slice(3)}</h2>;
    if (line.startsWith("- ")) return <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>• {line.slice(2)}</div>;
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <div key={i} dangerouslySetInnerHTML={{ __html: line }} />;
  });
};

export default function App() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "¡Buenas! 👋 Soy **Don Segurito**, tu agente de confianza en seguros vehiculares en Perú 🇵🇪\n\nCon Don Segurito puedes:\n- 📋 **Cotizar** el seguro ideal para tu auto o camioneta\n- ❓ **Resolver** todas tus dudas sobre coberturas\n- 🔍 **Comparar** nuestros planes en soles\n\n¡Cuéntame, en qué te puedo ayudar hoy!",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.find((b) => b.type === "text")?.text || "Lo siento, hubo un error. ¿Puedes repetir tu pregunta?";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Hubo un problema de conexión. Por favor intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickOptions = ["Quiero cotizar mi seguro", "¿Qué cubre el plan Premium?", "¿Cuánto cuesta el plan básico?", "¿Cubren robo en Lima?"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0d1117 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", padding: "20px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c8a96e44; border-radius: 2px; }
        textarea:focus { outline: none; }
        .quick-btn:hover { background: #c8a96e22 !important; border-color: #c8a96e !important; transform: translateY(-1px); }
        .send-btn:hover { background: #b8923e !important; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 680, marginBottom: 16, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 4 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #c8a96e, #8b6914)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, boxShadow: "0 0 20px #c8a96e44",
          }}>🤠</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", color: "#e8d5a3", margin: 0 }}>Don Segurito</h1>
        </div>
        <p style={{ color: "#8a9bb5", fontSize: "0.82rem", margin: 0, fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Tu agente de confianza en seguros vehiculares · Perú 🇵🇪
        </p>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c8a96e55, transparent)", marginTop: 14 }} />
      </div>

      <div style={{
        width: "100%", maxWidth: 680,
        background: "#0d1117ee", border: "1px solid #c8a96e33", borderRadius: 16,
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px #00000088, 0 0 40px #c8a96e11",
        overflow: "hidden", maxHeight: "70vh",
      }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 10px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
              {msg.role === "assistant" && (
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, #c8a96e, #8b6914)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2,
                }}>🤠</div>
              )}
              <div style={{
                maxWidth: "78%",
                background: msg.role === "user" ? "linear-gradient(135deg, #c8a96e, #a07830)" : "#1a2035",
                color: msg.role === "user" ? "#0d1117" : "#d4c5a9",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "10px 14px", fontSize: "0.9rem", lineHeight: 1.55,
                fontFamily: "'Lato', sans-serif",
                border: msg.role === "assistant" ? "1px solid #c8a96e22" : "none",
                boxShadow: msg.role === "user" ? "0 4px 12px #c8a96e33" : "0 2px 8px #00000044",
              }}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #c8a96e, #8b6914)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>🤠</div>
              <div style={{ background: "#1a2035", border: "1px solid #c8a96e22", borderRadius: "16px 16px 16px 4px", padding: "10px 16px" }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div style={{ padding: "0 20px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickOptions.map((opt, i) => (
              <button key={i} className="quick-btn" onClick={() => setInput(opt)} style={{
                background: "transparent", border: "1px solid #c8a96e55",
                color: "#c8a96e", borderRadius: 20, padding: "5px 12px",
                fontSize: "0.78rem", cursor: "pointer", fontFamily: "'Lato', sans-serif", transition: "all 0.2s",
              }}>{opt}</button>
            ))}
          </div>
        )}

        <div style={{ padding: "12px 16px", borderTop: "1px solid #c8a96e22", background: "#080c14", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Escribe tu pregunta o pide una cotización..."
            rows={1}
            style={{
              flex: 1, background: "#1a2035", border: "1px solid #c8a96e33",
              borderRadius: 10, padding: "10px 14px", color: "#d4c5a9",
              fontSize: "0.9rem", fontFamily: "'Lato', sans-serif", resize: "none", lineHeight: 1.4, transition: "border-color 0.2s",
            }}
            onFocus={(e) => e.target.style.borderColor = "#c8a96e88"}
            onBlur={(e) => e.target.style.borderColor = "#c8a96e33"}
          />
          <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()} style={{
            background: "linear-gradient(135deg, #c8a96e, #a07830)", border: "none", borderRadius: 10,
            width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18, flexShrink: 0, transition: "all 0.2s", boxShadow: "0 4px 12px #c8a96e44",
          }}>➤</button>
        </div>
      </div>

      <p style={{ color: "#3a4a5c", fontSize: "0.72rem", marginTop: 12, fontFamily: "'Lato', sans-serif" }}>
        Don Segurito • Precios referenciales en S/. • Sujeto a verificación
      </p>
    </div>
  );
}