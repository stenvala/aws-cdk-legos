using System;
using Mono.Repositories.Models;

namespace Mono.BL
{
    public interface ISecurityContext
    {
        UserModel GetUser();
        void SetUser(UserModel user);
    }

    public class SecurityContext : ISecurityContext
    {

        private UserModel User { get; set; }        

        public UserModel GetUser()
        {
            return User;
        }

        public void SetUser(UserModel user)
        {
            User = user;
        }
    }
}
