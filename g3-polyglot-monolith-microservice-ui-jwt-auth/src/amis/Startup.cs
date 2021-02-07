using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Amazon.S3;
using Amazon;
using Amazon.Internal;
using Amis.Utils;
using Amis.BL;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;


namespace Amis
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
            Console.WriteLine("Configuring services");
            services.AddControllers();

            var isLocalMode = Configuration.GetValue<bool>("LocalMode");


            services.AddScoped<ISecurityContext, SecurityContext>();

            if (isLocalMode)
            {
                services.AddScoped<IS3, MinioClient>();
                SecurityContext.AuthType = Configuration.GetSection("Auth").GetValue<string>("Type");
                SecurityContext.Url = Configuration.GetSection("Auth").GetValue<string>("LocalServiceUrl");
            }
            else
            {
                Console.WriteLine("Setting IAmazonS3 to AWS Service");
                services.AddAWSService<IAmazonS3>();
                /*
                var options = Configuration.GetAWSOptions();
                IAmazonS3 client = options.CreateServiceClient<IAmazonS3>();                
                */
                services.AddScoped<IS3, S3Client>();
                SecurityContext.AuthType = Environment.GetEnvironmentVariable("authType");
                SecurityContext.Url = Environment.GetEnvironmentVariable("authUrl");                
            }            

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

            services.AddAuthentication("Basic")
                .AddScheme<AuthOpts, AuthHandler>("AUTHENTICATION_FAILED", null);

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

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGet("/", async context =>
                {
                    await context.Response.WriteAsync("amis service");
                });
            });
        }
    }
}
