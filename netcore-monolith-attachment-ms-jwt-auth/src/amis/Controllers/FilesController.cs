using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using Amis.Utils;
using Amazon.S3.Model;
using Amis.Attributes;
using Amis.BL;
using Amis.DTO;

namespace Amis.Controllers
{
    [RequireUser()]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly IS3 s3;
        private readonly ISecurityContext securityContext;

        public FilesController(IS3 s3,
            ISecurityContext securityContext
            )
        {
            this.s3 = s3;
            this.securityContext = securityContext;
        }

        [HttpGet("document/{docId}")]
        [Document("docId")]
        public async Task<string> GetFiles(string docId)
        {
            var request = new ListObjectsV2Request
            {
                BucketName = s3.GetBucketName(),
                MaxKeys = 20,
                Prefix = docId
            };

            var readAreas = securityContext.GetReadAreas();
            var files = new List<S3FileDTO>();
            var client = s3.GetClient();
            ListObjectsV2Response response;
            do
            {
            response = await client.ListObjectsV2Async(request);            
            foreach (var i in response.S3Objects)
            {                
                foreach (var j in readAreas)
                {
                    if (i.Key.StartsWith(docId + "/" + j))
                    {
                        var metadataRequest = new GetObjectMetadataRequest
                        {
                            BucketName = s3.GetBucketName(),
                            Key = i.Key
                        };
                        files.Add(new S3FileDTO
                        {
                            Path = i.Key,
                            LastModified = i.LastModified.ToTimestamp(),
                            Size = i.Size,
                            // Now saved to metadata, would be better to save these to database, but so it is
                            UserId = (await client.GetObjectMetadataAsync(metadataRequest)).Metadata["x-amz-meta-userid"]
                        });
                        break;
                    }
                }
            }
            request.ContinuationToken = response.NextContinuationToken;
            } while (response.IsTruncated);
            return Jsoner.Convert(files);
        }

        [HttpPost("document/{docId}/area/{area}")]
        [Document("docId")]
        [DocArea("area", "ADD")]
        public string GetPresignedUrl(string docId, string area, [FromBody] GetPresignedUrlDTO dto)
        {
            // Could come from request as well            
            var key = docId + "/" + area + "/" + dto.FileName;
            var user = securityContext.GetUser();
            Console.WriteLine("Fetched user's data");
            Console.WriteLine(user.GivenName);
            Console.WriteLine(user.Id);
            var metadata = new Dictionary<string, string>
            {
                {"userId", user.Id }
            };
            var url = s3.GeneratePreSignedURLForPut(key, dto, metadata);
            return Jsoner.Convert(new { url, key });
        }

        [HttpDelete("document/{docId}/area/{area}/file/{file}")]
        [Document("docId")]
        [DocArea("area", "DELETE")]
        public async Task<string> DeleteDocument(string docId, string area, string file)
        {
            var key = docId + "/" + area + "/" + file;
            await s3.DeleteFileAsync(key);
            return Jsoner.Ok();
        }

        [HttpDelete("document/{docId}/area/{area}/my-file/{file}")]
        [Document("docId")]
        [DocArea("area", "DELETE-MY")]
        public async Task<string> DeleteDocumentThatIAdded(string docId, string area, string file)
        {
            var key = docId + "/" + area + "/" + file;
            var metadata = await s3.GetObjectMetadata(key);
            var userId = securityContext.GetUser().Id;
            Console.WriteLine("Trying to delete for " + userId);
            if (userId != metadata["userId"])
            {
                Response.StatusCode = 403;
                return "";
            }
            await s3.DeleteFileAsync(key);
            return Jsoner.Ok();
        }

        [HttpGet("document/{docId}/area/{area}/file/{file}")]
        [Document("docId")]
        [DocArea("area", "GET")]
        public string GetFile(string docId, string area, string file)
        {
            var key = docId + "/" + area + "/" + file;            
            var url = s3.GeneratePresignedURLForGet(key);
            return Jsoner.Convert(new { url });
        }
    }
}
