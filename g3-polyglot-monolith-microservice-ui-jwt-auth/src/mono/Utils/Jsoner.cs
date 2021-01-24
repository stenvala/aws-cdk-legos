using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Mono.Utils
{
    public class Jsoner
    {
        public static string Convert(object data)
        {
            return JsonConvert.SerializeObject(data,
                Formatting.Indented,
                new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore,
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
            return Convert(data);
        }
    }
}
