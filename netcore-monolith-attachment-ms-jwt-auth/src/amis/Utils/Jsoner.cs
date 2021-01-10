using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Amis.Utils
{
    public class Jsoner
    {
        public static string Convert(object data)
        {
            return JsonConvert.SerializeObject(data,
                Formatting.Indented,
                new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                });
        }

        public static string Ok()
        {
            var data =
            new
            {
                Message = "OK"
            };
            return JsonConvert.SerializeObject(data,
                Formatting.Indented,
                new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                });
        }
    }
}
