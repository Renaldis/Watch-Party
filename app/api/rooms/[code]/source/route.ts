import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/session";

const sourceSchema = z.object({
  videoUrl: z.string().trim().url().max(2000),
  videoTitle: z.string().trim().max(120).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const session = await getServerSession(request.headers);

  if (!session?.user) {
    return NextResponse.json({ message: "Please sign in before setting a video source." }, { status: 401 });
  }

  const { code } = await params;
  const roomCode = code.toUpperCase();
  const payload = sourceSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json({ message: "Please enter a valid video URL." }, { status: 400 });
  }

  const room = await prisma.room.findUnique({
    where: { code: roomCode },
    select: { id: true },
  });

  if (!room) {
    return NextResponse.json({ message: "Room not found." }, { status: 404 });
  }

  const updatedRoom = await prisma.room.update({
    where: { code: roomCode },
    data: {
      videoUrl: payload.data.videoUrl,
      videoTitle: payload.data.videoTitle || null,
    },
    select: {
      videoUrl: true,
      videoTitle: true,
    },
  });

  return NextResponse.json(updatedRoom);
}
