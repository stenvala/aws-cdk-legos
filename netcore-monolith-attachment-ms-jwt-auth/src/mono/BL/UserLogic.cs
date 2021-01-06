using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using AutoMapper;
using Mono.DTO;
using Mono.Repositories;
using Mono.Repositories.Models;
using Mono.Utils;

namespace Mono.BL
{
    
    public interface IUserLogic
    {            
        Task<UserModel> Login(string userName, string password);
        Task Logout(string userName);
        string GetPermissionJwt(UserModel user, string docId);
    }

    public class UserLogic : IUserLogic
    {        
        private readonly IUserRepository userRepository;
        private readonly IAuthorizer authorizer;

        public UserLogic(IUserRepository userRepository,
            IAuthorizer authorizer)
        {
            this.authorizer = authorizer;
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

        public string GetPermissionJwt(UserModel user, string docId)
        {
            return authorizer.getJwt(docId, user, new List<Permission>
            {
                new Permission
                {
                    Id = "image",
                    Permissions = user.ImagePermissions
                },
                new Permission
                {
                    Id = "attachment",
                    Permissions = user.AttachmentPermissions
                },
                new Permission
                {
                    Id = "secretfile",
                    Permissions = user.SecretFilePermissions
                }
            });
        }
    }
}

