import express from "express";
import getMembers from "./server/getMembers";

const APP = express();
const PORT = 3001;
const ROUTER = express.Router();

export default function setup_express() {
  getMembers();
  APP.use('/', ROUTER);

  APP.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export { ROUTER };