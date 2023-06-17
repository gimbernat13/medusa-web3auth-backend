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

  router.post("/store/verify", async function (req, res) {
    const { signature, message } = req.body;

    // Check if the necessary parameters are present
    // if (!signature || !message) {
    //   return res
    //     .status(400)
    //     .json({ status: "error", message: "Missing required parameters." });
    // }
    // You can add your business logic here. For now, it will just return status 'ok'.

    try {
      // Verify the signature using ethers.js
      // console.log("🚧 Verifying: ", signature, message);
      // const signingAddress = await ethers.utils.verifyMessage(
      //   "message",
      //   signature
      // );
      // console.log("📨 Address is ", signingAddress);

      // Your business logic goes here

      return res.status(200).json({
        status: "ok",
        signingAddress: "sorry i suck :( ",
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "An error occurred during verification.",
        error: error.toString(),
      });
    }

    // return res.json("Hola putas");
    return res.status(200).json({
      status: "ok",
    });
  });

  return router;
};
