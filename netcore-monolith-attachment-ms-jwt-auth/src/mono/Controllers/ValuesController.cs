using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;
using Amazon.Lambda.Core;
using Microsoft.AspNetCore.Mvc;
using Mono.Utils;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]


namespace Mono.Controllers
{
        [Route("api/[controller]")]
        public class ValuesController : ControllerBase
        {
        // GET api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2", "value3", Environment.GetEnvironmentVariable("authUrl") };
        }


        [HttpGet("event")]
        public async Task<string> SendEventAsync()
        {
            var request = new PutEventsRequest
            {
                Entries =
                {
                    // Detail = JsonConvert.SerializeObject(
                    new PutEventsRequestEntry
                    {
                        Source = "mono.deleteDocument",
                        EventBusName = "DeleteAttachment",
                        DetailType = "transaction",
                        Time = DateTime.Now,
                        Detail = Jsoner.Convert(
                            new
                            {
                                action = "withdrawal",
                                location = "MA-BOS-01",
                                amount = 500,
                                result = "approved",
                                transactionId = "123456",
                                cardPresent = true,
                                partnerBank = "Example Bank",
                                remainingFunds = 723.34
                            }
                        )
                    }
                }
            };


            PutEventsRequest events = request;

            AmazonEventBridgeClient client = new AmazonEventBridgeClient();
            var response = await client.PutEventsAsync(events);
            return Jsoner.Convert(response);
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
