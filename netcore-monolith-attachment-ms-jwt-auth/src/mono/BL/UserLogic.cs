    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
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
            public IMapper Mapper;

            public UserLogic(IMapper mapper)
            {
                Mapper = mapper;
            }            


            public async Task<UserDTO> Login(string userName, string password)
            {
                return await Task.FromResult(new UserDTO
                {
                    Id = Guid.NewGuid(),
                    UserName = userName,
                    CurrentSession = new SessionDTO
                    {
                        Id = Guid.NewGuid(),
                        ValidUntil = DateTime.UtcNow.AddMonths(3)
                    }

                });
            }

        }
     }

