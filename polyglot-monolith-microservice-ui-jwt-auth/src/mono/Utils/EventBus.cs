using System;
using System.Threading.Tasks;
using Amazon.EventBridge;
using Amazon.EventBridge.Model;

namespace Mono.Utils
{
    public interface IEventBus
    {
        Task SendDeleteAttachmentEvent(string docId);
        Task<PutEventsResponse> SendEvent(PutEventsRequestEntry eventEntry);
    }

    public class EventBus : IEventBus
    {
        public EventBus()
        {
        }

        public async Task SendDeleteAttachmentEvent(string docId)
        {
            var eventEntry = new PutEventsRequestEntry
            {
                Source = "mono.deleteDocument",
                EventBusName = Environment.GetEnvironmentVariable("deleteEventBus"),
                DetailType = "transaction",
                Time = DateTime.Now,
                Detail = Jsoner.Convert(
                            new
                            {
                                docId
                            }
                        )
            };
            await SendEvent(eventEntry);
        }

        public async Task<PutEventsResponse> SendEvent(PutEventsRequestEntry eventEntry)
        {
            var request = new PutEventsRequest
            {
                Entries =
                {                    
                    eventEntry
                }
            };
            PutEventsRequest events = request;
            AmazonEventBridgeClient client = new AmazonEventBridgeClient();
            return await client.PutEventsAsync(events);
        }
    }
}
