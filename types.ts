import { ObjectId } from "mongodb";

export type comensaldb={
    _id?:ObjectId
    nombre:string
    email:string
}
export type mesasdb={
    _id?:ObjectId
    asientos:number
    comensales:ObjectId[]
    camarero:ObjectId|null
}
export type camarerodb={
    _id?:ObjectId
    nombre:string
    email:string
    mesas:ObjectId[]
}
export type comensal={
    id:string
    nombre:string
    email:string
}
export type mesas={
    id:string
    asientos:number
    comnesales:comensaldb[]
    camarero:string
}
export type camarero={
    id:string
    nombre:string
    email:string
    mesas:mesasdb[]
}