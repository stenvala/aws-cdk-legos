using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using AutoMapper;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Mono.BL;
using Mono.Repositories;
using Mono.Utils;

namespace Mono
{
    // This is just to cause authentication to work
    public class AuthOpts : AuthenticationSchemeOptions
    {
        public string Realm { get; set; }
    }

    public class AuthHandler : AuthenticationHandler<AuthOpts>
    {
        public AuthHandler(
            IOptionsMonitor<AuthOpts> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // This is called when authentication attribute filters set to context result
            // context.Result = new ForbidResult("AUTHENTICATION_FAILED");
            return Task.FromResult<AuthenticateResult>(AuthenticateResult.Fail(""));
        }
    }

    public class Startup
    {
        readonly string MyAllowSpecificOrigins = "Anything";

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public static IConfiguration Configuration { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            var isLocalMode = Configuration.GetValue<bool>("LocalMode");            

            services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                                  builder =>
                                  {
                                      builder
                                      .AllowAnyOrigin()
                                      .AllowAnyHeader()
                                      .AllowAnyMethod();
                                  });
            });

            services.AddControllers();

            services.AddScoped<IUserLogic, UserLogic>();
            services.AddScoped<IInitData, InitData>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDocumentRepository, DocumentRepository>();
            services.AddScoped<ISecurityContext, SecurityContext>();
            services.AddScoped<IAuthorizer, Authorizer>();

            services.AddAuthentication("Basic")
                .AddScheme<AuthOpts, AuthHandler>("AUTHENTICATION_FAILED", null);

            var mappingConfig = new MapperConfiguration(cfg =>
            {
                cfg.AddProfile(new MappingProfile());
            });

            IMapper mapper = mappingConfig.CreateMapper();
            services.AddSingleton<IMapper>(mapper);

            // Configure DybamoDb       
            var dynamoDbConfig = Configuration.GetSection("DynamoDb");
            Authorizer.IsIamAuthEnabled = !isLocalMode;
            if (isLocalMode)
            {
                services.AddSingleton<IAmazonDynamoDB>(sp =>
                {
                    var clientConfig = new AmazonDynamoDBConfig { ServiceURL = dynamoDbConfig.GetValue<string>("LocalServiceUrl") };
                    return new AmazonDynamoDBClient(clientConfig);
                });
                Authorizer.Url = Configuration.GetSection("Auth").GetValue<string>("LocalServiceUrl");                
            }
            else
            {
                services.AddAWSService<IAmazonDynamoDB>();
                Authorizer.Url = Environment.GetEnvironmentVariable("authUrl");
            }            
        }
    

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {                
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHttpsRedirection();
            }

            app.UseCors(MyAllowSpecificOrigins);

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();                
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("mono service");
                });
            });
        }
    }
}
