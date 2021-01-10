using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using Amis.Utils;
using Amazon.S3.Model;

namespace Amis.Controllers
{
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private readonly IS3 s3;

        public FilesController(IS3 s3)
        {
            this.s3 = s3;
        }
        
        [HttpGet("document/{docId}")]
        public async Task<string> GetFiles(string docId)
        {                        
            
            var request = new ListObjectsV2Request
            {
                BucketName = s3.GetBucketName(),
                MaxKeys = 20
            };

            var files = new List<string>();
            
            ListObjectsV2Response response;
            do
            {
                response = await s3.GetClient().ListObjectsV2Async(request);

                foreach (var i in response.S3Objects)
                {
                    files.Append(i.Key);
                }

                request.ContinuationToken = response.NextContinuationToken;

            } while (response.IsTruncated);

            return Jsoner.Convert(files);

        }

    }
}
