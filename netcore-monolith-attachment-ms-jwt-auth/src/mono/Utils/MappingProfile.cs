using System;
using AutoMapper;
using Mono.DTO;
using Mono.Repositories.Models;

namespace Mono.Utils
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<UserModel, UserDTO>();
            CreateMap<DocumentModel, DocumentDTO>();
            CreateMap<UserModel, PermissionsDTO>();
        }
    }
}
