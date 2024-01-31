import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "../../../../../auth.config";
import { getBuffer } from "@/lib/common/getBuffer";
import { ImageStorage } from "@/lib/common/imageStorage";
import { motionDB } from "@/lib/motion/motionDB";
import { StageDB } from "@/lib/stage/stageDB";
import { v4 as uuidv4 } from "uuid";
import { MotionStorage } from "@/lib/motion/motionStorage";

const db = new motionDB();
const fileStorage = new MotionStorage();
const imageStorage = new ImageStorage();

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);
  const formData = await req.formData();

  type Props = {
    name: string;
    content: string;
    image: File;
    file: File;
    license: string;
    userId: number;
  };

  if (!session) {
    //認証がされていない場合
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } else {
    const uuid: string = uuidv4();

    //formDataをPropsに変換
    const data: Props = {
      name: formData.get("name") as string,
      content: formData.get("content") as string,
      image: formData.get("image") as File,
      file: formData.get("file") as File,
      license: formData.get("license") as string,
      userId: Number(session.user.id as string),
    };

    //FileをBufferへ
    const fileBuffer: Buffer = await getBuffer(data.file);
    const imageBuffer: Buffer = await getBuffer(data.image);

    //BufferをR2へ
    try {
      await fileStorage.create({
        uuid: uuid,
        buffer: fileBuffer,
      });

      await imageStorage.create({
        uuid: uuid,
        buffer: imageBuffer,
      });
    } catch {
      return NextResponse.json(
        { message: "R2 Storage Error" },
        { status: 500 },
      );
    }

    //DataBaseへの挿入データを作成
    const dbData: StageDB = {
      uuid: uuid,
      name: data.name,
      content: data.content,
      imageUrl: `image/${uuid}/${uuid}.png`,
      fileUrl: `motion/${uuid}/${uuid}.glb`,
      license: data.license,
      userId: data.userId,
    };

    //DataBaseへ挿入
    try {
      await db.Create(dbData);
      return NextResponse.json(
        { message: "Success Created", uuid: uuid },
        { status: 200 },
      );
    } catch {
      return NextResponse.json({ message: "Database Error" }, { status: 500 });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const count = searchParams.get("count");

  if (count === null) {
    return NextResponse.json({ message: "count is required" }, { status: 400 });
  }

  try {
    const result = await db.CountGet({ pieces: Number(count) });
    return NextResponse.json({ data: result }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}