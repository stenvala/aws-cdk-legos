using System;
using System.Collections.Generic;

namespace Mono.DTO
{
    public class RegisterDTO
    {
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
        public string UserName { get; set; }        
        public string Password { get; set; }
    }

    public class LoginDTO
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }

    public class UserDTO
    {
        public string Id { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }                       
        public SessionDTO CurrentSession { get; set; }
    }

    public class SessionDTO
    {
        public DateTime ValidUntil { get; set; }
        public Guid Id { get; set; }
    }

}
