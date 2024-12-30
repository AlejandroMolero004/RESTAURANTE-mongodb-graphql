import { MongoClient } from "mongodb";
import { camarerodb, comensaldb, mesasdb } from "./types.ts";
import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "npm:@apollo/server@4.1/standalone";
const MONGO_URL=Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  Deno.exit(0)
}
const client= new MongoClient(MONGO_URL)
await client.connect()

const db=client.db("restaurante")

const coleccioncomensales=db.collection<comensaldb>("comensales")
const coleccioncamareros=db.collection<camarerodb>("camareros")
const coleccionmesas=db.collection<mesasdb>("mesas")

const server=new ApolloServer({
    typeDefs:schema,resolvers
})

const{url}=await startStandaloneServer(server,{
  context:async()=>(await {
    coleccioncomensales,
    coleccioncamareros,
    coleccionmesas
  }),
    listen:{port:8000},
})

console.log(url)