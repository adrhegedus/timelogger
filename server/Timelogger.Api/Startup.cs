using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;


namespace Timelogger.Api;

public partial class Startup {
	private readonly IWebHostEnvironment _environment;
	public IConfigurationRoot Configuration { get; }

	public Startup(IWebHostEnvironment env) {
		_environment = env;

		IConfigurationBuilder builder = new ConfigurationBuilder()
		                                .SetBasePath(env.ContentRootPath)
		                                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
		                                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
		                                .AddEnvironmentVariables();
		Configuration = builder.Build();
	}

	// This method gets called by the runtime. Use this method to add services to the container.
	public void ConfigureServices(IServiceCollection services) {
		// Add framework services.
		services.AddDbContext<ApiContext>(opt => opt.UseInMemoryDatabase("e-conomic interview"));
		services.AddLogging(builder => {
				builder.AddConsole();
				builder.AddDebug();
			}
		);

		services.AddMvc(options => options.EnableEndpointRouting = false);

		if ( _environment.IsDevelopment() ) {
			services.AddCors();
		}

		services.AddControllers()
		        .AddNewtonsoftJson(
			        options => options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
				);
	}

	public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
		if ( env.IsDevelopment() ) {
			app.UseCors(builder => builder
			                       .AllowAnyMethod()
			                       .AllowAnyHeader()
			                       .SetIsOriginAllowed(origin => true)
			                       .AllowCredentials()
			);
		}

		app.UseMvc();


		IServiceScopeFactory serviceScopeFactory =
			app.ApplicationServices.GetService<IServiceScopeFactory>();
		using IServiceScope scope = serviceScopeFactory.CreateScope();
		SeedDatabase(scope);
	}
}