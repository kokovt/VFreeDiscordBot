import { ROUTER } from "../server";
import MONGODBCLIENT from "..";


export default function getMembers() {
    ROUTER.get("/getMembers", async (req, res) => {
        const MEMBERS_COLLECTION = MONGODBCLIENT.db("vfree").collection("vfree_members");
        const entries = await MEMBERS_COLLECTION.find({}).toArray();
        
        res.send(entries);
    });
}