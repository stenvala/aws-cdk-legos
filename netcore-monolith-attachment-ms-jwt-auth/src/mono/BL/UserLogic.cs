    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using AutoMapper;
    using Mono.DTO;
using Mono.Repositories;
using Mono.Repositories.Models;

namespace Mono.BL
{
    
    public interface IUserLogic
    {            
        Task<UserModel> Login(string userName, string password);
        Task Logout(string userName);
    }

    public class UserLogic : IUserLogic
    {        
        private readonly IUserRepository userRepository;

        public UserLogic(IUserRepository userRepository)
        {            
            this.userRepository = userRepository;
        }            


        public async Task<UserModel> Login(string userName, string password)
        {
            var user = await userRepository.GetUserByUsername(userName);
            if (!user.IsPasswordValid(password))
            {
                return null;
            }
            return user;
        }

        public async Task Logout(string userName)
        {
            await userRepository.ResetSessionId(userName);
        }
    }
}

