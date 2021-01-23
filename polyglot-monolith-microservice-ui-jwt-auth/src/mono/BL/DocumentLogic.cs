using System.Threading.Tasks;
using Mono.Repositories;
using Mono.Utils;

namespace Mono.BL
{

    public interface IDocumentLogic
    {
        Task RemoveById(string docId);        
    }

    public class DocumentLogic : IDocumentLogic
    {
        private readonly IEventBus eventBus;
        private readonly IDocumentRepository documentRepository;

        public DocumentLogic(
            IDocumentRepository documentRepository,
            IEventBus eventBus)
        {
            this.eventBus = eventBus;
            this.documentRepository = documentRepository;
        }

        public async Task RemoveById(string docId)
        {
            await documentRepository.RemoveById(docId);
            await eventBus.SendDeleteAttachmentEvent(docId);
        }
    }

}