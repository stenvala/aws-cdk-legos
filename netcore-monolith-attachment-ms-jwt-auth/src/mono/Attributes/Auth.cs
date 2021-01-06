using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using Mono.BL;
using Mono.Repositories;

namespace Mono.Attributes
{

    // User
    public class RequireUserAttribute : TypeFilterAttribute
    {
        public RequireUserAttribute() : base(typeof(RequireUserFilter))
        {
        }
    }

    public class RequireUserFilter : IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var securityContext = context.HttpContext.RequestServices.GetService<ISecurityContext>();
            var userRepository = context.HttpContext.RequestServices.GetService<IUserRepository>();

            string authHeader = context.HttpContext.Request.Headers["Authorization"];
            if (authHeader != null && authHeader.StartsWith("Basic "))
            {
                var values = authHeader.Replace("Basic ", "").Split(",");
                if (values.Count() == 2) {
                    var user = await userRepository.GetUserByUsername(values[0]);
                    if (user != null && user.SessionId == values[1])
                    {
                        securityContext.SetUser(user);
                        return;
                    }
                }                
            }            
            context.Result = new ForbidResult("AUTHENTICATION_FAILED");            
        }
    }
}

