using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon;
using Amazon.S3;
using Microsoft.AspNetCore.Mvc;
using Amis.Utils;
using Amis.Attributes;
using Amis.BL;

namespace Amis.Controllers
{
    [Route("api/[controller]")]
    public class DevController : ControllerBase
    {
        private readonly IS3 s3;
        private readonly ISecurityContext securityContext;

        public DevController(IS3 s3,
            ISecurityContext securityContext
            )
        {
            this.s3 = s3;
            this.securityContext = securityContext;
        }
        
        [HttpGet("headers")]
        public IEnumerable<string> Get()
        {            
            var headers = Request.Headers;
            var keys = headers.Keys;            
            var reply = new List<string>();
            foreach (var key in keys)
            {
                reply.Add(key + ": " + headers[key]);
            }
            return reply;
        }
        
        [HttpGet("buckets")]
        public async Task<IEnumerable<string>> GetBuckets()
        {            
            var listBucketResponse = await s3.GetClient().ListBucketsAsync();

            var reply = new List<string>();
            foreach (var bucket in listBucketResponse.Buckets)
            {
                reply.Add("bucket '" + bucket.BucketName + "' created at " + bucket.CreationDate);
            }
            return reply;
        }

        [HttpGet("decoded-jwt")]
        [RequireUser()]
        public string GetDecodedJwt()
        {
            var obj = new
            {
                user = securityContext.GetUser(),
                docId = securityContext.GetDocId(),
                permissions = securityContext.GetPermissions()
            };
            return Jsoner.Convert(obj);
        }        
    }
}
