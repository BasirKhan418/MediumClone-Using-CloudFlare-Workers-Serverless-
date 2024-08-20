import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { BlogSchema } from "@basirkhan/common-medium";
import { UpdateBlogSchema } from "@basirkhan/common-medium";
import { decode, sign, verify } from 'hono/jwt'
export const BlogRouter = new Hono<{
    Bindings:{
        DATABASE_URL :string
        JWT_SECRET:string
    }
}> ();

//ROUTES
BlogRouter.use("*",async(c,next)=>{
    let token   = c.req.header("Authorization") || "";
    try{
        let decoded = await verify(token,c.env.JWT_SECRET);
        if(!decoded){
           
            return c.json({
                message:"Invalid token unautorized access"
            })
        }
        await next();
    }
    catch(err){
        return c.json({
            message:"error occured or  "+err
        })
    }
})
BlogRouter.get("/",(c)=>{
    return c.json({
        message:"Blog Router working fine"
    })
})
//post blog
BlogRouter.post("/",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
let blogData = await c.req.json();
try{
let data = BlogSchema.safeParse(blogData);
if(!data.success){
    return c.json({
        message:"Invalid data"
    })
}
let blog = await prisma.post.create({
    data:{
        title:data.data.title,
        content:data.data.content,
        authorid:data.data.authorid
    }
})
return c.json({
    message:"Blog created successfully",
    data:blog
})
}
catch(err){
    return c.json({
        message:"error occured or  "+err
    })
}
})
BlogRouter.put("/",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
let blogData = await c.req.json();
try{
let data = UpdateBlogSchema.safeParse(blogData);
if(!data.success){
    return c.json({
        message:"Invalid data"
    })
}
let blog = await prisma.post.update({
    where:{
        id:data.data.id,
    },
    data:{
        title:data.data.title,
        content:data.data.content,
        published:data.data.published
    }
})
return c.json({
    message:"Blog updated successfully",
    data:blog
})
}
catch(err){
    return c.json({
        message:"error occured or  "+err
    })
}
})
//get bulk
BlogRouter.get("/bulk",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try{
    let alldata = await prisma.post.findMany();
    return c.json({
        message:"All blogs",
        data:alldata
    })
    }
    catch(err){
        return c.json({
            message:"error occured or  "+err
        })
    }
})
//get by id
BlogRouter.get("/:id",async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    let id = c.req.param("id");
    try{
    let blog = await prisma.post.findFirst({
        where:{
            id:id
        }
    })
    if(!blog){
        return c.json({
            message:"Blog not found"
        })
    }
    return c.json({
        message:"Blog found",
        data:blog
    })
    }
    catch(err){
        return c.json({
            message:"error occured or  "+err
        })
    }
})
