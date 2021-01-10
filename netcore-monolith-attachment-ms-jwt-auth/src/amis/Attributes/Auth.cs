using System;
using System.Linq;
using System.Threading.Tasks;
using Amis.BL;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Amis.Attributes
{
    
    public class RequireUserAttribute : TypeFilterAttribute
    {
        public RequireUserAttribute() : base(typeof(RequireUserFilter))
        {
        }
    }

    //public class RequireUserFilter : IAsyncAuthorizationFilter
    public class RequireUserFilter : IAuthorizationFilter
    {
        //public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        public void OnAuthorization(AuthorizationFilterContext context)
        {            
            var securityContext = context.HttpContext.RequestServices.GetService<ISecurityContext>();
            var isOk = false;
            switch (SecurityContext.AuthType)
            {
                case "api":                    
                    isOk = InitFromJwt(context.HttpContext.Request.Headers["Authorization"], securityContext);
                    break;
            }

            if (!isOk)
            {
                context.Result = new ForbidResult("AUTHENTICATION_FAILED");
            }            
        }

        private bool InitFromJwt(string authHeader, ISecurityContext securityContext)
        {
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                securityContext.InitFromJwt(authHeader.Replace("Bearer ", ""));
                return true;
            }
            return false;            
        }
    }
}

