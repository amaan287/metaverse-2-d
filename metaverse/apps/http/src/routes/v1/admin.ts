import { Router } from "express";
import client from "@repo/db/client";
import { adminMiddleware } from "../../middleware/admin";
import {
  CreateAvatarSchema,
  CreateElementSchema,
  CreateMapSchema,
} from "../../types";
export const adminRouter = Router();
adminRouter.use(adminMiddleware);
adminRouter.post("/elements", async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation failed");
    return;
  }
  const element = await client.element.create({
    data: {
      width: parsedData.data.width,
      height: parsedData.data.height,
      static: parsedData.data.static,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.status(200).json({ id: element.id });
});
adminRouter.put("/elements/:elementId", async (req, res) => {
  const parsedData = CreateElementSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation failed");
    return;
  }
  const element = await client.element.update({
    where: { id: req.params.elementId },
    data: {
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.status(200).json({ id: element.id });
});
adminRouter.post("/avatar", async (req, res) => {
  const parsedData = CreateAvatarSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation failed");
    return;
  }
  const avatar = await client.avatar.create({
    data: {
      name: parsedData.data.name,
      imageUrl: parsedData.data.imageUrl,
    },
  });
  res.status(200).json({ id: avatar.id });
});
adminRouter.post("/map", async (req, res) => {
  const parsedData = CreateMapSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(400).json("Validation failed");
    return;
  }
  const map = await client.map.create({
    data: {
      thumbnail: parsedData.data.thumbnail,
      width: parseInt(parsedData.data.dimensions.split("x")[0]),
      height: parseInt(parsedData.data.dimensions.split("y")[1]),
      name: parsedData.data.name,
      mapElements: {
        create: parsedData.data.defaultElements.map((element) => ({
          elementId: element.elementId,
          x: element.x,
          y: element.y,
        })),
      },
    },
  });
  res.status(200).json({ id: map.id });
});
