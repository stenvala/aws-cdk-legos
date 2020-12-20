    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using AutoMapper;
    using Mono.DTO;

    namespace Mono.BL
    {
    
        public interface IUserLogic
        {            
            Task<UserDTO> Login(string userName, string password);                     
        }

        public class UserLogic : IUserLogic
        {
            private IMapper Mapper;
            

            public UserLogic(IMapper mapper)
            {
                Mapper = mapper;
            }            


            public async Task<UserDTO> Login(string userName, string password)
            {
                return await Task.FromResult(new UserDTO
                {                    
                    Id = userName
                });
            }

        }
     }

