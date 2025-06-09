using HomeWorth.Server.Models;

namespace HomeWorth.Server.Interfaces
{
  public interface INotificationRepository
  {
    Task AddNotificationAsync(Notification notification);
    Task NotifySellerAsync(string sellerId, string message, NotificationType type);
    Task<List<Notification>> GetUnreadNotificationsAsync(string userId);
    Task MarkAsReadAsync(int notificationId);
    Task<List<Notification>> GetAllNotificationsAsync(string userId);
    Task NotifyBuyerAsync(string buyerId, string message, NotificationType type);
  }
}
