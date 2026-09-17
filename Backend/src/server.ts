import app from "./app.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const PORT = process.env.PORT ?? 3000;
    
app.use(routes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});