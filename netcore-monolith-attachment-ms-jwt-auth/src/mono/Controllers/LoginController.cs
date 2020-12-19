using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mono.BL;
using Mono.DTO;
using Mono.Utils;

namespace Mono.Controllers
{
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {

        private readonly IUserLogic UserLogic;
        private readonly IMapper Mapper;

        public LoginController(
            IUserLogic userLogic,
            IMapper mapper)
        {
            UserLogic = userLogic;
            Mapper = mapper;
        }

        [HttpPost("")]
        public async Task<string> PostLogin([FromBody] LoginDTO credentials)
        {
            var user = await UserLogic.Login(credentials.UserName,
                credentials.Password);
            var session = user.CurrentSession;
            CookieOptions options = new CookieOptions();
            options.Expires = session.ValidUntil;
            Response.Cookies.Append(CookieHelper.KEY_SESSION, session.Id.ToString(), options);
            return Jsoner.Convert(user);
        }

        [HttpGet("")]
        public async Task<string> GetLogin()
        {
            var user = await UserLogic.Login("keke",
                "veke");
            var session = user.CurrentSession;
            CookieOptions options = new CookieOptions();
            options.Expires = session.ValidUntil;
            Response.Cookies.Append(CookieHelper.KEY_SESSION, session.Id.ToString(), options);
            return Jsoner.Convert(user);
        }


    }
}
