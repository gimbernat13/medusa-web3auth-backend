import { Router } from "express";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken"; //TODO: Import only necessary parts of jwt
import cors from "cors";
import * as bodyParser from "body-parser";
import { authenticate, ConfigModule } from "@medusajs/medusa";
import { getConfigFile } from "medusa-core-utils";
import { attachStoreRoutes } from "./routes/store";
import { attachAdminRoutes } from "./routes/admin";

dotenv.config();

export default (rootDirectory: string): Router | Router[] => {
  // Read currently-loaded medusa config
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;

  // Set up our CORS options objects, based on config
  // const storeCorsOptions = {
  //   origin: projectConfig.store_cors.split(","),
  //   credentials: true,
  // };

  const storeCorsOptions = {
    // TODO: ONLY IN DEV MODE NOT SECURE!!!!!!!
    origin: "*", // Allow all origins
    credentials: true,
  };

  const adminCorsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };
  const corsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  };

  // Set up express router
  const router = Router();

  // Set up root routes for store and admin endpoints, with appropriate CORS settings
  router.use("/store", cors(storeCorsOptions), bodyParser.json());
  router.use("/admin", cors(adminCorsOptions), bodyParser.json());

  // Add authentication to all admin routes *except* auth and account invite ones
  router.use(/\/admin\/((?!auth)(?!invites).*)/, authenticate());

  // Set up routers for store and admin endpoints
  const storeRouter = Router();
  const adminRouter = Router();

  // Attach these routers to the root routes
  router.use("/store", storeRouter);
  router.use("/admin", adminRouter);

  // Attach custom routes to these routers
  attachStoreRoutes(storeRouter);
  attachAdminRoutes(adminRouter);

  router.get("/store/nonce", cors(storeCorsOptions), (req, res) => {
    const nonce = Math.floor(1000 + Math.random() * 9000);
    console.log("✅ Nonce : ", nonce);
    res.json(nonce);
  });

  router.post("/store/verify", function (req, res) {
    // const { signature, message } = req.body;

    // Check if the necessary parameters are present
    // if (!signature || !message) {
    //   return res
    //     .status(400)
    //     .json({ status: "error", message: "Missing required parameters." });
    // }

    // You can add your business logic here. For now, it will just return status 'ok'.
    console.log("req body ", req.body);
    // return res.json("Hola putas");
    return res.status(200).json({
      status: "ok",
    });
  });

  return router;
};
