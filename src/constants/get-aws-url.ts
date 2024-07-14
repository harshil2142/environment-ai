import AmazonS3URI from "amazon-s3-uri";
import AWS from "aws-sdk";

AWS.config.logger = console;

const getSignedUrl = ({
  bucketName,
  prefixPath,
}: {
  bucketName: any;
  prefixPath: any;
}) => {
  AWS.config.update({
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    region: process.env.NEXT_PUBLIC_AWS_REGION,
  });
  const s3 = new AWS.S3();
  const params = {
    Bucket: bucketName,
    Key: prefixPath,
    Expires: 86400, // Expiration time in seconds (e.g., 24 hour)
  };

  const url = s3.getSignedUrl("getObject", params);

  return url;
};

const getS3File = (url: string) => {
  AWS.config.update({
    signatureVersion: "v4",
    region: process.env.NEXT_PUBLIC_AWS_REGION,
  });
  if(url){
    const { bucket, key } = AmazonS3URI(url);
  console.log(url,"url")
    const newUrl = url
      ? getSignedUrl({ bucketName: bucket, prefixPath: key })
      : undefined;
  
    return newUrl;
  }
};

export default getS3File;
