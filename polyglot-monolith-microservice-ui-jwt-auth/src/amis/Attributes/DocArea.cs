using Amis.BL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Amis.Attributes
{

    public class DocAreaAttribute : TypeFilterAttribute
    {
        public DocAreaAttribute(string areaParamName, string permission) : base(typeof(DocAreaFilter))
        {
            Arguments = new object[] { areaParamName, permission };
        }
    }
    
    public class DocAreaFilter : IAuthorizationFilter
    {

        string AreaParamName { get; set; }
        string Permission { get; set; }

        public DocAreaFilter(string areaParamName, string permission)
        {
            AreaParamName = areaParamName;
            Permission = permission;
        }
        
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var securityContext = context.HttpContext.RequestServices.GetService<ISecurityContext>();
            var area = context.RouteData.Values[AreaParamName].ToString();
            if (!securityContext.HasAreaPermission(area, Permission))
            {
                context.Result = new ForbidResult("AUTHENTICATION_FAILED");
            }

        }
    }
}

