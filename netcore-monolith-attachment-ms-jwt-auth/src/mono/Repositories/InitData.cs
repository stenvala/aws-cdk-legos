using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using Mono.Repositories.Models;

namespace Mono.Repositories
{

    public interface IInitData
    {
        Task InitTables();
        Task InitUsers();        
    }
    
    public class InitData : IInitData
    {
        private const string UserTableName = "MonoUser";
        private const string DocumentTableName = "MonoDocument";

        private readonly IAmazonDynamoDB amazonDynamoDb;

        public InitData(IAmazonDynamoDB amazonDynamoDb)
        {
            this.amazonDynamoDb = amazonDynamoDb;
        }

        public async Task InitTables()
        {
            var request = new ListTablesRequest
            {
                Limit = 10
            };
            var response = await amazonDynamoDb.ListTablesAsync(request);
            var results = response.TableNames;
            await CreateTableIfNotExists(results, UserTableName);
            await CreateTableIfNotExists(results, DocumentTableName);
        }        

        public async Task InitUsers()
        {
            DynamoDBContext context = new DynamoDBContext(amazonDynamoDb);
            var admin = new UserModel
            {
                Id = "admin",
                GivenName = "Demo",
                FamilyName = "Admin",
                SessionId = Guid.NewGuid().ToString(),
                PasswordHash = UserModel.HashPassword("demo"),
                ImagePermissions = new List<string>
                {
                    "ADD", "GET", "DELETE"
                },
                AttachmentPermissions = new List<string>
                {
                    "ADD", "GET", "DELETE"
                },
                SecretFilePermissions = new List<string>
                {
                    "ADD", "GET", "DELETE"
                }

            };
            await context.SaveAsync(admin);
            var user = new UserModel
            {
                Id = "user",
                GivenName = "Demo",
                FamilyName = "User",
                SessionId = Guid.NewGuid().ToString(),
                PasswordHash = UserModel.HashPassword("demo"),
                ImagePermissions = new List<string>
                {
                    "GET"
                },
                AttachmentPermissions = new List<string>
                {
                    "ADD", "GET", "DELETE-MY"
                },
                SecretFilePermissions = new List<string>
                {
                }
            };
            await context.SaveAsync(user);

        }

        private async Task<CreateTableResponse> CreateTableIfNotExists(List<string> existingTables, string tableName)
        {
            if (!existingTables.Contains(tableName))
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
