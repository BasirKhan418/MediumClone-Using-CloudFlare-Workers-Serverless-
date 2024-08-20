import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { SignInSchema,SignUpSchema } from "@basirkhan/common-medium";
import { decode, sign, verify } from 'hono/jwt'
export const UserRouter = new Hono<{
    Bindings:{
        DATABASE_URL:string
        JWT_SECRET:string
    }
}>()

UserRouter.get("/",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try{
     let alluser = await prisma.user.findMany()
        return c.json({
            message:"All users",
            data:alluser
        })
    }
    catch(err){
        return c.json({
            message:"error occured or  "+err
        })
    }
})
//signin route
UserRouter.post("/signin",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    //userdata
    const userData = await c.req.json()
    //try catch starts
    try{
     let data =  SignInSchema.safeParse(userData);
     if(!data.success){
            return c.json({
                message:"Invalid data"
            })
     }
     else{
        let user = await prisma.user.findFirst({
            where:{
                email:data.data.email,
                password:data.data.password
            }
        })
        if(!user){
            return c.json({
                message:"Invalid credentials"
            })
        }
        else{
            let token  = await sign({email:user.email,id:user.id},c.env.JWT_SECRET)
            return c.json({
                message:"Logged In successfully",token:token
            })
        }
     }
    }
    catch(err){
        return c.json({
            message:"error occured or  "+err
        })
    }
})
//signup route
UserRouter.post("/signup",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
let userData = await c.req.json();
try{
let safeData = SignUpSchema.safeParse(userData);
if(!safeData.success){
    return c.json({
        message:"Invalid data"
    })
}
else{
let data = await prisma.user.create({
    data:{
        email:safeData.data.email,
        password:safeData.data.password,
        name:safeData.data.name
    }
})
let token  = await sign({email:data.email,id:data.id},c.env.JWT_SECRET)
return c.json({
    message:"User created successfully",
    token:token
})
}
}
catch(err){
    return c.json({
        message:"error occured or  "+err
    })
}
})
