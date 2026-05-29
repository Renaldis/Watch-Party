import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";
import { createRoomCode } from "@/lib/utils";

async function createUniqueRoomCode() {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = createRoomCode();
    const existingRoom = await prisma.room.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!existingRoom) {
      return code;
    }
  }

  throw new Error("Could not create a unique room code.");
}

export async function POST(request: Request) {
  const session = await getServerSession(request.headers);

  if (!session?.user) {
    return NextResponse.json({ message: "Please sign in before creating a room." }, { status: 401 });
  }

  const code = await createUniqueRoomCode();
  const room = await prisma.room.create({
    data: {
      code,
      ownerId: session.user.id,
    },
    select: {
      code: true,
    },
  });

  return NextResponse.json(room, { status: 201 });
}
