namespace HomeWorth.Server.Models
{
  public enum NotificationType
  {
    OfferReceived,
    OfferAccepted,
    OfferDeclined,
    ContactShared,
    OfferViewed,
  }
  public class Notification
  {
    public int NotificationId { get; set; }
    public string UserId { get; set; }
    public string ?phoneNumber { get; set; }
    public NotificationType Type { get; set; }
    public string Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;
  }
}
