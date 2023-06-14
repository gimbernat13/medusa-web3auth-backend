import { Router } from "express";
import * as dotenv from "dotenv";
import * as jwt from "jsonwebtoken"; //TODO: Import only necessary parts of jwt
import { projectConfig } from "../../medusa-config";
import cors from "cors";

dotenv.config();
const corsOptions = {
  origin: projectConfig.store_cors.split(","),
  credentials: true,
};

export default (rootDirectory: string): Router | Router[] => {
  const router = Router();
  const jwtSecret = process.env.JWT_SECRET;

  router.use(cors(corsOptions));

  // Define your custom route
  router.get("/nonce", (req, res) => {
    const nonce = new Date().getTime();
    const address = req.query.address;

    const tempToken = jwt.sign({ nonce, address }, jwtSecret, {
      expiresIn: "1660s",
    });
    const message = getSignMessage(address, nonce);
    res.json({ tempToken, message });
  });

  router.post("/verify", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const tempToken = authHeader && authHeader.split(" ")[1];

    if (tempToken === null) return res.sendStatus(403);

    interface JwtPayload {
      nonce: string;
      address: string;
    }
    const userData = (await jwt.verify(tempToken, jwtSecret)) as JwtPayload;

    const nonce = userData.nonce;

    res.json({ message: "😎 User Nonce is : ", nonce: nonce });
    const address = userData.address;
    const message = getSignMessage(address, nonce);
    const signature = req.query.signature;

    // const verifiedAddress = await web3.eth.accounts.recover(message, signature);
    const verifiedAddress = "mierda";

    if (verifiedAddress.toLowerCase() == address.toLowerCase()) {
      const token = jwt.sign({ verifiedAddress }, jwtSecret, {
        expiresIn: "1d",
      });
      res.json({ token });
    } else {
      res.sendStatus(403);
    }
  });

  const getSignMessage = (address, nonce) => {
    return `Please sign this message for address ${address}:\n\n${nonce}`;
  };
  return router;
};
