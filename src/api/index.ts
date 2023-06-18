import { Router } from "express";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken"; //TODO: Import only necessary parts of jwt
import cors from "cors";
import * as bodyParser from "body-parser";
import { authenticate, ConfigModule } from "@medusajs/medusa";
import { getConfigFile } from "medusa-core-utils";
import { attachStoreRoutes } from "./routes/store";
import { attachAdminRoutes } from "./routes/admin";
const ethers = require("ethers");

dotenv.config();

export default (rootDirectory: string): Router | Router[] => {
  // Read currently-loaded medusa config
  const { configModule } = getConfigFile<ConfigModule>(
    rootDirectory,
    "medusa-config"
  );
  const { projectConfig } = configModule;

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
    const nonce = Math.floor(1000 + Math.random() * 90000);
    console.log("✅ Nonce : ", nonce);
    res.json(nonce);
  });

  router.post("/store/verify", async function (req, res) {
    const { signature, message, userAddress } = req.body;
    console.log("🚧 Verifying message:", req.body);
    console.log("🚧 Verifying sig:", signature);
    console.log("🚧 Verifying Address:", userAddress);
    const email = "mierda@gmail.com";
    const customerService = req.scope.resolve("customerService");
    const manager = req.scope.resolve("manager");

    let customer = await customerService
      .retrieveRegisteredByEmail(email)
      .catch(() => null);

    console.log("customer", customer);

    if (!customer) {
      res.status(404).json({
        message: `Customer with ${email} was not found. Please sign up instead.`,
      });
    }

    if (!customer) {
      customer = await customerService.withTransaction(manager).create({
        email,
        first_name: "--",
        last_name: "--",
        has_account: true,
      });
    }

    try {
      return res.status(200).json({
        status: "ok",
        // signingAddress,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "An error occurred during verification.",
        error: error.toString(),
      });
    }
  });

  return router;
};
