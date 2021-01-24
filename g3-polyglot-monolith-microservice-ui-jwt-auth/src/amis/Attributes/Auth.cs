using System;
using Amazon.Lambda.Core;
using Amis.BL;
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
                    var authHeader = context.HttpContext.Request.Headers["Authorization"];                    
                    isOk = InitFromJwt(authHeader, securityContext);
                    break;
                case "lambda": // This is jwt lambda
                    var hasContext = context.HttpContext.Items.TryGetValue("RequestContext", out var cto);
                    if (!hasContext) {
                        Console.WriteLine("There was no context");
                        context.Result = new ForbidResult("AUTHENTICATION_FAILED");
                        return;
                    }
                    
                        
                    break;
                default:
                    throw new Exception($"Authentication type '{SecurityContext.AuthType}' not implemented");
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

