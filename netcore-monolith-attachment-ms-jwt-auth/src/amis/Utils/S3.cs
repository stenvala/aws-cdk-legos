using System;
using System.Collections.Generic;
using System.IO;
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
        string GeneratePreSignedURLForPut(string key, GetPresignedUrlDTO dto, Dictionary<string, string> metadata);
        string GeneratePresignedURLForGet(string key, GetPresignedUrlDTO dto = null);
        Task<bool> DeleteFileAsync(string key);
        Task<Dictionary<string, string>> GetObjectMetadata(string key);
    }

    abstract public class S3Base : IS3
    {

        public S3Base()
        {

        }

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

        public string GeneratePreSignedURLForPut(string key, GetPresignedUrlDTO dto, Dictionary<string, string> metadata)
        {
            return GeneratePreSignedURL(key, HttpVerb.PUT, dto, metadata);
        }

        public async Task<Dictionary<string, string>> GetObjectMetadata(string key)
        {
            var metadata = new Dictionary<string, string>();
            try
            {
                GetObjectRequest request = new GetObjectRequest
                {
                    BucketName = this.GetBucketName(),
                    Key = key
                };
                using (GetObjectResponse response = await GetClient().GetObjectAsync(request))
                using (Stream responseStream = response.ResponseStream)
                using (StreamReader reader = new StreamReader(responseStream))
                {
                    foreach (var item in response.Metadata.Keys)
                    {
                        Console.WriteLine("Found metadata " + item + ":" + response.Metadata[item]);
                        metadata.Add(item.Replace("x-amz-meta-", ""), response.Metadata[item]);
                    }                        
                }                
            }
            catch (AmazonS3Exception e)
            {
                // If bucket or object does not exist
                Console.WriteLine("Error encountered ***. Message:'{0}' when reading object", e.Message);
            }
            catch (Exception e)
            {
                Console.WriteLine("Unknown encountered on server. Message:'{0}' when reading object", e.Message);
            }
            return metadata;
        }

        private string GeneratePreSignedURL(string key, HttpVerb verb, GetPresignedUrlDTO dto = null, Dictionary<string, string> metadata = null)
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
                if (metadata != null)
                {
                    foreach (var item in metadata.Keys)
                    {
                        Console.WriteLine("Adding metadata " + item + ":" + metadata[item]);
                        request.Headers["x-amz-meta-" + item] = metadata[item];
                    }
                }
                if (dto != null)
                {
                    request.ResponseHeaderOverrides.ContentType = dto.ContentType;
                }                
                
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
