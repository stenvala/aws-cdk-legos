import * as aws from "aws-sdk";

export async function lambdaHandler(event, context) {
  console.log(event);
  const docId = event.detail.docId;
  const s3 = new aws.S3();

  const listParams = {
    Bucket: process.env.bucketName,
    Prefix: docId,
  };

  const promise = new Promise((resolve, reject) => {
    s3.listObjects(listParams, (err, objects) => {
      if (err) {
        console.log("Error with list ", listParams, err);
        reject();
      } else {
        const promises = objects.Contents.map((i) => {
          console.log("Deleting " + i.Key);
          const params = {
            Bucket: process.env.bucketName,
            Key: i.Key,
          };
          return s3.deleteObject(params).promise();
        });
        Promise.all(promises).then((i) => resolve(true));
      }
    });
  });
  await promise;
  console.log(`All attachments for ${docId} deleted.`);
  return true;
}
