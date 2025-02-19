const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swagger");
const inventoryRoutes = require("./routes/inventoryRoutes");
const incomingRoutes = require("./routes/incomingRoutes");
const outgoingRoutes = require("./routes/outgoingRoutes");
const eventRoutes = require("./routes/eventRoutes");
const pantriesRoutes = require("./routes/pantriesRoutes");
const profilesRoutes = require("./routes/profilesRoutes");
const subscriptionRoutes = require("./routes/subscriptionListRoute");
const pantryUserRoutes = require("./routes/pantryUserRoutes");
const requestRoutes = require("./routes/requestRoutes");
const financeRoutes = require("./routes/financeRoutes");
const mapRoutes = require("./routes/mapRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/inventory", inventoryRoutes);
app.use("/api/inventory/incoming", incomingRoutes);
app.use("/api/inventory/outgoing", outgoingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/pantries", pantriesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/pantry-users", pantryUserRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.APP_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
