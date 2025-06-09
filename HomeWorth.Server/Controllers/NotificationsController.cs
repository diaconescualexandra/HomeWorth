using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using HomeWorth.Server.Models;
using System.Threading.Tasks;
using HomeWorth.Server.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace HomeWorth.Server.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [Authorize]
  public class NotificationsController : ControllerBase
  {
    private readonly INotificationRepository _notificationRepository;

    public NotificationsController(INotificationRepository notificationRepository)
    {
      _notificationRepository = notificationRepository;
    }

    [HttpPost("notifySeller")]
    public async Task<IActionResult> NotifySellerAsync(string sellerId, string message, NotificationType type)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      try
      {
        await _notificationRepository.NotifySellerAsync(sellerId, message, type);
        return Ok(new { success = true });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, error = ex.Message });
      }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllNotifications()
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      try
      {
        // Get current user ID from JWT token
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
          return Unauthorized(new { error = "User not authenticated" });
        }

        var notifications = await _notificationRepository.GetAllNotificationsAsync(userId);
        return Ok(notifications);
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = ex.Message });
      }
    }

    [HttpGet("unread")]
    public async Task<IActionResult> GetUnreadNotifications()
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      try
      {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
          return Unauthorized(new { error = "User not authenticated" });
        }

        var notifications = await _notificationRepository.GetUnreadNotificationsAsync(userId);
        return Ok(notifications);
      }
      catch (Exception ex)
      {
        return BadRequest(new { error = ex.Message });
      }
    }

    [HttpPost("mark-read/{notificationId}")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);
      try
      {
        await _notificationRepository.MarkAsReadAsync(notificationId);
        return Ok(new { success = true });
      }
      catch (Exception ex)
      {
        return BadRequest(new { success = false, error = ex.Message });
      }
    }
  }
}
