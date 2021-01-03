using System;
using Amazon.DynamoDBv2.DataModel;

namespace Mono.Repositories.Models
{

    [DynamoDBTable("MonoDocument")]
    public class DocumentModel : BaseModel
    {
        public string Name { get; set; }
        public long Created { get; set; }
    }    
}
