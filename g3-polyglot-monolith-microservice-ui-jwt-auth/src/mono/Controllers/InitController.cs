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

        private readonly IInitData initData;
        private readonly IUserRepository userRepository;
        private readonly IMapper mapper;

        public InitController(
            IInitData initData,
            IUserRepository userRepository,
            IMapper mapper)
        {
            this.initData = initData;
            this.userRepository = userRepository;
            this.mapper = mapper;
        }

        // localhost:6001/api/init/table
        [HttpGet("table")]
        public async Task<string> GetInitTables()
        {            
            await initData.InitTables();
            return Jsoner.Ok();
        }

        // localhost:6001/api/init/users
        [HttpGet("users")]
        public async Task<string> GetInitUsers()
        {
            await initData.InitUsers();
            var users = new List<UserModel>
            {
                await userRepository.GetUserByUsername("admin"),
                await userRepository.GetUserByUsername("user")
            };
            return Jsoner.Convert(users.Select(i => mapper.Map<UserDTO>(i)));
        }
    }
}
