using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mono.DTO;
using Mono.Repositories;
using Mono.Repositories.Models;
using Mono.Utils;

namespace Mono.Controllers
{
    [Route("api/[controller]")]
    public class InitController : ControllerBase
    {

        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;

        public InitController(         
            IUserRepository userRepository,
            IMapper mapper)
        {
            this.userRepository = userRepository;
            this.mapper = mapper;
        }

        // localhost:6001/api/init/table
        [HttpGet("table")]
        public async Task<string> GetInitTables()
        {            
            var response = await userRepository.InitTable();
            return Jsoner.Convert(response);
        }

        // localhost:6001/api/init/users
        [HttpGet("users")]
        public async Task<string> GetInitUsers()
        {
            await userRepository.InitUsers();
            var users = new List<UserModel>
            {
                await userRepository.GetUserByUsername("admin"),
                await userRepository.GetUserByUsername("user")
            };
            return Jsoner.Convert(users.Select(i => mapper.Map<UserDTO>(i)));
        }
    }
}
