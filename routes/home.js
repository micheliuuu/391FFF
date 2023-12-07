import express from "express";
import OpenAI, { toFile } from "openai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // This will store files in memory
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit of 5MB
});

router.post("/", upload.single("image"), async (req, res) => {
  const currentColor = req.body.currentColor;
  try {
    let buffer;
    if (req.file) {
      buffer = req.file.buffer;
    } else {
      return res.status(400).send("No image provided");
    }
    const file = await toFile(buffer);
    const result = await openai.images.edit({
      model: "dall-e-2",
      image: file,
      prompt: "A boy wearing a " + currentColor + " baseball hat on the head.",
      n: 1,
      size: "1024x1024",
    });
    return res.status(200).send(result.data[0].url);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Something went wrong");
  }
});

export default router;
