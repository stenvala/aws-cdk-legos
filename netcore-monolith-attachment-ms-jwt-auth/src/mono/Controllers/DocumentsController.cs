using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mono.Attributes;
using Mono.DTO;
using Mono.Repositories;
using Mono.Repositories.Models;
using Mono.Utils;

namespace Mono.Controllers
{
    [Route("api/[controller]")]
    [RequireUser()]
    public class DocumentsController : ControllerBase
    {

        private readonly IInitData initData;
        private readonly IDocumentRepository documentRepository;
        private readonly IMapper mapper;

        public DocumentsController(
            IInitData initData,
            IDocumentRepository documentRepository,
            IMapper mapper)
        {
            this.initData = initData;
            this.documentRepository = documentRepository;
            this.mapper = mapper;
        }

        [HttpGet("")]
        public async Task<string> GetAll(string id)
        {
            var list = await documentRepository.GetAll();
            return Jsoner.Convert(list.Select(i => mapper.Map<DocumentDTO>(i)));
        }

        [HttpGet("{id}")]
        public async Task<string> GetById(string id)
        {
            var document = await documentRepository.GetById(id);
            return Jsoner.Convert(mapper.Map<DocumentDTO>(document));
        }

        [HttpPost("")]
        public async Task<string> PostCreateDocument([FromBody] NewDocumentDTO newDocument)
        {
            var document = await documentRepository.Create(newDocument.Name);
            return Jsoner.Convert(mapper.Map<DocumentDTO>(document));
        }

        [HttpDelete("{id}")]
        public async Task<string> RemoveById(string id)
        {
            await documentRepository.RemoveById(id);
            return Jsoner.Ok();
        }
    }
}
