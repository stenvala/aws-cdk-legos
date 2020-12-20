using System;
namespace Mono.Repositories.Models
{

    public class UserSession : BaseModel
    {
        public string UserId { get; set; }

        public int Expires { get; set; }
    }
}
