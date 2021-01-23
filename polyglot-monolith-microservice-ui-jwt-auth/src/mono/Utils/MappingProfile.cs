using System;
using System.Collections;
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
            CreateMap<UserModel, PermissionsDTO>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                    (srcMember != null && !(srcMember is IList)) ||
                    (srcMember != null && srcMember is IList && (srcMember as IList).Count > 0)));

        }
    }
}
