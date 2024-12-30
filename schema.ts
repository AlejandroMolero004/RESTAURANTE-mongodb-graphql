export const schema=`#graphql

    type comensal{
        _id:ID!
        nombre:String!
        email:String!
    }

    type mesas{
        _id:ID!
        asientos:Int!
        comensales:[comensal!]!
        camarero:camarero!
    }

    type camarero{
        _id:ID!
        nombre:String!
        email:String!
        mesas:[mesas!]!
    }

    type Query{
        getcomensales:[comensal!]!
        getcomensal(email:String!):comensal
        getcamareros:[camarero!]!
        getmesas:[mesas!]!
    }

    type Mutation{
        addcomensal(nombre:String!,email:String!):comensal
        addcamarero(nombre:String!,email:String!):camarero
        addmesa(comensales:[ID!],camarero:ID!):mesas
        deletecomensal(email:String!):Boolean
        deletecamarero(email:String!):Boolean
        deletemesa(id:ID!):Boolean
        updatecomensal(nombre:String,email:String):comensal
        updatecamarero(nombre:String,email:String,id:ID!):camarero
        enrolledmesa(emailcamarero:String!,idmesa:ID!):Boolean
    }






`
