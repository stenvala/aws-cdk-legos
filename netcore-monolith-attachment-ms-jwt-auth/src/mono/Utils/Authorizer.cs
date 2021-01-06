using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Mono.Utils
{
    public class Permission
    {
        public string Id { get; set; }
        public List<string> Permissions { get; set; }
    }

    public interface IAuthorizer
    {
        string getJwt(string docId, List<Permission> permissions);
    }

    public class Authorizer : IAuthorizer
    {
        private static readonly HttpClient client = new HttpClient();
        private static string Url_ { get; set; }
        public static string Url
        {
            set
            {
                if (Url_ == null)
                {
                    Url_ = value;
                }
            }
        }
        private static bool? IsIamAuthEnabled_ { get; set; }
        public static bool? IsIamAuthEnabled
        {            
            set
            {
                if (IsIamAuthEnabled_ == null)
                {
                    IsIamAuthEnabled_ = value;
                }
            }
        }
        public Authorizer()
        {            
        }

        public string getJwt(string docId, List<Permission> permissions)
        {
            var json = Jsoner.Convert(new
            {
                docId,
                permissions
            });            

            var httpWebRequest = (HttpWebRequest)WebRequest.Create(Url_);
            httpWebRequest.ContentType = "application/json";
            httpWebRequest.Method = "POST";

            using (var streamWriter = new StreamWriter(httpWebRequest.GetRequestStream()))
            {                
                streamWriter.Write(json);
            }

            var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
            using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
            {
                var result = streamReader.ReadToEnd();
                var body = JsonConvert.DeserializeObject<Dictionary<string, string>>(result);                                
                if (body.TryGetValue("jwt", out string response))
                {
                    return response;
                }
                throw new Exception("Failed to get jwt");
            }                        
        }
    }
}
