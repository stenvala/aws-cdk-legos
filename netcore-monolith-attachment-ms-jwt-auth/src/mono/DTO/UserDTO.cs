using System;
using System.Collections.Generic;

namespace Mono.DTO
{    

    public class LoginDTO
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class UserDTO
    {
        public string Id { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }                       
        public string SessionId { get; set; }
    }

    public class DocumentDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }

    public class NewDocumentDTO
    {        
        public string Name { get; set; }
    }

    public class PermissionsDTO
    {
        public List<string> ImagePermissions { get; set; }
        public List<string> AttachmentPermissions { get; set; }
        public List<string> SecretFilePermissions { get; set; }

        public string JWT { get; set; }
    }    

}
