# 🤠 Don Segurito — Agente IA de Seguros Vehiculares (Perú)

Agente inteligente para cotizar y vender seguros de vehículos livianos en Perú.

## 🚀 Cómo publicar en Vercel (sin código)

### Paso 1 — Sube este proyecto a GitHub
1. Ve a github.com e inicia sesión
2. Crea un repositorio nuevo llamado `don-segurito`
3. Sube todos estos archivos

### Paso 2 — Conecta con Vercel
1. Ve a vercel.com e inicia sesión con GitHub
2. Clic en "Add New Project"
3. Selecciona el repositorio `don-segurito`
4. En "Environment Variables" agrega:
   - Name: `REACT_APP_ANTHROPIC_API_KEY`
   - Value: (tu API key de console.anthropic.com)
5. Clic en "Deploy" ✅

### Paso 3 — ¡Listo!
Vercel te dará una URL pública tipo `don-segurito.vercel.app`

## 📁 Estructura del proyecto
```
don-segurito/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx      ← El agente Don Segurito
│   └── index.js
├── package.json
└── README.md
```

## 🔑 Variables de entorno necesarias
| Variable | Descripción |
|---|---|
| `REACT_APP_ANTHROPIC_API_KEY` | Tu API Key de Anthropic |

## 💰 Costos estimados
- Vercel: **Gratis**
- Anthropic API: **~S/. 35-70/mes** según uso
- Dominio .pe: **~S/. 80/año** (opcional)