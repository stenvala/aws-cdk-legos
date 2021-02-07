using System;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amis.BL;
using Amis.Utils;
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
                    Console.WriteLine("Using api authorizer");
                    var authHeader = context.HttpContext.Request.Headers["Authorization"];                    
                    isOk = InitFromJwt(authHeader, securityContext);
                    break;
                case "lambda": // This is jwt lambda
                    Console.WriteLine("Using lambda authorizer");                                      
                    var hasReq = context.HttpContext.Items.TryGetValue("LambdaRequestObject", out var req);                   
                    if (!hasReq) {                        
                        context.Result = new ForbidResult("AUTHENTICATION_FAILED");
                        return;
                    }
                    isOk = InitFromLambdaRequest((APIGatewayProxyRequest) req, securityContext);                    
                    break;
                default:
                    throw new Exception($"Authentication type '{SecurityContext.AuthType}' not implemented");
            }
            if (!isOk)
            {
                context.Result = new ForbidResult("AUTHENTICATION_FAILED");
            }
            else
            {
                Console.WriteLine("Authentication is ok");
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

       private bool InitFromLambdaRequest(APIGatewayProxyRequest request, ISecurityContext securityContext)
       {
            var auth = request.RequestContext.Authorizer;
            if (!auth.ContainsKey("meta") || !auth.ContainsKey("permissions") || !auth.ContainsKey("docId"))
            {
                return false;
            }
            securityContext.InitFromCustomAuthorizerContext(auth);            
            return true;
        }

    }
}

