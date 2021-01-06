using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mono.Attributes;
using Mono.BL;
using Mono.DTO;
using Mono.Utils;

namespace Mono.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {

        private readonly IUserLogic userLogic;
        private readonly IMapper mapper;
        private readonly ISecurityContext securityContext;        

        public AuthController(
            IUserLogic userLogic,            
            ISecurityContext securityContext,
            IMapper mapper)
        {            
            this.userLogic = userLogic;
            this.securityContext = securityContext;
            this.mapper = mapper;
        }

        [HttpPost("login")]
        public async Task<string> PostLogin([FromBody] LoginDTO credentials)
        {
            var user = await userLogic.Login(credentials.Username,
                credentials.Password);
            if (user == null)
            {
                Response.StatusCode = 400;
                var response = new Dictionary<string, string>
                {
                    {"message", "Authentication failed"}
                };
                return Jsoner.Convert(response);
            }
            return Jsoner.Convert(mapper.Map<UserDTO>(user));
        }

        [HttpGet("logout")]
        [RequireUser()]
        public async Task<string> GetLogout()
        {
            var user = securityContext.GetUser();
            await userLogic.Logout(user.UserName);
            return Jsoner.Ok();
        }

        [HttpGet("me")]
        [RequireUser()]
        public string GetMe()
        {
            var user = securityContext.GetUser();
            return Jsoner.Convert(mapper.Map<UserDTO>(user));
        }

        [HttpGet("permissions")]
        [RequireUser()]
        public string GetPermissions()
        {            
            var user = securityContext.GetUser();            
            var permissions = mapper.Map<PermissionsDTO>(user);            
            return Jsoner.Convert(permissions);
        }

        [HttpGet("permissions-jwt/{id}")]
        [RequireUser()]
        public string GetPermissionsJwtForDoc(string id)
        {
            var user = securityContext.GetUser();            
            
            return Jsoner.Convert(
                new PermissionJwtDTO
                {
                    Jwt = userLogic.GetPermissionJwt(user, id)
                }
            );
        }
    }
}
