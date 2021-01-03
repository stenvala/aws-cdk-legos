using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Mono.Repositories.Models;

namespace Mono.Repositories
{
    public interface IDocumentRepository
    {
        Task<DocumentModel> GetById(string id);
        Task<DocumentModel> Create(string name);
        Task RemoveById(string id);
        Task<List<DocumentModel>> GetAll();
    }

    // https://www.stevejgordon.co.uk/running-aws-dynamodb-locally-for-net-core-developers
    // https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/dynamodb-intro.html
    public class DocumentRepository : IDocumentRepository
    {
        private readonly IAmazonDynamoDB amazonDynamoDb;

        public DocumentRepository(IAmazonDynamoDB amazonDynamoDb)
        {
            this.amazonDynamoDb = amazonDynamoDb;
        }

        public async Task<DocumentModel> GetById(string id)
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            return await context.LoadAsync<DocumentModel>(id);
        }

        public async Task<DocumentModel> Create(string name)
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            var doc = new DocumentModel
            {
                Id = Guid.NewGuid().ToString(),
                Name = name,
                Created = DateTimeOffset.Now.ToUnixTimeMilliseconds()
            };
            await context.SaveAsync(doc);
            return doc;
        }

        public async Task RemoveById(string id)
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            var doc = await GetById(id);
            if (id != null)
            {
                await context.DeleteAsync(doc);
            }
        }

        public async Task<List<DocumentModel>> GetAll()
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            var conditions = new List<ScanCondition>();            
            return await context.ScanAsync<DocumentModel>(conditions).GetRemainingAsync();
        }
    }
}
