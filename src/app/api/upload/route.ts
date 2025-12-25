import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    const { fileName, fileType } = req.body;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
    };
    try {
      const uploadURL = await s3.getSignedUrlPromise("putObject", params);
      res.status(200).json({ uploadURL });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error generating the upload URL" });
    }
  } else if (req.method === "PUT") {
    const { fileName } = req.body;
    console.log("fileName", fileName);

    const s3URL = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.status(200).json({ s3URL });
  } else if (req.method === "DELETE") {
    const { fileName } = req.body;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
    } as any;
    try {
      await s3.deleteObject(params).promise();
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Error deleting the file" });
    }
  } else {
    res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
