// Punto de entrada para Vercel: exporta la app de Express ya configurada
// (rutas + middlewares montados en app.ts) en vez de llamar app.listen(),
// que no aplica en un runtime serverless.
import app from "../src/app.js";

export default app;
