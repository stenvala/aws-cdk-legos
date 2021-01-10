using System;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amis.DTO;

namespace Amis.Utils
{
    public interface IS3
    {
        IAmazonS3 GetClient();
        string GetBucketName();
        string GeneratePreSignedURLForPut(string key, GetPresignedUrlDTO dto);
        string GeneratePresignedURLForGet(string key, GetPresignedUrlDTO dto = null);
        Task<bool> DeleteFileAsync(string key);
    }

    abstract public class S3Base : IS3
    {
        public virtual IAmazonS3 GetClient()
        {
            throw new Exception("Not implemented");
        }        

        public string GetBucketName()
        {
            // This should come from env / appsettings
            return Environment.GetEnvironmentVariable("bucket") ?? "amis";            
        }

        public string GeneratePresignedURLForGet(string key, GetPresignedUrlDTO dto = null)
        {
            return GeneratePreSignedURL(key, HttpVerb.GET, dto);
        }

        public string GeneratePreSignedURLForPut(string key, GetPresignedUrlDTO dto)
        {
            return GeneratePreSignedURL(key, HttpVerb.PUT, dto);
        }

        private string GeneratePreSignedURL(string key, HttpVerb verb, GetPresignedUrlDTO dto = null)
        {
            double duration = 600;
            string urlString = "";
            try
            {
                GetPreSignedUrlRequest request = new GetPreSignedUrlRequest
                {
                    BucketName = GetBucketName(),
                    Key = key,                    
                    Expires = DateTime.UtcNow.AddSeconds(duration),
                    Verb = verb
                };
                if (dto != null)
                {
                    request.ResponseHeaderOverrides.ContentType = dto.ContentType;
                }                
                /*
                request.ResponseHeaderOverrides.ContentDisposition = "attachment; filename=temp.txt";
                request.ResponseHeaderOverrides.CacheControl = "No-cache";                
                request.ResponseHeaderOverrides.Expires = "Thu, 01 Dec 1994 16:00:00 GMT";
                */
                urlString = GetClient().GetPreSignedURL(request);
            }
            catch (AmazonS3Exception e)
            {
                Console.WriteLine("Error encountered on server. Message:'{0}' when writing an object", e.Message);
            }
            catch (Exception e)
            {
                Console.WriteLine("Unknown encountered on server. Message:'{0}' when writing an object", e.Message);
            }
            return urlString;
        }

        public async Task<bool> DeleteFileAsync(string key)
        {
            var request = new DeleteObjectRequest
            {
                BucketName = GetBucketName(),
                Key = key
            };
            await GetClient().DeleteObjectAsync(request);              
            return true;
        }
    }

    public class MinioClient : S3Base
    {
        private static AmazonS3Client client;

        public MinioClient()
        {
            var config = new AmazonS3Config
            {
                RegionEndpoint = RegionEndpoint.USEast1, // MUST set this before setting ServiceURL and it should match the `MINIO_REGION` environment variable.
                ServiceURL = "http://localhost:8002",
                ForcePathStyle = true // MUST be true to work correctly with MinIO server,               
            };
            client = new AmazonS3Client("admin", "password", config);
        }

        public override IAmazonS3 GetClient()
        {
            return client;
        }
        
    }

    public class S3Client : S3Base
    {
        private IAmazonS3 client { get; set; }

        public S3Client(IAmazonS3 client)
        {   
            this.client = client;
        }

        public override IAmazonS3 GetClient()
        {
            return client;
        }
    }
}
