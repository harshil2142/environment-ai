const generateS3FileUrl = ({
  s3BucketName,
  s3KeyName,
}: {
  s3BucketName: any;
  s3KeyName: any;
}) => {
  return `https://${s3BucketName}.s3.amazonaws.com/${s3KeyName}`;
};

export default generateS3FileUrl;
