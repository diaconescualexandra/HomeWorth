namespace HomeWorth.Server.Interfaces
{
  public interface IEmailSender
  {
    Task SendEmailAsync(string email, string subject, string htmlMessage);

  }
}
