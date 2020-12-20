using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using Amazon.DynamoDBv2.DataModel;

namespace Mono.Repositories.Models
{

    [DynamoDBTable("MonoDataTable")]
    public class UserModel : BaseModel
    {

        // ID is username -> thus unique

        // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBContext.ArbitraryDataMapping.html

        public string PasswordHash { get; set; }

        public string GivenName { get; set; }

        public string FamilyName { get; set; }        

        public List<string> ImagePermissions { get; set; }

        public List<string> AttachmentPermissions { get; set; }


        // Ust this for other properties
        // [DynamoDBIgnore]

        public static string HashPassword(string password)
        {
            // https://stackoverflow.com/questions/4181198/how-to-hash-a-password/10402129#10402129
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 1000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            string savedPasswordHash = Convert.ToBase64String(hashBytes);
            return savedPasswordHash;
        }

        public bool IsPasswordValid(string password)
        {
            string savedPasswordHash = PasswordHash;
            byte[] hashBytes = Convert.FromBase64String(savedPasswordHash);
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);
            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 1000);
            byte[] hash = pbkdf2.GetBytes(20);
            for (int i = 0; i < 20; i++)
                if (hashBytes[i + 16] != hash[i])
                    return false;
            return true;
        }
    }
}
