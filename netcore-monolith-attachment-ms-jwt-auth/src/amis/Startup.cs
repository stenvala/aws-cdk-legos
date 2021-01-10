﻿using System;
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
using Amis.Utils;
using Amis.BL;

namespace Amis
{
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
                    await context.Response.WriteAsync("amis service");
                });
            });
        }
    }
}
