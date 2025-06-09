using HomeWorth.Server.Data;
using HomeWorth.Server.Interfaces;
using HomeWorth.Server.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace HomeWorth.Server.Repository
{
  public class NotificationRepository : INotificationRepository
  {
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<OfferHub> _hubContext;

    public NotificationRepository(ApplicationDbContext context, IHubContext<OfferHub> hubContext)
    {
      _context = context;
      _hubContext = hubContext;

    }
    public async Task AddNotificationAsync(Notification notification)
    {
      _context.Notifications.Add(notification);
      await _context.SaveChangesAsync();
    }

    public async Task<List<Notification>> GetUnreadNotificationsAsync(string userId)
    {
      return await _context.Notifications
          .Where(n => n.UserId == userId && !n.IsRead)
          .OrderByDescending(n => n.CreatedAt)
          .ToListAsync();
    }

    public async Task MarkAsReadAsync(int notificationId)
    {
      var notif = await _context.Notifications.FindAsync(notificationId);
      if (notif != null)
      {
        notif.IsRead = true;
        await _context.SaveChangesAsync();
      }
    }

    public async Task NotifySellerAsync(string sellerId, string message, NotificationType type)
    {
      try
      {
        // Persist notification
        var notification = new Notification
        {
          UserId = sellerId,
          Message = message,
          Type = type,
          CreatedAt = DateTime.UtcNow,
          IsRead = false
        };
        await AddNotificationAsync(notification);

        // Push notification via SignalR
        await _hubContext.Clients.User(sellerId).SendAsync("ReceiveOfferNotification", message);

        Console.WriteLine($"Notification sent to seller {sellerId}: {message}");
      } catch (Exception ex)
      {
        Console.WriteLine($"Error in NotifySellerAsync: {ex.Message}");
        throw;
      }
    }

    public async Task NotifyBuyerAsync(string buyerId, string message, NotificationType type)
    {
      try
      {
        Console.WriteLine($"Starting NotifyBuyerAsync for buyer {buyerId}");
        var notification = new Notification
        {
          UserId = buyerId,
          Message = message,
          Type = type,
          CreatedAt = DateTime.UtcNow,
          IsRead = false
        };

        await AddNotificationAsync(notification);
        Console.WriteLine($"Notification saved to database for buyer {buyerId}");

        await _hubContext.Clients.User(buyerId).SendAsync("ViewOfferNotification", message);
        Console.WriteLine($"SignalR message sent to buyer {buyerId}");
      }
      catch (Exception ex)
      {
        Console.WriteLine($"Error in NotifyBuyerAsync: {ex.Message}");
        throw;
      }
    }


    public async Task<List<Notification>> GetAllNotificationsAsync(string userId)
    {
      return await _context.Notifications
          .Where(n => n.UserId == userId)
          .OrderByDescending(n => n.CreatedAt)
          .ToListAsync();
    }
  }
}
