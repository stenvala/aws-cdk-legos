using System;
using Amazon;
using Amazon.S3;

namespace Amis.Utils
{
    public interface IS3
    {
        AmazonS3Client GetClient();
        string GetBucketName();
    }

    public class MinioClient : IS3
    {
        private static AmazonS3Client client;

        public MinioClient()
        {
            var config = new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.USEast1, // MUST set this before setting ServiceURL and it should match the `MINIO_REGION` environment variable.
                ServiceURL = "http://localhost:8002", // replace http://localhost:9000 with URL of your MinIO server
                ForcePathStyle = true // MUST be true to work correctly with MinIO server
            };
            client = new AmazonS3Client("admin", "password", config);
        }

        public AmazonS3Client GetClient()
        {
            return client;
        }

        public string GetBucketName()
        {
            // This should come from env / appsettings
            return "amis";
        }
    }
}
