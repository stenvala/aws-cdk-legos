using Amis.BL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace Amis.Attributes
{

    public class DocumentAttribute : TypeFilterAttribute
    {
        public DocumentAttribute(string docIdParamName) : base(typeof(DocumentFilter))
        {
            Arguments = new object[] { docIdParamName };
        }
    }

    //public class RequireUserFilter : IAsyncAuthorizationFilter
    public class DocumentFilter : IAuthorizationFilter
    {

        string DocIdParamName { get; set; }

        public DocumentFilter(string docIdParamName)
        {
            DocIdParamName = docIdParamName;
        }

        //public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var securityContext = context.HttpContext.RequestServices.GetService<ISecurityContext>();
            var assumedDocId = securityContext.GetDocId();

            var givenDocId = context.RouteData.Values[DocIdParamName].ToString();
            
            if (assumedDocId != givenDocId)
            {
                context.Result = new ForbidResult("AUTHENTICATION_FAILED");
            }            

        }
    }
}

