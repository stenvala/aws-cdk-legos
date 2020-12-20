using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using Mono.Repositories.Models;

namespace Mono.Repositories
{

    public interface IUserRepository
    {
        Task<CreateTableResponse> InitTable();
        Task InitUsers();
        Task<UserModel> GetAdmin();
    }

    // https://www.stevejgordon.co.uk/running-aws-dynamodb-locally-for-net-core-developers
    // https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/dynamodb-intro.html
    public class UserRepository : IUserRepository
    {
        private const string TableName = "MonoDataTable";        

        private readonly IAmazonDynamoDB amazonDynamoDb;        

        public UserRepository(IAmazonDynamoDB amazonDynamoDb)
        {
            this.amazonDynamoDb = amazonDynamoDb;            
        }

        public async Task<CreateTableResponse> InitTable()
        {            
            var request = new ListTablesRequest
            {
                Limit = 10
            };
            var response = await amazonDynamoDb.ListTablesAsync(request);
            var results = response.TableNames;         
            return await CreateTableIfNotExists(results, TableName);            
        }        

        public async Task<UserModel> GetAdmin()
        {
            DynamoDBContext context = new DynamoDBContext(amazonDynamoDb);
            return await context.LoadAsync<UserModel>("admin");
        }

        public async Task InitUsers()
        {
            var admin = new UserModel
            {
                Id = "admin",
                GivenName = "Demo",
                FamilyName = "Admin",                
                PasswordHash = UserModel.HashPassword("demo"),
                ImagePermissions = new List<string>
                {                    
                    "ADD", "GET", "DELETE"                        
                },
                AttachmentPermissions = new List<string>
                {
                    "ADD", "GET", "DELETE"
                }                 
            };            
            DynamoDBContext context = new DynamoDBContext(amazonDynamoDb);
            await context.SaveAsync(admin);            
        }


        private async Task<CreateTableResponse> CreateTableIfNotExists(List<string> existingTables, string tableName)
        {
            if (!existingTables.Contains(tableName) || true)
            {                
                var createRequest = new CreateTableRequest
                {
                    TableName = tableName,
                    AttributeDefinitions = new List<AttributeDefinition>
                    {
                        new AttributeDefinition
                        {
                            AttributeName = "Id",
                            AttributeType = "S"
                        }
                    },
                    KeySchema = new List<KeySchemaElement>
                    {
                        new KeySchemaElement
                        {
                            AttributeName = "Id",
                            KeyType = "HASH"  //Partition key
                        }
                    },
                    ProvisionedThroughput = new ProvisionedThroughput
                    {
                        ReadCapacityUnits = 1,
                        WriteCapacityUnits = 1
                    },
                };
                return await amazonDynamoDb.CreateTableAsync(createRequest);
            }
            return null;
        }
    }
}
