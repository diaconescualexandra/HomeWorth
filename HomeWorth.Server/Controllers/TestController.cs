using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeWorth.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetTestData()
        {
            return Ok(new { message = "hello from .net" });
        }
    }
}
