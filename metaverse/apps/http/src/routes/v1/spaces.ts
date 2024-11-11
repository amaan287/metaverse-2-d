import { Router } from "express";
import { CreateSpaceSchema } from "../../types";
import client from "@repo/db/client";
import { userMiddleware } from "../../middleware/user";
export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
  console.log("space post endpoint");
  const parsedData = CreateSpaceSchema.safeParse(req.body);
  if (!parsedData.success) {
    console.log(JSON.stringify(parsedData));
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  if (!parsedData.data.mapId) {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: parseInt(parsedData.data.dimensions.split("x")[0]),
        height: parseInt(parsedData.data.dimensions.split("x")[1]),
        creatorId: req.userId!,
      },
    });
    res.json({ spaceId: space.id });
    return;
  }

  const map = await client.map.findFirst({
    where: {
      id: parsedData.data.mapId,
    },
    select: {
      mapElements: true,
      width: true,
      height: true,
    },
  });
  console.log("after");
  if (!map) {
    res.status(400).json({ message: "Map not found" });
    return;
  }
  console.log("map.mapElements.length");
  console.log(map.mapElements.length);
  let space = await client.$transaction(async () => {
    const space = await client.space.create({
      data: {
        name: parsedData.data.name,
        width: map.width,
        height: map.height,
        creatorId: req.userId!,
      },
    });

    await client.spaceElements.createMany({
      data: map.mapElements.map((e) => ({
        spaceId: space.id,
        elementId: e.elementId,
        x: e.x!,
        y: e.y!,
      })),
    });

    return space;
  });
  console.log("space crated");
  res.json({ spaceId: space.id });
});

spaceRouter.delete("/:spaceId", (req, res) => {});
spaceRouter.get("/:spaceId", (req, res) => {});
spaceRouter.get("/all", (req, res) => {});
spaceRouter.post("/element", (req, res) => {});
spaceRouter.delete("/element", (req, res) => {});
