using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using Amis.Utils;
using Newtonsoft.Json;

namespace Amis.BL
{

    public class User
    {
        public string Id { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
    }

    public class Meta : User
    {

    }

    public class Permission
    {
        public string Id { get; set; }
        public List<string> Permissions { get; set; }
    }

    public class DecodedJwt
    {
        public string DocId { get; set; }
        public Meta Meta { get; set; }
        public List<Permission> Permissions { get; set; }
    }

    public interface ISecurityContext
    {
        void SetData(Meta meta, List<Permission> permissions, string DocId = "");
        User GetUser();
        string GetDocId();
        List<Permission> GetPermissions();
        List<string> GetReadAreas();
        List<string> GetPermissionsOfArea(string id);
        void InitFromJwt(string jwt);
    }

    public class SecurityContext : ISecurityContext
    {

        private Meta Meta { get; set;}
        private List<Permission> Permissions { get; set; }
        private string DocId { get; set; }

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

        private static string AuthType_ { get; set; }
        public static string AuthType
        {
            get
            {
                return AuthType_;
            }

            set
            {
                var allowedValues = new List<string>
                {
                    "api", "jwt", "lambda"
                };
                if (!allowedValues.Contains(value))
                {
                    throw new Exception("AuthType is invalid");
                }
                if (AuthType_ == null)
                {
                    AuthType_ = value;
                }
            }            
        }

        public void SetData(Meta user, List<Permission> permissions, string docId = "")
        {
            Meta = user;
            Permissions = permissions;
            DocId = docId;
        }

        public List<Permission> GetPermissions()
        {
            return Permissions;
        }

        public string GetDocId()
        {
            return DocId;
        }

        public List<string> GetPermissionsOfArea(string id)
        {
            return Permissions.Where(i => i.Id == id).Select(i => i.Permissions).FirstOrDefault();
        }

        public List<string> GetReadAreas()
        {
            return Permissions.Where(i => i.Permissions.Contains("READ")).Select(i => i.Id).ToList();
        }

        public User GetUser()
        {
            return new User
            {
                FamilyName = Meta.FamilyName,
                GivenName = Meta.GivenName,
                Id = Meta.Id
            };
        }

        public void InitFromJwt(string jwt)
        {            
            var json = Jsoner.Convert(new
            {
                jwt
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
                var data = JsonConvert.DeserializeObject<DecodedJwt>(result);
                SetData(data.Meta, data.Permissions, data.DocId);
            }
        }
        
    }

}
