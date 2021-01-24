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
        Task<UserModel> GetUserByUsername(string username);
        Task ResetSessionId(string username);
    }

    // https://www.stevejgordon.co.uk/running-aws-dynamodb-locally-for-net-core-developers
    // https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/dynamodb-intro.html
    public class UserRepository : IUserRepository
    {        

        private readonly IAmazonDynamoDB amazonDynamoDb;        

        public UserRepository(IAmazonDynamoDB amazonDynamoDb)
        {
            this.amazonDynamoDb = amazonDynamoDb;            
        }
        

        public async Task<UserModel> GetUserByUsername(string username)
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            return await context.LoadAsync<UserModel>(username);
        }

        public async Task ResetSessionId(string username)
        {
            var context = new DynamoDBContext(amazonDynamoDb);
            var user = await GetUserByUsername(username);
            user.SessionId = Guid.NewGuid().ToString();
            await context.SaveAsync(user);
        }

    }
}
