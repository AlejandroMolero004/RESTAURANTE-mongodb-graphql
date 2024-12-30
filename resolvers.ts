import { Collection,ObjectId } from "mongodb";
import { camarerodb, comensaldb, mesasdb } from "./types.ts";


type context={
    coleccioncomensales:Collection<comensaldb>,
    coleccioncamareros:Collection<camarerodb>,
    coleccionmesas:Collection<mesasdb>
}
export const resolvers={

    Query:{
        getcomensales:async(_:unknown,__:unknown,context:context):Promise<comensaldb[]>=>{
            return await context.coleccioncomensales.find().toArray()
        },
        getcamareros:async(_:unknown,__:unknown,context:context):Promise<camarerodb[]>=>{
            return await context.coleccioncamareros.find().toArray()
        },
        getmesas:async(_:unknown,__:unknown,context:context):Promise<mesasdb[]>=>{
            return await context.coleccionmesas.find().toArray()
        }    
    },
    Mutation:{
        addcomensal:async(_:unknown,args:{nombre:string,email:string},context:context):Promise<comensaldb|null>=>{
            const comensaldb=await context.coleccioncomensales.findOne({email:args.email})
            if(comensaldb) return null
            const{insertedId}=await context.coleccioncomensales.insertOne({
                nombre:args.nombre,
                email:args.email
            })
            return {
                _id:insertedId,
                nombre:args.nombre,
                email:args.email
            }
        },
        addcamarero:async(_:unknown,args:{nombre:string,email:string},context:context):Promise<camarerodb|null>=>{
            const camarerodb=await context.coleccioncamareros.findOne({email:args.email})
            if(camarerodb) return null
            const{insertedId}=await context.coleccioncamareros.insertOne({
                nombre:args.nombre,
                email:args.email,
                mesas:[]
            })
            return {
                _id:insertedId,
                nombre:args.nombre,
                email:args.email,
                mesas:[]
            }
        },
        addmesa:async(_:unknown,args:{comensales:string[],camarero:string},context:context):Promise<mesasdb|null>=>{
            const comensales=await context.coleccioncomensales.find({_id:{$in:args.comensales.map((id)=>new ObjectId(id))}}).toArray()
            if(!comensales){
                return null
            }
            const camarero=await context.coleccioncamareros.findOne({_id:new ObjectId(args.camarero)})
            if(!camarero) return null

            const {insertedId}=await context.coleccionmesas.insertOne({
                asientos:comensales.length,
                comensales:comensales.map((c)=>new ObjectId(c._id)),
                camarero:camarero._id
            })
            const{modifiedCount}=await context.coleccioncamareros.updateOne(
                {_id:new ObjectId(args.camarero)},
                {$push:{mesas:insertedId}}
            )
            if(modifiedCount===0){
                console.log("mesa no modificada")
                return null
            }
            return {
                _id:insertedId,
                asientos:comensales.length,
                comensales:comensales.map((c)=>new ObjectId(c._id)),
                camarero:camarero._id
            }
           
        },
        deletecomensal: async ( _: unknown,args: { email: string },context: context): Promise<boolean> => {
            // Buscar el comensal por email
            const comensaldb = await context.coleccioncomensales.findOne({ email: args.email });
            if (!comensaldb) return false;
        
            // Eliminar el comensal de la colección de comensales
            const { deletedCount } = await context.coleccioncomensales.deleteOne({ email: args.email });
            if (deletedCount === 0) return false;
            console.log("Comensal eliminado de coleccioncomensales.");
        
            // Buscar la mesa que contiene al comensal
            const mesa = await context.coleccionmesas.findOne({
                comnesales: comensaldb._id // O usa $elemMatch si es un array de objetos.
            });
            if (!mesa) {
                console.log("No se encontró ninguna mesa con este comensal.");
                return true; // No hay mesas que actualizar
            }
            console.log("Mesa encontrada, eliminando comensal del array comnesales.");
            // Eliminar al comensal del array `comnesales` en la mesa
            const { modifiedCount } = await context.coleccionmesas.updateOne(
                { _id: mesa._id },
                { $pull: { comnesales: comensaldb._id } } // O ajusta según la estructura.
            );
        
            if (modifiedCount === 0) {
                console.log("No se pudo eliminar el comensal del array comnesales.");
                return false;
            }
        
            console.log("Comensal eliminado del array comnesales en la mesa.");
            return true;
        },
        deletecamarero:async(_:unknown,args:{email:string},context:context):Promise<boolean>=>{
            const camarero=await context.coleccioncamareros.findOne({email:args.email})
            if(!camarero) return false
            const{deletedCount}=await context.coleccioncamareros.deleteOne(
                {email:camarero.email}
            )
            if(deletedCount===0) return false
            const mesa=await context.coleccionmesas.findOne({camarero:camarero._id})
            if(!mesa) return false
            const id=camarero._id
            console.log(mesa)
            await context.coleccionmesas.updateMany(
                {camarero:id},
                { $set: { camarero: null} }
            )
            return true
        },
        deletemesa:async(_:unknown,args:{id:string},context:context):Promise<boolean>=>{
            const mesasdb=await context.coleccionmesas.findOne({_id:new ObjectId(args.id)})
            if(!mesasdb) return false
            const{deletedCount}=await context.coleccionmesas.deleteOne(
                {_id:new ObjectId(args.id)},
            )
            const camarero=await context.coleccioncamareros.findOne({mesas:mesasdb._id})
            if(!camarero) return false
            await context.coleccioncamareros.updateMany(
                {_id:camarero._id},
                {$pull:{mesas:mesasdb._id}}
            )
            return true
        },
        updatecomensal:async(_:unknown,args:{nombre:string,email:string},context:context):Promise<comensaldb|null>=>{
            const comensal=await context.coleccioncomensales.findOne({email:args.email})
            if(!comensal)return null
            const updatedcomensal={
                nombre:args.nombre??comensal.nombre,
                email:args.email??comensal.email
            }
            const{modifiedCount}=await context.coleccioncomensales.updateOne(
                {_id:comensal._id},
                {$set:updatedcomensal}
            )
            if(modifiedCount===0) return null

            return comensal
        },
        updatecamarero:async(_:unknown,args:{id:string,email:string,nombre:string},context:context):Promise<camarerodb|null>=>{
            const camarerodb=await context.coleccioncamareros.findOne({_id:new ObjectId(args.id)})
            if(!camarerodb)return null
            const newcamarero={
                nombre:args.nombre??camarerodb.nombre,
                email:args.email??camarerodb.email
            }
            const{modifiedCount}=await context.coleccioncamareros.updateOne(
                {_id:camarerodb._id},
                {$set:newcamarero}
            )
            if(modifiedCount===0)return null

            return camarerodb   
        },
        enrolledmesa:async(_:unknown,args:{emailcamarero:string,idmesa:string},context:context):Promise<boolean>=>{
            const camarero=await context.coleccioncamareros.findOne({email:args.emailcamarero})
            if(!camarero)return false
            const mesa=await context.coleccionmesas.findOne({_id:new ObjectId(args.idmesa)})
            if(!mesa)return false
            if(mesa.camarero)return false
            const{modifiedCount}=await context.coleccioncamareros.updateOne(
                {_id:camarero._id},
                {$push:{mesas:mesa._id}}
            )
            if(modifiedCount===0)return false
            const modifiedcountmesas=await context.coleccionmesas.updateOne(
                {_id:new ObjectId(args.idmesa)},
                {$set:{camarero:camarero._id}} 
            )
            if(modifiedcountmesas.modifiedCount===0)return false

            return true
            
        }
    },
    comensal:{
        _id:(parent:comensaldb):string=>{return parent._id!.toString()}
    },
    mesas: {
        _id: (parent: mesasdb): string => parent._id!.toString(),
    
        comensales: async (parent: mesasdb, __: unknown, ctx: context) => {
           
            return await ctx.coleccioncomensales
                .find({ _id: { $in: parent.comensales } })
                .toArray();
        },
    
        camarero: async (parent: mesasdb, __: unknown, ctx: context) => {
            return await ctx.coleccioncamareros.findOne({ _id: new ObjectId(parent.camarero!) });
        },
    },
}