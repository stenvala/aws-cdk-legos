using System;
using Amazon.DynamoDBv2.DataModel;

namespace Mono.Repositories.Models
{

    public class BaseModel
    {        
        [DynamoDBHashKey]
        public string Id { get; set; }        
    }
}
