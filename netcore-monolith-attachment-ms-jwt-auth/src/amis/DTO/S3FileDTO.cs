using System;
namespace Amis.DTO
{
    public class S3FileDTO
    {       
        public string Path { get; set; }
        public long Size { get; set; }
        public long LastModified { get; set; }
        public string UserId { get; set; }
    }

    public class GetPresignedUrlDTO
    {
        public string FileName { get; set; }
        public string ContentType { get; set; }
    }
}
