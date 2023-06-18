import {
  CustomerService,
  EventBusService,
  TransactionBaseService,
} from "@medusajs/medusa";
import { MedusaError } from "medusa-core-utils";
import { EntityManager } from "typeorm";
import jwt from "jsonwebtoken";
const ethers = require("ethers");

class Web3LoginService extends TransactionBaseService {
  //   protected manager_: EntityManager;
  //   protected transactionManager_: EntityManager;
  private readonly customerService_: CustomerService;
  private readonly eventBus_: EventBusService;
  private readonly configModule_: any;
  private readonly jwt_secret: any;

  constructor(container) {
    super(container);
    this.eventBus_ = container.eventBusService;
    this.customerService_ = container.customerService;
    this.configModule_ = container.configModule;

    const {
      projectConfig: { jwt_secret },
    } = this.configModule_;
    this.jwt_secret = jwt_secret;
  }

  verifyMessage = async ({ message, address, signature }) => {
    try {
      const signerAddr = await ethers.utils.verifyMessage(message, signature);
      if (signerAddr !== address) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  async validateSignature(message, signature) {
    console.log("🚧 Validating Signature");
    const customer = await this.customerService_
      .retrieveRegisteredByEmail("caca@gmail.com")
      //   .retrieveRegisteredByEmail(decoded.email)
      .catch(() => null);

    if (!customer) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `There isn't a customer with email ${"decoded.email"}.`
      );
    }
    console.log("😎 Customer is ", customer);
    return customer;
  }
}

export default Web3LoginService;
