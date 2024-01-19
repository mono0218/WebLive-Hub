import {NextRequest, NextResponse} from "next/server"
import {userDB} from "@/lib/db/user";
import {useParams} from "next/navigation";
import {getServerSession} from "next-auth/next";
import {options} from "../../../../../auth.config";

export async function GET(req:NextRequest,{ params }: { params: { id: string } }) {
    const userdb = new userDB()
    const result = await userdb.Get({id:Number(params.id)})

    if (result != null){
        return NextResponse.json(result, { status: 200 })
    }else{
        return NextResponse.json({message:"NotFound"},{status:404})
    }
}

export async function PUT(req:NextRequest,{params}: {params:{id:string}}){
    const session = await getServerSession(options)

    if(!session){
        return NextResponse.json({message:"Unauthorized"},{status:401})
    }else if (params.id != session.user.id){
        return NextResponse.json({message:"Forbidden"},{status:403})
    }else if(params.id === session.user.id){
        const userdb = new userDB()
        const json = await req.json()

        const result = await userdb.Update({
            id:session.user.id,
            name:session.user.name,
            iconUrl: session.user.image,
            content:json.content
        })
    }
}