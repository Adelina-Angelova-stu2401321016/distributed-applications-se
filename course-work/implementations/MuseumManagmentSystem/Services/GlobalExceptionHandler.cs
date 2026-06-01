namespace MuseumManagmentSystem.Services
{
    using Microsoft.AspNetCore.Diagnostics;
    using Microsoft.AspNetCore.Mvc;
    using System.Net;
    using System.Text.Json;
    using Infrastructure.ResponseDTOs; 
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

            var statusCode = HttpStatusCode.InternalServerError;
            var message = "Server error (not my fault).";

            if (exception is KeyNotFoundException)
            {
                statusCode = HttpStatusCode.NotFound;
                message = "We didn't find it hun :,(";
            }
            else if (exception is UnauthorizedAccessException)
            {
                statusCode = HttpStatusCode.Unauthorized;
                message = "You are not authorized bruv.";
            }

            var response = new ErrorResponseDTO
            {
                StatusCode = (int)statusCode,
                Message = message,
            };

            httpContext.Response.StatusCode = (int)statusCode;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        }
    }
}
