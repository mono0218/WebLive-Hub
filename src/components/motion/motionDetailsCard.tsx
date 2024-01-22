"use client"
import {Button, Link} from "@nextui-org/react";
import React, {useEffect, useState} from "react";
import {Image} from "@nextui-org/react"
import {getSession} from "next-auth/react";
import {router} from "next/client";
import {useRouter} from "next/navigation";

export type MotionDetailsType ={
    uuid:string;
    name:string;
    content:string;
    license:string;
    imageUrl:string;

    userId:number;
    username:number
}
export default function MotionDetailsCard(data:MotionDetailsType){
    const {push} = useRouter()
    const [isAuthor,setisAuthor] = useState(false)

    useEffect( () => {
        (async()=>{
            const session = await getSession()
            if(Number(session.user.id) === data.userId){
                setisAuthor(true)
            }
        })()
    }, []);

    const onDelete = async ()=>{
        const result = await fetch(`/api/motion/${data.uuid}`,{
            method:"DELETE"
        })

        if(result.status === 200){
            push("/")
        }
    }

    return(
        <>
            <div className="flex flex-col">
                <Image src={`https://live-image.monodev.cloud/${data.imageUrl}`} className="w-max items items-center"></Image>

                <div className="flex justify-between">
                    <div>
                        <p className="pt-6 text-2xl font-bold p-1">{data.name}</p>
                        <p className="pt-6 text-xl p-1">{data.content}</p>
                    </div>

                    <div className="flex flex-col gap-6 ml-10">
                        <p className="pt-6 text-base font-bold">ライセンス:<br/>{data.license}</p>
                        <Link href={`/users/${data.userId}`}>
                            <p className="pt-4 text-base font-bold">投稿者:<br/>{data.username}</p>
                        </Link>
                        <Button color="primary">ステージのIDをコピーする</Button>
                        {isAuthor?(<Button color="danger" onClick={onDelete}>このステージを削除する</Button>):(<></>)}
                    </div>
                </div>
            </div>
        </>
    )
}