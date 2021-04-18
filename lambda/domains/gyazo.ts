import fetch from "node-fetch";
import FormData from 'form-data'
import { createReadStream } from "fs";
import ENVIRONMENTS from "../utils/env";

type gyazoApiResponse = {
  image_id: string;
  permalink_url: string;
  thumb_url: string;
  url: string;
  type: string;
};

const uploadImage = async (imagePath: string): Promise<gyazoApiResponse> => {
  const formData = new FormData()
  formData.append("access_token", ENVIRONMENTS.GYAZO_TOKEN)
  formData.append("imagedata", createReadStream(imagePath))

  const response = await fetch("https://upload.gyazo.com/api/upload", {
    method: "POST",
    body: formData,
    headers: formData.getHeaders()
  });

  return response.json();
};

export default uploadImage;
